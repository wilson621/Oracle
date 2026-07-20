# ORACLE ARCHITECTURE INDEX

Version: 5.1

Status: Active

---

# Purpose

The Architecture Index is Oracle's living engineering blueprint.

It defines the responsibilities, ownership and boundaries of every subsystem
within Oracle.

The purpose of this document is to ensure Oracle remains scalable,
maintainable and consistent over many years of development.

This document complements:

- Project Vision
- Manifesto
- Codex
- Principles
- Roadmap
- ADRs

It does not replace them.

# Current Production Architecture

Architecture v4.1 remains the historical engine-runtime baseline. The current
repository also contains the Sprint 8 Platform coordination foundations and
the Sprint 12.1 Desktop Platform. Current delivery truth is recorded in
`IMPLEMENTATION_STATUS.md`.

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

Current Development Phase

Sprint 12.1 — Desktop Platform Foundation and Hardening

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

Not yet closed

- full Sprint 12.1 verification
- Game Integration to desktop-context wiring
- Platform bootstrap production wiring

---

# Future Platform Roadmap

Planned Subsystems

- Map Intelligence
- Public Knowledge Engine
- Strategy Engine
- Voice Intelligence
- Visual Intelligence
- Companion assistance capabilities beyond the current desktop foundation

Each new subsystem must be added to this Architecture Index when introduced.

---

# Guiding Principle

Every architectural decision should answer one question:

> Will this improve the Operator?

If the answer is no,

redesign it.
