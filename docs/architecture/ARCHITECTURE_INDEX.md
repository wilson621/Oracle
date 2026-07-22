# ORACLE ARCHITECTURE INDEX

**Authority:** Canonical subsystem ownership and boundary index beneath the Constitution and Architecture
**Scope:** Locations, responsibilities, ownership, outputs and prohibited responsibilities
**Owner:** Oracle Architecture
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever subsystem ownership or implementation status changes
**Supersedes:** Earlier Architecture Index versions
**Superseded By:** None
**Last Reviewed:** 22 July 2026
**Version:** 5.8

---

# Purpose

The Architecture Index is Oracle's living engineering blueprint.

It defines the responsibilities, ownership and boundaries of every subsystem
within Oracle.

The purpose of this document is to ensure Oracle remains scalable,
maintainable and consistent over many years of development.

This document complements:

- Founding Charter
- The Oracle Way
- Platform Constitution
- Oracle Strategy
- Engineering Principles
- accepted ADRs
- Codex
- Roadmap
- ADRs

It does not replace them.

# Current Production Architecture

Architecture v4.1 remains the historical engine-runtime baseline. The current
repository extends it through the Sprint 8 Platform coordination foundations,
the Sprint 12.1 Desktop Platform, Sprint 13's Game Integration vertical slice
and Sprint 14's Companion Intelligence Foundation. Current delivery truth is
recorded in `IMPLEMENTATION_STATUS.md`.

The Sprint 12 Commit 5 dependency findings and enforcement baseline are
recorded in `DEPENDENCY_BOUNDARY_AUDIT.md`.

The platform now executes intelligence through a validated Engine Runtime rather than a monolithic orchestration model.

Runtime execution follows:

```text
Oracle Context
        │
        ▼
Runtime Validation
        │
        ▼
Oracle Engine Runtime
        │
        ▼
Registered Oracle Engines
        │
        ▼
Signals • Decisions • Graph
        │
        ▼
Oracle Intelligence State
```

The detailed architecture is documented in **ARCHITECTURE_v4.1.md**.

---

# Core Philosophy

Oracle is built as a platform.

Every subsystem owns exactly one responsibility.

Business logic belongs inside engines.

Presentation never contains intelligence.

Repositories expose truth.

Signals communicate observations.

Decision Intelligence recommends actions.

Oracle Brain reasons.

The Pipeline orchestrates.

The Intelligence Bus coordinates engines.

Oracle Context supplies shared intelligence.

---

# Runtime Architecture

```text
Repositories
        │
        ▼
Oracle Context Builder
        │
        ▼
Oracle Context
        │
        ▼
Intelligence Pipeline
        │
        ▼
Intelligence Bus
        │
        ▼
Engine Registry
        │
        ├──────────────┐
        ▼              ▼
Memory Engine   Behaviour Evolution Engine
        │              │
        └──────┬───────┘
               ▼
        Aggregated Signals
               │
               ▼
          Oracle Brain
               │
               ▼
     Decision Intelligence
               │
               ▼
        Mission Control UI
```

---

# Subsystems

---

## Oracle Context

Location

```
lib/oracle/context
```

Purpose

Creates the shared intelligence object used by every Oracle engine.

Owns

- Operator
- Current Session
- Recent Sessions
- Game Context
- Existing Signals
- Existing Decisions

Produces

- OracleContext

Must Never

- Query UI
- Generate recommendations
- Analyse behaviour
- Render components

---

## Intelligence Pipeline

Location

```
lib/oracle/pipeline
```

Purpose

Coordinates the runtime execution flow.

Owns

- Pipeline inputs
- Pipeline outputs
- Pipeline summary

Produces

- IntelligencePipelineResult

Must Never

- Generate intelligence
- Store truth
- Replace Oracle Brain

---

## Intelligence Bus

Location

```
lib/oracle/bus
```

Purpose

Executes registered engines and aggregates outputs.

Owns

- Engine execution
- Engine ordering
- Dependency resolution
- Signal aggregation
- Decision aggregation

Produces

- IntelligenceBusResult

Must Never

- Reason
- Recommend
- Render UI

---

## Engine Registry

Location

```
lib/oracle/engines
```

Purpose

Provides Oracle's universal engine framework.

Owns

- Engine registration
- Metadata
- Execution contract

Produces

- Registered engines

Must Never

- Execute business logic
- Replace the Bus

---

## Runtime Services

### Location

```
lib/oracle/engines
```

### Purpose

Provide shared platform capabilities for every registered engine.

### Owns

- Runtime Validation
- Engine Diagnostics
- Engine Health

### Produces

- Runtime execution metadata

### Must Never

- Generate intelligence
- Replace engine logic
- Render UI

---

## Memory

Location

```
lib/oracle/memory
```

Purpose

Builds persistent understanding of the Operator.

Owns

- Memory confidence
- Memory status
- Recurring strengths
- Recurring weaknesses
- Behaviour patterns
- Memory signals

Produces

- OracleMemoryProfile

Must Never

- Recommend actions
- Query UI
- Replace Oracle Brain

---

## Behaviour Evolution

Location

```
lib/oracle/evolution
```

Purpose

Measures how the Operator changes over time.

Owns

- Skill improvement
- Skill decline
- Behaviour trajectory
- Evolution signals

Produces

- BehaviourEvolutionProfile

Must Never

- Persist data
- Recommend actions
- Render UI

---

## Signals

Location

```
lib/oracle/signals
```

Purpose

Universal observation language for Oracle.

Signals describe facts.

Signals never recommend.

Owns

- Signal types
- Priority
- Summary generation

Produces

- OracleSignal

Must Never

- Make decisions
- Query databases
- Render UI

---

## Oracle Brain

Location

```
lib/oracle/brain
```

Purpose

Transforms intelligence into understanding.

Owns

- Assessment
- Classification
- Strategic reasoning
- Summary
- Next focus

Produces

- OracleBrainReport

Must Never

- Read databases
- Render UI
- Replace specialist engines

---

## Decision Intelligence

Location

```
lib/oracle/intelligence
```

Purpose

Converts observations into recommendations.

Owns

- Evidence
- Confidence
- Recommendations
- Expected outcomes

Produces

- OracleDecision

Must Never

- Replace Oracle Brain
- Query repositories
- Render UI

---

## Repositories

Location

```
lib/oracle/repositories
```

Purpose

Expose persistent truth.

Owns

- Database access
- Session retrieval
- Mapping

Produces

- OracleSessionRow

Must Never

- Analyse
- Recommend
- Render UI

---

## Presentation

Location

```
app/
components/
```

Purpose

Present Oracle intelligence.

Owns

- Layout
- Pages
- Components
- Cards

Produces

- User Interface

Must Never

- Query databases
- Generate intelligence
- Duplicate business logic

---

## Companion Intelligence Foundation

Purpose

Provides one reusable path from immutable Companion Session projections to
Operator-facing external guidance.

Ownership and locations

```text
Platform / Companion Foundation
lib/companion/guidance/
    Immutable contracts, validation, compatibility and versioning
        ↓
Oracle Services
lib/oracle/services/companion-guidance/
    Provider discovery by dependency injection, eligibility, deterministic
    execution, output validation and structured failure isolation
        ↓
Oracle Applications
lib/oracle/applications/companion/
    Immutable presentation state, Guidance Card view models and Operator-safe
    diagnostics
        ↓
React Presentation
app/companion/ and components/companion/guidance/
    Rendering of Application-owned models only

Game Integrations
lib/oracle/game-integrations/*/guidance/
    Reviewed game-specific knowledge packages contributed through the shared
    Platform and Services boundaries
```

Produces

- versioned Guidance, Guidance Request and Session projection contracts
- immutable deterministic Provider Service results
- presentation-safe Companion Guidance Application state
- a calm `/companion` second-screen experience

Must Never

- mutate or own Companion Session lifecycle
- expose provider implementations to Applications or React
- move game-specific knowledge outside Game Integrations
- rank, personalise or generate guidance inside provider orchestration or React
- inject into games, inspect or modify game memory, hook game functions,
  automate gameplay or input, or interact with anti-cheat systems

The foundation is complete as of Sprint 14. Authoritative live runtime delivery
from desktop Session Context to `/companion` remains deferred and is not part
of the verified Sprint 14 implementation. Sprint 15 now establishes the
Operator Understanding Foundation; live Guidance delivery requires separate
future planning and approval.

---

# Operator Ownership Foundation

Location

```text
database/008_operator_ownership.sql
lib/oracle/repositories/operator-repository.ts
lib/oracle/services/operator/
lib/operator/getCurrentOperator.ts
lib/operator/completeOperatorCommissioning.ts
lib/oracle/getOperatorProfile.ts
```

Owns

- authenticated current-Operator resolution through the Operator Service
- direct Operator persistence through the Operator Repository
- one-to-one Account-to-Operator ownership through
  `operator_account_bindings`
- production-equivalent authenticated behaviour in local development and test

Produces

- the Operator owned by the authenticated Supabase Account
- explicit authentication, ownership-not-established and unavailable-record
  failures
- RLS-scoped Operator, Session, achievement and binding access

Must Never

- treat a Supabase Auth Account as Operator identity
- select an arbitrary or first Operator
- use a shared local-development Operator fallback
- expose Repository ownership to Applications or engines
- backfill historical ownership without evidence
- expose one Operator's data to another Account
- treat permanent security fixtures as product or general development data

The Phase 1 foundation is deployed and verified with two permanent regression
principals and Operators. Those fixtures are reserved exclusively for
migration, ownership, RLS, authentication and security regression testing.
Later Operator Understanding persistence, candidate production, control and
Context capabilities are not part of this completed foundation.

---

# Operator Understanding Contract Foundation

Location

```text
lib/oracle/understanding/
lib/oracle/services/operator/operator-declaration-service-types.ts
lib/oracle/services/operator-intelligence/
lib/oracle/services/operator-understanding/
scripts/verify-operator-understanding-*.ts
```

Owns

- immutable, versioned Operator Understanding contracts
- structural certainty, provenance, scope, temporal validity and eligibility
- Evidence-reference and claim-revision language
- deterministic durable explanation requirements
- claim and declaration lifecycle validation
- purpose-scoped `OperatorUnderstandingSnapshot`
- interface-only Service ownership boundaries

Produces

- validated Known, Declared, Observed, Inferred, Suspected and Unknown items
- minimal Evidence references with separate observation quality
- confidence-aware claims with support and contradiction relationships
- monotonic revisions and content-free deletion tombstones
- deeply immutable and serialisable Understanding projections

Must Never

- own raw Session or Game Integration evidence
- treat certainty as a confidence threshold
- fabricate confidence for Known or Declared information
- accept AI-generated or sensitive inferred claims
- promote game-scoped evidence implicitly across games or to Operator scope
- become a Repository, inference engine, generic profile or source of truth
- expose arbitrary current-Operator selection to Applications
- activate runtime consumption before later approved control gates

Phase 2 is a contract-only foundation. Its Services have no runtime
implementation or production registration, and no persistence, migration,
candidate adapter, Context projection, Application integration or UI is
introduced.

---

# Operator Intelligence Persistence Foundation

Location

```text
database/009_operator_intelligence_persistence.sql
lib/oracle/repositories/operator-intelligence-repository.ts
scripts/verify-operator-intelligence-persistence.ts
```

Owns

- durable Operator Intelligence policy-version references
- minimal Evidence-reference persistence
- stable claim identity and immutable claim revisions
- claim-to-evidence support and contradiction links
- append-only purpose-specific eligibility history
- authenticated atomic persistence and same-Operator relational integrity
- immutable snapshot-visible claim-head events for bounded page selection
- versioned, query-bound cursor mechanics and explicit result budgets

Produces

- persisted contracts validated through the Phase 2 factories
- bounded current and historical claim pages reconstructed by the Repository
- deterministic explanations propagated unchanged from stored revisions
- database-enforced ownership, lifecycle and direct-write boundaries

Must Never

- own raw Session, prompt or Game Integration source truth
- persist `OperatorUnderstandingSnapshot`
- let Applications or engines access persistence directly
- allow cross-Operator Evidence or revision relationships
- reinterpret game-specific meaning or promote claims across games
- register runtime consumption before the approved control gates
- create real candidates during Phase 3

The exact Sprint 17 migration has passed refreshed rollback, independent
catalog and production-shaped scale verification but is not permanently
deployed. The Repository is implemented without runtime
Service registration, producer integration, Context projection, Application
consumption or UI.

---

# Engineering Rules

Every new subsystem must:

- Have one responsibility.
- Produce structured outputs.
- Be independently testable.
- Prefer Signals over direct coupling.
- Use Oracle Context.
- Avoid database access unless it is a Repository.
- Avoid rendering UI.
- Remain reusable.

---

# Current Platform Status

Completed

- Oracle Context
- Intelligence Pipeline
- Intelligence Bus
- Engine Registry
- Memory Engine
- Behaviour Evolution Engine
- Oracle Brain
- Decision Intelligence
- Signal Framework
- Repository Layer

Current Development Status

Sprint 17 — Scale-Safe Trust Data Plane is Founder-approved and fully complete,
including the verified Migration 009 production deployment. The production
persistence foundation is established, but runtime persistence remains
disabled. Sprint 18 has not started and is not activated.

Current Runtime

✓ Engine Runtime
✓ Runtime Validation
✓ Runtime Diagnostics
✓ Runtime Health
✓ Behaviour Engine
✓ Trend Engine
✓ Prediction Engine
✓ Mission Engine
✓ Platform, Service and Application registry foundations
✓ Electron Companion host
✓ Companion Session Manager and Context ownership
✓ Desktop Host Snapshot and Event Stream
✓ Desktop Diagnostics and Recovery
✓ Desktop Timeline and Telemetry
✓ Desktop Platform API version 1 freeze
✓ Dependency Boundary Audit and automated enforcement
✓ Final hardening and closure verification
✓ Sprint 13 deterministic Game Integration vertical slice
✓ Immutable and versioned Companion Guidance Framework
✓ Deterministic Guidance Provider Service
✓ Curated Call of Duty Guidance package
✓ Companion Guidance Application boundary
✓ `/companion` React presentation with honest unavailable fallback
✓ Sprint 14 focused, architecture, desktop, web and lint verification
✓ Sprint 15 authenticated Account-to-Operator ownership foundation
✓ Operator Service and Repository ownership boundary
✓ deployed ownership RLS and authenticated multi-principal isolation
✓ immutable and versioned Operator Understanding contracts
✓ explicit claim and declaration lifecycle validation
✓ deterministic evidence-backed claim explanations
✓ purpose-scoped immutable Operator Understanding Snapshot
✓ exclusive Operator Intelligence Service mutation authority
✓ server-only trusted Supabase boundary and ownership injection
✓ global policy, consent, evidence-disposition and admission contracts
✓ service-role-only durable Operator Intelligence persistence boundary

Accepted integration debt

- Platform bootstrap production wiring
- authoritative desktop Session Context to Guidance Request, Provider Service
  and renderer-safe Application-state delivery
- explicit integration between the Platform-level and desktop-level Companion
  lifecycle foundations
- manual curated-source freshness governance
- production exercise of ready and partial-success Companion presentation paths
- measured legacy web Application boundary exceptions and five pre-existing
  lint warnings

---

# Future Platform Roadmap

Planned Subsystems

- Map Intelligence
- Public Knowledge Engine
- Strategy Engine
- Voice Intelligence
- Visual Intelligence
- authoritative live Companion Guidance delivery
- Companion assistance capabilities beyond the completed intelligence
  foundation

Each new subsystem must be added to this Architecture Index when introduced.

---

# Guiding Principle

Every architectural decision should answer one question:

> Will this improve the Operator?

If the answer is no,

redesign it.
