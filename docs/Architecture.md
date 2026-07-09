# ORACLE ARCHITECTURE

Technical Architecture

Version 4.0

Last Updated: Sprint 5 Closure

---

# Purpose

This document defines Oracle's technical architecture.

Its purpose is to describe how Oracle is structured, how intelligence flows through the platform, and how future systems should integrate without requiring architectural redesign.

Unlike the Manifesto or the Codex, this document focuses exclusively on production architecture.

It answers one question.

**How does Oracle work?**

---

# Architectural Vision

Oracle is a modular AI Gaming Intelligence Platform.

Every subsystem owns one responsibility.

Every subsystem produces reusable intelligence.

Every subsystem communicates through shared runtime contracts.

Every subsystem should be capable of evolving independently.

Oracle is designed so that new capabilities extend existing architecture rather than replacing it.

Every completed sprint should strengthen the platform.

Never weaken it.

---

# Architectural Principles

Oracle follows seven core architectural principles.

## 1. Separation of Responsibility

Every subsystem owns one responsibility.

Pages compose.

Components present.

Repositories expose truth.

Engines reason.

Signals communicate.

Decision Intelligence recommends.

The Pipeline orchestrates.

Oracle Brain understands.

---

## 2. Intelligence First

Oracle always produces intelligence before presentation.

Presentation never generates intelligence.

Presentation consumes Oracle Intelligence State.

The UI should know as little as possible about how intelligence is produced.

---

## 3. Evidence Driven

Every recommendation originates from evidence.

Evidence originates from Oracle Sessions and Oracle Context.

Recommendations should always remain explainable.

---

## 4. Game Agnostic

Games provide data.

Oracle provides intelligence.

Oracle core should never contain game-specific business logic.

Game-specific reasoning belongs inside dedicated modules or providers.

---

## 5. Modular Expansion

New capabilities should plug into existing architecture.

Future systems should extend Oracle.

Never redesign Oracle.

---

## 6. Reusable Systems

Reusable architecture takes priority over isolated implementations.

Every engine should be reusable.

Every provider should be reusable.

Every repository should be reusable.

Every component should be reusable.

---

## 7. Single Source of Truth

Truth exists once.

Repositories expose truth.

Oracle Context shares truth.

Signals communicate observations.

Decision Intelligence owns recommendations.

OracleIntelligenceState owns presentation.

---

# Oracle Layer Model

Oracle consists of layered systems.

Each layer depends only on the layer immediately beneath it.

```text
Presentation Layer

↓

Oracle Intelligence State

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

Oracle Context

↓

Repository Layer

↓

Database Layer
```

Each layer performs one responsibility.

No layer should bypass another.

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

                   Oracle Context

                         │

                         ▼

                 Intelligence Bus

                         │

         ┌───────────────┼────────────────┐
         │               │                │
         ▼               ▼                ▼

 Behaviour       Contextual Engine   Planner Engine

 Evolution

         │               │                │

         └───────────────┼────────────────┘
                         ▼

                      Signals

                         ▼

                   Oracle Brain

                         ▼

              Decision Intelligence

                         ▼

           Oracle Intelligence State

                         ▼

               Presentation Components
```

Oracle's production architecture was completed during Sprint 4.

Sprint 5 demonstrated that new capabilities can be added through this architecture without requiring redesign.

# Pipeline Layer

## Location

```text
lib/oracle/pipeline/
```

## Responsibilities

The Pipeline is Oracle's orchestration layer.

Responsibilities include:

- Build Oracle Context
- Execute the Intelligence Bus
- Aggregate Signals
- Aggregate Decisions
- Aggregate Explainability
- Build Oracle Brain
- Build Timeline
- Build Planner
- Construct OracleIntelligenceState

The Pipeline coordinates execution.

It never performs intelligence reasoning.

Business logic belongs inside Oracle engines.

---

# Oracle Context

## Location

```text
lib/oracle/context/
```

Oracle Context is Oracle's shared runtime contract.

Every intelligence engine receives the same contextual model.

No engine should independently retrieve runtime information that already exists inside Oracle Context.

Oracle Context currently contains:

- Operator
- Operator Profile
- Current Session
- Recent Sessions
- Signals
- Decisions
- Current Game
- Patch Version
- Contextual State

Oracle Context is now production architecture.

It is no longer a planned capability.

---

# Contextual State

Sprint 5 introduced Contextual State as part of Oracle Context.

Contextual State provides Oracle with a shared understanding of the Operator's current situation.

Current contextual information includes:

```text
Intent

Priorities

Opportunities
```

Future contextual systems should extend this model rather than introducing parallel context systems.

Oracle Context remains the single runtime contract.

---

# Intelligence Bus

## Location

```text
lib/oracle/bus/
```

The Intelligence Bus is Oracle's orchestration backbone.

Rather than manually invoking intelligence engines, Oracle registers engines and executes them through a shared runtime.

Current Intelligence Bus responsibilities include:

- Execute registered engines
- Validate dependencies
- Aggregate Signals
- Aggregate Decisions
- Aggregate Graph entries
- Record engine execution
- Report diagnostics

The Intelligence Bus is production architecture.

Future engines should register themselves.

The Bus should never require redesign when new engines are added.

---

# Engine Layer

## Location

```text
lib/oracle/
```

Oracle's intelligence engines perform domain-specific reasoning.

Every engine performs one responsibility.

Every engine receives Oracle Context.

Every engine produces structured outputs.

Current production engines include:

- Context Summary Engine
- Behaviour Evolution Engine
- Adaptive Coaching Engine
- Planner Engine
- Operator Profile Engine
- Contextual Intelligence Engine

Future engines include:

- Memory
- Strategy
- Map
- Economy
- Team
- Tournament
- Voice
- Visual Intelligence

Every engine should:

- Accept Oracle Context
- Produce structured output
- Remain reusable
- Remain deterministic
- Remain game agnostic
- Never render UI
- Never access React
- Never query presentation state

---

# Contextual Intelligence

Sprint 5 introduced Oracle's first major capability expansion after completion of the production runtime.

The Contextual Intelligence Engine allows Oracle to reason about what the Operator is currently trying to accomplish.

Rather than creating a separate recommendation framework, Contextual Intelligence integrates directly into Oracle's existing architecture.

It produces:

- Contextual Profile
- Contextual Signals
- Contextual Decisions
- Diagnostics

The engine executes through the Intelligence Bus using the standard OracleEngine contract.

No special execution path exists.

---

# Intent Resolver

The Intent Resolver is responsible for selecting the strongest Operator intent.

It does not contain game-specific logic.

It does not own contextual reasoning.

Instead, it coordinates Intent Providers.

Responsibilities include:

- Execute providers
- Collect intent candidates
- Rank candidates
- Resolve the strongest intent
- Provide fallback behaviour

The resolver orchestrates.

Providers reason.

---

# Intent Provider Architecture

Sprint 5 introduced Oracle's first provider-based subsystem.

Intent Providers allow Oracle to expand contextual intelligence without modifying the resolver itself.

Each provider performs one responsibility.

Current providers include:

- Explicit Context Provider
- Opportunity Provider
- Recent Session Provider
- Active Game Provider

Future providers may include:

- Mission Provider
- Planner Provider
- Timeline Provider
- Memory Provider
- Map Provider
- Loot Provider
- Vehicle Provider
- Quest Provider

The preferred Oracle extension model is now:

```text
Oracle Context

↓

Intent Resolver

↓

Intent Providers

↓

Contextual Intelligence Engine

↓

Signals

↓

Decision Intelligence
```

Future contextual capability should primarily be added by introducing new providers rather than modifying existing orchestration.

# Signal Architecture

## Location

```text
lib/oracle/signals/
```

Signals are Oracle's observational language.

Signals describe what Oracle has detected.

Signals never contain recommendations.

Recommendations belong exclusively to Decision Intelligence.

Signals are intentionally lightweight so that every Oracle subsystem can communicate using a common vocabulary.

Current signal domains include:

- Behaviour
- Coaching
- Weapon
- Operator
- Prediction
- Memory
- Report
- Context
- Opportunity

Signals may be consumed by:

- Oracle Brain
- Timeline
- Decision Intelligence
- Explainability
- Future Intelligence Engines

Signals should always describe observations.

They should never prescribe actions.

---

# Oracle Brain

## Location

```text
lib/oracle/brain/
```

Oracle Brain is responsible for synthesising intelligence.

It receives observations from the Intelligence Bus and produces higher-order understanding.

Oracle Brain does not replace individual engines.

It combines their outputs.

Responsibilities include:

- Aggregate intelligence
- Connect related observations
- Produce graph relationships
- Identify emerging patterns
- Support Explainability
- Support Decision Intelligence

Oracle Brain remains engine-agnostic.

New engines automatically enrich Oracle Brain through standard outputs.

---

# Decision Intelligence

## Location

```text
lib/oracle/intelligence/
```

Decision Intelligence converts observations into recommendations.

Every recommendation produced by Oracle uses the shared OracleDecision contract.

Decision Intelligence remains the only subsystem that owns recommendations.

Sprint 5 extended the decision taxonomy by introducing:

- Context
- Opportunity

No additional recommendation framework was introduced.

Contextual Intelligence integrates directly into the existing OracleDecision architecture.

Every decision continues to include:

- Recommendation
- Summary
- Confidence
- Priority
- Evidence
- Expected Outcome
- Reassessment Trigger

This preserves one recommendation language across Oracle.

---

# Timeline

## Location

```text
lib/oracle/timeline/
```

The Oracle Timeline provides a chronological view of intelligence.

Timeline events are derived from Signals.

Sprint 5 extended the Timeline by introducing:

- Context
- Opportunity

These new event categories allow contextual intelligence to appear naturally alongside Behaviour, Coaching, Memory and Prediction events.

The Timeline remains presentation-independent.

Its responsibility is to organise intelligence chronologically.

---

# Explainability

## Location

```text
lib/oracle/explainability/
```

Explainability exists to answer one question:

**Why did Oracle reach this conclusion?**

Every recommendation should be traceable.

Every recommendation should be explainable.

Explainability consumes evidence from:

- Signals
- Decisions
- Oracle Brain
- Intelligence Graph
- Engine diagnostics

Future contextual providers should contribute additional explainability rather than introducing alternative explanation systems.

---

# Oracle Intelligence State

## Location

```text
lib/oracle/state/
```

OracleIntelligenceState is Oracle's presentation contract.

Presentation components should consume OracleIntelligenceState rather than individual engine outputs.

Sprint 5 preserved this architecture.

The Contextual Intelligence subsystem integrates through OracleIntelligenceState rather than introducing its own UI contract.

OracleIntelligenceState currently contains:

- Metadata
- Lifecycle
- Oracle Context
- Intelligence Bus
- Oracle Brain
- Timeline
- Planner
- Explainability
- Signals
- Decisions
- Decision Profile

Presentation should consume this state directly.

Business logic should never move into React components.

---

# Runtime Intelligence Flow

Oracle's production runtime now follows this execution model.

```text
Operator

↓

Repositories

↓

Oracle Context

↓

Intent Resolver

↓

Intent Providers

↓

Contextual Intelligence Engine

↓

Registered Intelligence Engines

↓

Signals
Graph
Profiles
Diagnostics

↓

Intelligence Bus

↓

Oracle Brain

↓

Decision Intelligence

↓

Timeline

↓

Explainability

↓

Planner

↓

OracleIntelligenceState

↓

Presentation Components
```

Every capability added after Sprint 5 should integrate into this runtime.

Future systems should plug into the existing flow rather than creating parallel execution paths.

# Extension Model

Oracle is designed to grow through extension rather than redesign.

Every major subsystem exposes stable extension points.

Future capabilities should integrate with these extension points before introducing new architectural layers.

Oracle's preferred extension mechanisms are:

- Repository extensions
- Engine registration
- Signal categories
- Decision categories
- Timeline categories
- Explainability providers
- Intent Providers
- Oracle Brain graph enrichment

New intelligence should attach to existing architecture.

It should not bypass it.

---

# Provider Architecture

Sprint 5 introduced Oracle's first provider-based subsystem.

Providers are intentionally small.

Each provider performs one responsibility.

Each provider contributes evidence.

Providers do not coordinate one another.

Providers do not make recommendations.

Providers simply contribute intelligence.

This keeps Oracle compliant with the Open/Closed Principle.

Future expansion should occur primarily by introducing new providers rather than modifying existing orchestration.

---

# Engine Registration

Oracle engines register themselves with the Engine Registry.

The Intelligence Bus discovers registered engines and executes them.

Future engines should never require Intelligence Bus modification.

Instead:

```text
Create Engine

↓

Register Engine

↓

Engine executes automatically

↓

Signals

↓

Brain

↓

Decision Intelligence
```

This architecture allows Oracle to scale horizontally.

---

# Future Provider Packs

Intent Providers were deliberately designed to support provider packs.

Examples include:

## Mission Providers

- Mission Intent Provider
- Objective Provider
- Challenge Provider

---

## Planner Providers

- Planner Intent Provider
- Goal Alignment Provider
- Task Priority Provider

---

## Timeline Providers

- Timeline Intent Provider
- Behaviour Sequence Provider
- Session Progress Provider

---

## Memory Providers

- Memory Intent Provider
- Historical Pattern Provider
- Behaviour Recall Provider

---

## Map Providers

- Exploration Provider
- Location Provider
- Public Secret Provider
- Collectible Provider

---

## Game Provider Packs

Oracle core should remain game agnostic.

Game-specific intelligence belongs inside provider packs.

Examples:

- Call of Duty Provider Pack
- Warzone Provider Pack
- Zombies Provider Pack
- Delta Force Provider Pack
- Battlefield Provider Pack
- Tarkov Provider Pack
- GTA Provider Pack

Oracle consumes provider output.

Oracle should never hard-code game rules into its core runtime.

---

# Scalability

Oracle has been designed around independent modules.

Growth should occur by increasing the number of reusable engines and providers rather than increasing the complexity of existing engines.

Preferred growth:

```text
More Engines

More Providers

More Signals

More Decisions

Same Architecture
```

Architecture stability is considered more valuable than feature velocity.

---

# Performance

Oracle prefers predictable execution over aggressive optimisation.

Current design principles include:

- Shared Oracle Context
- Single Intelligence Bus execution
- Shared OracleIntelligenceState
- Shared Decision framework
- Shared Signal framework

Future optimisation should focus on:

- parallel engine execution
- provider batching
- engine dependency scheduling
- intelligence caching
- incremental graph construction

Performance improvements should preserve architectural clarity.

---

# Security

Oracle is designed as an intelligence platform.

It is not designed to manipulate games.

Oracle must never:

- inject code
- modify game processes
- bypass anti-cheat systems
- automate gameplay
- reveal hidden competitive information

Oracle only reasons over:

- Operator data
- Oracle Sessions
- Public game knowledge
- User supplied information

This boundary is fundamental to Oracle's design philosophy.

---

# Fair Play

Oracle should always improve player understanding.

It should never replace player skill.

Recommendations should assist learning.

Recommendations should never automate decision making.

Oracle remains an intelligence companion.

Not an exploit.

Not a cheat.

Not an automation framework.

---

# Long-Term Evolution

Oracle's production architecture was completed during Sprint 4.

Sprint 5 validated that the architecture can expand without redesign.

Future sprints should primarily strengthen:

- Intelligence
- Explainability
- Reusability
- Scalability
- Maintainability
- Operator Understanding

Architecture should remain stable.

Capabilities should evolve.

# Architecture Review Checklist

Every architectural change should be reviewed against the following questions.

## Architecture

- Does this extend Oracle rather than redesign it?
- Does this preserve subsystem boundaries?
- Does this introduce reusable architecture?
- Does this avoid duplicate systems?
- Does this improve long-term maintainability?

## Intelligence

- Does business logic remain inside Oracle?
- Does the Intelligence Bus remain the orchestration layer?
- Does Oracle Brain remain the intelligence synthesis layer?
- Does Decision Intelligence remain the recommendation owner?
- Does Explainability remain evidence driven?

## Runtime

- Does Oracle Context remain the runtime contract?
- Does OracleIntelligenceState remain the presentation contract?
- Are Signals still observations?
- Are Decisions still recommendations?
- Is the Timeline still event driven?

## Presentation

- Pages compose.
- Components present.
- Presentation contains no business logic.
- Components consume OracleIntelligenceState.

Every answer should be **Yes** before architecture changes are accepted.

---

# Engineering Principles

Oracle should always favour:

- Stable architecture over rapid redesign.
- Reusable systems over isolated implementations.
- Extension over replacement.
- Explainability over opaque intelligence.
- Maintainability over short-term optimisation.
- Consistency over convenience.

These principles guide every future Operation.

---

# Production Readiness

As of Sprint 5 Closure, Oracle provides:

## Runtime

- Production Oracle Context
- Production Intelligence Bus
- Production Engine Registry
- Production Engine Contract
- Production OracleIntelligenceState

## Intelligence

- Behaviour Intelligence
- Trend Intelligence
- Prediction Intelligence
- Coaching Intelligence
- Planner Intelligence
- Contextual Intelligence
- Decision Intelligence
- Explainability
- Timeline Intelligence

## Extensibility

- Engine Registration
- Intent Resolver
- Intent Provider Architecture
- Signal Taxonomy
- Decision Taxonomy
- Timeline Categories
- Intelligence Graph

Oracle has successfully transitioned from a foundation project into an extensible intelligence platform.

---

# Sprint 5 Summary

Sprint 5 focused on capability expansion rather than architectural redesign.

Major outcomes included:

- Contextual Runtime Model
- Contextual Intelligence Engine
- Intent Resolver
- Intent Provider Architecture
- Independent Intent Providers
- Contextual Signal Categories
- Contextual Decision Categories
- Contextual Timeline Integration
- Contextual Intelligence Dashboard
- Provider-based extension model

Most importantly, Sprint 5 demonstrated that Oracle's architecture can grow without structural redesign.

This validates the engineering principles established during Operation Genesis.

---

# Looking Forward

Future Operations should primarily expand Oracle by introducing new intelligence rather than changing existing foundations.

Recommended areas of growth include:

- Mission Intelligence
- Memory Intelligence
- Planner Intelligence
- Map Intelligence
- Strategy Intelligence
- Public Knowledge Intelligence
- Visual Intelligence
- Team Intelligence
- Tournament Intelligence

Each capability should integrate using the existing production architecture.

Oracle should continue to evolve through modular engines, providers and shared runtime contracts.

---

# Version History

## Version 1

Initial architectural vision.

---

## Version 2

Foundation architecture introduced.

---

## Version 3

Production runtime architecture completed.

Operation Genesis concluded.

---

## Version 4

Sprint 5 capability expansion.

Introduced:

- Contextual Intelligence
- Intent Resolver
- Intent Provider Architecture
- Provider-based extensibility
- Contextual runtime model
- Updated production runtime documentation

Oracle is now operating on a stable production architecture with proven extensibility.

---

# Closing Statement

Oracle is no longer being built as a traditional gaming application.

Oracle is an AI Gaming Intelligence Platform.

The production architecture has been established.

The first major capability expansion has been successfully completed.

Future development should strengthen Oracle through additional intelligence, richer reasoning and reusable capabilities while preserving the architectural principles defined in this document.

**Extend the architecture.**

**Protect the architecture.**

**Improve the Operator.**

---

**Architecture Status**

🟢 Production Ready

**Build Status**

🟢 Passing

**Documentation Status**

🟢 Version 4.0 Complete

**Ready for Sprint 6**

✅ Yes

---

*"The architecture should become more capable, not more complicated."*

**The Oracle Has Spoken.**