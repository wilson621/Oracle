# ORACLE PROJECT BOARD

**Authority:** Canonical record of current approved progress beneath the Master Build Plan
**Scope:** Active governance work, latest closed Sprint, milestones and verified delivery state
**Owner:** Oracle Delivery
**Status:** Active
**Classification:** Living
**Expected Stability:** Updated whenever approved work changes state
**Supersedes:** Earlier active Project Board versions
**Superseded By:** None
**Last Reviewed:** 22 July 2026
**Version:** 5.1
**Branch:** `sprint-9-overlay`
**Governance v2 baseline:** `0423aad`

---

# Current Sprint

Sprint 17 — Scale-Safe Trust Data Plane engineering implementation is complete
and submitted for Founder closure review. Criterion 24 (Founder closure and a
separately approved closure commit) remains pending. Migration 009 remains
undeployed and Sprint 18 is not active.

The complete approved Sprint 17–31 sequence and Beta Gates are recorded in
`docs/ENGINEERING_PROGRAMME.md`. The approved Sprint 17 implementation scope,
phases, verification and exit governance are recorded in
`docs/sprints/SPRINT_17_PLAN.md`.

Implementation evidence is recorded in
`docs/sprints/SPRINT_17_CLOSURE.md`; the version-pinned deployment decision
artifact is `docs/sprints/SPRINT_17_MIGRATION_009_DOSSIER.md`.

# Latest Closed Sprint

## Sprint 16 — Trust Boundary

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

Authoritative live runtime delivery remains deferred. Sprint 15 architectural
review placed the Operator Understanding Foundation ahead of that work. Live
Guidance delivery has returned to the future queue and requires separate
planning and approval. Sprint 16 is the completed Trust Boundary objective.

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

- Platform Runtime and bootstrap function implemented
- ten Service definitions registered by Platform Runtime
- six Application definitions registered by Platform Runtime
- Extension Runtime and Capability Graph implemented
- production startup does not currently invoke Platform bootstrap

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
- the production route honestly reports unavailable because authoritative live
  runtime delivery is not yet connected
- the Platform-level and desktop-level lifecycle foundations are not yet
  connected by an explicit contract

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
2. Platform bootstrap is not a production entry-point dependency
3. registered Services and Applications are metadata foundations, not the
   exclusive runtime boundary
4. the desktop composition root does not yet project authoritative Session
   Context into a Guidance Request, execute the Provider Service and deliver
   Application state to `/companion`
5. curated-source freshness is manually governed; production runtime has not
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
- [x] living delivery records reflect Sprint 16 closure and Sprint 17 inactivity
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

The Companion Intelligence Foundation is complete. Sprint 15 architectural
review subsequently approved the Operator Understanding Foundation as the next
delivery objective. Authoritative live Guidance delivery remains unimplemented
and separately deferred. See `docs/sprints/SPRINT_14_CLOSURE.md` for the formal
Sprint 14 record.
