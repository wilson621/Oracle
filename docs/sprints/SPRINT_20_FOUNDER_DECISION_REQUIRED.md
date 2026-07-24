# SPRINT 20 FOUNDER ARCHITECTURE DECISION REQUIRED

**Sprint:** 20 — Platform Runtime Activation

**Status:** Not activated; Founder architecture decision required

**Date:** 24 July 2026

## Decision boundary

The Engineering Programme requires Sprint 20 to activate production
composition roots and states that a production composition-root ADR is
expected. This decision establishes runtime authority, startup ownership and
failure semantics across the web Platform and Desktop Companion. It therefore
cannot be treated as routine implementation.

No Sprint 20 implementation has begun.

## Principal Engineer recommendation

Approve an ADR with these constraints:

- web and Electron use explicit, target-specific composition roots
- both roots compose a shared dependency-injected Platform runtime
- registries are instance-owned composition data, never global service locators
- a versioned immutable manifest identifies every composed capability
- required subsystems fail startup closed
- optional subsystem failure produces an inspectable degraded state
- Next.js server instrumentation owns web startup
- Electron main owns Desktop startup and shutdown
- Platform Companion readiness and Desktop Companion session ownership remain
  separate lifecycles connected through an explicit contract
- a unified renderer-safe health snapshot reports manifest version, lifecycle,
  subsystem state, diagnostics and available capabilities
- startup retry creates a fresh composition attempt without preserving failed
  hidden authority
- existing direct imports remain only behind a measured legacy seam whose
  dependency-boundary baseline cannot grow

## Founder decision requested

Approve, reject or amend the recommended production composition-root
architecture and authorise its ADR. Approval would activate Sprint 20
implementation and certification only. It would not:

- deploy Migration 010, 011 or 012
- reopen Gate C
- enable runtime persistence
- deploy to production
- activate any persisted producer or consumer

Until that decision is recorded, Sprint 19 remains the latest closed Sprint
and production remains on the approved post-Migration-009 baseline.
