# ORACLE ARCHITECTURE

Technical Architecture

Version 3.0

Last Updated: 8 July 2026

---

# Purpose

This document defines the technical architecture of Oracle.

Its purpose is to describe how Oracle is structured, how intelligence flows through the platform and how future systems should integrate.

Unlike the Manifesto or the Codex, this document focuses exclusively on architecture.

It should answer one question.

**How does Oracle work?**

---

# Architectural Vision

Oracle is designed as a modular intelligence platform.

Every subsystem performs one responsibility.

Every subsystem produces reusable outputs.

Every subsystem should be capable of evolving independently without requiring architectural redesign.

Oracle should become easier to extend over time.

Never harder.

---

# Core Architectural Principles

Oracle follows seven architectural principles.

## 1. Separation of Responsibility

Every subsystem owns one responsibility.

Pages compose.

Components present.

Repositories provide data.

Engines reason.

Signals communicate.

Oracle Brain analyses.

Decision Intelligence recommends.

Pipeline orchestrates.

---

## 2. Intelligence First

Oracle always produces intelligence before presentation.

Presentation never creates intelligence.

Presentation consumes intelligence.

The UI should know as little as possible about how intelligence is generated.

---

## 3. Evidence Driven

Every recommendation originates from evidence.

Evidence originates from Oracle Sessions.

No recommendation should exist without supporting intelligence.

---

## 4. Game Agnostic

Oracle is never built around one game.

Games provide data.

Oracle provides intelligence.

Adding a new game should require a new module.

It should never require redesigning Oracle.

---

## 5. Modular Expansion

Future systems should plug into existing architecture.

They should never replace it.

---

## 6. Reusable Systems

Reusable architecture always takes priority over isolated implementations.

Every engine should be reusable.

Every component should be reusable.

Every repository should be reusable.

---

## 7. Single Source of Truth

Truth exists only once.

Repositories expose truth.

Engines generate intelligence.

Presentation displays intelligence.

---

# Oracle Layer Model

Oracle consists of multiple architectural layers.

Each layer depends only on the layer immediately beneath it.

Presentation Layer

↓

Pipeline Layer

↓

Decision Layer

↓

Oracle Brain

↓

Signal Layer

↓

Engine Layer

↓

Repository Layer

↓

Database Layer

Each layer performs one responsibility.

---

# High-Level Architecture

```text
                     Operator

                        │

                        ▼

                 Oracle Session

                        │

                        ▼

                   Supabase

                        │

                        ▼

                 Repository Layer

                        │

                        ▼

              Operator Intelligence

                        │

                        ▼

                Intelligence Engines

                        │

                        ▼

                     Signals

                        │

                        ▼

                  Oracle Brain

                        │

                        ▼

             Decision Intelligence

                        │

                        ▼

             Intelligence Pipeline

                        │

                        ▼

                Presentation Layer
```

---

# Layer Responsibilities

## Presentation Layer

Location

```text
app/
components/
```

Responsibilities

Render intelligence

Display dashboards

Present recommendations

Handle navigation

Collect user interaction

Presentation should never:

Generate recommendations

Calculate intelligence

Contain business logic

Query Supabase directly

---

## Pipeline Layer

Location

```text
lib/oracle/pipeline/
```

Responsibilities

Coordinate intelligence execution.

Aggregate Decisions.

Aggregate Signals.

Prepare data for presentation.

The Pipeline orchestrates.

It does not reason.

---

## Decision Layer

Location

```text
lib/oracle/intelligence/
```

Responsibilities

Transform intelligence into recommendations.

Every Oracle recommendation should eventually pass through this layer.

Decision Intelligence produces:

Recommendation

Evidence

Confidence

Expected Outcome

Reassessment Trigger

---

## Oracle Brain

Location

```text
lib/oracle/brain/
```

Oracle Brain is the platform's intelligence analyst.

Oracle Brain does not calculate statistics.

Oracle Brain combines intelligence produced elsewhere.

Responsibilities

Consume Signals

Identify behavioural patterns

Resolve conflicting observations

Generate operational assessments

Prioritise intelligence

Produce strategic understanding

Oracle Brain becomes more valuable as additional engines are introduced.

---

## Signal Layer

Location

```text
lib/oracle/signals/
```

Signals represent observations.

Signals are intentionally small.

Examples:

Positioning improving

Movement declining

Weapon confidence increasing

Decision quality stabilising

Signals never contain recommendations.

Signals communicate observations only.

---

## Engine Layer

Location

```text
lib/oracle/
```

Current engines include:

Behaviour Engine

Trend Engine

Prediction Engine

Operator Intelligence

Decision Intelligence

Weapon Intelligence

Coach Engine

Future engines include:

Memory

Strategy

Map

Economy

Team

Tournament

Voice

Visual Intelligence

Every engine should:

Accept structured inputs

Produce structured outputs

Remain reusable

Remain game agnostic

Never render UI

Never query React

---

## Repository Layer

Location

```text
lib/oracle/repositories/
```

Responsibilities

Read Oracle Sessions

Write Oracle Sessions

Read Operators

Persist platform data

Repositories expose truth.

Repositories never generate intelligence.

Repositories never produce recommendations.

---

## Database Layer

Technology

Supabase

Responsibilities

Persist Operators

Persist Oracle Sessions

Persist progression

Persist achievements

Persist future memory

Persist future telemetry

The database stores truth.

It never stores intelligence.

# Intelligence Flow

Every Oracle Session follows the same intelligence lifecycle.

```text
Operator

↓

Oracle Session

↓

Repository Layer

↓

Operator Intelligence

↓

Intelligence Engines

↓

Signals

↓

Oracle Brain

↓

Decision Intelligence

↓

Intelligence Pipeline

↓

Presentation
```

Every recommendation produced by Oracle should follow this lifecycle.

No shortcuts.

No bypasses.

---

# Oracle Sessions

Oracle Sessions are the atomic unit of intelligence.

Everything Oracle learns originates from one or more Oracle Sessions.

Oracle Sessions may be created from:

Text Analysis

Gameplay Review

Video Analysis

Voice Analysis (future)

Computer Vision (future)

Live Match Analysis (future)

Every subsystem ultimately exists to improve future Oracle Sessions.

---

# Operator Intelligence

Operator Intelligence transforms raw session data into an Operator Profile.

It represents the Operator rather than the game.

Current responsibilities include:

Learning Style

Behavioural DNA

Behaviour Profile

Decision Profile

Weapon Profile

Confidence Level

Strengths

Improvement Priorities

Future responsibilities include:

Risk Profile

Leadership

Learning Velocity

Fatigue Detection

Behaviour Evolution

Preferred Playstyle

Historical Behaviour

Operator Intelligence is expected to become one of Oracle's most valuable systems.

---

# Signal Architecture

Signals are Oracle's universal intelligence language.

Every engine should communicate through Signals.

Signals represent observations.

Not recommendations.

Examples include:

Positioning improving

Movement declining

Weapon confidence increasing

Behaviour stabilising

Meta changing

Confidence increasing

Signals should be:

Small

Independent

Timestamped

Evidence based

Reusable

Signals intentionally avoid presentation concerns.

---

# Oracle Brain

Oracle Brain consumes Signals.

Oracle Brain does not produce raw observations.

Instead it:

Combines Signals

Identifies relationships

Resolves conflicts

Prioritises intelligence

Builds understanding

Oracle Brain should eventually reason across every intelligence system simultaneously.

---

# Decision Intelligence

Decision Intelligence converts intelligence into actionable recommendations.

Every recommendation should include:

Recommendation

Reasoning

Evidence

Confidence

Expected Outcome

Reassessment Trigger

Decision Intelligence becomes Oracle's universal recommendation framework.

Future systems should not generate recommendations independently.

---

# Intelligence Pipeline

The Pipeline coordinates Oracle.

Responsibilities include:

Execute intelligence flow

Aggregate Signals

Aggregate Decisions

Prepare presentation models

Generate pipeline summaries

The Pipeline orchestrates.

It never performs reasoning itself.

---

# Oracle Context (Planned)

Oracle Context will become the shared intelligence model used by every engine.

Every engine should receive the same structured context.

Future Oracle Context includes:

Operator

Operator Profile

Oracle Sessions

Historical Sessions

Signals

Memory

Current Game

Patch Version

Weapon Database

Game Module

Historical Decisions

Future Predictions

No engine should load this data independently.

Consistency across engines is maintained through Oracle Context.

---

# Intelligence Bus (Planned)

The Intelligence Bus becomes Oracle's orchestration backbone.

Instead of manually invoking engines, Oracle will register them.

```text
Oracle Session Saved

↓

Intelligence Bus

↓

Registered Engines

↓

Signals

↓

Oracle Brain

↓

Decision Intelligence

↓

Pipeline

↓

Presentation
```

Benefits include:

Automatic engine discovery

Modular expansion

Reduced coupling

Simplified orchestration

Future scalability

New intelligence engines should register themselves rather than requiring architectural modification.

---

# Oracle Engine Contract

Every intelligence engine should eventually implement a common interface.

Conceptually every engine should:

Accept Oracle Context

Perform one responsibility

Generate structured output

Remain deterministic

Remain reusable

Remain game agnostic

Produce Signals when appropriate

This allows Oracle to expand without changing its core architecture.

---

# Game Module Architecture

Oracle itself never contains game-specific business logic.

Game-specific intelligence belongs inside dedicated modules.

Future structure:

```text
games/

call-of-duty/

battlefield/

rainbow-six/

apex/

delta-force/

gta/

shared/
```

Each module may expose:

Weapon Database

Maps

Telemetry

Metadata

Patch Information

Movement Characteristics

Game Rules

Oracle consumes standardised intelligence regardless of the originating game.

---

# Extension Points

Oracle is intentionally designed for expansion.

Future systems should integrate through existing architecture rather than bypassing it.

Current extension points include:

Repositories

Operator Intelligence

Signal Engines

Decision Intelligence

Pipeline

Future extension points include:

Oracle Context

Intelligence Bus

Memory Engine

Voice Engine

Visual Intelligence

Strategy Engine

No future system should require redesigning the platform.

---

# Performance Principles

Architecture should optimise for:

Reusable computation

Minimal duplication

Predictable execution

Incremental intelligence

Scalable expansion

As Oracle grows, intelligence quality should increase without significantly increasing architectural complexity.

---

# Security Principles

Repositories remain the only layer communicating directly with persistent storage.

Presentation never communicates directly with Supabase.

Secrets remain server-side.

Business logic remains outside UI.

Future integrations should follow the same security model.

---

# Scalability

Oracle is expected to support:

Millions of Oracle Sessions

Thousands of Operators

Multiple Games

Historical Intelligence

Long-Term Memory

Large AI Context Windows

Distributed Intelligence Engines

Architecture should evolve through additional modules rather than architectural replacement.

---

# Architectural Goals

Every architectural decision should improve one or more of the following:

Scalability

Maintainability

Reusability

Readability

Predictability

Testability

Operator Understanding

Decision Quality

Platform Intelligence

Architecture should become stronger after every Operation.

Never weaker.

---

# Architecture Review Checklist

Before introducing any new subsystem ask:

Does it belong in an existing layer?

Can an existing engine be reused?

Should it produce Signals?

Should it consume Oracle Context?

Does it increase coupling?

Does it duplicate intelligence?

Does it strengthen Oracle Brain?

Does it improve the Operator?

If the answer to any question is uncertain, revisit the design before implementation.

---

# Closing Statement

Oracle is designed as an intelligence platform rather than a traditional application.

Its architecture prioritises reusable intelligence over isolated features.

Every layer exists to support long-term evolution.

Every subsystem contributes to a single intelligence pipeline.

As Oracle expands, the architecture should remain stable while capabilities continue to grow.

Future Operations should extend Oracle through modular systems rather than architectural redesign.

The architecture is a living blueprint.

Protect it.

Strengthen it.

Build upon it.

Never compromise it.