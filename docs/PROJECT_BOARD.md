# ORACLE PROJECT BOARD

**Authority:** Canonical record of current approved progress beneath the Master Build Plan
**Scope:** Active governance work, latest closed Sprint, milestones and verified delivery state
**Owner:** Oracle Delivery
**Status:** Active
**Classification:** Living
**Expected Stability:** Updated whenever approved work changes state
**Supersedes:** Earlier active Project Board versions
**Superseded By:** None
**Last Reviewed:** 26 July 2026
**Version:** 8.1
**Branch:** `sprint-9-overlay`
**Governance v2 baseline:** `0423aad`

---

# Current Delivery Status

Sprint 18 — Operator Trust and Control is Founder-approved and closed.
Governance, contracts, persistence architecture, Repository ownership,
verification, the Persistence Contract, the Gate C package and its formal
deferral are accepted. Migration 010 is the certified deployment-ready
production candidate. Gate C execution is intentionally deferred until
immediately before the first production release requiring Operator Trust and
Control persistence. The persistence architecture is complete but undeployed.
The approved scope is recorded in `docs/sprints/SPRINT_18_PLAN.md`, and ADR-037,
ADR-038 and ADR-039 are accepted.

Sprint 19 — Account, Identity and Commissioning is complete and certified.
The Founder policy decisions are implemented across web
authentication, mandatory verification, trusted commissioning, Display Name,
Callsign lifecycle and inactive Desktop trusted-device custody. Migration 011
and Migration 012 are implemented and certified on PostgreSQL 17.10. Both
remain undeployed and inactive.

Sprint 20 — Platform Runtime Activation is complete, certified and
Founder-accepted under ADR-040. The canonical runtime manifests mechanically
equal the constructed Web and Electron runtimes. Production deployment,
Migration execution, Gate C and runtime persistence remain unauthorised.

Sprint 21 — Oracle Session and Evidence Lifecycle is complete, certified and
Founder-accepted under ADR-041. Migration 013 remains undeployed and inactive.
The Session Service is the permanent sole lifecycle authority.

Sprint 22 — Operator Understanding Accumulation is complete, certified and
Founder-accepted. Manifest version 1.2.0 mechanically matches both runtimes.
No Migration 014 was required. Production and persisted accumulation remain
inactive.

Sprint 23 — Oracle Session Intelligence is complete, certified and
Founder-accepted. Session Report Service is the authoritative report-generation
owner. Prompt-only authority is permanently retired and optional model
enrichment cannot become factual authority.

Sprint 24 — Adaptive Coaching, Planner and Progression is complete, certified
and Founder-accepted under ADR-042. Migration 014 remains certified, undeployed
and inactive.

Sprint 25 — Conversational Oracle is complete, certified and Founder-accepted
under ADR-043. Conversation remains transient and non-authoritative. No
Migration 015 was introduced.

Sprint 26 — Authoritative Companion Guidance Delivery is complete, certified
and Founder-accepted. Guidance delivery remains transient, instance-scoped and
non-authoritative. Manifest version 1.5.0 exactly matches Web and Electron.

Sprint 27 is complete, source-certified, Founder-accepted and closed under
ADR-044 and ADR-045. Minecraft: Java Edition `26.1.1` is the bounded second
Beta reference.
Manifest version `1.6.0` exactly matches Web and Electron. No deployment,
migration, persistence, retention, upload, multiplayer, API, mod,
automated-input, authoritative mutation or Gate C activity occurred.

Operational Certification Deferred — Required Test Environment Unavailable.
The exact live observation profile is `provisionally-certified`, live capture
is untested and observation remains disabled.

Sprint 28 Option A is complete, locally certified, Founder-accepted and
closed. The Product Truth Inventory assessed every route and navigation entry
for Architectural Truth and Operator Value. Oracle now has one canonical
eight-destination journey,
truthful inactive and deferred states, consolidated legacy routes and no
production mock game or loadout evidence. Manifest `1.6.0` remains exact
across Web and Electron. No deployment, migration, persistence, activation or
Gate C activity occurred.

## Active Sprint

Sprint 30 — Production Qualification is Founder-approved and active under
Option A and ADR-047. Delivery is divided into separately verified and
committed phases. Phases 1 through 5 are complete and locally verified. Phase 1
implements the
non-authoritative diagnostic admission contract, allowlisted definitions,
minimisation policy and bounded local transient sink. Runtime composition
now mechanically matches manifest `1.7.0` across Web and Electron with
canonical diagnostic delivery disabled.

Phase 2 freezes the exact candidate and proves repeatable Web,
release-environment Electron and disposable PostgreSQL critical journeys
through Migration 014. Authenticated database role/JWT isolation passes. A
live Supabase Auth/GoTrue Email + Password transaction is unavailable because
no local provider is configured and is not claimed as passed.

Phase 3 proves renderer-safe health, bounded local diagnostics, failure
isolation, fresh recovery, disposable backup/restore/deletion and Sprint 29
rollback regression. The immutable Sprint 29 package remains bound to
manifest `1.6.0`; candidate reconciliation is required before later integrated
qualification. The branch was 26 commits ahead of remote at Phase 3 start,
which remains a local continuity risk without push authority. Phase 4 freezes
and passes bounded current-host startup, authenticated route/API boundary,
CPU, memory and deterministic Guidance-latency budgets. Public authentication
accessibility, compact layout, semantic structure and support triage pass.
Protected-route rendering, installed-package GPU measurement and live Auth
remain unavailable, and none is claimed as passed. Phase 5 completes the
integrated matrix, closes the development-tool supply-chain finding and
produces the Production Qualification dossier. Full and production dependency
audits report zero vulnerabilities. Sprint 30 remains qualification-incomplete
because later mandatory environment evidence and authorised package
reconciliation remain absent.

Sprint 30.5 Stage 1 — Environment Admission is Founder-accepted and closed.
Transfer integrity, the controlled non-pristine Windows baseline, isolated
Auth route, PostgreSQL/Mailpit denial, standalone Electron `39.8.10` hardware
GPU admission and complete teardown pass. The raw evidence package is frozen
under SHA-256
`841b5ea14bc06966ce969dda0a6794110633e9ad7f0c74d0d11ee1d54938a78d`.
This does not satisfy the separate clean Windows requirement. Stage 2 —
Candidate Freeze and Package Reconciliation is engineering-complete with
frozen evidence and awaits Founder acceptance. Runtime Manifest `1.7.0` now
mechanically reconciles to the local qualification MSIX and signed Release
Manifest. The signer and trust were removed. Stage 3 and Gate 7 are not
authorised.

Sprint 17 — Scale-Safe Trust Data Plane is fully complete, and all approved
success criteria are satisfied. Migration 009 is deployed and verified in
production; the persistence foundation is established while runtime
persistence remains disabled. Sprint 18 activation did not change production,
activate runtime persistence, authorise a database migration or enable
inference or personalisation.

The complete approved Sprint 17–31 sequence and Beta Gates are recorded in
`docs/ENGINEERING_PROGRAMME.md`. The approved Sprint 17 implementation scope,
phases, verification and exit governance are recorded in
`docs/sprints/SPRINT_17_PLAN.md`.

Implementation evidence is recorded in
`docs/sprints/SPRINT_18_PHASE_3_IMPLEMENTATION.md`. Sprint 17 closure remains
recorded in `docs/sprints/SPRINT_17_CLOSURE.md`; its version-pinned deployment
decision artifact is `docs/sprints/SPRINT_17_MIGRATION_009_DOSSIER.md`.
The Sprint 18 deployment deferral is recorded in
`docs/sprints/SPRINT_18_GATE_C_DEFERRAL.md`.
Sprint 19 evidence is recorded in
`docs/sprints/SPRINT_19_PHASE_2_IMPLEMENTATION.md` and
`docs/sprints/SPRINT_19_MIGRATION_011_CERTIFICATION.md`, with the Founder
decision implementation and current certification boundary in
`docs/sprints/SPRINT_19_FOUNDER_DECISIONS_IMPLEMENTATION.md` and
`docs/sprints/SPRINT_19_CERTIFICATION.md`.
Sprint 29 evidence is recorded in
`docs/sprints/SPRINT_29_IMPLEMENTATION.md`,
`docs/sprints/SPRINT_29_CERTIFICATION.md` and
`docs/sprints/evidence/sprint-29/`.
Sprint 30.5 Stage 1 closure and evidence are recorded in
`docs/sprints/SPRINT_30_5_STAGE_1_CLOSURE.md`,
`docs/sprints/evidence/sprint-30-5/stage-1/` and the canonical
`docs/QUALIFICATION_REGISTER.md`.
Stage 2 implementation, qualification package and evidence are recorded in
`docs/sprints/SPRINT_30_5_STAGE_2_IMPLEMENTATION.md`,
`docs/sprints/SPRINT_30_5_STAGE_2_QUALIFICATION_PACKAGE.md` and
`docs/sprints/evidence/sprint-30-5/stage-2/`.

# Latest Closed Qualification Stage

## Sprint 30.5 Stage 1 — Environment Admission

**Status:** Founder-accepted and closed
**Host:** Controlled non-pristine physical qualification host
**Clean Windows:** Not satisfied; remains mandatory later
**Next stage:** Stage 2 complete awaiting Founder acceptance; Stage 3
separately unauthorised
**Deployment status:** Production unchanged; Stage 2 local test signing only;
no production signing, distribution, deployment, migration, persistence or
Gate authority

# Latest Closed Sprint

## Sprint 29 — Secure Desktop Operations and Distribution

**Status:** Complete, locally certified, Founder-accepted and closed
**Closure report:** `docs/sprints/SPRINT_29_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no production signing,
publication, distribution, migration or activation
**Certification limitation:** Clean-Machine Certification Deferred — Required
Disposable Windows Environment Unavailable

Sprint 29 delivered ADR-046, Windows-native MSIX packaging, the canonical
signed Release Manifest and accepted current-host install, update, repair,
rollback and uninstall evidence. The independent clean-machine milestone
remains unavailable and must not be represented as passed, production trusted
or release ready.

## Previous Closed Sprint — Sprint 28 — Unified Oracle Product Experience

**Status:** Complete, locally certified, Founder-accepted and closed
**Closure report:** `docs/sprints/SPRINT_28_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no migration or activation

Sprint 28 delivered the governed Product Truth Inventory, one canonical
eight-destination product journey, truthful inactive and deferred states,
production mock removal and bounded Web/Electron certification.

## Previous Closed Sprint — Sprint 27 — Contextual Companion and Reference Integration

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_27_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no migration or activation
**Operational status:** Operational Certification Deferred — Required Test
Environment Unavailable; compatibility profile provisional and observation
disabled

Sprint 27 delivered a bounded second reference integration, privacy and
compatibility governance, deterministic Guidance and fail-closed local
observation architecture. Source and synthetic certification are accepted.
Live attached-window certification was not performed and no Minecraft
operational-support claim exists.

## Previous Closed Sprint — Sprint 26 — Authoritative Companion Guidance Delivery

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_26_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no migration

Sprint 26 delivered transient authoritative Guidance coordination without
creating a knowledge, mutation or retention authority.

## Previous Closed Sprint — Sprint 25 — Conversational Oracle

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_25_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no migration or retention

Sprint 25 delivered grounded transient Conversation without creating a source
of Oracle truth, model mutation authority or retained transcript.

## Previous Closed Sprint — Sprint 24 — Adaptive Coaching, Planner and Progression

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_24_CLOSURE.md`
**Deployment status:** Migration 014 certified, undeployed and inactive

Sprint 24 delivered evidence-led Operator development and authoritative
exactly-once progression accounting without changing production.

## Previous Closed Sprint — Sprint 23 — Oracle Session Intelligence

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_23_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no Migration 014

Sprint 23 delivered deterministic evidence-bound Session reporting, governed
confidence, disagreement handling, report history and safe optional model
enrichment without changing production.

## Previous Closed Sprint — Sprint 22 — Operator Understanding Accumulation

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_22_CLOSURE.md`
**Deployment status:** Undeployed and inactive; no Migration 014

Sprint 22 delivered governed Understanding accumulation and bounded projection
without changing production or activating persisted producers or consumers.

## Previous Closed Sprint — Sprint 21 — Oracle Session and Evidence Lifecycle

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_21_CLOSURE.md`
**Deployment status:** Migration 013 undeployed and inactive

Sprint 21 delivered the authoritative Session lifecycle and certified
Migration 013 without changing production or activating persistence.

## Previous Closed Sprint — Sprint 20 — Platform Runtime Activation

**Status:** Complete, certified and Founder-accepted
**Closure report:** `docs/sprints/SPRINT_20_CLOSURE.md`
**Deployment status:** Undeployed and inactive; runtime persistence disabled

Sprint 20 delivered explicit target composition roots, one shared injected
Platform runtime, canonical manifests with exact runtime equality,
instance-owned registries, governed readiness and fresh recovery without
changing production.

## Previous Closed Sprint — Sprint 19 — Account, Identity and Commissioning

**Status:** Complete and certified
**Closure report:** `docs/sprints/SPRINT_19_CLOSURE.md`
**Deployment status:** Migrations 011 and 012 certified, undeployed and inactive

Sprint 19 delivered the implemented Account, authentication, verification,
commissioning and durable Operator identity foundation without changing
production or enabling runtime persistence.

## Previous Closed Sprint — Sprint 18

**Status:** Complete — Founder-approved and closed
**Closure report:** `docs/sprints/SPRINT_18_CLOSURE.md`
**Completed baseline:** `sprint-18-complete`
**Deployment status:** Migration 010 certified; Gate C intentionally deferred

Sprint 18 delivered the accepted governance, contract and persistence
foundation for Operator Trust and Control. Production remains
pre-Migration-010, runtime persistence remains disabled and the unstarted
Service-control and Trust Centre work is deferred rather than active.

## Previous Closed Sprint — Sprint 17

**Status:** Complete — Founder-approved and closed
**Historical planning alias:** Sprint 15.5B
**Closure evidence commit:** `e873b515a149d392850cf4c6e0c00cfb4ecd3313`
**Deployment status:** Migration 009 deployed and verified; production deployment complete

Sprint 17 delivered bounded trust-data reads, deterministic pagination,
Snapshot budgets, idempotency and concurrency guarantees, measured query
optimisation, automated boundary enforcement and permanent verification
evidence. The subsequent governed deployment established the production
persistence foundation. Closure and deployment did not activate any runtime producer, consumer, control
operation, Application, Platform capability or subsequent Sprint.

## Previous Closed Sprint — Sprint 16 Trust Boundary

**Status:** Complete — founder closure approved, committed and pushed
**Historical execution alias:** Sprint 15.5A
**Closure commit:** `58589b52de0db341e6518fa9f235bb18854e6b30`
**Deployment status:** Migration 009 is rollback-validated and undeployed

Sprint 16 established exclusive server-side Operator Intelligence mutation
authority, a server-only trusted Supabase client, authenticated ownership
injection, global policy definitions, append-only consent and evidence
dispositions, immutable admission records and service-role-only durable
persistence. All approved trust, ownership, persistence, architecture,
Guidance, Companion, desktop, build, lint and credential-isolation gates
passed.

Migration 009 requires a separate founder deployment decision. Sprint 16 did
not activate candidate generation, intelligence accumulation, runtime
consumption or Sprint 17 work.

# Historical Sprint 15 Foundation

## Sprint 15 — Operator Intelligence: Operator Understanding Foundation

**Status:** Historical — approved foundation Phases 1 through 3 complete
**Activation baseline:** `d9d78c94acbc628fbbc35f4a42ba970d02b2f9e9`
**Plan:** `docs/sprints/SPRINT_15_PLAN.md`

Sprint 15 establishes the trusted foundation for progressively deeper,
evidence-based and Operator-controlled understanding. Operator Understanding is
the umbrella over Account relationship, Identity, Preferences, Goals, State,
Memory, Evidence and evidence-derived Operator Intelligence.

The ADRs and planning reconciliation remain authoritative. Phase 1 has passed
implementation, deployment, authenticated isolation and founder closure review.
Phase 2 has passed contract implementation and closure. Phase 3 has passed
persistence implementation, rollback validation, independent catalog
verification and founder implementation review. Unstarted work from the
approved plan is not implicitly active and requires a new production objective.

# Historical Sprint 15 Governance Gate

- [x] final founder architectural approval
- [x] Recommended scope selected
- [x] Operator Understanding adopted as the architectural umbrella
- [x] Operator Intelligence retained as the evidence-derived component
- [x] Sprint sequencing conflict resolved
- [x] ADR-033 — canonical Account and Operator ownership prepared and accepted
- [x] ADR-034 — Operator Understanding and Intelligence lifecycle prepared and accepted
- [x] ADR-035 — Operator data governance and control prepared and accepted
- [x] ADR-036 — game scope and cross-game portability prepared and accepted
- [x] certainty vocabulary incorporated without replacing confidence
- [x] Sprint 15 execution plan prepared
- [x] governance and planning verification passed
- [x] clean planning baseline committed

# Historical Sprint 15 Approved Scope

- [x] deployed Supabase schema and RLS audit
- [x] authenticated Account-to-Operator ownership
- [x] separate Preference and Goal domain contracts
- [x] Evidence, Claim, Revision and Data Policy contracts
- [x] Known, Declared, Observed, Inferred, Suspected and Unknown classification
- [x] confidence, provenance, scope and temporal lifecycle contracts
- [ ] Operator inspect, correction, dispute, export and deletion operations
- [ ] one game-specific candidate family from the existing Memory Engine
- [x] immutable `OperatorUnderstandingSnapshot` read projection contract
- [ ] safe, gated Oracle Context integration
- [ ] architecture, migration, privacy and regression verification

# Historical Sprint 15 Phase 1 Closure

- [x] deployed schema reconciled against tracked SQL
- [x] additive Account-to-Operator ownership migration implemented
- [x] rollback validation completed before permanent deployment
- [x] independent catalog verification completed before and after deployment
- [x] founder deployment approval received
- [x] permanent deployment completed successfully
- [x] anonymous access rejected
- [x] authenticated Operator Service resolution verified for two principals
- [x] cross-Operator, binding and Session isolation verified directly through RLS
- [x] existing Operator IDs and five historical Sessions preserved
- [x] two unowned historical Sessions preserved and excluded
- [x] permanent security regression fixtures retained under exclusive test use
- [x] founder Phase 1 closure approved

The retained principals, Operators, bindings and Sessions are reserved
exclusively for migration, ownership, RLS, authentication and security
regression testing. They are not product accounts, user data or general-purpose
development fixtures.

# Historical Sprint 15 Phase 2 Closure

- [x] immutable versioned Operator Understanding contracts implemented
- [x] certainty, evidence quality and claim confidence separated structurally
- [x] deterministic durable claim explanations implemented and verified
- [x] Evidence references preserve source ownership and exclude raw prompts
- [x] claim and declaration lifecycle matrices implemented and verified
- [x] monotonic revisions and content-free deletion tombstones verified
- [x] sensitive and AI-generated inference rejected
- [x] implicit cross-game and Operator-wide evidence promotion rejected
- [x] interface-only Declaration, Intelligence and Understanding Services added
- [x] purpose-scoped immutable `OperatorUnderstandingSnapshot` verified
- [x] focused contract, lifecycle and Service verification added
- [x] architecture, Guidance, Companion, desktop, build and lint regressions pass
- [x] founder Phase 2 implementation review approved

Phase 2 introduced no database schema, migration, Repository, runtime Service,
engine adapter, Context integration, Application consumption or UI. Phase 3
adds only the approved persistence foundation and keeps runtime consumption
inactive.

# Historical Sprint 15 Phase 3 Closure

- [x] deployed Supabase catalog re-audited before migration design
- [x] six-table Operator Intelligence persistence schema implemented
- [x] immutable policy, Evidence and claim-revision persistence implemented
- [x] append-only claim-evidence and eligibility history implemented
- [x] composite Operator ownership constraints and indexes implemented
- [x] authenticated atomic persistence functions implemented
- [x] inherited public privileges revoked and authenticated reads restricted by RLS
- [x] dedicated `OperatorIntelligenceRepository` implemented
- [x] Repository persistence validated through Phase 2 contracts
- [x] exact rollback migration validation and independent catalog verification passed
- [x] transactional ownership, isolation and anonymous-rejection checks passed
- [x] existing Operator, Session and binding truth remained unchanged
- [x] no runtime registration, candidate producer, Context consumer or UI added
- [x] founder Phase 3 implementation review approved

`database/009_operator_intelligence_persistence.sql` remains undeployed after
successful rollback validation. Permanent execution requires a separate
founder-approved migration gate. Unstarted later work requires a separately
approved production objective.

# Historical Sprint 15 Explicit Deferrals

- broad Operator Understanding UI
- sensitive or psychological inference
- persisted learning-style, motivation or frustration inference
- automatic cross-game claim promotion
- AI-generated Operator claims
- Companion Guidance ranking or personalisation
- authoritative live Companion Guidance delivery
- changes to Guidance contract version 1
- changes to Desktop Platform API version 1
- new Game Integrations
- wholesale engine or Application rewrites

---

# Earlier Closed Sprint

## Sprint 14 — Companion Intelligence Foundation

**Status:** Complete — closure approved and documentation reconciled

Sprint 14 established the permanent, game-agnostic foundation for Oracle's
external Companion to become the Operator's intelligent second screen.

Authoritative live runtime delivery was deferred at Sprint 14 closure. Sprint
26 later implemented, certified and closed that delivery seam through the
unchanged Guidance v1 architecture. Sprint 16 remains the completed Trust
Boundary objective.

---

# Sprint 14 Commit Sequence

- [x] Commit 1 — immutable Guidance Framework contracts (`1ed10bb`)
- [x] Commit 2 — deterministic Guidance Provider Service (`c93063b`)
- [x] Commit 3 — curated Call of Duty Guidance package (`918a67c`)
- [x] Commit 4 — Companion Guidance Application boundary (`b82bb49`)
- [x] Commit 5 — Companion Application presentation (`3868975`)

# Completed Sprint 14 Milestones

- [x] one immutable, versioned Guidance model for curated, deterministic and
  future AI-generated guidance
- [x] immutable projection boundary from authoritative Session Context
- [x] runtime validation rejects malformed, executable and non-serializable data
- [x] unknown open identifiers remain safely consumable
- [x] deterministic provider orchestration with structured failure isolation
- [x] canonical Game Integration-owned curated knowledge package
- [x] immutable Application state and Guidance Card view models
- [x] Operator-safe diagnostics that isolate provider implementation details
- [x] `/companion` renders loading, ready, empty, partial-success and unavailable
- [x] honest production unavailable state until authoritative delivery exists
- [x] External Companion and Platform → Services → Applications → Game
  Integrations boundaries preserved
- [x] focused, architecture, desktop, production build, lint and visual verification

---

# Sprint 13 Commit Sequence

- [x] Commit 1 — deterministic Game Detection contracts (`01ddbd5`)
- [x] Commit 2 — immutable game Session Context (`3898d45`)
- [x] Commit 3 — Companion lifecycle integration (`5a25ee7`)
- [x] Commit 4 — renderer-safe Companion presentation (`fa36af4`)
- [x] Commit 5 — verification, documentation and Sprint closure

# Completed Sprint 13 Milestones

- [x] supported Call of Duty windows are detected externally
- [x] deterministic not-detected, detected and ambiguous outcomes
- [x] authoritative, immutable game-agnostic Session Context
- [x] serialized attach, detach, reattach and process replacement
- [x] active-game presentation through a restricted additive preload bridge
- [x] detector and coordinator failure isolation
- [x] Desktop Platform API version 1 preserved unchanged
- [x] Constitution and ADR formalise the External Companion boundary
- [x] complete web, desktop, lint, architecture and focused verification

---

# Completed Sprint 12.1 Milestones

- [x] Companion Session Manager
- [x] Companion Context Ownership
- [x] Desktop Host Snapshot
- [x] Snapshot Coordinator
- [x] Desktop Host Event Stream
- [x] Desktop Diagnostics
- [x] Desktop Recovery
- [x] Desktop Timeline
- [x] Desktop Telemetry
- [x] Documentation implementation audit
- [x] Canonical `IMPLEMENTATION_STATUS.md`
- [x] Permanent `PROJECT_VISION.md`
- [x] Commit 3 — Complete Session Lifecycle
- [x] Commit 4 — Desktop Platform API Freeze
- [x] Commit 5 — Dependency Boundary Audit
- [x] Commit 6 — Final Hardening and Sprint Closure

Commit 3 synchronises attachment changes with the authoritative Companion
Session lifecycle and guarantees cleanup when the renderer fails to load.

---

# Sprint 12 Commit Sequence

- [x] Commit 1
- [x] Commit 2
- [x] Commit 3 — Complete Session Lifecycle
- [x] Commit 4 — Desktop Platform API Freeze
- [x] Commit 5 — Dependency Boundary Audit
- [x] Commit 6 — Final Hardening and Sprint Closure

---

# Sprint 13 Closure

- [x] focused game-detection verification
- [x] focused Session Context verification
- [x] focused Companion lifecycle verification
- [x] focused presentation and preload verification
- [x] desktop TypeScript compilation and emitted Electron entry validation
- [x] Next.js production build and ESLint
- [x] architecture audit, native-helper path and repository validation
- [x] Sprint closure and release decision

No Sprint 13 engineering objective remains open. AI coaching, vision, OCR,
match analysis, dynamic guidance, recommendations, statistics and gameplay
automation were explicitly excluded. The release decision is to close the
verified sprint on `sprint-9-overlay` without creating a product release tag;
tagging remains part of a separately authorised release workflow.

---

# Verified Platform State

## Intelligence Runtime

- Oracle Context, Pipeline and Intelligence Bus implemented
- Engine Registry and Engine Runtime implemented
- Signals, Decisions, Explainability, Timeline and Intelligence State
  implemented
- production Intelligence page calls the Pipeline directly

## Platform Coordination

- target-specific Web and Electron composition roots implemented
- shared dependency-injected Platform Runtime implemented
- ten Service and seven Application definitions injected through instance-owned
  registries
- Game Integration and Guidance provider composition explicit
- canonical Web and Electron manifests mechanically match constructed runtime
- Extension Runtime and Capability Graph implemented
- required fail-closed, optional degraded and fresh recovery semantics verified
- renderer-safe Platform health projection implemented
- required authoritative Session lifecycle declaration implemented with
  persistence disabled

## Authoritative Sessions

- Session Service is the sole durable lifecycle authority
- stable authenticated lifecycle and optimistic concurrency implemented
- explicit minimised Evidence admission implemented
- renderer-safe history, detail, export and deletion Application implemented
- Desktop correlation is immutable, versioned and non-merging
- Migration 013 is PostgreSQL-certified, undeployed and inactive
- direct browser Session persistence path removed

## Desktop Platform

- Electron host and restricted preload bridge implemented
- deterministic discovery, target scoring and attachment implemented
- native Windows discovery and observation implemented
- versioned immutable desktop contracts implemented
- Diagnostics, Recovery, Timeline and Telemetry implemented
- Desktop Platform API version 1 is frozen through the sole supported external
  import surface at `desktop/platform/index.ts`

## Companion

- Platform-level Companion Runtime foundation implemented
- desktop Companion Session and Context ownership implemented
- attachment and detachment transitions are reflected in the active desktop
  Companion Session
- supported-game discovery, attachment and process replacement are serialized
- game context is installed from the exact selected integration and cleared on
  detach, process loss and shutdown
- renderer presentation is a validated, game-agnostic projection of the
  authoritative Session
- renderer load failure closes the desktop controller and ends the started
  Session
- Platform owns immutable Guidance contracts, validation, compatibility and
  versioning
- Services own deterministic provider orchestration and failure isolation
- Applications own immutable presentation state, Guidance Cards and
  Operator-safe diagnostics
- `/companion` renders only Applications-owned models and maintains Service order
- the production route honestly reported unavailable before Sprint 26
  connected authoritative transient delivery
- Platform Companion readiness and Desktop Session/Context ownership are
  connected by an explicit non-merging lifecycle contract

## Game Integrations

- Game Integration contract, registry and evaluator implemented
- Call of Duty integration and executable profile implemented
- production registry is invoked by the game-agnostic desktop coordinator
- deterministic detection drives the desktop Companion lifecycle
- Call of Duty-specific executable and title knowledge remains isolated inside
  its Game Integration
- the first reviewed, source-attributed curated Guidance package is isolated
  inside the Call of Duty Game Integration and uses no runtime networking

---

# Architecture Audit

Target ownership remains:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

Open findings:

1. some web Applications directly import repositories, pipelines and engines
2. most registered Services and Applications remain metadata foundations;
   Session lifecycle is operational in source but persisted runtime is disabled
3. the desktop composition root does not yet project authoritative Session
   Context into a Guidance Request, execute the Provider Service and deliver
   Application state to `/companion`
4. curated-source freshness is manually governed; production runtime has not
   exercised ready and partial-success presentation paths

These findings are measured legacy exceptions retained from Sprint 12.1. They
remain accepted technical debt and do not authorise unrelated redesign.

---

# Documentation Health

- [x] Constitution updated with the permanent External Companion rule
- [x] Founding Charter establishes the highest institutional authority
- [x] The Oracle Way establishes canonical culture and behaviour
- [x] Constitution remains the highest product and architectural authority
- [x] Engineering Principles establish canonical durable engineering values
- [x] Oracle Strategy establishes operational strategic doctrine
- [x] Codex reconciled as the operational engineering standard
- [x] Documentation Index establishes reading order, classification and ownership
- [x] Engineering Governance defines the Roadmap, Epic, Sprint and Phase hierarchy
- [x] Sprint Index records canonical numbering and historical aliases
- [x] Project Vision and Oracle Principles marked superseded with history retained
- [x] Manifesto retained as a non-authoritative interpretive statement
- [x] Architecture aligned through the Sprint 14 Companion Intelligence Foundation
- [x] Companion Architecture aligned through Sprint 14 presentation
- [x] Architecture Index records all four Guidance ownership boundaries
- [x] Roadmap distinguishes the completed foundation from deferred live delivery
- [x] Master Build Plan reflects Sprint 14 closure
- [x] canonical implementation status reflects Sprint 14 closure
- [x] living delivery records reflect Sprint 17 completion, Migration 009
  production deployment and verification, Sprint 18 activation and disabled
  runtime persistence
- [x] ADR-037, ADR-038 and ADR-039 accepted
- [x] Operator-first constitutional and architectural reconciliation applied
- [x] Sprint 18 Plan approved and activated
- [x] ADRs record desktop snapshot/event and Timeline/Telemetry ownership
- [x] ADR records the Desktop Platform API version 1 compatibility commitment
- [x] Sprint 12.1 implementation audit added
- [x] Sprint 12.1 retrospective added
- [x] Sprint 13 implementation and closure record added
- [x] Constitution defines the permanent External Companion rule
- [x] ADR-031 records its rationale, alternatives and implications
- [x] ADR-032 records Guidance ownership, compatibility and long-term evolution
- [x] Sprint 14 closure record added with commits, verification, debt and lessons

---

# Sprint 14 Closure

Sprint 14 closure was approved on 21 July 2026. The Guidance contract, Service,
Game Integration package, Application boundary and React presentation checks
passed, as did the architecture audit, desktop TypeScript compilation,
production build, lint and desktop/narrow-screen visual review. Lint completed
with zero errors and five pre-existing warnings.

The Companion Intelligence Foundation was complete at Sprint 14 closure.
Sprint 15 architectural review subsequently approved Operator Understanding
as the next delivery objective. Sprint 26 later implemented and certified
authoritative transient Guidance delivery. See
`docs/sprints/SPRINT_14_CLOSURE.md` for the historical foundation record and
`docs/sprints/SPRINT_26_CLOSURE.md` for the delivery resolution.
