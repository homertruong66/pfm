# Harness Engineering Audit — PFM Project
**Generated:** 2026-10-10 (adapted from the GRM project's audit; every fact below was re-read from this repo and this machine's `~/.claude`)  
**Environment:** Windows 11 (PowerShell + Git Bash), Claude Code in VS Code  
**Model:** claude-sonnet-5-5  
**Working Directory:** `d:\Project\pfm` (branch `develop`)

> PFM is a skeleton for learners to build an MVP, driven by spec-kit plus the AIF-SDLC process ([aif-sdlc.md](../aif-sdlc.md)). It has **no ticket tracker**: git branches and the SRS/SDS documents are the source of truth, so none of the harness depends on Jira or any other MCP server. Items that could only be checked on another machine are marked *unverified here*.

---

## Overview

Harness Engineering is the deliberate configuration of the Claude Code execution environment to make AI-assisted work repeatable, safe, automated, and governed. It comprises five components:

| # | Component | Purpose | Configured? |
|---|-----------|---------|-------------|
| 1 | **Instructions** | Guide AI behavior via CLAUDE.md files | ✅ Project (spec-driven rules + trigger table; constitution read on demand); ❌ no global file on this machine |
| 2 | **Permissions** | Whitelist/deny tool calls | ⚠️ Project allowlist only (29 entries, mostly first-time-setup residue); **no deny rules** |
| 3 | **Hooks** | Automate pre/post-tool behaviors | ❌ None configured (global or project) |
| 4 | **Tools (MCP)** | Extend Claude with external services | ➖ Not used — 11 claude.ai connectors exist, none is needed by PFM |
| 5 | **Skills** | Reusable slash-command workflows | ✅ 10 `/sdlc-*` + 10 `speckit-*` project skills, all committed |

---

## 1. Instructions

Instructions are loaded each session from `CLAUDE.md` files in scope order: global → project.

### 1.1 Global Instructions
**File:** `~/.claude/CLAUDE.md` — **not present** on this machine. Behaviour is governed entirely by the project file.

### 1.2 Project Instructions
**File:** [CLAUDE.md](../CLAUDE.md) (~108 lines, checked in), in two parts:

- **Part 1 — Common:** *Spec-Driven Development* (a user story must exist in the governing spec before any code; specs lead, code follows) and *On-Demand Spec Reading* (SRS/SDS are too large to auto-load; read only the relevant section).
- **Part 2 — Project-specific:**
  - **The constitution is not auto-imported.** It lives at `.specify/memory/constitution.md` (moved from the repo root on 2026-10-10 so the spec-kit skills and `CLAUDE.md` point at the same file) and is read on demand: the trigger table names the section per kind of change, and the `/sdlc-*` and `speckit-*` skills read the sections they need.
  - **Governing documents**, in precedence order: constitution → [SRS.md](../SRS.md) → [SDS.md](../SDS.md).
  - A **trigger table** mapping the kind of change (domain entities, user stories/ACs, business rules, API/architecture, routes/DTOs, DB schema, backend code, frontend code, tests, secrets/deployment) to the exact SRS/SDS/constitution section to read.
  - **Project structure** tree (`frontend/`, `backend/` with one Django app per entity, `ui/`, `docs/`, `specs/`, `testing/`, `.specify/`), **dev commands** (backend, frontend, Playwright), **service URLs and auth notes** (no seeded credentials — the first ADMIN comes from `createsuperuser`), and **key conventions** (one app per entity, `{ABBR}-US-{NN}` IDs, where backend and Playwright tests live).

Branch conventions live in [aif-sdlc.md](../aif-sdlc.md) (one branch per SDLC step: `feature/[us-id-lowercase]-<step>-step`, always from an up-to-date `develop`). Tech-stack facts (Django 6 / DRF / SimpleJWT / SQLite; Next.js 16 / React 19 / TypeScript / Tailwind v4) live in the constitution's Technology Stack.

### 1.3 Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Global instructions defined | ❌ | None on this machine; no personal preferences carried across projects |
| Project instructions defined | ✅ | Spec-driven rules + on-demand trigger table |
| Instructions are specific and actionable | ✅ | Each trigger names exact documents and sections; constitution rules carry IDs (AR-01, API-03, NC-04, DOD-05…) |
| No conflicting instructions | ✅ | Precedence stated: constitution > SRS > SDS; known drift between docs and code is listed in the constitution |
| Context kept small | ✅ | SRS, SDS and the ~470-line constitution are all read on demand via the trigger table; skills read the constitution sections they need |

---

## 2. Permissions

### 2.1 Global Permissions
**File:** `~/.claude/settings.json` — contains only `{"model": "sonnet"}`. No global allow/deny rules and no hooks.

### 2.2 Project Permissions
**File:** [.claude/settings.json](../.claude/settings.json) — **tracked in git**.

#### Allowlist (29 entries, no `deny` block)

| Category | Entries | Purpose |
|----------|---------|---------|
| **Python environment setup** | `pip --version`, `pip install *`, `pip show *`, `py -0`, `py -3.12 -m venv .venv`, `where python *`, the `backend/.venv` `python.exe`/`pip.exe --version` and `manage.py check`, several one-line `python -c "…"` probes | Creating the 3.12 virtualenv and checking versions during first-time setup |
| **Package-index probes** | four `curl … pypi.org/pypi/django…` variants, `python -c "import ssl, certifi…"` | Finding the right Django version / diagnosing TLS during setup |
| **Installers** | `winget install *` | Installing Python 3.12 |
| **Frontend** | `npm run *`, `curl -s http://localhost:3000/…` | Dev server / lint / build checks |
| **Playwright** | `npx --no-install playwright --version`, `python -c "import playwright"`, `chromium-cli --help` | Probing for a browser runner |
| **System** | `netstat -ano`, `Read(//tmp/**)` | Port checks, temp reads |
| **One-off** | `rm -rf …/backend/.venv && echo "removed old venv"` | A single recreate-the-venv step — stale |

`additionalDirectories` is empty. **Missing:** no entry for `python manage.py test`, `git status/diff/log`, or `npx playwright test`, so the commands the AIF-SDLC uses most still prompt.

#### Deny list
**None.** Nothing blocks `git push --force`, `rm -rf` outside the repo, or `git reset --hard`.

#### Personal overrides
`.claude/settings.local.json` is git-ignored (`.gitignore` line 231) and does not exist on this machine.

### 2.3 Policy Limits (Org-level)
**File:** `~/.claude/policy-limits.json`

| Restriction | Value | Meaning |
|------------|-------|---------|
| `allow_remote_control` | `false` | Claude cannot be remote-controlled externally |
| `allow_quick_web_setup` | `false` | No quick web-setup shortcuts |
| `enforce_web_search_mcp_isolation` | `false` | Web search MCP isolation not enforced |
| `compliance_taints` | `[]` | No compliance flags |

### 2.4 Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Deny list configured | ❌ | None — destructive git/shell commands rely on the permission prompt alone |
| Settings shared with the team | ✅ | `.claude/settings.json` is committed — but it ships one developer's setup residue to every learner |
| Allowlist is minimal/scoped | ❌ | `pip install *` and `winget install *` pre-approve arbitrary package installs (supply-chain exposure); the `curl pypi.org` and `python -c` entries are one-offs |
| Allowlist matches the daily workflow | ⚠️ | Test, git and Playwright commands are not allowed, so they prompt |
| File write permissions scoped | ⚠️ | No `Write`/`Edit` rules; writes rely on prompts or the permission mode |

---

## 3. Hooks

### 3.1 Global hooks
`~/.claude/settings.json` has **no `hooks` block**. `rtk` is not on `PATH`; PFM uses no token-compression proxy.

### 3.2 Project hooks
[.claude/settings.json](../.claude/settings.json) has no `hooks` block. A useful first addition is frontend lint-on-edit:

```json
"hooks": {
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "input=$(cat); file=$(echo \"$input\" | python -c \"import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))\" 2>/dev/null); case \"$file\" in */frontend/src/*.ts|*/frontend/src/*.tsx) cd \"$(git rev-parse --show-toplevel)/frontend\" && npx eslint \"$file\" --max-warnings=0 2>&1 | head -30;; esac"
        }
      ]
    }
  ]
}
```

On Windows this runs under Git Bash; it uses `python` (3.x on `PATH`). A backend counterpart would run `python manage.py check` after edits under `backend/`.

### 3.3 Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| PreToolUse hooks defined | ❌ | None |
| PostToolUse hooks defined | ❌ | Lint-on-edit not configured |
| Quality gates automated elsewhere | ⚠️ | Enforced by process and by hand: `python manage.py test`, `npm run lint`, `npm run build`, `/speckit-analyze`, `aif-review-checklist.md`; there is **no CI** |

---

## 4. Tools (MCP)

### 4.1 Connected servers (claude.ai-hosted)

| MCP Server | State this session | Use in PFM |
|------------|--------------------|-----------|
| Atlassian, Claude Docs | Available | **None.** PFM has no ticket tracker; the `/sdlc-*` skills were stripped of their Jira steps on 2026-10-10 |
| Asana, Box, Canva, Figma, HubSpot, Intercom, Linear, Notion, monday.com | ⚠️ Need OAuth (claude.ai connector settings) | Not used |

### 4.2 Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| MCP needed by the workflow | ➖ | Nothing in the AIF-SDLC calls an MCP tool |
| Unused connectors | ⚠️ | 11 connectors add tool-list noise; disconnect the ones not wanted |
| Project-level MCP config (`.mcp.json`) | ❌ None | Out of scope unless a custom server is needed |
| UI wireframes | ℹ️ | `ui/*.png` are read directly; a Figma connector is not required |

---

## 5. Skills

### 5.1 Project skills — `.claude/skills/` (20, all tracked in git)

**AIF-SDLC workflow (10)** — the step skills of [aif-sdlc.md](../aif-sdlc.md); each produces an artifact the human reviews, on its own `feature/[us-id-lowercase]-<step>-step` branch from `develop`. None commits or merges.

| Skill | Role / Step | Purpose |
|-------|-------------|---------|
| `sdlc` | Orchestrator | Detect a story's step from the artifacts on `develop` and run the matching skill |
| `sdlc-init` | Setup | Write `specs/<feature>/sdlc.yaml` (folders, prefix, test abbreviation, URLs) |
| `sdlc-status` | Reporting | Step status of every story, derived from artifacts (no tracker) |
| `sdlc-spec` | Step 1 (BA) | SRS §7 entry and ToCs, `spec.md`, `checklists/requirements.md` |
| `sdlc-design` | Step 2 (SE) | Spec gap review, `plan.md`, `checklists/security.md`, SDS §5.x sync |
| `sdlc-quality` | Step 3 (QC) | `test_cases.md` (in `specs/`) and the Playwright suite (in `testing/`) |
| `sdlc-implement` | Step 4 (SE) | `tasks.md`, analyze → implement (TDD) → analyze (reports saved as `analysis-<us>-pre/post.md`), document sync |
| `sdlc-deploy` | Step 5 (SE) | Tests, lint, build, migrate, restart both servers on the home-LAN host, health checks |
| `sdlc-verify` | Step 6 (QC) | Backend + Playwright run, HTML report, `verification-report.md`, Done per the Definition of Done |
| `sdlc-test-report` | Optional support | Richer single-file HTML report (`assets/`, `scripts/build-report.js`) |

Removed on 2026-10-10 because PFM has no tracker: `sdlc-jira-task` and `sdlc-jira-done` (branch creation moved into each step skill; there is no "Task" state to transition).

**SPECKIT (10):** `speckit-specify`, `-clarify`, `-plan`, `-tasks`, `-implement`, `-analyze`, `-checklist`, `-constitution`, `-converge`, `-taskstoissues`. The `sdlc-*` skills wrap these (e.g. `sdlc-design` calls `/speckit-plan` with the project plan template and `/speckit-checklist security`). All read the constitution from `.specify/memory/constitution.md`.

Supporting framework: `.specify/templates/` (7 templates), `.specify/memory/constitution.md` (the project constitution — it was a pointer to a root file until 2026-10-10), `.specify/scripts/`, `.specify/workflows/`, `.specify/feature.json`, a per-feature `sdlc.yaml`, [aif-review-checklist.md](../aif-review-checklist.md) as the human review rubric, and [aif-artifact-audit.md](../aif-artifact-audit.md) tracking open drift.

### 5.2 Built-in / plugin skills available this session
`code-review`, `simplify`, `security-review`, `fewer-permission-prompts`, `update-config`, `keybindings-help`, `init`, `run`, `loop`, `schedule`, `claude-api`, `workflow-authoring`, `plugin-authoring`, plus `anthropic-skills:*` (docs, docx, pdf, pptx, xlsx, google-workspace, skill-creator, import-memory, morning). `fewer-permission-prompts` is the natural tool for fixing §2.4.

### 5.3 Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Project skills cover the full lifecycle | ✅ | Spec → Design → Quality → Implement → Deploy → Verify, plus orchestrator, init and status |
| Skills are the source of truth for the process | ✅ | `aif-sdlc.md` is the overview; each `SKILL.md` holds the procedure and points at the matching section of the review checklist |
| Skills committed and shared | ✅ | All 20 tracked |
| Skills exercised end to end | ❌ | The two shipped stories (SS-US-01, UM-US-01) were produced by hand from the templates; the adapted `/sdlc-*` skills and the spec-kit skills have **not yet been run on a real story** — a dry run on the next story is the real test |
| Process drift controlled | ⚠️ | [aif-artifact-audit.md](../aif-artifact-audit.md) lists open items (last scan: 0 Critical / 0 Major / 13 Minor) |

---

## 6. Gaps & Recommendations

### Resolved (2026-10-10)

| Gap | Resolution |
|-----|-----------|
| `/sdlc-*` skills described another project (Jira, OBMS, SSH, Docker, FastAPI) | ✅ Rewritten for PFM: artifact-based status, home-LAN deploy per RUNBOOK, Django/DRF/Next.js rules, `testing/` and `specs/` paths; Jira helper skills removed |
| Constitution at the repo root while the skills and spec-kit read `.specify/memory/constitution.md` | ✅ Moved; every link updated; `CLAUDE.md` imports the new path |
| Features had no `sdlc.yaml` or `checklists/security.md` | ✅ Generated for both features (security checklists written retroactively, with open items tagged) |
| `/speckit-analyze` reports were not persisted | ✅ `/sdlc-implement` now saves them as `analysis-<us>-pre.md` / `-post.md` |

### Remaining

| Gap | Impact | Recommended fix |
|-----|--------|----------------|
| **No deny rules** | 🔴 High for a learner repo | Add `deny` for `git push --force*`, `git reset --hard*`, `rm -rf /*`, `rm -rf ~*`, `git clean -fd*` |
| **Allowlist is setup residue** (`pip install *`, `winget install *`, one-off `rm -rf`/`curl pypi.org`) | 🟡 Medium | Prune it; run `/fewer-permission-prompts`; add `python manage.py test*`, `git status/diff/log*`, `npx playwright test*` |
| **No hooks** | 🟡 Medium | Add the ESLint `PostToolUse` hook from §3.2 |
| **No CI** | 🟡 Medium | Add a workflow running `manage.py test`, `npm run lint`, `npm run build` (the Definition of Done requires them) |
| **Skills never run on a real story** | 🟡 Medium | Run `/sdlc-init` + `/sdlc-spec` … on the next story (e.g. `WM-US-01`) and fix whatever the skills or templates get wrong |
| spec-kit scripts reject `feature/…` branches | 🟢 Low | Skills work around it with `SPECIFY_FEATURE` / `SPECIFY_FEATURE_DIRECTORY`; renaming branches to `NNN-…` would remove the workaround |
| No global `~/.claude/CLAUDE.md` | 🟢 Low | Add personal preferences if wanted; nothing project-critical depends on it |
| Unused MCP connectors | 🟢 Low | Disconnect the ones not wanted |
| Windows-first commands | 🟢 Low | `RUNBOOK.md`, `CLAUDE.md` and the deploy skill use `.venv\Scripts\activate`; add macOS/Linux equivalents for learners on those systems |

---

## 7. File Index

| File | Scope | Component | Status |
|------|-------|-----------|--------|
| `~/.claude/CLAUDE.md` | Global | Instructions | ❌ Not present on this machine |
| `~/.claude/settings.json` | Global | Config | ✅ `{"model": "sonnet"}` only — no hooks/permissions |
| `~/.claude/policy-limits.json` | Global/Org | Permissions | ✅ Active |
| `CLAUDE.md` | Project | Instructions | ✅ Active, tracked |
| `.specify/memory/constitution.md` | Project | Instructions (read on demand) | ✅ Active, tracked |
| `.claude/settings.json` | Project | Permissions | ✅ Active, tracked — needs pruning (§2.4) |
| `.claude/settings.local.json` | Project | Permissions (personal) | ➖ Git-ignored, not present |
| `.claude/skills/` | Project | Skills (×20) | ✅ Active, tracked |
| `.specify/` (templates, memory, scripts, workflows, feature.json) | Project | Spec framework | ✅ Active |
| `specs/<feature>/sdlc.yaml` | Project | Skill context | ✅ Both features |
| `aif-sdlc.md`, `aif-review-checklist.md`, `aif-artifact-audit.md` | Project | Process docs | ✅ Present |
| `docs/harness-engineering-claude.md` | Project | Reference | ✅ This file |
| `.mcp.json` | Project | MCP | ❌ Not present |
| `.github/workflows/` | Project | CI | ❌ Not present |

---

## 8. Remediation Log

| Date | Change | File(s) | Verified |
|------|--------|---------|---------|
| 2026-08-16 | First project settings and Dashboard skeleton (`e8253d7`) | `.claude/settings.json` | ✅ `git log` |
| 2026-08/09 | AIF-SDLC set up on spec-kit (`04acc1f`); templates enhanced (`82f024f`, `5afef3b`); spec-kit adapted to SRS/SDS (`5d53819`) | `.specify/`, `.claude/skills/speckit-*`, `aif-sdlc.md` | ✅ `git log` |
| 2026-10-08 | Review checklist, templates and process doc rewritten for PFM; artifact audit created | `aif-review-checklist.md`, `.specify/templates/`, `aif-artifact-audit.md` | ✅ |
| 2026-10-10 | `e2e/` renamed to `testing/` | `testing/`, all references | ✅ Playwright lists 8 tests |
| 2026-10-10 | Constitution moved to `.specify/memory/constitution.md`; links and `@` import updated | `CLAUDE.md`, `aif-*.md`, `docs/` | ✅ no remaining link to the old path |
| 2026-10-10 | `/sdlc-*` skills rewritten for PFM; Jira skills removed; `sdlc.yaml` and `checklists/security.md` generated for both features | `.claude/skills/sdlc*`, `specs/*/` | ✅ Read back; skills not yet run on a new story |
| 2026-10-10 | This audit written for PFM (it was a copy of the GRM audit) | this file | ✅ Read from current files |

---

*Adapted from the GRM project's harness audit (originally by Claude Code, claude-sonnet-4-6, 2026-05-27) and re-written for PFM by Claude Code (claude-sonnet-5-5) on 2026-10-10. File contents were read directly; no hooks or permissions were changed by this audit.*
