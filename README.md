# SG Kaki 🇸🇬

Live it. Learn it. Love it.

SG Kaki is a gamified Singapore-culture learning platform: it teaches before
it tests. Every lesson runs **Discover → Phrase Card → Example Conversation →
Guided Practice → Assessment → Recap**, so a lesson ends with "I learned
something" rather than "I answered some questions." Old vocabulary keeps
resurfacing through later lessons and Monkey Bars rather than being taught
once and forgotten.

The app is organized around four sections:

- **Journey** (the home page) — a winding mission map through Singapore,
  backed by a Marina Bay-style skyline and one Singapore landmark per
  mission category (Merlion, hawker stall, bus, Ferris wheel, HDB blocks).
  Answer scenario-based challenges (multiple choice, sort, match,
  can/cannot, pick-a-reply, read the room, culture cards) to earn XP and
  unlock the next mission. Finished a lesson? You can always replay it —
  replays never re-award XP or re-trigger unlocks.
- **Field Guide** — every phrase and culture note you've unlocked, in one
  place, with pronunciation playback, mastery tracking (★1–5), and
  "Ask SG Buddy" for contextual questions about what you're looking at.
- **Progress** — Singapore Savvy score, category breakdown, your full badge
  collection, streak calendar, and level/XP standing.
- **AI Practice** — free-form chat scenarios with an AI classmate/colleague
  that unlock progressively as you complete missions.

**Monkey Bars** is a lightweight, optional "rapid review" mode reached from
a mission's summary panel once you've completed a few of its challenges —
a horizontal bar you swing across, mixing replayed challenges with quick
phrase-recall checks.

Designed web-first for desktop/laptop, fully responsive down to mobile.

## Monorepo layout

npm workspaces, two apps:

- **`apps/web`** — the React frontend (Vite + React 19 + TypeScript +
  Tailwind CSS v4, React Router, Framer Motion, `@dnd-kit`). Ships no
  secrets; talks to the backend over `/api/...`.
- **`apps/server`** — a small Express/TypeScript backend. Holds API keys for
  third-party integrations (currently: Groq, powering both AI Practice and
  Ask SG Buddy) so they never reach the browser. See
  [`apps/server/README` notes below](#adding-a-new-integration) for how to
  add another one.

## Getting started

```bash
npm install                          # installs both workspaces from the root
cp apps/server/.env.example apps/server/.env
# edit apps/server/.env and set GROQ_API_KEY (get one at https://console.groq.com)
npm run dev                          # runs the backend (:8080) and frontend (:5183) together
```

Open the printed frontend URL. In dev, Vite proxies `/api/*` requests to the
backend (see `apps/web/vite.config.ts`), so the frontend never needs to know
the backend's address or deal with CORS locally.

Without `GROQ_API_KEY` set, everything else works normally — AI Practice and
Ask SG Buddy will just show a friendly "having trouble connecting" fallback
reply instead of a real model response (the backend returns a `503` for
those routes; nothing crashes).

## Scripts (run from repo root)

- `npm run dev` — start backend + frontend together
- `npm run dev:web` / `npm run dev:server` — start just one
- `npm run build` — build both apps for production
- `npm run test` — run the frontend's Vitest unit suite
- `npm run test:e2e` — run the Playwright golden-path test
- `npm run lint` — Oxlint (frontend)

## Environment variables

- `apps/server/.env` (never committed, never sent to the browser):
  - `PORT` — backend port, default `8080`
  - `ALLOWED_ORIGINS` — comma-separated CORS allow-list, default
    `http://localhost:5183`
  - `GROQ_API_KEY` — your Groq API key
- `apps/web/.env.local` (optional): `VITE_API_BASE_URL`, only needed if the
  frontend and backend end up deployed to different origins. Leave unset for
  local dev and same-origin deployments.
  - `VITE_UNLOCK_ALL_CONTENT=true` enables a development test mode that opens
    every mission, lesson, phrase, culture topic, and AI Practice scenario.
  - `VITE_UNLOCK_ALL_SCENARIOS=true` remains available for AI Practice only.

## Project layout

- `apps/web/src/content/` — the data-driven content model (missions,
  lessons, challenges, phrases, culture topics, badges, levels), with
  Singapore content under `content/countries/singapore/`. Each mission's
  lessons live in their own `lessons.<mission>.ts` file (mirroring the
  existing `challenges.<mission>.ts` split), aggregated in `lessons.ts`. The
  engine only imports from `content/types.ts`, so adding another country
  later is a content/config addition, not an engine change. A lesson's
  `discover` / `phraseIds` / `exampleConversation` / `guidedPractice` /
  `cultureTopicIds` / `recap` fields are all optional — undefined ones are
  skipped, so content can be deepened incrementally.
- `apps/web/src/game/` — pure, unit-tested progression logic (XP/levels,
  streaks, unlocks, badges, Singapore Savvy vs. Singapore Unlocked, phrase
  mastery, the spaced-review picker in `review.ts`, AI Practice scenario
  unlocks, and the full challenge-completion cascade in `progression.ts`).
- `apps/web/src/state/` — the `ProgressContext` (React Context + reducer)
  backed by `src/services/storage/progressStorage.ts` (`localStorage`).
- `apps/web/src/components/challenges/` — the challenge engine:
  `ChallengeShell` plus one component per challenge type, registered in
  `registry.ts`, plus the reusable `scenes/` illustration system. This layer
  is intentionally stable — new features reuse it rather than modify it
  (Monkey Bars renders challenge components straight from `registry.ts`).
- `apps/web/src/components/learning/` — the pre-assessment/teaching layer
  used by `screens/LessonScreen.tsx`: `DiscoverCarousel`, `PhraseCard`,
  `ExampleConversation`, `GuidedPractice`, `LessonRecap`, `AskSGBuddy`,
  mastery UI, and more. These are also reused by the Field Guide screen.
  `LessonScreen.tsx` derives the current step from progress state (never
  local-only), so a mid-lesson refresh resumes correctly and a fully
  completed lesson opens in a no-consequence replay instead of blocking.
- `apps/web/src/components/monkeybars/` — the rapid-review mode: a
  horizontal bar rig (`MonkeyBarsRig.tsx`) with a hanging figure that swings
  bar-to-bar, mixing a mission's already-completed challenges with
  phrase-recall checks. Never touches `completedChallengeIds` — it's replay
  only, so it can't double-award XP or re-trigger unlocks.
- `apps/web/src/components/map/` — the Journey map (winding/serpentine
  path, mission nodes, responsive layout, the skyline/landmark backdrop).
- `apps/web/src/components/shell/` — the responsive app shell: `Sidebar`
  (desktop/tablet) and `BottomNavigation` (mobile), both driven by the same
  four-item nav (Journey, Field Guide, Progress, AI Practice).
- `apps/web/src/services/aiPractice/` — the `AIPracticeService` interface.
  `groqAIPracticeService.ts` is the live implementation (calls the backend);
  `mockAIPracticeService.ts` is kept around as a network-free reference
  implementation. The UI only ever talks to the interface.
- `apps/web/src/services/sgBuddy/` — same interface/live/mock split as
  `aiPractice`, for the contextual "Ask SG Buddy" Q&A used inside lessons
  and the Field Guide.
- `apps/web/e2e/` — Playwright end-to-end spec covering the full lesson
  flow (Discover through Recap), mission completion/unlock, and Field
  Guide/Monkey Bars reachability.
- `apps/server/src/routes/` — one router file per integration
  (`aiPractice.ts`, `sgBuddy.ts`), mounted in `routes/index.ts`.
- `apps/server/src/integrations/` — thin wrappers around each third-party
  API (currently `groq.ts`, shared by both routes above). Only these files
  (and `env.ts`) ever see API keys.

## Adding a new integration

1. Add the secret to `apps/server/.env` (and document it in
   `apps/server/.env.example`) — read it via `env.ts`, not `process.env`
   directly, so every secret is discoverable in one place.
2. Add a thin client wrapper under `apps/server/src/integrations/`.
3. Add a router under `apps/server/src/routes/` and mount it in
   `routes/index.ts` — a missing/misconfigured key should make that route
   return a clear error (e.g. `503`), not crash the server or block other
   routes.
4. On the frontend, add a service under `apps/web/src/services/` that calls
   `/api/your-route` — never call the third-party API directly from the
   browser.
