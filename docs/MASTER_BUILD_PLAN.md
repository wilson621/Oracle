# ORACLE MASTER BUILD PLAN

**Version:** 2.1
**Status:** Active  
**Owner:** Oracle Platform Engineering  
**Last Updated:** Sprint 12.1 Commit 5 — 20 July 2026

---

# Purpose

The Master Build Plan is Oracle's execution document.

The Constitution defines what Oracle is.

The Codex defines how Oracle is built.

The Architecture defines how Oracle is organised.

The Roadmap defines where Oracle is going.

The Project Board defines current progress.

The Master Build Plan defines what the engineering team is building next.

This document should always reflect the current implementation plan.

---

# Oracle Mission

Oracle is the operating platform for gaming intelligence.

The mission of the engineering team is to strengthen the Platform while continuously improving the Operator experience.

Every completed sprint should permanently improve one or more of the following:

- Platform
- Intelligence
- User Experience
- Reliability
- Extensibility
- Explainability
- Maintainability
- Performance

---

# Engineering Principles

Every implementation should follow these principles.

- Platform before features.
- Architecture before speed.
- Green production build before commit.
- Documentation is implementation.
- One owner for every capability.
- Services provide reusable capability.
- Applications own user experience.
- Game Integrations provide knowledge.
- Extensions expand Oracle.
- Avoid duplicate architecture.
- Prefer capability resolution over direct coupling.
- Every recommendation must be explainable.
- Every confidence value must be evidence based.

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

# Current Execution Status

## Sprint 12.1 — Desktop Platform Foundation and Hardening

**Branch:** `sprint-9-overlay`
**Status:** Active; implementation milestones delivered, closure pending

Verified completed work:

- Companion Session Manager
- Companion Context Ownership
- Desktop Host Snapshot
- Snapshot Coordinator
- Desktop Host Event Stream
- Desktop Diagnostics
- Desktop Recovery
- Desktop Timeline
- Desktop Telemetry
- Complete Session Lifecycle
- Desktop Platform API Freeze
- Dependency Boundary Audit and automated enforcement

Remaining work, in order:

1. full compile, lint, production build and runtime verification
2. correction of issues found by verification
3. formal Sprint 12.1 closure and release decision

Documentation synchronisation records current implementation but does not
complete those engineering gates. Sprint 13 must not begin.

Known integration boundaries requiring deliberate review:

- Platform bootstrap is not wired into production startup.
- web pages do not consistently consume Services through Applications.
- desktop Companion Session Context does not yet consume Game Integrations.
- the Platform-level and desktop-level Companion runtimes are not integrated.
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

Every sprint follows the same lifecycle.

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
Git Push
        │
        ▼
Release Tag
        │
        ▼
Next Sprint
```

No stage should be skipped.

---

# Definition of Done

A sprint is only considered complete when:

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
- Changes pushed.
- Release tag created.
- Repository clean.

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

✅ Release tag created

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

Delivery evolved into Sprint 12.1 desktop-platform hardening on
`sprint-9-overlay`; the projected Sprint 12 Marketplace milestone was not the
work represented by the current repository history. Future sprints may evolve,
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

> **Oracle understands games.**

> **Oracle understands players.**

> **Oracle delivers intelligence.**

---

**The Oracle has spoken.**
