# AI Nutritional Consultant Panel — Design Sketch

## Overview
Slide-over panel (not modal) matching `TrayDrawer` UX:
- Mobile: bottom sheet (85dvh max)
- Desktop: right drawer (420px wide, full height below header)

## ASCII Layout

### Mobile (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ← Back to page (backdrop tap)      │
├─────────────────────────────────────┤
│  ✦ Ask the nutritionist        ✕  │  ← Sticky header
│  High protein, no shellfish…        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  What are you in the mood?  │   │  ← Empty state
│  │  Tell me your goals…        │   │
│  │  [High protein] [Veg] [No🦐] │   │  ← Quick-prompt chips
│  │  [Under 600] [Spicy]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │  ← User message (right-aligned)
│  │                    High pro │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ✦  Here are 3 high-protein  │   │  ← Assistant (left, sparkle avatar)
│  │     dishes…                 │   │
│  └─────────────────────────────┘   │
│           …scroll…                │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐ ➤ │  ← Input: textarea + send
│  │ High protein, no shell…     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Desktop (Right Drawer)
```
┌──────────────────────────────────────────────────┐
│  Page content                          ┌───────┐ │
│                                        │ ✦ Ask │ │
│  [Hero] [Menu] [Room] …                │ nutritionist  │
│                                        │ ✕      │ │
│                                        ├─────────┤ │
│                                        │         │ │
│                                        │  Empty  │ │
│                                        │  state  │ │
│                                        │  or     │ │
│                                        │  Chat   │ │
│                                        │ history │ │
│                                        │         │ │
│                                        ├─────────┤ │
│                                        │ [input] ➤│ │
│                                        └─────────┘ │
└──────────────────────────────────────────────────┘
```

## Component Structure
```
src/app/components/ai-panel.tsx
  ├── State: isOpen, messages[], input, streaming, error
  ├── Backdrop (mobile only)
  ├── Panel (aside, fixed, z-50, slide animation)
  │   ├── Header: title, subtitle, close button
  │   ├── Messages: ScrollArea
  │   │   ├── EmptyState: prompt chips → prefill input
  │   │   ├── MessageBubble: role-based alignment, avatar
  │   │   └── StreamingIndicator: pulsing loader
  │   └── InputForm: textarea (auto-grow 1-4 rows), send button
  └── Streaming fetch to /api/chat (SSE)
```

## Integration Points
| Location | Change |
|----------|--------|
| `src/app/page.tsx` | Add `<AIPanel />` alongside `<TrayDrawer />` |
| `src/app/components/site-header.tsx` | Add trigger button (desktop) |
| `src/app/components/mobile-tab-bar.tsx` | Add 5th tab (FAB icon) |
| `src/app/api/chat/route.ts` | Create (port from `ai-v1` branch) |

## Trigger UI
- **Desktop**: Header button — `Sparkles` icon, "Ask" label, tooltip
- **Mobile**: 5th tab in `MobileTabBar` — `MessageSquare` + `Sparkles` badge
- **FAB alternative**: Fixed bottom-right, `Sparkles` in circle, `bg-olive`

## Streaming Protocol
```typescript
// Request
POST /api/chat
{ message: string, chatHistory: { role: "user"|"model", parts: [{text}] }[] }

// Response: text/plain chunked (SSE-like)
"Token1" "Token2" "Token3"...
```

## Guardrails (from earlier)
- Rate limit: 10 req/min per IP (middleware)
- Auth: require signed session (patron/staff/admin)
- Input validation: max 500 chars, strip injection
- DeepSeek domain allowlist in dashboard
