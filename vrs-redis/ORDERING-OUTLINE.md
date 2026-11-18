# Live Table Ordering on Redis — Implementation Outline

## 1. The mapping

| QuizDock | NVRS |
|---|---|
| Lobby (6-digit PIN) | Table session (short code / QR on the table) |
| Host console | Server / bartender console (staff-authenticated) |
| Player phone | Patron phone |
| Quiz | Menu (your existing `/menu/with-ingredients` snapshot) |
| Question opens → answers close | Order round opens → cart locks |
| Answer (timed, once) | Cart submission (idempotent, once) |
| Reveal / standings | Order accepted → kitchen ticket → served |
| Big screen | Optional expo screen / kitchen display |

The core idea: **Redis holds the hot, shared session state; MySQL stays the durable record.** Staff drive a state machine; patrons react to events. Nothing about a cart lives in MySQL until it is placed.

## 2. Redis data model

```
sess:{code}:state     hash   status, tableId, round, version, deadline, openedBy
sess:{code}:feed      stream events (XADD MAXLEN ~1000)      <- replay + fan-out
sess:{code}:carts     hash   patronId -> draft cart JSON
sess:{code}:presence  zset   patronId -> heartbeat ms
sess:{code}:round     hash   round -> {openedAt, closesAt, submitted[]}
idem:{clientOrderId}  string SETNX EX 3600                   <- exactly-once
menu:snapshot         string cached /menu/with-ingredients, TTL 300s
staff:online          set
```

Give every `sess:*` key a TTL (e.g. 6h) refreshed on activity so abandoned tables evaporate. Use `version` on the state hash for optimistic concurrency — staff actions carry the version they saw.

## 3. Transport

Use **SSE + POST commands**, not WebSockets, for v1:

- `GET /api/sessions/:code/events` — `text/event-stream`, replays from `Last-Event-ID` via `XRANGE`, then tails.
- `POST /api/sessions/:code/cart`, `/submit`, `/staff/advance` — normal JSON.

SSE survives Cloudflare and Cloud Run, auto-reconnects in the browser, and needs no sticky sessions because every instance can read the same stream. Send a heartbeat comment every 15s and set `X-Accel-Buffering: no` to defeat proxy buffering. Move to WS only if you later need sub-100ms bidirectional traffic.

Reconnection: signed session token (httpOnly cookie) → patron rejoins at current `state`, rehydrates their draft cart from `carts`, and replays missed events. This is the single biggest UX win over polling.

## 4. Order lifecycle

```
DRAFT → PLACED → ACCEPTED → PREPARING → READY → SERVED → PAID → CLOSED
```

- Patron edits only in `DRAFT`; server stamps `placedAt` on submit.
- One submission per round per patron (SETNX on `idem:`); staff can reopen a round.
- Provide an "always open" mode for casual ordering, and a round-based mode for the quiz feel.
- Only staff advance `ACCEPTED` onward; patron may cancel before acceptance.
- On `PLACED`: one MySQL transaction (`orders` + `order_items`, unique `client_order_id`), then `XADD` the event. Redis is the live projection; MySQL is the truth.

If Redis restarts, rebuild active sessions from MySQL (orders + menu) — keep a `last_event_seq` per order so replay stays monotonic. Enable AOF if you want session state to survive restarts.

## 5. What your API already has vs. needs

Reuse: `/menu/with-ingredients` (snapshot), `/api/auth/login` (add `role` for staff), `/api/create-payment-intent` and `/api/webhook` (pay at close), `/api/notify-service` (becomes a `call_server` session event).

Gaps — all additive, no breaking changes:
- No `orders` CRUD (only `/import/orders`), no `tables`, no `staff`, no `sessions`.
- New router `src/routes/sessionRoutes.ts` + `sessionService.ts`; add `redis` client and a `src/config/redis.ts`.
- Add `role` to the patron/staff model; protect staff routes with a JWT middleware.

## 6. Frontend (Next.js)

Add routes: `/t/[code]` (patron), `/staff/[code]` (console), `/kitchen` (ticket board), optional `/screen/[code]`. One shared `useSession(code)` hook: fetch snapshot → open `EventSource` → reduce events → optimistic cart with server reconciliation. Proxy through Next route handlers so the browser never talks to Express cross-origin and you can attach the auth cookie. Print a QR per table encoding `/t/{code}`.

## 7. Rollout

1. **Week 1** — Redis, session create/join, SSE, presence, menu snapshot.
2. **Weeks 2–3** — cart/round submit, kitchen board, order persistence, staff console.
3. **Week 4** — Stripe pay-at-close, receipts, reconnect polish.
4. **Weeks 5–6** — load test (target: 50 tables × 8 patrons), outbox for event durability, metrics, multi-instance check.
5. **Later** — the LLM consultant emits a `suggestion` event so recommendations appear in-session, and can prefill a cart.

## 8. Pitfalls

- Cloudflare idle timeout (100s) and Cloud Run request limits: heartbeat, and cap stream lifetime at ~30 min with client re-open.
- Don't write drafts to MySQL on every keystroke; Redis only.
- Trim the stream (`MAXLEN ~1000`) or memory grows per table.
- Kitchen display must be idempotent on replay — key tickets by order id, not event id.
- Treat Redis as ephemeral by default; never let a lost key lose a paid order.
