---
name: "sdlc-status"
description: "Show the AIF-SDLC step status of every User Story in a PFM feature (or all features), derived from the artifacts on develop — no tracker."
argument-hint: "[feature_folder=specs/NNN-slug] — omit to show all features"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

PFM has no ticket tracker (`aif-sdlc.md`): a step's state is read from the **artifacts**, and counts as done only when the artifact is on the latest `develop` (each step branch is merged back before the next one starts). This skill is read-only.

1. **Scope:** `feature_folder=…` or a bare path → that feature's `sdlc.yaml`; empty → every `specs/*/sdlc.yaml`. If a feature folder has no `sdlc.yaml`, say so and suggest `/sdlc-init`.

2. **For each story in `stories`**, evaluate the six steps with the rules below. `{us-lower}` = the US ID in lower case with `.` replaced by `-`. "On develop" means `git show develop:{path}` contains the marker (fall back to the working tree and mark `◐` if it exists only there).

   | Step | Done when (on `develop`) |
   |---|---|
   | 1 Spec | `SRS.md` has a `#### 7.x.N {US_ID}:` heading **and** `{feature_folder}/spec.md` has a `## {US_ID}:` section |
   | 2 Design | `{feature_folder}/plan.md` has a `## {US_ID}:` (or, in older plans, `### {US_ID}:`) section **and** `SDS.md` has a `#### 5.x.N {US_ID}:` heading |
   | 3 Quality | `{feature_folder}/test_cases.md` has a `## {US_ID}:` section |
   | 4 Implementation | `{feature_folder}/tasks.md` exists, mentions `{US_ID}`, and has no unchecked `- [ ]` task |
   | 5 Deployment | no artifact of its own — shown `–` until Verification exists, then `✓` (the verification report records the App URL it ran against) |
   | 6 Verification | `{testing_folder}/{us-lower}-*/verification-report.md` exists; its Verdict says the story **is Done** → `✓`; it lists failures → `✗` |

   Symbols: `✓` done on develop · `◐` artifact exists but is not on develop yet (branch not merged) · `→` the step branch `feature/{us-lower}-*-step` exists but no artifact yet · `✗` Verification failed · `–` not started.

3. **Render** one table per feature:

   ```
   Feature: 002-user-management  (SRS §7.2)   env: http://localhost:3000
   ──────────────────────────────────────────────────────────────────────
   Story       │ Spec │ Design │ Quality │ Impl │ Deploy │ Verify
   ──────────────────────────────────────────────────────────────────────
   UM-US-01    │ ✓    │ ✓      │ ✓       │ ✓    │ ✓      │ ✓
   UM-US-02    │ –    │ –      │ –       │ –    │ –      │ –
   ──────────────────────────────────────────────────────────────────────
   Legend: ✓ done on develop  ◐ not merged yet  → in progress (branch exists)  ✗ failed  – not started
   ```

4. **Next actions:** for each story, name the first step that is not `✓` and the command to run (`/sdlc-spec`, `/sdlc-design`, … or `/sdlc`). A `◐` step: "merge `feature/…` into `develop` first". A story with stories in `SRS.md` §7 but no `sdlc.yaml` entry: "add it with `/sdlc-init`".

5. **Summary line:** `2 features · 8 stories · 2 verified · 1 in progress · 5 not started`.
