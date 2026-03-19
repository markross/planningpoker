# Planning Poker App — Implementation Plan

## Context

The team needs a lightweight planning poker tool for sprint planning. No existing tool is in place; this is a greenfield project at `/Volumes/Sensitive/scrumpoker/`. The app should be simple, real-time, and require zero authentication — users just enter a display name and start estimating. Supabase provides the backend (database, realtime, anonymous auth).

---

## Key Decisions

- **Shareable URLs**: Sessions joinable via direct link (`/session/ABC123`). Link auto-prompts for display name if not set.
- **Estimate cards**: 1, 2, 3, 5, 8, 13, 21, **?** (unsure/needs discussion)
- **Supabase setup**: Guided from scratch (included in Stage 1)

## Tech Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Realtime + Anonymous Auth)
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Vercel

---

## Stage 1: Project Setup ✅

**Goal**: Scaffolded, buildable, testable project with all tooling configured.

**What gets built**:
- Vite + React + TypeScript scaffold
- TailwindCSS v4 via `@tailwindcss/vite`
- Supabase JS client installed and configured
- Vitest + React Testing Library test harness
- ESLint + Prettier
- Git repo initialised
- Environment variable structure (`.env.example`, `.env.local` gitignored)

**Supabase project setup** (guided):
1. Go to https://supabase.com → "Start your project" → sign up / sign in
2. Create new project (free tier), pick region closest to team
3. Once created, go to **Project Settings → API** → copy `Project URL` and `anon/public` key
4. Go to **Authentication → Providers** → enable **Anonymous Sign-ins** (toggle on)
5. Go to **Authentication → Rate Limits** → note default anonymous sign-up limit (30/hr) — sufficient for small team
6. Paste URL and key into `.env.local`

**Key files**:
```
package.json, vite.config.ts, tsconfig.json
src/main.tsx, src/App.tsx, src/app.css
src/lib/supabase.ts          — client singleton (validates env vars at init)
src/test/setup.ts            — vitest global setup (jsdom, testing-library)
.env.example                 — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
.gitignore
```

**Acceptance criteria**:
- `npm run dev` serves at localhost with Tailwind working
- `npm run build` succeeds with zero TS errors
- `npm run test` runs a placeholder test
- `.env.local` is gitignored
- Supabase project created with anonymous auth enabled

**Dependencies**: None (first stage)

---

## Stage 2: Supabase Backend ✅

**Goal**: Database schema, RLS policies, anonymous auth, repository layer, generated types.

**What gets built**:

### Tables (SQL migrations)
1. **`poker_sessions`** — `id` (uuid PK), `session_code` (text unique), `is_revealed` (bool default false), `created_by` (uuid), `created_at` (timestamptz)
2. **`poker_players`** — `id` (uuid PK), `session_id` (FK → sessions, cascade), `user_id` (uuid), `display_name` (text), `created_at`. Unique on `(session_id, user_id)`
3. **`poker_votes`** — `id` (uuid PK), `session_id` (FK → sessions, cascade), `player_id` (FK → players, cascade), `estimate` (text nullable — stores "1","2",..."21","?"), `updated_at`. Unique on `(session_id, player_id)`

### RLS policies
- Anonymous users get `authenticated` role via `supabase.auth.signInAnonymously()`
- Sessions: any authenticated user can create (own `created_by`), read, and update (reveal/clear)
- Players: can insert self, read all in session, delete self
- Votes: can insert/update own, read all, delete all (for clear)
- **Vote value hiding is application-layer** — the DB allows reading estimates, but the frontend only displays values when `is_revealed = true`. This is acceptable for a collaboration tool with no adversarial incentive.

### Repository layer
- `sessionRepository.ts` — create, findByCode, updateRevealed
- `playerRepository.ts` — create, findBySession, remove
- `voteRepository.ts` — upsert, findBySession, deleteBySession

### Utilities
- `sessionCode.ts` — generate 6-char alphanumeric codes (excludes ambiguous 0/O/1/I/L)
- `database.types.ts` — generated via `supabase gen types typescript`

**Key files**:
```
supabase/migrations/   — 4 migration files (sessions, players, votes, RLS)
src/types/database.types.ts
src/types/session.ts, player.ts, vote.ts   — domain types
src/repositories/sessionRepository.ts, playerRepository.ts, voteRepository.ts
src/lib/sessionCode.ts
```

**Acceptance criteria**:
- Migrations apply cleanly
- Types generate from schema
- Repository tests pass (mocked Supabase client)
- Session code produces valid 6-char strings

**Dependencies**: Stage 1

---

## Stage 3: Core UI Components ✅

**Goal**: All visual components and pages, routing, anonymous auth flow, local state.

**What gets built**:

### Pages
- **HomePage** — name entry + create session / join by code
- **SessionPage** — game room (player list, card deck, controls)
- **NotFoundPage** — 404

### Components (all < 50 lines each)
- `ui/` — Button, Input, Card, Badge
- `home/` — NameEntry, CreateSessionForm, JoinSessionForm
- `session/` — CardDeck, EstimateCard, PlayerList, PlayerItem, SessionHeader, RevealButton, ClearButton, VoteResults
- `layout/` — AppLayout

### State & Auth
- `AuthContext` — anonymous sign-in on mount, provides `userId`
- `SessionContext` — current session data
- `useLocalStorage` — persist display name across refreshes
- `constants/estimates.ts` — `ESTIMATES = [1, 2, 3, 5, 8, 13, 21, '?'] as const`

### Routing
```
/                        → HomePage
/session/:sessionCode    → SessionPage (prompts for name if not set in localStorage)
*                        → NotFoundPage
```

### Shareable URL flow
When a user opens a shared link (`/session/ABC123`):
1. Check localStorage for display name
2. If no name → show inline name prompt (modal or inline form on SessionPage)
3. After name entered → join session automatically
4. Session header shows a "Copy link" button for sharing with teammates

**Key files**:
```
src/pages/HomePage.tsx, SessionPage.tsx, NotFoundPage.tsx
src/components/ui/*.tsx
src/components/home/*.tsx
src/components/session/*.tsx
src/contexts/AuthContext.tsx, SessionContext.tsx
src/hooks/useAuth.ts, useSession.ts, useLocalStorage.ts
src/constants/estimates.ts
```

**Acceptance criteria**:
- Home page renders name input, create button, join input
- Card deck renders 8 cards (1, 2, 3, 5, 8, 13, 21, ?)
- Clicking a card highlights it
- Anonymous auth fires on mount
- Display name persists in localStorage
- All components have unit tests

**Dependencies**: Stages 1, 2

---

## Stage 4: Realtime Integration ✅

**Goal**: Live updates across all connected clients via Supabase Realtime.

**What gets built** — hybrid approach on a single channel per session:

1. **Presence** — track who is online; auto-join on mount, auto-leave on unmount
2. **Postgres Changes** — subscribe to `poker_votes` INSERT/UPDATE filtered by `session_id`
3. **Broadcast** — `reveal` and `clear` game events (fast, no DB round-trip)

### Hooks
- `useSessionRealtime(params)` — unified hook: create/subscribe/cleanup channel, registers all listeners before subscribing
- Legacy hooks deleted: useRealtimeChannel, usePresence, useVoteChanges, useBroadcast, useConnectionStatus

### Channel lifecycle
1. SessionPage mounts → create channel
2. On `SUBSCRIBED` → track presence, start listeners
3. On unmount → untrack, unsubscribe

**Key files**:
```
src/hooks/useSessionRealtime.ts
src/lib/realtimeEvents.ts, channelName.ts
```

**Acceptance criteria**:
- Two browsers: both players appear in presence
- Closing one removes from presence within seconds
- Vote in browser A shows "voted" indicator in browser B
- Reveal in A shows all estimates in both
- Clear resets all votes in both
- Channel cleans up on unmount

**Dependencies**: Stages 1, 2, 3

---

## Stage 5: Game Logic ✅

**Goal**: Full game flow wired end-to-end.

**What gets built**:

### Services
- `sessionService` — createSession, joinSession, loadSession
- `voteService` — submitVote, loadVotes, revealVotes, clearVotes

### Orchestrator hook
- `useGameState(sessionCode)` — composes auth, session, presence, votes, broadcast into one API:
  ```ts
  { session, players, myVote, votes, isRevealed, gamePhase,
    selectEstimate, reveal, clear, error, isLoading }
  ```

### Game phases (src/types/gamePhase.ts)
- `LOBBY` → no votes yet
- `VOTING` → votes in progress, hidden
- `REVEALED` → all visible

### Vote statistics (pure functions in `lib/voteStats.ts`)
- `calculateAverage`, `calculateSpread` (min/max), `hasConsensus`
- `?` votes excluded from numeric calculations but shown as "unsure" count

### Edge cases
- Double vote → upsert handles
- Late joiner → sees current state from DB
- Reveal with no votes → "No votes submitted" message
- Session not found → redirect to home with error

**Key files**:
```
src/services/sessionService.ts, voteService.ts
src/hooks/useGameState.ts
src/types/gamePhase.ts
src/lib/voteStats.ts
```

**Acceptance criteria**:
- Create session → get shareable URL
- Join by code → appear in player list
- Select card → vote persisted, visible to self, hidden from others
- Reveal → all estimates shown with stats
- Clear → fresh round
- Late joiners see correct state

**Dependencies**: Stages 2, 3, 4

---

## Stage 6: Testing ✅

**Goal**: 80%+ coverage, integration tests, E2E tests.

**What gets built**:

### Test infrastructure
- `test/factories/` — sessionFactory, playerFactory, voteFactory
- `test/mocks/` — supabaseMock, channelMock
- `test/helpers/renderWithProviders.tsx`

### Integration tests
- Create + join session flow
- Full voting round
- Reveal and clear cycle

### E2E tests (Playwright)
- Create session flow
- Join session flow
- Two-player voting round
- Reveal and clear

### Coverage: 92.72% (target 80%)

**Key files**:
```
src/test/factories/*.ts, mocks/*.ts, helpers/*.tsx
src/__tests__/*.test.ts
e2e/tests/*.spec.ts, e2e/playwright.config.ts
```

**Dependencies**: Stages 1–5

---

## Stage 7: Polish & Deploy ✅

**Goal**: Production-ready, deployed to Vercel, accessible.

### 7a. Dead code cleanup ✅

Deleted unused hooks replaced by `useSessionRealtime.ts`:
- `src/hooks/usePresence.ts`
- `src/hooks/useVoteChanges.ts`
- `src/hooks/useBroadcast.ts`
- `src/hooks/useConnectionStatus.ts`
- `src/hooks/useRealtimeChannel.ts`

### 7b. Accessibility pass ✅

- `CopyLinkButton` — `aria-label="Copy session link"`
- `ErrorBoundary` error display — `role="alert"` + `aria-live="assertive"`
- `SessionHeader` — wrapped in `<header>` landmark
- `VoteResults` stats — `aria-label` on stat values

### 7c. Responsive edge cases ✅

- `VoteResults`: `grid-cols-1 sm:grid-cols-3` (was grid-cols-3)
- `SessionHeader`: `flex-col sm:flex-row` for small screens

### 7d. Vercel deployment ✅

**Backend**: Supabase cloud (free tier)
- Cloud project created with anonymous sign-ins enabled
- Migrations pushed via `supabase link` + `supabase db push`
- Additional migration added: `GRANT` table permissions to `authenticated` role (cloud doesn't auto-grant like local dev)
- Additional migration added: `GRANT SELECT` to `anon` role for Realtime

**Frontend**: Vercel (free tier)
- GitHub repo: `markross/planningpoker` (public)
- Connected to Vercel via `npx vercel` + GitHub integration
- Env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Deployment protection disabled for public access
- Live at: https://scrumpoker-rho.vercel.app

**Gotchas encountered**:
- Vercel Hobby blocks deploys without a git user linked to the account — commit email must match GitHub account
- Piping env vars via `echo | vercel env add` can introduce trailing newlines — use `--value` flag instead
- Cloud Supabase requires explicit `GRANT` on tables (local dev auto-grants)

### Acceptance criteria
- ✅ Dead code removed, build passes
- ✅ ARIA improvements applied
- ✅ Usable at 320px width
- ✅ Deployed to Vercel, full flow works end-to-end
- ✅ Supabase cloud project with migrations applied

**Dependencies**: Stages 1–6

---

## Stage 8: Session Cleanup Cron ✅

**Goal**: Automatically delete abandoned sessions daily via pg_cron.

**What gets built**:

### SQL migration (`20260318000003_session_cleanup_cron.sql`)
- Enables `pg_cron` extension
- `delete_expired_sessions()` function — deletes sessions where:
  - Last vote `updated_at` is older than 24 hours, OR
  - Session has zero votes and `created_at` is older than 24 hours
- Cron job scheduled at `0 0 * * *` (midnight UTC daily)
- Child rows (`poker_players`, `poker_votes`) cleaned up via existing `ON DELETE CASCADE` FKs

### Verification
- `select * from cron.job;` — confirm job is scheduled
- `select delete_expired_sessions();` — test manually
- `select * from cron.job_run_details order by start_time desc limit 5;` — check run history

**Dependencies**: Stage 2 (schema)

---

## Stage Dependency Graph

```
1 → 2 → 3 → 4 → 5 → 6 → 7
         ↘ 8 (session cleanup cron)
```

TDD runs throughout — each stage writes tests for its own code. Stage 6 adds the comprehensive coverage pass and E2E.

---

## Verification Plan

1. **Local**: `npm run dev` — manually test full flow in two browser windows
2. **Unit/Integration**: `npm run test:coverage` — verify 80%+ ✅ (92.72%)
3. **E2E**: `npx playwright test` — automated two-browser voting flow
4. **Deployed**: Hit Vercel URL, create session, join from second device, complete voting round
