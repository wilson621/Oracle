# Project Meta — Oracle

> **Oracle is the operating platform for gaming intelligence.**

Project Meta is a software platform focused on creating intelligent coaching systems that help competitive players improve through behavioural analysis, long-term learning, evidence-based reasoning and adaptive AI guidance.

The flagship product is **Oracle**.

The canonical repository documentation entry point is
[`docs/DOCUMENTATION_INDEX.md`](docs/DOCUMENTATION_INDEX.md). Contributors
should begin there before using planning, architecture or historical documents.

---

# What is Oracle?

Oracle is a gaming-intelligence platform with web intelligence experiences and
an external Windows Companion desktop host.

Unlike traditional stat trackers, Oracle is designed to understand **how** an Operator plays rather than simply recording what happened.

Oracle analyses gameplay behaviour, builds long-term intelligence, reasons from evidence, predicts future performance and continuously evolves its understanding of every Operator.

Oracle is being built as an intelligence platform rather than a statistics dashboard.

---

# Current Status

## Version

**Oracle v0.8.0 baseline with Sprint 16 Trust Boundary complete**

## Current Milestone

**Approved Sprint 17–Beta Engineering Programme; no implementation Sprint active**

**Status: Sprint 17 — Scale-Safe Trust Data Plane plan approved; not activated**

## Build Status

Sprint 16 verification passed for Operator ownership, Understanding,
persistence, trust and authority boundaries alongside Guidance, Companion,
architecture, desktop TypeScript, lint and the Next.js production build.
Migration 009 remains undeployed. The approved Sprint 17–Beta sequence is
recorded in [`docs/ENGINEERING_PROGRAMME.md`](docs/ENGINEERING_PROGRAMME.md),
and its approval does not activate Sprint 17.

The canonical verified status is maintained in
[`docs/architecture/IMPLEMENTATION_STATUS.md`](docs/architecture/IMPLEMENTATION_STATUS.md).

---

# Platform Capabilities

Oracle currently includes:

## Core Runtime

- Oracle Context
- Intelligence Bus
- Universal Engine Registry
- Engine Dependency Resolution
- Oracle Lifecycle
- Oracle Intelligence State

---

## Intelligence Systems

- Oracle Brain
- Intelligence Graph
- Behaviour Evolution
- Adaptive Coaching
- Operator Timeline
- Planner Intelligence
- Decision Intelligence
- Explainability
- Confidence Engine
- Evidence Engine

---

## Operator Systems

- Operator Profile
- Career Progression
- XP System
- Achievement System
- Behaviour Intelligence
- Prediction Engine

---

## Dashboard

The Intelligence Command Centre is built using reusable presentation components.

- OracleDecisionCard
- OracleBrainCard
- OraclePlannerCard
- OracleTimelineCard
- OracleExplainabilityCard
- OracleSignalFeed

Pages compose.

Components present.

Oracle Runtime provides intelligence.

---

# Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Backend

- Supabase

## Artificial Intelligence

- OpenAI

## Deployment

- Vercel

---

# Runtime Architecture

Oracle executes intelligence through a layered runtime.

```text
Operator
      │
Oracle Context
      │
Intelligence Bus
      │
Registered Intelligence Engines
      │
Signals
Profiles
Graph Entries
Decisions
      │
Oracle Brain
      │
Timeline
      │
Planner
      │
Explainability
      │
Decision Intelligence
      │
Oracle Intelligence State
      │
Dashboard Components
```

The UI consumes the Oracle Intelligence State rather than individual intelligence engines.

---

# Project Structure

```text
app/
components/
database/
docs/
lib/
public/
types/
```

Business logic is isolated from presentation.

```
Pages compose.

Components present.

Repositories expose truth.

Engines reason.

Signals communicate.

Decision Intelligence recommends.

Oracle State becomes the UI contract.
```

---

# Engineering Principles

Oracle follows several non-negotiable engineering principles.

- Architecture before speed.
- Pages compose.
- Components present.
- Business logic belongs inside engines.
- Intelligence before presentation.
- Evidence before opinion.
- Confidence is calculated.
- One responsibility per subsystem.
- Green build before every commit.
- Documentation evolves with the platform.

---

# Documentation

Project Meta maintains comprehensive documentation inside `/docs`. The
[Documentation Index](docs/DOCUMENTATION_INDEX.md) defines authority,
classification, reading order, canonical ownership and superseded documents.

| Document | Purpose |
|----------|---------|
| founding/ORACLE_FOUNDING_CHARTER.md | Highest institutional authority |
| founding/THE_ORACLE_WAY.md | Culture, conduct and leadership |
| ORACLE_PLATFORM_CONSTITUTION.md | Highest product and architectural authority |
| founding/ORACLE_ENGINEERING_PRINCIPLES.md | Durable engineering principles |
| founding/ORACLE_STRATEGY.md | Long-term operational strategy |
| ENGINEERING_PROGRAMME.md | Approved Sprint 17–Beta Engineering Programme |
| MASTER_BUILD_PLAN.md | Canonical engineering build plan |
| Architecture.md | Platform architecture |
| Oracle_Codex.md | Engineering standards |
| PROJECT_BOARD.md | Active project board |
| Roadmap.md | Strategic roadmap |
| Decisions.md | Architectural decision log |
| Brand-Bible.md | Brand identity |
| Branding.md | Product hierarchy |
| Ideas.md | Innovation backlog |

---

# Development

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Production build

```bash
npm run build
```

Run production server

```bash
npm run start
```

---

# Current Platform Status

## Operation Genesis

✅ Complete

Platform foundations.

---

## Operation Sentinel

✅ Complete

Persistent intelligence runtime.

---

## Operation Vanguard

✅ Complete

Operator-facing intelligence.

---

## Operation Horizon

Active through the Companion and Desktop Platform work.

Platform consolidation and production architecture.

Verified delivery now includes:

- Oracle Runtime
- Oracle Lifecycle
- Oracle Intelligence State
- Decision Intelligence
- Explainability
- Dashboard Modularisation
- Electron Companion host and secure preload bridge
- deterministic desktop target selection and attachment
- Companion Session and immutable Context ownership
- Desktop Host Snapshot and Event Stream
- Desktop Diagnostics, Recovery, Timeline and Telemetry
- frozen Desktop Platform API version 1 for immutable desktop contracts
- automated dependency-boundary enforcement with documented legacy exceptions
- zero runtime dependency cycles
- immutable Companion Guidance contracts and deterministic Provider Service
- curated Call of Duty Guidance package through shared architecture
- immutable Companion Guidance Application state and `/companion` presentation

Sprint 16 — Trust Boundary is formally closed. The approved Oracle Engineering
Programme defines Sprints 17–31 through Beta. Sprint 17 — Scale-Safe Trust Data
Plane has a founder-approved Engineering Plan but remains inactive and requires
explicit Founder activation.

---

# Vision

Oracle exists to become the world's most trusted AI Gaming Intelligence Companion.

Oracle continuously learns every Operator.

Reasons from evidence.

Explains every recommendation.

Calculates confidence honestly.

Adapts across games.

Improves after every Oracle Session.

The long-term goal is to build the world's most advanced competitive gaming intelligence platform.

---

# License

Private Project

Copyright © Project Meta

All rights reserved.
