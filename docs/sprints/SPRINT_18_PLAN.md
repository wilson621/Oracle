# ORACLE SPRINT 18 ENGINEERING PLAN

**Sprint:** 18 — Operator Trust and Control
**Authority:** Founder-approved Sprint Plan beneath the Oracle Engineering Programme
**Owner:** Oracle Platform Engineering
**Status:** Active — implementation authorised
**Classification:** Living approved Sprint Plan
**Expected Stability:** Scope changes require explicit Founder approval
**Prepared:** 24 July 2026
**Approved:** 24 July 2026
**Activated:** 24 July 2026
**Implementation:** Persistence architecture complete; Migration 010 certified
and deployment-ready
**Production:** Gate C intentionally deferred; no Sprint 18 production change

---

# Objective

Give every Operator meaningful agency over declarations, evidence-derived
intelligence and optional processing before Oracle activates production
inference or longitudinal Understanding accumulation.

This Plan implements the Sprint 18 production objective defined by
[`docs/ENGINEERING_PROGRAMME.md`](../ENGINEERING_PROGRAMME.md). The Founder
approved and activated this Plan on 24 July 2026 under
[`docs/GOVERNANCE.md`](../GOVERNANCE.md). Activation authorises implementation
within this Plan; it does not itself implement or deploy any capability.

# Vision Alignment

Oracle remains an Operator Intelligence Platform. Games are performance
environments in which Operator performance is expressed; they are not Oracle's
product identity.

The approved maturity model is:

```text
Trust
    ↓
Permitted Observation
    ↓
Admitted Evidence
    ↓
Operator Understanding
    ↓
Selective Memory
    ↓
Behavioural Intelligence
    ↓
Guidance
    ↓
Outcome Reassessment
    ↓
Prediction
```

This is a governance and long-term maturity model, not a strict runtime
dependency graph. It does not reorder the approved Engineering Programme.

Sprint 18 owns the first stage: operational trust and Operator control. It must
define control semantics capable of governing later Observation, Evidence,
Understanding and Memory without implementing those later capabilities.

# Confirmed Starting State

Oracle enters Sprint 18 preparation with:

- Oracle Platform v0.9 as the authoritative baseline
- Sprint 17 fully complete
- Migration 009 deployed and verified in production
- the production Operator Intelligence persistence foundation present
- all Migration 009 production tables empty
- runtime persistence consumption disabled
- no candidate producer, Understanding accumulator, Snapshot consumer,
  Context projection or personalisation path active
- authenticated Account-to-Operator ownership and database-enforced isolation
- immutable Understanding, Evidence, claim, declaration, policy, consent and
  evidence-disposition contracts
- bounded Repository reads, deterministic pagination, idempotency and
  concurrency verification
- no active Sprint

The approved governance commit establishes the reviewed, clean and synchronized
activation baseline.

# Objectives

Sprint 18 will:

1. operationalise purpose-specific consent and revocation;
2. operationalise Preference and Goal declaration control;
3. allow the Operator to inspect claims, Evidence references and explanations;
4. implement correction and dispute controls without destroying provenance;
5. provide a versioned Operator Understanding export;
6. implement approved item, purpose, game, domain and complete-Operator
   deletion semantics;
7. execute approved retention and evidence-disposition policy;
8. enforce content-free tombstones where retention is authorised;
9. prove that ineligible information leaves later consumption projections;
10. provide an authenticated Operator Trust Centre Application experience;
11. preserve the separate authority of Operator Service, Operator
    Intelligence Service, Memory policy and Repositories; and
12. keep production inference, longitudinal accumulation and runtime
    personalisation disabled.

# Scope

## In Scope

Sprint 18 is authorised, after explicit activation, to implement only:

- purpose-specific, effective-dated consent grant and revocation;
- policy-version binding for every optional processing decision;
- future-compatible controls for permitted observation categories without
  implementing observation capture;
- Preference and Goal declaration creation, revision, withdrawal and expiry;
- authenticated current-Operator claim inspection;
- bounded Evidence-reference, provenance, explanation and eligibility
  inspection;
- correction commands that create explicit revisions;
- dispute commands that immediately remove affected claims from eligibility;
- versioned, deterministic and bounded Operator Understanding export;
- item-level deletion;
- purpose-level deletion;
- Game Integration-scope deletion;
- Understanding-domain deletion;
- complete-Operator deletion orchestration distinct from Account deletion;
- approved retention-policy execution;
- approved Evidence disposition and source-owner coordination;
- content-free tombstone enforcement;
- explicit atomic or recoverable operation outcomes;
- idempotent control-command behaviour;
- Operator-safe operation progress, failure and recovery semantics;
- an authenticated Operator Trust Centre Application that consumes Services;
- proof that revoked, disputed, withdrawn, expired or deleted information is
  excluded from subsequent eligible projections;
- two-Operator, anonymous and privilege-boundary verification;
- focused performance and result-size budgets for control, inspection and
  export paths;
- the minimum additive persistence change demonstrated necessary by a fresh
  deployed-schema audit;
- rollback, catalog, security and preservation evidence for any proposed
  database migration;
- documentation reconciliation and Sprint closure evidence.

## Explicit Exclusions

Sprint 18 is not authorised to implement or activate:

- observation capture, OCR, computer vision or desktop observation processing;
- automatic promotion of an Observation into Evidence;
- Session evidence admission owned by Sprint 21;
- candidate generation or a Memory Engine candidate adapter;
- Operator Understanding accumulation owned by Sprint 22;
- production `OperatorUnderstandingSnapshot` construction or consumption;
- Oracle Context projection;
- Behavioural Intelligence activation;
- coaching, Guidance, Prediction or personalisation;
- automatic cross-game portability or Operator-wide promotion;
- sensitive, psychological, health, protected-characteristic or comparable
  personal inference;
- AI-generated Operator claims;
- a generic human-performance platform beyond Oracle's governed gaming scope;
- Platform bootstrap or production composition-root activation;
- runtime Service registration belonging to Sprint 20;
- Account creation, recovery or desktop identity work belonging to Sprint 19;
- authoritative Session lifecycle changes belonging to Sprint 21;
- live Companion Guidance;
- a new architectural layer, global profile, source of truth, cache or
  alternate persistence path;
- changes to Guidance contract version 1 or Desktop Platform API version 1;
- wholesale renaming or reconstruction of existing engines and Applications;
- unrelated legacy Application remediation;
- permanent database deployment without a separate Founder decision;
- production inference or accumulation following a control-plane deployment;
- Sprint 19 or later work.

# Architectural Ownership

Sprint 18 must preserve:

| Responsibility | Authoritative owner |
|---|---|
| Account authentication | Supabase Auth |
| Account-to-Operator ownership | Operator Service and Operator Repository |
| Identity, Preference and Goal control | Operator Service |
| Evidence-reference and claim lifecycle | Operator Intelligence Service |
| Retention, decay and eligibility policy | Memory Service policy boundary |
| Persistent data access | Repositories |
| Trust Centre orchestration and presentation | Oracle Application |
| Game-specific observation meaning | Game Integrations |
| Raw source Evidence | Existing authoritative source owner |

The Trust Centre may coordinate approved Services. It must not become a new
source of truth or lifecycle authority.

# Lifecycle Rules

Sprint 18 implementation must follow proposed ADR-037, ADR-038 and ADR-039
after Founder acceptance.

At minimum:

- optional Observation requires applicable permission before capture;
- Observation remains transient unless explicitly admitted as Evidence;
- Evidence admission requires purpose, provenance, scope, policy, quality and
  an authoritative source;
- Evidence does not automatically become Understanding;
- Understanding does not automatically enter Memory;
- Memory does not replace Evidence or Understanding authority;
- presentation cannot promote an epistemic class or widen scope;
- revocation stops future optional processing for the affected purpose;
- dispute makes affected inferred information immediately ineligible;
- correction creates a revision rather than mutating history;
- deletion cannot leave prohibited content in revisions, audit records or
  tombstones; and
- no control outcome may activate downstream inference or personalisation.

# Required Deliverables

## D1 — Configurable governed policy set

A versioned policy infrastructure capable of defining:

- permitted processing purposes;
- consent applicability and revocation effect;
- declaration lifecycle rules;
- retention classes and durations;
- operational deletion, eligibility removal, legally required retention and
  physical deletion semantics;
- deletion completion and Operator-facing status expectations;
- approved audit metadata;
- tombstone justification and permitted fields;
- backup and restore treatment;
- external-processor treatment;
- export version and bounds; and
- operation recovery expectations.

No implementation may invent or hard-code a missing policy value. An undefined
policy value must remain explicitly unconfigured and must not silently enable
optional processing, retention or promotion. Policy values can be supplied and
versioned through the approved governance interface without changing code.

## D2 — Immutable control contracts

Presentation-independent contracts for:

- consent decisions;
- declaration commands and results;
- claim inspection;
- Evidence and explanation inspection;
- correction and dispute;
- export;
- scoped deletion;
- complete-Operator deletion orchestration;
- retention execution;
- Evidence disposition;
- operation receipts and recoverable status; and
- typed authentication, ownership, immutable-conflict, stale-concurrency and
  policy failures.

Applications must not supply an arbitrary Operator identifier.

## D3 — Persistence and Repository boundary

A fresh deployed-catalog audit and the minimum required Repository and
persistence changes.

If a schema change is required, its identity, number and contents are decided
only after the audit. This Plan does not pre-authorise a Migration 010 or any
particular table, function or index.

## D4 — Operator Service controls

Operational Identity, Preference and Goal inspection and lifecycle commands
through authenticated current-Operator semantics.

## D5 — Operator Intelligence controls

Operational consent-sensitive claim, Evidence-reference, explanation,
correction, dispute, eligibility and deletion behaviour through the exclusive
Operator Intelligence Service authority.

## D6 — Retention and deletion orchestration

Policy-owned retention and deletion execution that:

- distinguishes raw source Evidence from derived Understanding;
- removes or de-identifies prohibited content;
- coordinates authoritative owners explicitly;
- is atomic where possible;
- exposes recoverable progress where atomic completion is impossible;
- is idempotent; and
- never implies completion before all approved live-system steps complete.

## D7 — Versioned export

A deterministic, bounded, machine-readable export preserving:

- declarations;
- claims;
- epistemic classification;
- confidence;
- Evidence references;
- provenance;
- scope;
- lifecycle;
- temporal validity;
- eligibility;
- retention state; and
- policy versions.

The export must contain only the authenticated current Operator's information.

## D8 — Operator Trust Centre Application

An authenticated Application experience for:

- consent and optional-processing controls;
- Preference and Goal management;
- claim, Evidence and explanation inspection;
- correction and dispute;
- export;
- retention visibility;
- scoped deletion;
- complete-Operator deletion;
- operation progress and recovery; and
- truthful loading, empty, unavailable, failure and completion states.

React and presentation components render Application-owned models and contain
no Repository access or business policy.

## D9 — Projection exclusion proof

Deterministic proof that revoked, disputed, withdrawn, expired and deleted
information is absent from every approved subsequent eligibility or control
projection without activating the Sprint 22 production Snapshot.

## D10 — Verification and closure evidence

Focused contract, Service, Repository, database, security, privacy,
performance, Application, accessibility, architecture and regression evidence,
plus documentation and Sprint closure records.

# Implementation Phases After Activation

## Phase 0 — Activation baseline

- approve this Plan;
- accept required ADRs;
- approve policy values;
- reconcile required governing terminology;
- verify clean and synchronized repository state;
- verify Oracle Platform v0.9 and production state;
- confirm runtime persistence remains disabled; and
- record explicit Sprint activation.

No implementation occurs in Phase 0.

## Phase 1 — Current-state and deletion-topology audit

- audit deployed schema, grants, RLS, functions, data and source owners;
- map declarations, Evidence, claims, eligibility, Sessions, Memory
  projections, backups and external processors;
- identify every content-bearing path affected by each deletion scope;
- establish bounds and recovery requirements; and
- produce the minimum implementation proposal.

Founder gate: approve the audited implementation shape before schema or
control-path implementation.

## Phase 2 — Contracts and policy validation

- implement immutable control contracts;
- implement policy validation;
- implement lifecycle matrices;
- implement typed command outcomes; and
- verify serialization, immutability, idempotency and scope.

No production registration or UI activation occurs.

## Phase 3 — Repository and persistence implementation

- implement the approved minimum Repository changes;
- implement an additive migration only if the audit proves one necessary;
- preserve existing ownership and trust boundaries;
- perform static, rollback and independent catalog verification; and
- stop before permanent deployment.

Founder gate: any permanent migration requires a separate deployment decision.

## Phase 4 — Service controls

- implement authenticated Operator Service controls;
- implement Operator Intelligence inspection and lifecycle controls;
- implement Memory policy execution;
- implement export and deletion orchestration; and
- verify immediate ineligibility and recoverability.

No inference producer or consumer is activated.

## Phase 5 — Trust Centre Application

- compose approved Services through a request-scoped boundary;
- implement Application-owned presentation state;
- implement accessible Operator interactions and confirmations; and
- preserve truthful operation status and recovery.

Before Next.js implementation, read the relevant installed Next.js 16.2.10
guidance under `node_modules/next/dist/docs/`.

## Phase 6 — Full verification

- run focused and regression verification;
- perform independent two-Operator and deletion-residue tests;
- verify bounds and accessibility;
- verify no runtime inference or downstream consumption;
- reconcile living documentation; and
- assemble the closure dossier.

## Phase 7 — Founder closure

- Founder reviews acceptance evidence;
- unresolved risk or deferred work is recorded;
- Founder approves or rejects closure;
- an approved closure commit is created; and
- push or later release activity remains separately authorised.

# Verification Strategy

## Contract verification

- serialization and deep immutability;
- purpose, policy, scope and provenance validation;
- declaration and claim lifecycle matrices;
- correction-as-revision;
- content-free tombstone validation;
- malformed, executable and non-serializable input rejection;
- sensitive-inference rejection;
- no implicit scope widening; and
- deterministic export schema validation.

## Service verification

- authenticated current-Operator resolution;
- rejection of caller-selected Operator identity;
- purpose-specific consent grant and revocation;
- declaration revision, withdrawal and expiry;
- claim, Evidence and explanation inspection;
- immediate dispute ineligibility;
- correction provenance;
- idempotent control-command retry;
- immutable and stale-concurrency outcomes;
- recoverable multi-owner orchestration; and
- no Repository authority in Applications.

## Database and Repository verification

- exact migration hash if a migration exists;
- schema, constraint, index, function, policy and grant inventory;
- own-Operator visibility;
- two-Operator cross-access rejection;
- anonymous rejection;
- authenticated direct-write denial;
- trusted-operation authority;
- same-Operator relational integrity;
- concurrent revoke, dispute, correction, eligibility and deletion scenarios;
- exact retry and conflicting replay;
- row-count and protected-data preservation;
- rollback and independent post-rollback catalog comparison; and
- no residue from verification transactions.

## Deletion and retention verification

For every approved deletion scope:

- enumerate affected authoritative records before execution;
- execute the approved operation;
- verify expected retained and removed counts;
- scan revisions, Evidence links, audits and tombstones for prohibited content;
- verify later projections exclude removed information;
- verify retry safety;
- verify partial-failure recovery;
- verify backup and restore reapplication behaviour; and
- verify another Operator remains unchanged.

## Export verification

- deterministic output for a fixed as-of boundary;
- required provenance, scope, confidence, lifecycle and policy fields;
- bounded item count and serialized size;
- no raw source content beyond approved export policy;
- no cross-Operator data;
- deleted-content exclusion; and
- schema-version compatibility.

## Application and accessibility verification

- authenticated route protection;
- Service-only data access;
- loading, empty, unavailable, partial, failed, recovery and completed states;
- clear distinction between revocation, deletion request and completed
  deletion;
- keyboard navigation;
- focus management;
- contrast and colour-independent meaning;
- destructive-action confirmation; and
- narrow and desktop layout review.

## Architecture and regression verification

- `npm run architecture:audit`;
- Operator ownership, Understanding, persistence, authority and trust suites;
- Guidance and Companion verification;
- desktop TypeScript compilation;
- lint;
- production build;
- `git diff --check`;
- no new dependency exception or cycle;
- no client access to trusted credentials;
- no Platform bootstrap activation;
- no candidate producer, Snapshot consumer or Context projection; and
- clean-tree inspection at closure.

Existing verified systems are rerun only where needed to prove non-regression;
they are not rebuilt or redesigned.

# Performance and Safety Budgets

Exact thresholds must be approved from the Phase 1 audit. At minimum:

- every inspection and history read is bounded and paginated;
- export has explicit item and byte limits;
- deletion orchestration has bounded batches and resumable checkpoints where
  one transaction is unsafe;
- no request loads complete unbounded Operator history into memory;
- control-path query counts do not grow with total history where a bounded page
  is requested; and
- revoked or disputed information becomes ineligible within the authoritative
  control transaction.

# Deployment Gates

## Gate A — Planning and activation

Required before implementation:

- Founder approval of this Plan — satisfied 24 July 2026;
- acceptance of ADR-037, ADR-038 and ADR-039 — satisfied 24 July 2026;
- unresolved policy values represented as explicit configurable inputs rather
  than hard-coded defaults;
- clean synchronized repository at the activation commit;
- confirmed Oracle Platform v0.9 baseline; and
- explicit Sprint 18 activation — granted 24 July 2026 upon establishment of
  the clean synchronized activation baseline.

## Gate B — Migration implementation

Required before implementing a migration:

- fresh deployed-schema audit;
- approved proof that schema change is necessary;
- approved additive design and ownership;
- no assumption that the next migration number or structure is predetermined.

## Gate C — Permanent database deployment

Migration 010 is the Founder-approved production candidate. Gate C execution
is intentionally deferred until immediately before the first production
release requiring Operator Trust and Control persistence. Development may
assume the approved persistence architecture is complete, but must not assume
that Migration 010 exists in production or activate a production dependency
on it.

Required before any permanent execution:

```text
Static verification
    ↓
Exact rollback validation
    ↓
Independent catalog verification
    ↓
Founder deployment review
    ↓
Artifact hash and backup verification
    ↓
Permanent execution
    ↓
Catalog, security and isolation verification
    ↓
Founder deployment closure
```

Any error stops the sequence. No repair, alteration or second attempt is
authorised without new Founder review.

## Gate D — Control-path production activation

A schema deployment does not activate control Services or Applications.
Production control-path activation requires:

- deployed prerequisites;
- request-scoped authenticated composition;
- security and privacy verification;
- complete failure and recovery behaviour;
- explicit Founder approval; and
- proof that inference, accumulation and personalisation remain disabled.

## Gate E — Sprint closure

Closure does not activate Sprint 19, inference, runtime persistence consumers,
production release, push or tagging.

# Acceptance Criteria

Sprint 18 may be declared complete only when:

1. Every control operation resolves the authenticated current Operator.
2. No Application can select an arbitrary Operator or access a Repository.
3. Consent is purpose-specific, versioned, effective-dated and revocable.
4. Revocation prevents future optional processing for the affected purpose.
5. Revocation removes affected information from subsequent eligible
   projections.
6. Preference and Goal declarations support revision, withdrawal and expiry.
7. Corrections create explicit revisions and preserve permitted provenance.
8. Disputes make affected inferred information immediately ineligible.
9. Claims, Evidence references, explanations, scope, confidence, lifecycle,
   eligibility and policy versions are inspectable.
10. Export is deterministic, versioned, bounded and complete for its approved
    schema.
11. Export cannot contain another Operator's information.
12. Item, purpose, game, domain and complete-Operator deletion pass.
13. Account deletion and complete-Operator deletion remain distinct.
14. Every operation is atomic or exposes an explicit recoverable state.
15. Exact command retries create one logical result.
16. Competing commands produce typed, deterministic outcomes.
17. Retention execution, including any legally required retention, follows
    only Founder-approved policy values and authority.
18. Raw Evidence and derived Understanding follow separate retention and
    deletion rules.
19. Audit records contain no prohibited personal content.
20. Tombstones are content-free and exist only where policy authorises them.
21. Deleted content cannot be recreated unsafely from retained derived state.
22. Operational deletion, eligibility removal, legally required retention,
    physical deletion, backup and restore states are documented, tested and
    truthfully represented.
23. Independent two-Operator isolation passes for read, export and control
    operations.
24. Anonymous access, authenticated direct mutation and unapproved trusted
    operations are denied.
25. Control, inspection, export and deletion paths remain within approved
    bounds.
26. The Trust Centre is complete, truthful and accessible for the approved
    scope.
27. No Observation capture, candidate generation, Understanding accumulation,
    Snapshot runtime, Context projection, Behavioural Intelligence, Guidance,
    Prediction or personalisation is activated.
28. No new layer, source of truth, cache, dependency exception or runtime cycle
    exists.
29. Relevant focused and regression verification passes.
30. Living documentation reflects verified reality.
31. Founder closure approval and the approved closure commit are complete.
32. The working tree is clean.

# Closure Requirements

Sprint closure requires:

- approved production objective satisfied;
- every acceptance criterion evidenced;
- architecture and ownership review;
- privacy and deletion residue review;
- security and two-Operator isolation review;
- migration and deployment evidence where applicable;
- focused and regression verification results;
- accessible Trust Centre walkthrough;
- explicit list of deferred work and known limitations;
- Constitution, Strategy, Architecture, Programme, Master Build Plan, Project
  Board, Sprint Index and Implementation Status reconciled where required;
- Founder closure approval;
- approved closure commit; and
- clean repository state.

Push, release, tag, Sprint 19 activation and any downstream inference remain
separate Founder decisions.

# Founder Governance Resolution

The Founder approved this Plan, accepted ADR-037, ADR-038 and ADR-039, approved
the Operator-first constitutional and architectural reconciliation, and
authorised Sprint 18 implementation on 24 July 2026 upon establishment of the
clean synchronized governance baseline.

No further pre-implementation governance approval is required.

Where policy values remain undefined—including consent taxonomy, retention
durations, legally required retention particulars, audit and tombstone fields,
export bounds or processor-specific rules—Sprint 18 must implement configurable
versioned policy infrastructure rather than hard-coded values. Undefined values
must fail closed for optional processing and cannot acquire authority merely
because an implementation path exists.

# Activation Declaration

Sprint 18 is active from the clean synchronized governance baseline created
from this approval.

Activation:

- authorises implementation only within this approved Plan;
- does not represent implementation progress;
- does not authorise a database migration without Gate B;
- does not authorise permanent database execution without Gate C;
- does not activate production control paths without Gate D;
- does not activate inference, accumulation or personalisation;
- leaves runtime persistence disabled; and
- preserves Oracle Platform v0.9 as the canonical starting baseline.
