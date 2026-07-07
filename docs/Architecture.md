# PROJECT META

# Architecture

Version 2.0

Last Updated: 7 July 2026

---

# Purpose

This document defines the technical architecture for Project Meta and Oracle.

Project Meta is the overall software platform.

Oracle is the flagship AI intelligence system built inside Project Meta.

Oracle is designed as a modular, reusable AI coaching platform capable of analysing player behaviour, identifying trends, predicting future performance and continuously evolving as more data becomes available.

The architecture is intentionally layered to ensure scalability, maintainability and future expansion.

---

# Core Principle

Everything revolves around one object.

## Oracle Session

An Oracle Session is the atomic unit of intelligence.

Every feature either:

- Creates an Oracle Session
- Reads Oracle Sessions
- Analyses Oracle Sessions
- Learns from Oracle Sessions
- Improves future Oracle Sessions

Examples include:

- Text analysis
- Gameplay coaching
- Behaviour analysis
- Performance reviews
- Video analysis (future)
- Loadout recommendations
- Route planning
- Squad analysis
- Weekly reports

Oracle Sessions become the long-term memory of the platform.

---

# High-Level Architecture

```text
Operator

↓

Oracle Session

↓

Supabase

↓

Repositories

↓

Behaviour Engine
Trend Engine
Prediction Engine

↓

Oracle Intelligence Layer

↓

OracleBrain

↓

Interface Layer
```

---

# System Layers

## 1. Interface Layer

Location

```text
app/
components/
```

Responsibilities

- Display intelligence
- Accept user input
- Render Oracle dashboards
- Present recommendations
- Never contain business logic

---

## 2. Repository Layer

Location

```text
lib/oracle/repositories/
```

Responsibilities

- Read Oracle Sessions
- Save Oracle Sessions
- Query Supabase
- Convert database rows into reusable models

Repositories are the only layer that communicates directly with the database.

---

## 3. Intelligence Engines

Location

```text
lib/oracle/
```

Current Engines

- Behaviour Engine
- Trend Engine
- Prediction Engine

Responsibilities

- Analyse Oracle Sessions
- Produce reusable intelligence
- Remain independent from UI
- Be reusable by every Oracle feature

Engines never communicate directly with React components.

---

## 4. Oracle Intelligence Layer

Responsibilities

Combine multiple intelligence engines into a unified intelligence model.

Responsibilities include:

- Behaviour analysis
- Trend analysis
- Prediction analysis
- Future intelligence expansion

This layer prevents the UI from depending on multiple engines.

---

## 5. OracleBrain

OracleBrain is the orchestration layer.

Responsibilities

- Combine intelligence
- Generate summaries
- Produce recommendations
- Calculate confidence
- Decide what Oracle communicates

OracleBrain is the single intelligence entry point used by the interface.

---

## 6. Database Layer

Technology

Supabase

Responsibilities

- Store Operators
- Store Oracle Sessions
- Store XP
- Store Achievements
- Store Career Progress
- Store future AI memory

The database stores truth.

It does not contain intelligence.

---

# Current Intelligence Pipeline

```text
Oracle Session

↓

Session Repository

↓

Behaviour Engine

Trend Engine

Prediction Engine

↓

Oracle Intelligence Layer

↓

OracleBrain

↓

Dashboard UI
```

---

# Design System

Reusable components should always be preferred over duplicated UI.

Current Design System

- Card
- MetricCard
- AnimatedNumber
- ConfidenceRing
- StatusBadge

Future reusable components should extend this system rather than creating duplicate implementations.

---

# Coding Principles

- UI displays intelligence.
- Engines produce intelligence.
- Repositories communicate with Supabase.
- OracleBrain orchestrates intelligence.
- Components remain reusable.
- Business logic never belongs inside UI.
- Avoid duplicated logic.
- Build foundations before features.

---

# Future Architecture

The architecture is designed to support future systems without major rewrites.

Planned additions include:

- Memory Engine
- Oracle Voice
- Timeline Replay
- Weekly Reports
- Video Analysis
- Computer Vision
- Multi-game Intelligence
- Mobile Applications

These systems should integrate through OracleBrain rather than communicating directly with UI components.

---

# Architectural Goals

Every architectural decision should support:

- Scalability
- Maintainability
- Reusability
- Testability
- Premium user experience
- AI-first design

Architecture should evolve without breaking existing systems.

Every new engine should strengthen Oracle rather than increase technical debt.