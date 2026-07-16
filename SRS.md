# Personal Finance Management (PFM) - Software Requirements Specification (SRS)


| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 15-Jul-2026 | Homer Truong | Initial draft |

---

## Table of Contents

- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Assumptions and Constraints](#13-assumptions-and-constraints)
  - [1.4 Definitions and Acronyms](#14-definitions-and-acronyms)
  - [1.5 Roles and Actors](#15-roles-and-actors)
  - [1.6 Out of Scope](#16-out-of-scope)
  - [1.7 Related Documents](#17-related-documents)
- [2. Conceptual Domain Model](#2-conceptual-domain-model)
- [3. Functional Requirements (FR)](#3-functional-requirements-fr)
- [4. Non-Functional Requirements (NFR)](#4-non-functional-requirements-nfr)
- [5. User Experience Requirements (UXR)](#5-user-experience-requirements-uxr)
- [6. Business Flows](#6-business-flows)
- [7. Features and User Stories](#7-features-and-user-stories)
- [8. External Dependencies](#8-external-dependencies)

---

## 1. Introduction

### 1.1 Purpose

This document defines the Software Requirements Specification (SRS) for the Personal Finance Management (PFM) application.

The purpose of this SRS is to:
- Describe the Functional, Non-Functional and User eXperience Requirements (FR, NFR, UXR) of the PFM product from a real-world product perspective.
- Serve as a baseline requirements document that can evolve over time as the product grows.
- Provide a realistic example of how requirements are specified and maintained in professional software development.

This SRS represents the overall product vision and requirements, independent of any specific release or implementation phase.

### 1.2 Scope

PFM is a software product designed to help individuals manage their personal finances in a structured, transparent, and effective way.

The PFM system aims to support Users in:
- Recording and organizing financial transactions (income and expenses).
- Managing wallets, categories, budgets, financial goals, and investments.
- Understanding financial behavior through reports and dashboards.
- Making better financial decisions based on historical data and insights.

This SRS describes the complete functional scope of the PFM product, including features that may be delivered across multiple releases (e.g. MVP, 1st release, 2nd release, and beyond).

Within the context of this course, PFM is used as a case study product to demonstrate how a real software product is:
- Analyzed from User needs and business goals,
- Defined through structured requirements,
- Incrementally delivered using an MVP-first approach.

While the course focuses on building and demonstrating an MVP implementation, this SRS remains the authoritative requirements document that continues to evolve as the product matures.

### 1.3 Assumptions and Constraints

#### 1.3.1 Assumptions

- The primary Users are individuals managing their personal finances.
- Users have basic familiarity with digital applications.
- Financial data is primarily provided by Users, with optional extensions for integrations in future releases.
- The PFM product will be developed and delivered incrementally over time.

#### 1.3.2 Constraints

- This SRS describes the full product requirements, not all of which are implemented in the MVP.
- Feature availability may vary by release, depending on priorities, resources, and learning objectives.
- Regulatory compliance, external financial integrations, and advanced analytics may be introduced progressively in later releases.
- Design and implementation details are intentionally excluded and will be addressed in separate Software Design Specifications (SDS).

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| PFM | Personal Finance Management |
| MVP | Minimum Viable Product |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| UXR | User Experience Requirement |

### 1.5 Roles and Actors


| Role | Description | Example persona |
|------|-------------|-----------------|
| {ROLE} | {One-line description of what this actor does in the system} | {Real-world example} |

### 1.6 Out of Scope
The following are explicitly excluded from this specification:
- {Feature or capability not covered}
- {Integration excluded}
- {Assumption about what a later phase handles}

### 1.7 Related Documents


| Document | Location | Purpose |
|----------|----------|---------|
| SDS | {path or URL} | Software Design Specification — architecture and API design |
| RUNBOOK | {path or URL} | Operational guide — setup, deployment, troubleshooting |

---

## 2. Conceptual Domain Model

> This section defines the "Universe of Discourse" — the real-world entities, their relationships,
> and business rules governing them. It uses business terminology only; implementation details
> (DB types, PKs, API field names) belong in the SDS.
>
> **Sync obligation:** whenever a user story in §7 introduces, renames, or removes a domain
> concept, this section MUST be updated in the same PR. Record the last review below.
>
> **Last synced with §7 User Stories:** {YYYY-MM-DD}

### 2.1 Domain Diagram

```mermaid
classDiagram
    direction TB

    class User {
        <<AggregateRoot>>
    }
    class Wallet {
        <<AggregateRoot>>
    }
    class InvestmentPortfolio {
        <<AggregateRoot>>
    }
    class FinancialGoal {
        <<AggregateRoot>>
    }
    class Category {
        <<AggregateRoot>>
    }

    User "1" *-- "1" InvestmentPortfolio : owns
    User "1" *-- "0..n" Notification : receives
    User "1" *-- "0..n" Wallet : owns

    InvestmentPortfolio "1" *-- "0..n" Holding : contains

    Holding "0..n" --> "1" Asset : references

    Wallet "1" *-- "0..n" Transaction : records
    Wallet "1" *-- "0..n" Budget : defines

    Transaction "0..n" o-- "0..1" Category : classified by
    Transaction "0..n" --> "0..1" FinancialGoal : contributes to

    Budget "0..n" o-- "0..n" Category : scoped by

    Category "0..n" --> "1" Category : parent
```

> **Notation:**
> - `*--` Solid diamond (◆) — **Composition**: child cannot exist without parent (strict lifecycle).
> - `o--` Hollow diamond (◇) — **Aggregation**: child exists independently (loose reference).

>
> **Aggregate Roots:** User, Wallet, InvestmentPortfolio, FinancialGoal, and Category are the aggregate roots — each is the single entry point for its cluster of related entities, marked with `<<AggregateRoot>>` above.

### 2.2 Domain Entity 

| Entity | Description | Key Business Attributes | Ownership / Lifecycle |
|--------|-------------|-------------------------|-----------------------|
| User | A registered individual who uses the PFM system to manage their personal finances. | Full name, email, registration date | Independent — Aggregate Root; all personal financial data is anchored to this entity |
| Wallet | A named representation of a real-world financial account, cash reserve, or e-wallet that holds a current balance. | Name, type (cash / bank / e-wallet), current balance, currency, default flag | Owned by User — deleted when the User is deleted |
| Transaction | A financial event recorded against a Wallet, representing money flowing in (income) or out (expense). | Type (income / expense), amount, date, note, associated category | Part of Wallet — deleted when the Wallet is deleted |
| Category | A user-defined label used to classify Transactions and scope Budgets; may be organized hierarchically with a parent Category. | Name, applicable type (income / expense / both), parent category | Independent — Aggregate Root; persists independently of any Transaction or Budget |
| Budget | A spending limit set for one or more Categories within a Wallet for a specific time period, used to track and control expenses. | Period (e.g. monthly), limit amount, total spent, remaining amount | Part of Wallet — deleted when the Wallet is deleted |
| FinancialGoal | A savings or spending target that a User defines with a monetary goal and a deadline to work toward. | Name, target amount, target date, current progress amount | Independent — Aggregate Root; lifecycle managed explicitly by the User |
| InvestmentPortfolio | A single container per User that groups all investment Holdings and provides a high-level view of investment performance. | Name, total current value, portfolio settings | Part of User (1:1) — created when User registers, deleted when User is deleted |
| Holding | A single investment position inside an InvestmentPortfolio, representing an amount invested in a specific Asset. | Asset reference, quantity, purchase price, current value | Part of InvestmentPortfolio — deleted when the InvestmentPortfolio is deleted |
| Asset | A tradable or investable instrument (e.g. stock, fund, crypto) that can be referenced by one or more Holdings. | Name, ticker / symbol, asset type, current market price | Independent — shared reference; exists regardless of whether any Holding references it |
| Notification | A system-generated message that alerts the User to a relevant financial event or condition (e.g. budget limit reached). | Message content, notification type, read status, triggered date | Part of User — deleted when the User is deleted |

> **Tip:** "Key Business Attributes" are the properties a domain expert would use to describe the
> entity — e.g., for *Customer Session*: `product viewed, signals captured, intent score`.
> Avoid DB column names here.

### 2.3 Entity Relationship and Cardinality

| Subject | Verb Phrase | Object | Type | Cardinality | Constraint |
|---------|-------------|--------|------|-------------|------------|
| User | owns | Wallet | Composition | 1 User → 0..n Wallets | A Wallet belongs to exactly one User and is deleted when that User is deleted |
| User | owns | InvestmentPortfolio | Composition | 1 User → 1 InvestmentPortfolio | Exactly one portfolio per User; created on registration and deleted with the User |
| User | receives | Notification | Composition | 1 User → 0..n Notifications | Notifications are private to the User and deleted when the User is deleted |
| Wallet | records | Transaction | Composition | 1 Wallet → 0..n Transactions | A Transaction belongs to exactly one Wallet and is deleted when that Wallet is deleted |
| Wallet | defines | Budget | Composition | 1 Wallet → 0..n Budgets | A Budget belongs to exactly one Wallet and is deleted when that Wallet is deleted |
| InvestmentPortfolio | contains | Holding | Composition | 1 InvestmentPortfolio → 0..n Holdings | Holdings are deleted when the InvestmentPortfolio is deleted |
| Holding | references | Asset | Association | 0..n Holdings → 1 Asset | An Asset exists independently; a Holding must reference exactly one Asset but deleting the Holding does not affect the Asset |
| Transaction | classified by | Category | Aggregation | 0..n Transactions → 0..1 Category | Category assignment is optional; deleting a Category does not delete its Transactions (they become uncategorized) |
| Transaction | contributes to | FinancialGoal | Association | 0..n Transactions → 0..1 FinancialGoal | A FinancialGoal exists independently; a Transaction may optionally be linked to one Goal to track progress |
| Budget | scoped by | Category | Aggregation | 0..n Budgets → 0..n Categories | A Budget tracks spending across its associated Categories; deleting a Category does not delete the Budget |
| Category | child of | Category | Association | 0..n Categories → 1 parent Category | A Category may have at most one parent (sub-category hierarchy); root-level Categories have no parent |

> **Type** must match the diagram notation. A Composition row means the child row in §2.1 uses `*--`.

### 2.4 Business Rules

> Business rules are invariants that the system must always enforce, regardless of which feature or
> user story triggers them. They are distinct from acceptance criteria (which are story-specific).
> Each rule here should be traceable to at least one AC in §7 or one FR in §3.

| Rule ID | Statement | Entities Involved | Enforced In |
|---------|-----------|-------------------|-------------|
| BR-{nn} | {Declarative statement of the rule — use MUST/MUST NOT} | {Comma-separated entity names} | {§3.x FR / §7.x.x US-ID / SDS §x} |

---

## 3. Functional Requirements (FR)

> Each FR subsection describes **what** the system must do in business terms. Include a **Rationale** to explain **why** — the business driver, user need, or risk the requirement addresses. Implementation details belong in the SDS.

### 3.1 Wallet Management

**Rationale:** Users need a way to represent and track different sources of money so that all financial activities can be properly organized and traced back to a specific account or fund.

The System shall allow Users to create and manage one or more Wallets representing different sources of money (e.g. cash, bank account, e-wallet).
Each wallet shall store basic information such as Wallet name, type, and current balance.
Wallets are used as the main source or destination for all financial transactions.

### 3.2 Transaction Management

**Rationale:** Recording income and expense transactions is the core activity of personal finance management, enabling Users to track where money comes from and where it goes.

The System shall allow Users to record financial Transactions, including both income and expense Transactions.
Each Transaction shall include at least the amount, transaction type (income or expense), date, Wallet, and Category.
Users should be able to view, edit, and delete Transactions.

### 3.3 Category Management

**Rationale:** Categories enable Users to classify and group transactions meaningfully, which is essential for budgeting and financial reporting.

The System shall allow Users to classify Transactions into User-defined Categories (e.g. Study, Food, Rent, Salary, Investment…).
Categories are used to organize Transactions and support budgeting and reporting features.

### 3.4 Budget Tracking

**Rationale:** Budgets allow Users to set spending limits per category, helping them stay within financial plans and identify overspending.

The System shall allow Users to define a Budget for each Category within a specific period (e.g. monthly).
The System shall track actual spending against the defined Budget and indicate whether the User is within or exceeding the Budget.

### 3.5 Financial Goal Tracking

**Rationale:** Financial goals give Users a concrete target to work toward, providing motivation and a measurable sense of progress.

The System shall allow Users to define Financial Goals (e.g. saving for emergency fund, travel, or major purchases).
Each Goal shall include a target amount and a target time frame.
The System shall track progress toward each Goal based on recorded Transactions.

### 3.6 Investment Management

**Rationale:** Users with investment activities need a way to record and monitor their investment holdings at a high level alongside their other financial data.

The System shall allow Users to record and track Investment-related information.
Investments may include basic details such as investment name, amount, and current value.
The purpose is to provide a high-level view of Investment performance, not detailed trading features.

### 3.7 Financial Reporting

**Rationale:** Reports help Users understand their financial behavior over time, enabling better decision-making based on historical data.

The System shall provide basic Financial Reports to help Users understand their financial situation.
Reports may include summaries of income and expenses, spending by Category, Wallet balances, and overall financial trends over time.

### 3.8 Data Overview Dashboard

**Rationale:** A dashboard gives Users an at-a-glance view of their financial health, reducing the need to navigate through multiple sections for essential information.

The System shall provide a dashboard that presents key financial information in a clear and easy-to-understand format.
The dashboard may include current balances, recent Transactions, Budget status, and Goal progress.

---

## 4. Non-Functional Requirements (NFR)

> Each NFR must carry a **measurable target** — a concrete number or threshold verifiable in testing. Prose descriptions without targets will be rejected at review.

### 4.1 Performance

| Metric | Target |
|--------|--------|
| Basic operations (viewing Wallets, adding Transactions, viewing Reports) | Performed smoothly without noticeable delay under normal usage conditions |

The System shall respond to User actions within an acceptable time under normal usage conditions.

### 4.2 Availability

| Environment | Uptime target |
|-------------|---------------|
| Production | 99% (excluding planned maintenance) |
| Staging / test | {X%} |

### 4.3 Scalability

| Dimension | POC target | MVP target | Production target |
|-----------|-----------|-----------|------------------|
| Concurrent sessions | {N} | {N} | {N} |

The System shall be designed in a way that allows future expansion of features and Users.
New modules such as advanced reporting or investment analytics should be added without major changes to existing functionality.

### 4.4 Security

#### 4.4.1 Authentication

The System shall protect User financial data from unauthorized access through User authentication.

#### 4.4.2 Authorization

The System shall enforce data isolation between Users so that each User can access only their own financial data.

### 4.5 Privacy

- The System shall ensure that personal and financial data of Users are not shared or exposed without explicit User consent.
- **Data Residency:** {Specify the geographic region(s) where personal data must be stored/processed.}

### 4.6 Reliability

| Failure scenario | Expected system behaviour |
|------------------|--------------------------|
| Application restart | User data remains consistent and accurate |
| Temporary unavailability | User data remains consistent and accurate upon restoration |

The System shall operate reliably during normal usage and handle common User actions without unexpected failures.

---

## 5. User Experience Requirements (UXR)

### 5.1 Clarity

The System shall present information in a clear manner.
Users should be able to understand their financial situation at a glance without needing explanations or instructions.

### 5.2 Fast Onboarding

The System shall allow new Users to start using core features quickly.
A first-time User should be able to create a Wallet and record the first Transaction within a few minutes.

### 5.3 Immediate Feedback

The System shall provide clear and immediate feedback for User actions.
After adding or editing data, Users should instantly see updated balances, budgets, or progress indicators.

---

## 6. Business Flows

> These flows describe end-to-end journeys at a business level. Each named flow should include its happy path, alternative paths, and failure/negative cases.

### 6.1 Main Business Flow — End-to-End User Journey

This flow describes the typical end-to-end interaction of a User with the PFM system during daily financial management.

1. The User registers a new account.
2. The User logs into the System.
3. The User creates a Wallet W1 (e.g. Cash Wallet).
4. The User creates a Category C1 (e.g. Salary), C2 (e.g. Food).
5. The User defines a Budget B1 for Category C2 associated with Wallet W1.
6. The User records an income Transaction T1 into wallet W1 under C1.
7. The User records an expense Transaction T2 from Wallet W1 under Category C2.
8. The User views the current status of Wallet W1.
9. The User views the current status of Budget B1.
10. The User views the income and expense Report.
11. The User views Notifications if any Budget limit or condition is reached.
12. The User logs out of the System.

### 6.2 Supporting BF — Wallet Management

This flow describes how Users manage Wallets as sources of money.

1. The User views the list of all Wallets.
2. The User selects a Wallet W1 to view details.
3. The User updates a Wallet if needed.

### 6.3 Supporting BF — Category Management

This flow describes how Users manage Transaction Categories.

1. The User views the list of available Categories.
2. The User selects a Category C1 to view details.
3. The User updates a Category if needed.
4. The User deletes a Category that is no longer in use.

### 6.4 Supporting BF — Budget Management

This flow describes how Users plan and monitor Budgets.

1. The User views the list of Budgets associated with a Wallet.
2. The User views detailed Budget status and remaining amount.
3. The User updates a Budget if needed.
4. The User deletes a Budget when it is no longer required.

### 6.5 Supporting BF — Transaction Management

This flow describes how Users record financial activities.

1. The User views the list of Transactions associated with a Wallet.
2. The User views details of a Transaction.
3. The User updates Transaction information if needed.
4. The User deletes a Transaction when it is no longer required.

### 6.6 Supporting BF — Financial Goal Management

This flow describes how Users manage Financial Goals.

1. The User creates a Financial Goal with a target amount and time frame.
2. The User allocates funds to the Goal.
3. The User views Goal progress status.
4. The User updates the Goal if needed.
5. The User closes the Goal when completed.

### 6.7 Supporting BF — Investment Management

This flow describes how Users track Investments.

1. The User creates an Investment record.
2. The User records Investment-related Transactions.
3. The User views a summary of Investment performance.

### 6.8 Supporting BF — Reporting and Dashboard

This flow describes how Users review financial information.

1. The User accesses the dashboard or reporting section.
2. The User filters reports by date, Wallet, or Category.

### 6.9 Supporting BF — Notification Handling

This flow describes how the System communicates important events.

1. The User views the list of Notifications.
2. The User views a Notification.
3. The User takes appropriate action on a Notification if needed.

> **Forward traceability:** every step in a flow that requires a user action or a system decision
> MUST map to at least one User Story in §7. If a step has no corresponding story, either the
> story is missing or the step is purely internal — document which in a note on the step.

---

## 7. Features and User Stories

> **Derivation principle:** Features and User Stories are derived from two upstream sources —
> do not invent features that cannot be traced to one of these. If a feature has no trace,
> update §2 or §6 first.
>
> | Source | Drives | Typical story actions |
> |--------|--------|-----------------------|
> | **§2 Domain Entities** | Data-centric features | Create, view, update, delete an entity; trigger a state transition (§2.3) |
> | **§6 Business Flows** | Journey-centric features | Actor performs a step in a named flow; system responds to a flow event |
>
> A Feature that cannot be traced to either source is a signal that §2 or §6 is incomplete —
> update those sections before writing the stories.
>
> **User story format:** **As a** {ROLE}, **I want to** {action} **so that** {value}.
>
> All domain nouns used in stories MUST be defined in §2.2.
> All business rules cited in acceptance criteria MUST have a BR-{nn} entry in §2.4.

---

### 7.1 Feature-01: User Management

Provides basic User account creation and profile management, allowing Users to register and maintain their personal information.

#### 7.1.1 US-01: Register a User [MVP]

**As a** Visitor, **I want to** register a User account **so that** I can log in and use the PFM application.

**Acceptance Criteria:**

```gherkin
Background:
  Given the Visitor is on the "Register" screen

Scenario: Register successfully with email
  When the Visitor enters full name "Homer Truong"
    And the Visitor enters email "homer@example.com"
    And the Visitor enters password "P@ssw0rd123"
    And the Visitor confirms password "P@ssw0rd123"
    And the Visitor taps "Register"
  Then the System creates a new User account
    And the System shows message "Register successful"
    And the User is redirected to the "Login" screen

Scenario: Reject registration when required fields are missing
  When the Visitor taps "Register" without entering email
  Then the System does not create a new User account
    And the System shows validation error "Email is required"

Scenario: Reject registration when account already exists
  Given an existing User account with email "homer@example.com"
  When the Visitor enters full name "Homer Truong"
    And the Visitor enters email "homer@example.com"
    And the Visitor enters password "P@ssw0rd123"
    And the Visitor confirms password "P@ssw0rd123"
    And the Visitor taps "Register"
  Then the System does not create a new User account
    And the System shows error "Account already exists"
    And the System suggests "Go to Login"
```

#### 7.1.2 US-02: Update a User Profile

---

### 7.2 Feature-02: System Security

Ensures secure access to the System by allowing Users to log in and log out safely, protecting personal financial data. Moreover, each User is authorized to see only his/her financial data.

#### 7.2.1 US-01: Login [MVP]

#### 7.2.2 US-02: Logout [MVP]

---

### 7.3 Feature-03: Wallet Management

Allows Users to create and manage Wallets that represent different sources of money and view current balances.

#### 7.3.1 US-01: Create a Wallet [MVP]

#### 7.3.2 US-02: View a list of Wallets [MVP]

#### 7.3.3 US-03: View a Wallet [MVP]

#### 7.3.4 US-04: Update a Wallet

#### 7.3.5 US-05: Set a Wallet as default

---

### 7.4 Feature-04: Category Management

Enables Users to define and manage Categories used to classify income and expense Transactions.

#### 7.4.1 US-01: Create a Category [MVP]

#### 7.4.2 US-02: View a list of Categories [MVP]

#### 7.4.3 US-03: View a Category

#### 7.4.4 US-04: Update a Category

#### 7.4.5 US-05: Delete a Category

---

### 7.5 Feature-05: Budget Management

Allows Users to plan and monitor spending by defining Budgets for specific Categories and Wallets.

#### 7.5.1 US-01: Create a Budget for a Wallet [MVP]

#### 7.5.2 US-02: View a list of Budgets [MVP]

#### 7.5.3 US-03: View a Budget [MVP]

#### 7.5.4 US-04: Update a Budget

#### 7.5.5 US-05: Delete a Budget

---

### 7.6 Feature-06: Transaction Management

Enables Users to record, view, and manage income and expense Transactions associated with their Wallets.

#### 7.6.1 US-01: Create a Transaction for a Wallet [MVP]

**As a** User, **I want to** create a transaction for a wallet **so that** I can track my income and expenses and keep wallet balance updated.

**Acceptance Criteria:**

```gherkin
Background:
  Given the User is logged in
   And the User has an existing wallet named "Main Wallet"
   And the wallet currency is "VND"
   And the wallet current balance is 1,000,000

Scenario: Create an expense transaction successfully
  Given the User is on the "Create Transaction" screen for "Main Wallet"
  When the User selects transaction type "Expense"
   And the User enters amount 200,000
   And the User selects category "Food"
   And the User sets date "2025-12-23"
   And the User enters note "Lunch"
   And the User taps "Save"
  Then the System creates a transaction in "Main Wallet"
   And the transaction type is "Expense"
   And the transaction amount is 200,000
   And the transaction category is "Food"
   And the transaction date is "2025-12-23"
   And the System decreases the wallet balance to 800,000
   And the System shows message "Transaction created successfully"

Scenario: Create an income transaction successfully
  Given the User is on the "Create Transaction" screen for "Main Wallet"
  When the User selects transaction type "Income"
   And the User enters amount 500,000
   And the User selects category "Salary"
   And the User sets date "2025-12-23"
   And the User taps "Save"
  Then the System creates a transaction in "Main Wallet"
   And the transaction type is "Income"
   And the transaction amount is 500,000
   And the transaction category is "Salary"
   And the transaction date is "2025-12-23"
   And the System increases the wallet balance to 1,500,000
   And the System shows message "Transaction created successfully"

Scenario: Reject transaction when required fields are missing
  Given the User is on the "Create Transaction" screen for "Main Wallet"
  When the User taps "Save" without entering amount
  Then the System does not create a transaction
   And the System shows validation error "Amount is required"

Scenario: Reject transaction when amount is invalid
  Given the User is on the "Create Transaction" screen for "Main Wallet"
  When the User selects transaction type "Expense"
   And the User enters amount -10,000
   And the User taps "Save"
  Then the System does not create a transaction
   And the System shows validation error "Amount must be greater than 0"

Scenario: Reject expense transaction when balance is insufficient (MVP rule)
  Given the User is on the "Create Transaction" screen for "Main Wallet"
  When the User selects transaction type "Expense"
   And the User enters amount 2,000,000
   And the User selects category "Shopping"
   And the User taps "Save"
  Then the System does not create a transaction
   And the wallet balance remains 1,000,000
   And the System shows error "Insufficient balance"
```

#### 7.6.2 US-02: View a list of Transactions [MVP]

#### 7.6.3 US-03: View a Transaction [MVP]

#### 7.6.4 US-04: Update a Transaction

#### 7.6.5 US-05: Delete a Transaction

---

### 7.7 Feature-07: Financial Reporting

Provides Users with summarized financial information and reports to help them understand their overall financial situation.

#### 7.7.1 US-01: View the Summary Report [MVP]

#### 7.7.2 US-02: View Income Report

#### 7.7.3 US-03: View Expense Report

#### 7.7.4 US-04: Filter Reports by Date

#### 7.7.5 US-05: Filter Reports by Wallet or Category

---

### 7.8 Feature-08: Financial Goal

Allows Users to define financial Goals and track progress toward achieving them.

#### 7.8.1 US-01: Create a Financial Goal

#### 7.8.2 US-02: View a list of Financial Goals

#### 7.8.3 US-03: View a Financial Goal

#### 7.8.4 US-04: Update a Financial Goal

#### 7.8.5 US-05: Close a Financial Goal

---

### 7.9 Feature-09: Investment Portfolio

Enables Users to record and monitor investment information inside their single Investment Portfolio (Investment Index) to get a basic performance overview.

#### 7.9.1 US-01: View the Investment Portfolio

#### 7.9.2 US-02: Update the Investment Portfolio Settings

#### 7.9.3 US-03: Add a Holding to the Investment Portfolio

#### 7.9.4 US-04: Update a Holding

#### 7.9.5 US-05: Remove a Holding

---

### 7.10 Feature-10: Notification Handling

Informs Users about important financial events or system conditions through Notifications.

#### 7.10.1 US-01: View the list of Notifications [MVP]

#### 7.10.2 US-02: View a Notification [MVP]

#### 7.10.3 US-03: Mark a Notification as Read

---

### 7.11 Feature-11: Data Overview Dashboard

---

### Feature-level Release (Overview)

The following table shows how the complete product scope defined in the SRS is delivered incrementally.
The MVP includes eight core features to ensure a usable and valuable first release, while additional features are introduced in later releases as the product evolves.

| No. | Feature | MVP | Release 1 | Release 2 | Note |
|-----|---------|-----|-----------|-----------|------|
| 1 | User Management | ✔ | ✔ | ✔ | Core user identity and profile management |
| 2 | System Security | ✔ | ✔ | ✔ | Authentication, authorization, and data protection |
| 3 | Wallet Management | ✔ | ✔ | ✔ | Core financial structure |
| 4 | Category Management | ✔ | ✔ | | Basic categorization is sufficient for early stages |
| 5 | Budget Management | ✔ | ✔ | ✔ | Essential for spending control and planning |
| 6 | Transaction Management | ✔ | ✔ | ✔ | Core financial activities |
| 7 | Financial Reporting | ✔ | ✔ | ✔ | Insights improve progressively over releases |
| 8 | Financial Goal | | ✔ | ✔ | Depends on stable budgeting and reporting |
| 9 | Investment Management | | | ✔ | Advanced feature for mature users |
| 10 | Notification Handling | ✔ | ✔ | ✔ | User feedback and engagement |
| 11 | Data Overview Dashboard | | ✔ | ✔ | High-level financial insights |

---

## 8. External Dependencies

### 8.1 Third-Party APIs

| Dependency | Provider | Purpose | Failure mode |
|------------|----------|---------|--------------|
| {Name} | {Vendor} | {Purpose} | {Impact} |

### 8.2 Internal Systems / Legacy Services

| Dependency | Owner team | Purpose | Failure mode |
|------------|-----------|---------|--------------|
| {Name} | {Team} | {Purpose} | {Impact} |

### 8.3 Infrastructure Dependencies

| Dependency | Type | Purpose | Failure mode |
|------------|------|---------|--------------|
| {Name} | {Managed} | {Purpose} | {Impact} |
