# ORACLE ENGINEERING PROGRAMME

**Document Status:** Approved

**Version:** 2.0

**Owner:** Founder

**Authority:** Oracle Engineering Programme

**Next Review:** Focused review of Stage 3 Qualification R9 observation and teardown correction

**Scope:** Oracle engineering delivery from Sprint 17 through Oracle Beta

**Classification:** Living

**Approved:** 22 July 2026

---

# Purpose

This document is Oracle's authoritative Engineering Programme from Sprint 17
through Oracle Beta. It translates the approved Roadmap into five Epics,
independently reviewable Sprints, architectural dependencies, mandatory Beta
Gates and Founder review points.

It does not activate Sprint 17 or authorise implementation. Sprint activation,
phase approval, database deployment, certification and release remain governed
separately by `docs/GOVERNANCE.md`.

The authoritative engineering hierarchy remains:

```text
Roadmap
    ↓
Epic
    ↓
Sprint
    ↓
Phase
```

# Confirmed Starting State

Oracle enters this Programme with:

- Sprint 15 — Operator Understanding Foundation complete for its approved
  foundation phases
- Sprint 16 — Trust Boundary complete, founder-approved, committed and pushed
- Migration 008 deployed
- Migration 009 rollback-validated but undeployed at Programme approval;
  subsequently deployed under separate Founder authority
- Operator ownership, Understanding contracts, persistence, authority and
  trust verification passing
- Companion Guidance contracts, provider orchestration, reference package,
  Application boundary and presentation verification passing
- production build and desktop compilation passing
- zero runtime dependency cycles
- documented architectural debt and integration boundaries
- no active Sprint 17 implementation at Programme approval

Oracle has strong foundations but is not yet Beta-complete:

- Platform bootstrap was not active at Programme approval; Sprint 20 has since
  implemented and locally certified target-specific source entry points
- Migration 009 is deployed and verified, but runtime persistence is disabled
- Operator control operations are not operational
- no production candidate-generation or Understanding-consumption loop exists
- authoritative Companion Guidance delivery is disconnected
- the two Companion lifecycle foundations were unjoined at Programme approval;
  Sprint 20 now composes them through a non-merging lifecycle contract
- several Applications bypass Services
- several product routes are placeholders or use mock data
- sign-in and account recovery are not complete product journeys
- desktop packaging, signing, updates, operational support and release
  qualification are absent
- the latest engineering branch is not demonstrated as the current live
  production release

# Current Execution Status

Sprint 17 is Founder-approved and fully complete. The separately authorised
Migration 009 production deployment completed successfully on 22 July 2026,
passed post-deployment catalog, security, preservation and query-plan
verification, and established the production persistence foundation. The
empty-table planner Verification Hold is resolved through the authoritative
production-shaped evidence rule recorded in the deployment dossier.

Sprint 18 — Operator Trust and Control is Founder-approved and closed. The
accepted governance, contract and persistence architecture is complete.
Migration 010 is certified and deployment-ready, but Gate C is intentionally
deferred. Production remains pre-Migration-010, and no runtime producer,
consumer or persistence path is enabled.

Sprint 19 — Account, Identity and Commissioning is complete and certified.
Its provisioning boundary, web Account journey, identity
lifecycle and inactive Desktop credential-custody contracts are implemented.
Migrations 011 and 012 are certified but neither deployed nor activated.
Production remains post-Migration-009 and runtime persistence remains
disabled. Sprint 20 is complete, certified and Founder-accepted under ADR-040.
Deployment and runtime persistence are not authorised. Sprint 21 is complete,
certified and Founder-accepted under ADR-041. Migration 013 remains undeployed
and inactive. Sprint 22 is complete, certified and Founder-accepted. No
Migration 014 was required. Sprint 23 is complete, certified and
Founder-accepted without a new migration. Sprint 24 is complete, certified and
Founder-accepted under ADR-042. Migration 014 is undeployed and inactive.
Sprint 25 is complete, certified and Founder-accepted under ADR-043. No
Migration 015 or conversation retention was introduced. Sprint 26 is complete,
certified and Founder-accepted through the existing Guidance v1 architecture
without a new ADR. Sprint 27 Option A, Minecraft: Java Edition `26.1.1`,
ADR-044 and ADR-045 are approved. Its bounded source implementation and
synthetic certification are complete. Live observation remains provisional
and disabled. Operational Certification Deferred — Required Test Environment
Unavailable is approved because the third-party runtime will not be acquired
solely for this test. Sprint 27 is Founder-accepted and closed. Operational
certification remains deferred, the profile remains provisional and
observation remains disabled. Sprint 28 Option A is complete, locally
certified, Founder-accepted and closed. Its Product Truth Inventory, canonical
journey, Web/Electron verification and Founder Beta walkthrough establish the
truthful product baseline. Sprint 29 Option A is complete, locally certified,
Founder-accepted and closed under ADR-046. Clean-Machine Certification
Deferred — Required Disposable Windows Environment Unavailable remains the
independent programme status because the Windows Home workstation has no
Windows Sandbox or configured disposable Windows VM. Sprint 30 Option A and
ADR-047 are Founder-approved. Phases 1 through 3 are complete and locally
verified. Phase 3 integrates canonically disabled Operational Diagnostics
through manifest `1.7.0` and proves renderer-safe health, bounded local
diagnostics, failure isolation, fresh recovery, backup/restore/deletion and
Sprint 29 rollback regression. The unavailable live Supabase Auth provider
transaction remains explicit. The immutable Sprint 29 package remains at
manifest `1.6.0` and requires later candidate reconciliation.

The ADR-040 composition manifest is a permanent runtime contract. Every future
Sprint changing Services, Applications, Game Integrations, Guidance providers,
subsystem requirement classification or runtime lifecycle behaviour must
update the canonical manifest and retain mechanical manifest/runtime equality.
Only a Founder-approved superseding ADR may weaken or bypass that gate.

# Beta Philosophy

Oracle Beta is a controlled-availability production release.

It is not:

- an unfinished prototype
- a disconnected subsystem demonstration
- a placeholder-filled early-access build
- an excuse to postpone trust, security, accessibility or reliability
- a release that requires major architectural reconstruction before Version
  1.0

Oracle Beta must be:

- architecturally complete
- feature complete for its declared scope
- intelligence complete
- trustworthy and explainable
- operationally supportable
- securely distributable
- stable under production conditions
- accessible and usable
- honest about supported games and limitations

Intelligence complete means the complete improvement loop works:

```text
Permitted Evidence
        ↓
Authoritative Session
        ↓
Candidate Understanding
        ↓
Governed Acceptance
        ↓
Contextual Intelligence
        ↓
Explainable Recommendation
        ↓
Coaching and Planning
        ↓
Operator Action
        ↓
Outcome Reassessment
        ↓
Longitudinal Understanding
```

It does not mean every experimental engine, game, Marketplace capability or
future Oracle surface must exist before Beta.

After Beta, Version 1.0 should primarily contain:

- bug fixes
- optimisation
- balancing
- usability improvement
- accessibility refinement
- additional supported games
- knowledge and content expansion
- compatibility refinement
- operational learning

Version 1.0 should not require major architectural redesign.

# Programme Principles

1. Trust precedes inference.
2. Session authority precedes evidence accumulation.
3. Evidence precedes intelligence.
4. Operator control precedes production personalisation.
5. Runtime authority precedes live Companion delivery.
6. Intelligence Services precede conversational Oracle.
7. Product completion precedes distribution.
8. Distribution mechanisms precede independent production qualification.
9. Production qualification does not replace Founder product judgment.
10. Certification does not automatically authorise release.
11. The released artifact must be exactly the certified and approved artifact.
12. No placeholder, mock, dead route or disconnected production journey may
    survive the Beta release gate.
13. Two materially different Game Integrations must prove Oracle's
    game-agnostic architecture before Beta.
14. Quality, security, privacy, performance and accessibility apply throughout
    the Programme, not only in final qualification.
15. The Operator is Oracle's durable subject; games are governed performance
    contexts.
16. Permission to observe does not imply Evidence admission, Understanding or
    Memory.
17. Promotion between Observation, Evidence, Understanding and Memory is never
    automatic.
18. Memory is selective and policy-governed.
19. The Operator Intelligence maturity model is not a strict runtime dependency
    graph and does not reorder this Programme.

# EPIC I — TRUSTED OPERATOR PRODUCTION FOUNDATION

## Purpose

Turn the Sprint 15–16 trust foundations into an operational, scalable and
Operator-controlled production capability.

## Capabilities Delivered

- scale-safe Operator Intelligence persistence
- purpose-specific consent and control
- correction, dispute, export, retention and deletion
- complete Account access and recovery
- durable Operator commissioning
- authenticated web and desktop identity

## Why It Exists

Oracle cannot responsibly accumulate personal intelligence until its data
plane, control plane and authenticated Operator journey are operational.

## Platform Maturity After Completion

Oracle can safely identify an Operator, accept authorised personal
information, enforce purpose-specific policy and give the Operator meaningful
control over what Oracle knows and uses.

## Sprint 17 — Scale-Safe Trust Data Plane

### Production Objective

Make the Operator Intelligence persistence boundary safe for controlled
production activation.

### Purpose

Retain the valid intent of the previously proposed Scale Hardening Sprint while
requiring every optimisation to serve a measured production path.

### Deliverables

- bounded, purpose-scoped Repository reads
- deterministic cursor pagination
- explicit result, history and Snapshot budgets
- query plans and indexes supported by measured evidence
- targeted query optimisation
- idempotent evidence and revision operations
- duplicate-admission protection
- concurrency and monotonic-revision verification
- bounded eligibility and lifecycle history
- automated performance and boundary thresholds
- Migration 009 production deployment dossier
- independent pre-deployment catalog and rollback evidence

### Dependencies

- Sprint 16 — Trust Boundary
- deployed Migration 008
- existing ownership, persistence, authority and trust contracts

### Risks

- premature optimisation without representative measurements
- indexes chosen for synthetic rather than product workloads
- hidden unbounded historical reads
- caching that obscures ownership or freshness
- conflating Sprint completion with deployment authority

### Definition of Done

- all approved reads and writes remain within defined production-shaped
  latency, memory, query-count and result-size budgets
- pagination is stable and deterministic
- concurrency and duplicate-submission behaviour pass
- no new dependency or ownership exception exists
- Migration 009 is demonstrably deployable and recoverable
- permanent deployment remains separately governed

### Founder Acceptance Criteria

The Founder can inspect the evidence supporting every budget, index and
deployment claim and make a separate informed decision on Migration 009
deployment.

### Expected Architectural Impact

Strengthens Repositories and Service read boundaries. It introduces no new
Platform layer and no alternate persistence path.

## Sprint 18 — Operator Trust and Control

### Production Objective

Give every Operator meaningful agency over declarations, evidence-derived
intelligence and optional processing.

### Purpose

Operationalise the privacy, trust, agency and control obligations established
by ADR-035 before production inference begins.

Sprint 18 establishes the control plane for future Observation purposes
without implementing Observation. It ensures that no later Observation,
Evidence, Understanding or Memory capability can bypass purpose-specific
consent, inspection, correction, dispute, retention and deletion control.

Where Founder policy values remain undefined, Sprint 18 must implement
configurable, versioned policy infrastructure and validation rather than
hard-coded policy values.

### Deliverables

- purpose-specific consent grant and revocation
- Preference and Goal declaration, revision, withdrawal and expiry
- claim inspection
- evidence and explanation inspection
- correction commands
- dispute commands
- versioned Operator Understanding export
- item-level deletion
- purpose-level deletion
- game-scope deletion
- Understanding-domain deletion
- complete-Operator deletion orchestration
- retention execution
- evidence-disposition execution
- content-free tombstone enforcement
- Operator Trust Centre Application experience
- proof that revoked, disputed, expired or deleted information leaves
  subsequent projections
- future-compatible purpose and observation-category control semantics
- visibility of lifecycle stage and retention state in the Trust Centre
- proof that Observation permission, Evidence admission, Understanding
  eligibility and Memory retention remain distinct

### Explicit Exclusions

- observation capture
- automatic Evidence admission
- Understanding accumulation
- Memory promotion
- Behavioural Intelligence
- Guidance
- Prediction

These exclusions preserve the approved scope of Sprints 21–24 and 26.

### Dependencies

- Sprint 17
- Founder-authorised Migration 009 deployment and post-deployment verification

### Risks

- incomplete cascading deletion
- retention conflicting with deletion expectations
- audit records retaining personal content unnecessarily
- interfaces implying immediate deletion before orchestration completes
- one Service silently assuming another Service's lifecycle authority

### Definition of Done

- every control operation is authenticated
- every operation is atomic or explicitly recoverable
- two-Operator isolation is independently verified
- control outcomes are reflected correctly in later projections
- disputed or revoked information becomes immediately ineligible
- exports preserve provenance, scope, confidence, lifecycle and policy versions
- deletion leaves no prohibited content-bearing history

### Founder Acceptance Criteria

The Founder can inspect, dispute, correct, export, revoke and delete
understanding and independently verify that another Account cannot observe or
alter any part of the result.

### Expected Architectural Impact

Operationalises Operator Service, Operator Intelligence Service, Memory policy
and Repository ownership while preserving their separate responsibilities.

## Sprint 19 — Account, Identity and Commissioning

### Production Objective

Deliver the complete authenticated journey from Account creation to
commissioned Operator.

### Purpose

Turn the existing Account-to-Operator ownership boundary into a usable and
trustworthy product journey.

### Deliverables

- Account creation
- sign-in and sign-out
- verified-email handling
- session expiry and reauthentication
- password or approved credential recovery
- authentication failure and recovery states
- automatic Account-to-Operator binding through Operator Service
- first-run Operator commissioning
- stable Operator identity and callsign
- permitted identity controls
- desktop authentication and reconnection
- clear distinction between Account deletion and Operator deletion
- protected route enforcement
- safe return-to-flow handling
- removal of stale product metadata and development-facing identity

### Dependencies

- Sprint 18 control contracts
- existing Supabase Auth and Operator ownership boundary

### Risks

- authentication loops
- desktop token exposure
- orphaned Account-to-Operator bindings
- ambiguous Account and Operator identities
- inconsistent browser and desktop sessions

### Definition of Done

A new Operator can create an Account, verify access, commission an Operator,
sign in through supported surfaces, recover access, sign out and resume safely
without presentation owning Repository access.

### Founder Acceptance Criteria

The complete first-run and returning-Operator journeys pass on clean Accounts,
including invalid, expired, disconnected and recovery scenarios.

### Expected Architectural Impact

Makes Operator Service the operational identity facade across web and desktop.

# EPIC II — PRODUCTION RUNTIME CONVERGENCE

## Purpose

Make Platform, Services, Applications, desktop, Sessions and Operator
Understanding function as one governed production system.

## Capabilities Delivered

- production Platform bootstrap
- explicit composition roots
- authoritative Session lifecycle
- governed evidence admission
- durable Understanding accumulation
- inspectable runtime health

## Why It Exists

Oracle contains strong subsystems, but several are connected through legacy
paths or remain disconnected entirely.

## Platform Maturity After Completion

Production entry points invoke one inspectable runtime. Sessions become
authoritative evidence-bearing units, and governed Understanding can safely
reach approved consumers.

## Sprint 20 — Platform Runtime Activation

### Production Objective

Activate Oracle's Platform composition model in production entry points.

### Purpose

Convert registries and bootstrap foundations into operational runtime authority
without introducing a service-locator architecture.

### Deliverables

- explicit web composition root
- explicit Electron composition root
- dependency-injected Service registrations
- dependency-injected Application registrations
- explicit Game Integration and Guidance provider composition
- production invocation of Platform bootstrap
- startup lifecycle and readiness gates
- explicit contract between Platform-level and desktop-level Companion
  lifecycles
- unified Platform health snapshot
- startup failure isolation
- startup recovery semantics
- versioned composition manifest
- controlled migration seam for legacy direct imports
- enforcement preventing new direct Application-to-internal dependencies

### Dependencies

- Sprint 19 authenticated identity

### Risks

- Platform bootstrap becoming a global service locator
- breaking working Applications during migration
- leaking implementation objects across contracts
- joining Companion runtimes by merging their ownership rather than composing
  them

### Definition of Done

- supported web and desktop entry points use approved composition roots
- Platform readiness is observable
- required subsystems fail closed
- optional subsystem failure remains isolated
- legacy exceptions are measured and cannot grow
- no new hidden runtime authority exists

### Founder Acceptance Criteria

Oracle can explain exactly what booted, what failed, why it failed and which
Operator-facing capabilities remain safely available.

### Expected Architectural Impact

Activates the established Platform architecture. A production composition-root
ADR is expected.

## Sprint 21 — Oracle Session and Evidence Lifecycle

### Production Objective

Make an Oracle Session a reliable production object from creation through
completion, recovery and deletion.

### Purpose

Fulfil ADR-003 by turning Sessions into authoritative, evidence-bearing units
rather than thin saved reports.

### Deliverables

- authenticated begin, resume, complete, abandon and recover lifecycle
- stable Session identity
- Game Integration identity and version
- Application and device context
- permitted desktop observation admission
- Operator-supplied evidence admission
- evidence minimisation
- authoritative evidence-source ownership
- idempotent Session completion
- partial Session recovery
- renderer-safe Session status
- real Session History
- pagination, search, filtering and detail
- Session export
- Session deletion linked to Operator controls
- lifecycle diagnostics and metrics

### Dependencies

- Sprint 20 composition roots
- Sprint 18 trust and control operations

### Risks

- duplicate Sessions
- retained raw content
- desktop and web claiming competing Session authority
- treating every observation as durable evidence
- deleting a Session without addressing derived understanding

### Definition of Done

One supported gameplay period produces exactly one authoritative, recoverable
Session with traceable permitted evidence and no cross-Operator visibility.

### Founder Acceptance Criteria

The Founder can interrupt, resume, complete, inspect, export and delete a
Session while verifying the effect on related understanding.

### Expected Architectural Impact

Formalises the Session Service and its relationship with desktop Session
ownership. A durable Session lifecycle ADR is expected.

## Sprint 22 — Operator Understanding Accumulation

### Production Objective

Safely transform admitted Session evidence into revisable, governed Operator
Understanding.

### Purpose

Complete the deferred narrow candidate lifecycle and Context projection without
enabling broad or speculative inference.

### Deliverables

- recurring Memory strength and weakness candidate adapter
- stable candidate identity
- idempotency and duplicate suppression
- game-scoped suspected candidates
- explicit policy version
- producer-native confidence
- accepted-claim confidence rationale
- deterministic explanation
- supporting and contradicting evidence links
- acceptance, contradiction, expiry, supersession, dispute and deletion
- purpose-scoped Understanding Snapshot construction
- Snapshot budgets and freshness
- gated Oracle Context inclusion
- explicit Unknown and Suspected behaviour
- inspectable Understanding update history
- continued rejection of sensitive, AI-generated and implicit cross-game
  inference

### Dependencies

- Sprint 21 Session and evidence authority
- Sprint 18 control plane

### Risks

- converting heuristics into facts
- implicit scope widening
- confidence inflation
- making the Snapshot a new source of truth
- producing duplicate claims from repeated Session processing

### Definition of Done

A completed Session can create or revise only the approved candidate family,
and every resulting transition is evidence-backed, explainable, reversible,
purpose-eligible and correctly scoped.

### Founder Acceptance Criteria

The Founder can trace a claim from Session evidence through suspected
candidate, acceptance, contradiction, dispute, supersession and deletion.

### Expected Architectural Impact

Activates existing Operator Intelligence and Understanding boundaries without
replacing Memory or specialised engines.

# EPIC III — INTELLIGENCE-COMPLETE ORACLE

## Purpose

Complete the closed loop from evidence to explanation, action, reassessment and
longitudinal improvement.

## Capabilities Delivered

- trustworthy Oracle Session reports
- contextual intelligence
- coaching and missions
- Planner integration
- Career progression and Achievements
- grounded conversational Oracle

## Why It Exists

Oracle already contains many intelligence engines and product surfaces, but
they do not yet form one complete production journey.

## Platform Maturity After Completion

Oracle can answer what happened, why it happened, what is likely to happen next
and what the Operator should do. It can then measure whether its recommendation
helped.

## Sprint 23 — Oracle Session Intelligence

### Production Objective

Generate a trustworthy post-Session Oracle assessment from authoritative
Session and Understanding inputs.

### Purpose

Replace the thin prompt-only analysis path with evidence-bound production
intelligence.

Prediction in Sprint 23 is a bounded Session and Trend forecast. Mature
outcome-informed longitudinal prediction compounds through later Guidance and
reassessment; this distinction does not reorder the Programme.

### Deliverables

- Session Context assembly through Services
- registered Engine Runtime execution
- Behaviour, Trend, Prediction, Memory and Contextual outputs
- evidence-backed confidence
- coherent primary assessment
- coherent primary recommendation
- immutable explanation and evidence trail
- disagreement and incomplete-evidence handling
- versioned Oracle Session report
- report history and comparison
- removal of hard-coded shared game defaults
- structured model-output validation
- provider outage and degraded-mode behaviour

### Dependencies

- Sprint 22
- Sprint 20 runtime authority

### Risks

- contradictory engine outputs
- model hallucination
- invented confidence
- stale Game Integration semantics
- multiple systems presenting competing primary recommendations

### Definition of Done

Every report claim is attributable to admitted evidence or reviewed knowledge.
Unsupported conclusions remain Unknown, Suspected or omitted.

### Founder Acceptance Criteria

Given a known test Session, the Founder can inspect the assessment,
recommendation, evidence, confidence, disagreement handling and reassessment
trigger.

### Expected Architectural Impact

Makes Services and the Intelligence Runtime the exclusive production route for
Oracle Session reports.

## Sprint 24 — Adaptive Coaching, Planner and Progression

### Production Objective

Turn Oracle Intelligence into a coherent development programme for the
Operator.

### Purpose

Complete the what-happens-next loop across Coach, Missions, Planner, Career,
Progression and Achievements.

### Deliverables

- evidence-backed coaching focus
- adaptive missions
- measurable mission completion criteria
- Planner priorities
- recommendation history
- reassessment scheduling
- mission-to-Session linkage
- mission completion evidence
- progression from governed events
- idempotent XP and Achievement awards
- Career development history
- coaching effectiveness measurement
- complete Coach, Planner, Career, Progress and Achievements journeys

### Dependencies

- Sprint 23

### Risks

- gamification displacing improvement
- circular rewards
- unstable or contradictory missions
- duplicate XP or Achievements
- false causal claims about coaching effectiveness

### Definition of Done

A recommendation can become a mission, enter the Planner, be completed through
evidence, update progression exactly once and be reassessed against later
performance.

### Founder Acceptance Criteria

The Founder can follow one recommendation through coaching, mission, planning,
Session evidence, progression and outcome reassessment.

### Expected Architectural Impact

Integrates existing Services and engines without introducing parallel coaching
or progression architecture.

## Sprint 25 — Conversational Oracle

### Production Objective

Allow Operators to ask grounded questions about Sessions, Understanding,
coaching, plans and supported games.

### Purpose

Make Oracle's accumulated intelligence naturally accessible without creating
an unbounded chatbot or granting a model direct authority over Oracle truth.

### Deliverables

- intent classification
- authorised Service retrieval
- evidence and source packet assembly
- model-provider abstraction
- versioned prompts
- structured response contract
- answer, evidence, confidence, scope, freshness and limitations
- Session and trend questions
- recommendation and coaching questions
- Mission and Planner questions
- reviewed game-knowledge questions
- refusal and clarification behaviour
- provenance links into Oracle records
- prompt-injection protection
- conversation retention controls
- deterministic fallback for core factual questions
- quality evaluation corpus

### Dependencies

- Sprint 23
- Sprint 24 for complete coaching and planning questions
- Sprint 18 trust controls

### Risks

- hallucination
- privacy leakage
- prompt injection
- stale game knowledge
- model-provider dependence
- conversational answers being mistaken for new durable evidence

### Definition of Done

Oracle never presents an unsupported answer as known, never retrieves another
Operator's information and exposes evidence and confidence for every
substantive conclusion.

### Founder Acceptance Criteria

A Founder evaluation set covering known, uncertain, stale, prohibited,
injected and cross-Operator questions passes the approved quality threshold.

### Expected Architectural Impact

Adds a conversational Application over existing Services. An ADR for
model-provider, provenance and conversation-retention boundaries is expected.

# EPIC IV — COMPLETE EXTERNAL COMPANION AND MULTI-GAME PROOF

## Purpose

Turn the desktop host and Guidance foundations into useful, safe, contextual
assistance during supported gameplay.

## Capabilities Delivered

- authoritative live Guidance
- desktop Companion interaction
- contextual assistance
- spoiler-aware knowledge
- objective and discovery support
- proof of game-agnostic architecture

## Why It Exists

Companion is required for Beta, but the current Guidance experience remains
disconnected and the Game Integration model is proven through only one game
family.

## Platform Maturity After Completion

Oracle operates as a trustworthy external Companion across two materially
different, independently certified integration patterns.

## Sprint 26 — Authoritative Companion Guidance Delivery

### Production Objective

Deliver validated Guidance from authoritative desktop Session Context to
Companion presentation.

### Purpose

Close the principal deferred Sprint 14 runtime integration seam.

### Deliverables

- immutable Session-to-Guidance Request projection
- explicit provider composition
- deterministic Provider Service execution
- Application-state projection
- renderer-safe state delivery
- renderer-safe subscriptions
- loading, ready, empty, partial-success and unavailable transitions
- attach, detach, process-replacement and recovery transitions
- Operator category controls
- spoiler controls
- explicit Guidance requests
- source freshness and expiry enforcement
- desktop shell loading the Companion experience
- offline behaviour
- provider-failure behaviour
- end-to-end desktop Guidance suite

### Dependencies

- Sprint 20
- Sprint 21
- Sprint 22 only where personalisation uses eligible Understanding

### Risks

- duplicating Session lifecycle authority
- stale Guidance surviving game changes
- renderer privilege expansion
- hidden ranking or personalisation inside presentation
- failure to clear Guidance during detach or identity change

### Definition of Done

A real supported Session drives live curated Guidance through the existing
Guidance contract without fabricated data, stale state or Session mutation
authority.

### Founder Acceptance Criteria

The Founder can attach, receive Guidance, inspect rationale and sources, adjust
spoilers, detach, recover and verify that obsolete Guidance disappears.

### Expected Architectural Impact

Joins established foundations through an explicit contract. Guidance v2 or
Desktop Platform API v2 is prohibited unless an ADR demonstrates necessity.

### Implementation Status

Complete, certified and Founder-accepted. A transient Desktop-owned coordinator
projects immutable requests from authoritative Session Context, executes the
injected deterministic Guidance Service, invalidates obsolete work and exposes
only validated immutable Application state plus bounded controls to the
restricted renderer. Manifest version 1.5.0 preserves exact Web/Electron
runtime equality. No migration, retention, persistence activation, production
change or Gate C change was introduced.

## Sprint 27 — Contextual Companion and Reference Integration

### Production Objective

Prove Oracle's contextual Companion using a second, independently selected
Beta reference game.

### Purpose

Demonstrate that Oracle's Companion and Game Integration architecture is
genuinely game agnostic rather than merely abstracted around Call of Duty.

### Deliverables

- compatibility and publisher-policy review
- anti-cheat and capture review
- Founder-selected exploration-oriented reference game
- reviewed Game Integration
- reviewed knowledge package
- one reliable permitted context-observation flow
- objective or quest assistance
- collectible, discovery or hidden-content assistance
- progressive hint levels
- spoiler controls
- contextual progress tracking
- capture indicator
- capture pause and scope controls
- observation retention and deletion controls
- gameplay performance budgets
- reusable Game Integration conformance suite

### Dependencies

- Sprint 26
- Session and trust foundations

### Risks

- publisher-policy ambiguity
- unsuitable licensing or knowledge rights
- brittle OCR or observation
- excessive content scope
- game-specific exceptions entering shared architecture
- selecting a reference game that does not exercise a materially different
  integration pattern

### Definition of Done

The reference game passes compatibility certification and delivers one
complete contextual assistance flow without privileged access or shared-core
game knowledge.

### Founder Acceptance Criteria

The Founder can complete an objective or discovery using progressively
stronger assistance, track relevant progress and suspend observation
immediately.

### Expected Architectural Impact

Validates the extension model. ADRs are expected for observation privacy and
Game Integration certification. Full general-purpose computer vision is not
required.

### Implementation Status

Source complete and source-certified under accepted ADR-044 and ADR-045.
Exact-profile Minecraft detection, a versioned non-boolean certificate
lifecycle, one original text-only diamond journey, explicit transient consent,
local allowlisted capture, raw-buffer overwrite and renderer-safe observation
state are implemented. Manifest version `1.6.0` preserves exact Web/Electron
runtime equality. No deployment, migration, persistence, retention, upload,
multiplayer, API, mod, automated-input, authoritative mutation or Gate C
change exists. The exact live observation profile remains provisional and
disabled because the pinned game is unavailable. Operational Certification
Deferred describes the Sprint/programme state only and grants no support,
activation or deployment authority.

Sprint 27 is Founder-accepted and closed as an engineering and architectural
Sprint. Engineering completion, source certification and operational
certification remain distinct milestones. Its operational deferral persists
until an authorised exact-profile live test creates new ADR-045 evidence.

# EPIC V — PRODUCT COMPLETION AND BETA RELEASE

## Purpose

Turn the assembled capabilities into a coherent, distributable, maintainable,
qualified and certifiable production product.

## Capabilities Delivered

- complete Operator experience
- secure desktop operations
- signed distribution
- updates and rollback
- production qualification
- immutable Beta certification
- controlled release authority

## Why It Exists

Working subsystems do not collectively become a production product until they
can be installed, operated, supported, updated, qualified, certified and
released safely.

## Platform Maturity After Completion

Oracle can be installed, used, maintained, diagnosed, recovered, certified and
evolved without major architectural redesign.

## Sprint 28 — Unified Oracle Product Experience

### Production Objective

Make every supported Oracle Application part of one coherent, truthful
Operator journey.

### Purpose

Remove placeholders, mocks, disconnected navigation, dead routes,
inconsistent language and incomplete product states.

### Deliverables

- complete Home and Oracle experience
- complete Companion experience
- real Session History
- real Reports
- Intelligence experience
- Coach and Planner
- Memory and Understanding
- Operator and Trust Centre
- Career, Progress and Achievements
- complete Settings
- honest removal or deferral of unsupported surfaces
- removal of mock production loadout data
- unified loading, empty, degraded, error and recovery states
- privacy and retention settings
- Companion and notification settings
- display and accessibility settings
- consistent evidence, confidence, scope and freshness presentation
- responsive layouts
- first-run guidance
- diagnostics and support entry points
- complete navigation and deep links

### Dependencies

- Sprints 19–27

### Risks

- cosmetic completion masking missing behaviour
- moving business logic into React
- inconsistent confidence or evidence presentation
- retaining low-value routes to preserve historical feature lists

### Definition of Done

Every visible navigation destination has a complete and truthful production
journey. No placeholder, mock recommendation, fabricated state or dead route
remains.

### Founder Acceptance Criteria

The Founder can perform the entire Beta walkthrough without encountering a
placeholder, mock, dead link, unexplained failure or implementation diagnostic.

### Expected Architectural Impact

Consolidates Application presentation. Business logic remains in Services and
engines.

### Implementation Status

Option A is complete, locally certified, Founder-accepted and closed. Every
route and navigation entry was assessed for Architectural Truth and Operator
Value. One canonical
eight-destination shell remains; duplicate and low-value routes consolidate
through verified redirects; inactive Services are presented honestly; and the
mock connector and hard-coded loadout evidence are removed from production
paths. Manifest `1.6.0` remains exact across Web and Electron because runtime
composition did not change. The accepted certification limitations remain
explicit.

## Sprint 29 — Secure Desktop Operations and Distribution

### Production Objective

Establish the operational mechanisms required to distribute, maintain, update,
recover and remove Oracle securely.

### Purpose

Turn Oracle into a maintainable Windows product without attempting to perform
the independent product qualification owned by Sprint 30.

### Deliverables

- signed installer
- signed executable
- secure packaging of native helpers
- least-privilege Electron configuration
- production environment and secret isolation
- secure authenticated-token storage
- versioned release channels
- signed update manifests
- update-download and signature validation
- failed-update recovery
- version rollback mechanism
- predictable uninstall
- governed local-data handling during uninstall
- first-launch network and permission explanations
- release provenance generation
- software bill of materials
- clean-machine installation
- clean-machine update and uninstall verification
- operational runbooks for distribution mechanisms

### Dependencies

- Sprint 20 composition root
- Sprint 26 Companion delivery
- Sprint 28 complete product experience

### Risks

- signing-key compromise
- updater privilege escalation
- native-helper packaging failure
- destructive rollback or uninstall
- release-channel confusion
- embedding secrets in distributable artifacts

### Definition of Done

Oracle can be installed, started, authenticated, updated, rolled back, repaired
and uninstalled through secure operational mechanisms on supported clean
Windows configurations.

Sprint 29 verifies that these mechanisms work. It does not independently
certify the complete product's security, privacy, reliability, accessibility,
performance, compatibility, diagnostics or support readiness; those belong to
Sprint 30.

### Founder Acceptance Criteria

The Founder can install a signed build on a clean machine, verify publisher
identity, update it, recover from a failed update, roll back and uninstall it
predictably.

### Expected Architectural Impact

Establishes the desktop distribution, maintenance and update trust boundary. A
desktop operations and release-security ADR is expected.

### Current Status

Option A is complete, locally certified, Founder-accepted and closed under
ADR-046. Implementation, artifact integrity and current-host Windows lifecycle
certification are complete. The signed
Release Manifest mechanically matches package identity, native helpers, SBOM,
provenance and runtime manifest `1.6.0`.

The clean-machine portion of the Definition of Done remains untested because
no disposable Windows Sandbox or VM is available. **Clean-Machine
Certification Deferred — Required Disposable Windows Environment
Unavailable** is the accepted independent programme status. No production
publisher identity, hosting, publication, external distribution, deployment
or Sprint 30 implementation is authorised.

## Sprint 30 — Production Qualification

### Production Objective

Independently qualify the assembled Oracle product across its complete
production quality envelope.

### Purpose

Determine whether the product produced by the earlier Sprints, including
Sprint 29's operational mechanisms, is secure, reliable, private, performant,
accessible, recoverable, compatible, diagnosable and supportable as a whole.

Sprint 30 qualifies the assembled product. It does not recreate Sprint 29's
installer, updater, signing, rollback or uninstall mechanisms.

### Deliverables

- automated critical-journey end-to-end suite
- release-environment Electron smoke tests
- desktop and Service soak tests
- crash reporting
- privacy-safe operational diagnostics
- production health model and service indicators
- complete threat-model review
- authentication and cross-Operator penetration testing
- privacy and data-processing assessment
- dependency and supply-chain review
- backup and restore exercise
- deletion and retention exercise
- incident-response exercise
- distribution rollback exercise using Sprint 29 mechanisms
- CPU, GPU, memory, startup, Guidance-latency and API budgets
- accessibility audit
- keyboard and focus verification
- contrast and scalable-text verification
- reduced-motion verification
- screen-reader review
- supported Windows and display compatibility matrix
- support runbooks
- failure triage and escalation process
- warning review and zero-unexplained-warning standard
- final Production Qualification dossier

### Dependencies

- Sprint 28
- Sprint 29

### Risks

- late discovery of systemic defects
- telemetry collecting excessive personal information
- qualification being treated as permission to weaken thresholds
- corrective development being hidden inside qualification
- environmental coverage being too narrow

### Definition of Done

- every approved production-quality threshold has repeatable evidence
- all critical and high-severity findings are closed
- lower-severity findings have explicit Beta disposition
- distribution mechanisms have been independently exercised rather than
  reimplemented
- qualification results are reproducible
- Gate 7 evidence is complete

### Founder Acceptance Criteria

The Founder receives one qualification dossier covering security, privacy,
reliability, performance, accessibility, recovery, compatibility, diagnostics
and support and can independently assess whether the evidence is sufficient.

### Expected Architectural Impact

Adds operational visibility and enforcement. No new major product architecture
should be introduced.

### Current Status

Option A and ADR-047 are Founder-approved. Sprint 30 Phases 1 through 5 are
complete and locally verified. Sprint 30.5 is the approved seven-stage bounded
qualification-completion milestone. Stage 1 Environment Admission is
Founder-accepted and closed with frozen evidence from the controlled
non-pristine physical host, isolated network route, standalone hardware GPU
probe and complete teardown. It does not satisfy separate clean Windows
qualification.

Historical Stage 2 Candidate Freeze and Package Reconciliation remains
Founder-accepted, closed and immutable. Its local-only package and signed
Release Manifest mechanically reconcile Runtime Manifest `1.7.0` without
altering the immutable Sprint 29 package. Temporary signing material and trust
were removed. Post-freeze product-source corrections mean that historical
candidate no longer qualifies the current source revision.

Sprint 30.5 Stage 2 Requalification R1 is Founder-accepted and formally
closed. Accepted attempt `r1-20260728T190335052Z-d2ffe76a` binds current-source
candidate and harness commit
`cd3b7ca1a49d53d85a718a24d594267c93531994`, final evidence manifest SHA-256
`0903762efa6605611b7a6213b3cec157d7618030945c6068aea8c28b1ab0b36d`
and local-test MSIX SHA-256
`c9c3b4b624f1b7528123a4f0c86737fef6cab8832d6b6b042ea5b44bfcb9bdbb`.

R1 remains accepted and immutable. Its remaining certificate-validity window
did not safely support the full Stage 3 preparation, review, host, transfer
and execution sequence. Stage 2 Requalification R2 was separately
Founder-authorised as a candidate refresh, with a maximum 30-day isolated
local-test certificate validity budget.

R2 attempt `r2-20260728T203503018Z-ec577cf4` passed and was independently
reconciled from candidate and harness commit
`11475fe01fff2ec69f0188547107f4e901c531d7`. The final evidence manifest
SHA-256 is
`84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d`.
The Founder accepted the result and R2 is formally closed. Candidate
`11475fe01fff2ec69f0188547107f4e901c531d7` is authoritative for any later
separately authorised Stage 3 preparation decision.

Stage 3 Clean Windows Qualification was subsequently Founder-authorised and
attempted on `Founder-QA-01`, `MEDION ERAZER P6605 MD61596`, whose current
Windows installation remains `admitted-with-founder-provenance-exception`.
`installationMediaEvidencePresent` remains false. Recovered Revision 4
NegativePathAndTrust evidence passed, but Revision 4 InstallAndStartup failed
and no canonical Phase 03 success evidence was created. Revision 5 remained
incomplete, Revision 6 is abandoned, and the certificate 24-hour start gate
has closed.

Stage 3 is therefore historically attempted, incomplete and blocked. No
current authority exists to resume it, execute the harness observed during
reconciliation, create or trust a replacement certificate, reinstall the
package, repair the harness or begin another qualification revision.
Stage 2 Requalification R1 acceptance and closure create no Stage 3
authority.

Stage 3 Qualification R1 and failed Stage 3 Qualification R2, Stage 3
Qualification R3 and Stage 3 Qualification R4 remain immutable historical
preparation. R4 proved the deterministic package inventory correction and then
failed on direct access to optional uninstall `DisplayName` under StrictMode.
Stage 3 Qualification R5 preserves every prior correction, introduces a shared
safe deterministic installed-software policy, and binds comprehensive
optional-member, lifecycle, failure-rehearsal and pre-authority host checks.
R5 binds only the accepted, formally closed Stage 2 Requalification R2
candidate. R5 Attempt 1 later failed closed at AppX deployment with
`0x800B0109` because user-scoped `CurrentUser\Root` trust did not satisfy the
deployment provider's machine-scoped trust requirement. The attempt remains
immutable. R6 corrected that trust scope and proved machine trust, package
installation and Windows activation/container creation, then failed because
the Explorer shell-broker exit code was treated as authoritative activation
evidence. Stage 3 Qualification R7 used direct Windows application activation
and reached native discovery, then failed on Windows PowerShell 5.1
top-level-array handling; its teardown also exposed a filesystem-only package
ownership heuristic. Stage 3 Qualification R8 explicitly enumerates the
discovery JSON array and requires exact Windows AppModel package-family
ownership while retaining executable-path, Authenticode and native-window
proof. R8 then captured a 59.929-second observation span against the mandatory
60 seconds and exposed a teardown process-exit/OpenProcess race. Stage 3
Qualification R9 measures at least 60,000 monotonic milliseconds between valid
captured samples and safely classifies only a typed OpenProcess failure for a
PID immediately proven absent. Live ownership and final residue verification
remain fail-closed. R9 transfer and execution remain blocked pending separate
Founder decisions.

Live Auth, protected rendering, clean Windows acceptance, installed-package
GPU/performance/accessibility, reproducibility and final integrated
qualification remain outstanding in later sequential stages. No production
deployment, persistence, telemetry, migration, external provider, remote push
or Gate 7 activity is authorised.

# FOUNDER BETA READINESS REVIEW

This mandatory governance checkpoint occurs after Sprint 30 and Gate 7.

It is:

- mandatory
- a Founder governance review
- not an implementation Sprint
- not a substitute for any Beta Gate
- not a release decision
- not an opportunity to hide corrective implementation

## Purpose

Determine whether Oracle is genuinely ready to enter final immutable-candidate
certification.

Technical qualification demonstrates that production standards have been
tested. The Founder Beta Readiness Review determines whether the assembled
product is coherent, valuable, finished within its declared scope and worthy
of being presented as Oracle Beta.

## Entry Criteria

- Sprint 30 is complete
- Gate 7 — Production Qualification has passed with evidence
- every earlier Beta Gate has passed
- all preceding Sprint closures are approved
- the complete integrated product is available in a production-equivalent
  build
- the full Operator walkthrough is executable
- no critical or high-severity defect remains
- all known limitations and supported configurations are available for review
- no Sprint 31 implementation or certification activity has begun

## Review Questions

The Founder must answer:

1. Has every preceding Gate passed with evidence?
2. Does the complete product feel coherent and finished?
3. Can the full Operator journey be completed without placeholders, mocks,
   dead routes or unexplained failures?
4. Is Companion genuinely useful during supported gameplay?
5. Is Oracle's intelligence trustworthy, explainable and actionable?
6. Does the Operator retain meaningful control over their information?
7. Are degraded and failure states calm, honest and recoverable?
8. Are supported-game claims appropriately narrow and evidence-backed?
9. Would the Founder personally install this build?
10. Would the Founder pay for this product?
11. Would the Founder confidently recommend it?
12. Is any part still prototype quality?
13. Does any subsystem remain disconnected despite passing local verification?
14. Are known limitations compatible with a near-production Beta?
15. Is Oracle worthy of being called Oracle Beta?

## Evidence Required

- complete Gate 0–7 evidence record
- Production Qualification dossier
- clean-machine installation and update evidence
- complete Founder Operator walkthrough recording or witnessed execution
- supported-game compatibility evidence
- Companion gameplay-use evidence
- intelligence evaluation results
- Operator control and privacy walkthrough
- security and cross-Operator isolation results
- accessibility and performance evidence
- incident, recovery, rollback and uninstall evidence
- current defect and known-limitation register
- support and feedback-readiness plan
- exact scope proposed for Beta certification
- confirmation that no placeholder, mock or disconnected production journey
  remains

## Failure Outcome

If the Founder Beta Readiness Review fails:

- Sprint 31 must not begin
- no Beta release date may override the result
- no certification artifact may be designated
- deficiencies return to the appropriate earlier Sprint or Gate
- corrective work must receive the correct Sprint authority
- corrective implementation must not be hidden inside Sprint 31
- affected Gates must be rerun where their guarantees could have changed
- a new Founder Beta Readiness Review is required after correction

## Approval Outcome

If the review passes:

- the Founder records explicit Beta Readiness approval
- the approved functional and operational scope is frozen for certification
- Sprint 31 may be planned and activated
- the product may enter immutable-candidate certification
- release is still not authorised

## Relationship to Sprint 31

Sprint 31 cannot begin without explicit Founder Beta Readiness approval.

The review determines that Oracle is ready to be certified. Sprint 31 then
proves and freezes the exact candidate. Sprint 31 may not finish features,
correct architecture, close quality gaps or redesign incomplete journeys.

## Relationship to the Beta Gates

The Founder Beta Readiness Review occurs after Gate 7 and before Sprint 31.

It does not replace Gate 7 or Gate 8:

- Gate 7 proves production qualification.
- Founder Beta Readiness Review approves entry into certification.
- Sprint 31 certifies the exact immutable candidate.
- Gate 8 governs the final release decision.

## Sprint 31 — Oracle Beta Certification

### Production Objective

Certify and approve the exact immutable Oracle Beta release candidate.

### Purpose

Prove that the precise artifact set proposed for release is the same product
that passed the Programme, Production Qualification and Founder Beta Readiness
Review.

Sprint 31 certifies a candidate. It does not automatically release Oracle.

### Deliverables

- immutable release artifact set
- exact source, dependency, configuration and build provenance
- migration rehearsal
- rollback rehearsal
- production deployment rehearsal
- signed installer
- signed update channel
- supported-game declarations
- supported display and operating-environment declarations
- compatibility publication
- known-limitations publication
- controlled-cohort controls
- cohort pause controls
- incident pause authority
- rollback authority
- Beta support intake
- Beta feedback intake
- final processing and consent review
- release notes
- artifact hashes and provenance
- final certification evidence
- explicit Founder release-decision dossier
- Beta tag only after Founder approval

### Dependencies

- every prior Sprint complete
- every preceding Gate passed
- Founder Beta Readiness Review passed
- certification scope frozen

### Risks

- artifact substitution
- environment drift
- last-minute feature changes
- correcting defects inside certification
- release pressure overriding certification evidence
- tagging or deploying before Founder approval

### Definition of Done

- the exact immutable candidate passes every required certification check
- migration, rollback and deployment rehearsals use the candidate's exact
  configuration
- supported-game, compatibility, limitation, processing, support and cohort
  declarations are complete
- no corrective implementation is included without returning to the
  appropriate Sprint
- the Founder receives the complete release-decision dossier
- no deployment, release or Beta tag occurs without explicit Founder approval

Completion of Sprint 31 means a candidate has been certified. It does not mean
Oracle has been released.

### Founder Acceptance Criteria

The Founder:

- verifies artifact identity and provenance
- completes or witnesses the final certification walkthrough
- confirms that the candidate matches the previously qualified product
- reviews all limitations and operational controls
- makes an explicit release decision
- authorises or rejects the Beta tag and release separately

### Expected Architectural Impact

None. Any material architecture or feature change discovered during
certification invalidates the candidate and returns work to the appropriate
earlier Sprint and Gate.

# Critical Path

## Mandatory Sequence

```text
Sprint 16 — Trust Boundary
        ↓
Sprint 17 — Scale-Safe Trust Data Plane
        ↓
Founder Migration 009 Deployment Decision
        ↓
Sprint 18 — Operator Trust and Control
        ↓
Sprint 19 — Account, Identity and Commissioning
        ↓
Sprint 20 — Platform Runtime Activation
        ↓
Sprint 21 — Oracle Session and Evidence Lifecycle
        ↓
Sprint 22 — Operator Understanding Accumulation
        ↓
Sprint 23 — Oracle Session Intelligence
        ↓
Sprint 24 — Adaptive Coaching, Planner and Progression
        ↓
Sprint 28 — Unified Oracle Product Experience
        ↓
Sprint 29 — Secure Desktop Operations and Distribution
        ↓
Sprint 30 — Production Qualification
        ↓
Gate 7 — Production Qualification
        ↓
Founder Beta Readiness Review
        ↓
Sprint 31 — Oracle Beta Certification
        ↓
Gate 8 — Oracle Beta Release
```

## Parallelisable Work

- Sprint 25 may proceed after Sprint 23 while Sprint 24 is completed, provided
  coaching and Planner questions remain gated until Sprint 24 contracts are
  stable.
- Sprint 26 may begin after Sprints 20–21 without waiting for broad
  Understanding personalisation.
- Sprint 27 follows Sprint 26 and may run alongside Sprints 23–25 with separate
  Game Integration ownership.
- early installer, signing and updater proofs may occur as internal Phases
  after Sprint 20, but Sprint 29 integration depends on the completed Sprint 28
  product.
- performance, accessibility, security and privacy verification occurs in
  every Sprint; Sprint 30 independently qualifies the assembled product.

## Optional Before Beta

Unless required by the selected reference integration, the following remain
optional:

- general-purpose OCR
- broad computer vision
- AI-generated Companion Guidance
- cross-game claim promotion
- advanced loadout optimisation
- voice
- mobile
- Marketplace
- community extensions
- team and tournament systems
- more than two certified Game Integrations

## Architectural Dependencies

- Migration 009 production deployment precedes durable production
  intelligence.
- Operator Trust and Control precedes inference activation.
- authenticated identity precedes protected product journeys.
- runtime authority precedes integrated execution.
- Session authority precedes evidence.
- evidence precedes Understanding.
- Understanding and Session intelligence precede coaching.
- Intelligence Services precede conversation.
- authoritative Session Context precedes live Companion Guidance.
- live Companion delivery precedes contextual reference-game proof.
- complete Applications precede distribution.
- distribution mechanisms precede independent production qualification.
- Gate 7 precedes Founder Beta Readiness Review.
- readiness approval precedes Sprint 31.
- certification precedes the final release decision.

# Potential Future ADRs

An ADR should be prepared when the applicable boundary becomes concrete:

1. Production composition-root and dependency-injection authority.
2. Durable Oracle Session lifecycle and contract version.
3. Retention, deletion, audit and tombstone policy.
4. Conversational model-provider, provenance and retention boundary.
5. External observation and capture privacy boundary.
6. Game Integration compatibility and certification model.
7. Secure desktop operations, signing, updater, rollback and uninstall
   boundary.
8. Privacy-safe telemetry and crash-reporting boundary.
9. Cross-game portability policy, if cross-game promotion is later activated.
10. Guidance v2 or Desktop Platform API v2 only if compatible version 1
    evolution is demonstrably impossible.

# Oracle Beta Gates

No Gate may be waived because a later Sprint appears capable of compensating
for it.

## Gate 0 — Programme Authority

### Objective

Authorise the Engineering Programme without activating Sprint 17.

### Entry Criteria

- Sprint 16 closed
- architectural audit complete
- production-state limitations recorded
- Programme submitted for Founder review

### Exit Criteria

- Founder approves the Epics
- Founder approves Sprint 17–31 ordering and scope
- Founder approves the Beta definition and exclusions
- Sprint 17 receives separate planning authority

### Architectural Guarantee

Work begins from an explicit, governed Programme rather than inherited Roadmap
momentum.

## Gate 1 — Trusted Data Plane

### Objective

Permit production use of Operator Intelligence persistence.

### Entry Criteria

- Sprint 17 complete
- Migration 009 rollback evidence available
- scale and query evidence complete

### Exit Criteria

- Founder approves permanent deployment
- independent catalog verification passes
- ownership and cross-Operator isolation pass
- service-role mutation boundary passes
- recovery and rollback evidence passes

### Architectural Guarantee

No unauthorised caller can read or mutate another Operator's intelligence.

## Gate 2 — Operator Control

### Objective

Permit production evidence-derived Understanding.

### Entry Criteria

- Gate 1 passed
- Sprints 18–19 complete

### Exit Criteria

- consent and revocation pass
- correction and dispute pass
- export, retention and deletion pass
- Account access and commissioning pass
- browser and desktop identity behaviour pass

### Architectural Guarantee

Oracle cannot accumulate optional personal intelligence without authenticated
ownership, declared purpose and meaningful Operator control.

## Gate 3 — Runtime Authority

### Objective

Permit production accumulation and approved consumption.

### Entry Criteria

- Gate 2 passed
- Sprints 20–22 complete

### Exit Criteria

- production composition roots pass
- runtime health and lifecycle pass
- authoritative Session lifecycle passes
- evidence admission passes
- candidate lifecycle passes
- bounded Understanding projection passes

### Architectural Guarantee

Durable Understanding is authorised, evidence-backed, correctly scoped,
explainable, reversible and consumed only through approved Services.

## Gate 4 — Intelligence Completeness

### Objective

Permit Oracle to present itself as an intelligent coaching product.

### Entry Criteria

- Gate 3 passed
- Sprints 23–25 complete

### Exit Criteria

- Session reports meet evidence and confidence standards
- coaching and planning loop closes
- progression is governed and idempotent
- conversation is grounded and privacy-safe
- uncertainty and refusal behaviour pass

### Architectural Guarantee

Oracle answers its four canonical intelligence questions without unsupported
certainty.

## Gate 5 — Companion and Game Support

### Objective

Permit supported-game and live-Companion claims.

### Entry Criteria

- Gate 3 passed
- Sprints 26–27 complete

### Exit Criteria

- authoritative Guidance delivery passes
- stale-state and recovery behaviour passes
- Operator controls pass
- compatibility and Fair Play reviews pass
- two materially different Game Integrations pass
- Companion gameplay usefulness is demonstrated

### Architectural Guarantee

Supported-game assistance is external, safe, useful, appropriately scoped and
independently certified.

## Gate 6 — Product Completion

### Objective

Permit production distribution work to represent a complete Oracle product.

### Entry Criteria

- Gates 4–5 passed
- Sprint 28 complete

### Exit Criteria

- no placeholder or mock remains
- no dead product route remains
- all supported Applications have complete journeys
- Settings, diagnostics, privacy, error and recovery experiences pass
- full Operator walkthrough passes at Application level

### Architectural Guarantee

Oracle is a coherent product rather than a collection of subsystem
demonstrations.

## Gate 7 — Production Qualification

### Objective

Establish that the assembled product satisfies its complete production-quality
envelope.

### Entry Criteria

- Gate 6 passed
- Sprint 29 complete
- Sprint 30 qualification candidate assembled

### Exit Criteria

- Sprint 30 complete
- security passes
- privacy passes
- reliability and recovery pass
- performance passes
- accessibility passes
- compatibility passes
- diagnostics and support pass
- no critical or high-severity defect remains
- Production Qualification dossier approved

### Architectural Guarantee

The complete product is operable, supportable, recoverable, secure, private,
performant, accessible and compatible within its declared scope.

Passing Gate 7 does not authorise Sprint 31. The Founder Beta Readiness Review
must occur next.

## Gate 8 — Oracle Beta Release

### Objective

Authorise release of the exact certified Oracle Beta artifact.

### Entry Criteria

- Gate 7 passed
- Founder Beta Readiness Review passed
- Sprint 31 complete
- immutable certified artifact identified
- release-decision dossier complete
- no artifact, dependency, configuration, migration or declared-scope change
  has occurred since certification

### Exit Criteria

- Founder explicitly approves release
- Founder explicitly approves the controlled cohort
- Founder explicitly approves the Beta tag
- release and rollback authorities are named
- the certified artifact is deployed without substitution
- artifact hashes and provenance match certification
- post-release health checks pass
- incident pause and rollback controls are active

### Architectural Guarantee

The released product is exactly the product that was qualified, reviewed,
certified and approved.

Passing Sprint 30 does not authorise Sprint 31. Passing the Founder Beta
Readiness Review authorises certification, not release. Completing Sprint 31
certifies a candidate, not a release. Only Gate 8 and the explicit Founder
release decision authorise Oracle Beta release.

# Oracle Beta Operator Walkthrough

Assume the certified candidate has passed Gate 8 and Oracle Beta has shipped.

1. The Operator downloads the signed Oracle installer.
2. The Operator verifies the publisher and release provenance.
3. Oracle installs without developer tooling.
4. Oracle explains network, observation, privacy and update behaviour.
5. The Operator creates an Account.
6. The Operator verifies access and signs in.
7. Oracle creates the authenticated Account-to-Operator binding.
8. The Operator commissions a durable callsign and identity.
9. Oracle presents purpose-specific consent and control choices before optional
   processing.
10. The desktop Platform boots.
11. Oracle reports Platform, Service, Application, Companion and Game
    Integration health.
12. The Operator launches a supported game.
13. Oracle detects the game through permitted external evidence.
14. Oracle confirms the compatible Integration and supported operating mode.
15. Companion attaches through the authoritative lifecycle.
16. One Oracle Session begins.
17. Companion appears as a transparent, click-through, independently controlled
    window.
18. The Operator can hide, suspend, interact with or close Companion
    immediately.
19. Permitted observations and Operator-supplied evidence are admitted with
    provenance, scope, quality and policy version.
20. Authoritative Session Context becomes a validated Guidance Request.
21. The appropriate reviewed provider produces Guidance.
22. Companion presents recommendation, rationale, confidence, freshness,
    spoiler level and source.
23. During the contextual reference game, the Operator can request progressive
    assistance for an objective, discovery, collectible or hidden-content
    flow.
24. Companion records only the approved progress required for the enabled
    capability.
25. The Operator completes the gameplay Session.
26. Oracle completes exactly one authoritative Session record.
27. Registered intelligence engines consume the approved Session and
    Understanding Context.
28. Oracle generates Behaviour, Trend, Prediction, Memory and Contextual
    outputs.
29. New understanding begins as an evidence-linked, game-scoped candidate.
30. Eligibility policy determines whether it remains Suspected or becomes
    accepted.
31. Accepted understanding carries confidence, scope, explanation, temporal
    validity and reassessment requirements.
32. Oracle generates an Oracle Session report.
33. The report explains what happened, why, what may happen next and what the
    Operator should do.
34. Oracle Coach converts the priority recommendation into a measurable
    mission.
35. Planner schedules and prioritises it.
36. Career and Achievements update exactly once from governed events.
37. Later Sessions reassess whether the recommendation helped.
38. The Operator asks Oracle why a development area is currently prioritised.
39. Conversational Oracle retrieves only authorised information.
40. Oracle responds with evidence, confidence, scope, freshness and
    limitations.
41. The Operator can inspect the supporting claim and evidence.
42. The Operator can dispute the claim, correct declared context, withdraw
    consent, export understanding or delete relevant information.
43. Revoked, disputed, expired or deleted information no longer influences
    future projections.
44. On the next launch, Oracle resumes with the correct Operator, plans,
    progression, privacy controls and supported context.
45. If any provider or subsystem fails, Oracle degrades honestly and never
    fabricates intelligence.

This is a complete product journey.

# Beta Success Criteria

## Architectural Guarantees

- Platform → Services → Applications → Game Integrations remains enforced.
- Every capability and lifecycle has one authoritative owner.
- Production entry points use explicit composition roots.
- Cross-boundary contracts remain immutable, serializable, versioned and
  validated.
- No runtime dependency cycle exists.
- No new legacy boundary exception is accepted silently.
- Two materially different Game Integrations prove the extension model.
- No major architecture change is introduced during certification.

## Intelligence Guarantees

- every substantive item has an explicit epistemic classification
- confidence remains separate from epistemic class
- every accepted inferred claim has evidence, provenance, scope, policy,
  explanation, validity and reassessment
- Suspected and Unknown information is never presented as established
- recommendations expose evidence, reasoning, confidence, expected outcome and
  reassessment trigger
- conversation is grounded in authorised data or reviewed knowledge
- sensitive inference remains prohibited
- cross-game promotion remains disabled without an approved portability policy
- model output never becomes truth merely because it was generated

## Companion Guarantees

- Companion remains external to games
- no injection, memory access, hooks, patching, automation, simulated input,
  network manipulation or anti-cheat interaction exists
- stale context and Guidance are removed deterministically
- observation is visible, scoped, pausable and minimised
- the Operator retains immediate hide, suspend and close controls
- supported-game claims are compatibility-reviewed
- Companion remains within gameplay performance budgets
- Companion provides demonstrable value in both certified integration patterns

## Operator Guarantees

- authentication is mandatory for protected journeys
- Account-to-Operator binding is authoritative
- cross-Operator isolation is database-enforced
- consent is purpose-specific and revocable
- Operators can inspect, correct, dispute, export and delete
- revoked or disputed information leaves subsequent projections
- the Operator retains agency over every recommendation and action
- Account deletion and Operator deletion remain distinct and understandable

## Quality Guarantees

- signed installer and executables
- secure update and rollback
- predictable uninstall
- clean-machine installation verification
- automated critical-journey coverage
- release-environment desktop smoke and soak testing
- no critical or high-severity unresolved defect
- production build and packaging are reproducible
- backup, restore, deletion, incident and rollback exercises pass
- product states are complete, accessible, responsive and truthful
- no unexplained warnings remain

## Platform Guarantees

- Platform health is observable
- failures are isolated and diagnosable
- telemetry and crash reporting are privacy-minimised
- Services and Game Integrations can be added without altering core Application
  architecture
- provider or model replacement does not redefine Oracle Intelligence
- version 1 public contracts remain compatible unless an approved migration
  exists
- the exact released artifact matches certification provenance

# Final Critical Review

## Naming and Intent

The approved names preserve architectural intent:

- Sprint 18 — Operator Trust and Control reflects agency, privacy, consent and
  trust.
- Sprint 29 — Secure Desktop Operations and Distribution owns operational
  distribution mechanisms.
- Sprint 31 — Oracle Beta Certification distinguishes certification from
  release.

## Sprint 29 and Sprint 30 Boundary

- Sprint 29 creates and verifies the operational mechanisms for secure
  installation, maintenance, updating, rollback and removal.
- Sprint 30 independently qualifies the complete assembled product across
  security, privacy, reliability, performance, accessibility, recovery,
  compatibility, diagnostics and support.

Sprint 30 may exercise Sprint 29 mechanisms. It does not recreate them.

## Founder Beta Readiness Review

The review adds mandatory governance without becoming an implementation
Sprint. It occurs after Gate 7, assesses product coherence and readiness,
cannot absorb unfinished work, blocks Sprint 31 on failure and authorises
certification rather than release on success.

## Sprint 31 Scope

Sprint 31 is certification rather than hidden development. No corrective
implementation is deferred into it. Any deficiency returns to the appropriate
earlier Sprint and Gate.

## Gate Coherence

```text
Sprint 30 — Production Qualification
        ↓
Gate 7 — Production Qualification
        ↓
Founder Beta Readiness Review
        ↓
Sprint 31 — Oracle Beta Certification
        ↓
Gate 8 — Oracle Beta Release
```

Founder approval is required before Sprint 31 may begin and again before the
certified candidate may be released. The released artifact must be exactly the
artifact certified and approved.

## Completeness

No essential Beta capability is omitted:

- secure installation and updates
- authentication and commissioning
- Operator trust and control
- authoritative Sessions
- permitted evidence
- candidate Understanding
- contextual intelligence
- Session reports
- coaching and planning
- progression and Achievements
- grounded conversation
- live Companion Guidance
- contextual gameplay assistance
- two Game Integrations
- complete product Applications
- diagnostics and support
- security, privacy, reliability, performance, accessibility, recovery and
  compatibility
- immutable certification
- explicit Founder release authority

## Prematurity

The Programme does not require a public Marketplace, broad computer vision,
sensitive inference, automatic cross-game promotion, AI-generated personal
claims, universal game support or incompatible contract changes before Beta.

## Non-Duplication

- Sprint 17 hardens the data plane.
- Sprint 18 gives the Operator trust and control.
- Sprint 19 completes identity access.
- Sprint 20 activates runtime composition.
- Sprint 21 owns Sessions and Evidence.
- Sprint 22 accumulates Understanding.
- Sprint 23 produces Session Intelligence.
- Sprint 24 converts intelligence into development.
- Sprint 25 exposes intelligence conversationally.
- Sprint 26 delivers live Guidance.
- Sprint 27 proves multi-game composition and contextual-assistance source
  architecture; live second-game observation remains operationally deferred.
- Sprint 28 completes the product experience.
- Sprint 29 establishes secure desktop operations and distribution.
- Sprint 30 qualifies the complete product.
- Founder Beta Readiness Review governs entry into certification.
- Sprint 31 certifies the immutable candidate.
- Gate 8 authorises release.

# Final Assessment

The Programme preserves the approved ordering:

- trust before inference
- Session authority before evidence
- evidence before intelligence
- runtime authority before Companion delivery
- complete Applications before distribution
- operational mechanisms before independent qualification
- qualification before Founder readiness approval
- readiness before certification
- certification before release

Oracle Beta is a controlled-availability, near-production release rather than
an unfinished product. Version 1.0 should not require major architectural
redesign.

Approval of this Programme does not activate Sprint 17. Sprint 17 requires a
separate founder-approved Sprint Plan and explicit activation under
`docs/GOVERNANCE.md`.
