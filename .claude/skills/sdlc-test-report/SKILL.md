---
name: sdlc-test-report
description: Generate the custom single-file HTML Test Report (Globee-branded, GitHub Actions/Azure DevOps-style) for a User Story's Playwright suite — split test list + detail panel, per-step screenshots, status filters, offline single-file output. Use after running (or re-running) Playwright tests for a feature/US and the user asks to "generate the report", "update the test report", or during the Verification Step (aif-sdlc.md Step 6).
metadata:
  author: pfm-project
---

# Test Report Generator

> **Optional in PFM.** The default Verification Step (`/sdlc-verify`) uses Playwright's built-in HTML reporter plus a hand-written `verification-report.md` (`aif-sdlc.md` § Step 6). Use this skill when a richer single-file report is wanted: it replaces the folder's `index.html` and must be rebuilt after every run. The Globee branding and the Asia/Saigon timestamps are deliberate defaults — change the template or `timezoneOffsetHours` if they do not suit.

Produces a single offline HTML file with
a sticky header + summary cards, a status/search filter bar, a scrollable test list (left), and a
detail panel (right) showing description, pre-condition, a per-step table with screenshot
thumbnails (click to zoom), and a status-specific callout (Actual Result for Failed, Reason for
Flaky/Skipped/Blocked, nothing extra for Passed).

Design reference (do not deviate without asking the user first): white background, rounded cards,
colored status badges, no Bootstrap, CSS Grid/Flexbox, E2E/Integration type badges, Globee logo
(inline SVG) + "Test Report" title in the header.

## Assets

- `assets/report-template.html` — the approved HTML/CSS/JS shell. Contains three placeholders
  that `scripts/build-report.js` fills in: `__PAGE_TITLE__`, `__REPORT_META__`, `__TEST_DATA__`.
  **Do not hand-edit placeholders in a copy** — edit this template file itself if the design needs
  to change, so every future report benefits.
- `scripts/build-report.js` — Node script that merges a Playwright JSON-reporter run with a
  hand-authored `meta.json` into the final report. Run with plain `node` (no deps beyond Node's
  built-ins).
- `assets/meta.example.json` — a working example showing the exact `meta.json` shape.

## Workflow

### 1. Confirm scope with the user if ambiguous

Which feature/US, which `.spec.ts` file, which `-g` grep pattern for the test titles, and where the
report should be written (convention in this repo: `testing/{feature-id}-{slug}/{us-id-keyword}/index.html`, next to that story's `verification-report.md` — e.g. `testing/002-user-management/um-us-01-create-user/`).

### 2. Run the suite with the JSON reporter

```bash
BASE_URL=<Test Env URL> npx playwright test <spec-file> --project=chromium -g "<pattern>" \
  --reporter=json --retries=0 > run.json
```

Write `run.json` to the scratchpad directory, not the repo — it is a build input, not a deliverable.
Retry with `--retries=1` (Playwright's default) only if you need the report to reflect a genuinely
Flaky status; use `--retries=0` when you just want a clean pass/fail snapshot.

If tests fail unexpectedly (e.g. everything times out), check environment health
(`curl` the app's `/health` endpoint) before assuming the failures are real — shared test VMs can
have transient load spikes.

### 3. Author `meta.json`

This is the one step that requires judgment — Playwright's JSON output has no concept of "module",
"pre-condition", "description", or a human-readable step/expected split beyond what your test titles
already encode. Pull this from `specs/{feature}/test_cases.md` (Given/When/Then, AC references) and
`plan.md`:

- `reportMeta.project` / `environment` / `browser` — get the exact Chrome version with:
  `node -e "require('@playwright/test').chromium.launch({channel:'chrome'}).then(async b=>{console.log(b.version());await b.close()})"`
- Per TC: `type` (`"E2E"` or `"Integration"`, matching `test_cases.md`'s Type column),
  `module`, `precondition` (array of bullet strings from the "Given" clause — omit/empty array
  renders "No pre-condition"), `descriptionLong` (one sentence, the When/Then summary).
- Only set `statusOverride` (`"Blocked"` + `reason`) when a test was intentionally not run for a
  reason Playwright can't express (e.g. missing test data, dependent environment down) — see
  Step 5 for the native Passed/Failed/Flaky/Skipped detection the script already does.
- **The report MUST list every TC of the US, with its result — the same TC set as the US's Results
  table in `test_report.md`.** A TC with no Playwright test (verified by backend pytest or manually,
  or BLOCKED by design) gets a `meta.json` entry with `status` (`"Passed"`/`"Failed"`/`"Blocked"`),
  `description`, `executedAt`, and `reason` (Blocked) or `actualResult` (Failed); for a Passed one,
  `descriptionLong` says how it was verified (e.g. the pytest name). The script adds these entries
  even though they're not in `run.json`. Before handing off, check the report's TC count equals the
  Results table's row count.

Test titles in the `.spec.ts` file MUST start with `TC-NN: ` (any number of digits) for the script to match them against
`meta.json` — this is already the convention across this repo's suites. Integration TCs run as Django tests (`backend/<app>/tests.py`), so they have no Playwright test: give them a `meta.json` entry with their pytest/Django test name, as described above.

### 4. Build the report

```bash
node .claude/skills/sdlc-test-report/scripts/build-report.js \
  --run <path-to-run.json> \
  --meta <path-to-meta.json> \
  --out testing/{feature}/{us-id-keyword}/index.html \
  --title "{US-ID} — Test Report"
```

The script auto-derives, per test: status (Passed/Failed/Flaky/Skipped, from Playwright's native
`test.status` — Blocked only via override), duration, executed-at timestamp (Asia/Saigon, UTC+7 —
pass `"timezoneOffsetHours"` in `meta.json` to change), and maps `testInfo.attach()` screenshots to
steps in call order for `type: "E2E"` tests. Integration tests never get step screenshots (matches
this repo's Testing-Code-Rule: "Screenshots: ...; skip for integration").

For a Failed test, the script pulls the actual error message and Playwright's auto-captured failure
screenshot automatically — no meta.json involvement needed for those two fields.

### 5. Verify before handing off

Never ship a report you haven't rendered. Open it in a real headless browser and check for console
errors, then screenshot at least the overview and one detail panel:

```js
const { chromium } = require("@playwright/test");
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await page.goto("file:///" + absolutePathToIndexHtml.replace(/\\/g, "/"));
await page.screenshot({ path: "..." });
```

Read the resulting screenshot with the Read tool before telling the user it's done.

### 6. Clean up

- Delete scratch `run.json` / verification scripts / screenshots you created for this task — they
  don't belong in the repo.
- **Never `rm -rf` a generic folder name like `report` or `test-results` inside `testing/` without
  checking `git status` first** — the committed per-story report folders (e.g. `testing/002-user-management/um-us-01-create-user/`) hold `verification-report.md` and `index.html`; a careless delete or a Playwright HTML-reporter run into the same folder removes tracked files. If that happens: `git restore -- <path>`
  immediately, don't try to regenerate the deleted content by hand.
- If you seeded test data in the app's database to exercise a hard-to-reach scenario (e.g. legacy/invalid data states), confirm with the user that it has been cleaned up before considering the report final. (E2E runs leave `TestQC-` accounts behind until a delete-User story exists.)

## Known constraints (carried over from the design brief — do not add back)

Out of scope for this report: export button, share button, attachments list, error log, stack
trace, video, trace viewer, console log, network log. If asked for any of these, confirm with the
user first — they were explicitly excluded from the approved design.
