# ORACLE SPRINT 17 ENGINEERING PLAN

**Sprint:** 17 — Scale-Safe Trust Data Plane
**Authority:** Approved Sprint Plan beneath the Oracle Engineering Programme
**Owner:** Oracle Platform Engineering
**Status:** Founder-approved; activated for implementation
**Classification:** Living until Sprint closure
**Expected Stability:** Scope changes require explicit Founder approval
**Approved:** 22 July 2026
**Implementation:** Phase 0 complete; Phase 1 authorised to begin
**Deployment:** Migration 009 remains undeployed
**Activated:** 22 July 2026 by explicit Founder instruction

---

# Objective

Make the Operator Intelligence persistence boundary safe for controlled
production activation without activating inference, consumers or Migration 009.

This Plan implements the Sprint 17 production objective defined by
[`docs/ENGINEERING_PROGRAMME.md`](../ENGINEERING_PROGRAMME.md). The Engineering
Programme remains authoritative if this Plan is interpreted ambiguously.

# Executive Assessment

Sprint 17 remains the next authorised Sprint. Sprint 16 is complete and Sprint
17 is approved but inactive. The repository already contains authenticated
Operator ownership, exclusive Operator Intelligence Service authority,
server-only trusted database access, immutable evidence and claim structures,
database uniqueness constraints, row locking, monotonic revision validation,
and rollback and catalog evidence for the current Migration 009.

The persistence boundary is not yet scale-safe. The eligible-claim read begins
by loading every claim head, filters scope in application memory, reads
eligibility history without a limit and exposes no cursor, result, history,
evidence-fan-out or Snapshot budgets. Existing indexes have not been justified
by production-shaped query plans. Exact retries of claim revisions and
eligibility assessments are not idempotent, concurrency has not been exercised
against PostgreSQL, performance thresholds are not automated and there is no
consolidated Migration 009 production deployment dossier.

Sprint 17 hardens these existing boundaries. It does not activate inference,
control operations, Snapshot consumption, Applications, Platform bootstrap or
desktop runtime behaviour.

# Sprint Scope

## IN SCOPE

Sprint 17 is authorised to implement only:

- bounded, Operator-owned and purpose-scoped Operator Intelligence Repository
  reads
- database-side scope filtering before result limits are applied
- immutable, versioned page request and page result contracts
- deterministic keyset cursor pagination with stable ordering, query binding
  and a read watermark
- explicit page-size, history-size, evidence-fan-out, Snapshot item,
  serialized-payload, memory and query-count budgets
- bounded eligible-claim, claim-lifecycle and eligibility-history reads
- Snapshot budget validation without activating Snapshot construction or
  consumption at runtime
- production-shaped database fixtures and workload definitions used only for
  verification
- measured query-plan and index evidence for every approved production path
- targeted Repository and database query optimisation supported by that
  evidence
- exact-retry idempotency for evidence, admission, claim-revision and
  eligibility operations
- immutable conflict and duplicate-admission outcomes
- typed stale-concurrency outcomes
- real PostgreSQL concurrency and monotonic-revision verification
- automated performance, query-count, result-size and dependency-boundary
  thresholds
- evidence-supported amendments to the undeployed Migration 009 where required
  to complete the approved hardening
- complete revalidation of the exact final Migration 009 if it changes
- a version-pinned Migration 009 production deployment dossier
- independent pre-deployment rollback and catalog evidence
- regression verification across ownership, Understanding, trust, Guidance,
  Companion, web build and desktop compilation
- documentation reconciliation and Sprint closure evidence

## OUT OF SCOPE

Sprint 17 is explicitly not authorised to implement or activate:

- permanent deployment of Migration 009
- Gate 1 approval or production use of Operator Intelligence persistence
- Sprint 18 — Operator Trust and Control
- purpose-specific consent product operations beyond preserving and verifying
  the existing trust boundary
- correction, dispute, export, retention or deletion orchestration
- Preference or Goal declaration operations
- candidate generation or a Memory Engine candidate adapter
- automated inference or Operator Intelligence accumulation
- claim lifecycle activation through production Services
- `OperatorUnderstandingSnapshot` runtime construction
- Oracle Context projection or consumption
- personalisation, coaching or Companion consumption of Operator Understanding
- runtime Operator Intelligence Service registration
- Platform bootstrap or production composition-root activation
- Application, route, component or user-interface work
- desktop authentication, desktop Platform activation or desktop behavioural
  changes
- Session or evidence-source lifecycle implementation belonging to later
  Sprints
- new Game Integrations, Guidance ranking or live Companion Guidance delivery
- broad or sensitive inference, AI-generated claims or cross-game promotion
- an authoritative cache, alternate persistence path or ownership change
- a new Platform layer, runtime, public compatibility obligation or
  architectural redesign
- installer, packaging, signing, updater, release or deployment work

# 1. Current Implementation Audit

| Sprint 17 objective | Status | Evidence and assessment |
|---|---|---|
| Bounded, purpose-scoped Repository reads | **Partially complete** | `purpose`, `asOf` and `scope` exist in the query contract, but `listEligibleClaimRevisions` first loads every claim head. Purpose is applied to eligibility while scope is filtered in memory. No result limit exists. |
| Deterministic cursor pagination | **Not implemented** | Repository and Service contracts return an unpaged array. There is no cursor, page size, stable key order, high-watermark or next-page result. |
| Explicit result, history and Snapshot budgets | **Not implemented** | No maximum result size, evidence fan-out, history size, Snapshot item count, serialized size or memory budget is enforced. |
| Query plans and indexes supported by measured evidence | **Partially complete** | Migration 009 contains seven secondary indexes. No tracked production-shaped workload, `EXPLAIN` evidence, index-use evidence or rejection rationale exists. |
| Targeted query optimisation | **Not implemented** | Existing indexes belong to the persistence and trust foundation. The current read remains multi-query and unbounded. |
| Idempotent evidence and revision operations | **Partially complete** | Evidence and admission inserts support exact-identifier replay followed by immutability checks. Claim-revision and eligibility inserts have no equivalent replay behaviour. |
| Duplicate-admission protection | **Partially complete** | Database constraints prevent several duplicate forms, but alternative-identifier behaviour, typed outcomes and concurrent duplicate verification are absent. |
| Concurrency and monotonic-revision verification | **Partially complete** | Consent, disposition and claim paths use row locks, and contracts validate monotonic revisions. No real-database concurrent retry or contention suite exists. |
| Bounded eligibility and lifecycle history | **Not implemented** | Eligibility history is ordered but not limited. Paginated claim-revision and eligibility-history Repository operations do not exist. |
| Automated performance and boundary thresholds | **Partially complete** | Dependency regression is automated. Latency, memory, query-count, payload-size, history-size and query-plan gates are absent. |
| Migration 009 production deployment dossier | **Not implemented** | Prior evidence is distributed across living documents rather than assembled into one version-pinned decision artifact. |
| Independent pre-deployment catalog and rollback evidence | **Complete for the current file; refresh required if it changes** | The exact current migration passed transactional rollback and independent catalog verification. Any Sprint 17 change invalidates that evidence for deployment purposes. |

Existing Service ownership, authenticated Operator injection, Repository
exclusivity, server-only trusted credentials, RLS, composite ownership foreign
keys, service-role mutation restrictions and inactive runtime consumers must be
preserved.

# 2. Gap Analysis

## G1 — The current eligible-claim read scales with total Operator history

The read loads every current claim head before retrieving related revisions,
evidence links, eligibility history and Evidence. Its cost grows with the
Operator's complete claim population rather than the requested result page.

## G2 — Purpose and scope are not applied at the earliest query boundary

Purpose limits eligibility rows, but scope is evaluated only after claim
reconstruction. This increases database result volume and application memory
and prevents scope-aware query optimisation.

## G3 — Page stability is undefined

No stable order, cursor schema, query fingerprint, read watermark or
concurrent-insert behaviour is specified. Offset pagination would not satisfy
the Programme because concurrent writes could duplicate or skip results.

## G4 — Histories are append-only but unbounded when read

Append-only histories are structurally safe, but the Repository has no bounded
history contract and eligible-claim reconstruction may retrieve every
qualifying assessment.

## G5 — Snapshot safety is structural rather than operational

Snapshots are immutable, purpose-scoped and validated, but may contain an
unlimited number of items and Evidence references. They have no predictable
payload or memory envelope.

## G6 — Indexes are not supported by workload evidence

Migration 009 contains plausible indexes, but no production-shaped fixture,
measured plan, latency record or write-amplification assessment supports them.

## G7 — Write replay semantics are inconsistent

Policy, consent, Evidence, disposition and admission paths contain some
immutable replay behaviour. Claim revisions and eligibility operations instead
fail on repeated submission, so a network retry can report failure after a
successful commit.

## G8 — Duplicate behaviour is enforced but not fully specified

Database constraints prevent several duplicate forms, but the boundary does
not consistently distinguish exact replay, immutable conflict, natural-key
duplicate and stale concurrency.

## G9 — Concurrency safety is implemented but unproven

The migration locks current heads and histories, but simultaneous revision,
admission, eligibility and retry behaviour has not been exercised against a
real PostgreSQL database.

## G10 — Performance claims cannot currently be made

No automated limit enforces page size, query count, latency, memory, payload
size, history size or query-plan characteristics.

## G11 — Deployment evidence is not decision-ready

Prior rollback evidence proves transactional execution and catalog restoration
for the current file. It does not contain Sprint 17 scale evidence, a final
migration hash, production procedure, recovery decision tree or post-deployment
checks.

These gaps exist because Sprint 15 established persistence correctness and
Sprint 16 established trust authority. Neither Sprint was authorised to design
or prove the production scale envelope.

# 3. Required Deliverables

## D1 — Bounded read and cursor contracts

**Purpose:** Make every approved Repository read bounded, stable and
purpose-specific.

**Architectural ownership:** Operator Intelligence Service owns the consumable
contract. Operator Intelligence Repository owns database query mechanics.

**Expected design:**

- immutable versioned page request and result
- default page size 50 and hard maximum 100
- opaque versioned cursor
- cursor bound to Operator, purpose, scope, `asOf` and initial read watermark
- keyset ordering using a stable unique key and deterministic tie-breakers
- malformed, expired or query-mismatched cursors fail closed
- purpose, scope and watermark filters applied before `LIMIT`
- fixed query count independent of total history

**Affected Platform components:** Operator Understanding contracts only where a
shared pagination or budget type belongs. No Platform bootstrap change.

**Affected Services:** Operator Intelligence Service. Operator Service remains
the identity provider without behavioural change.

**Affected Applications:** None.

**Affected Repositories:** `OperatorIntelligenceRepository` and
`SupabaseOperatorIntelligenceRepository`.

**Migrations:** Migration 009 only if a measured database projection, index or
normalized query field is required. No alternate persistence path.

**Tests:** Cursor round-trip, ordering, page boundaries, empty and final pages,
concurrent insertion, scope and purpose isolation, invalid cursors,
cross-Operator cursor rejection and fixed query count.

**Documentation impact:** Sprint Plan, Architecture, Implementation Status and
Migration 009 dossier require updates.

## D2 — Result, history and Snapshot budgets

**Purpose:** Prevent unbounded database, application-memory and serialized
payload growth.

**Approved starting envelope:**

- eligible-claim page default 50, maximum 100
- claim-lifecycle page maximum 100
- eligibility-history page maximum 100
- maximum 32 Evidence references reconstructed per claim
- maximum 100 intelligence claims and 250 total items per Snapshot
- maximum 512 KiB serialized Snapshot or Repository page response
- no more than 32 MiB incremental service-request heap in the approved
  performance environment

Exceeding a budget must produce a typed failure or explicit truncation state.
It must never silently omit authoritative data.

**Architectural ownership:** Services own product-facing budgets, Repositories
enforce database result limits and the Snapshot contract validates its own
envelope.

**Affected Platform components:** Operator Understanding Snapshot contract and
validation.

**Affected Services:** Operator Intelligence and the future Operator
Understanding boundary.

**Affected Applications:** None.

**Affected Repositories:** Operator Intelligence Repository.

**Migrations:** Only where database-side enforcement is justified.

**Tests:** Exact-boundary, one-over-boundary, serialized-size, large-Evidence
and immutability tests.

**Documentation impact:** Required. Budget values and supporting evidence must
be recorded.

## D3 — Production-shaped workload and query-plan evidence

**Purpose:** Establish the measured basis for every optimisation.

The approved hot-Operator fixture contains:

- 10,000 claim heads
- 100,000 claim revisions
- 250,000 eligibility assessments
- 100,000 Evidence references, admissions and dispositions
- 300,000 claim-to-Evidence links
- at least two Operators for isolation verification
- skewed histories, expired and disputed records, multiple purposes and scopes

Empty and normal-Operator fixtures are also required.

**Architectural ownership:** Repository and database engineering.

**Affected Platform components, Services and Applications:** No ownership or
runtime change.

**Affected Repositories:** Operator Intelligence Repository query path.

**Migrations:** Existing indexes may be retained, changed or removed only from
measured evidence.

**Tests:** `EXPLAIN (ANALYZE, BUFFERS)`, index use, selectivity, rows read versus
returned, sort and spill behaviour, write amplification and index size.

**Documentation impact:** Mandatory query-plan annex in the deployment dossier.

## D4 — Idempotent writes and duplicate-admission outcomes

**Purpose:** Make safe retries distinguishable from conflicting duplicates.

Required behaviour:

- exact replay returns the original immutable result
- the same identity with different content fails as an immutable conflict
- the same natural Evidence or admission under another identifier fails as a
  duplicate
- exact claim-revision retry succeeds idempotently
- stale or competing revisions produce a typed concurrency conflict
- exact eligibility replay succeeds without adding a row
- no retry creates duplicate Evidence, admission, revision, link or assessment
  rows

**Architectural ownership:** Operator Intelligence Service owns caller-visible
results. Repository and Migration 009 own atomic enforcement.

**Affected Platform components:** Existing trust contracts only.

**Affected Services:** Operator Intelligence Service.

**Affected Applications:** None.

**Affected Repositories:** Operator Intelligence Repository.

**Migrations:** Changes to the undeployed Migration 009 functions or
constraints are expected where required. A corrective Migration 010 is not
created for an artifact that has never been deployed.

**Tests:** Sequential and concurrent retries, conflicting payloads, alternative
identifiers, transaction interruption and durable row-count assertions.

**Documentation impact:** Architecture, Implementation Status and dossier must
record the verified semantics.

## D5 — Concurrency and monotonic-revision proof

**Purpose:** Demonstrate that locks and constraints behave correctly under
contention.

Required scenarios include 32 simultaneous exact admission retries, 32 exact
claim-revision retries, competing next revisions from one head, parallel
eligibility assessments and concurrent consent or disposition changes during
admission and eligibility evaluation.

**Measurable outcome:** One durable logical operation, no revision gap, no
duplicate link, no lost update, deterministic retry results and typed stale
conflicts.

**Architectural ownership:** Repository and database boundary.

**Affected Applications:** None.

**Migrations:** Locking or conflict handling changes only when the tests expose
a defect.

**Tests:** Repeated real PostgreSQL integration tests. Mock clients are
insufficient.

**Documentation impact:** The concurrency matrix and observed results enter the
dossier.

## D6 — Automated scale and boundary gates

**Purpose:** Turn the approved budgets into repeatable failure thresholds.

Approved starting thresholds for the pinned performance environment are:

- eligible-page database p95 no greater than 250 ms and p99 no greater than
  500 ms
- write-operation database p95 no greater than 200 ms and p99 no greater than
  400 ms
- no more than four database round trips for a current-claim page
- no more than two database round trips for a history page
- constant query count as history grows
- no unbounded sequential scan of a production-shaped growing fact or history
  table
- no disk sort or spill for approved page sizes
- payload and memory remain within D2 budgets
- no new architecture exception or runtime dependency cycle

Thresholds run against a pinned PostgreSQL version and recorded environment.
Changing them after activation requires measured evidence and explicit Founder
approval.

**Architectural ownership:** Engineering verification.

**Dependencies:** Existing Supabase, Node and TypeScript tooling should be
sufficient. No runtime dependency is expected.

**Documentation impact:** Commands, environment and interpretation rules must
be recorded.

## D7 — Migration 009 production deployment dossier

**Purpose:** Give the Founder one decision-ready artifact.

The dossier must contain:

- exact commit and SHA-256 hash of Migration 009
- schema-object and permission inventory
- query plans and benchmark results
- index decisions, including rejected indexes
- idempotency and concurrency results
- empty and production-shaped application evidence
- prior and refreshed rollback evidence
- independent pre- and post-rollback catalog diffs
- preservation checks for Operators, bindings and Sessions
- RLS, anonymous denial, cross-Operator isolation and service-role mutation
  evidence
- deployment prerequisites, named operator and backup prerequisite
- stop conditions and post-deployment security checks
- recovery and rollback decision tree
- an explicit statement that dossier approval is not deployment approval

**Documentation impact:** This deliverable is itself documentation.

## D8 — Final independent rollback and catalog rehearsal

**Purpose:** Prove the exact final migration artifact is deployable and leaves
no residue after rollback.

If Migration 009 changes, the final exact file must be executed in an explicit
rollback transaction and independently catalog-diffed. Earlier evidence remains
historical and cannot qualify the changed artifact.

**Affected Applications and desktop:** None.

**Documentation impact:** Evidence enters the dossier and closure record.

# 4. Implementation Phases

## Phase 0 — Activation and measurable envelope

**Purpose:** Lock scope and prevent speculative optimisation.

**Expected implementation:** Record the approved workload, budgets, benchmark
environment, excluded features and Migration 009 non-deployment rule.

**Dependencies:** Founder approval of this Plan and explicit Sprint activation.

**Files likely to change:** This Plan only for activation status if required.
No production code.

**Risks:** Arbitrary thresholds or Sprint 18 control work entering scope.

**Verification:** Planning consistency and clean-tree inspection.

**Definition of Done:** Approved budgets, fixture shape, phase gates and
migration separation are recorded. Sprint activation is explicit.

## Phase 1 — Pagination and budget contracts

**Purpose:** Define stable public and Repository behaviour before optimisation.

**Expected implementation:** Page types, opaque cursor, stable order,
high-watermark semantics, hard limits and typed failures.

**Dependencies:** Phase 0.

**Files likely to change:** Operator Intelligence Service types, Operator
Intelligence Repository and focused verification fixtures/configuration.

**Risks:** Cursor leakage, cross-query replay or an accidental breaking change.

**Verification:** Serialization, immutability, invalid-cursor, query-binding and
boundary-value tests.

**Definition of Done:** Contracts are deterministic, bounded, immutable and
contain no persistence authority.

## Phase 2 — Bounded eligible-claim read

**Purpose:** Replace full-history loading with server-filtered keyset reads.

**Expected implementation:** Apply Operator, purpose, scope, logical `asOf`,
read watermark and cursor before limiting; batch Evidence reconstruction;
constant query count; deterministic next cursor.

**Dependencies:** Phase 1.

**Files likely to change:** Operator Intelligence Repository and Service,
Migration 009 only when database projection support is measured as necessary,
and focused read-path verification.

**Risks:** Skipped or repeated claims, incorrect latest eligibility or JSON
scope comparison mismatch.

**Verification:** Full multi-page traversal, mutation between pages, purpose
and scope rejection and query-count assertions.

**Definition of Done:** No approved current read scales with total Operator
claim history.

## Phase 3 — Bounded histories and Snapshot envelope

**Purpose:** Bound every current or future history projection required by this
Sprint.

**Expected implementation:** Paginated claim-lifecycle and eligibility reads,
bounded latest-assessment queries, and Snapshot size and item validation.

**Dependencies:** Phases 1 and 2.

**Files likely to change:** Operator Intelligence Repository, Operator
Understanding Snapshot, Service contracts where a page is required, and
focused verification.

**Risks:** Accidentally implementing Sprint 18 inspection or silently
truncating authoritative data.

**Verification:** Limit, cursor, oversized Snapshot, Evidence-fan-out and typed
failure tests.

**Definition of Done:** Every Repository history read and Snapshot construction
path has an enforced budget.

## Phase 4 — Idempotency and duplicate protection

**Purpose:** Make network and worker retries safe.

**Expected implementation:** Exact replay for revisions and eligibility,
immutable conflicts, deterministic duplicate outcomes and typed Service errors.

**Dependencies:** Existing trust contracts and approved Phase 0 semantics.

**Files likely to change:** Migration 009, Operator Intelligence Repository,
Service and types, and persistence, trust and authority verification.

**Risks:** Treating a conflicting payload as a replay or weakening
immutability.

**Verification:** Sequential and parallel replay matrices with durable row
counts.

**Definition of Done:** All approved Evidence and revision operations are
idempotent and atomic under the D4 rules.

## Phase 5 — Concurrency proof

**Purpose:** Validate real PostgreSQL behaviour under contention.

**Expected implementation:** Integration harness and transaction-coordinated
race scenarios. Production changes occur only if a race is demonstrated.

**Dependencies:** Phase 4 and a disposable production-equivalent database.

**Files likely to change:** New concurrency verification and configuration;
Migration 009 only if correction is necessary.

**Risks:** Mock-only confidence, nondeterministic tests or hidden deadlocks.

**Verification:** Repeated 32-worker scenarios and final data/catalog
assertions.

**Definition of Done:** Monotonic revisions, duplicate protection and replay
semantics pass repeatedly with no unexplained failure.

## Phase 6 — Measurement-led query optimisation

**Purpose:** Meet the approved envelope with the smallest justified database
changes.

**Expected implementation:** Load fixtures, capture baseline plans, optimise
targeted queries, change indexes only from evidence, and repeat measurement.

**Dependencies:** Phases 2 through 5.

**Files likely to change:** Migration 009, Repository query implementation,
performance harness and dossier evidence.

**Risks:** Synthetic-workload bias, excessive indexes or test-specific
optimisation.

**Verification:** Before and after plans, latency, buffers, index size and write
cost.

**Definition of Done:** Every retained optimisation has measured benefit or a
documented integrity justification.

## Phase 7 — Automated thresholds and regression gates

**Purpose:** Prevent regression of the scale-safe boundary.

**Expected implementation:** A focused Sprint 17 command covering budgets,
queries, plans, idempotency and concurrency while preserving the architecture
baseline.

**Dependencies:** Phases 1 through 6.

**Files likely to change:** `package.json`, Sprint 17 verification scripts and
TypeScript configuration, plus existing focused suites where extension is
clearer.

**Risks:** Environment-sensitive thresholds or bypassable checks.

**Verification:** Deliberate over-limit fixtures fail; approved fixtures pass.

**Definition of Done:** One documented command enforces all automated Sprint 17
thresholds.

## Phase 8 — Final migration rehearsal, dossier and closure evidence

**Purpose:** Prepare, but not execute, the permanent deployment decision.

**Expected implementation:** Run the exact final Migration 009 in rollback,
independently compare catalogs, assemble the dossier, run full regression and
reconcile living documentation.

**Dependencies:** Phases 1 through 7.

**Files likely to change:** Migration dossier, Sprint closure record,
Architecture, Implementation Status, Project Board, Master Build Plan, Sprint
Index and README. The Engineering Programme changes only if the Founder changes
Programme scope.

**Risks:** Treating rehearsal as deployment authority or referencing the wrong
migration hash.

**Verification:** Hash consistency, independent catalog evidence and the full
verification matrix.

**Definition of Done:** The Founder can make a separate informed deployment
decision using evidence for the exact migration artifact.

# 5. Architecture Review

Sprint 17 does not require a new Platform layer, runtime, Application boundary,
ownership transfer or alternate persistence path.

The existing architecture remains sufficient:

```text
Authenticated Account
        ↓
Operator Service
        ↓
Operator Intelligence Service
        ↓
Operator Intelligence Repository
        ↓
Migration 009 schema and functions
```

No new ADR is required. ADR-033 through ADR-036 already establish Account and
Operator ownership, Operator Understanding and Snapshot roles, data governance,
and scope restrictions.

A new ADR is required only if implementation proposes an authoritative cache,
a second persistence path, Application Repository access, changed Service
ownership, a new privacy or security boundary, or an incompatible public
contract. Discovery of any such requirement stops the Sprint and returns to
Founder architectural review.

Architecture and Implementation Status require closure reconciliation. No
boundary or ownership change is approved. No new runtime dependency is
expected; any load-testing dependency must be development-only and explicitly
reviewed.

# 6. Migration Review

Migration 009 is implemented, reconciled against the deployed catalog at its
prior validation point, successfully executed inside rollback transactions,
independently catalog-verified, functionally checked for ownership and
isolation, and not permanently deployed.

It is trust-boundary ready but not production-activation ready. Bounded reads,
revision and eligibility replay, concurrent behaviour, production-shaped query
plans, justified indexes, automated thresholds and the final dossier remain
outstanding.

Rollback confidence is:

- **High** for pre-commit transactional rollback of the currently validated
  file
- **Unproven** for the final Sprint 17 artifact until its exact hash is
  rehearsed again
- **Medium at best** for post-deployment recovery after production writes,
  because transactional rehearsal does not prove safe destructive removal of
  committed durable Operator Intelligence

The dossier must therefore distinguish transaction rollback, backup and
restore, forward recovery and any data-preserving post-deployment action.

**Recommendation:** Sprint 17 prepares Migration 009 for a separate Founder
deployment decision. Sprint 17 must not deploy Migration 009.

The mandatory sequence remains:

```text
Sprint 17 complete
        ↓
Founder Migration 009 deployment decision
        ↓
Permanent deployment and Gate 1 verification
        ↓
Sprint 18
```

# 7. Verification Strategy

## Build verification

- `npm run build`
- compile the focused Sprint 17 TypeScript harness
- `git diff --check`
- clean-tree and untracked-file inspection at closure

## Lint verification

- `npm run lint`
- no unexplained warnings
- focused verification scripts included in lint scope

## Boundary verification

- `npm run architecture:audit`
- existing ownership, Understanding, persistence, trust and authority suites
- static proof that only the Operator Intelligence Repository accesses its
  tables
- no new baseline exception
- zero runtime dependency cycles
- trusted credentials remain server-only

## Performance verification

On a pinned PostgreSQL version and documented host:

1. Create empty, normal, production-shaped and hot-Operator fixtures.
2. Document cache-warming protocol and separate cold and warm results.
3. Execute at least 30 measured samples for each read and write scenario.
4. Exercise 1, 8 and 32 concurrent workers.
5. Record p50, p95, p99, rows examined and returned, buffers, planning and
   execution time, query count, memory and payload size.
6. Capture `EXPLAIN (ANALYZE, BUFFERS)` for every approved path.
7. Repeat after optimisation and retain before and after evidence.
8. Fail when an approved threshold is exceeded.

## Regression verification

- `npm run operator:ownership:verify`
- `npm run operator-understanding:verify`
- `npm run operator-intelligence:persistence:verify`
- `npm run operator-intelligence:authority:verify`
- `npm run operator-intelligence:trust:verify`
- `npm run guidance:verify`
- `npm run companion:presentation:verify`
- `npm run architecture:audit`
- `npm run desktop:compile`
- `npm run lint`
- `npm run build`

## Database verification

Against an isolated production-equivalent database:

- empty and production-shaped migration application
- exact migration hash confirmation
- schema, constraint, index, function, policy and grant inventory
- own-Operator visibility and cross-Operator isolation
- anonymous rejection and authenticated direct-write denial
- non-service-role RPC denial and service-role success
- exact retry and conflicting replay
- concurrent revision and admission scenarios
- monotonic revision and tombstone checks
- preservation of Operators, bindings and Sessions
- explicit rollback and independent post-rollback catalog comparison
- no permanent execution during Sprint 17

## Desktop verification

Sprint 17 has no desktop behaviour or contract change. Desktop verification is
regression-only:

- `npm run desktop:compile`
- Companion presentation verification
- proof that desktop and preload code do not import the Operator Intelligence
  Repository or trusted database client

Installer, packaging, signing, updater and production desktop smoke testing are
outside Sprint 17.

# 8. Founder Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Highest architectural risk:** A cache or read shortcut becomes a second source of truth and obscures ownership or freshness. | Low–Medium | Critical | Prohibit authoritative caching; preserve Service-to-Repository ownership; require an ADR before any cache receives lifecycle authority. |
| **Highest implementation risk:** Cursor and latest-eligibility semantics skip or duplicate claims under concurrent or backdated records. | Medium | High | Use query-bound keyset pagination and a read watermark; test mutation between pages; prohibit offset pagination. |
| **Highest production risk:** Migration 009 passes rehearsal but production permission, catalog or data conditions differ. | Medium | Critical | Pin the dossier to the exact hash, check catalog immediately before deployment, require backup, stop on drift and separately verify security after deployment. |
| **Highest performance risk:** Synthetic fixtures produce indexes that underperform for real Operators and increase write cost. | Medium | High | Use empty, normal, hot and skewed fixtures; measure reads and writes; preserve before and after plans; add only evidence-supported indexes. |

# 9. Sprint Success Criteria

Sprint 17 may be declared complete only when:

1. Every eligible-claim read is Operator-, purpose- and scope-filtered before
   its database limit is applied.
2. No approved current or history read can return more than 100 records per
   page.
3. Pagination uses a versioned opaque keyset cursor bound to the query and read
   watermark.
4. Traversal of a frozen query produces no duplicate or missing identifier.
5. Current-claim retrieval uses no more than four database round trips
   regardless of history size.
6. History retrieval uses no more than two database round trips per page.
7. A reconstructed claim contains no more than 32 Evidence references.
8. A Snapshot rejects more than 100 intelligence claims, 250 total items or
   512 KiB serialized size.
9. Exact Evidence, admission, claim-revision and eligibility retries create
   exactly one durable logical result.
10. Conflicting same-identity payloads fail without mutating the original.
11. Competing revisions produce one valid next head, no gap and typed stale
    conflicts.
12. Approved 32-worker scenarios pass repeatedly with no unexplained deadlock,
    duplicate or lost update.
13. Production-shaped paths meet the approved latency, memory, payload and
    query-count thresholds.
14. Every retained or added index has measured evidence or a documented
    integrity purpose.
15. No approved scale query performs an unbounded sequential scan or disk sort
    on a growing history table.
16. Ownership, RLS, service-role, anonymous and cross-Operator checks pass.
17. No new dependency-boundary exception or runtime cycle exists.
18. Build, lint, architecture, Operator, Guidance, Companion and desktop
    regression checks pass.
19. The exact final Migration 009 passes rollback rehearsal and independent
    catalog verification.
20. The deployment dossier identifies the exact commit and migration hash and
    is internally consistent.
21. Migration 009 remains undeployed at Sprint closure.
22. No producer, consumer, control operation, Application or Platform runtime
    has been activated.
23. Living documentation reflects verified repository reality.
24. Founder closure approval and the separately approved closure commit are
    complete.
25. The working tree is clean.

# Sprint Exit Governance

Completion or Founder closure of Sprint 17 does not authorise any subsequent
production objective, deployment or feature activation.

In particular, Sprint 17 completion does not authorise:

- **Sprint 18.** Operator Trust and Control requires its own approved Sprint
  Plan and explicit Founder activation after its dependencies and Gate 1 are
  satisfied.
- **Migration 009 deployment.** Permanent deployment requires a separate,
  explicit Founder migration decision based on the final version-pinned
  dossier.
- **Feature activation.** No Operator-facing or production capability may be
  enabled merely because the persistence boundary is scale-safe.
- **Platform activation.** Production Platform bootstrap and composition roots
  remain governed by Sprint 20 and require separate approval.
- **Candidate Generation.** No engine or adapter may create production
  Operator Intelligence candidates without later approved work and activation.
- **Understanding accumulation.** No durable production inference or claim
  accumulation is authorised by Sprint 17 closure.
- **Oracle Context consumption.** No Snapshot, claim or Understanding data may
  enter Oracle Context or another production consumer without its separately
  approved Sprint and Gate.

Each item requires separate Founder approval. Approval of one does not imply
approval of another. Sprint 17 closure evidence must preserve these inactive
states.

# 10. Founder Approval Checklist

Before Sprint 17 implementation begins, the Founder confirms:

- [x] Sprint 17 remains the next production objective.
- [x] The objective is scale-safe production readiness, not inference
  activation.
- [x] Migration 009 permanent deployment is excluded from Sprint activation.
- [x] Deployment requires a later, separate Founder decision.
- [x] Sprint 18 trust and control operations are out of scope.
- [x] Candidate generation and intelligence accumulation are out of scope.
- [x] Snapshot runtime and Oracle Context consumption are out of scope.
- [x] Application, UI, Platform activation and desktop behavioural work are out
  of scope.
- [x] Default page size 50 and hard maximum 100 are approved.
- [x] Claim and eligibility history maximum page size 100 is approved.
- [x] Maximum 32 Evidence references per reconstructed claim is approved.
- [x] Snapshot limits of 100 intelligence items, 250 total items and 512 KiB
  are approved.
- [x] The production-shaped fixture is approved as the controlled-Beta planning
  envelope.
- [x] The latency, query-count, payload and memory thresholds are approved as
  the starting gate.
- [x] Threshold changes after activation require evidence and Founder approval.
- [x] Query-bound keyset pagination with a read watermark is approved.
- [x] Exact replay returns the original result and conflicting replay fails.
- [x] Alternative-identifier duplicate Evidence or admission is rejected.
- [x] Typed stale-concurrency outcomes are required.
- [x] Real PostgreSQL concurrency verification is mandatory.
- [x] Index changes require measured evidence.
- [x] No new runtime dependency, cache or alternate persistence path is
  authorised.
- [x] No new ADR is required under the approved architecture.
- [x] A discovered ownership, privacy, security or Platform boundary change
  stops implementation for Founder review.
- [x] Any Migration 009 change invalidates and regenerates prior exact-file
  rollback and catalog evidence.
- [x] The final dossier is tied to the exact Migration 009 hash.
- [x] Post-commit recovery limitations are stated honestly.
- [x] Sprint closure does not imply Migration 009 deployment approval.
- [x] Gate 1 is not passed merely by completing Sprint 17.
- [x] The implementation phases and measurable success criteria are approved.
- [x] Sprint 17 was explicitly activated by the Founder on 22 July 2026.

# Approval Outcome

The Founder approved this Engineering Plan on 22 July 2026. The architectural
approach, scope, phases, deliverables, verification, migration separation,
risks, success criteria and approval process are accepted.

This approval authorises the Plan to be committed. It does not activate Sprint
17, authorise implementation or authorise Migration 009 deployment. Explicit
Founder activation remains required.
