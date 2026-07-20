# ORACLE

# Architectural Decision Records (ADR)

Version 4.1
Last Updated: Sprint 12.1 implementation audit — 20 July 2026

---

# Purpose

This document records the significant architectural, engineering and product decisions made during the development of Oracle.

Architecture is not only defined by what was built.

It is defined by why it was built.

These decisions preserve the reasoning behind Oracle's evolution and provide context for future development.

Every significant architectural decision should be recorded here.

---

# ADR-001

## Decision

Oracle is the product.

Project Meta remains the internal development codename and repository.

## Reason

Oracle has evolved into a standalone intelligence platform with its own identity.

Separating the product from the repository allows the platform to grow independently while preserving the original project structure.

## Consequence

All product-facing experiences use the Oracle brand.

Repository and internal references may continue using Project Meta.

## Status

✅ Accepted

---

# ADR-002

## Decision

Players are referred to as Operators.

## Reason

Operator reinforces Oracle's tactical intelligence identity.

It creates consistency across coaching, reports, recommendations and future products.

## Consequence

All product interfaces, documentation and future systems use the term Operator.

## Status

✅ Accepted

---

# ADR-003

## Decision

Every analysis is an Oracle Session.

## Reason

A Session represents an experience rather than a report.

Oracle Sessions also become the atomic unit of intelligence.

## Consequence

Every subsystem ultimately consumes or produces Oracle Sessions.

## Status

✅ Accepted

---

# ADR-004

## Decision

Oracle is built as an intelligence platform rather than a gaming application.

## Reason

Games evolve.

Operators remain.

The platform should outlive any individual title.

## Consequence

Games become intelligence modules.

Oracle remains game agnostic.

## Status

✅ Accepted

---

# ADR-005

## Decision

Business logic belongs inside engines.

## Reason

Separating reasoning from presentation improves reuse, testing and maintainability.

## Consequence

Pages compose.

Components present.

Engines reason.

Repositories expose data.

## Status

✅ Accepted

---

# ADR-006

## Decision

Repositories are the single source of persistent truth.

## Reason

Repositories isolate Oracle from storage implementation details.

## Consequence

Repositories communicate with Supabase.

No other layer accesses persistent storage directly.

## Status

✅ Accepted

---

# ADR-007

## Decision

Oracle Brain consumes intelligence.

It does not calculate intelligence.

## Reason

Reasoning belongs inside specialised engines.

Oracle Brain should focus on combining observations rather than generating them.

## Consequence

Oracle Brain becomes more valuable as additional engines are introduced.

## Status

✅ Accepted

---

# ADR-008

## Decision

Signals are Oracle's universal intelligence language.

## Reason

Individual engines should not communicate directly.

Signals provide a shared, reusable communication layer.

## Consequence

Every intelligence engine should eventually produce Signals.

Oracle Brain consumes Signals.

## Status

✅ Accepted

---

# ADR-009

## Decision

Decision Intelligence owns every recommendation.

## Reason

Without a universal recommendation layer, different systems would produce inconsistent advice.

## Consequence

Every recommendation across Oracle follows the same structure:

Recommendation

Reasoning

Evidence

Confidence

Expected Outcome

Reassessment Trigger

## Status

✅ Accepted

---

# ADR-010

## Decision

Operator Intelligence exists independently of any game.

## Reason

Oracle's long-term value comes from understanding Operators rather than memorising games.

## Consequence

Operator Profiles continue evolving regardless of which game is analysed.

## Status

✅ Accepted

---

# ADR-011

## Decision

The Intelligence Pipeline orchestrates systems.

It does not perform reasoning.

## Reason

Separating orchestration from intelligence simplifies future expansion.

## Consequence

Future engines can be added without changing existing presentation logic.

## Status

✅ Accepted

---

# ADR-012

## Decision

Oracle Context is the shared input for registered intelligence engines.

## Reason

Engines should receive consistent information without independently querying multiple systems.

## Consequence

Future engines become easier to test, maintain and reuse.

## Status

✅ Accepted and implemented

---

# ADR-013

## Decision

The Intelligence Bus orchestrates registered engine execution.

## Reason

Manual orchestration does not scale as Oracle grows.

## Consequence

Future engines register themselves rather than requiring architectural changes.

## Status

✅ Accepted and implemented

---

# ADR-014

## Decision

Oracle communicates conclusions before statistics.

## Reason

Understanding improves decision making more effectively than isolated metrics.

## Consequence

Every Oracle report should present:

Assessment

↓

Recommendation

↓

Evidence

↓

Supporting statistics

## Status

✅ Accepted

---

# ADR-015

## Decision

Confidence must always be evidence based.

## Reason

Trust is created through transparency.

Oracle should never imply certainty where evidence is weak.

## Consequence

Every recommendation includes calculated confidence rather than arbitrary percentages.

## Status

✅ Accepted

---

# ADR-016

## Decision

Oracle follows layered architecture.

## Reason

Reducing coupling improves maintainability and long-term scalability.

## Consequence

The platform follows:

Presentation

↓

Pipeline

↓

Decision Intelligence

↓

Oracle Brain

↓

Signals

↓

Engines

↓

Repositories

↓

Supabase

## Status

✅ Accepted

---

# ADR-017

## Decision

Oracle is developed through Operations rather than feature lists.

## Reason

Operations describe platform evolution rather than isolated functionality.

## Consequence

Development is organised into:

Operation Genesis

Operation Sentinel

Operation Vanguard

Operation Dominion

Operation Atlas

Operation Horizon

Operation Aegis

## Status

✅ Accepted

---

# ADR-018

## Decision

Documentation is treated as a production asset.

## Reason

Good architecture requires accurate documentation.

Future developers should understand Oracle without relying on tribal knowledge.

## Consequence

Every completed Operation updates:

Manifesto

Codex

Architecture

Roadmap

Principles

Project Board

Decision Records

## Status

✅ Accepted

---

# ADR-019

## Decision

Every new capability should strengthen the platform.

## Reason

Architecture should accumulate reusable capabilities rather than disconnected features.

## Consequence

Oracle prioritises:

Operator Intelligence

Signals

Decision Intelligence

Memory

Pipeline

Context

Strategy

Visual Intelligence

rather than isolated implementations.

## Status

✅ Accepted

---

# ADR-020

## Decision

Oracle should evolve without architectural redesign.

## Reason

The platform is intended to support many years of development.

Major capabilities should integrate through existing architecture.

## Consequence

Future systems plug into Oracle rather than replacing Oracle.

## Status

✅ Accepted

---

# ADR-021

## Decision

Oracle is the operating platform for gaming intelligence.

## Reason

Oracle has evolved beyond an intelligence platform into a reusable software platform capable of supporting multiple Oracle Applications, Services, Game Integrations and future extensions.

The Platform becomes Oracle's permanent architectural foundation.

## Consequence

Oracle owns the Platform.

Future development strengthens the Platform rather than creating parallel architectures.

## Status

✅ Accepted

---

# ADR-022

## Decision

Oracle adopts a four-layer architecture.

## Reason

Explicit architectural layering improves ownership, scalability and long-term maintainability.

## Consequence

Oracle is permanently organised as:

Oracle Platform

↓

Oracle Services

↓

Oracle Applications

↓

Game Integrations

Every future subsystem must belong to one of these layers.

## Status

✅ Accepted

---

# ADR-023

## Decision

Applications own experience.

Services own capability.

## Reason

Separating user experience from business capability prevents duplication and improves reuse.

Applications should orchestrate Services rather than implementing business logic.

## Consequence

Applications become lightweight presentation layers.

Reusable capability lives inside Services.

## Status

✅ Accepted

---

# ADR-024

## Decision

Game Integrations provide knowledge rather than owning Oracle features.

## Reason

Oracle must remain consistent regardless of which game is currently active.

Applications such as AI Coach, Oracle Brain and Loadouts remain Oracle products.

Games contribute knowledge and capabilities through Game Integrations.

## Consequence

New Game Integrations can be introduced without redesigning Oracle Applications.

The Oracle experience remains consistent across every supported title.

## Status

✅ Accepted

---

# ADR-025

## Decision

Capability resolution replaces direct implementation coupling.

## Reason

Applications should request capabilities rather than knowing which implementation provides them.

The Platform resolves providers through the Capability Graph.

## Consequence

Applications become independent of individual Game Integrations.

Multiple providers may satisfy the same capability.

Oracle becomes significantly easier to extend.

## Status

✅ Accepted

---

# ADR-026

## Decision

The Companion becomes a Platform subsystem.

## Reason

The Companion is not a standalone application.

It is an Oracle Application powered by the Oracle Platform.

Keeping Companion infrastructure inside the Platform enables shared lifecycle management, diagnostics and capability resolution.

## Consequence

Companion Runtime becomes part of the Oracle Platform.

Future Companion functionality consumes Platform Services rather than implementing separate infrastructure.

## Status

✅ Accepted

---

# ADR-027

## Decision

Oracle grows through reusable Platform capabilities.

## Reason

Long-term maintainability is achieved by strengthening shared Platform systems rather than repeatedly introducing isolated feature implementations.

## Consequence

Future development prioritises:

- Platform
- Services
- Applications
- Extensions
- Game Integrations

over feature-specific architecture.

## Status

✅ Accepted

---

# ADR-028

## Decision

Desktop host truth crosses Platform boundaries as immutable, serializable,
versioned snapshots and events.

## Reason

Electron controllers and native Windows objects are implementation details.
Companion context, diagnostics, recovery and future consumers require stable
data without mutable controller coupling.

## Consequence

The Desktop Host Snapshot Coordinator owns the latest snapshot. Host events
describe snapshot capture and clearing. Consumers receive data contracts rather
than Electron objects. Contract versions change only when serialized schemas
require consumer changes.

## Status

✅ Accepted and implemented in Sprint 12.1

---

# ADR-029

## Decision

The Desktop Timeline is the authoritative in-process chronological record;
Desktop Telemetry is a derived view over that Timeline.

## Reason

Independent metric counters would duplicate diagnostic and recovery truth and
could drift from the events they claim to summarize.

## Consequence

Host events, diagnostics and recovery lifecycle updates enter one ordered,
bounded Timeline. Telemetry stores no duplicate source history and can be
reproduced from the same Timeline input.

## Status

✅ Accepted and implemented in Sprint 12.1

---

# Future Decision Records

Every significant architectural decision should be documented before implementation whenever practical.

Decision Records should explain:

What was decided.

Why it was decided.

The long-term consequences.

Current status.

The goal is to preserve Oracle's architectural reasoning for future developers.

When uncertainty exists...

Read the Decision Records before introducing architectural change.
