# ORACLE MASTER BUILD PLAN

**Authority:** Canonical approved engineering execution plan beneath the Engineering Programme, Roadmap and Architecture
**Scope:** Current execution objective, sequencing, completion criteria and known boundaries
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever approved execution direction changes
**Supersedes:** Earlier active Master Build Plan versions
**Superseded By:** None
**Last Reviewed:** 24 July 2026
**Version:** 3.8

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
Sprint 25 is implemented and locally certified under ADR-043 with no Migration
015 or retention; Founder acceptance is required before closure.

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

Authoritative Companion Guidance delivery has returned to the future queue. It
requires separate planning and approval. Sprint 16 is the completed Trust
Boundary objective.

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

The Companion Intelligence Foundation is complete. Authoritative live runtime
delivery remains deferred: the desktop composition root does not yet project
authoritative Session Context into a Guidance Request, execute the Provider
Service and deliver the resulting Application state to `/companion`. The
production route therefore presents an honest unavailable state and fabricates
no Session, Guidance or Operator data. Sprint 15 architectural review placed
the Operator Understanding Foundation ahead of that future delivery work.

Known integration boundaries requiring deliberate review:

- web pages do not consistently consume Services through Applications.
- authoritative Companion Guidance delivery is not wired into the production
  desktop composition root or renderer-safe delivery boundary.
- Platform Companion readiness and Desktop Session ownership are contractually
  composed but intentionally not merged.
- curated source freshness remains a manual review responsibility.
- ready and partial-success presentation paths are structurally verified but
  do not yet receive production runtime data.
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
