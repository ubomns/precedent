# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
.
├── backend/            FastAPI + OpenAI (Python 3.14, .venv ignored)
├── frontend/           Next.js 15 App Router (TypeScript, React 19 RC)
├── html/               Static HTML prototypes (reference only)
├── Precedent-handoff/  Original Claude Design handoff bundle (read-only artifact)
└── DESIGN.md           Visual contract — see "Design system" below
```

Set `backend/.env` from `backend/.env.example` with a real `OPENAI_API_KEY` before running the backend. Both are gitignored / sanitized respectively — never commit the real key.

## Commands

**Backend** (`cd backend`):
- `python run_server.py` — runs uvicorn on `0.0.0.0:8001` with `app.main:app` (no reload).
- `uvicorn app.main:app --reload --port 8001` — dev mode with reload.
- `pip install -r requirements.txt` — install deps into the `.venv`.

**Frontend** (`cd frontend`):
- `npm run dev` — Next.js dev server on port 3000.
- `npm run build` / `npm start` — production build/serve.
- `npm run lint` — `next lint`.
- `npm test` — Playwright full suite. The config spins up its own `next dev -p 3001`, so do **not** start the frontend manually before running tests; it would race on the port. Tests live in `frontend/tests/*.spec.ts`.
- `npm run test:ui` — Playwright UI mode.
- `npx playwright test tests/review.spec.ts` — single spec file.
- `npx playwright test -g "submits intake form"` — single test by name.

The frontend expects the backend at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8001`).

## Architecture

Precedent is a **two-agent BRD generator**: a structured project brief becomes a 12-section Business Requirements Document. The end-to-end flow:

```
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

### The 12-section contract (load-bearing)

`backend/app/agents/drafter.py::SECTION_SCHEMAS` is the **single source of truth** for section structure. It defines a strict OpenAI JSON schema per section. Adding/changing a section requires synchronized edits across:

1. `SECTION_SCHEMAS` (backend) — the schema itself.
2. The `sections` list in `backend/app/routers/generate.py::generate_brd` — order matters; the frontend renders sections in this order.
3. `backend/app/schemas/brd.py` — Pydantic models.
4. `backend/app/services/renderer.py` — Word rendering + `_ID_PREFIXES` table.
5. `frontend/lib/store.ts::BRD` interface.
6. Frontend review page section list and any per-section render code.

### Drafter/Critic agents

Both `agents/drafter.py` and `agents/critic.py`:
- Use a lazily-initialized `AsyncOpenAI` client (`get_client()`) reading `OPENAI_API_KEY`.
- Call `gpt-4.1-mini` with `response_format={"type": "json_schema", strict: True}`. Do not change the model casually — the schemas use OpenAI strict-mode constraints (`additionalProperties: False`, all properties required), which only some models support.
- Drafter: `temperature=0.4`, `max_tokens=1536`.
- Critic: `temperature=0.3`, `max_tokens=1024`. Critic feedback items have `severity ∈ {low, medium, high}`, an `issue`, and a `suggestion`.

### ID convention (cross-cutting)

Sections with array items use prefixes that the renderer auto-generates and the critic is prompt-instructed to use:

| section | prefix |
|---|---|
| functional_requirements | FR |
| non_functional_requirements | NFR |
| acceptance_criteria | AC |
| user_access_management | UAM |
| security_controls | SC |
| benefits_realization | BR |

IDs are zero-padded two digits (`FR-01`). The `_normalize_id` / `_display_id` helpers in `backend/app/services/renderer.py` mirror the frontend's `getDisplayId / normalizeId`. Keep them in sync — the critic prompt depends on these IDs being stable so feedback can be tied back to specific items in the UI.

### Frontend

- **Next.js 15 App Router**, React 19 RC, TypeScript. Strict dark mode (`<html className="dark">` in `app/layout.tsx`); a no-flash theme script runs before hydration.
- **Zustand store** (`lib/store.ts`) holds `brief`, `brd`, `hasCritique`, `visitedSections`. Single global store, no persistence — full state is lost on page reload (intentional for the demo flow).
- Pages: `/` launcher → `/intake` form → `/review` workspace → `/export`.
- `components/primitives.tsx` exposes the **DoubleBezel**, **PillCTA**, **GlassNav**, **FieldLabel**, etc. Reuse these rather than re-styling — they encode the design system.
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
