# ORACLE PROJECT VISION

**Status:** Active
**Purpose:** Explain what Oracle is being built to become and why

---

# What Are We Building?

Oracle is a long-term AI gaming-intelligence platform designed to help players
improve across multiple games.

Oracle is not an overlay product, a Call of Duty tool or a collection of
game-specific features. The Desktop Companion is one Oracle Application, and
Call of Duty is one possible Game Integration. Neither defines the Platform.

Oracle is being built so that shared intelligence, memory, lifecycle,
orchestration, event, telemetry and other reusable capabilities can support
many applications and games without redesigning the foundation for each one.

---

# Why Are We Building It?

Players generate useful evidence every time they play, but conventional tools
often reduce that evidence to isolated statistics. Oracle exists to turn it
into durable understanding: what a player does, why patterns emerge, what may
happen next and how the player can improve.

The intended outcome is not dependence on software. Oracle should help players
build knowledge, judgment and better habits that persist beyond a single
Session, Application or game.

---

# The Product Model

Oracle grows through four deliberately separated layers:

```text
Oracle Platform
        |
        v
Oracle Services
        |
        v
Oracle Applications
        |
        v
Game Integrations
```

- **Oracle Platform** owns shared infrastructure, orchestration, intelligence,
  memory, lifecycle, events, telemetry and reusable capabilities.
- **Oracle Services** expose reusable, game-agnostic business capabilities.
- **Oracle Applications** deliver Oracle experiences across desktop, web,
  mobile and other clients.
- **Game Integrations** contain game-specific knowledge and connect supported
  games to Oracle through explicit contracts.

Applications must not absorb game-specific knowledge. Game Integrations must
not own Oracle Applications. New games should extend Oracle through integration
boundaries rather than require a Platform redesign.

---

# The Long-Term Standard

Oracle is intended to become a multi-year commercial platform capable of
supporting:

- multiple Oracle Applications
- multiple intelligence and AI capabilities
- multiple supported games
- millions of players
- large engineering teams working through stable ownership boundaries

Engineering decisions must therefore be judged beyond the immediate feature.
They should improve maintainability, extensibility, observability, safety and
architectural clarity while preserving working product value.

When several approaches are valid, prefer the smallest change that extends an
existing authoritative system and remains useful across Applications and Game
Integrations.

---

# Vision Is Not Implementation Status

This document describes Oracle's enduring product identity. It does not claim
that every described capability or scale target is implemented today.

Use the following authority and status sources:

- `ORACLE_PLATFORM_CONSTITUTION.md` defines binding product and architectural
  rules.
- accepted ADRs in `Decisions.md` record architectural decisions.
- `architecture/IMPLEMENTATION_STATUS.md` records what the repository currently
  implements.
- `Roadmap.md`, the Master Build Plan and Sprint documents describe planned
  delivery and must not be mistaken for completed functionality.

---

# Guiding Question

Before changing Oracle, ask:

> Does this strengthen a reusable gaming-intelligence platform, or does it
> optimise one Application or game at the expense of Oracle's long-term
> architecture?

Oracle should always become easier to extend without becoming harder to
understand.
