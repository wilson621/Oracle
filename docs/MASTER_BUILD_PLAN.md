# ORACLE MASTER BUILD PLAN

**Authority:** Canonical approved engineering execution plan beneath the Engineering Programme, Roadmap and Architecture
**Scope:** Current execution objective, sequencing, completion criteria and known boundaries
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever approved execution direction changes
**Supersedes:** Earlier active Master Build Plan versions
**Superseded By:** None
**Last Reviewed:** 3 August 2026
**Version:** 5.3

---

# Purpose

The Master Build Plan is Oracle's execution document.

The Founding Charter defines why Oracle exists.

The Oracle Way defines how Oracle stewards behave.

The Constitution defines binding product and architectural constraints.

Oracle Strategy defines long-term strategic direction.

The Engineering Principles and Codex govern how Oracle is built.

The Architecture defines how Oracle is organised.

The Roadmap defines where Oracle is going.

The Project Board defines current progress.

The Master Build Plan defines what the engineering team is building next.

This document should always reflect the current implementation plan.

---

# Oracle Mission

Oracle's canonical mission is defined in
`docs/founding/ORACLE_FOUNDING_CHARTER.md`. This plan translates approved
Roadmap direction into engineering execution and must not redefine the mission.

---

# Engineering Principles

The canonical durable principles are defined in
`docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md`. The Oracle Codex supplies the
operational workflow and quality gates. This plan records only execution-specific
requirements.

---

# Current Platform

Oracle is now organised into four permanent architectural layers.

```text
Oracle Platform
        │
        ▼
Oracle Services
        │
        ▼
Oracle Applications
        │
        ▼
Game Integrations
```

This architecture was established during Sprint 8 and forms the permanent foundation for all future development.

---

# Latest Approved Execution Status

Sprint 17 through Sprint 19 are complete. Sprint 18 remains immutable.
Sprint 19 — Account, Identity and Commissioning has delivered the atomic
provisioning boundary, Founder-selected
authentication and identity behavior, application journeys and inactive
Desktop credential custody. Migrations 011 and 012 are certified but neither
deployed nor activated.

Sprint 16 — Trust Boundary is complete at
`58589b52de0db341e6518fa9f235bb18854e6b30`. It was executed under the
transitional alias Sprint 15.5A.

Sprint 17 — Scale-Safe Trust Data Plane has completed its nine approved
implementation phases and its separately authorised production deployment. Its
former planning alias was Sprint 15.5B and its earlier proposed name was Scale
Hardening. Migration 009 is deployed and verified, establishing the production
persistence foundation without enabling runtime persistence.

`docs/ENGINEERING_PROGRAMME.md` is the authoritative Sprint 17–Beta Programme.
Sprint 18 closure is recorded in `docs/sprints/SPRINT_18_CLOSURE.md`.
Migration 010 is certified and deployment-ready, but Gate C is intentionally
deferred and production remains pre-Migration-010.

Sprint 19 proceeds under the independent Implemented, Certified, Deployed and
Activated lifecycle states. Development verification preserves the canonical
future chain while production remains on its approved post-Migration-009
baseline. Runtime persistence remains disabled.

Sprint 20 — Platform Runtime Activation is complete, certified and
Founder-accepted under ADR-040. Its target-specific roots, canonical manifests
and shared injected runtime remain undeployed and inactive. Production
deployment, migration execution and runtime persistence remain unauthorised.

Sprint 21 — Oracle Session and Evidence Lifecycle is complete, certified and
Founder-accepted under ADR-041. The Session Service permanently owns the
durable lifecycle. Migration 013 remains undeployed and inactive. Sprint 22 is
complete, certified and Founder-accepted. No Migration 014 was required and
persisted accumulation remains inactive. Sprint 23 is complete, certified and
Founder-accepted without a new migration. Sprint 24 is complete, certified and
Founder-accepted under ADR-042. Migration 014 is undeployed and inactive.
Sprint 25 is complete, certified and Founder-accepted under ADR-043 with no
Migration 015 or retention. Sprint 26 is complete, certified and
Founder-accepted using Guidance v1 and Desktop Platform API v1. Sprint 27
Option A, ADR-044 and ADR-045 are approved; its bounded Minecraft Java
`26.1.1` source implementation and synthetic certification are complete. Live
observation is provisional and disabled under Operational Certification
Deferred — Required Test Environment Unavailable. Sprint 27 is
Founder-accepted and closed while its compatibility profile remains
provisional and observation remains disabled. Sprint 28 Option A is complete,
locally certified, Founder-accepted and closed. Its Product Truth Inventory,
canonical eight-destination journey, mock removal, route convergence and
Web/Electron walkthrough establish the truthful product baseline. Sprint 29
Option A is complete, locally certified, Founder-accepted and closed under
ADR-046. Its governed MSIX implementation, signed Release Manifest equality
and current-host install/update/repair/rollback/uninstall certification are
accepted. The independent clean-machine lifecycle was subsequently qualified
by Stage 3 R9 for the accepted Stage 2 R2 package. Sprint 30
Option A and ADR-047 are Founder-approved. Phases 1 through 5 are complete and
locally verified. Sprint 30.5 Stage 1 Environment Admission is
Founder-accepted and closed with frozen transfer, controlled non-pristine
host, isolated network, standalone GPU and cleanup evidence. It does not
satisfy clean Windows qualification. Historical Stage 2 constructed and
mechanically verified a local-only package and signed Release Manifest
reconciled to Runtime Manifest `1.7.0`; it remains Founder-accepted, closed
and immutable, and all temporary signing material and trust were removed.
Post-freeze product-source corrections mean that historical candidate no
longer qualifies the current source revision. Sprint 30.5 Stage 2
Requalification R1 is Founder-accepted and formally closed. Accepted attempt
`r1-20260728T190335052Z-d2ffe76a` qualifies candidate
`cd3b7ca1a49d53d85a718a24d594267c93531994` for current-source Candidate
Freeze and Package Reconciliation with frozen, hash-bound evidence.

R1 remains accepted and immutable. Its remaining certificate-validity window
could not safely accommodate the complete Stage 3 preparation and execution
lifecycle. Stage 2 Requalification R2 was separately Founder-authorised as a
replacement-candidate refresh. Its isolated local-test certificate has a
maximum 30-day validity budget and exact teardown remains mandatory.

R2 attempt `r2-20260728T203503018Z-ec577cf4` passed and was independently
reconciled at candidate and harness commit
`11475fe01fff2ec69f0188547107f4e901c531d7`. Its final evidence manifest
SHA-256 is
`84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d`.
The Founder accepted the result and R2 is formally closed. Candidate
`11475fe01fff2ec69f0188547107f4e901c531d7` remains the package historically
qualified by Stage 3 R9.

Migration 011/012 corrections created candidate
`a7fc67f207d9c95407c70812828fa66bd487285d`, tree
`356f6d52f1bf70065692e892af8bf916acc8727a`. Stage 2 Requalification R3
attempt `r3-20260731T171651908Z-9a8a2532` passed, was Founder-accepted and is
formally closed with final evidence manifest SHA-256
`79ae9b219f24c8f61c48b6e3a0094d1730f72fe29a932e02ff1e92f7b07c1229` and
archive SHA-256
`82ad4a46721c2ab0e7103c57f192394887844fd4c311ec3fcea92d2ba05e0688`.
The corrected candidate is the accepted Stage 2 baseline for a later,
separately authorised Stage 4 preparation decision.

Stage 3 Clean Windows Qualification is Founder-accepted and formally closed.
Any further Stage 3 execution is unauthorised.
Stage 3 R1 and failed R2-R8 remain immutable. Passing R9 attempt
`stage3-r9-20260730T221251043Z-71af9db7` completed all fourteen governed
lifecycle phases on `Founder-QA-01`, including clean-host admission, package
installation, direct activation, native runtime and repair observation,
package removal, machine-trust teardown, zero-residue cleanup and immutable
evidence freeze. The final evidence manifest SHA-256 is
`19a8248a06b37d5fac73b42d35ac96049d3ede09249360b064d9dd692d07defe`
and the archive SHA-256 is
`5eadd80469edcafbe62cd461404c9a2bd782eb1393e542b78969784925e2f41e`.

Stage 4 R1 is Founder-accepted and formally closed. Passing attempt
`stage4-r1-20260803T093803115Z-7fc6b185` completed all thirteen phases and
ten journeys from preparation commit
`3994d483a4a7fc8dfe91a7d21c7c54d1d10a72c3`. Final manifest SHA-256 is
`1f516e1f7d1b30d88c8e9fbd22774068bd9c7071935cc415b1d1243b7b5d4c9d`,
archive SHA-256 is
`91116098c123c960ba736114176c08876f7a4f66b0b777efbcb2bda1e53d2a15`,
and final residue is zero.

Stages 5-7 remain unstarted and unauthorised. Stage 5 planning requires a
separate Founder decision. Accepted Stage 1-4 evidence remains immutable.
Production signing, publication, distribution, deployment and release remain
unauthorised.

The delivery hierarchy is governed by `docs/GOVERNANCE.md`: the Roadmap owns
vision and strategic direction, Epics own major capabilities, Sprints own
independently reviewable production objectives and Phases are internal
implementation stages.

## Sprint 16 — Trust Boundary

**Branch:** `sprint-9-overlay`
**Status:** Complete — founder closure approved, committed and pushed
**Historical execution alias:** Sprint 15.5A
**Closure commit:** `58589b52de0db341e6518fa9f235bb18854e6b30`

Sprint 16 delivered exclusive server-side Operator Intelligence mutation
authority, trusted authenticated ownership injection, global policy
definitions, append-only consent and evidence dispositions, immutable
admissions, stable Game Integration provenance and service-role-only durable
persistence. Candidate generation, runtime accumulation and consumption remain
inactive.

## Sprint 17 — Scale-Safe Trust Data Plane

**Status:** Complete — Founder-approved and closed
**Historical planning alias:** Sprint 15.5B
**Closure evidence commit:** `e873b515a149d392850cf4c6e0c00cfb4ecd3313`

The implemented Programme objective makes the Operator Intelligence
persistence boundary safe for a separate controlled-production decision. It includes
bounded purpose-scoped reads, deterministic pagination, measured query
optimisation, required indexes, Snapshot budgets, concurrency verification,
automated boundary enforcement and the version-pinned Migration 009 deployment
dossier. The separately Founder-approved Migration 009 production deployment
completed successfully and passed post-deployment verification. No runtime
activation occurred.

## Sprint 18 — Operator Trust and Control

**Status:** Complete — Founder-approved and closed
**Plan:** `docs/sprints/SPRINT_18_PLAN.md`
**Activation date:** 24 July 2026

Sprint 18 operationalises consent, declarations, inspection, correction,
dispute, export, retention and deletion control before production inference.
Undefined Founder policy values must be represented through configurable,
versioned policy infrastructure rather than hard-coded defaults.

The accepted outcome includes governance, contracts, persistence architecture,
Repository ownership and verification. Gate C and the unstarted Service
controls and Trust Centre remain deferred. Runtime persistence, inference,
Understanding accumulation, personalisation and production control paths
remain disabled.

## Historical Sprint 15 — Operator Intelligence: Operator Understanding Foundation

**Branch:** `sprint-9-overlay`
**Status:** Historical — approved foundation Phases 1 through 3 complete
**Plan:** `docs/sprints/SPRINT_15_PLAN.md`

Sprint 15 establishes the trusted foundation for Oracle to build a
progressively deeper understanding of every Operator. Operator Understanding
is the umbrella over Account relationship, explicit Identity, declared
Preferences and Goals, temporary State, governed Memory, permitted Evidence
and evidence-derived Operator Intelligence.

The approved implementation outcome is deliberately narrow:

- canonical authenticated Account-to-Operator ownership and RLS
- separate Preference and Goal models
- immutable Evidence, Claim, Revision and Data Policy contracts
- provenance, Known / Declared / Observed / Inferred / Suspected / Unknown
  epistemic classification, confidence, scope and temporal lifecycle
- Operator inspect, correction, dispute, export and deletion operations
- one Game Integration-specific candidate family adapted from the existing
  Memory Engine
- an immutable, versioned `OperatorUnderstandingSnapshot` read projection
- safe, gated Oracle Context integration

Existing engines remain intelligence producers. The Understanding projection
does not own truth, and no engine output becomes durable understanding merely
because it exists.

Phase 1 delivered:

- authenticated one-to-one Account-to-Operator bindings
- Repository-owned persistence and Operator Service-owned resolution
- RLS and least-privilege grants for bindings, Operators, Sessions and
  achievements
- authenticated local-development behaviour matching production
- preservation of existing Operator identifiers and Session history without
  speculative backfill
- permanent, dedicated fixtures reserved only for migration, ownership, RLS,
  authentication and security regression testing
- verified anonymous rejection and authenticated cross-Operator isolation

Phase 2 delivered:

- immutable, versioned contracts for Identity, Preferences, Goals, State,
  Evidence, Intelligence claims, revisions, data policies and Understanding
  projection
- structural Known, Declared, Observed, Inferred, Suspected and Unknown
  classification
- separate evidence quality, producer-native confidence and accepted claim
  confidence
- deterministic, versioned and evidence-backed explanations owned by accepted
  claim revisions
- explicit claim and declaration lifecycle validation, monotonic revisions,
  expiry semantics and content-free deletion tombstones
- interface-only Operator Declaration, Operator Intelligence and Operator
  Understanding Service contracts
- immutable, purpose-scoped `OperatorUnderstandingSnapshot`
- focused contract, lifecycle and Service verification

Phase 2 introduced no persistence, migration, Repository, engine adapter,
runtime Service registration, Context projection, Application consumption,
control operation or UI. Those responsibilities remain gated to their approved
later phases.

Phase 3 delivered:

- a six-table, Operator-owned persistence model for policy versions, minimal
  Evidence references, stable claims, immutable revisions, evidence links and
  append-only eligibility assessments
- durable deterministic explanations embedded in immutable claim revisions
- composite Operator ownership constraints, indexes, RLS and least-privilege
  grants
- authenticated atomic functions for immutable policy registration, revision
  persistence and eligibility append
- a dedicated `SupabaseOperatorIntelligenceRepository` that validates Phase 2
  contracts and is the sole application-code owner of the new tables
- exact rollback validation, independent catalog verification and
  transactional ownership, isolation, anonymous-rejection and direct-write
  denial checks

The tracked Phase 3 migration is not permanently deployed. It preserved all
deployed Operator, Session and binding truth during rollback validation and
requires separate founder approval before permanent execution. Phase 3 adds no
runtime Service registration, intelligence producer, Understanding projection,
Context integration, Application consumption, control operation or UI.

Explicit exclusions include broad UI, sensitive or psychological inference,
automatic cross-game promotion, AI-generated Operator claims, Companion
personalisation, authoritative live Companion Guidance delivery, public
contract changes and wholesale architecture migration.

The binding Sprint decisions are:

1. ADR-033 — canonical Account and Operator ownership
2. ADR-034 — Operator Understanding and Intelligence lifecycle
3. ADR-035 — Operator data governance and control
4. ADR-036 — game scope and cross-game portability

The execution phases are:

```text
Committed Planning Baseline
        ↓
Ownership Foundation
        ↓
Understanding Contracts
        ↓
Persistence and Migration
        ↓
Narrow Candidate Lifecycle
        ↓
Context and Control Services
        ↓
Verification, Documentation and Closure
```

Authoritative Companion Guidance delivery was deferred at this historical
point. Sprint 26 later implemented, certified and closed that delivery seam.
Sprint 16 remains the completed Trust Boundary objective.

## Earlier Closed Sprint — Sprint 14 Companion Intelligence Foundation

**Branch:** `sprint-9-overlay`
**Status:** Complete; closure approved and documentation reconciled

Sprint 14 transformed the Companion from a game detector into the reusable
foundation for an intelligent external second-screen assistant. The completed
architecture is:

```text
Platform Guidance contracts
        ↓
Services provider orchestration
        ↓
Applications presentation models
        ↓
React Companion presentation

Game Integrations contribute reviewed knowledge packages through the shared
contracts and Services boundary.
```

Verified completed work:

- immutable, versioned, confidence-aware and source-attributed Guidance
  Framework contracts
- deterministic, dependency-injected Guidance Provider Service with structured
  failure isolation
- first curated Call of Duty Guidance package as the canonical Game Integration
  contribution pattern
- immutable Companion Guidance Application state and presentation view models
- `/companion` React presentation for loading, ready, empty, partial-success
  and unavailable states
- ADR-032 and Companion architecture documentation
- focused contract, Service, package, Application and presentation verification
- architecture audit, desktop compilation, production web build and lint

Formal Sprint 14 implementation commits:

1. `1ed10bb` — `feat(companion): define immutable guidance framework contracts`
2. `c93063b` — `feat(companion): add deterministic guidance provider service`
3. `918a67c` — `feat(game-integrations): add curated Call of Duty guidance package`
4. `b82bb49` — `feat(companion): add guidance application boundary`
5. `3868975` — `feat(companion): add Companion application presentation`

At Sprint 14 closure, authoritative live runtime delivery remained deferred
and the production route presented an honest unavailable state. Sprint 26
later resolved that historical seam through a transient Desktop-owned
coordinator and restricted renderer boundary without changing Guidance v1,
Desktop Platform API v1 or Session authority.

Known integration boundaries requiring deliberate review:

- web pages do not consistently consume Services through Applications.
- authoritative Companion Guidance delivery was not wired at Sprint 14
  closure; Sprint 26 has now resolved this item.
- Platform Companion readiness and Desktop Session ownership are contractually
  composed but intentionally not merged.
- curated source freshness is now enforced by the Sprint 26 execution policy.
- ready and partial-success presentation paths now receive validated runtime
  Application state through the restricted desktop bridge.
- Desktop Platform API version 1 is frozen through
  `desktop/platform/index.ts`; internal implementations remain private.

See `docs/architecture/IMPLEMENTATION_STATUS.md` for the canonical verified
status.

---

# Historical Release Baseline

## Version

v0.8.0 — Platform Foundation

## Status

✅ Complete

## Outcome

Sprint 8 established Oracle as the operating platform for gaming intelligence.

Major deliverables:

- Oracle Platform Bootstrap
- Service Registry
- Application Registry
- Companion Runtime
- Extension Runtime
- Capability Graph
- Extension Resolver
- Game Integration SDK
- Oracle Platform Constitution
- Updated Architecture
- Updated Codex
- Updated Roadmap
- Updated Project Board

---

# Completed Milestones

## Operation Genesis

✅ Complete

Established Oracle's original engineering foundation.

---

## Operation Sentinel

✅ Complete

Established Oracle's shared intelligence runtime.

---

## Operation Vanguard

✅ Complete

Established operator-facing intelligence and decision systems.

---

## Sprint 8

✅ Complete

Established the Oracle Platform.

Oracle now consists of:

Platform

↓

Services

↓

Applications

↓

Game Integrations

---

# Historical Sprint 9 Plan

## Sprint 9

### Oracle Companion Overlay

Status

🟢 Ready

Branch

```
sprint-9-overlay
```

---

# Historical Sprint 9 Objectives

## Platform Boot

- Oracle bootstrap sequence
- Platform ready state
- Runtime diagnostics

---

## Companion Runtime

- Companion lifecycle
- Overlay lifecycle
- Runtime attachment
- Runtime health

---

## Overlay

- Transparent overlay
- Borderless window
- Click-through support
- Multi-monitor support
- Window attachment

---

## Observation

- Desktop observation foundation
- OCR preparation
- Context pipeline integration

---

## Diagnostics

- Platform diagnostics
- Companion diagnostics
- Overlay diagnostics
- Runtime diagnostics

---

# Historical Sprint 9 Success Criteria

Sprint 9 is complete when:

- Platform boots correctly.
- Oracle reaches Ready state.
- Companion launches automatically.
- Overlay attaches correctly.
- Overlay remains click-through.
- Diagnostics report healthy Platform state.
- Production build passes.
- Documentation updated.

---

# Sprint Workflow

Every Sprint follows the lifecycle in `docs/GOVERNANCE.md`. A Sprint is one
independently reviewable production objective; the steps below are internal
Phases and gates rather than fractional Sprints.

```text
Architecture Review
        │
        ▼
Sprint Planning
        │
        ▼
Implementation
        │
        ▼
Continuous Build
        │
        ▼
Green Production Build
        │
        ▼
Documentation
        │
        ▼
Sprint Review
        │
        ▼
Git Commit
        │
        ▼
Next Sprint
```

No stage should be skipped.

---

# Definition of Done

A Sprint is only considered complete when the definition of done in
`docs/GOVERNANCE.md` is satisfied, including founder closure approval. The
checks below remain the execution checklist:

## Engineering

- Production build passes.
- TypeScript passes.
- Runtime verified.
- No unresolved architectural issues.

---

## Documentation

- Constitution updated if required.
- Codex updated if required.
- Architecture updated.
- Roadmap updated.
- Project Board updated.
- ADRs updated.

---

## Repository

- Commit created.
- Repository clean.

Push and product-release tagging require separate release authority and are not
implied by Sprint closure.

---

## Product

- Platform strengthened.
- User experience improved.
- Existing functionality preserved.
- Technical debt reduced where practical.

---

# Release Checklist

Before every release confirm:

✅ Production build passes

✅ Documentation complete

✅ Architecture reflects implementation

✅ Platform diagnostics healthy

✅ Companion diagnostics healthy

✅ Capability Graph operational

✅ Services registered

✅ Applications registered

✅ Repository clean

✅ Release decision recorded; push and tag completed only when separately authorised

---

# Long-Term Build Sequence

The following sequence was the Sprint 8 strategic projection. It is retained
for historical context and is not the current execution board:

```text
Sprint 8
Platform Foundation
        │
        ▼
Sprint 9
Companion Overlay
        │
        ▼
Sprint 10
Observation Engine
        │
        ▼
Sprint 11
Game Intelligence
        │
        ▼
Sprint 12
Marketplace
        │
        ▼
Sprint 13
Beta
        │
        ▼
Public Release
```

Delivery evolved through Sprint 12.1 desktop-platform hardening, Sprint 13's
Game Integration vertical slice and Sprint 14's Companion Intelligence
Foundation on `sprint-9-overlay`; the projected Sprint 12 Marketplace milestone
was not the work represented by the current repository history. Future sprints may evolve,
but every sprint should strengthen the Platform rather than introducing
isolated functionality.

---

# Engineering Philosophy

The Oracle Platform should become increasingly stable over time.

Future development should focus on:

- Better Services
- Better Applications
- Better Companion experiences
- Better Game Integrations
- Better Extensions

Large architectural redesigns should become increasingly rare.

The Platform should mature while the ecosystem continues to grow.

---

# Final Statement

The Oracle Platform now has a permanent architectural foundation.

Future development should strengthen that foundation rather than replacing it.

Every sprint should leave Oracle in a better state than before.

Platform.

Services.

Applications.

Game Integrations.

Everything Oracle becomes will be built upon those four layers.

---

> **Oracle studies Operators.**

> **Games provide performance context.**

> **Oracle turns permitted evidence into explainable intelligence.**

---

**The Oracle has spoken.**

## Stage 2 Requalification R4 Closure

The ADR-048 runtime-configuration product baseline at commit
`f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree
`5d7eca4c012874df0b839533dfab283b54778661`, passed R4 attempt
`r4-20260803T115002258Z-31ab0bf6`, was Founder-accepted and is formally
closed. Accepted MSIX SHA-256 is
`8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`.
R1-R3, Stage 3 R9 and Stage 4 R1 remain immutable historical results.
Downstream requalification remains separately authorised.
## Stage 3 Requalification R10 Preparation

Stage 3 R9 remains Founder-accepted, formally closed and immutable for the historical Stage 2 R2 candidate. Stage 3 Requalification R10 is the current preparation revision and is bound exclusively to the accepted Stage 2 R4 candidate commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree `5d7eca4c012874df0b839533dfab283b54778661`, and MSIX SHA-256 `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`.

R10 preparation defines the complete clean-Windows lifecycle, including the ADR-048 attempt-scoped installed runtime-configuration boundary. Preparation creates no transfer, execution, certificate-trust, installation, Stage 4, Stage 5, production or release authority. A separate Founder decision is required for transfer construction; execution requires a later separate Founder decision after transfer and admission review. Stage 5 remains blocked pending accepted downstream requalification.

## Post-R4 Packaged Server Environment Correction

The packaged-server environment correction is engineering-complete and
non-qualification validation passes. The privileged Next.js utility child now
receives exactly the four ADR-048 runtime values, fixed production/loopback
values and a physically validated Windows SystemRoot. It does not inherit the
ambient parent-process environment.

Stage 2 R4 remains Founder-accepted, formally closed and immutable for its
exact package. Because this is a later product-source change, that R4 package
no longer qualifies the current source baseline. The permanent invalidation
rule returns current qualification to Stage 2.

Stage 3 Requalification R10 remains bound only to the accepted R4 package and
must not be transferred or executed as qualification of the corrected source.
A new Stage 2 candidate must be accepted before newly bound clean-host and
installed-authentication requalification can proceed. Stage 5 remains blocked.
No qualification authority, attempt, package or evidence was created.

## Stage 2 Requalification R5 Preparation

Stage 2 R5 is prepared for corrected commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`, and package version `0.1.3.0`. Its R4-derived harness binds the strict packaged-server environment correction and immutable R2-R4, Stage 3 R9 and Stage 4 R1 history. All preparation validations pass; no R5 authority, attempt, package or qualification evidence exists yet.

The Founder has authorised one governed R5 attempt. Stage 3 R10 remains R4-bound and must not be transferred or executed for this candidate. Downstream work requires accepted R5 evidence and a newly bound revision.

## Stage 2 R5 Terminal Result and R6 Preparation

R5 attempt `r5-20260803T170318060Z-658ee6f0` stopped non-zero on a stale harness-only manifest-version assertion after package construction and signing. Exact certificate teardown and zero-residue reconciliation passed. Its consumed authority and artifact root are immutable.

R6 is prepared for the unchanged corrected product candidate with unique package version `0.1.4.0`, exact R5 failure bindings and regression coverage that requires the current manifest version and prohibits the stale assertion. One R6 attempt is Founder-authorised. Stage 3 R10 remains R4-bound and barred.

## Stage 2 Requalification R6 Acceptance and Closure

R6 attempt `r6-20260803T171057940Z-5e914d18` passed and is Founder-accepted and formally closed for corrected commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`, and MSIX SHA-256 `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`. Independent reconciliation verified exact evidence and zero residue.

R5 remains immutable failed history. Stage 3 R10 remains R4-bound and barred. A newly R6-bound clean-host revision may now be prepared under the continuing Founder mission. Stage 5 and production remain blocked.

## Stage 3 Requalification R11 Preparation

R11 is the current clean-host preparation revision for accepted Stage 2 R6 MSIX SHA-256 `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`. Stage 3 R9 remains accepted immutable history; R10 remains barred with two immutable rejected transfers. R11 execution is blocked until create-only transfer verification, fresh host continuity and elevated pre-authority admission all pass.

The continuing Founder mission authorises these gates sequentially; it does not authorise R10, namespace reuse, production or release.

## Stage 3 R11 Failure Correction

R11 remains immutable failed evidence. R12 engineering preparation is complete: it bounds asynchronous package-registration stabilization, resolves the exact `LocalState` through the Windows management API and passes non-qualification validation. No R12 transfer or execution is authorised; qualification awaits a new explicit Founder mission.

## Stage 3 Requalification R12 Authorised Mission

The Founder accepted the completed R12 engineering baseline and authorised one governed Stage 3 R12 qualification mission. Transfer and execution are sequentially authorised; the single authority may be created and consumed only after independent transfer verification, fresh host continuity and elevated pre-authority admission pass. Stage 4, production, publication and deployment remain not authorised.

## Stage 3 R12 Pre-Authority Failure and Replacement Transfer

The first R12 package is closed as immutable pre-authority engineering failure. The correction makes the exact Founder-bound manifest authoritative for complete payload inventory while retaining a mandatory contract subset and exact physical-directory and byte verification. One create-only replacement transfer with fresh identity may be prepared and independently verified.

Stage 3 execution is blocked and unauthorised. No qualification authority or attempt may be created by this work.

## Stage 3 R12 Replacement Transfer Complete

The manifest-authoritative R12 correction is frozen at `68a304d6caad3caaf84d3a6b4f63802ab4b6fe83`. Replacement transfer `transfer-stage3-r12-20260803T201110346Z-3cf28c94` is complete and independently verified. Stage 3 execution remains blocked and unauthorised; no qualification authority or attempt exists.

## Stage 3 R12 Execution-Enabled Mission

The Founder authorised one fresh R12 baseline whose manifest-bound contract explicitly records execution authority, one create-only transfer and one attempt after full admission. Both earlier R12 transfers and the failed continuity record remain immutable. No retry is authorised after authority consumption or permanent failure.
