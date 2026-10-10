# Analysis (post-implementation, retroactive): UM-US-01 Create a User

> Produced with `/speckit-analyze` on 2026-10-10, **after** the story was implemented and verified — the gate was not run at the time (audit finding P7). Read-only analysis of `spec.md`, `plan.md`, `tasks.md` and `test_cases.md` against `.specify/memory/constitution.md`. The findings below were fixed in the same change (see "Resolution").

| ID | Category | Severity | Location(s) | Summary | Resolution |
|----|----------|----------|-------------|---------|------------|
| D1 | Constitution | HIGH | plan.md Complexity Tracking; spec Out of Scope; plan G9 | FE-03 (hide controls a role cannot use): the Create User screen is reachable by URL and shown to any logged-in User, which sees an access-denied message. The deferral was in G9 and the spec's Out of Scope but not in Complexity Tracking. | Fixed — row added with its trigger (a role source such as UM-US-03) |
| I1 | Inconsistency | MEDIUM | plan.md API Contracts, Sequence Diagram, Quickstart vs spec EC-10 | EC-10 (email stored in lower case) was only in D6 and the T-list. | Fixed — added to the `201` mapping, the diagram and the Quickstart |
| I2 | Inconsistency | MEDIUM | plan.md Domain Objects, T2, Project Structure | `full_name` described with a `''` backfill; migrations `0003`/`0004`, `REQUIRED_FIELDS` and the lower-casing `create_superuser` were missing. | Fixed |
| I3 | Inconsistency | LOW | tasks.md header, T007, plan T8 vs test_cases.md | TC lists stopped at TC-17/TC-19; `test_cases.md` is TC-01…TC-22. | Fixed |
| I4 | Inconsistency | LOW | plan.md Open tasks vs tasks.md T019 | T019 had no plan counterpart. | Fixed — plan row T13 |
| N1 | Naming | LOW | plan.md Element IDs vs NC-04 | `user-*-error` IDs extend NC-04. | Accepted — documented in plan.md |
| U1 | Duplication | LOW | spec AC-02 vs EC-03 | Same rule split by field; intentional (AC-02 is the SRS scenario). | No action |

**Coverage:** 15 requirements (AC-01..05, EC-01..10), 19 tasks, 100% covered, no unmapped tasks. **Metrics:** critical 0 · high 1 · medium 2 · low 4 · ambiguity 0 · duplication 1.

**Constitution:** only D1; AR-01..05, AC-02/03, API-03/04, VL-01..05, Logging & Audit, DOD-02 and NC-05 hold.
