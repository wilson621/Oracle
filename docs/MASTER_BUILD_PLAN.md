# ORACLE MASTER BUILD PLAN

**Authority:** Canonical approved engineering execution plan beneath the Engineering Programme, Roadmap and Architecture
**Scope:** Current execution objective, sequencing, completion criteria and known boundaries
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever approved execution direction changes
**Supersedes:** Earlier active Master Build Plan versions
**Superseded By:** None
**Last Reviewed:** 6 August 2026
**Version:** 5.5

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

## Stage 3 R12 Execution Transfer Handoff

Fresh transfer transfer-stage3-r12-20260803T203230543Z-6c8c1069 is complete and independently verified. The next mandatory gate is physical attachment to exact clean host Founder-QA-01. No continuity, authority or attempt was created on the construction host.

## Stage 3 R12 Qualification Closure

The authorised R12 attempt passed all fourteen lifecycle phases on
`Founder-QA-01`; its single authority is consumed. The returned archive,
manifest, expanded namespace and repository copy passed independent hash and
inventory reconciliation, and teardown finished with zero governed residue.

The R6-bound Clean Windows objective is complete and R12 is formally closed.
This plan starts no Stage 4 or later work. Further execution direction requires
a separate Founder programme-state and Stage 4 impact decision.

## Stage 4 R6/R12 Qualification Impact Decision

The Stage 4 impact assessment is complete. Historical R1 remains accepted and
immutable for its exact R3 candidate, but it is not applicable qualification
for the accepted R6/R12 chain. R6 changes 17 paths in R1's product contract,
including root rendering, all Supabase adapters and the installed runtime
credential boundary. R12 expressly makes no provider-connectivity or
authentication claim.

Stage 4 is therefore incomplete for the current baseline and Stage 5 remains
blocked. The recommended next Founder mission is bounded Stage 4 R2
engineering preparation for the exact R6 MSIX and installed runtime path. No
Stage 4 engineering, authority, attempt or qualification evidence was created
by the assessment.

## Stage 4 Requalification R2 Engineering Preparation Complete

The Founder-authorised bounded R2 engineering preparation is complete for the
accepted R6/R12 baseline. The harness binds the exact R6 candidate, tree, MSIX and
temporary public certificate, accepted R12 closure and immutable R1 history. It
retains all ten R1 journeys and executes them through the installed R6 package,
attempt-scoped LocalState configuration, ownership-verified packaged loopback
server and disposable local provider.

Static, regression, adversarial, source-equivalent and elevated installed-package
development validation passed. The exact-package rehearsal completed ten journeys
with zero package, certificate, runtime-configuration and provider residue. It
created no authority, attempt or qualification evidence.

The preparation contract remains execution-barred. Stage 4 is incomplete for the
R6/R12 chain and Stage 5 remains blocked. The next Founder-level mission is to
accept the preparation baseline and separately authorise one execution-enabled R2
baseline and one governed attempt, with authority creation only after fresh
pre-authority admission.

## Stage 4 R2 Execution-Enabled Mission

The Founder accepted the R2 engineering preparation and authorised one separate
execution-enabled baseline, one create-only governed transfer and at most one Stage
4 R2 qualification attempt. Transfer manifest/custody, independent full-inventory
verification, fresh elevated host admission, zero state and network isolation are
mandatory before authority. A consumed authority or permanent failed attempt cannot
be retried. Stage 5 and later work remain unauthorised.
## Stage 4 R2 Failure Accepted and Engineering Correction Complete

Stage 4 R2 attempt `stage4-r2-20260804T112122028Z-609ab6f0` is accepted immutable
failed qualification evidence. Its single authority is consumed and retry is
prohibited. The attempt failed after `baseline-verified` because the qualification
harness and live controller both claimed creation ownership of `logs/`; safety
teardown and independent verification proved zero residue.

The evidence-led correction is complete at commit
`8fc782df9869bc3c0e85a0d6d01ee7ef0d866175`, tree
`911684539ef85f88e2092daacb896795097e0dd8`. `logs/` is now launcher-owned and
shared only through create-only files; ephemeral `provider/` remains exclusively
controller-owned. Exact qualification and rehearsal inventories reject missing,
linked, file-backed, unexpected and pre-existing controller layouts before provider
mutation.

The accepted failure index rehashes nineteen immutable records. Static, adversarial,
full source-equivalent and elevated exact-R6 installed rehearsals passed; both live
rehearsals completed all ten journeys with zero residue. The corrected R2 contract
is qualification-barred, transfer preparation is prohibited, remaining R2 attempts
are zero, and this engineering mission created no transfer, authority or attempt.

Stage 4 remains incomplete for R6/R12 and Stage 5 remains blocked. The recommended
next Founder mission is a fresh Stage 4 Requalification R3 execution-enabled
baseline, create-only transfer and one governed attempt using new identities and
namespaces, with authority creation only after every fresh gate passes. No R2
identity or evidence namespace may be reused.

## Stage 4 Requalification R3 preparation state

R3 preparation for the accepted Stage 2 R6 / Stage 3 R12 baseline has passed. The
29-file harness preserves the accepted R2 failed attempt and correction, assigns
single ownership to every attempt-root directory, and rehashes twenty historical
records. Source-equivalent and exact installed-package rehearsals passed all ten
journeys with zero residue.

The committed preparation contract cannot create a transfer, authority or attempt.
The current Founder mission permits a separate execution-enabled overlay and one
fresh governed attempt only after complete transfer, host, network-isolation and
pre-authority admission. Stage 5 remains blocked.

## Stage 4 R3 execution overlay

The separately bound execution overlay passed with 29 exact files, 22 rehashed
historical records and one single-use execution token. It permits one fresh
create-only transfer and at most one attempt. It has created no authority or attempt.
Transfer verification, isolated-host admission and fresh elevated pre-authority
remain the next mandatory gates.

## Stage 4 R3 permanent failure and corrected baseline

The R3 authority is consumed and its attempt permanently failed after all ten
installed journeys passed. The failure was an ownership-verified process-exit race
during cleanup; zero residue was nevertheless proven. Twenty-one immutable records
are hash-indexed.

The corrected teardown reconciles only an absent, previously verified PID and
rejects every surviving, reused, ambiguous or unowned identity. Static, adversarial,
source-equivalent and exact installed-package validation passed. The corrected
contract permits no transfer, authority or attempt. Any future Stage 4 qualification
requires a fresh Founder-authorised revision and identities.

## Stage 4 R4 preparation gate

R4 preparation is complete and qualification-barred. Before qualification, freeze the preparation commit/tree, create and validate a separately execution-enabled overlay, create one fresh manifest-bound transfer, independently verify it, and pass fresh elevated/network-isolated host admission. Stage 5 remains unavailable.

## Stage 4 R4 qualification complete

R4 is closed for the accepted R6/R12 baseline after independent evidence and zero-residue verification. No further Stage 4 attempt is authorised. Stage 5 and later activity require a separate Founder-level mission.

## Stage 5 qualification-impact gate

Stage 5 can preserve R6/R12/R4 by qualifying the exact R6 MSIX unchanged on the
admitted replacement host. Before engineering, a Founder-authorised R1 preparation
mission must freeze the proposed GPU thresholds and the installed accessibility
contract. That preparation must be non-product and qualification-barred. Any
necessary product correction resets the corrected candidate to Stage 2, followed
by new Stage 3, Stage 4 and Stage 5 qualification.
## Sprint 30.5 Stage 5 R1 preparation checkpoint

Stage 5 R1 engineering preparation is complete against the unchanged accepted
R6 MSIX. The GPU, performance and accessibility acceptance contract is frozen;
all development and installed rehearsals passed with zero residue. Execution is
not authorised. A fresh execution-enabled baseline, transfer and pre-authority
gates require a separate Founder mission.
## Stage 5 accessibility correction and Stage 2 R7 preparation — 6 August 2026

The Stage 5 R2 rendered-browser investigation established a genuine product defect in the immutable R6 package: enabled informational foregrounds measured approximately 4.22–4.25:1 against the frozen 4.5:1 threshold. The Founder authorised a bounded product correction.

Corrected candidate commit 4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d, tree 1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a, replaces only the failing text and placeholder foregrounds. Static inventory, all-eight-route authenticated Edge integration, lint, TypeScript, architecture, production build, and relevant Companion regressions pass.

Stage 2 Requalification R7 engineering preparation is complete for future package version 0.1.5.0. Its new namespace binds the exact corrected candidate, requires the accessibility gate in the governed source matrix, and hash-binds accepted R6/R12/R4 indexes and closures. Accepted R6/R12/R4 evidence remains unchanged and authoritative history for the exact R6 MSIX, but it does not qualify the corrected candidate.

No transfer, authority, attempt, certificate, package, or qualification evidence was created. Stage 3, Stage 4, and Stage 5 are blocked for the current candidate pending a newly accepted Stage 2 baseline and separately authorised downstream missions. The next Founder-level decision is whether to accept the committed R7 preparation baseline and authorise exactly one governed Stage 2 R7 qualification attempt.

## Stage 2 R8 clean-host preparation - 6 August 2026

The Founder rejected the R7 main-PC qualification exception and authorised a fresh split-host R8 protocol. Engineering workstation `DESKTOP-M3H22E4` now owns source validation, build, local-test signing, exact teardown and immutable candidate freeze. `Founder-QA-01` remains a clean Windows qualification host and requires no repository, Git, Node, npm, Supabase CLI or Docker.

The exact corrected product remains commit `4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d`, tree `1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a`. Passing engineering freeze `candidate-r8-20260806T120629088Z-f79fe50d` produced package SHA-256 `97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490`, public-certificate SHA-256 `78eb64dc769a87cbe82620a8d7bb6da655bdc2d38fe87f58b5c90f3c672492b2`, and freeze SHA-256 `f8c7ec7d020ba717efb9f036350c189221debe53a58a45374aa5c252af695361`. Private signing material and certificate-store residue are zero.

The PowerShell-only clean-host path passed static/adversarial validation and a 28.4-second non-qualification rehearsal. All engineering failures and the timed-out first rehearsal remain immutable non-qualification records. No transfer, authority, attempt or qualification evidence exists. Stage 2 R8 qualification and Stages 3-5 remain unauthorised.

## Stage 2 R8 qualification acceptance and closure - 6 August 2026

Stage 2 R8 attempt `stage2-r8-20260806T134157536Z-a0bf3986` passed on clean qualification host `Founder-QA-01` under consumed authority `authority-stage2-r8-20260806T134157536Z-a0bf3986`. Independent source-workstation reconciliation verified the exact transfer and lineage, all four final-manifest records, all nine canonical compact evidence records, the complete 2,038-file returned attempt, valid package and detached-manifest signatures, zero runtime canaries and zero final residue.

The Founder accepted R8 for candidate `4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d`, tree `1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a`, package version `0.1.6.0`, SHA-256 `97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490`. R8 is formally closed and is the current Stage 2 qualification baseline.

Accepted R6/R12/R4 evidence remains unchanged and authoritative history for the prior R6 MSIX only. It does not qualify the R8 package. Stage 3, Stage 4, Stage 5, production, publication and deployment remain unauthorised. The next Founder-level mission is a separate Stage 3 programme-state and qualification-impact assessment against R8.

## Stage 3 R8-baseline qualification-impact gate - 6 August 2026

Assessment complete: R12 remains accepted historical evidence for R6 but does
not qualify the changed R8 package, version or signer. A fresh R8-bound Stage 3
result is mandatory before Stage 4 can resume. The next permissible mission is
bounded Stage 3 R13 engineering preparation using the reusable R12 lifecycle and
R8 clean-host architecture, with execution remaining separately authorised.

## Stage 3 R13 engineering preparation complete - 6 August 2026

The R13 preparation is complete against accepted Stage 2 R8 package SHA-256 97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490. It reuses the accepted R12 fourteen-phase lifecycle and post-reset correction while restoring the R8 clean-host split.

Exact immutable bindings, 35 PowerShell parses, 15 policy and compatibility tests, all fourteen lifecycle phases, fourteen injected failures, optional-member audit and the elevated R8 post-reset integration passed. Managed LocalState was recreated through ApplicationDataManager without unconfigured activation; final package, trust and work residue was zero.

No transfer, authority, attempt or qualification evidence was created. Stage 3 remains unqualified for R8, and Stage 4 and later work remain blocked. The next Founder-level decision is whether to accept R13 preparation and authorise exactly one governed R13 mission.

## Stage 3 R13 exactly-one execution mission authorised - 6 August 2026

Mission mission-stage3-r13-20260806T160537355Z-aed09e3b authorises exactly one fresh create-only R13 transfer, one authority and one attempt against accepted R8. Authority and attempt creation remain barred until independent transfer verification, clean-host admission, fresh continuity and every elevated pre-authority gate pass.

No retry is authorised after a consumed authority or permanent failed attempt. Stage 4 and later work remain unauthorised.

## Stage 3 R13 Founder-accepted and formally closed - 6 August 2026

The Founder accepted Stage 3 Requalification R13 as the current Stage 3 baseline for the accepted R8 package. Independent source-workstation verification passed for attempt `stage3-r13-20260806T162253957Z-b0cb2a17`; its sole authority `authority-stage3-r13-20260806T162253957Z-b0cb2a17` is consumed and no retry is authorised.

The returned archive SHA-256 is `4e7fb5b75b036e7edf78438117950f4be78c74ad26bc0d102e77dc6658da3c7a`; final evidence-manifest SHA-256 is `ee12f0307d5c55dc05027c50dcba4860923ff36544c432055417005cee3e19f8`. All 144 frozen inventory entries, 148 attempt files, 154 preserved return files and fourteen lifecycle phases verified exactly. Pre-authority purity, clean-host admission, both runtime observations, reset/repair, post-reset managed LocalState initialization and final zero residue passed.

Canonical evidence is frozen under `docs/sprints/evidence/sprint-30-5/stage-3-r13/`. All historical evidence remains unchanged. Stage 4 is not started and not authorised; the next Founder-level mission is a separate Stage 4 programme-state and qualification-impact assessment against the accepted R8/R13 baseline.

## Stage 4 R8/R13 qualification-impact gate - 6 August 2026

Assessment complete: R4 remains accepted historical evidence for R6/R12 but
cannot qualify R8/R13 because its exact package, signer and Stage 3 bindings no
longer match. R13 does not establish the ten Stage 4 live journeys.

The R4 semantics remain reusable, but its repository, Git, Node/npm, Supabase
CLI and Docker execution-host dependencies conflict with the accepted clean
`Founder-QA-01` architecture. Stage 4 is incomplete and Stage 5 remains
blocked. The next permissible mission is bounded, execution-barred Stage 4 R5
engineering preparation for a clean-host provider and journey protocol.

## Stage 4 R5 clean-host engineering preparation complete - 6 August 2026

R5 now binds the exact accepted R8 package and R13 closure to a split-host Stage
4 protocol. `DESKTOP-M3H22E4` owns the accepted R4 Supabase provider only;
`Founder-QA-01` remains clean and owns the installed package and ten journeys.
The isolated private link exposes only ports 54321 and 54324 through exact
loopback relays, with no default route and no PostgreSQL publication.

The retained twenty-phase lifecycle and hostile-fixture suite pass. No product,
provider, relay or governed qualification state was created. Stage 4 remains
unqualified and Stage 5 remains blocked. A separate Founder-authorised
execution-enabled R5 mission must bind current provider-host tools, rehearse the
exact two-host cell and prepare any future transfer before authority can be
considered.

## Stage 4 R5 execution-enabled gate - 6 August 2026

Proceed through one immutable transfer, isolated two-host rehearsal, bilateral zero-residue verification, fresh post-rehearsal pre-authority admission and only then one governed R5 attempt. No retry is permitted after authority consumption or permanent failure. Stage 5 remains unauthorised.

## Stage 4 R5 replacement-transfer gate - 6 August 2026

Preserve 	ransfer-stage4-r5-20260806T181151844Z-ac1fb503 unchanged as pre-authority failure. Prepare one fresh replacement only after optional-version regression passes. The replacement must name the failed transfer in manifest and custody. No authority or attempt exists or may be created before the complete governed gate chain passes.
