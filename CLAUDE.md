# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```text
.
├── frontend/             Next.js 15 App Router + Python serverless functions (Vercel project)
│   ├── app/              Next.js pages and layouts
│   ├── components/       React components (DoubleBezel, PillCTA, etc.)
│   ├── lib/store.ts      Zustand global store
│   ├── tests/            Playwright specs
│   ├── api/
│   │   ├── handler.py    Vercel ASGI catch-all — re-exports the FastAPI app
│   │   └── _lib/         FastAPI app (private; `_` prefix keeps Vercel from
│   │                     treating files here as additional functions)
│   │       ├── main.py
│   │       ├── auth.py   Supabase JWT verification (get_current_user)
│   │       ├── routers/{generate,export}.py
│   │       ├── agents/{drafter,critic}.py
│   │       ├── schemas/brd.py
│   │       └── services/renderer.py
│   ├── api/requirements.txt  Python deps for Vercel build (fastapi, pydantic, openai, python-docx)
│   ├── package.json      Node deps
│   ├── vercel.json       framework=nextjs (Python runtime auto-detected from api/*.py)
│   └── .env.local.example
├── html/                 Static HTML prototypes (reference only)
├── Precedent-handoff/    Original Claude Design handoff bundle (read-only artifact)
└── DESIGN.md             Visual contract — see "Design system" below
```

**There is no separate `backend/` directory anymore.** The Python code lives at `frontend/api/_lib/` and is served by Vercel as a single Python serverless function via the ASGI catch-all at `frontend/api/handler.py`.

`OPENAI_API_KEY` is set on Vercel (Production, Preview, Development). For local dev, run `vercel env pull` inside `frontend/` to materialize a `.env.local` from Vercel, then `vercel dev`.

## Commands

All commands run from `frontend/`.

**Local dev (unified):**

- `vercel dev` — runs Next.js + the Python serverless function on a single port. `/api/*` calls route to the FastAPI app. This is the primary local workflow.
- `vercel env pull` — pulls env vars from Vercel into `.env.local` (do once before `vercel dev`).

**Frontend-only iteration (faster, no Python):**

- `npm run dev` — Next.js dev server, port 3000. `/api/*` calls will 404 unless you point `NEXT_PUBLIC_API_URL` at a separate backend (see `.env.local.example`).
- `npm run build` / `npm start` — production build/serve.
- `npm run lint` — `next lint`.

**Tests:**

- `npm test` — Playwright full suite. The config spins up its own `next dev -p 3001`, so do **not** start a frontend server manually before running tests; it would race on the port.
- `npm run test:ui` — Playwright UI mode.
- `npx playwright test tests/review.spec.ts` — single spec file.
- `npx playwright test -g "submits intake form"` — single test by name.

**Deploy:**

- `vercel deploy` — preview deploy.
- `vercel deploy --prod` — promote to production.

## Architecture

Precedent is a **two-agent BRD generator**: a structured project brief becomes a 12-section Business Requirements Document. The end-to-end flow:

```text
Intake (/intake) ── BriefInput ──> POST /api/generate
                                       │ asyncio.gather over 12 sections
                                       │ drafter.draft_section() per section
                                       ▼
                                   BRD dict (content only, feedback=[])
Review (/review)  ◄────────────────────┘
        │
        ├── POST /api/critique         ── runs critic.critique_section() on all 12 in parallel
        ├── POST /api/regenerate-section ── re-drafts a single section, optional user prompt
        └── POST /api/apply-critique   ── rewrites a section to address a specific feedback item

Export (/export) ── POST /api/export ──> StreamingResponse(.docx) via services/renderer.py
```

### How requests reach Python on Vercel

`frontend/api/handler.py` is the Vercel ASGI entrypoint — any URL matching `/api/*` is sent to this file. Inside, it pushes its own directory onto `sys.path` and re-exports the FastAPI `app` from `_lib.main`. Vercel detects the `app` symbol as an ASGI application and proxies the request. FastAPI sees the original `/api/generate` path (Vercel does not rewrite under filesystem catch-all routing), so the routes mounted with `prefix="/api"` in `_lib/routers/*.py` match directly.

The `_lib/` directory is named with a leading underscore so Vercel does **not** treat its `.py` files as additional serverless function routes — it's just a private Python package the catch-all imports from.

**API auth:** all requests to protected routes are verified via Supabase JWT (`_lib/auth.py::get_current_user`; HS256, `SUPABASE_JWT_SECRET`). The old `NEXT_PUBLIC_API_SECRET_KEY` shared-secret scheme is retired. `/generate` also calls the `consume_quota` Postgres RPC to enforce per-user generation limits (Registered tier = 3 lifetime; Subscribed tier = unlimited).

Function timeout: Vercel Hobby with Fluid Compute gives 300s by default (no explicit `maxDuration` in `vercel.json`). 12-way parallel OpenAI fan-out typically completes in 15–30s wallclock.

### The 12-section contract (load-bearing)

`frontend/api/_lib/agents/drafter.py::SECTION_SCHEMAS` is the **single source of truth** for section structure. It defines a strict OpenAI JSON schema per section. Adding/changing a section requires synchronized edits across:

1. `SECTION_SCHEMAS` — the schema itself.
2. The `sections` list in `frontend/api/_lib/routers/generate.py::generate_brd` — order matters; the frontend renders sections in this order.
3. `frontend/api/_lib/schemas/brd.py` — Pydantic models.
4. `frontend/api/_lib/services/renderer.py` — Word rendering + `_ID_PREFIXES` table.
5. `frontend/lib/store.ts::BRD` interface.
6. Frontend review page section list and any per-section render code.

### Drafter/Critic agents

Both `_lib/agents/drafter.py` and `_lib/agents/critic.py`:

- Use a lazily-initialized `AsyncOpenAI` client (`get_client()`) reading `OPENAI_API_KEY`.
- Call `gpt-4.1-mini` with `response_format={"type": "json_schema", strict: True}`. Do not change the model casually — the schemas use OpenAI strict-mode constraints (`additionalProperties: False`, all properties required), which only some models support.
- Drafter: `temperature=0.4`, `max_tokens=1536`.
- Critic: `temperature=0.3`, `max_tokens=1024`. Critic feedback items have `severity ∈ {low, medium, high}`, an `issue`, and a `suggestion`.

### ID convention (cross-cutting)

Sections with array items use prefixes that the renderer auto-generates and the critic is prompt-instructed to use:

| section | prefix |
| --- | --- |
| functional_requirements | FR |
| non_functional_requirements | NFR |
| acceptance_criteria | AC |
| user_access_management | UAM |
| security_controls | SC |
| benefits_realization | BR |

IDs are zero-padded two digits (`FR-01`). The `_normalize_id` / `_display_id` helpers in `frontend/api/_lib/services/renderer.py` mirror the frontend's `getDisplayId / normalizeId`. Keep them in sync — the critic prompt depends on these IDs being stable so feedback can be tied back to specific items in the UI.

### Frontend

- **Next.js 15 App Router**, React 19 GA, TypeScript. Strict dark mode (`<html className="dark">` in `app/layout.tsx`); a no-flash theme script runs before hydration.
- **Zustand store** (`lib/store.ts`) holds `brief`, `brd`, `hasCritique`, `visitedSections`. Single global store, no persistence — full state is lost on page reload (intentional for the demo flow).
- Pages: `/` launcher → `/intake` form → `/review` workspace → `/export`.
- `components/primitives.tsx` exposes the **DoubleBezel**, **PillCTA**, **GlassNav**, **FieldLabel**, etc. Reuse these rather than re-styling — they encode the design system.
- API base: `process.env.NEXT_PUBLIC_API_URL ?? ""`. On Vercel the empty default makes fetches relative (same-origin → the Python function on the same domain). For `npm run dev` against a separate backend, override via `.env.local`.
- Fonts: Geist / Geist Mono, loaded from Google Fonts in `layout.tsx`. Do not substitute Inter/Roboto/Arial (explicit anti-pattern in `DESIGN.md`).
- Tailwind config exposes semantic color tokens (`ink`, `ground`, `surface`, `secondary`, etc.) bound to CSS variables in `app/globals.css` so both dark and light modes work off the same class names.

## Design system

`DESIGN.md` is the **visual contract** and overrides any default styling instincts. Required reading before any UI work. Key non-negotiables:

- Deep dark base `#050505`, surfaces `#0A0A0A`–`#111111`, primary accent emerald `#10B981` used at ≤10% surface area.
- Every major container is a **double-bezel card**: outer `bg-white/5 ring-1 ring-white/10 p-1.5 rounded-card` shell wrapping an inner `bg-surface bezel-inner-shadow rounded-card-inner` core. Implemented in `<DoubleBezel>`.
- Primary CTAs are pill-shaped emerald buttons with a **nested-icon trailing affordance** (icon sits inside its own circle). Implemented in `<PillCTA>`.
- Severity badges: rose / amber / zinc tints for high / medium / low. Pill-shaped, `text-[11px]`.
- Anti-patterns to refuse: purple/blue glows, generic AI gradients, harsh drop shadows, white backgrounds, sharp 90° corners on major containers, Inter/Roboto/Arial type.

## Static HTML prototypes

`html/*.html` and the `Precedent-handoff/` bundle are the original Claude Design exports. They are **reference visuals**, not the implementation — the live app is the Next.js code in `frontend/`. Match the visual output when porting, not the prototype's DOM structure.
