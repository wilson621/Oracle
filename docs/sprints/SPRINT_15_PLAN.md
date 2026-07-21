# ORACLE SPRINT 15 PLAN

**Authority:** Approved Sprint execution plan beneath the Master Build Plan and accepted ADRs
**Scope:** Operator Understanding Foundation planning, boundaries, phases and acceptance criteria
**Owner:** Oracle Platform Engineering
**Status:** Active — Phase 1 complete; Phase 2 not authorised
**Classification:** Living until Sprint closure
**Expected Stability:** Updated only through approved Sprint 15 scope review
**Supersedes:** The earlier recommendation that Sprint 15 deliver authoritative live Companion Guidance
**Superseded By:** None
**Last Reviewed:** 21 July 2026
**Sprint:** 15 — Operator Intelligence: Operator Understanding Foundation
**Branch:** `sprint-9-overlay`
**Activation Baseline:** `d9d78c94acbc628fbbc35f4a42ba970d02b2f9e9`

---

# Status

Sprint 15 is formally active. Phase 1 — Ownership Foundation has passed founder
closure review. Phase 2 has not begun and requires separate authorisation.

Sprint 14 remains the latest closed and verified implementation Sprint.

# Phase 1 Closure Outcome

Phase 1 established the authenticated Account-to-Operator ownership boundary
without changing existing Operator identifiers or assigning ownership to
historical data:

- `operator_account_bindings` owns the durable one-to-one relationship between
  Supabase Auth Accounts and Oracle Operators
- the Operator Service is the sole current-Operator resolution boundary
- the Operator Repository owns direct database access
- production, development and test resolution all require authentication
- arbitrary first-row resolution and the shared development Operator fallback
  are removed
- RLS and restricted grants protect bindings, Operators, Sessions and
  achievements
- existing Operator and Session truth is preserved, including two unowned
  historical Sessions
- two permanent verification principals, Operators, bindings and Sessions are
  retained exclusively for migration, ownership, RLS, authentication and
  security regression testing

The deployed migration is `database/008_operator_ownership.sql`. It was
rollback-validated before founder approval, permanently deployed only after an
independent catalog inspection and then exercised through authenticated
multi-principal isolation verification.

# Mission

Establish the trusted foundation through which Oracle can progressively
understand each Operator using explicit identity, declared preferences and
goals, permitted evidence, selective Memory and evidence-derived candidate
intelligence.

This is a narrow platform foundation. It is not a profile-page sprint, a broad
inference sprint or a Companion delivery sprint.

# Strategic Framing

Operator Understanding is the architectural umbrella:

```text
Operator Understanding
├── Account relationship
├── Explicit Identity
├── declared Preferences
├── declared Goals
├── temporary State
├── governed Memory
├── permitted Evidence
└── Operator Intelligence
    └── evidence-derived conclusions
```

Operator Intelligence is one contributor to understanding. It does not own
Identity, Preferences, Goals, State or Memory.

Existing subsystem and product names remain unchanged. A permanent public
capability rename is not part of Sprint 15.

# Binding Architecture

Sprint 15 implements ADR-033 through ADR-036:

- ADR-033 — canonical Account and Operator ownership
- ADR-034 — Operator Understanding and Intelligence lifecycle
- ADR-035 — Operator data governance and control
- ADR-036 — game scope and cross-game portability

The following accepted decisions remain in force:

- ADR-003 — Oracle Session is the atomic unit of intelligence
- ADR-006 — Repositories expose persistent truth
- ADR-008 — Signals communicate observations
- ADR-009 — Decision Intelligence owns recommendations in the main
  Intelligence pipeline
- ADR-010 — Operator Intelligence exists independently of any game
- ADR-012 — Oracle Context is the shared engine input
- ADR-022 and ADR-023 — permanent layer and ownership model
- ADR-024 — Game Integrations own game-specific knowledge
- ADR-031 — External Companion architecture
- ADR-032 — Companion Guidance Framework

ADR-034 supersedes only ADR-032's historical Sprint-number scheduling note.
It does not change Guidance architecture or compatibility.

# Certainty and Provenance

Operator Understanding distinguishes how information is known:

- Known
- Declared
- Observed
- Inferred
- Suspected
- Unknown

This epistemic classification is separate from confidence. Classification
describes provenance and certainty type. Confidence describes strength of
support. Suspected information remains a provisional candidate and is not
eligible for ordinary Sprint 15 personalisation.

# Approved Scope

## Account and Operator Ownership

- inspect the deployed Supabase schema and Row Level Security policies
- establish a stable Account-to-Operator binding
- preserve existing Operator identifiers where ownership can be established
- remove arbitrary first-row Operator resolution from production paths
- define explicit local desktop and development identity behaviour
- enforce authenticated Operator scope in Repositories and RLS

## Explicit Understanding

- durable, separate Preference and Goal models
- revision, withdrawal and temporal-validity semantics
- declaration provenance without fabricated inference confidence

## Evidence and Candidate Intelligence

- versioned Evidence, Claim, Revision and Data Policy contracts
- provenance, scope, epistemic classification and confidence rationale
- support and contradiction relationships
- candidate, active, disputed, superseded, expired and deleted lifecycle
- one narrow adapter for the existing recurring Memory strength and weakness
  family
- Game Integration-specific candidate scope only
- no speculative historical profile backfill

## Memory and Operator Control

- approved retention, decay and eligibility policy boundaries
- inspect, correct, dispute, export and deletion Service operations
- purpose-specific consent and revocation enforcement points
- exclusion of disputed or revoked understanding from future projections

## Understanding Projection

- immutable, versioned `OperatorUnderstandingSnapshot`
- separate Identity, Preferences, Goals, State, Intelligence and Memory
  sections
- projection through Services into Oracle Context
- no persistence or mutation authority in the projection
- production consumption remains gated until control requirements are met

# Explicit Non-Goals

Sprint 15 will not implement:

- a broad Operator Understanding UI
- a generic profile record
- psychological, clinical or sensitive personal inference
- persisted learning-style, motivation or frustration inference
- coaching-style optimisation
- automatic cross-game claim promotion
- AI-generated Operator claims
- new Game Integrations or game knowledge
- Companion Guidance ranking or personalisation
- authoritative live Companion Guidance delivery
- changes to Guidance contract version 1
- changes to Desktop Platform API version 1
- a wholesale engine, repository or Application rewrite
- production Platform bootstrap activation

# Systems to Preserve

Sprint 15 extends rather than replaces:

- Operator Profile Engine
- Memory Engine
- Behaviour Evolution Engine
- Adaptive Coaching Engine
- Planner
- Oracle Context
- Intelligence Pipeline and Bus
- Signals, Decision Intelligence, Graph, Timeline and Explainability
- Session Repository and existing Session truth
- Companion Session Manager
- Guidance Framework
- Game Integration ownership
- External Companion and Fair Play boundaries

Existing heuristic outputs do not become durable understanding automatically.

# Ownership Model

| Responsibility | Owner |
|---|---|
| Authentication and credentials | Supabase Auth through Platform infrastructure |
| Account-to-Operator binding | Operator Service |
| Identity, Preferences and Goals | Operator Service |
| temporary State | existing Session and Context owners |
| evidence source truth | existing source owner |
| evidence references and claims | Operator Intelligence Service |
| retention, decay and eligibility | Memory Service policy |
| game-specific interpretation | Game Integration |
| Understanding projection | approved Service composition boundary |
| Context inclusion | Oracle Context Builder |
| personalisation decisions | responsible reusable Service |
| presentation and Operator interaction | Oracle Applications |
| persistence | Repositories |

# Implementation Phases

## Phase 0 — Committed Planning Baseline

- [x] final architectural approval
- [x] Sprint 15 activation authorised
- [x] ADR-033 through ADR-036 prepared and accepted
- [x] Roadmap sequencing reconciled
- [x] Sprint plan prepared
- [x] planning documentation verification passes
- [x] planning baseline committed with a clean working tree

Implementation is blocked until every Phase 0 item is complete.

## Phase 1 — Ownership Foundation

- [x] inspect deployed Supabase schema and policies
- [x] define Account-to-Operator migration
- [x] establish authenticated Repository scope and RLS
- [x] define explicit local-development and desktop identity behavior
- [x] verify rollback safety and independent post-deployment catalog state
- [x] verify authenticated multi-principal isolation and anonymous rejection
- [x] preserve historical Operator and Session truth without speculative backfill
- [x] complete founder Phase 1 closure review

Phase 1 is complete. Its permanent verification fixtures are operational test
assets only and must never be used as product Operators or ordinary application
data.

## Phase 2 — Understanding Contracts

- [ ] define immutable versioned domain contracts
- [ ] define lifecycle transitions
- [ ] define certainty, provenance, confidence and scope semantics
- [ ] define Operator and Operator Intelligence Service contracts
- [ ] define `OperatorUnderstandingSnapshot`

## Phase 3 — Persistence and Migration

- [ ] implement approved Repositories and migrations
- [ ] preserve existing Operator and Session truth
- [ ] add ownership constraints, indexes and RLS
- [ ] verify empty, production-shaped and failure migrations
- [ ] verify rollback or forward-repair procedure

## Phase 4 — Narrow Candidate Lifecycle

- [ ] adapt recurring Memory strength and weakness output
- [ ] create evidence-linked game-specific candidate claims
- [ ] record policy version and confidence rationale
- [ ] verify contradiction, dispute, expiry and supersession
- [ ] prevent unsupported or duplicate claims

## Phase 5 — Context and Control Services

- [ ] construct immutable eligible Understanding projection
- [ ] integrate the approved projection through Oracle Context
- [ ] implement inspect, correct, dispute, export and deletion operations
- [ ] enforce consent revocation and retention outcomes
- [ ] keep broad production personalisation gated

## Phase 6 — Verification, Documentation and Closure

- [ ] architecture and dependency review
- [ ] schema, migration and ownership verification
- [ ] privacy and Operator-control verification
- [ ] explainability and certainty verification
- [ ] existing engine, Guidance, desktop and web regression verification
- [ ] canonical documentation reconciliation
- [ ] founder closure review

# Acceptance Criteria

Sprint 15 is complete only when:

1. Production Operator resolution is authenticated and cannot select an
   arbitrary Operator.
2. Multi-Operator data isolation is enforced and verified.
3. Identity, Preferences, Goals, State, Memory and Intelligence remain
   structurally and authoritatively distinct.
4. Every inferred claim has evidence, provenance, scope, epistemic class,
   confidence rationale, policy version and temporal lifecycle.
5. Unsupported information remains Unknown or Suspected and is not presented
   as established understanding.
6. Declared information is never misrepresented as inferred fact.
7. The initial durable candidate family remains game-specific.
8. Correction, dispute, consent revocation, retention and deletion alter future
   Understanding projections correctly.
9. `OperatorUnderstandingSnapshot` remains an immutable read projection and
   never becomes a source of truth.
10. Existing engines, Guidance, desktop contracts and Game Integration
    boundaries remain intact.
11. All approved verification passes.
12. Implementation and documentation are reconciled and the repository is
    clean at closure.

# Verification Plan

Required verification includes:

- `npm run architecture:audit`
- `npm run guidance:verify`
- `npm run companion:presentation:verify`
- `npm run desktop:compile`
- `npm run build`
- `npm run lint`
- `git diff --check`
- migration validation against empty and production-shaped fixtures
- authenticated, unauthenticated and cross-Operator RLS tests
- claim idempotency and lifecycle tests
- consent, correction, dispute, export, deletion and retention tests
- sensitive-inference rejection tests
- game-scope and cross-game-portability rejection tests
- clean working-tree and untracked-file inspection

Before implementation, the relevant Next.js 16.2.10 documentation under
`node_modules/next/dist/docs/` must be read as required by `AGENTS.md`.

# Sequencing

```text
Sprint 14 — Companion Intelligence Foundation
        ↓
Sprint 15 — Operator Understanding Foundation
        ↓
Future separately approved Sprint
Authoritative Companion Guidance Delivery
```

Authoritative Companion Guidance delivery is not automatically Sprint 16. It
returns to the future queue and requires separate planning and approval.

# Activation Rule

The planning commit activates Sprint 15 but does not itself authorise code in
the same commit. Implementation begins only from the committed, clean planning
baseline and proceeds through the phases above.
