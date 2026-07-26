# PFM — Claude Code Instructions

> Auto-loaded by Claude Code each session. Not for human navigation — see [README.md](README.md).

---

## Part 1: Common Instructions

<!-- Principles that apply to any spec-driven project; shape how Claude approaches all tasks here -->

### Spec-Driven Development

Before writing any code, confirm a user story exists in the governing spec. If a task conflicts with the spec, amend the spec first — code does not lead, specs do.

### On-Demand Spec Reading

Governing documents are too large to auto-load in full. Read only the relevant section when triggered by the type of change being made. See the project-specific trigger table in Part 2.

---

## Part 2: Project-specific Instructions

<!-- PFM operational details: governing docs, file paths, ports, credentials, and common shortcuts -->

<!-- Inlines the full project constitution into every session -->
@constitution.md

### Governing Documents

<!-- Constitution/SRS/SDS are the ground truth for all decisions, in priority order -->
Before any code or design decision, these documents take precedence in order:
1. **[constitution.md](constitution.md)** — Non-negotiable Principles, Development Workflow, Tech Stack Constraints
2. **[SRS.md](SRS.md)** — what the system does and why (CDM, Business Flows, Features/User Stories...)
3. **[SDS.md](SDS.md)** — how the system is designed (TDM, Architecture, ADRs, API Specs...)

<!-- SRS and SDS are too large to auto-load; this table prevents both skipping them and wasteful full reads -->
| Trigger | Read |
|---------|------|
| Adding/renaming domain entities, actors, or business flows | [SRS.md](SRS.md) §2–§6 |
| Writing or reviewing user stories or acceptance criteria | [SRS.md](SRS.md) §7 (relevant feature section only) |
| Business Rule changes | [SRS.md](SRS.md) §2.4 |
| API design, sequence diagrams, or architecture decisions | [SDS.md](SDS.md) (relevant section) |
| New routes, DTOs, or serializer changes | [SDS.md](SDS.md) §6 (API Design) |
| Domain object / DB schema changes | [SDS.md](SDS.md) §2, §4.3.3 |
| Tech stack constraints | [constitution.md](constitution.md) (already loaded) |

### Project Structure

<!-- Instant map of repo layout; avoids repeated filesystem exploration at the start of tasks -->
```
pfm/
├── frontend/            # Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 (port 3000)
├── backend/              # Django 6 · DRF · SimpleJWT (JWT) · SQLite (port 8000)
│   ├── config/            # settings.py, urls.py, api_router.py — all routes under /api/v1/
│   ├── users/              # AUTH_USER_MODEL + registration
│   ├── wallets/             # one Django app per Aggregate Root / entity (SDS §2.1)
│   ├── categories/
│   ├── budgets/
│   ├── transactions/
│   └── notifications/        # financial_goals / investment_portfolios (with holdings) / assets / roles
│                              #   are designed in SDS §2.2 but not yet scaffolded as apps —
│                              #   assets is its own app (system-level, ADMIN-only, SRS §7.9), not nested under investment_portfolios
├── ui/                   # Wireframe screenshots referenced from SDS §3.2
├── specs/                # spec-kit feature folders: specs/[feature-id]-[slug]/spec.md, plan.md, ...
├── tests/                # Quality Step artifacts, mirrors specs/: tests/[feature-id]-[slug]/test_cases.md, test_[feature-id].spec.ts
├── aif-sdlc.md           # AI-First SDLC
├── SRS.md                # Software Requirements Specification
├── SDS.md                # Software Design Specification
├── constitution.md       # Project constitution (principles, patterns)
├── RUNBOOK.md            # Operational reference (home-LAN setup/deploy/troubleshoot)
└── README.md
```
`specs/` holds spec/plan/design artifacts (spec-kit); `tests/` holds the parallel Quality Step artifacts (`test_cases.md`, Playwright `.spec.ts`) for the same `[feature-id]-[slug]` — kept separate so design docs and generated test code don't mix in the same folder.

### Dev Commands

<!-- Quick reference for the most common operations; avoids opening RUNBOOK.md for routine tasks -->
> Full first-time setup in [RUNBOOK.md](RUNBOOK.md).

```bash
cd backend && .venv\Scripts\activate && python manage.py runserver     # backend dev server → :8000
cd backend && python manage.py test                                   # backend tests
cd backend && python manage.py makemigrations && python manage.py migrate   # schema changes
cd frontend && npm run dev                                             # frontend dev server → :3000
cd frontend && npm run build                                           # frontend type-check + build
cd frontend && npm run lint                                            # frontend lint
```

### Service URLs

<!-- Ports and credentials needed for verification tasks; not derivable from code or constitution -->
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/ · Health: http://localhost:8000/health/ · Admin: http://localhost:8000/admin/
- Auth: JWT Bearer — `POST /api/v1/auth/login/` to obtain a token pair, `POST /api/v1/auth/refresh/` to refresh; send `Authorization: Bearer <access_token>`
- No seeded default credentials — create the first ADMIN via `python manage.py createsuperuser` (RUNBOOK §9), or register a USER via `POST /api/v1/users/`

### Key Conventions

<!-- High-frequency rules that affect almost every task but aren't prominent enough in the constitution -->
- One Django app per domain entity under `backend/` (SDS §2.1) — a new entity gets a new app, not a new module inside an existing one
- Feature/User Story IDs use the `{ABBR}-US-{NN}` convention (e.g. `WM-US-01`) — see constitution.md § User Story Conventions
- Backend integration tests live in each app's `tests.py`; e2e coverage lives under `tests/[feature-id]-[slug]/test_[feature-id].spec.ts` (Quality Step) — no Playwright runner (`playwright.config.ts`, `@playwright/test` dependency) is installed yet, needed before those `.spec.ts` files can run
