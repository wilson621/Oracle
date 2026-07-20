# Oracle Architecture v4.1

**Status:** Historical engine-runtime baseline
**Version:** 4.1  
**Last Updated:** Sprint 6.7

> This document is preserved as the Sprint 6.7 engine-runtime record. The
> current architecture extends it with the Sprint 8 Platform layers and Sprint
> 12.1 Desktop Platform. See `../Architecture.md` and
> `IMPLEMENTATION_STATUS.md` for current status.

---

# Overview

Oracle is an engine-driven intelligence platform.

Rather than executing intelligence through large monolithic workflows, Oracle composes intelligence from a series of independent, registered engines operating within a shared runtime.

Each engine owns a single domain of intelligence.

The runtime is responsible for orchestration—not intelligence.

---

# High-Level Architecture

```text
                         Oracle Context
                               │
                               ▼
                     Runtime Validation
                               │
                               ▼
                    Oracle Engine Runtime
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Behaviour Engine      Trend Engine       Prediction Engine
                                                    │
                                                    ▼
                                             Mission Engine
                               │
                               ▼
                 Graph • Signals • Decisions
                               │
                               ▼
                 Oracle Intelligence State
```

---

# Core Principles

## 1. Context is Immutable

OracleContext is constructed once.

After creation it is never modified.

Every engine consumes the same runtime context.

No engine mutates upstream state.

---

## 2. Engines Own Intelligence

Each intelligence capability has exactly one owner.

| Capability | Owner |
|------------|-------|
| Behaviour | Behaviour Engine |
| Trend | Trend Engine |
| Prediction | Prediction Engine |
| Mission | Mission Engine |

Engines never duplicate another engine's calculations.

---

## 3. Intelligence Flows Downstream

Information flows in one direction.

```text
Behaviour
      │
      ▼
Trend
      │
      ▼
Prediction
      │
      ▼
Mission
```

Downstream engines consume upstream intelligence.

Upstream engines never depend on downstream intelligence.

---

## 4. Runtime Services Are Platform Concerns

Runtime services support every engine equally.

They do not contain intelligence.

Current runtime services are:

- Runtime Validation
- Engine Diagnostics
- Engine Health

These services exist independently of Behaviour, Trend, Prediction or Mission.

---

## 5. Engines Are Modular

Every Oracle Engine:

- declares metadata
- declares dependencies
- declares capabilities
- executes independently
- returns a typed profile
- may emit signals
- may emit decisions
- may contribute graph nodes
- may publish diagnostics

This allows new capabilities to be introduced without modifying the runtime.

---

# Oracle Engine Runtime

The runtime executes registered engines in dependency order.

Execution lifecycle:

```text
Validate Runtime
        │
        ▼
Create Runtime
        │
        ▼
Execute Engines
        │
        ▼
Collect Profiles
        │
        ▼
Aggregate Graph
        │
        ▼
Aggregate Signals
        │
        ▼
Aggregate Decisions
        │
        ▼
Build Oracle Intelligence State
```

The runtime owns orchestration.

Individual engines own intelligence.

---

# Runtime Services

## Validation

Performed before execution.

Validation prevents:

- duplicate engine IDs
- missing dependencies
- circular dependencies
- invalid metadata
- invalid versioning

Execution does not begin if validation fails.

---

## Diagnostics

Every engine execution records:

- execution time
- dependency resolution
- graph contribution
- signal contribution
- decision contribution
- diagnostics availability

Diagnostics are intended primarily for developers.

---

## Health

Engine Health evaluates runtime execution quality.

Health is separate from domain confidence.

For example:

- Prediction confidence evaluates the prediction.
- Engine Health evaluates the execution of the Prediction Engine.

Health provides the foundation for future operational monitoring.

---

# Legacy Compatibility

Oracle still contains legacy presentation contracts.

These remain supported while the Engine Runtime becomes the authoritative execution model.

Examples include:

- OracleBrain
- generateOracleBrainReport()

These compatibility layers are stable but are no longer extended with new intelligence capabilities.

All new intelligence is implemented as registered Oracle Engines.

---

# Future Expansion

The architecture is designed to support additional engines without modifying the runtime.

Examples include:

- Strategy Engine
- Timeline Intelligence
- Weapon Intelligence
- Memory Intelligence
- Advanced Coaching
- Explainability

Future capabilities should integrate through the Engine Runtime rather than introducing parallel execution paths.

---

# Architectural Goal

Oracle is evolving toward a fully modular intelligence platform where:

- context is immutable
- intelligence is engine-driven
- orchestration is centralised
- capabilities are independently extensible
- runtime services remain shared infrastructure

This separation allows Oracle to continue expanding while preserving clear ownership boundaries and maintainable architecture.
