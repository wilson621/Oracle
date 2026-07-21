# THE ORACLE PLATFORM CONSTITUTION

**Authority:** Highest product and architectural authority within the Oracle Founding Charter
**Scope:** All Oracle products, Platform code, Services, Applications, Game Integrations, extensions and product architecture
**Owner:** Oracle Constitutional Governance
**Status:** Active
**Classification:** Stable
**Expected Stability:** Changes only through explicit constitutional amendment
**Supersedes:** Lower-authority product and architectural rules where conflict exists
**Superseded By:** None
**Last Reviewed:** 21 July 2026
**Established:** Sprint 8  
**Last Amended:** Sprint 13 closure — 21 July 2026

---

# Mission Statement

> **Oracle is the operating platform for gaming intelligence.**

Oracle exists to understand games, understand players and deliver intelligent, context-aware assistance through a unified and extensible platform.

---

# Vision Statement

> **To augment every player's gaming experience through intelligent, context-aware assistance across every supported game.**

Oracle should become a natural part of the gaming experience: a platform that players launch because they are gaming, rather than because they are playing one particular title.

---

# Oracle Identity

Oracle is not:

- A Call of Duty application
- A single-game assistant
- A gameplay overlay with isolated features
- A collection of unrelated gaming tools
- A game automation system
- A replacement for the player

Oracle is:

- A universal gaming intelligence platform
- A system for understanding players
- A system for understanding supported games
- A provider of personalised intelligence
- An extensible platform for Oracle Applications
- A foundation for game integrations and future extensions
- A safe, independent companion that assists without controlling gameplay

---

# Product Architecture

Oracle is organised into four primary layers.

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

Each layer has a distinct responsibility.

---

# Layer 1 — Oracle Platform

The Oracle Platform provides the shared foundation.

It owns:

- Intelligence Runtime
- Engine Runtime
- Intelligence Bus
- Extension Runtime
- Extension Resolver
- Capability Graph
- Companion Runtime
- Service Registry
- Application Registry
- Platform Bootstrap
- Shared contracts
- Shared lifecycle management
- Shared diagnostics
- Shared validation
- Shared health assessment

The Platform coordinates systems.

The Platform does not own game-specific knowledge.

---

# Layer 2 — Oracle Services

Oracle Services provide reusable capabilities.

Examples include:

- Operator
- Sessions
- Missions
- Planner
- Memory
- Progression
- Reports
- Intelligence
- Predictions
- Behaviour analysis
- Trend analysis

Services are reusable across multiple Oracle Applications.

Services must not depend on presentation.

Services must not contain page-specific or component-specific behaviour.

---

# Layer 3 — Oracle Applications

Oracle Applications are customer-facing Oracle experiences.

Examples include:

- AI Coach
- Oracle Brain
- Loadouts
- Reports
- Career
- Companion
- Operator
- Intelligence
- Missions
- Future desktop, web, mobile and voice applications

Applications orchestrate Oracle Services.

Applications own the user experience.

Applications must not duplicate intelligence already owned by Services or Engines.

The following names and identities belong to Oracle and must remain Oracle product concepts:

- AI Coach
- Oracle Brain
- Loadouts
- Companion
- Reports
- Career
- Operator
- Intelligence
- Missions

They must not become permanently owned or branded by any individual game integration.

---

# Layer 4 — Game Integrations

Game Integrations provide game-specific knowledge and context.

Examples may include:

- Call of Duty
- Battlefield
- RuneScape
- Minecraft
- Elden Ring
- Factorio
- Football Manager
- Monster Hunter
- Future supported games

A Game Integration may provide:

- Game identity
- Weapons
- Equipment
- Maps
- Quests
- Objectives
- Collectibles
- Characters
- Items
- Game rules
- Telemetry
- Match context
- Discovery data
- Knowledge
- Supported screen regions
- Official API data
- Permitted visual observations

Game Integrations do not own Oracle Applications.

Call of Duty may provide data to Loadouts and AI Coach, but it does not own Loadouts or AI Coach.

The same Oracle Applications must be capable of working with other supported games through their respective integrations.

---

# Core Principle 1 — Platform First

> Oracle is a platform before it is an application.

New functionality must strengthen or correctly consume the Oracle Platform.

A feature must not create a parallel architecture when an existing Platform contract can own the responsibility.

---

# Core Principle 2 — Game Agnostic by Default

> No game-specific logic belongs in the shared Oracle Platform.

Shared runtimes, registries, services and applications must remain game agnostic.

Game-specific behaviour belongs inside Game Integrations or explicitly scoped game extensions.

A named game may be used as an example, but it must never become the architectural assumption.

---

# Core Principle 3 — Oracle Owns the Experience

> Oracle Applications belong to Oracle.

AI Coach remains Oracle AI Coach.

Loadouts remains Oracle Loadouts.

Oracle Brain remains Oracle Brain.

Companion remains Oracle Companion.

Game Integrations contribute context and knowledge but do not redefine Oracle's customer-facing product identity.

---

# Core Principle 4 — Integrations Supply Knowledge

> Game Integrations provide knowledge, rules, context and supported capabilities.

Integrations must not:

- Replace the Oracle Platform
- Own Oracle Applications
- Duplicate shared Oracle intelligence
- Control unrelated applications
- Introduce hidden cross-system dependencies

---

# Core Principle 5 — Services Before Applications

> Applications orchestrate Services. Services do not depend on Applications.

Reusable logic belongs in Services, Engines or other approved Platform components.

Page-specific orchestration belongs in Applications.

Presentation must never become the owner of business logic.

---

# Core Principle 6 — Intelligence Is Presentation-Independent

> Oracle Intelligence must remain independent of how it is displayed.

The same intelligence may be consumed by:

- Oracle Web
- Oracle Companion
- Oracle Mobile
- Oracle Voice
- Oracle Studio
- Future clients

Engines and Services must not contain assumptions about one presentation surface.

---

# Core Principle 7 — Capabilities Over Implementations

> Oracle resolves what can provide a capability rather than hard-coding one implementation.

Applications should request required capabilities.

The Platform should determine which installed and compatible integration or extension can provide them.

Capability resolution must remain explicit, inspectable and testable.

---

# Core Principle 8 — Contracts Over Coupling

> Oracle systems communicate through explicit, typed and versioned contracts.

Hidden dependencies are prohibited.

Shared mutable global state should be avoided.

Imports must respect architectural ownership.

Cross-layer access must occur through approved contracts.

---

# Core Principle 9 — Everything Has a Lifecycle

> Every runtime, engine, extension, service, application and integration must have an explicit lifecycle where appropriate.

Lifecycle stages may include:

- Discovered
- Registered
- Validated
- Resolved
- Loaded
- Initialised
- Running
- Paused
- Suspended
- Stopped
- Failed
- Unloaded

Lifecycle transitions must be deliberate and observable.

---

# Core Principle 10 — Single Ownership

> Every capability has one authoritative owner.

Examples:

- Behaviour intelligence belongs to Behaviour Engine.
- Trend intelligence belongs to Trend Engine.
- Prediction belongs to Prediction Engine.
- Mission generation belongs to Mission Engine.
- Extension activation belongs to Extension Runtime.
- Application identity belongs to Application Registry.
- Game-specific knowledge belongs to Game Integrations.

No subsystem may silently reproduce another subsystem's calculations.

---

# Core Principle 11 — Immutable Context

> Shared context is constructed and consumed, not mutated unpredictably.

OracleContext and CompanionContext represent structured knowledge available at a specific time.

Downstream systems may derive new outputs but must not silently alter upstream truth.

---

# Core Principle 12 — Assistance, Never Automation

> Oracle assists the player. Oracle does not play on behalf of the player.

Oracle Companion must never:

- Inject code into a game process
- Modify game memory
- Read protected process memory
- Hook rendering pipelines
- Automate combat
- Automate movement
- Automate aiming
- Simulate gameplay input
- Control the player's mouse or keyboard
- Circumvent anti-cheat systems
- Manipulate network traffic
- Provide prohibited competitive information

---

# Core Principle 13 — External Companion Architecture

> Oracle operates exclusively as an external companion platform.

Game Integrations may provide only safe, external detection and immutable,
serializable game context. They must not expose process handles, executable
objects, detector implementations, mutable integration instances or other
in-process capabilities through shared Oracle contracts.

Oracle and every Oracle extension, Service, Application and Game Integration
must never:

- Inject into a game process
- Modify or read protected game memory
- Hook game functions or rendering pipelines
- Patch game executables
- Automate gameplay or player input
- Simulate user input
- Bypass, evade or interfere with anti-cheat systems
- Implement techniques whose purpose is to gain an unfair competitive
  advantage

Any proposed feature that requires one of these techniques is an architectural
blocker. It must remain unimplemented and be escalated for architectural review;
delivery scope, user demand or integration-specific convenience cannot override
this rule.

The intended Companion presentation model is:

- Borderless
- Transparent
- Click-through by default
- Always on top when enabled
- Independently hideable
- Interactive only when deliberately toggled
- Designed primarily for borderless and windowed game modes
- Multi-monitor aware
- DPI aware

Oracle sits above the game through an independent desktop window.

It does not operate inside the game.

---

# Core Principle 14 — Safety Before Coverage

> Oracle must favour player safety and account protection over feature availability.

A game must not be declared supported until its compatibility position has been reviewed.

Where game rules, publisher policies or anti-cheat restrictions are unclear, affected functionality must remain disabled.

Universal support must never be claimed without evidence.

---

# Core Principle 15 — Privacy by Design

> Oracle processes only what is required for enabled functionality.

Desktop observation must be:

- User enabled
- Clearly disclosed
- Pausable
- Scoped where technically possible
- Protected by appropriate retention controls
- Excluded from unrelated desktop content where possible

Sensitive data must not be collected merely because it is technically accessible.

---

# Core Principle 16 — Build Once, Use Everywhere

> Shared Platform capabilities should be reusable across Oracle Applications and supported games.

An improvement to Oracle Intelligence should benefit every compatible application.

An improvement to Companion Runtime should benefit every supported integration.

A shared solution is preferred over duplicated game-specific implementations.

---

# Core Principle 17 — Extension-First Growth

> Oracle expands through extensions and integrations rather than repeated modification of the core Platform.

Potential extension types include:

- Game integrations
- Knowledge packs
- Vision packs
- AI modules
- Overlay widgets
- Themes
- Language packs

Extensions must declare:

- Identity
- Version
- Trust level
- Permissions
- Capabilities provided
- Capabilities required
- Conflicts
- Compatibility
- Authorship
- Review status

Extensions do not grant themselves unrestricted access.

---

# Core Principle 18 — Trust Is Explicit

> Every extension and integration must have a visible trust level.

Potential trust levels include:

- Oracle Verified
- Official Developer
- Verified Community
- Community
- Local Development

Trust level must influence review, permissions, installation and runtime policy.

---

# Core Principle 19 — Preserve Working Product Value

> Platform migration must elevate existing functionality rather than discard it.

Existing features such as:

- AI Coach
- Loadouts
- Operator Profile
- Oracle Brain
- Reports
- Sessions
- Missions
- Intelligence

must remain functional during migration.

Working product behaviour must not be rewritten merely to satisfy architectural aesthetics.

Migration should occur incrementally through stable compatibility boundaries.

---

# Core Principle 20 — Visible Value After Foundation

> Once the required foundation exists, development must return to customer-visible value.

Infrastructure must not be built indefinitely.

New foundational work must demonstrate a clear need and enable a defined product outcome.

Beta development must prioritise complete user journeys.

---

# Beta 1 Product Standard

Beta 1 must demonstrate a coherent Oracle experience, not merely isolated technical systems.

The intended experience includes:

```text
Launch Oracle
        │
        ▼
Platform Boots
        │
        ▼
Supported Game Detected
        │
        ▼
Compatible Integrations Resolved
        │
        ▼
Oracle Companion Available
        │
        ▼
Context-Aware Assistance
        │
        ▼
Session Intelligence
        │
        ▼
AI Coach
        │
        ▼
Behaviour • Trend • Prediction
        │
        ▼
Mission • Strategy • Progression
```

Oracle Companion is required for Beta 1.

Companion assists exploration, discovery, navigation, quests, collectibles, puzzles and game knowledge.

Live combat coaching, health warnings and resource warnings are not required Companion responsibilities because AI coaching belongs to Oracle Intelligence and Oracle Applications.

---

# Technology Principle

> Oracle is technology-agnostic but architecture-driven.

Technology must be selected according to responsibility.

Current direction:

- Next.js, React and TypeScript for the web application
- TypeScript for Oracle Platform contracts, runtimes and intelligence
- Supabase/Postgres for persistence
- OpenAI services for appropriate AI capabilities
- A suitable TypeScript desktop shell for Oracle Companion
- Python only where specialist computer vision, machine learning or data processing provides a clear advantage
- Other technologies only where the benefit justifies the added complexity

No technology is adopted merely because it is fashionable.

---

# Engineering Authority

The Founding Charter is Oracle's highest institutional authority. It defines
purpose and enduring commitments but cannot override this Constitution's
product or architectural principles.

The core governance hierarchy is:

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

Lower-level documentation and implementation must not contradict higher-level authority.

Where a conflict exists, the higher-level authority governs until the conflict is formally resolved.

Accepted ADRs preserve specific architectural decisions beneath the
Constitution and Engineering Principles. The Oracle Codex defines operational
engineering standards. Both inform Architecture and neither may override this
Constitution.

Neither Oracle Strategy nor Oracle Engineering Principles may override the
Constitution. Strategy cannot authorise behaviour prohibited here. Founding
documents cannot create or imply a constitutional exception.

Core Principle 13, the External Companion Architecture, remains binding unless
this Constitution itself is formally amended. No Strategy, Roadmap, Sprint,
commercial priority, founding statement or engineering standard may authorise
injection, game-memory access or modification, hooks, gameplay or input
automation, anti-cheat interaction or another prohibited technique.

See `docs/DOCUMENTATION_INDEX.md` for classifications, canonical ownership and
the complete reading order.

---

# Architectural Decision Records

A new ADR is required when a decision:

- Changes a Platform boundary
- Introduces a new runtime
- Introduces a new extension type
- Changes ownership of intelligence
- Changes the lifecycle model
- Introduces a new implementation language
- Changes security or privacy boundaries
- Changes the relationship between Platform, Services, Applications and Game Integrations
- Creates a long-term compatibility obligation

ADRs must explain:

- Context
- Decision
- Alternatives considered
- Consequences
- Risks
- Status

---

# Decision Test

Before approving a major feature or architecture change, ask:

1. Does it strengthen the Oracle Platform?
2. Is it reusable across supported games where appropriate?
3. Does it preserve Oracle's ownership of the experience?
4. Does it keep game-specific knowledge inside integrations?
5. Does it use explicit contracts?
6. Does it preserve safety, privacy and fair play?
7. Does it create visible value or enable a defined product outcome?
8. Does it comply with this Constitution?

If the answer to any critical question is no, the proposal must be redesigned.

---

# Non-Negotiable Rule

> Short-term convenience must never compromise the long-term integrity, safety or identity of the Oracle Platform.

---

# Guiding Statement

Oracle understands games.

Oracle understands players.

Oracle delivers intelligence.

---

# Final Declaration

> **Oracle is the operating platform for gaming intelligence.**

The Platform owns the foundation.

Services own reusable capabilities.

Applications own the Oracle experience.

Game Integrations provide game-specific knowledge and context.

Extensions expand the ecosystem.

Oracle assists without interfering.

Oracle improves the player and enriches the gaming experience across every supported game.

---

# The Oracle Has Spoken
