---
name: "sdlc-deploy"
description: "Run Step 5 (Deployment) of the AIF-SDLC: deploy to the matching Test Environment via SSH."
argument-hint: "PP-US-01 [ssh_key=~/.ssh/obms_test_key]"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. **Parse args:** `US_ID` from first token. Optional `ssh_key` override from key=value pairs.

2. **Load context:** search `specs/*/sdlc.yaml` for the file whose `stories` map contains `{US_ID}`. Read it. Extract: `EPIC`, `JIRA_STORY`, `FEATURE_FOLDER`, `DEPLOY_TARGET`, `TEST_ENV_URL`, `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_KEY` (arg override takes precedence over sdlc.yaml value).
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - No match → STOP: "Run `/sdlc-init` for this feature, or add `{US_ID}` to its `stories` map."
   - `JIRA_STORY` empty → STOP: "Add the Jira Story key for `{US_ID}` to sdlc.yaml."
   - If `SSH_USER` or `SSH_KEY` is empty: STOP — "Set `ssh_user` and `ssh_key` in `{feature_folder}/sdlc.yaml` before deploying."

3. **Derive deploy config from `DEPLOY_TARGET`:**

   `DEPLOY_TARGET` is an environment label (which script/ports/containers to use), not a git
   branch — both `develop` and `agentic` deploy from the `develop` branch. `agentic-ai` was
   retired as a deploy target (it never diverged from `develop` — 0 commits ahead, 585 behind
   at retirement). What makes `agentic` "Agentic" is `EXECUTION_MODE=agentic`, set via that
   checkout's `docker-compose.dev.yml` / `docker-compose.test.dev.yml` overrides (untracked,
   server-local at `/app/obms`), not a separate branch.

   | deploy_target | Script | Checkout dir | App container | SDK port | SDK container | Ecom Test Site |
   |---|---|---|---|---|---|---|
   | `develop` | `deployment/deploy_develop.sh` | `/app/obms_develop` | `obms_develop-app-1` | `8096` | `obms-signals-sdk-develop` | `ecom-test-site-develop` on port `8088` |
   | `agentic` | `deployment/deploy_test.sh` | `/app/obms` | `obms-app-1` | `8086` | `obms-signals-sdk-agentic` | `ecom-test-site-agentic` on port `8089` |

   `SDK_HOSTING_URL` = `http://{SSH_HOST}:{sdk_port}/obms-signals.min.js`.

   > Ecom Test Site (`tools/ecom-test-site/`) is deployed twice — one fully isolated instance per track (same Dockerfile, separate container/port; neither deploy touches the other's container). Runs on `:8088`/`:8089`, not the more obvious `:8098`/`:8099` — the test server's external firewall only has a specific allowlisted set of ports open.

4. **Pre-flight:**
   - The **Implementation Step Task is Done** (reviewed and accepted): JQL `project = OBMS AND issuetype = Task AND summary ~ "{US_ID}: Implementation Step"`. `Ready For Review` / `In Review` → STOP: "The Implementation Step is still in review; finish it with `/sdlc-implement {US_ID}` (confirm its review gate)." Other status or not found → STOP: "Run `/sdlc-implement {US_ID}` first." If Jira is unavailable, warn and continue.
   - Verify `spec.md` and `plan.md` exist in `{feature_folder}`
   - Verify the Implementation Step PR is merged into `develop` (both deploy targets ship from
     `develop` — `{DEPLOY_TARGET}` only selects the environment/script, not the branch):
     ```
     git fetch origin develop
     git log --oneline --merges origin/develop --grep "{us-lowercase}-implementation-step"
     ```
     (`{us-lowercase}` replaces `.` with `-`.) Bitbucket merge commits read `Merged in feature/<task>-<us>-implementation-step (pull request #N)`. STOP if none is found — "Merge the Implementation PR into `develop` first."

5. **Jira Setup:** run `/sdlc-jira-task` with:
   ```
   step="Deployment Step" us={US_ID} epic={EPIC} story={JIRA_STORY}
   ```
   This step creates no git branch.
   Wait for it to complete. Capture `TASK_ID` from its output before proceeding.

6. **Deploy work** — SSH to the Test Server and run the deploy script:
   ```
   ssh -i {SSH_KEY} -p {SSH_PORT} {SSH_USER}@{SSH_HOST} 'sudo {checkout}/{script}'
   ```
   Capture the exit code and the final summary block from the script's output.

7. **Standalone hosting containers** — build and (re)start from the SAME checkout, so what's served always matches what's on the branch. **Best-effort: a failure in either does NOT gate this deployment or block step 12's Jira transition — report it in the final report instead. Skip a sub-step entirely if that directory hasn't changed since the last deploy.**

   a. **OBMS Customer Signals SDK** (`sdk/javascript/`) — both Classic and Agentic:
      ```
      ssh -i {SSH_KEY} -p {SSH_PORT} {SSH_USER}@{SSH_HOST} '
        cd {checkout} &&
        sudo docker build -t {sdk_container} -f sdk/javascript/Dockerfile sdk/javascript &&
        sudo docker rm -f {sdk_container} 2>/dev/null;
        sudo docker run -d --name {sdk_container} -p {sdk_port}:80 --restart unless-stopped {sdk_container}
      '
      ```
      Verify: `curl -sf -o /dev/null -w "%{http_code}\n" {SDK_HOSTING_URL}` — expect 200.
      If `docker run` fails with "port is already allocated", the `docker rm -f` above should have freed it — if it still fails, check for a stale container: `docker ps -a --filter publish={sdk_port}`.

   b. **Ecom Test Site** (`tools/ecom-test-site/`) — isolated per track, `{ecom_container}`/`{ecom_port}` from the table above:
      ```
      ssh -i {SSH_KEY} -p {SSH_PORT} {SSH_USER}@{SSH_HOST} '
        cd {checkout} &&
        sudo docker build -t {ecom_container} tools/ecom-test-site &&
        sudo docker rm -f {ecom_container} 2>/dev/null;
        sudo docker run -d --name {ecom_container} -p {ecom_port}:8088 --restart unless-stopped {ecom_container}
      '
      ```
      Verify: `curl -sf -o /dev/null -w "%{http_code}\n" http://{SSH_HOST}:{ecom_port}/health` — expect 200.
      Same "port already allocated" recovery as 7a, filtered on `docker ps -a --filter publish={ecom_port}`.

8. **Check deploy exit code** (step 6 gate only — step 7 failures do not apply here):
   - **Exit code == 0:** deploy is healthy; proceed to step 9.
   - **Exit code != 0:**
     - Identify the failing step from the `[deploy] FAIL:` line.
     - Fetch the relevant log tail:
       - Classic: `ssh ... 'sudo docker logs obms_develop-app-1 --tail 80'`
       - Agentic: `ssh ... 'sudo docker logs obms-app-1 --tail 80'` or `'sudo tail -n 80 /app/obms/vllm.log'`
     - Do NOT transition the Jira ticket. STOP and report the failure with the log tail.

9. **Empty users table** — if the script ends with a `[deploy] WARN` about an empty `users` table, no admin exists yet in that environment's database. Resolve from the checkout's `backend/`:
   ```
   ssh -i {SSH_KEY} -p {SSH_PORT} {SSH_USER}@{SSH_HOST} \
     'cd {checkout}/backend && source ../venv/bin/activate \
      && python -m app.scripts.create_admin <username> <12+-char-password>'
   ```

10. **External URL verification** — confirm test URLs return 200 from outside the test server (catches network/firewall issues the script can't see from localhost):
    ```
    curl -sf -o /dev/null -w "%{http_code}\n" {TEST_ENV_URL}/docs
    curl -sf -o /dev/null -w "%{http_code}\n" {TEST_ENV_URL}/admin
    curl -sf -o /dev/null -w "%{http_code}\n" {SDK_HOSTING_URL}                  # skip if step 7a was skipped/failed
    curl -sf -o /dev/null -w "%{http_code}\n" http://{SSH_HOST}:{ecom_port}/health  # skip if step 7b was skipped/failed
    ```

11. **Review gate:** self-check against [`aif-review-checklist.md` §Step 5](../../../aif-review-checklist.md#step-5--deployment-step--se-reviews): go through every item and mark it pass, fail (with the fix applied or proposed) or N/A, fixing what you can first. Then show the checked list, the deploy exit code and the URL checks, and ask the user to review. Apply requested changes. The step 8 exit-code gate still applies; the Review gate is an extra condition, not a replacement.
   Before showing the review, run `/sdlc-jira-done {TASK_ID} to=ready` (Task → Ready For Review while you review; skip if `TASK_ID` is unknown).

12. **Jira Done** *(once the user confirms; gated on step 8's app deploy only — a step 7 SDK/Ecom failure does not block this):* run `/sdlc-jira-done {TASK_ID}` (Ready For Review → In Review → Done). Verification starts only after the Task is Done. Skip if `TASK_ID` is unknown.

13. **Report:** script exit code, final URL block, the merge commit that was deployed (echoed by the deploy script near the top of its output), SDK container status (deployed / skipped / failed — with reason if failed), Ecom Test Site container status (same), and confirm `{TEST_ENV_URL}` is ready for QC:
    ```
    /sdlc-verify {US_ID}
    ```
