---
name: "sdlc-init"
description: "Initialise the SDLC context file (specs/<feature>/sdlc.yaml) for a PFM feature. Run once per feature before using the /sdlc-* step skills."
argument-hint: "feature_folder=specs/NNN-slug prefix=WM [srs_section=7.3] [stories=WM-US-01:Create a Wallet,WM-US-02:List Wallets] [host_ip=192.168.1.20]"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

PFM is a solo, ticket-less project (`aif-sdlc.md`): git branches and the SRS/SDS documents are the source of truth, so `sdlc.yaml` holds only the *context the step skills need to find things* — no tracker keys, no remote hosts.

Parse these key=value fields from `$ARGUMENTS`:

| Field | Required | Default | Example |
|---|---|---|---|
| `feature_folder` | yes | — | `specs/003-wallet-management` |
| `prefix` | yes | — | `WM` — the feature's story prefix (`constitution.md` § User Story Conventions) |
| `srs_section` | no | read from `SRS.md` | `7.3` — the feature's `### 7.x` number; if omitted, find the `### 7.x … ({prefix})` heading |
| `stories` | no | — | `WM-US-01:Create a Wallet,WM-US-02:List Wallets` — `US_ID:Title` pairs separated by commas |
| `host_ip` | no | `""` | the home-LAN IP of the deployment host (`RUNBOOK.md` §2); empty means `localhost` |

1. **Derive fields:**
   - `feature_id` — the `NNN` prefix of the folder name; `slug` — everything after `NNN-`
   - `testing_folder` — the folder name under `testing/` (e.g. `testing/003-wallet-management`)
   - `test_abbr` — `prefix` in lower case (the Playwright file is `testing/<folder>/test_{test_abbr}.spec.ts`)
   - `test_env_url` — `http://{host_ip}:3000` (or `http://localhost:3000`); `api_url` — same host, port `8000`

2. **Stories:** for each `US_ID:Title`, add an entry with `title`; `actor` is read from the story's heading in `SRS.md` §7 if it already exists, otherwise left `""` (the Spec Step fills it).

3. **Merge with an existing file:** if `{feature_folder}/sdlc.yaml` exists, read it first and overwrite only the explicitly provided fields. Keep existing `stories` entries — add new ones, never delete.

4. **Write `{feature_folder}/sdlc.yaml`:**

```yaml
# PFM SDLC context — managed by /sdlc-init, read by the /sdlc-* skills
feature_id: "003"
slug: wallet-management
feature_folder: specs/003-wallet-management
testing_folder: testing/003-wallet-management
srs_section: "7.3"
story_prefix: WM
test_abbr: wm                      # testing/<folder>/test_wm.spec.ts
test_env_url: http://localhost:3000   # or http://<HOST_IP>:3000 once deployed on the LAN
api_url: http://localhost:8000
host_ip: ""                        # LAN IP of the deployment host (RUNBOOK §2); "" = localhost

stories:
  WM-US-01:
    title: "Create a Wallet"
    actor: "USER"
```

5. **Report:** the path written, the field values, and the next command:
   ```
   /sdlc-spec WM-US-01 title="Create a Wallet" actor=USER goal="..." reason="..." ac="AC 1|AC 2|AC 3"
   ```
   If the feature has no folder yet, say that `/sdlc-spec` creates `spec.md` and `/speckit-specify` is not needed first.
