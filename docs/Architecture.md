# ORACLE ARCHITECTURE

**Authority:** Canonical description of Oracle's current designed architecture beneath the Constitution and accepted ADRs
**Scope:** Technical structure, runtime flow, subsystem responsibilities and integration boundaries
**Owner:** Oracle Architecture
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever accepted architecture or verified integration boundaries change
**Supersedes:** Earlier current-architecture descriptions; historical baselines remain preserved
**Superseded By:** None
**Last Reviewed:** 24 July 2026
**Version:** 5.5

---

# Purpose

This document defines Oracle's technical architecture.

Its purpose is to describe how Oracle is structured, how intelligence flows through the platform, and how future systems should integrate without requiring architectural redesign.

The Founding Charter owns institutional purpose. The Constitution and accepted
ADRs own binding architectural rules. The Engineering Principles and Oracle
Strategy provide compliant engineering and operational direction. This document
describes the resulting production architecture without redefining those
authorities.

It answers one question.

**How does Oracle work?**

For the current verified delivery state, read
`docs/architecture/IMPLEMENTATION_STATUS.md`. Historical readiness statements
later in this document describe the milestones at which they were written and
must not be treated as the current sprint board.

---

# Architectural Vision

Oracle is the Operator Intelligence Platform for supported gaming
environments.

The Operator is Oracle's durable subject. Games provide performance context,
semantics and reviewed knowledge through Game Integrations. Oracle builds
longitudinal understanding only from permitted, admitted and governed
information.

Oracle is designed as a platform rather than a single application.

The Platform provides shared infrastructure that powers every Oracle experience across desktop, web, mobile and future clients.

Games do not define Oracle.

Games extend Oracle.

Applications do not own intelligence.

Applications consume Oracle Services.

Services consume Platform capabilities.

Every new capability should strengthen the Platform rather than introducing parallel architectures.

The Platform is designed to support unlimited future games, applications, services and extensions without architectural redesign.

---

# Architectural Principles

Oracle follows seven structural architectural principles and one governing
lifecycle principle.

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

## Governing Lifecycle Principle — Trust and Promotion First

Optional Observation, Evidence admission, Understanding eligibility and Memory
retention are separate decisions. Promotion is never automatic, and no
downstream system may bypass an upstream trust or promotion boundary.

Not every Observation becomes Evidence. Not every Evidence becomes
Understanding. Not every Understanding becomes Memory.

“Intelligence First” means intelligence precedes presentation after the
applicable trust and eligibility gates. It does not mean intelligence precedes
Operator control.

---

## Governing Delivery Lifecycle Principle

Implemented, Certified, Deployed and Activated are independent states.
Certification may use the canonical future migration chain in disposable
production-equivalent environments without changing the approved production
baseline. Deployment does not grant runtime activation authority.

This distinction preserves normal additive migration history while keeping
production gates and runtime controls explicit.

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

# Oracle Platform Layer Model

Oracle Platform
│
├── Intelligence Runtime
├── Companion Runtime
├── Extension Runtime
├── Capability Graph
├── Platform Bootstrap
├── Application Registry
├── Service Registry
└── Shared Contracts

↓

Oracle Services

↓

Oracle Applications

↓

Game Integrations

---

# Internal Platform Runtime

The Oracle Platform internally executes intelligence through a shared runtime.

This runtime remains implementation detail rather than product architecture.

Its responsibility is to execute intelligence safely, deterministically and consistently regardless of which Oracle Application requested the capability.

The runtime currently consists of:

• Oracle Context
• Engine Runtime
• Intelligence Bus
• Oracle Brain
• Decision Intelligence
• Capability Graph
• Companion Runtime

---

# High-Level Architecture

Before the current runtime-specific architecture, Oracle applies this governed
Operator Intelligence lifecycle:

```text
Authenticated Operator and approved policy
        ↓
Trust and purpose-specific control
        ↓
Permitted transient Observation
        ↓
Authoritative source truth
        ↓
Minimal admitted Evidence reference
        ↓
Candidate and declared Understanding
        ↓
Eligibility, explanation and scope
        ↓
Selective Memory
        ↓
Purpose-scoped Oracle Context
        ↓
Specialised Behavioural Intelligence
        ↓
Guidance and Operator action
        ↓
Outcome reassessment
        ↓
Prediction and longitudinal refinement
```

This is the governed product lifecycle, not the current production runtime or
a mandatory synchronous engine sequence. Later runtime activation remains
governed by the Engineering Programme. Oracle Platform v0.9 has runtime
persistence disabled.

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

# Operator Understanding and Game Context

Oracle reasons across two different forms of context:

- **Operator Understanding** is longitudinal, personal, purpose-scoped,
  governed and revisable.
- **Game Context** is environmental, Session-bound or integration-scoped and
  interpreted by its Game Integration.

Neither absorbs the other. Game Context may support Operator Understanding only
through admitted Evidence and approved scope. Operator Understanding does not
grant shared Services authority to reinterpret game-specific meaning.

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
- Behaviour Engine
- Trend Engine
- Prediction Engine
- Mission Engine
- Memory Engine
- Behaviour Evolution Engine
- Adaptive Coaching Engine
- Planner Engine
- Operator Profile Engine
- Contextual Intelligence Engine

Governed Memory is selective retention, reassessment, decay and removal of
eligible Understanding. The current `memoryEngine` derives a runtime pattern
profile from historical Sessions and may later contribute candidate signals;
it is not the durable Memory authority and its output is not automatically
retained Understanding.

The current Prediction Engine produces a bounded near-term performance
forecast from existing Trend output. It must not be described as mature
longitudinal Operator prediction until later governed Understanding, Guidance
outcome and reassessment evidence exist.

Additional future engines may include:

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

Within the Oracle Intelligence pipeline, recommendations belong to Decision
Intelligence. Companion Guidance recommendations separately follow ADR-032's
versioned Guidance contract and ownership boundary; they do not turn Signals
into recommendations or replace Decision Intelligence.

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

Decision Intelligence remains the recommendation owner within the Oracle
Intelligence pipeline. Companion Guidance is the separate, constitutionally
external recommendation model established by ADR-032 for the Companion
Application.

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
- modify or read protected game memory
- hook game functions or rendering pipelines
- patch executables
- bypass or interfere with anti-cheat systems
- automate gameplay or player input
- simulate user input
- implement techniques intended to gain an unfair competitive advantage
- reveal hidden competitive information

Oracle operates exclusively as an external companion platform. Game
Integrations provide only safe external detection and immutable, serializable
game context. Any proposed feature that requires a prohibited technique is an
architectural blocker and must be escalated rather than implemented. Core
Principle 13 of the Oracle Platform Constitution is the normative rule.

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

The canonical durable engineering principles are defined in
`docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md`. Architecture applies those
principles within the constraints of the Oracle Platform Constitution and
accepted ADRs; it does not maintain a competing principle set.

---

# Desktop Platform Architecture

Sprint 12.1 added a desktop-specific Platform flow under `desktop/`:

```text
Electron Host State
        ↓
Immutable Desktop Host Snapshot
        ↓
Versioned Host Event Stream
        ├──→ Desktop Diagnostics
        │         ↓
        │     Desktop Recovery
        ↓         ↓
Unified Desktop Timeline
        ↓
Derived Desktop Telemetry
```

`CompanionHostWindowController` coordinates this flow. The Snapshot
Coordinator owns the latest desktop snapshot; the Companion Session Manager
owns Session lifecycle and the current desktop Companion Context. Timeline is
the chronological source for Telemetry. These services exchange serializable
data and do not expose Electron objects through their contracts.

The renderer-accessible boundary remains `OracleDesktopBridge` from
`desktop/contracts.ts`. Desktop Platform API version 1 freezes the newer
versioned data contracts behind the sole supported external import surface at
`desktop/platform/index.ts`. The API manifest and compatibility policy exclude
services, controllers, Electron objects and native implementation details.

# Sprint 13 Game Integration Vertical Slice

Sprint 13 connects the established Game Integration and desktop Companion
foundations without changing Desktop Platform API version 1:

```text
External Window Discovery
        ↓
Deterministic Game Integration Evaluation
        ↓
Game-Agnostic Desktop Coordinator
        ↓
Authoritative Companion Attachment Lifecycle
        ↓
Immutable Session-owned Game Context
        ↓
Renderer-safe Companion Presentation
```

Detection has three deterministic outcomes: not detected, detected and
ambiguous. Ambiguous matches preserve registry and evaluator ordering and never
produce an arbitrary selection. Failure in one integration does not prevent
the remaining integrations from being evaluated.

The Companion lifecycle remains the sole attachment authority. Discovery and
attachment work is serialized and obsolete runs are invalidated before their
results can change newer state. Detach, process loss and shutdown clear stale
game context. Reattachment reuses the active Session, while process replacement
clears the previous attachment before installing context from the exact
integration that selected the replacement process.

The Session Manager remains the sole Session-state authority. It accepts only
safe serializable game context, applies total replacement semantics and clones
both incoming context and returned snapshots. No detector, executable
reference, integration instance or mutable integration-owned object crosses
that boundary.

The renderer receives one validated presentation contract for both initial
reads and subscription events. It contains only status, a UTC ISO 8601 capture
timestamp and minimal active-game identity. The additive preload bridge is
separate from Desktop Platform API version 1 and grants no lifecycle mutation
authority.

Call of Duty-specific executable and title evidence remains exclusively inside
the Call of Duty Game Integration. Detection contracts, lifecycle coordination,
Session ownership and presentation are shared, game-agnostic capabilities.

# Sprint 14 Companion Intelligence Foundation

Sprint 14 establishes the reusable external Companion Guidance architecture:

```text
Immutable authoritative Session projection
        ↓
Platform Guidance contracts and validation
        ↓
Services-owned deterministic provider orchestration
        ↓
Applications-owned immutable presentation state
        ↓
React `/companion` presentation

Game Integrations contribute reviewed knowledge packages through the shared
contracts and provider boundary.
```

Platform / Companion Foundation owns contract identity, versioning,
compatibility, validation and deep immutability. Services discover providers
only through explicit dependency injection, evaluate eligibility, execute in
stable injection order, validate every output and isolate failures as structured
diagnostics. Services do not rank, personalise or make coaching decisions.

Applications project validated Service results into stable Guidance Card view
models and Operator-safe diagnostics. React renders only those Application
models, preserves their order and explicitly represents loading, ready, empty,
partial-success and unavailable states. The production route currently uses an
honest Applications-owned unavailable state and invents no data.

The Call of Duty integration contributes the first curated, source-attributed
package. Its game knowledge remains isolated in Game Integrations; it introduces
no alternate contract, orchestration or presentation path. Future curated,
AI-generated, performance, clip, Session-coaching and long-term Operator
development guidance must extend the same Guidance contract.

The Foundation consumes only immutable projections of authoritative Session
Context and has no Session mutation or lifecycle authority. It remains entirely
external: no injection, game-memory access or modification, hooks, automation,
input simulation or anti-cheat interaction is permitted. The Constitution is
the permanent authority; ADR-032 records why Guidance uses this architecture.

Authoritative live runtime delivery remains deliberately deferred. Sprint 15
architectural review placed the Operator Understanding Foundation ahead of
that work. The desktop composition root does not yet create Guidance Requests
from authoritative Session Context, invoke the Provider Service or deliver
resulting Application state through a renderer-safe boundary. Live Guidance
delivery requires a separate future plan and approval.

# Sprint 15 Phase 1 Operator Ownership Foundation

Sprint 15 Phase 1 establishes authenticated ownership as the mandatory entry
point for current-Operator access:

```text
Supabase Auth Account
        ↓
operator_account_bindings
        ↓
Operator Repository
        ↓
Operator Service
        ↓
Approved Application consumers
```

Authentication remains owned by Supabase Auth. An Account is not an Operator,
and the binding relation does not merge credentials with Operator identity.
`operator_account_bindings` records one Account-to-one Operator ownership
without replacing existing Operator identifiers.

Repositories own database access. The Operator Service owns authenticated
current-Operator resolution and commissioning orchestration. Applications do
not receive repository authority. Production, local development and test
environments follow the same authenticated rule; there is no shared development
Operator or first-row fallback.

Row Level Security protects `operator_account_bindings`, `operators`,
`oracle_sessions` and `operator_achievements`. Policies derive access from
`auth.uid()` through the binding relation. Anonymous grants are revoked, and
authenticated grants expose only the operations required by the approved
Repository boundary.

The migration preserves historical truth. It does not assign ownership to
existing data without evidence, and unowned historical Sessions remain
unowned and inaccessible through authenticated Operator scope.

Two dedicated authenticated principals, two Operators, their one-to-one
bindings and one Session per Operator remain deployed as permanent verification
fixtures. They are reserved exclusively for migration, ownership, RLS,
authentication and security regression testing and must not be consumed as
product data.

This foundation does not implement Understanding contracts, intelligence
claims, Memory lifecycle changes, Operator-control services or Oracle Context
projection. Those remain separately planned production objectives requiring
explicit approval; they are not implicitly active under historical Sprint 15.

# Sprint 15 Phase 2 Operator Understanding Contracts

Sprint 15 Phase 2 establishes Oracle's durable, game-agnostic contract language
for understanding an Operator:

```text
Authoritative source truth
        ↓
Minimal Evidence reference
        ↓
Suspected candidate claim
        ↓
Policy, scope and confidence assessment
        ↓
Inferred accepted claim revision
        ↓
Immutable purpose-scoped Understanding Snapshot
```

Known, Declared, Observed, Inferred, Suspected and Unknown are structural
epistemic classes. They describe how information is known and do not replace
confidence. Evidence quality, producer-native confidence and accepted claim
confidence remain separate values with separate ownership.

Raw evidence remains with its authoritative owner. Operator Intelligence owns
only minimal Evidence references, support or contradiction links, claims and
revisions. Derived Graph, Timeline, Brain and Explainability projections do not
become additional evidence merely because they represent the same source.

Every accepted inferred claim revision owns a concise, versioned,
evidence-backed explanation produced by an identified deterministic template.
The explanation is immutable with its revision and is propagated unchanged;
presentation and Explainability layers do not reconstruct or rewrite it.

Claim and declaration lifecycles validate candidate, active, disputed,
corrected, superseded, withdrawn, expired and deleted outcomes as applicable.
Revisions are monotonic and explicitly identify the prior revision. Deletion
uses content-free tombstones. Validity and reassessment are distinct from later
retention-policy execution.

Every Evidence reference and claim has Operator, Application, Game Integration
or Session scope. Game- and Session-scoped evidence cannot become
Operator-wide understanding without a separately approved portability policy.
Sensitive and AI-generated inference is not representable through the approved
contracts.

`OperatorUnderstandingSnapshot` is a deeply immutable, versioned and
purpose-scoped read projection. Identity, Preferences, Goals, State, Memory,
Intelligence and Unknown information remain separate sections. The Snapshot is
not persistence, a generic profile or a source of truth.

Operator Declaration Service, Operator Intelligence Service and Operator
Understanding Service are interface-only ownership boundaries in Phase 2.
`OperatorUnderstandingService` exposes only authenticated current-Operator
projection semantics; it does not accept an arbitrary Application-supplied
Operator identifier. No Phase 2 Service is registered into production runtime.

Phase 2 does not implement Repositories, migrations, engine adapters, candidate
generation, Context projection, personalisation consumption, control
operations or UI. Existing intelligence engines and verified contracts remain
unchanged.

# Sprint 15 Phase 3 Operator Intelligence Persistence

Phase 3 makes the evidence-derived portion of Operator Understanding durable
without persisting the Understanding projection itself:

```text
Authenticated Account
        ↓
Operator Service
        ↓
Operator Repository
        ↓
Operator Intelligence Service contract
        ↓
OperatorIntelligenceRepository
        ↓
Operator-owned policy, Evidence, claim and eligibility records
```

The persistence model contains six relations:

1. `operator_data_policy_versions` stores immutable, versioned policy
   references for one Operator.
2. `operator_intelligence_evidence` stores minimal Evidence-reference
   contracts, not raw Session or prompt content.
3. `operator_intelligence_claims` owns stable claim identity and the current
   immutable revision pointer.
4. `operator_intelligence_claim_revisions` stores the versioned claim body,
   confidence, provenance, scope, temporal validity and deterministic
   explanation. Revisions are append-only.
5. `operator_intelligence_claim_evidence` stores support or contradiction
   relationships between one revision and same-Operator Evidence.
6. `operator_intelligence_eligibility_assessments` stores append-only,
   purpose-specific eligibility history independently of revision validity.

Composite foreign keys carry `operator_id` across policies, Evidence, claims,
revisions, links and eligibility. This prevents a valid child record from
referencing another Operator's aggregate. RLS independently resolves access
through `operator_account_bindings`; authenticated callers receive read-only
table grants and may write only through narrow atomic functions that repeat
the ownership check. Applications and engines do not own these functions or
tables.

`SupabaseOperatorIntelligenceRepository` is the sole application-code owner of
the Phase 3 persistence relations. It validates inputs and reconstructed
outputs through the immutable Phase 2 contract factories. Evidence source
truth remains with its existing Repository, engine or Game Integration owner;
only the approved reference is durable here.

The migration is additive and preserves existing Operator identifiers,
Sessions, bindings and unowned historical Sessions. It has passed exact
rollback execution, independent catalog verification and transactional
authenticated-isolation checks. It is not permanently deployed and requires a
separate founder-approved deployment gate.

No Operator Intelligence Service implementation is registered at runtime.
Phase 3 produces no real candidate, performs no cross-game promotion, persists
no `OperatorUnderstandingSnapshot`, changes no Oracle Context, and adds no
Application or UI consumption. Those remain later explicitly approved phases.

# Sprint 17 Scale-Safe Trust Data Plane

Sprint 17 hardens the existing Service/Repository/database boundary without
changing its ownership. Current eligible claims, claim lifecycle and
eligibility history use bounded Repository operations with maximum 100-item
pages. Purpose and scope are applied in PostgreSQL before the page limit. An
opaque versioned cursor binds Operator, purpose, scope, as-of time, keyset
position and an immutable PostgreSQL snapshot watermark.

Migration 009 maintains immutable claim-head events as a read projection. The
projection does not become a second authority: accepted immutable claim
revisions remain authoritative, and the projection is written atomically by
the same service-role function. Scoped and unscoped page indexes are retained
only because production-shaped plans select them and remove measured
whole-history scans and disk spills.

Exact Evidence admission, claim-revision and eligibility retries return their
original durable result. Same-identity changes fail immutably; competing heads
return typed stale outcomes. Shared transaction advisory locks preserve consent
and Evidence-disposition trust decisions across concurrent eligibility writes.

Page responses are limited to 512 KiB, reconstructed claims to 32 Evidence
references, and the inactive Snapshot contract to 100 intelligence claims,
250 total items and 512 KiB. These budgets do not activate Snapshot construction
or consumption.

The Repository remains the exclusive persistence owner, Services retain
business behaviour, and Applications remain presentation-only. No producer,
consumer, control path, cache, alternate persistence path or Platform runtime
was activated. Migration 009 is deployed and verified as the production
persistence foundation; deployment did not activate its runtime use.

# Verified Integration Limits

- the direct `analyseFight`, clip-upload, hard-coded Call of Duty Session,
  Combat Rating and game-statistics paths are legacy product paths;
- their continued presence does not make game analysis Oracle's architectural
  centre;
- they must not be expanded into new Operator Intelligence authority;
- their migration belongs to later approved Session Intelligence and Unified
  Product Experience Sprints;
- Web and Electron source entry points invoke target-specific ADR-040
  composition roots that construct one shared dependency-injected Platform
  runtime.
- Immutable versioned manifests are canonical and are mechanically compared
  with the constructed Service, Application, Game Integration and Guidance
  inventories before readiness.
- Service and Application registries are instance-owned metadata foundations;
  web pages do not consistently consume them as runtime boundaries.
- several web pages call repositories, pipelines or engines directly.
- `/companion` exists and renders immutable Application state, but the Electron
  composition root still loads `/oracle` and does not yet deliver authoritative
  live Guidance state to the Companion route.
- `lib/companion` owns Platform capability readiness while
  `desktop/companion` retains Session and Context authority under an explicit
  non-merging lifecycle contract.
- curated Guidance source freshness remains manually governed, and production
  runtime data has not exercised ready and partial-success presentation paths.

These are audit findings. They do not invalidate verified systems or authorise
architectural redesign.

# Historical Production Readiness

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

# Platform Growth

Oracle grows by adding:

• Services
• Applications
• Game Integrations
• Extensions

The Platform itself should rarely require modification.

New capabilities should register with existing Platform systems rather than introducing parallel implementations.

This allows Oracle to evolve from supporting one game into supporting an unlimited ecosystem of games without changing its architecture.

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

## Version 5.5

Operator-first governance reconciliation.

Clarified:

- Oracle is an Operator Intelligence Platform;
- games are governed performance contexts;
- Trust and promotion precede downstream intelligence;
- Observation, Evidence, Understanding and Memory remain distinct;
- promotion is never automatic;
- Operator Understanding and Game Context retain separate authority;
- current Memory and Prediction engines do not imply mature longitudinal
  Memory or Prediction; and
- the four-layer architecture remains unchanged.

---

# Closing Statement

## Sprint 19 Account and Operator Identity Boundary

Supabase Auth owns Account credentials and verification. Email + Password is
canonical; optional Magic Link and Passkey adapters supplement the same
verified Account. OAuth remains a future adapter. Proxy may perform optimistic
routing, but Server Components and Server Actions repeat authenticated,
verified Account checks at data and mutation boundaries.

Operator identity remains `operators.id`. Display Name and Callsign are
presentation attributes and never own Intelligence, progression or history.
Display Name is non-unique and freely mutable. Callsign is globally unique
under case-insensitive comparison while preserving selected display case.
Initial Callsigns use an ASCII-only policy to exclude Unicode homoglyphs.

The Operator Repository remains the sole durable identity boundary. Migration
011 owns atomic first provisioning. Additive Migration 012 owns Callsign
uniqueness, reserved and prohibited policy data, three renewable change
tokens, 12-month quarantine, generated Callsigns, Display Name projection and
deletion capture. Neither migration is deployed or activated.

Desktop credential custody remains a main-process concern. Passwords are
never accepted by desktop storage. Only an OS-encrypted refresh token,
trusted-device metadata and required identifiers may persist; access tokens
remain in memory and credential values never cross the preload bridge.

Oracle is no longer being built as a traditional gaming application.

Oracle is an Operator Intelligence Platform.

The production architecture has been established.

The first major capability expansion has been successfully completed.

Future development should strengthen Oracle through additional intelligence, richer reasoning and reusable capabilities while preserving the architectural principles defined in this document.

**Extend the architecture.**

**Protect the architecture.**

**Improve the Operator.**

---

**Current status:** See `docs/architecture/IMPLEMENTATION_STATUS.md`.

The original Version 4 milestone was production-ready for its documented
scope. It is not a statement that Sprint 12.1 closure gates have passed.

---

*"The architecture should become more capable, not more complicated."*

**The Oracle Has Spoken.**
