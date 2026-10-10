---
name: "sdlc-init"
description: "Initialise the SDLC context file (sdlc.yaml) for a feature. Run once per feature before using the /sdlc-* step skills."
argument-hint: "feature_folder=specs/NNN-slug epic=OBMS-EEE prefix=PP [deploy_target=develop|agentic] [stories=XX-US-01:OBMS-101,XX-US-02:OBMS-107]"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Parse the following key=value fields from `$ARGUMENTS`:

| Field | Required | Default | Example |
|---|---|---|---|
| `feature_folder` | yes | — | `specs/003-personalisation-plan` |
| `epic` | yes | — | `OBMS-100` — the feature's current Epic, used for new Stories; the step skills read each Story's own parent Epic from Jira |
| `prefix` | yes | — | `PP` |
| `deploy_target` | no | `develop` | `develop` (Classic) or `agentic` (Agentic) — an environment label, not a git branch; both deploy from `develop` |
| `stories` | no | — | `PP-US-01:OBMS-101,PP-US-02:OBMS-107` |
| `ssh_host` | no | `118.69.64.152` | — |
| `ssh_port` | no | `2222` | — |
| `ssh_user` | no | `""` | your server username |
| `ssh_key` | no | `~/.ssh/obms_test_key` | — |
| `qc_ssh_user` | no | `""` | QC's own username for the Verification Step's log checks |
| `qc_ssh_key` | no | `~/.ssh/id_ed25519` | — |

1. **Derive fields:**
   - `feature_id` — the `NNN` prefix of the folder name (e.g. `003`)
   - `slug` — everything after `NNN-` (e.g. `personalisation-plan`)
   - `testing_folder` — replace `specs/` prefix with `testing/`
   - `test_env_url` — `http://118.69.64.152:8091` if `deploy_target=develop`, `http://118.69.64.152:8081` if `agentic`

2. **Parse stories** (if provided): split on `,`, then split each on `:` to get `{US_ID}: {jira_story}`. Build the stories map with empty title.

3. **Merge with existing** (if `{feature_folder}/sdlc.yaml` already exists): read it first, then overwrite only the explicitly-provided fields. Preserve existing stories entries — add new ones, do not delete.

4. **Write `{feature_folder}/sdlc.yaml`:**

```yaml
# OBMS SDLC context — managed by /sdlc-init and /sdlc-* skills
feature_id: "NNN"
slug: some-slug
feature_folder: specs/NNN-some-slug
testing_folder: testing/NNN-some-slug
jira_epic: OBMS-EEE
story_prefix: PP
deploy_target: develop          # develop | agentic — environment label; both deploy from the develop branch
test_env_url: http://118.69.64.152:8091
ssh_host: "118.69.64.152"
ssh_port: 2222
ssh_user: ""                   # used by SE for the Deployment Step
ssh_key: "~/.ssh/obms_test_key"
qc_ssh_user: ""                # used by QC for the Verification Step — separate account/key from SE
qc_ssh_key: "~/.ssh/id_ed25519"

stories:
  PP-US-01:
    jira_story: OBMS-101
    title: ""
  PP-US-02:
    jira_story: OBMS-107
    title: ""
```

5. **Report:** path written, all field values, and the next command to run:
   ```
   /sdlc-spec {prefix}-US-01 title="..." actor=ADMIN goal="..." reason="..." ac="AC1|AC2|AC3"
   ```
   If `ssh_user` or `qc_ssh_user` is still empty, remind the user to fill it in `sdlc.yaml` before running `/sdlc-deploy` or `/sdlc-verify` respectively.
