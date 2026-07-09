# ORACLE MASTER BUILD PLAN

Version: 1.0  
Status: Active  
Owner: Oracle Platform Engineering

---

## Purpose

This document is the canonical engineering build plan for Oracle.

Oracle is not a side project.  
Oracle is being built as a scalable AI Gaming Intelligence Companion business.

Every architectural decision must be measured against this question:

> Would we still be happy with this architecture if Oracle had 1 million users and 100 engineers working on it?

If the answer is no, redesign it.

---

## Product Identity

Oracle is an AI Gaming Intelligence Companion.

Oracle learns the Operator before it learns the game.

Warzone is the proving ground, not the destination.

The Oracle core must remain game-agnostic.

Game-specific intelligence belongs in plugins and specialist engines.

---

## Core Engineering Principles

- Architecture before speed.
- Full files only.
- Green build before commit.
- Commit after every successful milestone.
- One responsibility per subsystem.
- Business logic belongs inside engines.
- Pages compose.
- Components present.
- Repositories expose truth.
- Signals communicate observations.
- Profiles represent learned knowledge.
- The Intelligence Graph stores structured knowledge.
- Oracle Brain synthesises intelligence.
- Planner decides the next best action.
- Explainability builds trust.
- Lifecycle defines execution order.
- Intelligence State represents Oracle's current understanding.
- No subsystem should duplicate another subsystem's responsibility.
- No feature should weaken the platform architecture.

---

# Current Platform Status

## Completed Core Foundations

- Oracle Manifesto
- Oracle Codex
- Oracle Architecture
- Oracle Roadmap
- Oracle Principles
- Architectural Decision Records
- Project Board
- Design System
- Brand Bible
- Innovation Lab

---

# Operation Genesis

Status: Complete

Purpose:

Establish the original Oracle platform foundations.

Completed:

- Initial Oracle UI
- Mission Control aesthetic
- Oracle Brain foundation
- Operator views
- Session analysis
- Supabase foundation
- Production deployment
- GitHub workflow
- Vercel deployment

---

# Operation Sentinel

Status: Complete

Purpose:

Build Oracle's intelligence runtime foundations.

Completed:

## Sprint 1 — Oracle Context

Status: Complete

Delivered:

- Oracle Context
- Context Builder
- Shared intelligence object
- Pipeline context input

## Sprint 2 — Intelligence Bus

Status: Complete

Delivered:

- Intelligence Bus
- Engine Registry
- Universal Engine Interface
- Core engine registration

## Sprint 2.5 — Engine Framework

Status: Complete

Delivered:

- Engine metadata
- Engine capabilities
- Engine priority
- Engine dependency support
- Game compatibility support

## Sprint 2.6 — Signal-First Runtime

Status: Complete

Delivered:

- Signal-producing engine contract
- Signal aggregation
- Decision aggregation
- Signal-first pipeline

## Sprint 2.7 — Oracle Brain Subsystem

Status: Complete

Delivered:

- Oracle Brain subsystem folder
- Compatibility wrappers
- Brain exports
- Type-safe UI fixes

## Sprint 3 — Oracle Memory Foundation

Status: Complete

Delivered:

- Memory Engine
- Memory Profile
- Memory confidence
- Memory signals

## Sprint 3.1 — Behaviour Evolution

Status: Complete

Delivered:

- Behaviour Evolution Engine
- Improvement detection
- Decline detection
- Evolution signals

## Sprint 3.2 — Memory Modularisation

Status: Complete

Delivered:

- Memory confidence module
- Memory status module
- Memory strengths module
- Memory weaknesses module
- Memory patterns module
- Memory signals module
- Memory utilities

## Sprint 3.3 — Architecture Index

Status: Complete

Delivered:

- Architecture Index
- Subsystem boundaries
- Runtime flow map

## Sprint 3.4 — Adaptive Coaching

Status: Complete

Delivered:

- Adaptive Coaching subsystem
- Coaching profile
- Coaching signals
- Coaching runtime engine

## Sprint 3.4C — Oracle Intelligence Graph

Status: Complete

Delivered:

- Intelligence Graph
- Graph entries
- Graph-aware engine results
- Generic graph aggregation

## Sprint 3.5 — Oracle Brain v2

Status: Complete

Delivered:

- Brain graph reasoning
- Brain graph report
- Findings-based reasoning

## Sprint 3.6 — Operator Timeline

Status: Complete

Delivered:

- Timeline events
- Timeline builder
- Timeline summary
- Signal-to-timeline conversion

## Sprint 3.7 — Mission Intelligence Foundation

Status: Complete

Delivered:

- Mission source
- Mission confidence
- Mission UI source display
- Mission subsystem refactor

---

# Operation Vanguard

Status: In Progress

Purpose:

Turn Oracle intelligence into operator-facing guidance.

## Phase 1 — Mission Planner

Status: Complete

Delivered:

- Planner subsystem
- Planner priority
- Planner summary
- Planner profile
- Planner signals

## Phase 1B — Planner Mission Integration

Status: Complete

Delivered:

- Planner connected to mission reports
- Mission reports use Planner priority

## Phase 1C — Planner Runtime Integration

Status: Complete

Delivered:

- Planner registered as runtime engine
- Planner added to Intelligence Graph

## Phase 2 — Planner Intelligence

Status: Complete

Delivered:

- Planner Intelligence input
- Brain-aware planning
- Timeline-aware evidence
- Signal-aware evidence
- Evidence scoring
- Runtime Planner Intelligence

## Phase 3 — Explainability

Status: Complete

Delivered:

- Explainability subsystem
- Explanation evidence
- Explanation strength
- Planner explanation builder

## Phase 4 — Operator Profile

Status: Complete

Delivered:

- Operator Profile subsystem
- Combat identity
- Learning style
- Mechanical confidence
- Tactical confidence
- Adaptability
- Consistency
- Pressure rating
- Operator Profile graph entry

---

# Operation Horizon

Status: Active

Purpose:

Consolidate Oracle into a production-ready Intelligence Platform through runtime stabilisation, state-first architecture and reusable presentation systems.

---

## Phase 1 — Oracle Intelligence State

Status: Complete

Delivered:

- OracleIntelligenceState
- State builder
- Pipeline state output
- State-first UI contract

---

## Phase 2 — Oracle Lifecycle

Status: Complete

Delivered:

- Oracle lifecycle types
- Default lifecycle
- Lifecycle engine
- Lifecycle embedded into Intelligence State

---

## Phase 3 — Decision Intelligence

Status: Complete

Delivered:

- Oracle Decision subsystem
- Decision Profile
- Primary Decision selection
- Confidence calculation
- Evidence integration
- Expected outcome modelling
- Reassessment triggers

Decision Intelligence now provides Oracle's single authoritative recommendation for the Operator.

---

## Phase 4 — Explainability

Status: Complete

Delivered:

- Explainability subsystem
- Explanation builder
- Evidence aggregation
- Confidence reasoning
- Planner explanation integration

Oracle now explains every recommendation using evidence collected throughout the runtime.

---

## Phase 5 — Dashboard Modularisation

Status: Complete

Delivered:

- OracleDecisionCard
- OracleBrainCard
- OraclePlannerCard
- OracleTimelineCard
- OracleExplainabilityCard
- OracleSignalFeed

Architecture Improvements:

- Pages compose presentation components.
- Components present intelligence.
- Business logic removed from UI.
- OracleIntelligenceState becomes the UI contract.

---

## Phase 6 — Sprint 4 Production Closure

Status: Complete

Delivered:

- Production runtime audit
- Architecture review
- Dashboard review
- Documentation refresh
- Sprint Closure Report
- Build verification
- Repository ready for Sprint 5

---

## Operation Horizon Outcome

Oracle now provides a complete production intelligence runtime built around:

- Oracle Context
- Intelligence Bus
- Registered Engines
- Intelligence Graph
- Oracle Brain
- Planner
- Timeline
- Explainability
- Decision Intelligence
- Oracle Intelligence State

The Intelligence Dashboard is fully modular and consumes OracleIntelligenceState through reusable presentation components.

Operation Horizon established the production architecture that future Operations will extend rather than redesign.

---

# Planned Operations

## Operation Horizon — Remaining Work

Planned:

- Engine v2 standardisation
- State-first pipeline refinement
- Graph profile access helpers
- Explainability integration refinement
- Lifecycle-aware diagnostics
- Runtime health checks

---

## Operation Atlas

Status: Planned

Purpose:

Introduce game-specific intelligence plugins while protecting the game-agnostic Oracle core.

Planned:

- Game Plugin Interface
- Game Registry
- Warzone Engine
- Apex Engine
- Battlefield Engine
- GTA VI Engine
- Game Context expansion
- Public knowledge ingestion
- Rule-compliant contextual intelligence

Non-negotiable:

Oracle must never depend on:

- Reading protected game memory
- Injecting into game processes
- Modifying games
- Automating gameplay
- Revealing hidden enemy information
- Providing unfair competitive advantage

Oracle must remain:

- Public-information based
- Rule-compliant
- Companion-first
- Discovery-focused

---

## Operation Command

Status: Planned

Purpose:

Build Oracle's signature command centre experience.

Planned:

- Oracle Command Centre homepage
- Operator status panel
- Mission briefing panel
- Brain findings panel
- Timeline highlights panel
- Planner recommendation panel
- Explainability drawer
- Intelligence confidence display

Goal:

Oracle should feel like a living command centre, not a generic dashboard.

---

## Operation Companion

Status: Planned

Purpose:

Evolve Oracle from an intelligence system into an interactive AI Gaming Companion.

Planned:

- Companion conversation layer
- Personality memory
- Operator-specific coaching tone
- Long-term learning model
- Companion briefing
- Companion debriefing
- Cross-session recall
- Cross-game operator profile

---

## Operation Dominion

Status: Planned

Purpose:

Build the business-scale platform layer.

Planned:

- Subscription architecture
- Premium feature gates
- Team accounts
- Organisations
- Admin console
- Usage analytics
- Billing-ready architecture
- Support workflows
- Security hardening
- Data retention model
- Privacy controls

---

# Current Runtime Flow

```text
Initialise
    ↓
Collect Context
    ↓
Execute Engines
    ↓
Build Intelligence Graph
    ↓
Oracle Brain
    ↓
Operator Timeline
    ↓
Planner Intelligence
    ↓
Explainability
    ↓
Oracle Intelligence State
    ↓
Mission Intelligence
    ↓
Operator Experience