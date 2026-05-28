# Precedent

A two-agent AI tool for Business Analysts in regulated/enterprise environments. Precedent turns a structured project brief into a 12-section Business Requirements Document, with an inline critic that flags gaps, ambiguities, and weaknesses against enterprise standards — then exports the final document to Word.

The interface is deliberately calm and instrument-grade: deep dark mode, double-bezel cards, emerald accent. The full visual contract lives in [`DESIGN.md`](./DESIGN.md).

---

## What it does

1. **Intake** — Analyst enters a structured brief: project objective, stakeholders, in/out scope, target users, regulatory context.
2. **Drafter agent** — 12 BRD sections are drafted in parallel by `gpt-4.1-mini` using strict JSON schemas (one schema per section). No free-form text, no markdown — only structured fields the UI can render.
3. **Critic agent** — On demand, a second agent reviews every section against enterprise standards and emits feedback items with `low / medium / high` severity, each one tied back to the specific item (`FR-01`, `NFR-03`, `AC-02`, etc.) by ID.
4. **Refine** — Analyst can regenerate individual sections (optionally with custom instructions) or apply individual critic suggestions one at a time.
5. **Export** — Final document streams out as a styled `.docx` via `python-docx`.

### The 12 sections

Executive Summary · Business Objective · Scope · Stakeholders · Functional Requirements · Non-Functional Requirements · Assumptions · Constraints · Acceptance Criteria · User Access Management · Security Controls · Benefits Realization

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.14, FastAPI, AsyncOpenAI (`gpt-4.1-mini` with `response_format: json_schema, strict: true`), python-docx, uvicorn |
| Frontend | Next.js 15 App Router, React 19 RC, TypeScript, Tailwind CSS, Zustand, Framer Motion, Phosphor Icons |
| Fonts | Geist + Geist Mono |
| Tests | Playwright (Chromium) |

---

## Getting started

### Prerequisites

- Python 3.11+ (project was developed on 3.14)
- Node.js 20+
- An OpenAI API key with access to `gpt-4.1-mini`

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux
# then edit .env and paste your real OPENAI_API_KEY

python run_server.py            # serves on http://localhost:8001
```

API root will respond at `http://localhost:8001/` and the endpoints live under `/api/*`.

### Frontend

```bash
cd frontend
npm install
npm run dev                     # serves on http://localhost:3000
```

The frontend looks for the backend at `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8001`. To point at a different host, set the variable before running:

```bash
NEXT_PUBLIC_API_URL=http://10.0.0.5:8001 npm run dev
```

---

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py                FastAPI app + CORS + .env loader
│   │   ├── routers/
│   │   │   ├── generate.py        /api/generate, /api/critique,
│   │   │   │                       /api/regenerate-section, /api/apply-critique
│   │   │   └── export.py          /api/export (streams .docx)
│   │   ├── agents/
│   │   │   ├── drafter.py         SECTION_SCHEMAS + draft_section()
│   │   │   └── critic.py          CRITIC_SCHEMA + critique_section()
│   │   ├── schemas/brd.py         Pydantic models
│   │   └── services/renderer.py   .docx renderer with ID normalization
│   ├── requirements.txt
│   ├── run_server.py
│   └── .env.example               OPENAI_API_KEY placeholder
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               Launcher
│   │   ├── intake/page.tsx        Brief intake form
│   │   ├── review/page.tsx        12-section workspace with critic feedback
│   │   └── export/page.tsx        Export confirmation + download
│   ├── components/
│   │   ├── primitives.tsx         DoubleBezel, PillCTA, GlassNav, FieldLabel, …
│   │   ├── icons.tsx              Custom icon set
│   │   └── theme-toggle.tsx
│   ├── lib/store.ts               Zustand store (brief + brd + critique state)
│   ├── tests/                     Playwright specs (home, intake, review, export)
│   ├── tailwind.config.js
│   ├── playwright.config.ts
│   └── package.json
│
├── html/                          Static HTML prototypes (visual reference)
├── Precedent-handoff/             Original Claude Design handoff bundle
├── DESIGN.md                      Visual contract (read before any UI work)
└── CLAUDE.md                      Architecture guide for Claude Code
```

---

## How it works

### Generate

`POST /api/generate` with a `BriefInput`. The backend fan-outs all 12 sections via `asyncio.gather`, each call constrained to its section's JSON schema. Returns `{ brd: { <section_key>: { content, feedback: [] } } }`. Drafter never produces critic feedback — that's a separate pass so the analyst sees the draft first.

### Critique

`POST /api/critique` with the current BRD and brief. Runs the critic in parallel across all sections. Each feedback item is shaped `{ severity, issue, suggestion }`, with the issue text prefixed by the item's ID (e.g. `FR-01: …`) so the UI can attach it to the right row.

### Refine a single section

- `POST /api/regenerate-section` — re-drafts one section, optionally with an extra natural-language instruction.
- `POST /api/apply-critique` — rewrites a section to address a specific feedback item, preserving the rest of the section's content.

### Export

`POST /api/export` with the final BRD. The renderer in `services/renderer.py` walks the schema, normalizes IDs to two-digit zero-padded form (`FR-01`), and emits a styled `.docx` as a `StreamingResponse`.

### The 12-section contract is load-bearing

The JSON schemas in `backend/app/agents/drafter.py::SECTION_SCHEMAS` are the single source of truth for what each section looks like. Adding or changing a section means coordinated edits across the drafter schemas, the section list in `generate.py`, the Pydantic models in `schemas/brd.py`, the renderer's `_ID_PREFIXES`, and the frontend's `BRD` interface in `lib/store.ts`. See [`CLAUDE.md`](./CLAUDE.md) for the full list.

---

## Testing

Playwright tests live in `frontend/tests/`. The Playwright config self-hosts its own dev server on port 3001, so don't start the frontend manually before running tests:

```bash
cd frontend
npm test                                              # full suite, headless
npm run test:ui                                       # interactive UI mode
npx playwright test tests/review.spec.ts              # single spec file
npx playwright test -g "submits intake form"          # single test by name
npm run test:report                                   # open last HTML report
```

The intake test stubs `/api/generate` with `page.route`, so it does not consume OpenAI credits.

---

## Design system

`DESIGN.md` is the visual contract. Non-negotiables:

- Base `#050505`, surfaces `#0A0A0A`–`#111111`, emerald `#10B981` used sparingly (≤10% of surface area).
- Every major container is a **double-bezel** card — implemented in `<DoubleBezel>` and mandatory.
- Primary CTAs are pill-shaped emerald buttons with a **nested-icon** trailing affordance.
- Severity badges use rose / amber / zinc tints for high / medium / low.
- No purple/blue glows, generic AI gradients, harsh drop shadows, white backgrounds, sharp 90° corners on major containers, or Inter/Roboto/Arial type.

---

## Notes

- The `OPENAI_API_KEY` in `backend/.env.example` is a placeholder. Set your own in `backend/.env` (which is gitignored).
- `Precedent-handoff/` is the original Claude Design handoff bundle, kept as historical reference. The live app is the Next.js code in `frontend/`.
- Both `.env` and `.venv/` are gitignored; so are `node_modules/`, `.next/`, Playwright artifacts, and the local test outputs (`backend/test_brd.docx`, `backend/test_regen.json`, `backend/nul`, `*.log`).
