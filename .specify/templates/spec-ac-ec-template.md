<!--
PURPOSE: this file does NOT replace spec-template.md. It defines a fixed internal
ordering convention for the "### Acceptance Criteria" and "### Edge Cases" blocks of
the six basic CRUD-style User Stories — Create, List, Search, View, Update, Delete
— so ACs/ECs are grouped by category instead of appearing in random order during
review. List, Search, and View together cover Read: List and Search return a
filtered/paginated set of records; View returns the full detail of one record
identified by ID (no pagination, hence no Pagination & Sorting Behavior group).
Everything else about spec.md — metadata, GWT hard-break formatting, ID numbering,
banned words, WHAT-only content — is governed by spec-template.md and the
constitution unchanged.

AC GROUP ORDER (fixed per verb, always in this sequence — omit a group entirely if
genuinely empty for the US, never leave an empty header):
  1. Main Success Scenario   — the happy path for this verb, start to finish
  2. Standard Business Rules — core rules/validations a normal user can trigger
     without trying. Genuinely thin for View, a single-record read with no
     mutation logic — omit rather than force a row
  3. Pagination & Sorting Behavior — LIST and SEARCH ONLY, required for these two
     verbs except in the two cases named at the end of this item. LIST carries the
     full standard set (seven
     criteria): default page size/sort when none is specified; caller-specified
     page number/size and sort field/direction; pagination navigation controls
     (first/previous/next/last, with next disabled/absent on the last page and
     previous disabled/absent on the first); column sort toggle (ascending on
     first selection, descending on reselection, active sort indicated); sort
     preserved across page navigation; sort change resets to the first
     page while preserving the active page size; and page size change
     re-paginates from the first page while preserving the active sort. SEARCH
     carries only three search-specific criteria — default
     page/sort applied to the matched set; the active search term surviving
     page/sort navigation; and a new search term resetting to the first page of
     the new matched set — and does NOT restate LIST's navigation-control and
     sort-toggle criteria, since the result table behaves identically to LIST's
     there. Two related cases deliberately live elsewhere: a page number beyond
     the last page is a Boundary Values edge case (EC group 2), and an empty
     result set is an Explicit UI/UX Requirements criterion — the empty-state
     message — not an edge case at all. Neither belongs in this group
     TWO EXCEPTIONS to "required", and only these two — each one has to be stated
     by the story itself, never assumed by the author:
       (a) The feature deliberately does not paginate this list. Omit the four
           paging criteria (default page and sort, requested page and size, page
           navigation controls, page size change) and the two that couple sorting
           to paging (sort preserved across pages, sort change resets page), since
           with no pages they assert nothing. Keep in this group whatever ordering
           behaviour the story does state — a default order for the whole list,
           and the column sort toggle if a column is sortable — because sorting
           belongs to this group even where paging does not. Leave an HTML comment
           naming the omitted criteria and quoting the story's own words and the
           record volume the decision assumes. Only where the story states no
           ordering at all is the group genuinely empty: then omit it entirely,
           with the same comment.
       (b) The list paginates but has no sortable column — its order is fixed and
           no actor can change it. Keep the four paging criteria (default page and
           sort, requested page and size, page navigation controls, page size
           change) and omit the three sorting ones (column sort toggle, sort
           preserved across pages, sort change resets page) with an HTML comment
           naming them and stating the list's fixed order. In this case the
           requested-page criterion drops its sort field/direction clause, and the
           page-size criterion states that the records keep the list's default
           order instead of preserving an active sort.
     Anything else keeps the full set. A story that simply forgot to specify
     paging or sorting is not an exception — it is a gap to raise
  4. Data Inputs & Expected Outputs — the exact captured/returned fields and
     immediate system outputs (e.g. audit trail) not already covered by group 1's
     Then clause
  5. Explicit UI/UX Requirements — observable interface constraints — only if the
     US actually specifies one

EC GROUP ORDER (fixed per verb, always in this sequence — same omit-if-empty rule):
  1. Access Control — the request-pipeline gate that runs before any of the groups
     below even see the input. Always check all three; omit only the specific
     one(s) genuinely not applicable to this US, not the whole group:
       a. Authentication — is the caller a valid, logged-in session at all
       b. Role Authorization — does the caller's role permit this specific action.
          Enforced at two independent layers: UI (the action/record is not offered
          to a disallowed role) and API (the backend independently rejects the
          request even if called directly). UI hiding is a UX convenience only,
          never the sole enforcement — the API check is authoritative
       c. Data Authorization (tenant/ownership scope) — in a multi-tenant or
          Workspace/Brand-scoped setting, does the caller's own scope cover the
          record being acted on. For List/Search this is a filtering guarantee
          (the returned set never includes another tenant's records), not a
          rejection. For Create/Update/Delete of one specific record, an existing
          record the caller has no access to is rejected the same way as a
          non-existent record, so the response never confirms another tenant's
          record exists
  2. Boundary Values — extreme/edge-of-range input the happy path doesn't exercise.
     For List/Search this includes a page number beyond the last page and a page
     size at its minimum/maximum. Distinct from a plain missing-required-field
     case, which belongs in AC Standard Business Rules because a normal user can
     trigger it without trying. Genuinely thin for Delete and View, which take no
     data input beyond the target identifier — omit rather than force a row
  3. State Conflicts — actions out of order or concurrent: double-submit, a race
     between two actors on the same record, or a record mutated/removed by someone
     else mid-operation (e.g. mid-pagination, mid-edit, mid-delete)
  4. Missing Dependencies / Missing Foreign Keys — the operation references an
     entity by ID that does not exist. Realized differently per verb: for Create,
     a referenced related entity; for Update/Delete, the target record itself no
     longer exists (already deleted); for List/Search, an explicit parent-scope
     parameter. Omit when the verb takes no such reference — e.g. a List/Search
     scoped only by the caller's own session, with no parameter
  5. Graceful Degradation — infrastructure failure during the operation (the
     write, or the query, fails mid-flight) — must state atomicity/consistency: no
     partial write, no orphaned side-effect (e.g. audit entry), no partial page of
     results silently presented as complete

Numbering stays flat and sequential across all groups in both blocks per User Story
(AC-01, AC-02... never restarts per group; same for EC-01, EC-02...) so
cross-references like "PM-US-02 AC-03" stay stable if a group's content count
changes.

GWT FORMATTING: identical hard-break rules as spec-template.md — every unfinished
line (the ID+desc line, Given, and, When, Then) ends with 2 trailing spaces so
GitHub/Bitbucket render a line break instead of collapsing into one paragraph. Only
the final line of each bullet (the one ending in a period) skips the trailing spaces.

"and" INDENT RENDERING: every "and" continuation line carries both a plain 4-space
leading indent (2 spaces past Given/When/Then's own 2-space indent — for anyone
reading the raw .md source) AND a literal "&nbsp;&nbsp;" immediately before
"**and**". The plain leading spaces are collapsed by most renderers (GitHub,
Bitbucket, Google Docs) since they're mid-paragraph continuation lines, not list
indentation — only the &nbsp;&nbsp; actually survives rendering as a visible
2-character offset. Keep both when adding a new "and" line; dropping the &nbsp;
pair silently reintroduces the flush-left rendering bug.

ACCESS CONTROL vs. TEST-CASE ARTIFACTS: the Access Control group here stays at
spec-level, WHAT-only altitude — which role(s) may perform this action and what
scope boundary applies. It is not the place for HTTP status codes, endpoint paths,
token formats, or a full per-endpoint status-code matrix; that level of detail
belongs in your project's test-case / API-contract artifacts, verified once per
feature against its route and auth summary, not re-derived per User Story here.
-->

# AC-EC Template — "Create, List/ Search/ View, Update, Delete" USs

### 01. Create a `<Domain Entity>` (Roles)

**As a** `[ROLE]`, **I want to** create a new [Entity] **so that** [value].

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — [short desc]:**  
  **Given** [actor] is on the Create [Entity] form,  
  **When** they enter all required fields and submit,  
  **Then** the new [Entity] is saved,  
    &nbsp;&nbsp;**and** it appears in the [Entity] list immediately,  
    &nbsp;&nbsp;**and** it becomes available for [downstream use, e.g. assignment/reference].

**Standard Business Rules**

- **AC-02 — [short desc]:**  
  **Given** a [Entity] with the same [unique key] already exists,  
  **When** [actor] submits a new [Entity] with a conflicting value,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.
- **AC-03 — [short desc]:**  
  **Given** [actor] is on the Create [Entity] form,  
  **When** they submit with a required field left blank,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.

**Data Inputs & Expected Outputs**

- **AC-04 — [short desc]:**  
  **Given** creation succeeds,  
  **When** the [Entity] is persisted,  
  **Then** [the specific fields] are stored exactly as entered,  
    &nbsp;&nbsp;**and** [the specific immediate output, e.g. an audit entry is written with actor identity and timestamp].

**Explicit UI/UX Requirements**

- **AC-05 — [short desc]:**  
  **Given** [a required field is empty / a precondition is unmet],  
  **When** [actor] interacts with the form,  
  **Then** [an observable interface constraint, e.g. the submit control stays disabled / an inline error appears next to the field].

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to create a [Entity] is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no record is created.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated [actor] whose role does not permit creating a [Entity] — the interface does not offer this action to that role,  
  **When** they attempt a direct request to create a [Entity],  
  **Then** the request is rejected by the API independently of the interface,  
    &nbsp;&nbsp;**and** no record is created.
- **EC-03 — Cross-tenant data scope violation rejected:**  
  **Given** an authenticated [actor] scoped to one [tenant/Workspace],  
  **When** they attempt to create a [Entity] referencing or scoped to a different [tenant/Workspace],  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no record is created,  
    &nbsp;&nbsp;**and** no data belonging to the other [tenant/Workspace] is exposed.

**Boundary Values**

- **EC-04 — [short desc]:**  
  **Given** [actor] enters an extreme/edge-of-range value for a field, e.g. whitespace-only text or a value at the maximum permitted length,  
  **When** they submit,  
  **Then** the value is rejected with a validation error, matching the documented boundary behavior.

**State Conflicts**

- **EC-05 — [short desc]:**  
  **Given** two actors submit conflicting creates at nearly the same time, or one actor double-submits,  
  **When** both/all requests are processed,  
  **Then** exactly one creation succeeds,  
    &nbsp;&nbsp;**and** the other(s) receive a validation/conflict error,  
    &nbsp;&nbsp;**and** no duplicate record exists.

**Missing Dependencies / Missing Foreign Keys**

- **EC-06 — [short desc]:**  
  **Given** the create payload references another entity by ID,  
    &nbsp;&nbsp;**and** that referenced entity does not exist,  
  **When** [actor] submits,  
  **Then** a not-found/validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.

**Graceful Degradation**

- **EC-07 — [short desc]:**  
  **Given** the underlying data store becomes unavailable during the create operation,  
  **When** [actor] submits,  
  **Then** [actor] sees an error,  
    &nbsp;&nbsp;**and** no partial record is left behind,  
    &nbsp;&nbsp;**and** no dependent side-effect (e.g. audit entry) is recorded for the failed attempt.

---

### 02. List `<Domain Entities>` (Roles)

**As a** `[ROLE]`, **I want to** view a list of [Entities] **so that** [value].

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — [short desc]:**  
  **Given** [actor] navigates to the [Entity] list,  
  **When** the list loads,  
  **Then** all [Entities] within [actor]'s scope are displayed,  
    &nbsp;&nbsp;**and** each entry shows [key summary fields].

**Standard Business Rules**

- **AC-02 — [short desc]:**  
  **Given** [Entities] exist across more than one [tenant/Workspace],  
  **When** [actor] views the list,  
  **Then** only [Entities] within [actor]'s own [tenant/Workspace] are included.

**Pagination & Sorting Behavior**

- **AC-03 — Default page and sort:**  
  **Given** more [Entities] exist than fit on one page,  
  **When** [actor] views the list with no page or sort specified,  
  **Then** the first page is returned with a default page size of 20 and this list's default sort order,  
    &nbsp;&nbsp;**and** the total record count and the total number of pages are indicated.
- **AC-04 — Requested page and sort:**  
  **Given** [actor] specifies a page number, a page size, and a sort field and direction,  
  **When** the list is requested,  
  **Then** the [Entities] are returned on the requested page,  
    &nbsp;&nbsp;**and** ordered by the requested sort field and direction.
- **AC-05 — Page navigation controls:**  
  **Given** the [Entities] span more than one page,  
  **When** [actor] views the list,  
  **Then** pagination controls show the current page and the total record count, with navigation to the first, previous, next, and last pages,  
    &nbsp;&nbsp;**and** the next control is disabled or absent on the last page,  
    &nbsp;&nbsp;**and** the previous control is disabled or absent on the first page.
- **AC-06 — Column sort toggle:**  
  **Given** [actor] is viewing the list and a sortable column is not the active sort,  
  **When** they select that column,  
  **Then** the [Entities] are ordered by that column ascending,  
    &nbsp;&nbsp;**and** selecting the same column again reverses the order to descending,  
    &nbsp;&nbsp;**and** the active sort column and direction are indicated.
- **AC-07 — Sort preserved across pages:**  
  **Given** [actor] has sorted by a column other than the default,  
  **When** they navigate to another page,  
  **Then** the same sort column and direction remain applied.
- **AC-08 — Sort change resets page:**  
  **Given** [actor] is viewing a page other than the first,  
  **When** they change the sort column or the sort direction,  
  **Then** the first page of the list under the new sort is returned,  
    &nbsp;&nbsp;**and** the active page size remains applied.
- **AC-09 — Page size change:**  
  **Given** [actor] is viewing a paginated list,  
  **When** they change the page size using the list's page-size control,  
  **Then** the list is paginated again from the first page using the new page size,  
    &nbsp;&nbsp;**and** the active sort column and direction remain applied.

**Data Inputs & Expected Outputs**

- **AC-10 — [short desc]:**  
  **Given** the list is returned,  
  **When** [actor] views it,  
  **Then** each entry includes [the specific fields].

**Explicit UI/UX Requirements**

- **AC-11 — [short desc]:**  
  **Given** zero [Entities] exist within [actor]'s scope,  
  **When** [actor] views the list,  
  **Then** an empty-state message is shown instead of an empty table,  
    &nbsp;&nbsp;**and** no error is raised.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to list [Entities] is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no [Entity] data is returned.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated [actor] whose role does not permit listing [Entities] — the interface does not offer this view to that role,  
  **When** they attempt a direct request to list [Entities],  
  **Then** the request is rejected by the API independently of the interface.
- **EC-03 — Cross-tenant data scope violation prevented:**  
  **Given** [Entities] exist in a [tenant/Workspace] [actor] is not scoped to,  
  **When** [actor] requests the list,  
  **Then** no [Entity] belonging to that other [tenant/Workspace] appears anywhere in the results, regardless of page or sort parameters used.

**Boundary Values**

- **EC-04 — [short desc]:**  
  **Given** [actor] requests a page number beyond the last available page,  
  **When** the list is requested,  
  **Then** an empty page is returned,  
    &nbsp;&nbsp;**and** no error is raised.
- **EC-05 — [short desc]:**  
  **Given** [actor] requests a page size at or beyond the maximum permitted value,  
  **When** the list is requested,  
  **Then** the page size is capped at the documented maximum,  
    &nbsp;&nbsp;**and** the response reflects the capped size.

**State Conflicts**

- **EC-06 — [short desc]:**  
  **Given** an [Entity] is removed by another actor while [actor] is paging through the list,  
  **When** [actor] navigates to the next page,  
  **Then** pagination remains consistent,  
    &nbsp;&nbsp;**and** no remaining [Entity] is skipped or duplicated because of the removal.

**Missing Dependencies / Missing Foreign Keys**

- **EC-07 — [short desc]:**  
  **Given** the list is scoped by an explicit parent reference supplied as input,  
    &nbsp;&nbsp;**and** that parent does not exist,  
  **When** [actor] requests the list,  
  **Then** a not-found/validation error is shown.

**Graceful Degradation**

- **EC-08 — [short desc]:**  
  **Given** the underlying data store becomes unavailable while fetching the list,  
  **When** [actor] requests it,  
  **Then** [actor] sees an error,  
    &nbsp;&nbsp;**and** no partial or incomplete page is shown as if it were complete.

---

### 03. Search `<Domain Entities>` (Roles)

**As a** `[ROLE]`, **I want to** search for [Entities] by [searchable fields] **so that** [value].

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — [short desc]:**  
  **Given** [actor] is on the [Entity] list with a search field,  
  **When** they enter a search term that matches one or more [Entities],  
  **Then** only the matching [Entities] are displayed,  
    &nbsp;&nbsp;**and** each entry shows [key summary fields].

**Standard Business Rules**

- **AC-02 — [short desc]:**  
  **Given** [Entities] exist across more than one [tenant/Workspace],  
  **When** [actor] searches,  
  **Then** only matching [Entities] within [actor]'s own [tenant/Workspace] are included.
- **AC-03 — [short desc]:**  
  **Given** [actor] enters a search term,  
  **When** the search is applied,  
  **Then** it matches against [the specific searchable fields], case-insensitively.

**Pagination & Sorting Behavior**

- **AC-04 — Default page and sort:**  
  **Given** a search returns more [Entities] than fit on one page,  
  **When** no page or sort is specified,  
  **Then** the first page of matching results is returned with a default page size of 20 and this list's default sort order,  
    &nbsp;&nbsp;**and** the total matched count and the total number of pages are indicated.
- **AC-05 — Search preserved across pages:**  
  **Given** [actor] has an active search term and is viewing a page of results,  
  **When** they navigate to another page or change the sort field,  
  **Then** the same search term remains active,  
    &nbsp;&nbsp;**and** the newly requested page and sort are applied to the same matched set.
- **AC-06 — New search resets page:**  
  **Given** [actor] has an active sort and is viewing a page of results other than the first,  
  **When** they submit a different search term,  
  **Then** the first page of the new matched set is returned,  
    &nbsp;&nbsp;**and** the active sort column and direction remain applied,  
    &nbsp;&nbsp;**and** the total matched count and the total number of pages are recalculated for the new term.

**Data Inputs & Expected Outputs**

- **AC-07 — [short desc]:**  
  **Given** a search is submitted,  
  **When** the results are returned,  
  **Then** the search term is applied as entered,  
    &nbsp;&nbsp;**and** each returned entry includes [the specific fields].

**Explicit UI/UX Requirements**

- **AC-08 — [short desc]:**  
  **Given** [actor]'s search term matches no [Entities],  
  **When** the search is applied,  
  **Then** an empty-state message indicating no matching results is shown.
- **AC-09 — [short desc]:**  
  **Given** [actor] clears the search field,  
  **When** the field becomes empty,  
  **Then** the full, unfiltered, paginated [Entity] list is restored.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a search request is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no [Entity] data is returned.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated [actor] whose role does not permit searching [Entities] — the interface does not offer this capability to that role,  
  **When** they attempt a direct search request,  
  **Then** the request is rejected by the API independently of the interface.
- **EC-03 — Cross-tenant data scope violation prevented:**  
  **Given** [Entities] exist in a [tenant/Workspace] [actor] is not scoped to,  
  **When** [actor] searches with a term that would otherwise match them,  
  **Then** no [Entity] belonging to that other [tenant/Workspace] appears in the results.

**Boundary Values**

- **EC-04 — [short desc]:**  
  **Given** [actor] enters a search term far longer than any realistic value for the searched field,  
  **When** the search is submitted,  
  **Then** the search completes normally and returns no matches rather than erroring.
- **EC-05 — [short desc]:**  
  **Given** a search's matched results span fewer pages than requested,  
  **When** [actor] requests a page beyond the last matched page,  
  **Then** an empty page is returned,  
    &nbsp;&nbsp;**and** no error is raised.

**State Conflicts**

- **EC-06 — [short desc]:**  
  **Given** a matching [Entity] is removed by another actor while [actor] is paging through search results,  
  **When** [actor] navigates to the next page,  
  **Then** pagination remains consistent,  
    &nbsp;&nbsp;**and** no remaining matched [Entity] is skipped or duplicated.

**Missing Dependencies / Missing Foreign Keys**

- **EC-07 — [short desc]:**  
  **Given** the search is scoped by an explicit parent reference supplied as input,  
    &nbsp;&nbsp;**and** that parent does not exist,  
  **When** [actor] searches,  
  **Then** a not-found/validation error is shown.

**Graceful Degradation**

- **EC-08 — [short desc]:**  
  **Given** the underlying data store becomes unavailable while a search is submitted,  
  **When** the query fails,  
  **Then** [actor] sees an error,  
    &nbsp;&nbsp;**and** no partial or incomplete result set is shown as if it were complete.

---

### 04. View a `<Domain Entity>` (Roles)

**As a** `[ROLE]`, **I want to** view the full detail of a [Entity] **so that** [value].

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — [short desc]:**  
  **Given** [actor] selects a [Entity] within their scope,  
  **When** the detail view loads,  
  **Then** all of its fields and related data are displayed.

**Data Inputs & Expected Outputs**

- **AC-02 — [short desc]:**  
  **Given** the detail is returned,  
  **When** [actor] views it,  
  **Then** it includes [the specific fields, including any related/derived data not shown in the List/Search view].

**Explicit UI/UX Requirements**

- **AC-03 — [short desc]:**  
  **Given** a [Entity] has zero [related child records],  
  **When** [actor] views its detail,  
  **Then** those sections show an empty state without error.
- **AC-04 — [short desc]:**  
  **Given** [actor] is viewing a [Entity]'s detail,  
  **When** the page renders,  
  **Then** navigation to the available actions, e.g. Update or Delete, is offered directly from the view.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to view a [Entity] is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no data is returned.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated [actor] whose role does not permit viewing a [Entity] — the interface does not offer this view to that role,  
  **When** they attempt a direct request to view it,  
  **Then** the request is rejected by the API independently of the interface.
- **EC-03 — Cross-tenant view rejected without confirming existence:**  
  **Given** a [Entity] exists in a [tenant/Workspace] [actor] is not scoped to,  
  **When** [actor] attempts to view it,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no response confirms whether a [Entity] with that ID exists in another [tenant/Workspace].

**State Conflicts**

- **EC-04 — [short desc]:**  
  **Given** a [Entity] is updated by another actor while [actor]'s View page for it stays open,  
  **When** [actor] continues viewing without reloading,  
  **Then** the displayed detail may be stale until they reload,  
    &nbsp;&nbsp;**and** no error is raised by the stale display itself.

**Missing Dependencies / Missing Foreign Keys**

- **EC-05 — [short desc]:**  
  **Given** the target [Entity] does not exist, e.g. it was deleted or the ID is invalid,  
  **When** [actor] requests to view it,  
  **Then** a not-found error is shown.

**Graceful Degradation**

- **EC-06 — [short desc]:**  
  **Given** the underlying data store becomes unavailable while fetching the detail,  
  **When** [actor] requests it,  
  **Then** [actor] sees an error,  
    &nbsp;&nbsp;**and** no partial or incorrect detail is shown as if it were complete.

---

### 05. Update a `<Domain Entity>` (Roles)

**As a** `[ROLE]`, **I want to** update a [Entity]'s [fields] **so that** [value].

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — [short desc]:**  
  **Given** [actor] is on the Update [Entity] form for an existing [Entity],  
  **When** they change one or more fields and submit,  
  **Then** the [Entity] is updated,  
    &nbsp;&nbsp;**and** the new values are reflected immediately in the [Entity] list and detail view.

**Standard Business Rules**

- **AC-02 — [short desc]:**  
  **Given** another [Entity] already has the [unique key] value being submitted,  
  **When** [actor] updates a [Entity] to that conflicting value,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no change is saved.
- **AC-03 — [short desc]:**  
  **Given** [actor] submits the Update form with values identical to the [Entity]'s current values,  
  **When** they submit,  
  **Then** the update is accepted,  
    &nbsp;&nbsp;**and** no audit log entry is written.
- **AC-04 — [short desc]:**  
  **Given** [actor] submits a change to only some fields,  
  **When** the update is processed,  
  **Then** those fields are updated,  
    &nbsp;&nbsp;**and** the fields not included keep their existing values.

**Data Inputs & Expected Outputs**

- **AC-05 — [short desc]:**  
  **Given** an update succeeds and at least one value actually changed,  
  **When** the audit entry is written,  
  **Then** it records [actor]'s identity, the old and new values of every changed field, and the update timestamp.

**Explicit UI/UX Requirements**

- **AC-06 — [short desc]:**  
  **Given** the Update form is opened with its current values pre-filled,  
  **When** no field has been changed yet,  
  **Then** the Save control stays disabled,  
    &nbsp;&nbsp;**and** it becomes enabled once at least one field differs from its original value.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to update a [Entity] is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no change is saved.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated [actor] whose role does not permit updating a [Entity] — the interface does not offer this action to that role,  
  **When** they attempt a direct request to update it,  
  **Then** the request is rejected by the API independently of the interface,  
    &nbsp;&nbsp;**and** no change is saved.
- **EC-03 — Cross-tenant update rejected without confirming existence:**  
  **Given** a [Entity] exists in a [tenant/Workspace] [actor] is not scoped to,  
  **When** [actor] attempts to update it,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no response confirms whether a [Entity] with that ID exists in another [tenant/Workspace].

**Boundary Values**

- **EC-04 — [short desc]:**  
  **Given** [actor] submits an extreme/edge-of-range value for a field being changed, e.g. whitespace-only text or a value at the maximum permitted length,  
  **When** they submit,  
  **Then** the value is rejected with a validation error,  
    &nbsp;&nbsp;**and** no change is saved.

**State Conflicts**

- **EC-05 — [short desc]:**  
  **Given** two actors open the Update form for the same [Entity] at nearly the same time and both submit changes,  
  **When** both submissions are processed,  
  **Then** [document the resolution: last-write-wins, or the second save is blocked with a conflict error].

**Missing Dependencies / Missing Foreign Keys**

- **EC-06 — [short desc]:**  
  **Given** the target [Entity] was deleted by another actor after [actor] opened its Update form but before they submitted,  
  **When** [actor] submits the update,  
  **Then** a not-found error is shown,  
    &nbsp;&nbsp;**and** no record is created or changed.

**Graceful Degradation**

- **EC-07 — [short desc]:**  
  **Given** the underlying data store becomes unavailable while [actor] submits an update,  
  **When** the persist operation fails,  
  **Then** [actor] sees an error,  
    &nbsp;&nbsp;**and** the [Entity]'s previously saved values remain unchanged,  
    &nbsp;&nbsp;**and** no audit log entry is written for the failed attempt.

---

### 06. Delete a `<Domain Entity>` (Roles)

> Per this project's CRUD convention (constitution / CLAUDE.md User Story Conventions), Delete is only for records created in error, with zero references; a record still in active use is deactivated via the Update User Story instead. AC-02 below states that zero-reference precondition explicitly — do not drop it when filling in the template.

**As a** `[ROLE]`, **I want to** delete a [Entity] that is no longer needed **so that** [value].

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — [short desc]:**  
  **Given** [actor] is viewing a [Entity] with zero [dependent records],  
  **When** they confirm its deletion,  
  **Then** the [Entity] is permanently removed,  
    &nbsp;&nbsp;**and** it no longer appears in the [Entity] list.

**Standard Business Rules**

- **AC-02 — [short desc]:**  
  **Given** a [Entity] has one or more [dependent records] associated with it,  
  **When** [actor] attempts to delete it,  
  **Then** deletion is blocked and an error identifying the blocking count is shown,  
    &nbsp;&nbsp;**and** the [Entity] remains in the list unchanged.

**Data Inputs & Expected Outputs**

- **AC-03 — [short desc]:**  
  **Given** a deletion succeeds,  
  **When** the audit entry is written,  
  **Then** it records [actor]'s identity, the deleted [Entity]'s identifying fields, and the deletion timestamp.

**Explicit UI/UX Requirements**

- **AC-04 — [short desc]:**  
  **Given** [actor] selects Delete on a [Entity],  
  **When** the deletion has not yet been confirmed,  
  **Then** the [Entity] is not deleted,  
    &nbsp;&nbsp;**and** an explicit confirmation step naming the [Entity] must be accepted before deletion proceeds.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to delete a [Entity] is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no record is removed.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated [actor] whose role does not permit deleting a [Entity] — the interface does not offer this action to that role,  
  **When** they attempt a direct request to delete it,  
  **Then** the request is rejected by the API independently of the interface,  
    &nbsp;&nbsp;**and** no record is removed.
- **EC-03 — Cross-tenant delete rejected without confirming existence:**  
  **Given** a [Entity] exists in a [tenant/Workspace] [actor] is not scoped to,  
  **When** [actor] attempts to delete it,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no response confirms whether a [Entity] with that ID exists in another [tenant/Workspace].

**State Conflicts**

- **EC-04 — [short desc]:**  
  **Given** two actors both confirm deletion of the same [Entity] at nearly the same time,  
  **When** both requests are processed,  
  **Then** exactly one deletion succeeds,  
    &nbsp;&nbsp;**and** the other receives a not-found/already-deleted response rather than a second deletion or an error implying data loss.

**Missing Dependencies / Missing Foreign Keys**

- **EC-05 — [short desc]:**  
  **Given** a [Entity] was already deleted, by another actor or in an earlier request, before this request arrives,  
  **When** [actor] attempts to delete it again,  
  **Then** a not-found error is shown,  
    &nbsp;&nbsp;**and** no audit entry is written for this attempt.

**Graceful Degradation**

- **EC-06 — [short desc]:**  
  **Given** the underlying data store becomes unavailable while [actor] confirms deletion,  
  **When** the delete operation fails,  
  **Then** [actor] sees an error,  
    &nbsp;&nbsp;**and** the [Entity] is not removed,  
    &nbsp;&nbsp;**and** no audit log entry is written for the failed attempt.

---

## Worked examples

> All six examples below share one domain-agnostic world so they read as one coherent set: a `Workspace` (tenant boundary) contains `Project`s; each `Project` can have `Task`s (used to give Delete's zero-references rule something real to block on, and to give View something worth displaying beyond the summary fields already shown in List/Search). `WORKSPACE_ADMIN` is scoped to exactly one Workspace and is the sole actor for all six stories below (per the constitution's "one story, one actor" rule); `MEMBER` is a lower-privileged role in the same Workspace, used only as the negative case in Role Authorization checks. None of this is tied to any specific project's real data model — swap the nouns and roles for your own.

### 01. Create a Project (`WORKSPACE_ADMIN`)

**As a** `WORKSPACE_ADMIN`, **I want to** create a new Project within my Workspace **so that** my team can start organizing work under it.

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — Successful project creation:**  
  **Given** a `WORKSPACE_ADMIN` is on the Create Project form for their Workspace,  
  **When** they enter a unique project name and a description and submit,  
  **Then** the new Project is saved,  
    &nbsp;&nbsp;**and** it appears in the Workspace's project list immediately,  
    &nbsp;&nbsp;**and** it becomes available for team members to be added to it.

**Standard Business Rules**

- **AC-02 — Duplicate project name within Workspace rejected:**  
  **Given** a Project with a given name already exists within the same Workspace,  
  **When** a `WORKSPACE_ADMIN` submits a new Project with the same name in any capitalisation,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.
- **AC-03 — Missing project name rejected:**  
  **Given** a `WORKSPACE_ADMIN` is on the Create Project form,  
  **When** they submit with an empty project name,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.

**Data Inputs & Expected Outputs**

- **AC-04 — Captured fields and audit trail:**  
  **Given** a creation succeeds,  
  **When** the Project is persisted,  
  **Then** the project name and description are stored exactly as entered,  
    &nbsp;&nbsp;**and** an audit log entry is written recording the `WORKSPACE_ADMIN`'s identity, the parent Workspace, and the creation timestamp.

**Explicit UI/UX Requirements**

- **AC-05 — Save control disabled until required fields are filled:**  
  **Given** the project name field is empty,  
  **When** the `WORKSPACE_ADMIN` views the Create Project form,  
  **Then** the Save control stays disabled,  
    &nbsp;&nbsp;**and** it becomes enabled only once a non-blank project name is entered.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to create a Project is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no record is created.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated `MEMBER` — the interface does not offer this action to that role, since creating a Project is `WORKSPACE_ADMIN`-only,  
  **When** they attempt a direct request to create a Project,  
  **Then** the request is rejected by the API independently of the interface,  
    &nbsp;&nbsp;**and** no record is created.
- **EC-03 — Cross-tenant data scope violation rejected:**  
  **Given** a `WORKSPACE_ADMIN` scoped to one Workspace,  
  **When** they attempt to create a Project under a different Workspace they are not assigned to,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no record is created,  
    &nbsp;&nbsp;**and** no data belonging to the other Workspace is exposed.

**Boundary Values**

- **EC-04 — Whitespace-only project name:**  
  **Given** a `WORKSPACE_ADMIN` is on the Create Project form,  
  **When** they submit a project name containing only whitespace characters,  
  **Then** the name is treated as empty,  
    &nbsp;&nbsp;**and** a validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.
- **EC-05 — Project name at maximum permitted length:**  
  **Given** a `WORKSPACE_ADMIN` enters a project name at or beyond the maximum permitted length,  
  **When** they submit,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.

**State Conflicts**

- **EC-06 — Concurrent creation with the same name:**  
  **Given** two `WORKSPACE_ADMIN`s submit a create request with the same project name in the same Workspace at nearly the same time,  
  **When** both submissions are processed,  
  **Then** exactly one Project is created,  
    &nbsp;&nbsp;**and** the other submission receives a duplicate-name validation error.

**Missing Dependencies / Missing Foreign Keys**

- **EC-07 — Referenced Workspace does not exist:**  
  **Given** the create request references a Workspace by ID,  
    &nbsp;&nbsp;**and** that Workspace no longer exists, e.g. it was deleted between page load and submission,  
  **When** the `WORKSPACE_ADMIN` submits,  
  **Then** a not-found/validation error is shown,  
    &nbsp;&nbsp;**and** no record is created.

**Graceful Degradation**

- **EC-08 — Data store unavailable during creation:**  
  **Given** the underlying data store becomes unavailable while a `WORKSPACE_ADMIN` submits the Create Project form,  
  **When** the persist operation fails,  
  **Then** the `WORKSPACE_ADMIN` sees an error,  
    &nbsp;&nbsp;**and** no partial Project record is created,  
    &nbsp;&nbsp;**and** no audit log entry is written for the failed attempt.

---

### 02. List Projects (`WORKSPACE_ADMIN`)

**As a** `WORKSPACE_ADMIN`, **I want to** view a list of Projects in my Workspace **so that** I can see everything my team is working on.

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — Successful project list retrieval:**  
  **Given** a `WORKSPACE_ADMIN` navigates to the Project list for their Workspace,  
  **When** the list loads,  
  **Then** all Projects belonging to their Workspace are displayed,  
    &nbsp;&nbsp;**and** each entry shows the project name, description, and Task count.

**Standard Business Rules**

- **AC-02 — Results scoped to caller's own Workspace:**  
  **Given** Projects exist across multiple Workspaces,  
  **When** a `WORKSPACE_ADMIN` views the Project list,  
  **Then** only Projects belonging to their own Workspace are included,  
    &nbsp;&nbsp;**and** no Project belonging to another Workspace appears in the results.

**Pagination & Sorting Behavior**

- **AC-03 — Default page and sort:**  
  **Given** more Projects exist than fit on one page,  
  **When** a `WORKSPACE_ADMIN` views the list with no page or sort specified,  
  **Then** the first page is returned with a default page size of 20 and the default sort order, by project name,  
    &nbsp;&nbsp;**and** the total Project count and the total number of pages are indicated.
- **AC-04 — Requested page and sort:**  
  **Given** a `WORKSPACE_ADMIN` specifies a page number, a page size, and a sort field and direction,  
  **When** the Project list is requested,  
  **Then** the Projects are returned on the requested page,  
    &nbsp;&nbsp;**and** ordered by the requested sort field and direction.
- **AC-05 — Page navigation controls:**  
  **Given** the Projects span more than one page,  
  **When** a `WORKSPACE_ADMIN` views the list,  
  **Then** pagination controls show the current page and the total Project count, with navigation to the first, previous, next, and last pages,  
    &nbsp;&nbsp;**and** the next control is disabled or absent on the last page,  
    &nbsp;&nbsp;**and** the previous control is disabled or absent on the first page.
- **AC-06 — Column sort toggle:**  
  **Given** a `WORKSPACE_ADMIN` is viewing the list and a sortable column is not the active sort,  
  **When** they select that column,  
  **Then** the Projects are ordered by that column ascending,  
    &nbsp;&nbsp;**and** selecting the same column again reverses the order to descending,  
    &nbsp;&nbsp;**and** the active sort column and direction are indicated.
- **AC-07 — Sort preserved across pages:**  
  **Given** a `WORKSPACE_ADMIN` has sorted by a column other than project name,  
  **When** they navigate to another page,  
  **Then** the same sort column and direction remain applied.
- **AC-08 — Sort change resets page:**  
  **Given** a `WORKSPACE_ADMIN` is viewing a page other than the first,  
  **When** they change the sort column or the sort direction,  
  **Then** the first page of the Project list under the new sort is returned,  
    &nbsp;&nbsp;**and** the active page size remains applied.
- **AC-09 — Page size change:**  
  **Given** a `WORKSPACE_ADMIN` is viewing a paginated Project list,  
  **When** they change the page size using the list's page-size control,  
  **Then** the list is paginated again from the first page using the new page size,  
    &nbsp;&nbsp;**and** the active sort column and direction remain applied.

**Data Inputs & Expected Outputs**

- **AC-10 — Captured summary fields per entry:**  
  **Given** the Project list is returned,  
  **When** a `WORKSPACE_ADMIN` views it,  
  **Then** each entry includes the project name, description, Task count, and creation date.

**Explicit UI/UX Requirements**

- **AC-11 — Empty-state message for a Workspace with no Projects:**  
  **Given** the Workspace has zero Projects,  
  **When** a `WORKSPACE_ADMIN` views the Project list,  
  **Then** an empty-state message is shown instead of an empty table,  
    &nbsp;&nbsp;**and** no error is raised.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to list Projects is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no Project data is returned.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated `MEMBER` — the interface does not offer this view to that role, since listing Projects is `WORKSPACE_ADMIN`-only for this US,  
  **When** they attempt a direct request to list Projects,  
  **Then** the request is rejected by the API independently of the interface.
- **EC-03 — Cross-tenant data scope violation prevented:**  
  **Given** Projects exist in a Workspace the `WORKSPACE_ADMIN` is not assigned to,  
  **When** they request the Project list,  
  **Then** no Project belonging to that other Workspace appears anywhere in the results, regardless of page or sort parameters used.

**Boundary Values**

- **EC-04 — Page number beyond the last page:**  
  **Given** a `WORKSPACE_ADMIN` requests a page number beyond the last available page,  
  **When** the list is requested,  
  **Then** an empty page is returned,  
    &nbsp;&nbsp;**and** no error is raised.
- **EC-05 — Page size at the maximum permitted limit:**  
  **Given** a `WORKSPACE_ADMIN` requests a page size at or beyond the maximum permitted value,  
  **When** the list is requested,  
  **Then** the page size is capped at the documented maximum,  
    &nbsp;&nbsp;**and** the response reflects the capped size.

**State Conflicts**

- **EC-06 — Project removed mid-pagination:**  
  **Given** a Project is deleted by another `WORKSPACE_ADMIN` while the first `WORKSPACE_ADMIN` is paging through the list,  
  **When** they navigate to the next page,  
  **Then** pagination remains consistent,  
    &nbsp;&nbsp;**and** no remaining Project is skipped or duplicated because of the removal.

<!-- Missing Dependencies / Missing Foreign Keys omitted — the Project list is
     scoped entirely by the caller's own Workspace membership, derived from their
     session; no parent reference is supplied as an explicit input for this US. -->

**Graceful Degradation**

- **EC-07 — Data store unavailable during list retrieval:**  
  **Given** the underlying data store becomes unavailable while a `WORKSPACE_ADMIN` requests the Project list,  
  **When** the query fails,  
  **Then** the `WORKSPACE_ADMIN` sees an error,  
    &nbsp;&nbsp;**and** no partial or incomplete page is shown as if it were complete.

---

### 03. Search Projects (`WORKSPACE_ADMIN`)

**As a** `WORKSPACE_ADMIN`, **I want to** search for a Project by name or description **so that** I can quickly find a specific Project without scrolling through the full list.

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — Successful search:**  
  **Given** a `WORKSPACE_ADMIN` is on the Project list with a search field,  
  **When** they enter a search term that matches one or more Projects,  
  **Then** only the matching Projects are displayed,  
    &nbsp;&nbsp;**and** each entry shows the project name, description, and Task count.

**Standard Business Rules**

- **AC-02 — Results scoped to caller's own Workspace:**  
  **Given** Projects exist across multiple Workspaces,  
  **When** a `WORKSPACE_ADMIN` searches,  
  **Then** only matching Projects belonging to their own Workspace are included.
- **AC-03 — Search matches name or description, case-insensitively:**  
  **Given** a `WORKSPACE_ADMIN` enters a search term,  
  **When** the search is applied,  
  **Then** it matches against the project name and description fields, case-insensitively.

**Pagination & Sorting Behavior**

- **AC-04 — Default page and sort:**  
  **Given** a search returns more Projects than fit on one page,  
  **When** no page or sort is specified,  
  **Then** the first page of matching results is returned with a default page size of 20 and the default sort order, by project name,  
    &nbsp;&nbsp;**and** the total matched count and the total number of pages are indicated.
- **AC-05 — Search preserved across pages:**  
  **Given** a `WORKSPACE_ADMIN` has an active search term and is viewing a page of results,  
  **When** they navigate to another page or change the sort field,  
  **Then** the same search term remains active,  
    &nbsp;&nbsp;**and** the newly requested page and sort are applied to the same matched set.
- **AC-06 — New search resets page:**  
  **Given** a `WORKSPACE_ADMIN` has an active sort and is viewing a page of results other than the first,  
  **When** they submit a different search term,  
  **Then** the first page of the new matched set is returned,  
    &nbsp;&nbsp;**and** the active sort column and direction remain applied,  
    &nbsp;&nbsp;**and** the total matched count and the total number of pages are recalculated for the new term.

**Data Inputs & Expected Outputs**

- **AC-07 — Captured search term and returned fields:**  
  **Given** a search is submitted,  
  **When** the results are returned,  
  **Then** the search term is applied as entered,  
    &nbsp;&nbsp;**and** each returned entry includes the project name, description, and Task count.

**Explicit UI/UX Requirements**

- **AC-08 — Empty-state message for no matches:**  
  **Given** a `WORKSPACE_ADMIN`'s search term matches no Projects,  
  **When** the search is applied,  
  **Then** an empty-state message indicating no matching results is shown.
- **AC-09 — Clearing the search restores the full list:**  
  **Given** a `WORKSPACE_ADMIN` clears the search field,  
  **When** the field becomes empty,  
  **Then** the full, unfiltered, paginated Project list is restored.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a search request is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no Project data is returned.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated `MEMBER` — the interface does not offer this capability to that role, since searching Projects is `WORKSPACE_ADMIN`-only for this US,  
  **When** they attempt a direct search request,  
  **Then** the request is rejected by the API independently of the interface.
- **EC-03 — Cross-tenant data scope violation prevented:**  
  **Given** Projects exist in a Workspace the `WORKSPACE_ADMIN` is not assigned to,  
  **When** they search with a term that would otherwise match one of those Projects,  
  **Then** no Project belonging to that other Workspace appears in the results.

**Boundary Values**

- **EC-04 — Extremely long search term:**  
  **Given** a `WORKSPACE_ADMIN` enters a search term far longer than any realistic project name or description,  
  **When** the search is submitted,  
  **Then** the search completes normally and returns no matches rather than erroring.
- **EC-05 — Page number beyond the last page of matched results:**  
  **Given** a search's matched results span fewer pages than requested,  
  **When** a `WORKSPACE_ADMIN` requests a page beyond the last matched page,  
  **Then** an empty page is returned,  
    &nbsp;&nbsp;**and** no error is raised.

**State Conflicts**

- **EC-06 — Matching Project removed mid-pagination:**  
  **Given** a matching Project is deleted by another `WORKSPACE_ADMIN` while the first is paging through search results,  
  **When** they navigate to the next page,  
  **Then** pagination remains consistent,  
    &nbsp;&nbsp;**and** no remaining matched Project is skipped or duplicated.

<!-- Missing Dependencies / Missing Foreign Keys omitted — same reasoning as List
     Projects: the search is scoped entirely by the caller's own Workspace
     membership, with no explicit parent-scope parameter for this US. -->

**Graceful Degradation**

- **EC-07 — Data store unavailable during search:**  
  **Given** the underlying data store becomes unavailable while a `WORKSPACE_ADMIN` submits a search,  
  **When** the query fails,  
  **Then** the `WORKSPACE_ADMIN` sees an error,  
    &nbsp;&nbsp;**and** no partial or incomplete result set is shown as if it were complete.

---

### 04. View a Project (`WORKSPACE_ADMIN`)

**As a** `WORKSPACE_ADMIN`, **I want to** view the full detail of a Project **so that** I can see everything about it, including its Tasks, before deciding to update or delete it.

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — Successful project detail retrieval:**  
  **Given** a `WORKSPACE_ADMIN` selects a Project within their Workspace,  
  **When** the detail view loads,  
  **Then** the project name, description, creation date, and its full list of Tasks are displayed.

**Data Inputs & Expected Outputs**

- **AC-02 — Captured detail fields:**  
  **Given** the Project detail is returned,  
  **When** a `WORKSPACE_ADMIN` views it,  
  **Then** it includes the project name, description, creation date, and every associated Task with its own name and status.

**Explicit UI/UX Requirements**

- **AC-03 — Empty state for a Project with no Tasks:**  
  **Given** a Project has zero Tasks,  
  **When** a `WORKSPACE_ADMIN` views its detail,  
  **Then** the Tasks section shows an empty state without error.
- **AC-04 — Navigation to Update and Delete offered from the detail view:**  
  **Given** a `WORKSPACE_ADMIN` is viewing a Project's detail,  
  **When** the page renders,  
  **Then** navigation to Update and Delete is offered directly from the view.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to view a Project is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no data is returned.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated `MEMBER` — the interface does not offer this view to that role, since viewing a Project's full detail is `WORKSPACE_ADMIN`-only for this US,  
  **When** they attempt a direct request to view it,  
  **Then** the request is rejected by the API independently of the interface.
- **EC-03 — Cross-tenant view rejected without confirming existence:**  
  **Given** a Project exists in a Workspace the `WORKSPACE_ADMIN` is not assigned to,  
  **When** they attempt to view it,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no response confirms whether a Project with that ID exists in another Workspace.

**State Conflicts**

- **EC-04 — Project updated while its detail view is open:**  
  **Given** a Project is updated by another `WORKSPACE_ADMIN` while the first `WORKSPACE_ADMIN`'s View page for it stays open,  
  **When** the first `WORKSPACE_ADMIN` continues viewing without reloading,  
  **Then** the displayed detail may be stale until they reload,  
    &nbsp;&nbsp;**and** no error is raised by the stale display itself.

**Missing Dependencies / Missing Foreign Keys**

- **EC-05 — Target Project does not exist:**  
  **Given** a Project was deleted, or the requested ID never corresponded to a Project,  
  **When** a `WORKSPACE_ADMIN` requests to view it,  
  **Then** a not-found error is shown.

**Graceful Degradation**

- **EC-06 — Data store unavailable during detail retrieval:**  
  **Given** the underlying data store becomes unavailable while a `WORKSPACE_ADMIN` requests a Project's detail,  
  **When** the query fails,  
  **Then** the `WORKSPACE_ADMIN` sees an error,  
    &nbsp;&nbsp;**and** no partial or incorrect detail is shown as if it were complete.

---

### 05. Update a Project (`WORKSPACE_ADMIN`)

**As a** `WORKSPACE_ADMIN`, **I want to** update a Project's name or description **so that** I can correct errors without losing its Task history.

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — Successful project update:**  
  **Given** a `WORKSPACE_ADMIN` is on the Update Project form for an existing Project,  
  **When** they change the name and/or description and submit,  
  **Then** the Project is updated,  
    &nbsp;&nbsp;**and** the new values are reflected immediately in the Project list and detail view.

**Standard Business Rules**

- **AC-02 — Duplicate name on rename rejected:**  
  **Given** another Project in the same Workspace already has a given name,  
  **When** a `WORKSPACE_ADMIN` renames a Project to that same name in any capitalisation,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no change is saved.
- **AC-03 — No-op update accepted silently:**  
  **Given** a `WORKSPACE_ADMIN` submits the Update form with values identical to the Project's current values,  
  **When** they submit,  
  **Then** the update is accepted,  
    &nbsp;&nbsp;**and** no audit log entry is written.
- **AC-04 — Only submitted fields are changed:**  
  **Given** a `WORKSPACE_ADMIN` submits a change to only the description,  
  **When** the update is processed,  
  **Then** the description is updated,  
    &nbsp;&nbsp;**and** the project name keeps its existing value unchanged.

**Data Inputs & Expected Outputs**

- **AC-05 — Audit trail captures old and new values:**  
  **Given** an update succeeds and at least one value actually changed,  
  **When** the audit entry is written,  
  **Then** it records the `WORKSPACE_ADMIN`'s identity, the old and new values of every changed field, and the update timestamp.

**Explicit UI/UX Requirements**

- **AC-06 — Save control disabled until a field is changed:**  
  **Given** the Update Project form is opened with its current values pre-filled,  
  **When** no field has been changed yet,  
  **Then** the Save control stays disabled,  
    &nbsp;&nbsp;**and** it becomes enabled once at least one field differs from its original value.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to update a Project is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no change is saved.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated `MEMBER` — the interface does not offer this action to that role, since updating a Project is `WORKSPACE_ADMIN`-only,  
  **When** they attempt a direct request to update it,  
  **Then** the request is rejected by the API independently of the interface,  
    &nbsp;&nbsp;**and** no change is saved.
- **EC-03 — Cross-tenant update rejected without confirming existence:**  
  **Given** a Project exists in a Workspace the `WORKSPACE_ADMIN` is not assigned to,  
  **When** they attempt to update it, e.g. by guessing or reusing an ID,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no response confirms whether a Project with that ID exists in another Workspace.

**Boundary Values**

- **EC-04 — Whitespace-only new name:**  
  **Given** a `WORKSPACE_ADMIN` submits a new project name containing only whitespace characters,  
  **When** submitted,  
  **Then** the name is treated as empty,  
    &nbsp;&nbsp;**and** a validation error is shown,  
    &nbsp;&nbsp;**and** no change is saved.
- **EC-05 — New name at maximum permitted length:**  
  **Given** a `WORKSPACE_ADMIN` enters a new project name at or beyond the maximum permitted length,  
  **When** submitted,  
  **Then** a validation error is shown,  
    &nbsp;&nbsp;**and** no change is saved.

**State Conflicts**

- **EC-06 — Concurrent edits to the same Project:**  
  **Given** two `WORKSPACE_ADMIN`s open the Update form for the same Project at nearly the same time and both submit changes,  
  **When** both submissions are processed,  
  **Then** the later save is applied,  
    &nbsp;&nbsp;**and** the earlier save is silently superseded, with no conflict error shown to either `WORKSPACE_ADMIN`.

**Missing Dependencies / Missing Foreign Keys**

- **EC-07 — Target Project no longer exists:**  
  **Given** a Project was deleted by another actor after a `WORKSPACE_ADMIN` opened its Update form but before they submitted,  
  **When** they submit the update,  
  **Then** a not-found error is shown,  
    &nbsp;&nbsp;**and** no record is created or changed.

**Graceful Degradation**

- **EC-08 — Data store unavailable during update:**  
  **Given** the underlying data store becomes unavailable while a `WORKSPACE_ADMIN` submits an update,  
  **When** the persist operation fails,  
  **Then** the `WORKSPACE_ADMIN` sees an error,  
    &nbsp;&nbsp;**and** the Project's previously saved values remain unchanged,  
    &nbsp;&nbsp;**and** no audit log entry is written for the failed attempt.

---

### 06. Delete a Project (`WORKSPACE_ADMIN`)

**As a** `WORKSPACE_ADMIN`, **I want to** delete a Project that was created in error **so that** the Project list stays accurate and uncluttered.

#### Acceptance Criteria

**Main Success Scenario**

- **AC-01 — Successful project deletion:**  
  **Given** a `WORKSPACE_ADMIN` is viewing a Project that has zero associated Tasks,  
  **When** they confirm its deletion,  
  **Then** the Project is permanently removed,  
    &nbsp;&nbsp;**and** it no longer appears in the Project list.

**Standard Business Rules**

- **AC-02 — Deletion blocked when Tasks are associated:**  
  **Given** a Project has one or more Tasks associated with it,  
  **When** a `WORKSPACE_ADMIN` attempts to delete it,  
  **Then** deletion is blocked and an error identifying the blocking Task count is shown,  
    &nbsp;&nbsp;**and** the Project remains in the list unchanged.

**Data Inputs & Expected Outputs**

- **AC-03 — Audit trail captures deleted record identity:**  
  **Given** a deletion succeeds,  
  **When** the audit entry is written,  
  **Then** it records the `WORKSPACE_ADMIN`'s identity, the deleted Project's name, and the deletion timestamp.

**Explicit UI/UX Requirements**

- **AC-04 — Explicit confirmation required before deletion:**  
  **Given** a `WORKSPACE_ADMIN` selects Delete on a Project,  
  **When** the deletion has not yet been confirmed,  
  **Then** the Project is not deleted,  
    &nbsp;&nbsp;**and** a confirmation step naming the Project must be explicitly accepted before deletion proceeds.

#### Edge Cases

**Access Control**

- **EC-01 — Unauthenticated request rejected:**  
  **Given** no valid authenticated session,  
  **When** a request to delete a Project is made,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no record is removed.
- **EC-02 — Unauthorized role rejected:**  
  **Given** an authenticated `MEMBER` — the interface does not offer this action to that role, since deleting a Project is `WORKSPACE_ADMIN`-only,  
  **When** they attempt a direct request to delete it,  
  **Then** the request is rejected by the API independently of the interface,  
    &nbsp;&nbsp;**and** no record is removed.
- **EC-03 — Cross-tenant delete rejected without confirming existence:**  
  **Given** a Project exists in a Workspace the `WORKSPACE_ADMIN` is not assigned to,  
  **When** they attempt to delete it,  
  **Then** the request is rejected,  
    &nbsp;&nbsp;**and** no response confirms whether a Project with that ID exists in another Workspace.

<!-- Boundary Values omitted — Delete takes no data-input fields beyond the target
     identifier; the only boundary-like condition, the target not existing, is
     already covered under Missing Dependencies / Missing Foreign Keys below. -->

**State Conflicts**

- **EC-04 — Concurrent delete of the same Project:**  
  **Given** two `WORKSPACE_ADMIN`s both confirm deletion of the same Project at nearly the same time,  
  **When** both requests are processed,  
  **Then** exactly one deletion succeeds,  
    &nbsp;&nbsp;**and** the other receives a not-found/already-deleted response rather than a second deletion or an error implying data loss.

**Missing Dependencies / Missing Foreign Keys**

- **EC-05 — Target Project already deleted:**  
  **Given** a Project was already deleted, by another actor or in an earlier request, before this request arrives,  
  **When** a `WORKSPACE_ADMIN` attempts to delete it again,  
  **Then** a not-found error is shown,  
    &nbsp;&nbsp;**and** no audit entry is written for this attempt.

**Graceful Degradation**

- **EC-06 — Data store unavailable during deletion:**  
  **Given** the underlying data store becomes unavailable while a `WORKSPACE_ADMIN` confirms deletion,  
  **When** the delete operation fails,  
  **Then** the `WORKSPACE_ADMIN` sees an error,  
    &nbsp;&nbsp;**and** the Project is not removed,  
    &nbsp;&nbsp;**and** no audit log entry is written for the failed attempt.
