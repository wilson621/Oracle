# ORACLE CODEX

## Oracle Engineering Standards

**Authority:** Operational engineering standard beneath the Constitution, Engineering Principles and accepted ADRs
**Scope:** Engineering practices, repository standards, workflows, quality gates and reviews
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Continuously reviewed as engineering practice evolves
**Supersedes:** Archived Oracle Codex versions
**Superseded By:** None
**Last Reviewed:** 21 July 2026
**Version:** 3.2

---

# Purpose

The Oracle Codex defines how Oracle is engineered.

The Founding Charter defines **why Oracle exists**.

The Oracle Way defines **how Oracle stewards behave**.

The Constitution defines **binding product and architectural boundaries**.

The Engineering Principles define **durable engineering values**.

The Codex defines **the operational standards used to build Oracle**.

Every implementation decision, architectural proposal, pull request and sprint should follow the standards contained within this document.

The Codex exists to ensure Oracle remains:

- Consistent
- Scalable
- Extensible
- Explainable
- Maintainable
- Safe
- Premium

The Codex evolves as Oracle evolves.

---

# Relationship to the Constitution

The Oracle Platform Constitution is the highest product and architectural
authority. Neither this Codex, Oracle Strategy nor Engineering Principles may
override it.

When conflicts occur:

```text
Oracle Founding Charter
        │
        ▼
The Oracle Way
        │
        ▼
Oracle Platform Constitution
        │
        ├──────────────┐
        ▼              ▼
Oracle Engineering   Oracle Strategy
Principles
        │              │
        └──────┬───────┘
               ▼
Accepted ADRs and Oracle Codex
               ▼
Architecture
               ▼
Roadmap
               ▼
Master Build Plan
               ▼
Project Board
               ▼
Sprint Execution
               ▼
Implementation
```

Implementation must never contradict higher-level documentation.

The External Companion Principle remains binding unless the Constitution itself
is amended. No Codex workflow or engineering exception may authorise prohibited
game-process interaction.

See `docs/DOCUMENTATION_INDEX.md` for canonical ownership, classifications and
the complete reading order.

---

# Governance Context

The Codex does not maintain a separate statement of Oracle's identity, vision,
culture, strategy or durable engineering philosophy.

- `docs/founding/ORACLE_FOUNDING_CHARTER.md` owns purpose, mission and vision.
- `docs/founding/THE_ORACLE_WAY.md` owns culture and behaviour.
- `docs/ORACLE_PLATFORM_CONSTITUTION.md` owns binding product and architectural
  principles.
- `docs/founding/ORACLE_STRATEGY.md` owns long-term strategic doctrine.
- `docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md` owns durable engineering
  values.

This Codex translates those authorities into operational standards.

---

# Engineering Principles

The canonical durable principles are defined in
`docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md`.

This Codex does not restate them. The standards and checklists below describe
their operational application. When a detailed Codex rule appears to conflict
with a canonical Engineering Principle, the higher-authority principle governs
until the Codex is reconciled. Neither source may override the Constitution.

---

# Oracle Platform Model

Oracle is organised into four architectural layers.

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

---

## Oracle Platform

Owns:

- Platform Bootstrap
- Platform Lifecycle
- Companion Runtime
- Extension Runtime
- Capability Graph
- Service Registry
- Application Registry
- Shared Contracts
- Diagnostics

The Platform coordinates Oracle.

---

## Oracle Services

Provide reusable business capability.

Examples include:

- Sessions
- Memory
- Progression
- Reports
- Intelligence
- Missions

Services are presentation-independent.

---

## Oracle Applications

Applications deliver Oracle experiences.

Examples:

- AI Coach
- Oracle Brain
- Loadouts
- Reports
- Companion
- Career

Applications orchestrate Services.

Applications never own intelligence.

---

## Game Integrations

Game Integrations provide:

- Game knowledge
- Rules
- Maps
- Weapons
- Quests
- Collectibles
- Objectives
- Compatibility
- Context

Game Integrations never own Oracle Applications.

---

# Internal Platform Runtime

The runtime exists beneath the Platform.

Its purpose is to execute Oracle Intelligence consistently.

Current runtime systems include:

- Oracle Context
- Intelligence Bus
- Engine Runtime
- Engine Registry
- Decision Intelligence
- Oracle Brain Runtime
- Explainability
- Evidence Engine

These systems are implementation details of the Platform rather than the Platform itself.

---

# Guiding Statement

Oracle understands games.

Oracle understands players.

Oracle delivers intelligence.

---

> **The Oracle has spoken.**

# Platform Architecture

Oracle is engineered around explicit ownership.

Every system has a single responsibility.

Every capability has a single authoritative owner.

Oracle is organised into four architectural layers.

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

Each layer exists for a different reason.

No layer should duplicate another.

---

# Oracle Platform

The Platform owns shared infrastructure.

Responsibilities include:

- Platform Bootstrap
- Platform Lifecycle
- Runtime Coordination
- Companion Runtime
- Extension Runtime
- Capability Graph
- Capability Resolution
- Service Registry
- Application Registry
- Shared Contracts
- Diagnostics
- Health Monitoring

The Platform never contains game-specific logic.

The Platform should change slowly.

Platform changes affect every Oracle Application.

---

# Oracle Services

Services provide reusable capability.

Services represent Oracle's business logic.

Examples:

- Sessions
- Operator
- Memory
- Progression
- Reports
- Intelligence
- Missions
- Planner

Services should:

- remain presentation independent
- expose typed contracts
- remain reusable
- avoid UI dependencies

Services must never depend on Applications.

---

# Oracle Applications

Applications own user experience.

Examples:

- AI Coach
- Oracle Brain
- Companion
- Loadouts
- Reports
- Career
- Operator

Applications:

- orchestrate Services
- present intelligence
- coordinate workflows

Applications must never duplicate Service logic.

---

# Game Integrations

Games integrate into Oracle.

Oracle does not become part of games.

A Game Integration may provide:

- maps
- weapons
- quests
- collectibles
- game rules
- APIs
- OCR regions
- observation rules
- telemetry
- compatibility

Game Integrations never own Oracle Applications.

---

# Capability Architecture

Oracle resolves capability rather than implementation.

Applications request capabilities.

The Platform determines which implementation provides those capabilities.

Example:

```text
AI Coach

↓

Requests

ai.coaching

↓

Capability Graph

↓

Call of Duty Integration

or

Battlefield Integration

or

RuneScape Integration
```

Applications never hard-code providers.

---

# Capability Ownership

Every capability has one owner.

Examples:

Behaviour Intelligence

Owner

Behaviour Engine

---

Prediction

Owner

Prediction Engine

---

Mission Generation

Owner

Mission Engine

---

Capability Resolution

Owner

Capability Graph

---

Extension Activation

Owner

Extension Runtime

---

Application Discovery

Owner

Application Registry

---

Game Knowledge

Owner

Game Integrations

Ownership should always be obvious.

---

# Runtime Architecture

Oracle executes through a shared runtime.

Current runtime:

```text
Platform Bootstrap

↓

Oracle Context

↓

Runtime Scheduler

↓

Engine Runtime

↓

Intelligence Bus

↓

Oracle Brain

↓

Decision Intelligence

↓

Presentation
```

Runtime systems execute intelligence.

Applications consume intelligence.

---

# Oracle Context

Oracle Context represents the current understanding of the Operator.

Context is constructed.

Context is consumed.

Context should never be unpredictably mutated.

New systems derive intelligence.

They do not overwrite upstream truth.

---

# Service Contracts

Services communicate through explicit contracts.

Avoid:

- hidden dependencies
- mutable global state
- circular references

Prefer:

- typed interfaces
- immutable contracts
- dependency injection
- explicit ownership

---

# Extension Platform

Oracle grows through extensions.

Supported extension types include:

- Game Integrations
- Knowledge Packs
- Vision Packs
- AI Modules
- Overlay Widgets
- Companion Plugins
- Themes
- Language Packs

Extensions declare:

- identity
- version
- permissions
- capabilities
- dependencies
- conflicts
- compatibility
- trust level

Extensions never grant themselves permission.

---

# Companion Platform

Oracle Companion is a Platform subsystem.

Responsibilities:

- overlay lifecycle
- attachment lifecycle
- diagnostics
- positioning
- observation
- presentation
- interaction

Companion does not own intelligence.

Companion presents intelligence.

---

# Marketplace Philosophy

The Marketplace exists to expand Oracle without expanding Platform complexity.

Future developers should build:

- integrations
- extensions
- knowledge packs
- widgets

rather than modifying Platform internals.

---

# Dependency Rules

Allowed:

Platform

↓

Services

↓

Applications

↓

Game Integrations

Forbidden:

Applications

↓

Platform internals

---

Services

↓

Applications

---

Game Integrations

↓

Applications

---

Circular dependencies

---

Hidden ownership

---

# Architecture Review Checklist

Before introducing new architecture ask:

- Does this strengthen the Platform?
- Can this be reused?
- Does ownership remain explicit?
- Is another Service already responsible?
- Can this become an Extension?
- Does this violate the Constitution?
- Does this duplicate intelligence?
- Is the dependency direction correct?

If the answer raises doubt, redesign first.

---

> Good architecture removes future work.

Not because less is built.

Because the right thing is built once.

# Repository Structure

The Oracle repository should remain organised by responsibility rather than technology.

Top-level structure:

```text
app/
components/
lib/
docs/
public/
styles/
types/
```

Within `lib`, responsibilities should be clearly separated.

```text
lib/

oracle/
    platform/
    services/
    applications/
    intelligence/
    graph/
    engines/
    runtime/

companion/
    runtime/
    overlay/
    observation/
    extensions/
    connectors/

games/
    call-of-duty/
    battlefield/
    runescape/
    minecraft/
    ...

shared/
```

Avoid deeply nested feature folders unless they provide clear architectural value.

---

# Folder Ownership

Every folder has one owner.

Examples:

```
platform/
```

Owns platform infrastructure.

---

```
services/
```

Owns reusable business capability.

---

```
applications/
```

Owns Oracle user experiences.

---

```
engines/
```

Owns specialised intelligence.

---

```
games/
```

Owns game-specific implementations.

---

No folder should become a "miscellaneous" dumping ground.

---

# File Naming

Use consistent naming.

Functions

```
getOperator.ts
```

---

Services

```
operator-service.ts
```

---

Runtime

```
platform-runtime.ts
```

---

Contracts

```
operator-contract.ts
```

---

Types

```
operator-types.ts
```

---

Registry

```
application-registry.ts
```

---

Bootstrap

```
platform-bootstrap.ts
```

Avoid:

```
helpers.ts

utils2.ts

newService.ts

temp.ts
```

Names should describe responsibility.

---

# Naming Standards

Prefer:

Operator

Mission

Session

Capability

Context

Intelligence

Prediction

Behaviour

Progression

Application

Integration

Extension

Avoid vague names such as:

Manager

Processor

Thing

Data

Helper

General

Common

Utility

Every name should describe purpose.

---

# Single Responsibility

Every file should answer one question:

"What is my responsibility?"

If multiple answers exist,

split the file.

---

# File Size

Guidelines:

Functions

<100 lines

---

Components

150–300 lines

---

Services

200–400 lines

---

Runtime

As required.

Readable over short.

Do not split runtime code purely to satisfy arbitrary limits.

---

# Imports

Order imports consistently.

```typescript
// External

import React from "react";


// Internal aliases

import { ... } from "@/lib/...";


// Relative imports

import { ... } from "./types";
```

Avoid circular imports.

---

# TypeScript

Prefer explicit types.

Prefer interfaces for public contracts.

Prefer type aliases for unions.

Avoid:

```
any
```

Use:

```
unknown
```

until properly narrowed.

Strict typing is preferred.

---

# Functions

Functions should:

- perform one responsibility
- return predictable results
- avoid hidden side effects
- remain testable

Prefer:

```
calculateMissionScore()
```

over

```
processMission()
```

---

# Components

Components render.

Components should not own business logic.

Business logic belongs inside:

- Services
- Engines
- Platform

Components consume results.

---

# React Principles

Prefer:

Small composable components.

Clear props.

Derived state.

Avoid:

Large monolithic pages.

Nested conditional rendering.

Duplicated UI logic.

---

# Styling

Use Tailwind.

Prefer design tokens.

Avoid inline styling unless justified.

Use consistent spacing.

Use consistent typography.

Use premium visual hierarchy.

Oracle should always feel deliberate.

---

# Comments

Comment:

Why.

Not:

What.

Good:

```typescript
// Delay registration until the Platform has completed bootstrap.
```

Bad:

```typescript
// Increment i.
```

The code already explains that.

---

# Error Handling

Errors should be:

Typed.

Actionable.

Observable.

Avoid silent failures.

Platform diagnostics should always explain why something failed.

---

# Logging

Logs should help diagnose behaviour.

Avoid console spam.

Prefer structured logging.

Include:

- subsystem
- severity
- timestamp
- message
- context

---

# Configuration

Configuration belongs in configuration.

Never hard-code:

API keys.

URLs.

Secrets.

Environment-specific behaviour.

---

# Performance

Optimise after measuring.

Prefer clarity over premature optimisation.

Platform correctness is more valuable than micro-optimisations.

---

# Refactoring

Refactor when:

- duplication appears
- ownership becomes unclear
- coupling increases
- readability decreases

Do not refactor purely for novelty.

Every refactor should improve the Platform.

---

# Code Review Checklist

Before committing ask:

- Is ownership obvious?
- Is naming clear?
- Is another Service already responsible?
- Is typing explicit?
- Is the dependency direction correct?
- Is duplication avoided?
- Does this strengthen Oracle?
- Does this follow the Constitution?

If not,

improve before committing.

---

> Great software is not written by adding more code.

> Great software is written by making every line belong exactly where it should.

# Oracle User Experience Standards

Oracle is premium software.

Every interaction should feel deliberate, polished and intelligent.

The user should immediately feel that Oracle understands what they are doing.

Oracle should never feel cluttered.

Oracle should never overwhelm the Operator with unnecessary information.

Intelligence should always feel calm.

---

# Design Philosophy

Oracle is built around five principles.

## Clarity

The Operator should immediately understand:

- where they are
- what Oracle knows
- what Oracle recommends
- what action should be taken

---

## Confidence

Oracle should communicate confidence honestly.

Avoid:

"Always"

"Guaranteed"

"Perfect"

Prefer:

High Confidence

Medium Confidence

Low Confidence

Evidence Available

Confidence should always be visible.

---

## Context

Oracle should display information because it is useful now.

Not because it exists.

Context determines relevance.

Relevance determines visibility.

---

## Progression

Oracle should encourage continuous improvement.

Every screen should answer one of:

- What happened?
- Why?
- What should I improve?
- What happens next?

---

## Simplicity

If information does not help the Operator make a better decision,

it should probably not be shown.

---

# Oracle Visual Identity

Oracle should always appear:

Premium

Modern

Technical

Professional

Minimal

Readable

Confident

Never:

Cheap

Playful

Noisy

Distracting

Overdesigned

---

# Layout Principles

Every screen should have a clear hierarchy.

Recommended structure:

```text
Page Header

↓

Primary Intelligence

↓

Supporting Information

↓

Secondary Detail

↓

Diagnostics (if required)
```

The most important information should always appear first.

---

# Typography

Hierarchy should remain consistent.

Primary Heading

Large

Bold

High contrast

---

Section Heading

Clear

Compact

Consistent

---

Body Text

Comfortable reading width

High readability

Minimal visual noise

---

Labels

Uppercase only when appropriate.

Avoid excessive decorative text.

---

# Colour Philosophy

Colour communicates meaning.

Never decoration.

Recommended meanings:

Blue

Information

---

Green

Healthy

Complete

Successful

---

Amber

Attention

Review

Medium confidence

---

Red

Problem

Critical warning

Failure

---

Purple

Oracle Intelligence

AI

Prediction

Reasoning

---

Avoid using colour as the only communication mechanism.

---

# Cards

Oracle uses cards extensively.

Every card should answer one question.

Good:

Mission Progress

Prediction

Operator Rank

Performance Trend

Recommendation

Avoid:

Cards containing unrelated information.

---

# Dashboards

Dashboards should guide attention.

Not display everything.

Every dashboard should answer:

What matters now?

---

# AI Presentation

Oracle Intelligence should feel conversational.

Avoid robotic wording.

Avoid exaggerated confidence.

Prefer:

"Oracle believes..."

"Evidence suggests..."

"Historical behaviour indicates..."

"Confidence is currently high."

Oracle should sound intelligent.

Not theatrical.

---

# Recommendations

Every recommendation should include:

Recommendation

↓

Reason

↓

Evidence

↓

Confidence

↓

Expected Outcome

Recommendations without explanation reduce trust.

---

# Empty States

Empty states should encourage action.

Example:

"No sessions analysed yet.

Complete your first Oracle Session to begin building your Operator profile."

Avoid:

"No data."

---

# Loading States

Loading should reassure.

Prefer meaningful progress.

Example:

Analysing Behaviour...

Building Prediction...

Resolving Platform...

Avoid:

Generic spinning indicators without context.

---

# Notifications

Notifications should be:

Relevant

Actionable

Rare

Avoid notification fatigue.

Every notification should help the Operator.

---

# Oracle Companion

The Companion should feel like part of Oracle.

Not a separate application.

Companion should be:

Minimal

Context aware

Non-intrusive

Fast

Transparent

Companion should never compete with gameplay.

It should complement gameplay.

---

# Overlay Philosophy

The Overlay exists to deliver intelligence,

not occupy screen space.

Default behaviour:

Transparent

Borderless

Click-through

Always-on-top

Operator controlled

The Operator always remains in control.

---

# Information Priority

When space is limited,

display information in this order:

Critical warnings

↓

Current objective

↓

Recommendations

↓

Predictions

↓

Supporting detail

↓

Diagnostics

---

# Animation

Animation should communicate state.

Avoid decorative animation.

Good:

Fade

Slide

Progress

Expansion

Avoid:

Excessive movement

Unnecessary transitions

Distracting effects

---

# Accessibility

Oracle should remain usable by everyone.

Use:

Readable font sizes

High contrast

Keyboard navigation

Clear focus states

Colour-independent meaning

---

# Consistency

Every Oracle Application should feel like Oracle.

The Operator should never wonder:

"Am I still inside Oracle?"

Consistency builds trust.

---

# User Experience Review

Before releasing a feature ask:

Is it obvious?

Is it useful?

Is it explainable?

Is it visually consistent?

Does it reduce effort?

Does it strengthen Oracle?

If not,

improve it.

---

> Intelligence creates value.

> Great user experience makes that value usable.

# Oracle Intelligence Standards

Oracle Intelligence is the heart of the Oracle Platform.

Intelligence is never generated by a single system.

It emerges from multiple specialised systems working together through explicit contracts.

Oracle should always reason.

Never guess.

---

# Intelligence Philosophy

Oracle exists to answer four questions.

## What happened?

Historical understanding.

---

## Why did it happen?

Behavioural reasoning.

---

## What will happen?

Prediction.

---

## What should the Operator do?

Recommendation.

Every Oracle Application ultimately exists to answer one or more of these questions.

---

# Intelligence Flow

Oracle Intelligence follows a predictable lifecycle.

```text
Evidence
        │
        ▼
Context
        │
        ▼
Engines
        │
        ▼
Oracle Brain
        │
        ▼
Decision Intelligence
        │
        ▼
Services
        │
        ▼
Applications
```

Each stage has one responsibility.

---

# Evidence

Evidence is the foundation of trust.

Evidence may originate from:

- Oracle Sessions
- Historical behaviour
- Game Integrations
- Desktop Observation
- OCR
- Platform state
- Operator Profile
- User configuration

Evidence should never be fabricated.

---

# Oracle Context

Context represents Oracle's current understanding.

Context is immutable.

Systems derive information from Context.

They do not silently overwrite it.

---

# Engines

Every Engine performs one specialised task.

Examples:

Behaviour Engine

Prediction Engine

Trend Engine

Mission Engine

Evidence Engine

Explainability Engine

Confidence Engine

Avoid creating "general purpose" engines.

Specialisation improves quality.

---

# Oracle Brain

Oracle Brain coordinates intelligence.

Oracle Brain does not replace Engines.

Oracle Brain combines Engine outputs into coherent reasoning.

Think of Oracle Brain as an orchestrator rather than a calculator.

---

# Decision Intelligence

Decision Intelligence transforms reasoning into action.

Every recommendation should include:

Recommendation

↓

Evidence

↓

Confidence

↓

Reasoning

↓

Expected Outcome

Recommendations without explanation reduce trust.

---

# Explainability

Every important recommendation should answer:

Why?

Evidence should always be available.

Oracle should never behave like a black box.

---

# Confidence

Confidence should always be calculated.

Never invented.

Confidence should increase when:

Evidence increases.

Agreement between Engines increases.

Historical accuracy increases.

Confidence should decrease when:

Evidence conflicts.

Evidence is incomplete.

Historical certainty is low.

---

# Behaviour

Behaviour describes patterns.

Not isolated events.

Oracle should identify:

Habits

Strengths

Weaknesses

Consistency

Improvement

Regression

Behaviour evolves over time.

---

# Prediction

Prediction estimates future outcomes.

Prediction should never be presented as certainty.

Every prediction should include:

Probability

Confidence

Reasoning

Evidence

Expected variance

---

# Memory

Oracle remembers.

Memory should improve future reasoning.

Memory should not become uncontrolled historical storage.

Useful memory is preferable to complete memory.

---

# Services and Intelligence

Applications should never communicate directly with Engines.

Applications consume Services.

Services consume Platform Intelligence.

This separation keeps intelligence reusable.

---

# Platform Intelligence

The Platform owns intelligence.

Applications present intelligence.

Games provide context.

This ownership must remain stable.

---

# AI Integration

External AI services enhance Oracle.

They do not define Oracle.

Oracle should remain valuable even when external AI providers change.

AI providers are dependencies.

Oracle Intelligence is the product.

---

# Prompt Engineering

AI prompts should:

Be deterministic.

Be explainable.

Be versioned.

Be testable.

Avoid hidden prompt changes.

Prompt evolution should be documented.

---

# Hallucination Prevention

Oracle should minimise hallucination.

Prefer:

Evidence

Structured data

Historical behaviour

Known game knowledge

Avoid unsupported conclusions.

When uncertainty exists,

Oracle should say so.

---

# Intelligence Review

Before releasing intelligence ask:

Is it explainable?

Is confidence justified?

Is evidence available?

Is ownership correct?

Can another Engine own this?

Does this strengthen Oracle?

If not,

redesign.

---

# Intelligence Goal

Oracle should become more accurate after every Operator session.

Every completed session should permanently strengthen Oracle's understanding of that Operator.

Learning is continuous.

Improvement is expected.

---

> Oracle does not generate intelligence because AI exists.

> Oracle generates intelligence because evidence becomes understanding.

# Oracle Development Workflow

Oracle is developed through disciplined engineering.

Every sprint should leave the Platform in a stronger state than before.

Architecture always precedes implementation.

Documentation is implementation.

Green builds are mandatory.

---

# Sprint Lifecycle

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
Continuous Compilation
        │
        ▼
Green Production Build
        │
        ▼
Architecture Review
        │
        ▼
Documentation Update
        │
        ▼
Sprint Closure
        │
        ▼
Git Commit
        │
        ▼
Next Sprint
```

No stage should be skipped.

---

# Sprint Planning

Before writing code:

- Review the Founding Charter.
- Review the Oracle Way.
- Review the Constitution.
- Review Oracle Strategy.
- Review the Engineering Principles.
- Review accepted ADRs relevant to the work.
- Review the Codex.
- Review Architecture.
- Review Roadmap.
- Review current implementation.
- Understand existing ownership.
- Confirm sprint objective.
- Identify success criteria.

Planning should reduce implementation complexity.

---

# Definition of Done

A sprint is **not complete** until all of the following are true.

## Engineering

- Production build passes.
- TypeScript passes.
- No unresolved build warnings.
- Architecture remains consistent.

---

## Documentation

- Constitution updated if required.
- Codex updated if required.
- Architecture updated.
- Roadmap updated.
- Project Board updated.
- Decisions recorded.

---

## Repository

- Commit created.
- Repository clean.

Push and product-release tagging are separately authorised release actions.
They are required only when the approved workflow includes them; Sprint closure
does not imply release authority.

---

## Product

- Feature works.
- Existing behaviour preserved.
- Platform strengthened.
- No architectural regression.

Only then is a sprint complete.

---

# Branch Strategy

Each sprint receives its own branch.

Examples:

```text
main

sprint-8-platform

sprint-9-overlay

sprint-10-observation

sprint-11-game-intelligence

sprint-12-marketplace
```

Branch names should describe the sprint objective.

Avoid long-lived feature branches covering multiple milestones.

---

# Versioning

Oracle follows milestone versioning.

Examples:

```text
v0.8.0-platform-foundation

v0.9.0-overlay-alpha

v0.10.0-observation-alpha

v0.11.0-game-intelligence

v0.12.0-marketplace
```

Every tagged version should represent a meaningful milestone.

---

# Git Workflow

Standard Sprint workflow:

```text
Create Sprint Branch

↓

Implement

↓

Build

↓

Review

↓

Commit

↓

Closure Decision
```

When separately authorised, the release workflow may continue through push,
merge and a meaningful version tag. Never push, merge or tag a failing build,
and never infer release authority from Sprint closure.

---

# Commit Messages

Commit messages should describe intent.

Good:

```
Introduce Platform Bootstrap

Implement Extension Runtime

Refactor Service Registry

Add Capability Graph
```

Avoid:

```
Updates

Changes

Fix

More work

Stuff
```

History should explain Oracle's evolution.

---

# Pull Requests

Every pull request should answer:

What changed?

Why?

What architecture was affected?

What documentation was updated?

Does the build pass?

---

# Architecture Reviews

Every significant change should answer:

Does this strengthen the Platform?

Does ownership remain clear?

Can this become reusable?

Does it introduce duplication?

Is another subsystem already responsible?

If uncertain,

review before implementing.

---

# Documentation Workflow

Documentation is maintained continuously.

Preferred order:

Founding Charter

↓

The Oracle Way

↓

Constitution

↓

Engineering Principles and Strategy

↓

Accepted ADRs and Codex

↓

Architecture

↓

Roadmap

↓

Master Build Plan

↓

Project Board

↓

Sprint Execution

↓

Implementation

Documentation should never drift from reality.

---

# Build Policy

Production build must pass before:

- Commit
- Sprint closure

A release build must also pass before an authorised push or product release
tag.

A green build is non-negotiable.

---

# Database Migration Discipline

Every production database migration follows this sequence:

```text
Implementation
        ↓
Rollback Validation
        ↓
Independent Catalog Verification
        ↓
Founder Approval
        ↓
Permanent Deployment
        ↓
Security Verification
        ↓
Authenticated Isolation Verification
        ↓
Founder Closure
        ↓
Commit
```

Implementation begins from an audited deployed schema rather than assuming
tracked SQL is authoritative. Rollback validation executes the exact proposed
migration inside an explicit transaction that ends in `ROLLBACK`. Independent
catalog verification confirms that validation left the deployed schema,
policies and data unchanged.

Permanent deployment requires explicit founder approval after rollback and
catalog evidence. After deployment, security verification rechecks schema
objects, constraints, indexes, grants, functions, triggers, RLS and policies.
Authenticated isolation verification uses approved principals to demonstrate
the ownership boundary independently of application-side filtering.

If a permanent migration fails, stop after reporting the exact failure. Do not
repair, rerun or apply a second migration without a new review and approval.
The implementation commit is created only after founder closure.

Permanent database verification fixtures must be clearly identified, narrowly
scoped and reserved exclusively for their approved regression purpose. Their
credentials must never be committed.

---

# Refactoring Policy

Refactor when:

- duplication increases
- ownership becomes unclear
- complexity grows
- architecture improves

Do not refactor purely because code looks different.

Every refactor should strengthen Oracle.

---

# Breaking Changes

Breaking architectural changes require:

- Architecture review
- Documentation update
- Decision record
- Migration plan

Avoid unnecessary breaking changes.

---

# Engineering Quality

Oracle values:

Correctness

Clarity

Consistency

Maintainability

Extensibility

Explainability

Premium quality

Speed is important.

Quality is permanent.

---

# Release Philosophy

Oracle releases should represent genuine progress.

Every release should:

Improve the Platform.

Improve the Operator experience.

Reduce technical debt.

Increase architectural maturity.

Improve documentation.

Every release should make Oracle easier to extend.

---

# Engineering Mindset

Ask before every implementation:

Will this still make sense in two years?

Will another developer understand it?

Does it strengthen Oracle?

If the answer is no,

stop and redesign.

---

> Great engineering is not measured by how quickly features are added.

> Great engineering is measured by how confidently the Platform can continue to evolve.

# Quality Standards

Oracle is expected to behave like a premium software platform.

Quality is not optional.

Every subsystem should be:

- Reliable
- Predictable
- Testable
- Observable
- Explainable
- Maintainable

Every sprint should improve one or more quality attributes.

---

# Testing Philosophy

Oracle is tested in layers.

```text
Platform

↓

Services

↓

Applications

↓

Game Integrations

↓

User Experience
```

Testing should verify behaviour rather than implementation.

---

# Unit Testing

Unit tests validate isolated behaviour.

Suitable targets include:

- Services
- Engines
- Utility functions
- Capability resolution
- Platform contracts

Unit tests should be:

Fast

Deterministic

Independent

---

# Integration Testing

Integration tests validate communication between subsystems.

Examples:

Platform ↔ Services

Services ↔ Applications

Applications ↔ Game Integrations

Companion ↔ Platform

Extension Runtime ↔ Capability Graph

Integration tests should validate contracts.

---

# End-to-End Testing

End-to-end tests validate complete Operator journeys.

Examples:

Launch Oracle

↓

Platform Boots

↓

Game Detected

↓

Integration Loaded

↓

Companion Starts

↓

Session Begins

↓

Intelligence Generated

↓

Recommendation Displayed

The entire journey should succeed.

---

# Build Validation

Every release requires:

- Successful production build
- Successful TypeScript compilation
- Zero unresolved build failures
- Passing automated validation

Broken builds are never committed intentionally.

---

# Diagnostics

Every major subsystem should expose diagnostics.

Examples:

Platform

Extension Runtime

Companion Runtime

Capability Graph

Game Integrations

Applications

Diagnostics should answer:

Is the subsystem healthy?

What is running?

What failed?

Why?

---

# Logging Standards

Logs exist for diagnosis.

Every log should include:

Timestamp

Subsystem

Severity

Message

Context

Avoid unnecessary verbosity.

Logs should help engineers solve problems.

---

# Error Handling

Errors should be:

Recoverable where possible.

Actionable.

Typed.

Observable.

Never silently ignored.

Every unexpected failure should leave enough information to diagnose the issue.

---

# Performance

Optimisation follows measurement.

Priority order:

Correctness

↓

Reliability

↓

Readability

↓

Performance

Avoid premature optimisation.

Optimise only after identifying genuine bottlenecks.

---

# Memory Management

Platform resources should be released correctly.

Examples:

Observers

Subscriptions

Intervals

Timers

Runtime registrations

Companion windows

Extensions

Memory leaks should be treated as defects.

---

# Lifecycle Management

Every long-lived subsystem should expose an explicit lifecycle.

Typical lifecycle:

```text
Discovered

↓

Registered

↓

Validated

↓

Loaded

↓

Initialised

↓

Running

↓

Paused

↓

Stopped

↓

Unloaded
```

Lifecycle transitions should be visible through diagnostics.

---

# Security

Oracle prioritises Operator safety.

Never:

Inject into game processes.

Modify game memory.

Simulate gameplay input.

Bypass anti-cheat.

Manipulate protected processes.

Read protected memory.

Oracle remains external.

---

# Privacy

Oracle processes only the information required for enabled functionality.

Operators should understand:

What Oracle collects.

Why it is collected.

How it is used.

Privacy should be designed into the Platform rather than added later.

---

# Companion Safety

Oracle Companion should:

Remain external.

Respect game rules.

Avoid interfering with gameplay.

Allow the Operator to disable it instantly.

Platform safety takes priority over additional functionality.

---

# Extension Safety

Extensions operate within declared permissions.

Extensions must declare:

Identity

Version

Capabilities

Permissions

Compatibility

Trust level

Extensions should never receive unrestricted Platform access.

---

# Marketplace Standards

Marketplace submissions should satisfy:

Build validation.

Manifest validation.

Permission validation.

Capability validation.

Compatibility review.

Security review.

Community extensions should remain isolated from Platform internals.

---

# Observability

Every important Platform event should be observable.

Examples:

Platform bootstrap

Service registration

Application registration

Extension loading

Companion attachment

Game detection

Capability resolution

Failures should be diagnosable.

---

# Quality Gates

Before every release verify:

✓ Platform boots

✓ Services register

✓ Applications register

✓ Companion starts

✓ Extensions load

✓ Capability Graph resolves

✓ Documentation updated

✓ Production build passes

Every quality gate should pass before release.

---

# Platform Health

Oracle should always be capable of reporting its own health.

Health reporting should include:

Platform

Services

Applications

Extensions

Companion

Integrations

Health should be understandable by both engineers and Operators.

---

# Continuous Improvement

Every sprint should improve one or more of:

Reliability

Maintainability

Performance

Architecture

Documentation

Operator Experience

Quality should trend upwards over time.

---

> Oracle should never become more complex than necessary.

> Every improvement should make the Platform stronger, clearer and easier to extend.

# Canonical Engineering Principles

The former Engineering Commandments duplicated durable principles inside this
operational standard. Their canonical replacement is
`docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md`.

Use the Engineering Principles for enduring judgment and this Codex for
detailed practice, review criteria and workflow. Cultural expectations are
owned by `docs/founding/THE_ORACLE_WAY.md`.

---

# Architectural Review Checklist

Before implementing any significant change ask:

## Identity

Does this align with the Oracle Platform Constitution?

---

## Platform

Does this strengthen the Platform?

---

## Ownership

Who owns this capability?

Is ownership obvious?

---

## Services

Can an existing Service already perform this responsibility?

---

## Applications

Should this live inside an Application?

Or should the Application consume an existing Service?

---

## Game Integrations

Is game-specific knowledge staying inside the Integration?

---

## Extensions

Should this be an Extension instead?

---

## Intelligence

Can Oracle explain this recommendation?

Can Oracle justify its confidence?

---

## Future Growth

Will this architecture still make sense after supporting 100 games?

---

## Simplicity

Does this reduce complexity?

Or increase it?

Good architecture usually removes complexity.

---

# Engineering Standards

Oracle engineering values:

Correctness over speed.

Quality over quantity.

Architecture over shortcuts.

Evidence over assumptions.

Consistency over novelty.

Long-term thinking over short-term convenience.

These principles should influence every engineering decision.

---

# Oracle Release Standard

No Oracle release should be considered complete until:

✓ Production build passes.

✓ TypeScript passes.

✓ Documentation reflects implementation.

✓ Architecture reflects implementation.

✓ Roadmap reflects reality.

✓ Project Board updated.

✓ Decisions recorded.

✓ Git committed.

✓ Release decision recorded.

✓ Push and version tag completed when separately authorised.

✓ Ready for next sprint.

Release quality is measured by confidence rather than speed.

---

# Closing Governance Reference

The Codex closes where engineering work begins: with the canonical governance
chain in `docs/DOCUMENTATION_INDEX.md`.

Use the Founding Charter for purpose, the Oracle Way for stewardship, the
Constitution for binding product and architecture, the Engineering Principles
for durable judgment, accepted ADRs for specific decisions and this Codex for
operational practice.

Implementation must remain consistent with all higher authority and must be
verified before it is declared complete.
