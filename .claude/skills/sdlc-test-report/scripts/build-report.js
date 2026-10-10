#!/usr/bin/env node
/**
 * Generic builder for the custom single-file Playwright execution report.
 *
 * Usage:
 *   node build-report.js --run <run.json> --meta <meta.json> --out <index.html> [--title "Page Title"]
 *
 * See .claude/skills/test-report/SKILL.md for the full workflow this script is one step of.
 *
 * run.json  — output of `playwright test --reporter=json`
 * meta.json — authored by hand from test_cases.md / spec.md, shape:
 *   {
 *     "reportMeta": { "project": "...", "environment": "...", "browser": "..." },
 *     "tests": {
 *       "TC-001": {
 *         "type": "E2E" | "Integration",
 *         "module": "...",
 *         "precondition": ["...", "..."],   // omit or [] => "No pre-condition"
 *         "descriptionLong": "...",
 *         "statusOverride": "Blocked",       // optional: force a status Playwright can't express natively
 *         "reason": "..."                    // required when statusOverride is Skipped/Blocked
 *       },
 *       "TC-002": {                          // a TC with no Playwright test (pytest, manual, blocked)
 *         "type": "Integration", "module": "...", "description": "...", "descriptionLong": "...",
 *         "status": "Passed" | "Failed" | "Blocked" | "Skipped",
 *         "reason": "...", "actualResult": "...", "executedAt": "08-Oct-2026 09:50:00"
 *       }
 *     }
 *   }
 */
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.run || !args.meta || !args.out) {
  console.error("Usage: node build-report.js --run <run.json> --meta <meta.json> --out <index.html> [--title \"Page Title\"]");
  process.exit(1);
}

const run = JSON.parse(fs.readFileSync(args.run, "utf8"));
const metaFile = JSON.parse(fs.readFileSync(args.meta, "utf8"));
const TESTS_META = metaFile.tests || {};
const REPORT_META_INPUT = metaFile.reportMeta || {};

function walkSpecs(suite, cb) {
  for (const spec of suite.specs || []) cb(spec);
  for (const s of suite.suites || []) walkSpecs(s, cb);
}

function fmtDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtExecutedAt(iso, tzOffsetHours) {
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffsetHours * 3600 * 1000);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dd = String(local.getUTCDate()).padStart(2, "0");
  const mon = months[local.getUTCMonth()];
  const yyyy = local.getUTCFullYear();
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mi = String(local.getUTCMinutes()).padStart(2, "0");
  const ss = String(local.getUTCSeconds()).padStart(2, "0");
  return `${dd}-${mon}-${yyyy} ${hh}:${mi}:${ss}`;
}

// Playwright error.message carries ANSI SGR color codes (e.g. from `expect()` diffs) that
// render as mojibake in HTML — strip them before display.
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function splitStepTitle(title) {
  const marker = "— Expected:";
  const idx = title.indexOf(marker);
  if (idx === -1) return { step: title, expected: "" };
  return { step: title.slice(0, idx).trim(), expected: title.slice(idx + marker.length).trim() };
}

// Prefix used consistently across this repo's *.spec.ts files, e.g. "TC-042: Login succeeds".
function tcIdFromTitle(title) {
  const m = title.match(/^(TC-\d+)\s*:/);
  return m ? m[1] : null;
}

const tzOffsetHours = Number(metaFile.timezoneOffsetHours ?? 7); // default: Asia/Saigon (UTC+7)

const testData = [];
let firstStart = null;
let lastEnd = null;

walkSpecs(run.suites[0], (spec) => {
  const id = tcIdFromTitle(spec.title);
  if (!id) return; // not a TC-tagged test case — skip (e.g. unrelated helper tests in the same file)
  const meta = TESTS_META[id];
  if (!meta) {
    console.warn(`WARN: no meta.json entry for ${id} ("${spec.title}") — skipping from report`);
    return;
  }

  const test = spec.tests[0];
  const results = test.results || [];
  const lastResult = results[results.length - 1];
  const start = new Date(lastResult.startTime);
  const end = new Date(start.getTime() + lastResult.duration);
  if (!firstStart || new Date(results[0].startTime) < firstStart) firstStart = new Date(results[0].startTime);
  if (!lastEnd || end > lastEnd) lastEnd = end;

  // Map Playwright's native test.status to the report's 5-state model.
  // "Blocked" has no Playwright equivalent — it is always an explicit meta.json override.
  let status;
  let reason = null;
  let actualResult = null;
  let failureScreenshot = null;

  if (meta.statusOverride) {
    status = meta.statusOverride;
    reason = meta.reason || null;
  } else if (test.status === "skipped") {
    status = "Skipped";
    reason = meta.reason || "No reason recorded — add `reason` in meta.json for this test.";
  } else if (test.status === "flaky") {
    status = "Flaky";
    const attempts = results.map((r, i) => `Attempt ${i + 1}: ${r.status}${r.error ? ` — ${stripAnsi(r.error.message || "").split("\n")[0]}` : ""}`);
    reason = `Passed after retry.\n${attempts.join("\n")}`;
  } else if (test.status === "unexpected") {
    status = "Failed";
    const err = lastResult.error || (lastResult.errors && lastResult.errors[0]);
    actualResult = err ? stripAnsi(err.message || "").split("\n").slice(0, 4).join("\n") : "See attached failure screenshot.";
    const shot = (lastResult.attachments || []).find((a) => a.name === "screenshot" && a.contentType === "image/png");
    if (shot) failureScreenshot = shot.body ? `data:image/png;base64,${shot.body}` : null;
  } else {
    status = "Passed";
  }

  const attachmentValues = (lastResult.attachments || [])
    .filter((a) => a.contentType === "image/png" && a.body && a.name !== "screenshot") // "screenshot" = auto failure capture, handled above
    .map((a) => `data:image/png;base64,${a.body}`);

  let shotIdx = 0;
  const steps = (lastResult.steps || []).map((s) => {
    const { step, expected } = splitStepTitle(s.title);
    const screenshot = meta.type === "E2E" && shotIdx < attachmentValues.length ? attachmentValues[shotIdx++] : null;
    return { step, expected, screenshot };
  });

  testData.push({
    id,
    description: spec.title.replace(`${id}: `, ""),
    type: meta.type,
    module: meta.module,
    status,
    duration: fmtDuration(lastResult.duration),
    executedAt: fmtExecutedAt(lastResult.startTime, tzOffsetHours),
    precondition: meta.precondition || [],
    descriptionLong: meta.descriptionLong || "",
    steps,
    actualResult,
    failureScreenshot,
    reason,
  });
});

// TCs with no Playwright test (backend pytest, manual check, blocked by design) still belong in
// the report so it lists every TC of the US. meta.json gives their result directly: "status"
// (Passed | Failed | Blocked | Skipped), plus "reason" (Blocked/Skipped), "actualResult" (Failed)
// and an optional "executedAt" / "duration" — descriptionLong says how a Passed one was verified.
const seen = new Set(testData.map((t) => t.id));
for (const [id, meta] of Object.entries(TESTS_META)) {
  if (seen.has(id)) continue;
  if (!meta.status) {
    console.warn(`WARN: ${id} is in meta.json but not in run.json, and has no "status" — skipping from report`);
    continue;
  }
  testData.push({
    id,
    description: meta.description || id,
    type: meta.type,
    module: meta.module,
    status: meta.status,
    duration: meta.duration || "—",
    executedAt: meta.executedAt || "—",
    precondition: meta.precondition || [],
    descriptionLong: meta.descriptionLong || "",
    steps: [],
    actualResult: meta.actualResult || null,
    failureScreenshot: null,
    reason: meta.reason || null,
  });
}

if (!testData.length) {
  console.error("No matching TC-* tests found between run.json and meta.json. Nothing to render.");
  process.exit(1);
}

const totalDurationMs = lastEnd - firstStart;
const reportMeta = {
  project: REPORT_META_INPUT.project || "Unknown Project",
  environment: REPORT_META_INPUT.environment || "Unknown Environment",
  browser: REPORT_META_INPUT.browser || "Unknown Browser",
  executionTime: fmtExecutedAt(firstStart.toISOString(), tzOffsetHours),
  // A report merged from several runs (a re-run of some TCs) spans the gap between them;
  // meta.json's reportMeta.duration lets the author state the real run times instead.
  duration: REPORT_META_INPUT.duration || fmtDuration(totalDurationMs),
};

const templatePath = path.join(__dirname, "..", "assets", "report-template.html");
const template = fs.readFileSync(templatePath, "utf8");

const pageTitle = args.title || `${reportMeta.project} — Test Report`;

const finalHtml = template
  .replace("__PAGE_TITLE__", pageTitle)
  .replace("__REPORT_META__", JSON.stringify(reportMeta))
  .replace("__TEST_DATA__", JSON.stringify(testData));

fs.mkdirSync(path.dirname(args.out), { recursive: true });
fs.writeFileSync(args.out, finalHtml, "utf8");

console.log("Written:", args.out);
console.log("Tests included:", testData.length);
console.log("Size:", (finalHtml.length / 1024 / 1024).toFixed(2), "MB");
