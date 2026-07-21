# ORACLE ARCHITECTURAL DECISION RECORDS

**Authority:** Accepted architectural decisions beneath the Oracle Platform Constitution and Engineering Principles
**Scope:** Specific architectural decisions, rationale, alternatives, consequences and status
**Owner:** Oracle Architecture
**Status:** Active append-only ledger
**Classification:** Historical
**Expected Stability:** Accepted records are immutable; new decisions or explicit superseding ADRs are appended
**Supersedes:** Earlier ADR ledger versions as an index; individual accepted records retain their own status
**Superseded By:** None
**Last Reviewed:** 21 July 2026
**Version:** 4.5

---

# Purpose

This document records the significant architectural, engineering and product decisions made during the development of Oracle.

Architecture is not only defined by what was built.

It is defined by why it was built.

These decisions preserve the reasoning behind Oracle's evolution and provide context for future development.

Every significant architectural decision should be recorded here.

The ledger is historical and append-only. Existing accepted ADR content is not
rewritten during governance reconciliation. A later decision must append a new
ADR and explicitly identify any record it supersedes.

ADRs may refine Architecture but cannot override the Oracle Platform
Constitution. See `docs/DOCUMENTATION_INDEX.md` for the authority chain and
classification rules.

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

# ADR-030

## Decision

Desktop Platform API version 1 is frozen behind
`desktop/platform/index.ts`, the sole supported public import surface for
external consumers.

The public surface contains only the immutable, serializable Host Snapshot,
Host Event, Diagnostic, Recovery, Timeline Entry and Telemetry Snapshot
contracts declared by `ORACLE_DESKTOP_PLATFORM_API_MANIFEST`. Desktop services,
controllers, builders, coordinators, Electron objects, native helpers and
game-specific knowledge remain internal.

Existing internal desktop imports may continue to use leaf modules to avoid
unnecessary churn. New external consumers must not import leaf modules
directly.

## Reason

The implemented versioned contracts require one deliberate compatibility
boundary before additional consumers are introduced. An explicit barrel and
machine-readable manifest prevent accidental implementation exports, make the
supported surface inspectable and preserve the Platform's serializable-data
boundary.

## Consequence

API version 1 follows the guarantees and change policy in
`desktop/platform/API_COMPATIBILITY.md`. Compatible additions must preserve
existing names, schemas and meanings. Breaking changes require a versioned
migration; Desktop Platform API version 2 requires a new accepted ADR before
implementation.

The restricted renderer `OracleDesktopBridge` remains a separate external
boundary and is not changed by this decision.

## Status

✅ Accepted and implemented in Sprint 12.1 Commit 4

---

# ADR-031

## Decision

Oracle permanently adopts an External Companion architecture. Oracle operates
only through safe mechanisms outside the game process. Game Integrations may
identify supported external windows and provide immutable, serializable game
context; they do not provide in-process access or gameplay-control capability.

Any feature that would require process injection, protected-memory access or
modification, function or rendering hooks, executable patching, gameplay or
input automation, simulated user input, anti-cheat bypass or interference, or
a technique intended to create an unfair competitive advantage is an
architectural blocker. It must be escalated rather than implemented.

## Reason

Oracle exists to assist the Operator without altering the game, replacing
player skill or risking the Operator's account and system. A permanent external
boundary makes fair play, security and publisher-policy compliance structural
properties of the Platform instead of integration-specific judgments. It also
keeps Game Integrations portable: shared Platform, Service and Application code
consumes serializable identity and context rather than privileged process
objects or anti-cheat-sensitive mechanisms.

## Alternatives Considered

### Optional in-process integrations

Rejected. Even an opt-in or game-specific exception would introduce privileged
capabilities into shared architecture, increase security and account risk, and
make Oracle's safety position dependent on implementation details.

### Publisher-approved hooks or memory access

Rejected as a general Oracle architecture. A publisher-provided external API
may be evaluated as an ordinary safe data source, but approval does not justify
adding injection, memory access, patching or hook infrastructure to Oracle.

### Case-by-case fair-play review without a permanent boundary

Rejected. Review remains necessary for supported integrations, but without a
normative prohibition future delivery pressure could gradually erode the
external-companion model.

## Trade-offs

- Some context may be unavailable or less immediate than an in-process system
  could obtain.
- Unsupported or uncertain features must remain disabled, reducing coverage.
- Detection and context quality depend on safe external evidence and approved
  external data sources.
- In return, Oracle gains a clear trust boundary, lower security and account
  risk, deterministic serializable contracts and an integration model that can
  support future games without privileged game access.

## Long-Term Architectural Implications

- The Constitution is the normative source for the prohibited-technique and
  escalation rule.
- Game-specific detection and context remain inside Game Integrations.
- Reusable lifecycle, Session ownership and presentation remain in shared
  Platform, Service and Application layers.
- Shared contracts contain immutable, serializable data and never expose
  executable references, process handles, integration instances or detectors.
- Future proposals crossing the external boundary stop at architecture review;
  they are not implementation tasks until redesigned to comply.

## Status

✅ Accepted and implemented as a permanent architectural constraint in Sprint 13

---

# ADR-032

## Decision

Oracle adopts one permanent, game-agnostic Companion Guidance Framework for
all contextual guidance delivered by the external Companion.

The Platform Companion foundation owns the immutable, serializable and
versioned Guidance, Guidance Request, Session projection, package manifest and
provider-boundary contracts. Oracle Services own provider orchestration and
will own future guidance generation, selection and ranking. Oracle Applications
own presentation and Operator interaction. Game Integrations may contribute
game-specific guidance packages and knowledge through the shared contracts;
they do not define an alternative guidance model.

Guidance represents an explainable recommendation to the Operator. It is not a
command to a game, an automation instruction or a gameplay-control payload.
Every Guidance result carries category and type, fixed advisory delivery,
recommendation content, rationale, confidence, priority, spoiler classification, provenance,
compatibility information and optional source, evidence, detail, expiry and
reassessment information.

Guidance providers consume only immutable projections of authoritative
Companion Session Context. They receive no Session mutation or lifecycle
authority, desktop controller, game detector, process handle, integration
instance or other provider implementation detail.

The Oracle Platform Constitution remains the normative source for Oracle's
External Companion and Fair Play rules. This ADR explains why the Guidance
Framework adopts contracts and ownership that preserve those permanent rules;
it does not replace or weaken them.

## Rationale

Sprint 13 established safe deterministic game detection, authoritative Session
Context and renderer-safe presentation. Sprint 14 established a reusable path
from that context to meaningful assistance without coupling the product to one
game, one presentation, one content source or one intelligence provider.

One shared model allows curated knowledge, deterministic analysis and future
AI-generated guidance to be validated, explained and presented consistently.
Separating data contracts from generation and presentation keeps confidence,
source attribution, spoiler handling and compatibility inspectable while
preserving the ownership model:

```text
Platform / Companion Foundation — contracts and compatibility
Services                        — generation and orchestration
Applications                    — presentation and interaction
Game Integrations               — game-specific packages and knowledge
```

## Rejected Alternatives

### Game-specific guidance models

Rejected. Allowing every Game Integration to define its own response shape
would couple Applications to individual games, duplicate confidence and source
rules and prevent a consistent Oracle experience.

### UI-owned guidance logic

Rejected. Applications present guidance and collect Operator intent. They must
not generate, rank or reinterpret intelligence that belongs to Services.

### AI-specific guidance contracts

Rejected. AI is a possible provider, not a separate Oracle product model.
Curated, deterministic, AI-generated and hybrid guidance must populate the
same contract so that confidence, evidence, provenance and safety remain
consistent.

### Mutable Session or provider access

Rejected. Allowing providers to retain or mutate Session state, receive
lifecycle objects or expose implementations across boundaries would create
hidden authority, nondeterminism and unsafe coupling.

### Real-time in-process tactical assistance

Rejected. Guidance may never justify injection, protected-memory inspection or
modification, hooks, executable patching, gameplay or input automation,
simulated input, anti-cheat interaction or any technique prohibited by the
Constitution and ADR-031.

## Trade-offs

- Providers must translate their output into the shared Guidance contract.
- Strict validation adds deliberate work before Guidance can be consumed.
- A scoped Session projection may omit information a provider would find
  convenient, but prevents accidental authority and privacy expansion.
- Open category, type, source-type and provenance identifiers require
  consumers to provide safe unknown-value fallbacks.
- In return, Oracle gains one explainable and testable guidance language that
  can evolve across games, Applications and provider technologies.

## Compatibility Strategy

- Guidance, Guidance Request and Guidance Session projections have explicit
  contract identities and independent numeric versions.
- Existing versioned fields cannot be removed, renamed or given incompatible
  meanings without a new contract version and migration plan.
- Compatible evolution may add optional serializable fields with safe defaults.
- Category, type, source-type and provenance-method identifiers are open
  strings. Version 1 consumers must safely preserve or present unknown values.
- Validators inspect the complete input, including unknown extension fields,
  and reject functions, symbols, accessors, class instances, circular data,
  non-finite numbers and other executable or non-serializable values.
- Provider output remains unknown until validated and deep-frozen through the
  shared Guidance factory.
- An incompatible Guidance contract requires a new accepted ADR before
  production consumers migrate.

## Long-Term Evolution

The framework is intended to support, without replacement:

- curated public knowledge
- AI-generated and hybrid guidance
- performance and clip analysis
- Session-level coaching
- long-term Operator development
- future game-specific knowledge packages

New generation methods belong behind Services and provider contracts. New
presentation surfaces consume validated Guidance. New games contribute
packages through Game Integrations. None of these additions changes Session
ownership or the External Companion boundary.

## Consequence

All future Companion guidance must use the shared versioned contracts.
Guidance cannot mutate Session state, own Session lifecycle, expose provider
implementations or cross the constitutional Fair Play boundary. Alternative
guidance models require explicit architectural review rather than local
implementation convenience.

## Status

✅ Accepted and implemented across the five Sprint 14 Companion Intelligence
Foundation commits. Authoritative live runtime delivery remains deferred to
Sprint 15 and does not change this decision.

---

# ADR-033

## Context

Oracle currently retrieves the first available Operator row and may create a
shared local-development identity. Authentication middleware refreshes a
Supabase user session, but the repository does not establish a canonical,
enforced relationship between that authenticated principal and a durable
Operator. Operator Understanding cannot safely persist personal identity,
preferences, goals, evidence or inferred conclusions until ownership and data
isolation are explicit.

## Decision

Oracle separates Account from Operator.

An Account is an authentication and access principal. An Operator is the
durable person-centred platform entity Oracle serves. The Operator receives a
stable Oracle-owned identifier that is not derived from an email address, game,
device, Session or authentication-provider identifier.

The Operator Service owns the Account-to-Operator binding and exposes the
current authorised Operator through an explicit Service contract. Repositories
own persistence. Production consumers must never discover the current Operator
by selecting an arbitrary row, and Applications must not access Operator
persistence directly.

Persistent Operator data must be protected by authenticated ownership
constraints and Row Level Security. Local desktop and development operation
must use an explicit, inspectable identity mode; it must not weaken production
ownership rules or silently fall back to a shared production identity.

The initial supported cardinality is one primary Operator per authenticated
Account. The persistence design must preserve the stable Operator identifier so
that future authentication-provider changes or an explicitly approved
cardinality migration do not redefine the Operator.

## Alternatives Considered

### Use the authentication user identifier as the Operator identifier

Rejected. Authentication providers and Account relationships may change while
the Operator must remain the durable platform entity.

### Continue selecting the first Operator row

Rejected. This cannot provide multi-Operator isolation, ownership evidence or
a safe basis for personal understanding.

### Allow every Application to resolve Account ownership independently

Rejected. It would duplicate security-critical logic and violate Service and
repository ownership.

## Consequences

- Existing Operator identifiers must be preserved through migration where
  ownership can be established safely.
- The deployed Supabase schema and policies must be audited before migration.
- Production data access requires authenticated Operator scope.
- Desktop identity resolution requires an explicit future composition boundary.
- Account deletion and Operator deletion remain distinct governed operations.

## Risks

- Deployed schema drift may make migration more complex than the tracked SQL
  indicates.
- Existing local data may not contain sufficient ownership evidence for an
  automatic migration.
- Incorrect Row Level Security could expose or strand Operator data, so
  multi-principal isolation verification is mandatory.

## Status

Accepted. Sprint 15 implementation has not begun.

---

# ADR-034

## Context

Oracle already derives Behaviour, Memory, Evolution, Coaching, Planner and
Operator Profile outputs from Sessions. Those outputs are current runtime
profiles rather than durable, revisable understanding. Identity, preferences,
goals, temporary state, evidence, memory and inferred intelligence also have
different provenance and lifecycle needs and must not be collapsed into one
generic profile.

Sprint 14 deferred authoritative Companion Guidance delivery to Sprint 15.
Architectural review subsequently determined that durable Operator
Understanding should precede that delivery because future personalisation
requires identity, consent, evidence, correction and scope boundaries.

## Decision

Oracle adopts Operator Understanding as the architectural umbrella for its
progressively deeper understanding of an Operator.

Operator Understanding composes, without absorbing ownership of:

- explicit Operator Identity
- declared Preferences
- declared Goals
- temporary Operator State
- governed Memory
- permitted Evidence
- Operator Intelligence

Operator Intelligence is the evidence-derived component of Operator
Understanding. Existing intelligence engines remain specialised producers and
are not replaced.

`OperatorUnderstandingSnapshot` is an immutable, versioned read projection for
approved Service and Oracle Context consumption. It is not a persistence model,
source of truth or generic profile object. Its sections preserve their source,
scope, provenance and authoritative owner.

Declared information and inferred conclusions follow separate lifecycles.
Inferred conclusions begin as candidate claims and become eligible for
consumption only when their approved evidence, confidence, consent, freshness
and scope policies are satisfied. Correction, dispute, contradiction, decay,
supersession, expiry and deletion can remove that eligibility.

Oracle also records an epistemic classification describing how each item is
known:

- `known` — established by an authoritative, verifiable source
- `declared` — stated or confirmed by the Operator
- `observed` — directly recorded through a permitted observation source
- `inferred` — concluded through an approved evidence and confidence policy
- `suspected` — a provisional candidate with insufficient support for normal
  personalisation use
- `unknown` — not currently established

Epistemic classification does not replace numeric or qualitative confidence.
It communicates provenance and certainty class; confidence communicates the
strength of support within the applicable class. `suspected` information is
not eligible for ordinary personalisation in Sprint 15.

Memory governs selective retention, reassessment, decay, supersession and
removal. It does not manufacture evidence, turn assumptions into facts,
reinterpret game-specific meaning or override Operator control.

This decision supersedes only ADR-032's historical scheduling statement that
authoritative Companion Guidance delivery was deferred to Sprint 15. ADR-032's
Guidance contracts, ownership, compatibility and External Companion boundaries
remain fully in force. Authoritative live Guidance delivery returns to the
future queue and requires separate approval.

## Alternatives Considered

### Treat Operator Intelligence as every kind of Operator information

Rejected. Explicit identity and declarations are not inferences, and temporary
state and memory policy have different owners and lifecycles.

### Persist one comprehensive Operator profile

Rejected. It would collapse provenance, authority, temporal meaning and
correction semantics into an ambiguous record.

### Persist every engine output automatically

Rejected. Existing heuristics include provisional and unsupported defaults.
Durability must be earned through an approved claim policy.

### Deliver live Companion Guidance before Operator Understanding

Rejected for Sprint 15 sequencing. The Guidance Foundation remains valid, but
durable understanding provides the safer basis for future personalisation.

## Consequences

- Sprint 15 implements only the narrow Operator Understanding trust foundation.
- Existing engines and contracts remain unchanged unless a separately reviewed
  additive adapter is required.
- Identity, Preferences, Goals, State, Memory and Intelligence retain distinct
  ownership.
- Applications consume approved projections through Services rather than
  persistence or engine internals.
- Oracle explanations can distinguish how information is known from how
  strongly it is supported.

## Risks

- The umbrella name could be mistaken for permission to expand Sprint scope;
  the approved Sprint plan therefore remains intentionally narrow.
- Epistemic classification and confidence could be conflated unless contracts
  and presentation language keep them distinct.
- A projection could become an accidental source of truth if consumers are
  permitted to mutate or persist it.

## Status

Accepted. Sprint 15 implementation has not begun.

---

# ADR-035

## Context

Operator Understanding introduces durable personal information and derived
conclusions. Existing repository code does not provide a complete consent,
retention, correction, dispute, export or deletion lifecycle. Oracle's privacy
principles require these controls to be architectural rather than deferred UI
work.

## Decision

The Operator Service owns explicit identity, Preference and Goal control. The
Operator Intelligence Service owns evidence-reference and claim lifecycle. The
Memory Service owns approved retention, decay and eligibility policy. Each
uses Repositories for persistence and exposes presentation-independent control
contracts to Applications.

Consent is purpose-specific, revocable, effective-dated and separate from
Account processing required for authentication and ownership. Revocation stops
future optional processing and removes affected understanding from subsequent
consumption projections.

The Operator may inspect, correct or withdraw declared information and may
dispute inferred claims. A dispute makes the claim ineligible for
personalisation immediately without rewriting source evidence. Corrections and
system reassessments create explicit revisions. Superseded history remains
available only while permitted by retention and deletion policy.

Export must preserve declarations, claims, epistemic classification,
confidence, evidence references, provenance, scope, lifecycle and policy
versions in a versioned machine-readable form.

Deletion may target an individual item, purpose, game scope, Operator
Understanding domain or complete Operator. Derived claims and evidence links
must be removed, recomputed or lawfully de-identified according to the approved
deletion operation. Content-free tombstones are allowed only when necessary to
prevent unsafe recreation and when retention is authorised.

Raw evidence and derived understanding have separate retention policies.
Temporary state is not retained indefinitely by default, and raw Session prompt
content must not be copied into Operator Intelligence merely because it exists.

Sprint 15 prohibits automated inference of sensitive personal attributes,
including health, disability, protected characteristics, political or
religious belief, sexuality, clinical mental state, addiction or comparable
sensitive classifications. Motivation, frustration and coaching preferences
may be stored when explicitly declared; automated inference requires a future
approved privacy and evidence review.

## Alternatives Considered

### Add control UI after inference is enabled

Rejected. Processing and control boundaries must exist before broad production
inference or personalisation.

### Treat correction as direct mutation

Rejected. Silent mutation would destroy provenance and reassessment history.

### Retain all observations indefinitely

Rejected. Complete retention conflicts with data minimisation and selective
Memory.

## Consequences

- Sprint 15 must implement application-ready inspect, dispute, correction,
  export and deletion Service operations even though broad UI is deferred.
- New inference remains gated until consent and control requirements are met.
- Retention durations require explicit approval rather than implementation
  invention.
- Privacy, RLS, deletion and export verification become Sprint acceptance
  criteria.

## Risks

- Revision history can conflict with deletion expectations if content is not
  separated from minimal operational tombstones.
- External processor and backup retention may require policy beyond repository
  deletion.
- Broad free-text evidence may contain personal information outside the claim's
  intended purpose.

## Status

Accepted. Sprint 15 implementation has not begun.

---

# ADR-036

## Context

Oracle is game agnostic, but many existing Session measures have game-shaped
meaning. An engine declaring support for every game does not establish that a
conclusion is portable. Without an explicit scope model, Call of Duty evidence
could be presented incorrectly as universal knowledge about an Operator.

## Decision

Every Operator Evidence reference and inferred claim has an explicit scope:

- Operator-wide
- Application-specific
- Game Integration-specific
- Session-specific

Game-specific evidence remains Game Integration-specific by default. Game
Integrations own the semantics and interpretation of their observations.
Platform and shared Services own only the game-agnostic scope, portability and
validation contracts.

Cross-game portability must be explicit, versioned, evidence-backed and
explainable. A claim may become Operator-wide only when an approved portability
policy can demonstrate that the source meanings are compatible across the
relevant Game Integrations. Absence of a game identifier, wildcard engine
support or similarity of field names is not evidence of portability.

Sprint 15 produces only Game Integration-specific candidate claims from the
existing recurring Memory strength and weakness family. It does not promote
cross-game conclusions.

## Alternatives Considered

### Treat all shared engine output as portable

Rejected. Shared execution does not guarantee shared domain meaning.

### Let shared Services reinterpret game metrics

Rejected. Game-specific knowledge belongs inside Game Integrations.

### Never permit cross-game understanding

Rejected. Portable understanding is strategically valuable when its semantic
and evidential basis is established responsibly.

## Consequences

- Existing game-shaped metrics are not automatically durable cross-game traits.
- Future Game Integrations must expose approved semantics before contributing
  to portable claims.
- Understanding projections preserve game scope and portability status.
- Applications must communicate scope rather than present all claims as
  universal.

## Risks

- Historical Sessions use free-text game names that may not map safely to a
  stable Integration identity.
- Portability policies may become overly broad unless version and source
  compatibility are explicit.
- Cross-game claims may require reassessment when an Integration changes its
  metric semantics.

## Status

Accepted. Cross-game promotion remains deferred.

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
