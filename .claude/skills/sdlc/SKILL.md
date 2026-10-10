---
name: "sdlc"
description: "Orchestrator: detect the current AIF-SDLC step for a PFM User Story from the artifacts on develop and run the matching /sdlc-* step skill."
argument-hint: "WM-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** find `specs/*/sdlc.yaml` whose `stories` map contains `{US_ID}`; read `feature_folder`, `testing_folder`, `story_prefix`.
   - No match → STOP: "Run `/sdlc-init` for this feature, or add `{US_ID}` to its `stories` map."

3. **Detect the state of the six steps** with the rules in `/sdlc-status` (artifacts on the latest `develop`; no tracker). Print a one-line summary:
   ```
   WM-US-01: Spec ✓  Design ✓  Quality →  Impl –  Deploy –  Verify –
   ```

4. **Decide the next action:**
   - All six `✓` → "All 6 steps are done for `{US_ID}`." STOP.
   - A step is `✗` (Verification failed) → "Verification found failures; the fix belongs to Step 4: run `/sdlc-implement {US_ID}`, then `/sdlc-deploy` and `/sdlc-verify` again." Ask before running.
   - A step is `◐` (artifact exists, branch not merged) → STOP: "Step N's branch `feature/…` is not merged into `develop` yet. Review, commit and merge it first (`aif-sdlc.md` branching rule)."
   - A step is `→` (branch exists, work unfinished) → ask: "Step N ({name}) was started on `feature/…`. Resume it? [y/N]". If yes, run that step skill; it switches to the existing branch.
   - Otherwise `NEXT_STEP` = the first step that is `–`.

5. **Pre-flight (sequence rule):** every step before `NEXT_STEP` must be `✓`. If not, STOP and name the step to complete first.

6. **Run the step skill:**

   | Step | Skill |
   |---|---|
   | 1 Spec | `/sdlc-spec` — needs `title`, `actor`, `goal`, `reason`, `ac`; read them from `$ARGUMENTS` or `SRS.md`, and prompt for whatever is missing |
   | 2 Design | `/sdlc-design` |
   | 3 Quality | `/sdlc-quality` |
   | 4 Implementation | `/sdlc-implement` |
   | 5 Deployment | `/sdlc-deploy` |
   | 6 Verification | `/sdlc-verify` |

   Run it with `US_ID` (and the Spec arguments).

7. **After the skill finishes:** re-evaluate the six steps and print the updated row plus `Next: /sdlc-… {US_ID}`.
