# ORACLE CONTEXTUAL INTELLIGENCE

Subsystem Architecture

Version 1.0

Last Updated: Sprint 5 Closure

---

# Purpose

This document defines Oracle's Contextual Intelligence subsystem.

Contextual Intelligence allows Oracle to understand what the Operator is currently trying to accomplish and surface intelligence that is relevant to that context.

Oracle does not play the game.

Oracle does not automate gameplay.

Oracle provides intelligence.

---

# Architectural Position

Contextual Intelligence sits inside Oracle's intelligence architecture.

It does not replace Oracle Context.

It does not replace the Intelligence Bus.

It does not replace Decision Intelligence.

It extends the existing architecture.

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
Decisions
      ↓
Intelligence Bus
      ↓
OracleIntelligenceState
      ↓
Presentation Components