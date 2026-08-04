# ORACLE ROADMAP

## Strategic Product Roadmap

**Authority:** Canonical strategic delivery sequence beneath Oracle Strategy and Architecture
**Scope:** Long-term operations, horizons, sequencing and delivery outcomes
**Owner:** Oracle Strategy and Product
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed at strategic and Sprint-boundary changes
**Supersedes:** Earlier active Roadmap versions
**Superseded By:** None
**Last Reviewed:** 4 August 2026
**Version:** 6.8

---

# Purpose

The Oracle Roadmap defines the long-term evolution of the Oracle Platform.

Unlike traditional software roadmaps that focus on isolated features, Oracle evolves through deliberate architectural milestones that permanently strengthen the platform.

Every completed milestone should leave Oracle:

- More intelligent
- More reusable
- More scalable
- Easier to extend
- Easier to maintain
- Better prepared for future growth

Features may evolve.

User interfaces may change.

Technologies may be replaced.

The Oracle Platform endures.

This roadmap exists to ensure every development decision contributes towards Oracle's long-term vision of becoming the world's leading operating platform for gaming intelligence.

---

# Product Vision

Oracle's canonical purpose, mission and vision are defined by the
[Founding Charter](founding/ORACLE_FOUNDING_CHARTER.md). The strategic thesis,
platform-first choices, compounding advantage and horizons are defined by
[Oracle Strategy](founding/ORACLE_STRATEGY.md).

This Roadmap does not restate those authorities. It translates approved
strategy into ordered operations and expected outcomes.

---

# Development Philosophy

Roadmap decisions follow the
[Oracle Engineering Principles](founding/ORACLE_ENGINEERING_PRINCIPLES.md), the
Oracle Platform Constitution and current Architecture. Strategy cannot
authorise constitutionally prohibited behaviour, and Roadmap placement does not
constitute implementation approval.

---

# Development Workflow

Oracle delivery follows the hierarchy defined by
[Oracle Engineering Governance](GOVERNANCE.md): Roadmap vision, Epics as major
capabilities, Sprints as independently reviewable production objectives and
Phases as internal implementation stages.

Every Oracle Sprint follows the governed engineering lifecycle.

```text
Architecture
      │
      ▼
Planning
      │
      ▼
Implementation
      │
      ▼
Compilation
      │
      ▼
User Experience Review
      │
      ▼
Architecture Review
      │
      ▼
Documentation
      │
      ▼
Sprint Closure Audit
      │
      ▼
Release Decision
```

No stage should be skipped.

Green production builds are mandatory before sprint completion.

Documentation is considered part of implementation rather than an optional activity.

Every sprint should conclude with:

- Passing production build
- Updated documentation
- Reviewed architecture
- Git commit
- Sprint summary
- Handover readiness

Push and product-release tagging are separately authorised release activities.
They are not implied by Sprint closure.

---

# Roadmap Philosophy

The Oracle Roadmap exists at the strategic level.

Operations and other named strategic programmes are Epics: major capabilities
that may require multiple independently reviewed Sprints. Daily development is
organised through internal Sprint Phases.

Implementation history is represented by Git commits. Product release history
is represented by separately authorised Git tags.

Source control is organised through Sprint branches.

Together they provide complementary views of Oracle's evolution:

- Roadmap — Vision and strategic direction
- Epics — Major platform capabilities
- Sprints — Independently reviewable production objectives
- Phases — Internal implementation stages
- Git — Implementation history
- Documentation — Architectural knowledge

Each should remain consistent with the others.

Oracle Strategy defines *how Oracle intends to create compounding advantage*.

The Roadmap describes *the ordered delivery path*.

The Architecture explains *how Oracle is designed*.

The Founding Charter defines *why Oracle exists*.

The Constitution defines *binding product and architectural constraints*.

The Codex explains *how Oracle is built*.

Implementation fulfils those documents.

---

# Engineering Principles

The canonical principles are maintained in
`docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md`. This Roadmap records delivery
implications rather than a duplicate principle set.

# OPERATION GENESIS

## Foundation Era

**Status:** ✅ COMPLETE

---

## Purpose

Operation Genesis established Oracle's permanent engineering foundation.

The objective was not simply to build an AI coaching application.

The objective was to create a reusable intelligence platform capable of growing for many years without requiring architectural redesign.

Every future capability within Oracle depends upon the work completed during Genesis.

Without Genesis there is no Oracle Platform.

---

## Platform Foundation

Genesis established Oracle's core technology stack.

Completed:

- Next.js Application Platform
- TypeScript Architecture
- Tailwind Design System
- Supabase Integration
- Authentication
- Repository Layer
- Session Repository
- Operator Profiles
- Oracle Sessions

These systems provide the permanent application foundation upon which Oracle continues to evolve.

---

## Runtime Foundation

Genesis established Oracle's shared runtime.

Completed:

- Oracle Context
- Intelligence Bus
- Universal Engine Registry
- Engine Dependency Resolution
- Runtime Orchestration
- Oracle Lifecycle
- Oracle Intelligence State

This runtime became the execution engine responsible for coordinating Oracle Intelligence.

---

## Intelligence Foundation

Genesis established Oracle's first generation of intelligence engines.

Completed:

- Behaviour Engine
- Trend Engine
- Prediction Engine
- Behaviour Evolution Engine
- Adaptive Coaching Engine
- Oracle Brain
- Planner Intelligence
- Timeline Intelligence
- Decision Intelligence
- Explainability Engine
- Confidence Engine
- Evidence Engine

Together these systems transformed Oracle from a statistics dashboard into an explainable intelligence platform.

---

## Intelligence Platform

Genesis introduced the architecture required for modular intelligence.

Completed:

- Intelligence Signals
- Intelligence Graph
- Shared Runtime Contracts
- Engine Registration
- Intelligence Pipeline
- Decision Profiles

This architecture allows Oracle Intelligence to grow without replacing existing foundations.

---

## Operator Systems

Genesis introduced persistent Operator understanding.

Completed:

- Operator Profile
- Behavioural DNA
- Learning Style
- Capability Matrix
- Career Progression
- XP System
- Achievement System

Oracle now understands the Operator rather than merely individual sessions.

---

## User Experience

Genesis established Oracle's presentation architecture.

Completed:

- Premium Dashboard
- Intelligence Dashboard
- Oracle Command Centre
- Modular Dashboard Components

Presentation components now consume Oracle Intelligence rather than owning business logic.

Business logic remains inside Oracle.

---

## Genesis Outcome

Operation Genesis successfully transformed Oracle from an AI coaching application into a reusable intelligence platform.

Genesis proved that intelligence could be:

- Modular
- Explainable
- Reusable
- Extensible
- Testable

The architecture established during Genesis became the permanent engineering foundation of Oracle.

Future development would build upon these foundations rather than replacing them.

---

# SPRINT 8 — ORACLE PLATFORM FOUNDATION

**Status:** ✅ COMPLETE

---

## Purpose

Sprint 8 transformed Oracle from an intelligence platform into **the Oracle Platform**—an operating platform for gaming intelligence.

Rather than adding new user-facing functionality, Sprint 8 reorganised Oracle around a clear architectural model that will support every future application, service and game integration.

The Platform became the permanent owner of shared infrastructure.

Applications became consumers of reusable Services.

Game Integrations became providers of knowledge and capabilities.

---

## Major Deliverables

### Oracle Platform

- Platform Bootstrap
- Platform Lifecycle
- Platform Runtime

### Oracle Services

- Service Registry
- Core Service Registration
- Service Runtime

### Oracle Applications

- Application Registry
- Core Application Registration
- Application Runtime

### Extension Platform

- Extension Runtime
- Extension Resolver
- Extension Lifecycle
- Extension SDK

### Companion Platform

- Companion Runtime
- Companion SDK
- Companion Lifecycle

### Capability System

- Capability Graph
- Capability Resolution
- Capability Contracts

### Game Integration Platform

- Game Integration SDK
- Connector Registry
- Connector Manifests
- Compatibility Contracts

### Documentation

- Oracle Platform Constitution
- Updated Architecture
- Updated Codex
- Updated Roadmap
- Updated Project Board

---

## Architectural Discovery

Sprint 8 produced Oracle's most important architectural discovery.

Oracle is not organised around games.

Oracle is organised around responsibilities.

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

This model became the permanent architecture for Oracle.

---

## Sprint 8 Outcome

Oracle is no longer simply an intelligence platform.

Oracle is now the operating platform for gaming intelligence.

The Platform owns shared infrastructure.

Services own reusable capabilities.

Applications own the Oracle experience.

Game Integrations provide game-specific knowledge.

This foundation enables Oracle to support unlimited future games without architectural redesign.

Sprint 8 is considered one of the defining milestones in Oracle's history.

# OPERATION SENTINEL

## Persistent Intelligence

**Status:** FOUNDATION IMPLEMENTED; full operation outcome not re-verified

---

## Purpose

Operation Sentinel establishes Oracle's long-term memory.

Oracle should no longer analyse isolated gaming sessions.

Instead, Oracle should continuously learn from the complete history of every Operator.

Persistent understanding becomes the foundation for every future recommendation.

---

## Objectives

- Persistent Oracle Memory
- Historical Behaviour Profiles
- Behaviour Evolution History
- Recommendation History
- Cross-Session Learning
- Operator Journey
- Historical Predictions
- Long-Term Progression Intelligence
- Behaviour Stability Analysis
- Memory Confidence

---

## Expected Outcome

Oracle evolves from analysing Operators to understanding Operators over time.

Every Oracle Session permanently strengthens future intelligence.

---

# OPERATION VANGUARD

## Advanced Intelligence

**Status:** PARTIALLY IMPLEMENTED through current intelligence engines

---

## Purpose

Expand Oracle's reasoning capability.

Rather than producing isolated observations, Oracle combines intelligence from multiple systems to generate strategic, explainable recommendations.

---

## Objectives

- Strategy Intelligence
- Context Intelligence
- Objective Intelligence
- Public Knowledge Engine
- Behaviour Relationships
- Pattern Detection
- Advanced Behaviour Modelling
- Multi-System Reasoning
- Context-Aware Recommendations
- Strategic Planning

---

## Expected Outcome

Oracle develops strategic understanding rather than isolated recommendations.

Intelligence becomes increasingly predictive rather than reactive.

---

# OPERATION DOMINION

## Visual Intelligence

**Status:** DESKTOP OBSERVATION FOUNDATION IMPLEMENTED; vision pipeline planned

---

## Purpose

Allow Oracle to understand gameplay directly through observation.

Gameplay should become another source of intelligence alongside historical behaviour and structured game knowledge.

---

## Objectives

- Desktop Observation
- OCR Pipeline
- Gameplay Analysis
- Event Detection
- Discovery Pipeline
- Computer Vision Integration
- Evidence Extraction
- Timeline Enrichment
- Context Recognition
- Vision Confidence

---

## Expected Outcome

Oracle understands gameplay through safe external observation.

Observation enriches intelligence without interfering with gameplay.

---

# OPERATION ATLAS

## Universal Game Platform

**Status:** GAME INTEGRATION FOUNDATION IMPLEMENTED; universal platform planned

---

## Purpose

Expand Oracle into a true multi-game platform.

Games become integrations rather than separate products.

Oracle remains one consistent platform regardless of the game being played.

---

## Objectives

- Universal Game Integration SDK
- Shared Operator Profile
- Cross-Game Behaviour Intelligence
- Shared Learning
- Universal Recommendation Engine
- Game Integration Marketplace
- Integration Trust Model
- Community Connector Support

---

## Initial Game Integrations

- Call of Duty
- Battlefield
- RuneScape
- Minecraft
- Elden Ring
- Monster Hunter
- Football Manager
- Factorio

Additional supported games should continue to grow through the Extension Marketplace.

---

## Expected Outcome

Oracle becomes the Operator's gaming platform rather than a single-game assistant.

---

# OPERATION HORIZON

## Live Companion Intelligence

**Status:** COMPANION INTELLIGENCE FOUNDATION AND AUTHORITATIVE TRANSIENT
DELIVERY COMPLETE

---

## Purpose

Deliver intelligent assistance while the Operator is actively playing.

The Oracle Companion becomes a context-aware desktop companion capable of presenting relevant information at the correct moment.

---

## Objectives

- Companion Overlay
- Live Context
- Live Session Understanding
- Dynamic Guidance
- Contextual Knowledge
- Discovery Assistance
- Navigation Assistance
- Quest Assistance
- Collectible Assistance
- Multi-Monitor Support

---

## Expected Outcome

Oracle Companion becomes the Operator's real-time gaming companion while remaining external to the game process.

---

# OPERATION AEGIS

## Oracle Ecosystem

**Status:** EXTENSION FOUNDATION IMPLEMENTED; Marketplace planned

---

## Purpose

Expand Oracle into a complete gaming ecosystem.

The Platform should support community-created extensions, official integrations and third-party innovation while maintaining trust, safety and architectural consistency.

---

## Objectives

- Oracle Marketplace
- Extension Installation
- Connector Installation
- Knowledge Packs
- Vision Packs
- AI Modules
- Overlay Widgets
- Theme Marketplace
- Language Packs
- Extension Trust Levels
- Community Verification
- Oracle Verified Programme

---

## Expected Outcome

Oracle becomes an extensible ecosystem where new capabilities can be added without modifying the core Platform.

The Oracle Platform grows through extensions rather than increasing complexity inside the Platform itself.

# Current Delivery

Sprint 17 is Founder-approved and fully complete, including Migration 009
production deployment. Sprint 18 — Operator Trust and Control is complete and
immutable. Sprint 19 — Account, Identity and Commissioning is complete and
certified. Migrations 010, 011 and 012 remain undeployed and inactive, Gate C
remains deferred, and runtime persistence remains disabled.

The Founder-approved Sprint 17–Beta sequence, its five Epics, architectural
dependencies, Beta Gates, Founder Beta Readiness Review and Oracle Beta
Certification are authoritative in
[`ENGINEERING_PROGRAMME.md`](ENGINEERING_PROGRAMME.md). Programme approval does
not activate a Sprint.

## Sprint 16 — Trust Boundary

**Status:** Complete
**Historical execution alias:** Sprint 15.5A
**Closure commit:** `58589b52de0db341e6518fa9f235bb18854e6b30`

Sprint 16 completed the trusted Operator Intelligence boundary: exclusive
server-side mutation authority, authenticated ownership injection, global
policy definitions, append-only consent and evidence dispositions, immutable
admissions, admissible game-scoped evidence contracts and service-role-only
durable persistence. Migration 009 passed rollback and independent catalog
validation, then completed its separately authorised production deployment and
post-deployment verification.

## Sprint 17 — Scale-Safe Trust Data Plane

**Status:** Complete — Founder-approved and closed
**Historical planning alias:** Sprint 15.5B

Sprint 17 has made the Operator
Intelligence persistence boundary safe for controlled production activation
through bounded reads, deterministic pagination, measured query optimisation,
required indexes, Snapshot budgets, concurrency verification and automated
boundary enforcement. It also produced the version-pinned Migration 009
deployment dossier. Migration 009 is deployed and verified, establishing the
production persistence foundation without activating runtime persistence.
## Sprint 18 — Operator Trust and Control

**Status:** Complete — Founder-approved and closed

Sprint 18 established the accepted governance, contract and persistence
architecture for Operator Trust and Control. Migration 010 is certified and
deployment-ready, but Gate C is intentionally deferred. Production remains
pre-Migration-010 and runtime persistence remains disabled. Sprint 19 is
complete; its atomic provisioning boundary, Founder authentication and identity
journeys, and inactive Desktop custody contracts are implemented. Migration
011 and Migration 012 are certified. All remain undeployed and inactive.
Sprint 20 — Platform Runtime Activation and Sprint 21 — Oracle Session and
Evidence Lifecycle are complete, certified and Founder-accepted under ADR-040
and ADR-041. Migration 013 remains undeployed and inactive. Sprint 22 is
complete, certified and Founder-accepted under the existing Understanding
ADRs. Sprint 23 is complete, certified and Founder-accepted: evidence-bound
Session reports, deterministic five-engine assessment, governed confidence,
history, comparison and model degradation are source-complete. Sprint 24 is
complete, certified and Founder-accepted under ADR-042; Migration 014 remains
undeployed and inactive. Sprint 25 is complete, certified and Founder-accepted
under ADR-043 with no migration or retention. Sprint 26 is complete, certified
and Founder-accepted using the unchanged Guidance v1 and Desktop Platform API
v1 boundaries. Sprint 27 Option A is implemented and source-certified with
Minecraft: Java Edition `26.1.1`, ADR-044 observation privacy and ADR-045
compatibility certification. Live observation is provisional and disabled
under the approved status Operational Certification Deferred — Required Test
Environment Unavailable. Source and synthetic certification passed; live
attached-window observation did not. Sprint 27 is Founder-accepted and closed.
Its operational certification remains deferred, the compatibility profile
remains provisional and observation remains disabled. Sprint 28 Option A is
complete, locally certified, Founder-accepted and closed: every route was
evaluated for truth and Operator value, one coherent Beta journey remains,
unsupported production mocks were removed and Web/Electron verification
passed. Sprint 29 Option A is complete, locally certified, Founder-accepted and
closed under ADR-046. Its MSIX source implementation, canonical signed Release
Manifest equality and current-host Windows package lifecycle certification are
accepted. The independent clean-machine lifecycle was subsequently qualified
by Stage 3 R9 for the accepted Stage 2 R2 package. Sprint 30
Option A and ADR-047 are Founder-approved. Phases 1 through 5 are complete and
locally verified. Operational Diagnostics remains separate from Oracle
Intelligence and is canonically disabled through exact Web/Electron manifest
`1.7.0` composition. Failure isolation, fresh recovery, disposable
backup/restore/deletion and Sprint 29 rollback regression pass. The live
Supabase Auth provider transaction remains unavailable. The immutable Sprint
29 package remains at manifest `1.6.0` and requires later candidate
reconciliation. Phase 4 passes frozen current-host Web boundary, CPU, memory,
startup, deterministic Guidance, public accessibility and support evidence.
Protected authenticated rendering and installed-package GPU evidence remain
honestly unavailable or deferred. Phase 5 completes the
integrated source, domain, runtime, database, recovery, package-integrity,
quality and support matrix and closes the discovered development dependency
advisory. Sprint 30.5 Stage 1 is Founder-accepted and closed: the controlled
non-pristine physical host, isolated Auth route, standalone hardware GPU
admission and teardown evidence pass and are frozen. The host is not a clean
Windows environment. Historical Stage 2 is Founder-accepted, closed and
immutable with a frozen local Runtime Manifest `1.7.0` MSIX, mechanically
equal Release Manifest, SBOM, provenance, package inventory and complete
signing teardown. Post-freeze product-source corrections mean that candidate
no longer qualifies the current source revision. Sprint 30.5 Stage 2
Requalification R1 is Founder-accepted and formally closed. Accepted attempt
`r1-20260728T190335052Z-d2ffe76a` qualifies current-source candidate
`cd3b7ca1a49d53d85a718a24d594267c93531994` for Candidate Freeze and Package
Reconciliation with frozen evidence.

R1 remains accepted and immutable. Stage 2 Requalification R2 was
Founder-authorised solely to refresh the candidate with a certificate-validity
budget sufficient for the remaining governed lifecycle.
R2 attempt `r2-20260728T203503018Z-ec577cf4` passed and was independently
reconciled at candidate `11475fe01fff2ec69f0188547107f4e901c531d7`.
The Founder accepted the result and R2 is formally closed. Candidate
`11475fe01fff2ec69f0188547107f4e901c531d7` remains the historical package
baseline qualified by Stage 3 R9.

Migration 011 and Migration 012 were subsequently corrected to resolve
pgcrypto functions through the installed extension schema without changing
product semantics. Commit `a7fc67f207d9c95407c70812828fa66bd487285d`, tree
`356f6d52f1bf70065692e892af8bf916acc8727a`, is therefore a new product
baseline. Under the permanent product-drift rule, R2 remains accepted and
closed historical evidence but cannot qualify this corrected source. Stage 2
Requalification R3 attempt `r3-20260731T171651908Z-9a8a2532` passed all twelve
phases, was Founder-accepted and is formally closed. Its final evidence
manifest SHA-256 is
`79ae9b219f24c8f61c48b6e3a0094d1730f72fe29a932e02ff1e92f7b07c1229` and
archive SHA-256 is
`82ad4a46721c2ab0e7103c57f192394887844fd4c311ec3fcea92d2ba05e0688`.
Stage 3 R1 and failed R2-R8 remain immutable historical qualification records.
Stage 3 R9 passed on `Founder-QA-01` under consumed authority
`authority-stage3-r9-20260730T221251043Z-71af9db7` and attempt
`stage3-r9-20260730T221251043Z-71af9db7`. The accepted Stage 2 R2 package
completed transfer verification, clean-host admission, negative-path checks,
machine trust, installation, direct activation, native runtime observation,
repair observation, removal, exact trust teardown and zero-residue cleanup.
The final evidence manifest SHA-256 is
`19a8248a06b37d5fac73b42d35ac96049d3ede09249360b064d9dd692d07defe`
and the qualification archive SHA-256 is
`5eadd80469edcafbe62cd461404c9a2bd782eb1393e542b78969784925e2f41e`.
The Founder accepted the result and Stage 3 is formally closed.

Sprint 30 remains qualification-incomplete because Stages 4-7 have not
started. Stage 4 Live Authentication and Protected Rendering is the next
sequential scope and requires a separate Founder planning decision. Production
signing, publication, distribution, deployment and release remain
unauthorised.
## Historical Sprint 15 — Operator Understanding Foundation

Sprint 15 is historical. Phase 1 — Ownership Foundation, Phase 2 —
Understanding Contracts and Phase 3 — Persistence and Migration established
the approved foundation. Unstarted work from its plan is not implicitly active.

## Operator Intelligence: Operator Understanding Foundation

Sprint 15 establishes the trusted foundation through which Oracle can build a
progressively deeper understanding of each Operator. Operator Understanding is
the architectural umbrella over Account relationship, explicit Identity,
declared Preferences and Goals, temporary State, governed Memory, permitted
Evidence and evidence-derived Operator Intelligence.

The approved Sprint is intentionally narrow. It establishes:

- canonical authenticated Account-to-Operator ownership
- explicit Preference and Goal domains
- evidence, candidate-claim, revision and data-policy contracts
- provenance, epistemic classification, confidence, scope and temporal
  lifecycle
- Operator correction, dispute, export, deletion and retention boundaries
- one game-specific candidate family adapted from the existing Memory Engine
- an immutable, versioned `OperatorUnderstandingSnapshot` read projection
- safe, gated projection into Oracle Context

The epistemic classification distinguishes Known, Declared, Observed,
Inferred, Suspected and Unknown information. It complements rather than
replaces confidence.

Sprint 15 does not introduce broad UI, cross-game claim promotion, sensitive
inference, AI-generated Operator conclusions, Companion personalisation or
authoritative live Companion Guidance delivery. Existing engines, contracts,
Game Integration ownership and External Companion boundaries remain intact.

The binding decisions are ADR-033 through ADR-036. The approved execution plan
is `docs/sprints/SPRINT_15_PLAN.md`.

The completed Phase 1 establishes authenticated one-to-one Account ownership,
Operator Service resolution, Repository-owned access and deployed RLS for
protected Operator data. Existing Operator identifiers and all historical
Sessions were preserved without speculative assignment. Dedicated permanent
fixtures are retained exclusively for migration, ownership, RLS,
authentication and security regression testing.

The completed Phase 2 establishes immutable, versioned contracts for explicit
and inferred understanding, the six epistemic classes, evidence references,
separate evidence quality and claim confidence, deterministic explanations,
revision lifecycles, explicit scope and purpose-scoped Understanding
Snapshots. Its Services are interfaces only. No persistence, migration,
candidate production, Context integration or Application consumption has been
activated.

The completed Phase 3 implementation establishes the six-table Operator
Intelligence persistence foundation, immutable revision and deterministic
explanation storage, append-only eligibility history, composite ownership
constraints, strict RLS and a dedicated Repository. The migration has passed
rollback and independent catalog validation but is not permanently deployed.
No candidate producer, runtime Service, Understanding projection, Context
integration or Application consumption has been activated.

## Earlier Closed Sprint — Sprint 14

The earlier Sprint 9–12 sequence in this roadmap was a strategic projection.
Repository delivery continued on `sprint-9-overlay`. Sprint 14 established the
Companion Intelligence Foundation on top of Sprint 13's Game Integration
vertical slice. It is a reusable platform milestone, not a Call of Duty feature
sprint and not the projected Marketplace milestone.

Completed in the current delivery line:

- external Electron Companion host
- deterministic desktop discovery, target selection and attachment
- native desktop-window observation
- Companion Session and immutable Context ownership
- Desktop Host Snapshot and Coordinator
- Desktop Host Event Stream
- Desktop Diagnostics and Recovery
- unified Desktop Timeline
- derived Desktop Telemetry
- first Call of Duty Game Integration foundation
- frozen Desktop Platform API version 1
- deterministic Game Detection outcomes and production registry
- immutable game context under authoritative Companion Session ownership
- game-agnostic lifecycle coordination for attach, detach, reattach and process
  replacement
- renderer-safe active-game presentation
- immutable, versioned and confidence-aware Guidance contracts
- deterministic provider discovery, eligibility, execution and validation
- structured provider failure isolation and immutable Service results
- first reviewed, source-attributed Call of Duty Guidance package
- immutable Companion Guidance Application state and Guidance Card view models
- Operator-safe diagnostic mapping
- `/companion` presentation of loading, ready, empty, partial-success and
  unavailable states using Application-owned models only

Sprint 14 is complete. Final closure verified:

- focused Guidance contract, Service, Game Integration package, Application
  boundary and presentation behaviour
- desktop TypeScript and Next.js production builds
- dependency-boundary enforcement with zero runtime dependency cycles
- lint with zero errors and five unrelated existing warnings
- desktop and narrow-screen visual review without console errors
- documentation closure, constitutional Fair Play rule, ADR-031 and ADR-032

At Sprint 14 closure, the Companion Intelligence Foundation was complete but
authoritative runtime delivery remained deferred. Sprint 26 later completed
that seam through a transient Desktop-owned coordinator, immutable Guidance v1
Requests, explicitly injected Service execution and a restricted renderer-safe
Application-state bridge. Sprint 16 remains the completed Trust Boundary
objective.

AI Guidance, ranking and personalisation remain deferred. Sprint 26 completed
source-freshness governance, end-to-end transient delivery and bounded category
and spoiler controls. Additional Game Integrations must extend the completed
framework without changing the External Companion
Principle or the Platform → Services → Applications → Game Integrations
ownership model.

Marketplace remains a future strategic objective; it must not be inferred from
the Sprint number alone.

# Current Oracle Platform

Sprint 8 established Oracle's operating-platform model. Later implementation
added desktop foundations, while some Platform coordination remains unwired in
production entry points.

The Platform now provides the permanent foundation upon which every future capability will be built.

---

## Oracle Platform

Implemented as architectural foundations:

- Platform Bootstrap
- Platform Lifecycle
- Intelligence Runtime
- Companion Runtime
- Extension Runtime
- Capability Graph
- Service Registry
- Application Registry
- Platform Contracts
- Shared Diagnostics

The Platform coordinates these subsystems through ADR-040 target-specific
composition roots and canonical manifests. This production-capable source
wiring is implemented and locally certified but not deployed.

---

## Oracle Services

Current Services include:

- Sessions
- Missions
- Memory
- Reports
- Progression
- Operator
- AI Coach
- Oracle Brain
- Loadouts
- Companion

Oracle Services provide reusable capabilities that may be consumed by multiple Oracle Applications.

---

## Oracle Applications

Current Oracle Applications include:

- AI Coach
- Oracle Brain
- Loadouts
- Reports
- Career
- Companion

Applications present intelligence to the user.

Applications orchestrate Services.

Applications do not own business logic.

---

## Game Integrations

Current architecture provides deterministic Game Integration contracts, a
side-effect-free production registry, an evaluator and one Call of Duty
implementation wired into the desktop Companion lifecycle. The shared
coordinator remains game-agnostic; executable and title knowledge remains
inside the Call of Duty integration.

Supported windows are detected externally. The exact selected integration
provides immutable, serializable Session Context. Attachment state remains
owned by the Companion lifecycle, while the renderer receives only a minimal
presentation projection.

Supported integrations will continue to grow without requiring Platform redesign.

Initial priorities include:

- Call of Duty
- Battlefield
- RuneScape
- Minecraft
- Elden Ring
- Monster Hunter
- Football Manager
- Factorio

Every supported game should integrate into the same Oracle experience.

---

## Platform Internals

Internally the Platform currently includes:

- Oracle Context
- Intelligence Bus
- Engine Runtime
- Engine Registry
- Oracle Brain Runtime
- Decision Intelligence
- Behaviour Intelligence
- Prediction Intelligence
- Explainability
- Evidence Engine

These systems remain implementation details of the Oracle Platform.

---

# Long-Term Architecture

Oracle grows through stable architectural layers.

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
        │
        ▼
Platform Runtime
        │
        ▼
Registered Engines
        │
        ▼
Oracle Intelligence
        │
        ▼
Presentation
```

Every future capability should strengthen one or more of these layers rather than introducing parallel architecture.

The Platform should remain stable while the ecosystem around it continues to grow.

---

# Engineering Direction

Future development should primarily focus on:

- Customer-visible improvements
- Companion experience
- Observation
- Knowledge
- Marketplace
- Platform maturity

Large architectural redesigns should become increasingly rare.

The Platform should now evolve through incremental improvement rather than repeated reconstruction.

---

# Release Philosophy

Oracle is never "finished."

Every sprint should improve one or more of:

- Platform
- Intelligence
- Architecture
- User Experience
- Safety
- Explainability
- Performance
- Maintainability
- Extensibility

Every completed sprint should leave Oracle in a stronger architectural position than before.

---

# Success Criteria

Oracle succeeds when it becomes the world's most trusted operating platform for gaming intelligence.

Success will be measured by Oracle's ability to:

- Understand every Operator.
- Learn continuously.
- Explain every recommendation.
- Reason from evidence.
- Calculate confidence honestly.
- Improve after every Oracle Session.
- Adapt across multiple supported games.
- Provide intelligent assistance safely.
- Deliver a premium Oracle experience.
- Grow through reusable Platform capabilities.

---

# Strategic Direction

Oracle is no longer being developed as a traditional gaming application.

Oracle is the operating platform for gaming intelligence.

Future development should strengthen:

- The Oracle Platform
- Oracle Services
- Oracle Applications
- Game Integrations
- The Oracle Extension Ecosystem

Platform stability should always take priority over short-term convenience.

Every major architectural decision should remain consistent with the Oracle Platform Constitution.

---

# Closing Statement

Oracle began as an AI coaching application.

It evolved into an intelligence platform.

Sprint 8 established Oracle's true identity as the operating platform for gaming intelligence.

From this point forward, Oracle grows by strengthening its Platform, expanding its Services, enriching its Applications and supporting more games through trusted Game Integrations.

The Platform is the foundation.

Services provide reusable capability.

Applications deliver the Oracle experience.

Game Integrations provide knowledge.

Extensions expand the ecosystem.

Everything else builds upon those principles.

---

> **Oracle understands games.**

> **Oracle understands players.**

> **Oracle delivers intelligence.**

---

**The Oracle has spoken.**

## Current Stage 2 R4 Requalification Position

Stage 2 Requalification R4 passed, was Founder-accepted and is formally closed
for post-ADR-048 product commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`,
tree `5d7eca4c012874df0b839533dfab283b54778661`. Stage 5 remains blocked
pending separately governed downstream clean-host and installed-authentication
requalification. Historical Stage 2 R1-R3, Stage 3 R9 and Stage 4 R1 evidence
remains immutable.
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

## Stage 4 Requalification R3 preparation

The R3 engineering-preparation gate has passed for the accepted R6/R12 baseline.
The corrected installed-package lifecycle completed all ten required journeys in
both source-equivalent and elevated exact-package rehearsals with zero residue.
Twenty historical records and 29 R3 harness files are hash-bound.

The current preparation is execution-barred. The authorised programme sequence is a
separate execution-enabled baseline, one create-only fresh transfer, independent
verification, fresh isolated-host pre-authority admission and at most one governed
R3 attempt. Stage 5 and later roadmap activity remain blocked.

## Stage 4 R3 execution-enabled transition

The separate R3 execution overlay has passed and is bound to the accepted
preparation commit and tree. One fresh create-only transfer and one governed attempt
are permitted, but no authority exists. The next roadmap gates are independent
transfer verification, approved-host continuity, physical network isolation and
fresh elevated pre-authority admission. Stage 5 remains blocked.

## Stage 4 R3 failed qualification and correction

R3 is permanently failed after consuming its authority. The exact R6 package and all
ten Stage 4 journeys passed; an ownership-verified process exited before the cleanup
stop request and the harness correctly failed closed. Zero residue was proven.

The process-teardown correction is complete and validated through deterministic
adversarial coverage plus source-equivalent and elevated installed-package
rehearsals. The corrected baseline is qualification-barred and creates no new
identity. Stage 4 remains incomplete. A fresh Founder-authorised Stage 4 revision is
the only permissible next qualification mission; Stage 5 remains blocked.

## Sprint 30.5 Stage 4 R4 preparation

Stage 4 remains incomplete for R6/R12. R4 preparation and installed-package rehearsal passed, but the preparation baseline cannot execute qualification. The next in-scope milestone is its separately bound execution overlay, fresh transfer and one governed attempt. Stage 5 remains blocked and unauthorised.

## Sprint 30.5 Stage 4 R4 closure

Stage 4 qualification is complete for R6/R12 through accepted R4 evidence. The next possible programme boundary is a Founder-authorised Stage 5 assessment or mission; no Stage 5 work is authorised by this closure.

## Sprint 30.5 Stage 5 qualification-impact decision

Stage 5 is now the next possible stage and can extend the accepted chain if it
tests the exact R6 package unchanged on `Founder-QA-01`. Before engineering, the
programme must freeze its proposed installed-GPU thresholds and installed
accessibility pass/fail contract under a Founder-authorised R1 preparation mission.
If Stage 5 requires a product correction, the corrected candidate must return to
Stage 2 and repeat Stages 3 and 4 before a new Stage 5 attempt.
