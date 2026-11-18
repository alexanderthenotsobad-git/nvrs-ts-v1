# NVRS v2 — Master Technical Specification

**Status:** Draft for review · **Date:** 2026-11-11 · **Owner:** Alexander Gomez
**Scope:** Live table ordering, payments, storefront modernization, identity.

\---

## 0\. Baseline: what I verified, and what I'm assuming

I inspected the live OpenAPI document (28 paths), the public repo tree and several source files, the deployed Next.js app, and probed the live API. Everything below marked **(verified)** was observed directly; everything else is an assumption to confirm.

|Observed|Detail|
|-|-|
|API host|Apache/2.4.52 (Ubuntu) reverse-proxying Express (`X-Powered-By: Express`) **(verified)**|
|CORS|`Access-Control-Allow-Origin: \*` on every response **(verified)**|
|`/api/patrons`|Returns `200` with 5 patrons, fields `patron\_id`, `patron\_name`, `email` — **no authentication** **(verified)**|
|`POST /api/auth/login`|Bad credentials → `401 {"error":"Invalid credentials"}`; **no token in any response shape** **(verified)**|
|Orders|Only `/import/orders` exists. Line shape: `{item\_id, quantity, price\_at\_time}`. **No order create/read/update route** **(verified)**|
|Repo vs deploy|Repo has `paymentController.ts.ignore` (excluded from build); no patron, auth, or payment routes. **Deployed API is ahead of the repo** **(verified)**|
|Repo OpenAPI|`docs/openapi.json` lists 12 stale paths (`/menu-items`, `/beverages`, `/orders`) vs 28 live **(verified)**|
|Frontend|Next.js App Router, Tailwind, shadcn-style primitives, lucide icons. **One route: `/`** **(verified)**|
|Frontend nav|Links to `/menu`, which returns **404** on direct load **(verified)**|
|Frontend mount|Served at `/app` on the main domain; assets are root-relative (`/\_next/...`) — basePath hazard **(verified)**|
|Images|WebP, 34 KB, `ETag` but **no `Cache-Control`** **(verified)**|
|Repo hygiene|No tests (`"test": "echo ..."`), no migration tool, no CI config, no Redis client **(verified)**|

**Assumed, needs confirmation:** MySQL 8.x; orders table exists with header + lines; patron passwords may be stored hashed but the algorithm is unconfirmed; production runs a single VM (no horizontal scaling yet); Redis is not installed anywhere today; no POS integration planned for v2.

\---

## 1\. Corrections to the brief

Four corrections, because each one changes how the work should be sequenced.

**1.1 Redis is not a module — it's a substrate.** The feature is a *live table session with a server-authoritative order state machine*. Redis is how that state is stored and fanned out. If we spec "the Redis module", we under-specify the state machine, the failure semantics, and the reconnect contract — which is where every real bug will live. Spec the state machine; Redis is an implementation choice inside it.

**1.2 "Stripe module (or modal)" conflates server truth with a UI surface.** The modal is roughly 5% of the work. The other 95% is: pricing on the server, idempotent order creation, webhook reconciliation, refunds/voids, tips, and the order↔payment state machine. Also — the deployed payment code is `.gitignore`d out of your repo. It cannot be safely extended until it's recovered into version control. That is a blocking prerequisite, not a nicety.

**1.3 The frontend needs information architecture, not a reskin.** It is a one-route demo whose own nav link 404s. "Modern" is not a hover effect; it's completed routes, a design system, real navigation, and performance budgets. The hover-popout is one component inside that. Budget it as such, or it ships as lipstick on a 404.

**1.4 "Robust login" for diners is the wrong goal.** Most diners should never create an account — forced signup before ordering is the single largest conversion killer in restaurant apps. Diners should receive a **signed table-session token at QR scan** and order as a guest. "Robust" belongs to *staff* auth (Argon2id, refresh-token rotation, RBAC, MFA) and to closing the `/api/patrons` PII leak, which is a live incident, not a roadmap item.

**1.5 Two modules you didn't list, and need:** a **catalog \& media pipeline** (your images have no cache headers and no responsive variants — the hover feature will amplify that), and **kitchen operations** (a ticket board is where orders actually fail). Both are folded in below as supporting modules.

\---

## 2\. Target architecture

```
 Patron phone                Staff tablet              Kitchen display
 /t/{code}                   /staff/{code}             /kitchen
      |                           |                        |
      +-------- Next.js (RSC) ----+------------------------+
                        |
                 HTTPS (cookie auth)
                        |
      +-----------------v------------------+
      |  Express API  (Apache reverse proxy)|
      |  auth | menu | sessions | orders   |
      |  payments | kitchen | admin         |
      +----+------------+-------------+----+
           |            |             |
        MySQL 8      Redis 7       Stripe API
      (truth)     (live state,    (payment truth)
                   fan-out,
                   rate limits,
                   menu cache)
```

**Data ownership — the one rule that prevents most bugs:** MySQL is the system of record for menu, orders, payments, staff, and audit. Redis holds *derived, ephemeral* state and is always rebuildable. Stripe is the system of record for money movement; the webhook is what reconciles it. Nothing financial is ever decided from a Redis key alone.

\---

# Part I — Live Ordering Core

## I.1 Analysis

Four transports were considered:

|Option|Verdict|
|-|-|
|Polling every 2–3 s|Simplest, but 30 tables × 8 phones = 240 req/3s, and the cart-race UX is poor. Rejected as primary; keep as automatic fallback.|
|WebSockets|Best latency, but needs sticky sessions or a Redis adapter, plus proxy config on Apache, plus a reconnect story. Overkill for v2.|
|**SSE + POST commands**|**Chosen.** One-way server→client is exactly the shape of "orders change state", it reconnects natively with `Last-Event-ID`, and every instance can serve it by reading the same Redis Stream.|
|Postgres `LISTEN/NOTIFY`|Ties you to one connection per listener and no replay. Rejected.|

The critical design decision is **replay**. Pub/sub is fire-and-forget: a phone that drops for 4 seconds silently misses "your order was accepted." A Redis **Stream** per session (`XADD` / `XRANGE`) gives every reconnect a cursor and gives the kitchen board a rebuild path. Use pub/sub only as an optional low-latency hint; the Stream is the contract.

Second decision: **time and money are server-authoritative.** Clients never compute totals, never decide that an order is placed, and never drive the clock. This mirrors what makes QuizDock's model work (server sets start and deadline, stamps every answer on arrival) — and it's the same reason you don't trust a phone's clock.

## I.2 Redis key model

```
sess:{code}:state      HASH    status, tableId, round, version, openedBy, closesAt
sess:{code}:feed       STREAM  events, MAXLEN \~1000
sess:{code}:carts      HASH    guestId -> draft tray JSON (TTL 6h, refreshed)
sess:{code}:presence   ZSET    guestId -> heartbeat epoch ms
sess:{code}:round      HASH    round -> {openedAt, closesAt, submitted:\[]}
sess:{code}:ticket     STRING  daily ticket counter (INCR)
idem:{key}             STRING  SET NX EX 86400
menu:snapshot:v{n}     STRING  cached /menu/with-ingredients, TTL 300s
ratelimit:{scope}:{id} STRING  INCR + EXPIRE
staff:online           SET     staffId
```

Rules: every `sess:\*` key carries a TTL (6 h, refreshed on activity) so abandoned tables evaporate without a janitor. `state.version` is incremented on every mutation and staff commands must echo the version they observed — this makes double-taps and two servers racing on one table harmless.

## I.3 Event envelope

```json
{
  "id": "1731000000000-0",
  "seq": 42,
  "type": "order.accepted",
  "sessionId": "sess\_8f2c",
  "at": "2026-11-11T21:04:11.208Z",
  "actor": {"kind": "staff", "id": "17"},
  "data": { "orderId": 9012, "ticketNo": 14, "etaMinutes": 12 }
}
```

Event types: `session.opened|closed|locked`, `patron.joined|left`, `round.opened|locked`, `tray.updated` (staff-only, throttled to 1/s), `order.placed|accepted|preparing|ready|served|cancelled|voided`, `payment.requested|succeeded|failed`, `service.called`, `menu.86`, `staff.note`.

`seq` is a per-session monotonic counter (`INCR`) so clients can detect gaps even if Redis trims the stream.

## I.4 State machine

```
TRAY ──submit──> PLACED ──accept──> ACCEPTED ──start──> PREPARING
                    │                   │                  │
                    │                   └──cancel──> CANCELLED
                    └──reject──> REJECTED                 └──ready──> READY
                                                                        │
                                                    SERVED <──serve─────┘
                                                       │
                                             PAID <────┴──> VOIDED
```

|Transition|Actor|Guard|
|-|-|-|
|`TRAY → PLACED`|Patron|session OPEN, tray non-empty, all items available, idempotency key unused|
|`PLACED → ACCEPTED/REJECTED`|Server, Bartender|order age < 10 min|
|`ACCEPTED → PREPARING`|Kitchen|—|
|`PREPARING → READY`|Kitchen|—|
|`READY → SERVED`|Server, Bartender|—|
|`SERVED → PAID`|Payment module|payment\_intent.succeeded, or staff marks cash|
|any → `VOIDED`|Manager only|reason required, written to `audit\_log`|

Patrons may cancel only in `PLACED`. Everything else is staff. Every transition writes `audit\_log` in the same MySQL transaction.

## I.5 Endpoints

|Method|Path|Auth|Purpose|
|-|-|-|-|
|POST|`/api/v2/sessions`|staff|Open a table session|
|POST|`/api/v2/sessions/{code}/join`|none|Guest joins; returns signed guest token + snapshot|
|GET|`/api/v2/sessions/{code}/events`|guest or staff|SSE stream; `Last-Event-ID` honored|
|GET|`/api/v2/sessions/{code}`|guest or staff|Snapshot for hydration|
|PUT|`/api/v2/sessions/{code}/tray`|guest|Upsert draft tray (versioned)|
|POST|`/api/v2/sessions/{code}/orders`|guest|Submit tray; `Idempotency-Key` required|
|POST|`/api/v2/orders/{id}/transition`|staff|`{to, version, reason?}`|
|POST|`/api/v2/sessions/{code}/call-server`|guest|Replaces `/api/notify-service`|
|POST|`/api/v2/sessions/{code}/close`|staff|Lock, settle, archive|

## I.6 Failure semantics

* **SSE drops** → browser auto-reconnects with `Last-Event-ID`; server replays from `XRANGE`; client dedupes on `seq`.
* **Redis restarts** → sessions rebuild from MySQL (`orders` + `table\_sessions` rows still `OPEN`); `seq` is reseeded from `MAX(seq)` in `session\_events`. Because the stream is a projection, nothing is lost that matters.
* **Two staff act at once** → version check returns `409`; UI refetches.
* **Order write succeeds, event publish fails** → outbox row in the same transaction; a 1-second relay drains it. Never publish inside the MySQL transaction.
* **Redis unavailable** → ordering degrades to POST-only with polling fallback; the API stays up. Fail open on presence, fail closed on money.

## I.7 Acceptance criteria

* 30 tables × 8 guests, all ordering within 30 s → p95 event delivery < 150 ms, zero lost order events after forced client reconnect.
* Kill Redis mid-session → staff can still see orders (from MySQL) within 5 s; no duplicate tickets on recovery.
* Duplicate submit (double-tap) → exactly one order row, one ticket, one charge.

\---

# Part II — Payments

## II.1 Analysis

**Integration surface.** Three options: hosted Checkout (redirect), Payment Element (embedded), or raw Card Element. Choose **Payment Element** inside your modal. It keeps you in SAQ A scope (card data never touches your servers), supports wallets (Apple/Google Pay), and handles SCA/3DS without custom code. Hosted Checkout would force a redirect off the table session — wrong UX for a QR-scanned phone.

**The part everyone gets wrong.** The client-side `confirmPayment` callback is a *UI hint*, never proof of payment. The only truth is the `payment\_intent.succeeded` webhook. Your current Express app mounts `express.json()` globally — Stripe signature verification needs the **raw body**, so the webhook route must be mounted before the JSON parser or it will fail signature checks (or worse, be bypassed).

**Pricing.** Totals must be recomputed server-side from `order\_items` + tax rules. The client sends *item ids and quantities*, never prices. `price\_at\_time` already exists in your import schema — keep it; it's the correct pattern for a changing menu.

**Your gap:** `POST /api/create-payment-intent` accepts a *cart* and creates a PI. That's the wrong unit. A PaymentIntent must be bound to a persisted **order**, so the webhook has something to reconcile against. Rebuild it around orders rather than patching it.

## II.2 Spec

**Flow (pay-after-meal, recommended default):**

```
Tray → POST /orders (server prices, PLACED)
        → order + payment row (status=requires\_payment)
Patron taps "Pay" → POST /orders/{id}/payment-intent
        → Stripe PI (amount from DB, metadata {order\_id, session\_id})
        → client\_secret to modal → Payment Element mounts
confirmPayment → requires\_action? → 3DS → succeeded
Stripe → POST /api/v2/webhooks/stripe (raw body, signature verified)
        → stripe\_events row (dedupe on event.id)
        → PI.succeeded: payment=paid, order=PAID, outbox event → SSE
```

**Also support pay-first** (counter/QSR mode) as a session setting: `payment\_mode: 'prepay' | 'postpay'`. Prepay gates `PLACED` on a successful intent. Same machine, one guard.

**Tables:** `payments(payment\_id, order\_id, stripe\_pi\_id UNIQUE, amount, currency, status, method, tip\_amount, captured\_at, refunded\_amount)`, `stripe\_events(event\_id PK, type, payload JSON, processed\_at)`.

**Rules:**

* One PI per order in v2; `amount\_remaining` column exists so split-tender is additive later.
* Tips: presets 18/20/25/custom, applied by *updating the PI amount before confirm*; tip stored separately from subtotal for payroll export.
* Refunds: manager-only, partial allowed, `refunded\_amount` accumulated; void ≠ refund (void before capture, refund after).
* Offline/cash: staff can mark `method='cash'` and close; still writes `payments` + audit.
* Idempotency: `Idempotency-Key` header on order create and PI create; store request hash + response for 24 h; replay returns the original response.
* 3DS: on `requires\_action`, hand the client secret back to the Element; never treat as failure.
* Never log `client\_secret`, card tokens, or full PI payloads.

## II.3 Acceptance criteria

* Webhook replayed 5× → one payment row, one state transition.
* Card declined → order stays `PLACED`, patron sees an inline retry, staff sees nothing spurious.
* Modal abandoned → PI `requires\_payment` expires (24 h), order auto-voids with audit entry.
* Wrong signature → `400`, no side effects, alert logged.

\---

# Part III — Storefront \& UI Modernization

## III.1 Analysis

The current build is better positioned than it looks: Next.js App Router, Tailwind, shadcn-style primitives, and lucide are all already in place. This is **not** a rewrite — it's completing an IA that stopped at one route.

Three real problems, in priority order:

1. **Routing/basePath.** The app is mounted at `/app` but emits root-relative assets and links (`/menu`). Any new route (`/t/{code}`, `/staff`) will break the same way unless `basePath` is set or the proxy rewrites consistently. Decide this before writing routes.
2. **No cache policy on media.** Images return `ETag` and no `Cache-Control`, so every hover re-validates over the network. A hover-popout feature on top of that is a latency demo, not a delight.
3. **The "modern" ask is really three asks** — navigation (a real hamburger/sheet), product presentation (image peek, cards), and perceived performance (skeletons, transitions, optimistic cart).

On the image popout specifically: hover-only is an accessibility and mobile failure. It must be an *enhancement* — enabled only under `@media (hover: hover) and (pointer: fine)`, with focus and tap equivalents. And it must not cause layout shift or duplicate screen-reader content.

## III.2 Spec

**Routes:** `/` (landing) · `/menu` · `/menu/\[id]` · `/t/\[code]` (guest table) · `/staff` + `/staff/\[code]` · `/kitchen` · `/account` · `/staff/login`.

**Design system:** CSS custom properties for color, radius, elevation, and motion; a type scale; light/dark via `class` strategy (dark mode currently only follows `prefers-color-scheme`). Ship a `<Sheet>`, `<Dialog>`, `<Drawer>`, `<Skeleton>`, `<Toast>` set on top of the existing primitives.

**`<ImagePeek>` component** — the hover feature, specified:

* Trigger is the existing card link; no extra wrapper element.
* Intent delay 120 ms on `pointerenter`, cancel on `pointerleave`.
* Renders in a **portal**, `position: fixed`, sized `min(420px, 40vw)`, flipped at viewport edges via a small collision function.
* `next/image` with `sizes` and a preloaded `src`; fade+scale 120 ms, `prefers-reduced-motion` → opacity only.
* `aria-hidden="true"` (it duplicates the card's content) — do not create a second tab stop.
* Keyboard: `:focus-visible` on the card opens the same peek; `Esc` closes.
* Touch: no peek; tapping navigates to `/menu/\[id]` where the image is full-bleed.
* Hidden entirely below `md`, and never rendered when `navigator.connection.saveData`.

**Navigation:** sticky, translucent header with backdrop blur; on `<md`, a full-height sheet (focus trap, scroll lock, `Esc`, restored focus on close). "Tray" is a slide-over with a count badge, not a separate page — keep the word *Tray*, it's better branding than *Cart*; use `cart` in code only.

**Media pipeline:** move menu images behind a CDN (Cloudflare Images or S3 + CloudFront) with `Cache-Control: public, max-age=31536000, immutable` and content-hashed keys; generate 320/640/960 WebP variants; store a 24 px LQIP in MySQL for blur-up. Target: LCP < 2.0 s on 4G, CLS < 0.05, no image > 120 KB at 640 px.

**Cart state:** server components for the menu (cacheable), a small client store for the tray, persisted to `localStorage` keyed by session code so a refresh or a dropped signal doesn't lose the order; reconciled against the server snapshot on reconnect.

**Accessibility:** WCAG 2.2 AA — 44 px targets, visible focus, 4.5:1 contrast, `aria-live="polite"` on tray count and order status, reduced-motion honored, no color-only status.

## III.3 Acceptance criteria

* Lighthouse mobile ≥ 90 performance / 100 accessibility on `/menu`.
* `/t/{code}` deep link survives refresh and cold start.
* Peek never overlaps the header, never causes CLS, and is fully keyboard-operable.
* No horizontal scroll at 320 px.

\---

# Part IV — Identity \& Access

## IV.1 Analysis

Three audiences, three different contracts — treating them as one "login" is where these systems go wrong:

|Audience|Should they have a password?|Contract|
|-|-|-|
|Diner|Almost never|Guest token bound to a table session, issued at QR scan, 4 h, no signup|
|Staff|Yes|Email + password, short-lived access token, rotating refresh token, role|
|Admin/Manager|Yes + MFA|Same, with elevated permissions and mandatory TOTP|

**Current state:** login returns no token at all — meaning authorization downstream is either absent or cookie/session-based in a way not visible from outside. `/api/patrons` returning names and emails to an unauthenticated caller confirms the API currently has **no effective authorization layer**. That is the first thing to fix, ahead of any feature.

**What "robust" means concretely:** Argon2id hashing (not MD5/SHA/bcrypt-4), refresh-token rotation with reuse detection, generic error messages, rate limiting and lockout, CSRF protection if cookies are used, and audit logging of every privileged action. Optional but high-value: passkeys for staff — a 2-second Face ID login on a shared tablet beats typing a password mid-service.

## IV.2 Spec

**Tokens.** Access JWT, 15 min, HS256 with a rotating secret, claims: `sub`, `kind` (`guest|staff`), `role`, `sid` (session id for guests), `jti`. Refresh token: opaque 256-bit, stored **hashed** (SHA-256) in `refresh\_tokens`, 12 h sliding for staff, rotated on every use, `family\_id` for reuse detection → revoke the whole family on replay.

**Delivery.** Prefer a BFF: the browser holds only an `HttpOnly`, `Secure`, `SameSite=Lax` cookie set by the Next.js route handler; the Next server attaches the bearer to Express. This keeps tokens out of `localStorage` and removes CORS from the security boundary entirely (and lets you drop `Access-Control-Allow-Origin: \*`).

**Guests.** `POST /sessions/{code}/join {displayName}` → sets `nvrs\_guest` cookie scoped to `/t/{code}`, 4 h, renewed on activity. No email, no password, no PII. Optional account creation *after* the meal ("save your order history") — never before.

**RBAC matrix:**

|Permission|Server|Bartender|Kitchen|Manager|Admin|
|-|-|-|-|-|-|
|View live orders|✓|✓|✓|✓|✓|
|Accept / advance|✓|✓|✓|✓|✓|
|Void order|—|—|—|✓|✓|
|Refund|—|—|—|✓|—|
|Edit menu / prices|—|—|—|✓|✓|
|View patron PII|—|—|—|✓|✓|
|Manage staff, roles|—|—|—|—|✓|
|View audit log|—|—|—|✓|✓|

**Hardening checklist:** Argon2id `m=64MB, t=3, p=1`; constant-time verify; 5 failures / 15 min → exponential lockout; rate limit 10 login attempts/min/IP; generic `Invalid credentials` (already correct); password reset via single-use hashed token, 15 min; email verification for staff; session list + "revoke all devices"; TOTP for admin; `audit\_log` on login, role change, refund, void, menu price change.

**Fix list (do first):** require `staff:read` on `/api/patrons`, return only `patron\_id` + name unless `manager`; paginate; add `role` to the patron/staff model; move `paymentController` back into the repo.

## IV.3 Acceptance criteria

* Unauthenticated `GET /api/patrons` → `401`. Non-manager → `403` without email fields.
* Stolen refresh token used twice → family revoked, both parties logged out.
* Staff token cannot call admin routes even with a valid signature.
* Login response time constant within 50 ms between unknown-user and wrong-password.

\---

# Part V — Unification

## V.1 Module dependency graph

```
            ┌──────────────┐
            │  Auth (IV)   │  identity for every actor
            └──────┬───────┘
                   ▼
   ┌───────────┐  ┌───────────┐  ┌────────────┐
   │ Catalog \& │─▶│ Sessions  │─▶│  Orders \&  │
   │  Media    │  │  (Redis)  │  │  Kitchen   │
   └───────────┘  └─────┬─────┘  └─────┬──────┘
                        │              ▼
                        │        ┌───────────┐
                        └───────▶│ Payments  │
                                 └───────────┘
                        UI (III) consumes all four
```

Build order is forced: **Auth → Catalog/Media → Sessions → Orders/Kitchen → Payments → UI polish.** Payments cannot be built before orders exist; orders cannot be authorized before auth exists. The tempting order (UI first, because it's visible) is the one that produces three rewrites.

## V.2 MySQL additions (abbreviated)

```sql
staff\_users(staff\_id PK, email UNIQUE, display\_name, password\_hash,
            role ENUM('server','bartender','kitchen','manager','admin'),
            status, mfa\_secret, failed\_logins, locked\_until, last\_login\_at)

refresh\_tokens(token\_id PK, staff\_id FK, family\_id, token\_hash UNIQUE,
               expires\_at, revoked\_at, replaced\_by, ip, user\_agent)

restaurant\_tables(table\_id PK, label, zone, seats, qr\_secret, active)

table\_sessions(session\_id PK, table\_id FK, code UNIQUE, status,
               payment\_mode ENUM('prepay','postpay') DEFAULT 'postpay',
               opened\_by FK staff\_users, opened\_at, closed\_at, guest\_count)

session\_participants(id PK, session\_id FK, guest\_id CHAR(36),
                     display\_name, joined\_at, left\_at)

orders(order\_id PK, session\_id FK, guest\_id, ticket\_no, status,
       subtotal, tax, tip, total, currency, payment\_mode,
       placed\_at, accepted\_at, ready\_at, served\_at, closed\_at)

order\_items(order\_item\_id PK, order\_id FK, item\_id FK, quantity,
            unit\_price, price\_at\_time, notes, modifiers JSON)

payments(payment\_id PK, order\_id FK, stripe\_pi\_id UNIQUE, amount,
         tip\_amount, currency, status, method, refunded\_amount,
         captured\_at, created\_at)

session\_events(session\_id, seq, type, payload JSON, created\_at,
               PRIMARY KEY(session\_id, seq))       -- replay source of truth

outbox(id PK, aggregate, event\_type, payload, published\_at, attempts)

audit\_log(id PK, actor\_kind, actor\_id, action, entity, entity\_id,
          before JSON, after JSON, ip, created\_at)

idempotency\_keys(key\_hash PK, scope, request\_hash, response JSON, created\_at)
```

Existing tables (`menu\_items`, `ingredients`, `menu\_item\_ingredients`, `nutrition`, `beverages`) are unchanged; add `available` (86 flag) and `image\_variants JSON` to `menu\_items`.

**Migrations:** introduce a real migration tool (Knex, Prisma, or plain numbered SQL with a `schema\_migrations` table) *before* the first ALTER. Right now there is no way to reproduce the production schema from the repo — that alone will cost you a weekend eventually.

## V.3 Consolidated API surface

|Area|Endpoints|
|-|-|
|Auth|`POST /api/v2/auth/login`, `/refresh`, `/logout`, `/password-reset`, `/mfa/verify`; `GET /api/v2/auth/me`|
|Sessions|`POST /sessions`, `POST /sessions/{code}/join`, `GET /sessions/{code}`, `GET /sessions/{code}/events` (SSE), `POST /sessions/{code}/close`|
|Tray|`PUT /sessions/{code}/tray`, `DELETE /sessions/{code}/tray/{lineId}`|
|Orders|`POST /sessions/{code}/orders`, `GET /orders/{id}`, `POST /orders/{id}/transition`, `GET /sessions/{code}/orders`|
|Payments|`POST /orders/{id}/payment-intent`, `POST /orders/{id}/pay-cash`, `POST /orders/{id}/refund`, `POST /webhooks/stripe` (raw body)|
|Menu|existing routes + `PATCH /menu/{id}/availability`, `GET /menu/{id}/variants`|
|Staff|`GET /staff`, `POST /staff`, `PATCH /staff/{id}/role`, `POST /staff/{id}/revoke-sessions`|
|Audit|`GET /audit?entity=\&from=\&to=` (manager+)|

Versioning: new semantics live under `/api/v2`; existing `/menu` and `/ingredients` remain for the LLM consultant until it's migrated.

## V.4 Cross-cutting

* **Config/secrets:** `.env` is currently read from disk on the VM. Move to a secret store or at minimum restrict permissions and rotate the Stripe key after the repo is reconciled.
* **Observability:** structured JSON logs with `session\_id`/`order\_id`/`request\_id`; metrics on order funnel (placed→accepted→ready→paid), SSE connections, Redis latency, webhook failures; alert on webhook 4xx.
* **Testing:** target the state machine first — property-based tests on transitions, contract tests on the webhook handler, one Playwright happy path (scan → order → pay). The current repo has zero tests; that is the highest-leverage fix after auth.
* **CI:** lint, typecheck, test, build on PR; a staging environment with a Stripe test key. You currently deploy straight from `main` with no gate.
* **Security baseline:** lock CORS to your origins, add `helmet`, request size limits, SQL-injection review of the dynamic update builders (menu update builds SQL from `req.body` — verify it's parameterized), and an authorization middleware applied by default rather than per-route.

## V.5 Delivery plan

|Phase|Weeks|Deliverable|
|-|-|-|
|0 — Reconcile|1|Payment/auth code back in repo, migrations baseline, CI, PII leak closed, image cache headers|
|1 — Auth|2|Staff accounts, RBAC, guest tokens, login UI|
|2 — Session core|2–3|Redis state, SSE, patron/staff shells, presence|
|3 — Orders|2|Tray, submit, kitchen board, ticket lifecycle|
|4 — Payments|2|Payment Element modal, webhook, refunds, tips|
|5 — Storefront|2|Routes, design system, ImagePeek, hamburger/tray, a11y|
|6 — Harden|1–2|Load test, observability, chaos (kill Redis mid-service)|

≈ 10–12 weeks solo. Phases 2 and 5 can overlap modestly once the route/basePath decision is made.

## V.6 Risk register

|Risk|Impact|Mitigation|
|-|-|-|
|Redis becomes a single point of failure|Outage during service|TTL'd ephemeral state, MySQL rebuild, polling fallback|
|Webhook missed/delayed|Order stuck unpaid|Reconciliation job every 5 min for `requires\_payment` older than 15 min|
|basePath misconfiguration|Every new route 404s|Decide before Phase 2; smoke test deep links in CI|
|Scope creep into POS/kiosk/loyalty|Slips past 12 weeks|Park in v3 backlog; v2 is table ordering only|
|PCI drift|Compliance exposure|Payment Element only; no card data in logs or DB|
|Apache buffering SSE|"Real-time" arrives in bursts|`X-Accel-Buffering: no`, heartbeat, verify through the proxy early|

## V.7 Open questions

1. Hosting target for v2 — stay on the Apache VM, or move the API to Cloud Run to match the frontend?
2. Where does Redis live — self-hosted on the VM, Memorystore, or Upstash? (Latency and HA differences are significant.)
3. Peak concurrency target — how many tables and covers at once?
4. Pay before or after the meal — or per-venue configurable?
5. Tax: flat rate, or jurisdiction-based? Tips: expected in v2?
6. Is POS integration in scope within 12 months? (It changes the order model — external IDs, item mapping.)
7. Who maintains the menu — the "admin dashboard" on your roadmap, or still SQL?
8. Do you need printed kitchen tickets (ESC/POS) or is a screen enough?

## V.8 Things you didn't ask for but will want

* **Kitchen Display System** with ticket aging (green → amber → red at 8/15 min) and a bump bar. This is where service actually breaks, and it's cheaper than you think once orders exist.
* **86-ing** — mark items unavailable in Redis so the menu updates live and patrons can't order what the kitchen can't make.
* **Kitchen load throttling** — staff pause ordering when the board backs up; a one-line guard that saves a bad Friday night.
* **Table transfer / merge / split checks** — the three requests every server makes in week one.
* **Modifiers and notes** at line level (`no onions`, `allergy: shellfish`) — your ingredient data already supports allergen warnings; surface them at add-to-tray time, not after the fact.
* **Allergen guardrails in the LLM consultant** — filter before the model speaks, not after.
* **Order-ahead / reorder** for regulars, once guest tokens exist.
* **Analytics** — items per cover, dwell time, abandonment at the tray step.
* **Passkeys** for staff login (high value, low cost given the tablet context).

\---

## Appendix — What changes from today, in one table

|Today|After v2|
|-|-|
|One frontend route, broken nav|Eight routes, real navigation, design system|
|No authorization on the API|JWT + RBAC on every route, guest tokens|
|Patron PII public|Scoped, role-gated, audited|
|Orders only via import|Full lifecycle with state machine|
|Payment intent on a client cart|PaymentIntent bound to a persisted order, webhook-reconciled|
|No realtime|SSE + Redis Streams with replay|
|No tests, no CI, no migrations|State-machine tests, PR gate, versioned schema|
|Images uncached|CDN + variants + immutability|



