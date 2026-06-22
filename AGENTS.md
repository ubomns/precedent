# AGENTS.md — Precedent

> Compact guidance for OpenCode sessions working in this repo.

## Behavioral Guidelines

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**Define success criteria. Loop until verified.**

- Transform tasks into verifiable goals: "Write tests for invalid inputs, then make them pass" instead of "add validation."
- For multi-step tasks, state a brief plan with per-step verification.
- Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## What This Is

Precedent is a two-agent AI tool that turns a structured project brief into a 12-section Business Requirements Document, then runs an inline critic and exports the result to Word.

- **Target buyer**: Business Analysts in **regulated/enterprise environments** — banking, insurance, healthcare, public sector, enterprise IT. Keep copy and UX aimed at that buyer, not at a builder/evaluator.
- **Live routes**: `/` landing page → `/intake` brief form → `/review` 12-section workspace → `/export` download confirmation.
- **Brand voice**: calm, credible, instrument-grade, expensive quiet. Deep dark mode, emerald accent, no generic AI gradients or purple/blue glows.

The landing page was rebuilt against the brand strategy playbook and now includes hero/problem/how-it-works/sections/sample-output/validation/CTA content. See the playbook map below for what is implemented vs. still open.

---

## Brand Strategy Playbook → Current State

The playbook identifies the landing page as the biggest conversion gap. Implementation status:

|Playbook recommendation|Status|Notes|
|---|---|---|
|Hero with regulated-environment angle|Implemented|`/` hero leads with "validated with practising BAs in regulated environments"|
|Problem section|Implemented|`components/landing/problem.tsx`|
|How It Works (3 steps)|Implemented|`components/landing/how-it-works.tsx`|
|The 12 sections|Implemented|`components/landing/sections-list.tsx`|
|Sample output + downloadable BRD|Implemented|`/public/sample-brd.docx` + `sample-output.tsx`|
|Who It's For|Implemented|`components/landing/who-its-for.tsx`|
|Validation quote|Implemented|`components/landing/validation.tsx`|
|CTA footer|Implemented|`components/landing/cta-footer.tsx`|
|Lead with "regulated environments"|Implemented|Hero and Who It's For both anchor on this|
|Team/enterprise pricing copy|Not implemented|Open product decision; playbook suggests: "Team and enterprise pricing available — contact `hello@nsikak.dev`"|

Treat remaining playbook items (team pricing, distribution channels) as product decisions, not code tasks, unless the user scopes them.

---

## Layout

Everything that deploys lives under `frontend/`. There is no separate `backend/` directory.

```text
frontend/
├── app/                    Next.js 15 App Router (pages, layouts, globals.css)
├── components/
│   ├── design-system/      Current canonical components: Button, Card, Nav, Input, Badge, Typography
│   ├── landing/            8 marketing-page sections (hero, problem, how-it-works, ...)
│   ├── motion/             GSAP provider, scroll reveal, page transition wrappers
│   ├── three/              WebGL hero scene (Three.js)
│   ├── primitives.tsx      Legacy DoubleBezel / PillCTA / etc. still used in intake/review/export
│   ├── icons.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── store.ts            Zustand global store (brief + brd + critique state)
│   └── api.ts              API client; sends NEXT_PUBLIC_API_SECRET_KEY as Bearer token
├── tests/                  Playwright specs (home, intake, review, export)
├── public/
│   └── sample-brd.docx     Downloadable sample BRD referenced by the landing page
├── api/
│   ├── handler.py          Vercel Python entry point (ASGI)
│   ├── requirements.txt    Python deps for Vercel build
│   └── _lib/               FastAPI app (underscore prefix hides it from Vercel routing)
│       ├── main.py         FastAPI app + CORS + auth + rate-limit middleware
│       ├── limiter.py      slowapi rate-limit config
│       ├── routers/        generate.py, export.py (mounted at prefix="/api")
│       ├── agents/         drafter.py, critic.py
│       ├── schemas/brd.py  Pydantic models
│       └── services/       renderer.py (.docx export)
├── package.json            Node scripts and deps
├── vercel.json             framework=nextjs + explicit /api/* -> handler rewrite
├── next.config.js          CSP/security headers + bundle analyzer (ANALYZE=true)
├── tailwind.config.js      Semantic tokens (ink, ground, surface, accent, etc.)
└── playwright.config.ts
```

**Important:** `README.md` and `CLAUDE.md` both reference `api/[...path].py` as the catch-all — the actual file is **`api/handler.py`**. `vercel.json` explicitly rewrites `/api/(.*)` to `/api/handler`. Do not create `[...path].py`; edit `handler.py` if you need to change the ASGI entry point.

---

## Commands (all from `frontend/`)

**Unified local dev (Next.js + Python serverless on one port):**

```bash
vercel env pull        # one-time: syncs OPENAI_API_KEY + API_SECRET_KEY into .env.local
vercel dev             # serves frontend + /api/* on localhost:3000
```

**Frontend-only (faster, no Python):**

```bash
npm run dev            # Next.js on port 3000
```

> In frontend-only mode, `/api/*` calls 401 unless you set `NEXT_PUBLIC_API_SECRET_KEY` to match a locally running backend.

**Tests:**

```bash
npm test               # Playwright full suite (headless)
npm run test:ui        # interactive UI mode
npx playwright test tests/review.spec.ts          # single file
npx playwright test -g "submits intake form"        # single test by name
npm run test:report    # open last HTML report
```

> Playwright config self-hosts `next dev -p 3001`. **Do not start a dev server manually** before running tests — it will race on the port.

**Lint / analyze:**

```bash
npm run lint           # next lint only; no separate typecheck script
npm run lint:md        # markdownlint on root *.md using ../.markdownlint.json
ANALYZE=true npm run build   # bundle analyzer
```

**Deploy:**

```bash
vercel deploy          # preview
vercel deploy --prod   # production
```

---

## Environment & Secrets

Required secrets (all live on Vercel; never commit them):

- `OPENAI_API_KEY` — used by the Python drafter/critic agents.
- `API_SECRET_KEY` — the backend checks this on every `/api/*` request.
- `NEXT_PUBLIC_API_SECRET_KEY` — the frontend sends this as `Authorization: Bearer <key>`.

In production/preview these are the same value. Local workflow: `vercel env pull` creates `.env.local` inside `frontend/`. `.env.local.example` is the only tracked env file; all `.env*` files are gitignored.

---

## Python Dependencies

`api/requirements.txt` drives the Vercel Python build. Notable entries:

- `python-dotenv` — was previously missing and caused cold-start 500s. Do not remove it.
- `slowapi` — rate limiting; configured in `api/_lib/limiter.py`.

The API standardizes errors to `{ error: { code, message } }`, enforces a 2 MB max body size, and requires a valid `Authorization: Bearer <API_SECRET_KEY>` header on all `/api/*` routes.

---

## The 12-Section Contract (Load-Bearing)

`api/_lib/agents/drafter.py::SECTION_SCHEMAS` is the single source of truth for BRD structure. Each section has a strict OpenAI JSON schema (`additionalProperties: false`, all required). Adding or renaming a section requires synchronized edits across:

1. `SECTION_SCHEMAS` (drafter.py)
2. `sections` list in `api/_lib/routers/generate.py` (order matters)
3. `api/_lib/schemas/brd.py` (Pydantic models)
4. `api/_lib/services/renderer.py` (Word rendering + `_ID_PREFIXES`)
5. `frontend/lib/store.ts::BRD` interface
6. Frontend review page section list and any per-section render code

---

## ID Convention (Cross-Cutting)

Array-item sections use zero-padded two-digit IDs (`FR-01`, `NFR-03`, `AC-02`, etc.):

|Section|Prefix|
|---|---|
|functional_requirements|FR|
|non_functional_requirements|NFR|
|acceptance_criteria|AC|
|user_access_management|UAM|
|security_controls|SC|
|benefits_realization|BR|

Keep `renderer.py::_normalize_id` / `_display_id` in sync with any frontend `normalizeId` helpers. The critic prompt depends on stable IDs so feedback can be tied to specific UI rows.

---

## Agent Model & Parameters

- Drafter: `gpt-4.1-mini`, `temperature=0.4`, `max_tokens=1536`, `response_format={type: "json_schema", strict: true}`
- Critic: `gpt-4.1-mini`, `temperature=0.3`, `max_tokens=1024`, same strict JSON schema mode

> Do not swap models casually — strict-mode JSON schemas with `additionalProperties: false` require explicit model support.

---

## Vercel Runtime

- `vercel.json` pins `maxDuration: 300` on the Python handler. 12-way OpenAI fan-out typically completes in 15–30s, but the headroom is load-bearing.
- `next.config.js` sets `images.unoptimized: true` and adds CSP + security headers. Do not change `images.unoptimized` without a reason.

---

## Design System

Two component layers coexist:

- **Current canonical layer**: `components/design-system/` — `Button`, `Card`, `Nav`, `Input`, `Badge`, `Typography`. Use these for new UI work.
- **Legacy layer**: `components/primitives.tsx` — `DoubleBezel`, `PillCTA`, etc. Still used in the intake/review/export app pages.

System values:

- Base `#050505`, surfaces `#0A0A0A`–`#111111`, emerald `#10B981` ≤10% surface area.
- Fonts: Geist + Geist Mono only. Never Inter/Roboto/Arial.
- Strict dark mode (`<html className="dark">`); a no-flash theme script runs before hydration.
- Tailwind tokens: `ink`, `ground`, `surface`, `surface-2`, `secondary`, `accent`, `border`, etc.

The full visual contract is in `DESIGN.md` — read it before any UI work.

---

## State & Persistence

- Zustand store (`lib/store.ts`) is intentionally ephemeral — full state is lost on page reload.
- API base: `process.env.NEXT_PUBLIC_API_URL ?? ""`. Empty default makes fetches relative/same-origin on Vercel.

---

## OpenCode Multi-Agent Setup

- `.opencode/` contains an 11-agent v5 dev-team bundle: `.opencode/README.md` is the entry point, `.opencode/agents/*.md` define the agents, and `.opencode/skills/` provides shared skills.
- **Model strings are currently inconsistent.** `opencode.json` sets `opencode-go/kimi-k2.5`, `engineering-lead.md` sets `opencode-go/kimi-k2.7`, and `frontend-dev.md` sets `opencode-go/kimi-k2.6`. Align every `model:` field (and the README table) to one provider before running the multi-agent pipeline.

---

## Reference Artifacts (Read-Only)

- `html/` — static HTML prototypes (visual reference, not the implementation).
- `Precedent-handoff/` — original Claude Design bundle (historical reference).
- `Precedence-brand-strategy-playbook-1.docx` — brand strategy and conversion playbook (product positioning context).
- The live app is the Next.js code in `frontend/`.
