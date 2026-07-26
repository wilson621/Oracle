# ORACLE ARCHITECTURAL DECISION RECORDS

**Authority:** Accepted architectural decisions beneath the Oracle Platform Constitution and Engineering Principles
**Scope:** Specific architectural decisions, rationale, alternatives, consequences and status
**Owner:** Oracle Architecture
**Status:** Active append-only ledger
**Classification:** Historical
**Expected Stability:** Accepted records are immutable; new decisions or explicit superseding ADRs are appended
**Supersedes:** Earlier ADR ledger versions as an index; individual accepted records retain their own status
**Superseded By:** None
**Last Reviewed:** 25 July 2026
**Version:** 5.0

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

### Implementation Note — 21 July 2026

Sprint 15 Phase 1 implemented, deployed and verified the authenticated
Account-to-Operator ownership boundary described by this decision. Phase 2
continues to depend on Operator Service current-Operator resolution and does
not introduce an alternate identity path.

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

### Implementation Note — 21 July 2026

Sprint 15 Phase 2 implemented the immutable, versioned Operator Understanding
contracts, structural epistemic classes, separate confidence semantics,
validated claim and declaration lifecycles, deterministic claim-owned
explanations and purpose-scoped `OperatorUnderstandingSnapshot`. The Snapshot
remains a read projection and no runtime consumption is activated.

Sprint 15 Phase 3 implemented the durable Operator Intelligence persistence
boundary beneath those contracts. Stable claims, immutable revisions,
deterministic explanations, minimal Evidence references and append-only
eligibility history retain separate structures. The Snapshot remains
unpersisted, and no producer or consumer is registered.

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

### Implementation Note — 21 July 2026

Sprint 15 Phase 2 implemented the contract boundaries for Evidence references,
claims, revisions, data-policy references, expiry, deletion tombstones and
Service ownership. It does not implement persistence, consent processing,
control operations, export, retention execution or deletion orchestration;
those remain gated to later approved phases.

Sprint 15 Phase 3 implemented Operator-owned policy-version, Evidence,
claim-revision, relationship and eligibility persistence with composite
ownership constraints, authenticated RLS and atomic Repository operations.
Consent processing, correction, dispute commands, export, retention execution
and complete deletion orchestration remain gated to later phases. The tracked
migration is rollback-verified and not permanently deployed.

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

### Implementation Note — 21 July 2026

Sprint 15 Phase 2 implemented explicit Operator, Application, Game Integration
and Session scopes. Contract validation rejects implicit widening from game-
or Session-scoped evidence to Operator-wide understanding and rejects evidence
from a different Application, Game Integration or Session. Cross-game
portability policy remains unimplemented and deferred.

Sprint 15 Phase 3 persists the validated scope contract without interpreting
or widening it. Composite ownership constraints prevent cross-Operator links;
no cross-game portability rule, candidate producer or Operator-wide promotion
has been added.

---

# ADR-037

## Title

Operator Intelligence Primacy and Games as Performance Context

## Context

The Oracle Founding Charter and Oracle Strategy define Oracle as an Operator
Intelligence Platform. The Operator is the durable person Oracle serves.
Games, Applications, devices and individual Sessions may change while the
Operator's capacity to learn, decide and improve persists.

Earlier product and architecture language sometimes describes Oracle primarily
as a gaming-intelligence, game-analysis or Companion product. The current
implementation also retains legacy Call of Duty analysis, combat-statistics and
clip-review paths. Those paths represent historical product development and
must not become the basis for future ownership or platform identity.

The Founder has approved the following clarification:

- Oracle remains an Operator Intelligence Platform;
- games are performance environments, not Oracle's product identity;
- no architectural layer change is authorised; and
- the clarification is not an architectural reset.

A binding architectural interpretation is required so future Services,
Applications, engines and Game Integrations apply that doctrine consistently
without turning Operator Intelligence into an unbounded subsystem or generic
human-surveillance platform.

## Decision

The Operator is Oracle's durable subject.

Oracle exists to develop trusted, longitudinal and explainable understanding
that improves the Operator's judgment, agency and capability. Game performance
is one governed source of context and permitted evidence through which that
understanding may develop.

Games are performance contexts. A Game Integration owns the semantics,
compatibility, reviewed knowledge and permitted observations of its game. It
does not own the Operator, Oracle Intelligence, Oracle Applications or the
meaning of evidence outside its declared scope.

Oracle retains its four permanent architectural layers:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

This decision changes no layer and transfers no existing capability owner.

Operator Intelligence is not one universal implementation object or Service.
It is the governed platform domain produced by distinct authoritative systems:

- Operator Service owns explicit Operator identity and declarations;
- source owners retain raw Evidence authority;
- Operator Intelligence Service owns evidence-reference and claim lifecycle;
- Memory Service owns approved retention, decay and eligibility policy;
- specialised engines produce bounded domain intelligence;
- Applications present and orchestrate approved Service projections; and
- Game Integrations retain game-specific meaning.

Every durable conclusion about an Operator must preserve:

- how it is known;
- its Evidence and provenance;
- confidence where applicable;
- purpose;
- scope;
- temporal validity;
- policy version;
- eligibility;
- explanation;
- correction and dispute state; and
- retention and deletion treatment.

Game-scoped evidence remains game-scoped unless an approved portability policy
demonstrates compatible meaning. Supporting multiple games does not make a
conclusion Operator-wide.

The approved maturity model is:

```text
Trust
    ↓
Permitted Observation
    ↓
Admitted Evidence
    ↓
Operator Understanding
    ↓
Selective Memory
    ↓
Behavioural Intelligence
    ↓
Guidance
    ↓
Outcome Reassessment
    ↓
Prediction
```

This model governs product maturity, admission and trust. It is not a strict
engine invocation graph and does not reorder the approved Engineering
Programme. A bounded forecast may be produced before later Guidance exists,
but it must not be presented as mature longitudinal Operator prediction unless
its evidence and reassessment basis justify that claim.

Oracle remains scoped to its Founding Charter and Constitution. Describing
games as performance environments does not authorise general workplace,
health, educational, psychological or ambient human surveillance.

Legacy analysis, clip, statistics and game-specific paths may remain as
measured compatibility debt until their approved migration Sprint. They gain
no architectural authority from continued existence and must not be expanded
into parallel systems.

## Alternatives Considered

### Redesign Oracle around a new human-performance layer

Rejected. The existing Platform, Services, Applications and Game Integration
model already supports the Operator-first doctrine. A new layer would duplicate
ownership and create an architectural reset without a demonstrated need.

### Treat game analysis as Oracle's primary product

Rejected. Games and analysis methods change. The Operator is the durable
subject and Oracle's compounding advantage is trusted longitudinal
understanding.

### Remove game-specific architecture

Rejected. Game semantics remain necessary to interpret performance safely.
Removing Game Integration authority would encourage shared Services to invent
or misread game meaning.

### Treat every game-derived pattern as a universal human trait

Rejected. Shared field names and engine reuse do not establish cross-game or
Operator-wide meaning.

### Expand Oracle into a generic human-intelligence platform

Rejected. The approved clarification is Operator-first within Oracle's governed
purpose, not authority for unlimited observation or sensitive inference.

## Consequences

- Constitution, Strategy and Architecture terminology must place the Operator
  before games while preserving current ownership.
- Roadmap and Programme descriptions should treat games as contexts and
  integrations as semantic authorities.
- New product work must identify the Operator outcome it serves.
- Game-specific metrics cannot be presented as universal Operator traits
  without approved portability evidence.
- Legacy game-analysis paths require eventual migration but not immediate
  reconstruction.
- Operator Profile, Memory, Behaviour and Prediction language must distinguish
  provisional runtime output from governed durable Understanding.
- The External Companion, privacy, consent, confidence and Fair Play boundaries
  remain unchanged.

## Risks

- "Operator-first" could be misused to justify collecting more personal data.
- A broad Operator Intelligence label could obscure separate capability owners.
- Game context could be abstracted away so aggressively that conclusions lose
  valid domain meaning.
- Existing product language may overstate the maturity of provisional engines.
- Human-performance language may be interpreted beyond Oracle's approved
  gaming scope.

These risks are controlled by purpose-specific consent, explicit scope,
epistemic classification, specialised ownership, ADR-036 portability rules and
ADR-038's promotion boundary.

## Status

Accepted — Founder-approved 24 July 2026. This decision changes no
implementation, runtime, production state or architectural layer.

---

# ADR-038

## Title

Observation → Evidence → Understanding → Memory Promotion Boundary

## Context

Oracle's Operator-first maturity model distinguishes Trust, Observation,
Evidence, Understanding and Memory. These concepts cannot be treated as
synonyms.

Without an explicit promotion boundary:

- permitted capture could be mistaken for permission to retain;
- a transient observation could become durable personal data automatically;
- an Evidence reference could be presented as a conclusion;
- an engine output could become accepted Understanding merely because it was
  generated;
- Memory could become uncontrolled historical storage; and
- revoked, disputed or deleted information could continue influencing later
  intelligence.

ADR-034 established Operator Understanding and selective Memory. ADR-035
established consent and Operator control. ADR-036 established scope and
portability. This decision defines the promotion boundary connecting those
authorities.

## Decision

Oracle defines Observation, Evidence, Understanding and Memory as separate
lifecycle stages with separate authority.

### Observation

An Observation is a transient representation of something detected or supplied
through a permitted source at a particular time.

An Observation:

- may originate from an Operator declaration, Oracle Session, Application
  event, permitted external desktop observation, reviewed API or Game
  Integration;
- remains owned by its authoritative source;
- has an explicit purpose and scope;
- is not automatically durable;
- is not automatically Evidence;
- is not an assertion about the Operator; and
- grants no permission for unrelated processing.

Permission to observe does not imply permission to admit, retain, infer,
personalise or export.

### Evidence

Evidence is an Observation or authoritative fact that has passed explicit
admission for a declared purpose.

Admitted Evidence must have:

- an authenticated Operator where personal scope applies;
- an authoritative source owner;
- a stable source reference;
- provenance;
- observed and captured times;
- purpose;
- scope;
- producer identity and version;
- quality assessment where applicable;
- content digest;
- retention class;
- policy identity and version; and
- a permitted disposition state.

Operator Intelligence stores the minimum approved Evidence reference. Raw
source content remains with its authoritative owner unless a separately
approved contract explicitly requires otherwise.

Evidence is support for reasoning. It is not itself accepted Understanding and
does not acquire broader scope because multiple systems can read it.

### Understanding

Understanding is a governed representation of what Oracle currently knows,
has been told, has observed, infers, suspects or does not know about an
Operator.

Understanding preserves structural epistemic class:

- known;
- declared;
- observed;
- inferred;
- suspected; or
- unknown.

It also preserves provenance, purpose, scope, temporal validity, policy and,
where applicable, confidence, Evidence relationships, explanation, lifecycle
and eligibility.

Declared and inferred Understanding remain separate. An inference begins as a
candidate and becomes eligible only through an approved deterministic policy.
Generation by an engine or model does not make it accepted, durable or
eligible.

Understanding remains revisable. Correction, contradiction, dispute,
supersession, withdrawal, expiry, revocation and deletion can change or remove
eligibility without silently rewriting historical provenance.

### Memory

Memory is the selective, policy-governed retention and reassessment of eligible
Understanding or an approved reference to its authoritative source.

Memory:

- is not raw Observation storage;
- is not the Evidence source of truth;
- is not the complete history of an Operator;
- does not manufacture Evidence;
- does not promote epistemic class;
- does not widen scope;
- records why an item remains useful and permitted;
- applies retention, reassessment, decay, supersession and removal policy; and
- must yield to Operator control and approved deletion.

Memory may retain a reference to eligible Understanding. It does not duplicate
the content merely for convenience.

### Promotion Is Never Automatic

Promotion is never automatic.

- not every Observation becomes Evidence;
- not every Evidence becomes Understanding; and
- not every Understanding becomes Memory.

The existence, availability, generation or technical accessibility of
information is never sufficient authority to promote it.

Every promotion requires:

- an explicit governing rule;
- an applicable approved policy and policy version;
- a purpose and scope compatible with both lifecycle stages;
- current eligibility, including consent where applicable;
- the required provenance, quality and authority checks; and
- a recorded, reviewable promotion outcome.

An implementation may execute an approved deterministic promotion policy
without case-by-case human intervention. That execution is not automatic
promotion: it is the application of explicit governance, eligibility and
policy. If any required rule or decision is absent, promotion does not occur.

## Promotion Rules

### Trust → Permitted Observation

Optional Observation requires:

- a declared purpose;
- an approved policy version;
- applicable, current consent;
- a permitted source and method;
- appropriate scope;
- visible Operator control where observation is ongoing; and
- data minimisation.

Required Account and security processing remains distinct from optional
Operator Intelligence processing.

### Observation → Admitted Evidence

Promotion requires:

- an approved Evidence admission policy;
- continued consent and policy eligibility;
- authenticated ownership;
- source authority;
- provenance and stable identity;
- quality and integrity validation;
- purpose and scope compatibility;
- retention classification; and
- successful immutable admission.

Failure of any gate leaves the Observation unadmitted. It must be discarded or
handled according to its source policy.

### Evidence → Operator Understanding

Promotion requires:

- an approved producer and version;
- an approved claim or declaration type;
- compatible Evidence semantics;
- sufficient quality;
- explicit support and contradiction relationships;
- deterministic policy evaluation;
- confidence and explanation where inference applies;
- temporal validity;
- scope compatibility;
- sensitive-inference rejection;
- candidate lifecycle entry; and
- an explicit eligibility assessment.

No engine, model, Application or presentation component may bypass this
boundary.

### Understanding → Selective Memory

Promotion requires:

- current eligibility for a declared purpose;
- approved retention policy;
- continuing consent where applicable;
- useful longitudinal value;
- explicit retention class;
- reassessment or expiry requirements;
- scope preservation; and
- an authoritative removable reference.

Absence of an approved retention policy means optional Understanding is not
promoted to Memory.

### Downstream Consumption

Behavioural Intelligence, Guidance and Prediction consume only approved,
purpose-scoped projections. They do not consume every retained record and do
not receive authority to mutate Observation, Evidence, Understanding or
Memory.

Revoked, disputed, withdrawn, expired or deleted information becomes
ineligible before subsequent consumption. Physical retention necessary for an
approved recovery or audit purpose does not preserve personalisation
eligibility.

## Prohibitions

Oracle must never:

- treat permission to observe as permission to retain;
- admit every Observation automatically;
- copy raw prompts, images or desktop content into Operator Intelligence merely
  because they exist;
- treat Evidence as a conclusion;
- persist every engine or model output as Understanding;
- infer sensitive personal attributes without a future separately approved
  constitutional, privacy and evidence review;
- widen game, Session or Application scope implicitly;
- make Suspected information eligible for ordinary personalisation;
- allow Memory to become a second source of truth;
- reconstruct deleted content from derived state;
- allow UI wording to promote epistemic status or confidence;
- allow a provider to mutate Session or Operator lifecycle; or
- retain optional information indefinitely without approved policy.

## Relationship to Runtime Ordering

The maturity model is not a strict synchronous engine graph. Existing runtime
engines may execute in their approved dependency order. Their output remains a
provisional runtime result until the applicable admission, Understanding and
Memory gates are satisfied.

This distinction permits bounded forecasting and diagnostics without claiming
that Oracle has mature longitudinal prediction.

## Alternatives Considered

### Persist all Observations and decide later

Rejected. This violates data minimisation, consent purpose and selective
Memory.

### Treat all engine output as Understanding

Rejected. Existing engines include heuristic and game-shaped outputs that have
not earned durable epistemic status.

### Combine Understanding and Memory

Rejected. What Oracle currently understands and what it is permitted and useful
to retain have different lifecycle authorities.

### Let Applications decide promotion

Rejected. Applications present and orchestrate Services; they do not own
Evidence admission, inference policy or retention.

## Consequences

- Future observation systems require explicit ephemeral-state and admission
  boundaries.
- Sprint 18 controls must govern later Observation purposes without
  implementing observation capture.
- Sprint 21 must make Session Evidence admission explicit.
- Sprint 22 must produce candidates through the approved Understanding
  lifecycle rather than persist runtime profiles.
- The current Memory Engine must be treated as a runtime pattern producer or
  candidate source, not the durable Memory authority.
- Behavioural Intelligence, Guidance and Prediction require purpose-scoped
  eligible inputs before production personalisation.
- Diagnostics must expose where an item sits in the lifecycle.

## Risks

- Multiple gates increase implementation and explanation complexity.
- Source systems may retain content after an Evidence reference is removed.
- A retention reference may become stale when source content changes.
- Incorrect policy composition may leave information eligible after
  revocation.
- Overly strict promotion may reduce useful intelligence.

These risks are preferable to uncontrolled collection and are mitigated through
versioned policy, source-owner coordination, explicit diagnostics, bounded
projections and verification.

## Status

Accepted — Founder-approved 24 July 2026. This decision authorises no
Observation, Evidence admission, Understanding accumulation, Memory promotion
or runtime consumption.

---

# ADR-039

## Title

Retention, Deletion, Audit and Tombstone Policy

## Context

Operator Understanding contains personal declarations, Evidence references,
derived claims, explanations, lifecycle history and eligibility decisions.
Trust requires more than access control. Oracle must define how long
information may remain, what deletion means across authoritative owners, what
minimal audit evidence may survive, and when a tombstone is justified.

Append-only revision history can conflict with deletion. Audit records can
silently retain the content they claim to govern. Backups and external
processors can make immediate physical removal impossible. Interfaces can
mislead Operators by presenting a request as completed deletion.

ADR-035 establishes Operator inspection, correction, dispute, export,
retention and deletion rights. Sprint 18 requires architectural policy before
implementation. Exact durations, legal obligations and processor-specific
rules require explicit Founder approval and must not be invented in code.

## Decision

Oracle adopts versioned, purpose-specific retention and deletion policy.

Retention is permission to keep identified information for a defined purpose
and period. It is not a default property of data and does not preserve
eligibility for personalisation.

Deletion is a governed operation across authoritative owners. It must remove,
de-identify or render inaccessible all content covered by the approved scope
and must prevent prohibited reconstruction from derived state.

Audit records and tombstones are exceptional minimal operational records. They
must never become shadow personal-data stores.

Deletion policy must distinguish the requested operational outcome from the
current eligibility, retention and physical-erasure state. Oracle must never
use one undifferentiated "deleted" status for materially different states.

## Retention Policy

Every retained category must bind to a versioned policy defining:

- information category;
- authoritative owner;
- processing purpose;
- scope;
- retention class;
- start event;
- expiry event or duration;
- reassessment requirements;
- consent dependency;
- legal or regulatory authority where applicable;
- disposition at expiry;
- audit treatment;
- backup treatment;
- external-processor treatment;
- deletion interaction; and
- approving authority.

Retention values are governance inputs. Implementations validate and execute
them; they do not choose them.

Optional personal information has no indefinite-retention default. Where no
approved retention rule exists, Oracle must not promote the information to
Memory and must dispose of transient or unneeded content according to its
source policy.

Raw Evidence and derived Understanding have separate retention schedules.
Retention of one does not automatically authorise retention of the other.

## Deletion Scopes

Oracle supports:

- item-level deletion;
- purpose-level deletion;
- Game Integration-scope deletion;
- Operator Understanding-domain deletion; and
- complete-Operator deletion.

Account deletion and complete-Operator deletion remain distinct. The Operator
must be told which operation is occurring and what access or data consequences
follow.

Every deletion scope requires a deterministic topology identifying:

- authoritative source content;
- Evidence references;
- Evidence relationships;
- claims and revisions;
- eligibility assessments;
- Memory references;
- derived projections;
- exports or prepared artifacts;
- Application state;
- audit records;
- tombstones;
- caches, if any are separately approved;
- backups; and
- external processors.

Deletion must not rely on an Application-maintained list of tables or hidden
best-effort cleanup.

## Deletion State Model

Oracle distinguishes four architectural states.

### Operational Deletion

Operational deletion is the authenticated, governed process that applies an
approved deletion scope across every identified authoritative owner and
derived dependency.

It begins when Oracle accepts a valid deletion command. It may include
eligibility removal, deletion or de-identification of live records,
external-processor coordination, backup handling, recovery and completion
verification.

Acceptance or progress of an operational deletion does not by itself mean
that physical deletion has completed.

### Eligibility Removal

Eligibility removal is the authoritative exclusion of affected information
from optional processing, projections, personalisation, Behavioural
Intelligence, Guidance and Prediction.

Revocation, dispute, withdrawal, expiry or an accepted deletion request must
make affected information ineligible at the authoritative control boundary
before later projections consume it.

Eligibility removal must occur even when physical deletion is pending or
legally required retention applies. Retained-but-ineligible information must
not return to eligibility merely because it remains physically present.

### Legally Required Retention

Legally required retention is constrained continued retention that applies
only where a specific applicable legal or regulatory obligation requires it.
It is not a general operational convenience, product preference or indefinite
exception.

Any legally required retention must be:

- identified by an approved policy and authority;
- limited to the minimum required information, purpose and duration;
- access-restricted and excluded from optional processing;
- recorded without copying prohibited content into audit;
- disclosed truthfully in the deletion outcome where disclosure is permitted;
- reviewed at the required interval; and
- physically deleted or irreversibly de-identified when the obligation ends,
  unless another approved obligation then applies.

This ADR creates no legal-retention category, duration or exception. Those are
Founder-approved policy inputs informed by applicable legal advice where
required.

### Physical Deletion

Physical deletion is the verified removal of covered content from an
identified system or processor such that the content is no longer available
to that system's normal or privileged runtime paths and cannot be
reconstructed from retained derived state.

Physical deletion must be reported per approved system boundary. Completion
in live systems does not imply expiry from backups or completion by an
external processor. De-identification or access restriction must not be
described as physical deletion unless the approved policy and verification
standard define the result as irreversible for that boundary.

### State Reporting and Completion

Where deletion cannot safely complete atomically across owners, Oracle must:

- record an authenticated operation receipt;
- expose that deletion is pending rather than complete;
- use idempotent, resumable steps;
- isolate and report failures;
- prevent affected information from returning to eligibility;
- allow safe retry; and
- record completion only after every approved live-system step passes.

Every status and Operator-facing statement must identify what has actually
occurred:

- the operational deletion request was accepted;
- eligibility was removed;
- identified information remains under legally required retention;
- physical deletion completed for named live-system boundaries;
- processor deletion remains pending or completed; and
- backup expiry remains pending or completed under its approved schedule.

An implementation must not claim immediate or complete deletion when only
eligibility, orchestration status, de-identification or one system boundary
has changed.

## Audit Policy

Audit exists to prove that a governed action occurred and to support safe
recovery. It does not justify retaining the content affected by that action.

An approved audit record may contain only the minimum necessary operational
metadata, such as:

- operation identity;
- authenticated actor class;
- approved scope identifier;
- action type;
- policy identity and version;
- request, transition and completion times;
- outcome;
- recovery state;
- affected-record counts; and
- non-content integrity evidence.

Audit records must not contain:

- raw prompts;
- screenshots or captured desktop content;
- declaration values;
- claim values;
- free-text Evidence summaries;
- explanations;
- email addresses or credentials;
- game-specific payloads;
- copied source records; or
- other content that would defeat deletion.

Any additional audit field requires explicit policy justification and privacy
review.

Append-only audit does not override an approved deletion scope. Where even
minimal metadata is no longer authorised, it must be deleted or irreversibly
de-identified.

## Tombstone Policy

A tombstone is permitted only when it is necessary to:

- prevent unsafe replay or recreation;
- preserve monotonic revision integrity;
- prove completion of a deletion transition; or
- coordinate deletion recovery.

A tombstone must be content-free. It may preserve only the minimum approved
non-content identity, policy, timing and predecessor information necessary for
its stated purpose.

A tombstone must not retain:

- the deleted value;
- Evidence content or summary;
- explanation;
- confidence rationale;
- game payload;
- prompt content;
- personal free text; or
- another field from which the deleted content can be reconstructed.

For complete-Operator deletion, any retained tombstone or audit identity must
be removed or irreversibly de-identified unless a separately approved policy
requires a minimal linkable record. No such exception is created by this ADR.

## Backups and Restore

Oracle must disclose that deletion from live systems and expiry from backups
may occur on different schedules.

Backup policy must define:

- backup retention period;
- access authority;
- restoration approval;
- deletion-ledger or equivalent reapplication after restore;
- verification that deleted content does not silently return to production;
- expiry and destruction evidence; and
- incident exceptions.

Restoring a backup does not restore processing eligibility. Approved deletions,
revocations and disputes must be reapplied before restored data becomes
available to normal runtime consumers.

Exact backup durations are not decided by this ADR.

## External Processors

Where an approved external processor holds affected information, policy must
define:

- what was sent;
- processor purpose;
- retention commitment;
- deletion mechanism;
- confirmation evidence;
- failure and retry behaviour; and
- Operator-facing limitations.

Oracle must not report complete deletion while a required processor deletion
remains pending.

## Correction, Supersession and Deletion

Correction creates a new revision and does not silently mutate history.
Superseded content may remain only while its retention policy permits.

Deletion is not correction. When deletion applies, prohibited content must be
removed from historical revisions as well as current projections. A
content-free tombstone may replace the deleted revision only where this policy
allows it.

## Export Relationship

Export must describe current lifecycle and retention state. It must not expose
content already deleted or another Operator's information.

Preparing an export creates no new indefinite retention authority. Temporary
export artifacts require their own short-lived approved handling and deletion.
Exact duration is a Founder-approved policy value.

## Verification Requirements

Every deletion scope must prove:

- authenticated ownership;
- cross-Operator isolation;
- immediate eligibility removal;
- correct separation and reporting of operational deletion, eligibility
  removal, legally required retention and physical deletion;
- deterministic affected-owner topology;
- expected removed and retained counts;
- proof that any legally required retained information is minimal,
  access-restricted, purpose-limited, time-bound and ineligible;
- absence of prohibited content in revisions, audit and tombstones;
- idempotent retry;
- partial-failure recovery;
- backup restoration reapplication;
- external-processor completion where applicable; and
- absence from subsequent approved projections.

Verification fixtures must be isolated, purpose-labelled and removed unless
their permanent retention is separately approved.

## Alternatives Considered

### Retain complete append-only history

Rejected. Immutability is not authority to retain personal content after
deletion.

### Delete only current projections

Rejected. Historical revisions, Evidence relationships, Memory references and
source content could reconstruct or continue exposing the deleted information.

### Treat every deletion as one database transaction

Rejected. Complete-Operator deletion may cross authoritative owners, backups
and external processors. Pretending it is atomic would create false completion
claims.

### Store full before-and-after values in audit

Rejected. This would turn audit into an undeclared shadow history.

### Define retention durations in implementation

Rejected. Durations are governance and policy decisions requiring explicit
Founder approval.

## Consequences

- Sprint 18 requires a complete deletion-topology audit before implementation.
- Control operations must distinguish immediate ineligibility from completed
  physical deletion.
- Operator-facing states must distinguish operational deletion, eligibility
  removal, legally required retention and physical deletion.
- Audit and tombstone schemas must be demonstrably content-free.
- Backup restoration procedures must reapply deletion and eligibility state.
- Complete-Operator deletion requires recoverable orchestration if it crosses
  owners.
- Product language must be truthful about pending, completed and backup-expiry
  states.
- Retention schedules and processor rules remain explicit Founder decisions.

## Risks

- A missed derived record may preserve prohibited content.
- Minimal audit identifiers may still be personal data when linkable.
- Backup restoration may resurrect deleted information.
- External processors may delay completion.
- An unjustified or overly broad legal-retention classification may become a
  deletion loophole.
- Overly aggressive deletion may damage integrity or recovery.
- Overly broad retention exceptions may defeat Operator control.

These risks require explicit topology, minimal metadata, reversible
pre-deployment verification and independent deletion-residue testing.

## Status

Accepted — Founder-approved 24 July 2026. This decision creates no retention
duration, implementation, migration, deletion operation or production
authority. Undefined policy values remain configurable governance inputs and
must not be hard-coded.

---

# ADR-040

## Title

Production Composition Roots and Runtime Authority

## Decision

Oracle adopts explicit target-specific composition roots for Web and Electron.
Both roots construct one shared dependency-injected Oracle Platform runtime.
Host-specific roots own host startup and shutdown only; they do not create
parallel Platform architectures.

The runtime composition manifest is the canonical runtime contract. Each root
must declare an immutable, versioned manifest independently from the runtime
instances it constructs. Certification must mechanically compare the
constructed runtime with that declared manifest. Missing, additional,
duplicated, reordered or differently identified runtime components constitute
an architectural failure and must fail startup closed.

Platform, Service, Application, Game Integration and Guidance dependencies are
supplied explicitly. Runtime registries are instance-owned. Process-global
registries and implicit module registration are prohibited as production
runtime authority.

Required subsystems fail startup closed. Optional subsystem failures remain
isolated and produce an observable degraded Platform state. Every composition
attempt exposes an immutable renderer-safe health projection identifying:

- composition contract and manifest version;
- target host;
- attempt identity and lifecycle state;
- declared subsystem requirement;
- actual subsystem readiness;
- renderer-safe diagnostics; and
- available Service, Application, Game Integration and Guidance identities.

Recovery constructs a fresh manifest-verified runtime and does not reuse
failed registries, providers, lifecycle objects or hidden mutable authority.

Next.js server instrumentation owns Web composition startup. Electron main owns
Desktop composition startup and shutdown.

The Platform Companion owns Platform-level capability readiness. The Desktop
Companion Session Manager retains authoritative Desktop Session and Context
lifecycle ownership. They are composed through an explicit lifecycle contract;
their state or authority is not merged.

Existing direct imports may remain only through the measured legacy migration
seam. The dependency-boundary baseline cannot grow, and later work must reduce
the seam over time.

This decision does not activate runtime persistence.

## Reason

Oracle's Platform, Service and Application registries, Companion foundation,
Game Integration registry and bootstrap existed as disconnected foundations.
Neither Web nor Electron invoked one authoritative composition, and the
existing bootstrap depended on global lower-layer registries.

Production-capable entry points require one inspectable answer to what was
declared, what was constructed, what became ready, what failed and which
capabilities remain safely available. Target-specific roots preserve genuine
host differences while a shared injected runtime prevents Web and Desktop from
becoming competing Oracle architectures.

Making the manifest canonical prevents documentation drift and hidden runtime
authority. Mechanical equality turns composition divergence into a
certification and startup failure rather than an operational surprise.

## Alternatives Considered

### One universal root with host conditionals

Rejected. It would combine Next.js, Electron and future host ownership inside
an increasingly conditional module and obscure genuine lifecycle boundaries.

### Global registries as production runtime authority

Rejected. Global mutable registration is an implicit service locator, weakens
test and recovery isolation, and can preserve hidden state across retries or
development reloads.

### Distributed self-bootstrap by Application or subsystem

Rejected. It creates multiple runtime authorities, duplicates capability
construction and cannot produce one authoritative health or readiness result.

### Continue deferring Platform activation

Rejected. It would preserve current behaviour temporarily but block the
approved Programme and allow legacy direct coupling to grow.

## Consequences

- Web and Electron gain explicit composition roots.
- The shared Platform runtime receives constructed dependencies rather than
  importing registration side effects.
- Service and Application registries become instance-owned.
- Game Integration and Guidance provider composition becomes explicit.
- Manifest equality becomes a mandatory mechanical certification gate.
- Required and optional subsystem semantics become part of runtime health.
- Desktop and Platform Companion lifecycles remain distinct and contractually
  composed.
- Runtime recovery replaces failed composition instances.
- New runtime capabilities must declare ownership, identity, requirement,
  compatibility and health behaviour.
- Service and Application global registry authority is removed. Any later
  registry is instance-owned and explicitly injected.

## Reversibility

Host adapters, dependency-injection construction and manifest versions may be
replaced through compatible or versioned successors. A future host can compose
the shared runtime without changing the four-layer architecture.

Returning to global registries, distributed bootstrap or parallel Web and
Desktop Platforms would require a superseding ADR and migration because later
Sprints will depend on this runtime authority.

## Risks

- incorrect required/optional classification could either block safe startup
  or expose an incomplete product;
- lifecycle drift could arise between Platform readiness and Desktop Session
  ownership;
- development reloads could create duplicate roots without idempotent host
  ownership;
- recovery could leak failed resources unless shutdown and replacement are
  deterministic;
- health projections could expose sensitive implementation detail;
- manifest maintenance could become ceremonial unless mechanically verified;
  and
- the legacy seam could stagnate instead of shrinking.

These risks require immutable contracts, exact manifest verification,
renderer-safe diagnostics, lifecycle tests, fresh recovery construction and a
non-growing dependency-boundary baseline.

## Authority Boundary

This ADR authorises Sprint 20 planning, implementation, local verification,
certification and documentation reconciliation only.

It does not authorise deployment, execution of any migration, reopening Gate C,
runtime persistence, production-environment changes or alteration of the
External Companion trust boundary.

## Status

Accepted — Founder-approved 24 July 2026.

---

# ADR-041

## Title

Authoritative Session Lifecycle and Companion Correlation

## Decision

The Oracle Session Service is the sole authority for the durable Oracle
Session aggregate and its lifecycle. A Session is the canonical historical
record of player activity.

Future subsystems may observe, analyse, enrich or present a Session, but they
must not become its lifecycle authority. Oracle has exactly one authoritative
Session lifecycle owner: the Session Service.

The Desktop Companion Session Manager remains the sole live device authority
for capture, attachment and current Companion Context. Desktop and Session
Service authority are correlated through an immutable, versioned,
non-merging contract. The durable Session identity remains stable across
begin, resume, recover, complete, abandon, history, export and deletion.

Every lifecycle command requires authenticated Operator ownership. Mutations
use idempotency keys and optimistic concurrency. Completion is terminal and
idempotent. Abandonment is explicit. Recovery constructs durable truth from
the Session Service rather than promoting Desktop memory into authority.

Evidence source owners retain authority over their source records. The Session
Service admits only explicit, minimised, policy-bound Evidence references and
provenance. Raw observations remain transient by default and gain no durable
retention authority through this decision.

Session deletion uses the recoverable Trust & Control orchestration established
by ADR-038. Eligibility is removed immediately; physical deletion is reported
truthfully as pending or complete across Session, Evidence and derived
Understanding owners. A content-free tombstone may exist only where already
permitted by ADR-038.

Session command, projection and Companion correlation contracts are immutable,
versioned and renderer-safe at presentation boundaries. Cross-Operator access
fails closed.

Sprint 21 must update the canonical ADR-040 runtime composition manifests for
every altered Service or lifecycle declaration and must continue to pass exact
mechanical manifest/runtime equality verification.

This decision does not activate runtime persistence.

## Reason

ADR-003 makes a Session Oracle's atomic intelligence unit, but the existing
system has an in-memory Desktop Companion Session and a separate thin
`oracle_sessions` report row. Neither provides one authenticated, recoverable
and governed historical lifecycle.

One Service-owned durable aggregate gives Web, Desktop, history, export,
deletion and future intelligence a single authority while preserving the
Desktop Companion's genuine device-side responsibilities. Explicit evidence
admission prevents observation from becoming retention by accident.

## Alternatives Considered

### Desktop-owned durable Sessions

Rejected. It would make a device component a durable Platform authority,
create multi-device conflict and recovery problems, and merge boundaries that
ADR-040 deliberately keeps distinct.

### Append-only Session event ledger as primary authority

Rejected for Sprint 21. Event sourcing would introduce a new Platform-wide
trust and persistence pattern, complicate deletion and minimisation, and
exceed the required lifecycle scope.

### Repository or database-owned lifecycle

Rejected. Repositories own persistence; Services own business behaviour.
Making database procedures the lifecycle authority would encourage host and
Application bypasses and couple Oracle's Session contract to one store.

## Consequences

- Session Service becomes the only durable lifecycle mutation boundary.
- Desktop retains live capture and Context authority without persistence
  authority.
- Web and Desktop use one versioned Session contract.
- One gameplay period can correlate to exactly one stable durable Session.
- Evidence is admitted deliberately and by reference rather than by retaining
  every observation.
- Session History, export and deletion consume Service-owned projections.
- Legacy direct `oracle_sessions` writes become a shrinking compatibility seam.
- Migration 013 may implement the approved durable schema but remains
  undeployed until separately authorised.
- Later Session Intelligence consumes completed, permitted Session projections
  and cannot own Session lifecycle.

## Reversibility

Transport, Repository and database implementations may be replaced behind
compatible versioned contracts. Correlation and recovery policies may evolve
through explicit contract versions.

Changing the durable lifecycle owner, merging Desktop and Service authority,
or adopting an event ledger as primary authority requires a superseding
Founder-approved ADR and a governed data migration.

## Risks

- retries or concurrent commands could create duplicate Sessions;
- Desktop and durable state could diverge during interruption;
- broad Evidence admission could retain raw content;
- deletion could be reported complete before all owners finish;
- projections could expose sensitive Evidence or diagnostics;
- legacy direct writes could bypass the Service; and
- manifest drift could hide the operational Session capability.

These risks require ownership-bound idempotency, optimistic concurrency,
cross-Operator isolation, explicit recovery, minimisation, deletion-topology
verification, renderer-safe projections, a shrinking legacy seam and exact
ADR-040 manifest equality.

## Authority Boundary

This ADR authorises Sprint 21 planning, source implementation, Migration 013
implementation, disposable PostgreSQL verification, local certification,
certification evidence and documentation reconciliation only.

It does not authorise production deployment; execution of Migration 010, 011,
012 or 013 in production; Gate C; runtime persistence; persisted producer or
consumer activation; production-environment changes; raw observation
retention; External Companion trust-boundary changes; or weakening ADR-040
manifest verification.

## Status

Accepted — Founder-approved 24 July 2026.

---

# ADR-042

## Title

Authoritative Operator Development Lifecycle and Progression Accounting

## Decision

Session Report Service remains the authoritative owner of factual Session
recommendations. AI Coach Service owns evidence-bound coaching focus and
presentation. Mission Engine owns deterministic Mission generation. Mission
Service is the sole authoritative Mission lifecycle owner. Planner Service owns
planning, prioritisation and scheduling projections without owning Mission or
progression state. Progression Service is the sole authority for XP,
Achievement and progression accounting.

Operator progression is earned only from verified Evidence. AI output,
client-side actions, renderer processes, language-model responses and other
non-authoritative components cannot award XP, Achievements, Missions or
progression. Progression mutations require authenticated Operator ownership,
stable identities, deterministic rules, idempotency and exactly-once
accounting.

Mission completion requires measurable criteria evaluated against approved
completed-Session Evidence. A versioned non-merging correlation connects the
source report recommendation, coaching focus, Mission, Planner projection,
later Session Evidence, completion and progression transaction. Replays return
the same result; competing mutations use optimistic concurrency.

Coaching effectiveness remains an evidence-backed correlation with scope,
confidence and limitations. Oracle must not state causation unless a stronger
methodology is explicitly approved through future governance.

Applications and renderers consume immutable renderer-safe projections. Game
measurement semantics remain within approved Game Integrations. Optional model
enrichment cannot generate completion Evidence, determine award eligibility or
become progression authority.

Trust & Control export, retention, deletion and tombstone orchestration applies
to every development owner. ADR-040 manifest equality and ADR-041 Session
authority remain mandatory. This decision does not activate persistence.

## Reason

The existing Mission, Planner, XP and Achievement paths are fragmented and
include direct browser-owned persistence. They cannot prove durable Mission
identity, evidence-bound completion or exactly-once rewards. Separate
authoritative Services preserve constitutional ownership while one correlation
contract makes the complete development journey inspectable.

## Alternatives Considered

### In-memory lifecycle only

Rejected because restart-safe history and exactly-once accounting are required.

### Extend browser-owned tables and direct writes

Rejected because Applications and renderers cannot own business lifecycle or
progression accounting.

### One monolithic Development Service

Rejected because it would collapse independent responsibilities and conflict
with Mission Engine generation authority.

## Consequences

- Mission Service owns Mission lifecycle and replay protection.
- Planner projections never complete Missions or award progression.
- Progression uses append-only idempotent transactions and compensating
  corrections rather than history rewriting.
- Existing XP and Achievement storage becomes a compatibility projection.
- Migration 014 may implement the durable schema but remains undeployed until
  separately authorised.
- Manifest inventory and lifecycle declarations must be versioned and
  mechanically equal for Web and Electron.

## Reversibility

Implementations, transports, Repositories, reward formulae and presentation
may change behind versioned contracts. Changing authoritative Mission or
Progression ownership requires a superseding Founder-approved ADR and governed
migration.

## Authority Boundary

This ADR authorises Sprint 24 planning, source implementation, Migration 014
implementation, disposable PostgreSQL verification, local certification,
manifest reconciliation and documentation reconciliation only.

It does not authorise production deployment; execution of Migrations 010–014
in production; Gate C; runtime persistence; persisted producer or consumer
activation; production-environment changes; External Companion trust-boundary
changes; or weakening ADR-040, ADR-041 or ADR-042.

## Status

Accepted — Founder-approved 24 July 2026.

---

# ADR-043

## Title

Grounded Conversation, Model Provider, Provenance and Retention Boundaries

## Decision

Conversation Service owns conversational orchestration and presentation, never
underlying truth. Existing Oracle Services remain the sole authorities for
facts, lifecycle and mutation. Retrieval is authenticated, allowlisted,
purpose-scoped and read-only.

Conversation uses deterministic intent classification and retrieval planning.
Models receive only minimised, versioned evidence packets and have no direct
Repository, Service, Session, Understanding, Mission, Progression, tool or
mutation authority. Model output is schema-validated, non-authoritative
presentation synthesis. Deterministic handlers remain responsible for factual
answers and provider-outage fallback.

Every substantive renderer-safe response exposes evidence, provenance,
confidence, freshness, scope and limitations. Factual model references must
close over the admitted evidence packet. Unsupported, stale, prohibited and
cross-Operator requests fail closed or require clarification.

System instructions, user content and retrieved content are structurally
separated. User and retrieved content are untrusted data and can never grant
authority or issue instructions. Provider packets exclude credentials, raw
observations and unrelated Operator data.

Conversation is transient by default. Sprint 25 stores no transcript, prompt,
provider response, Evidence, Understanding, Memory or authoritative state. Any
future retention requires separate Founder governance and Trust & Control
integration.

The canonical ADR-040 manifest declares the Conversation Service. Web and
Electron must continue to match it mechanically. This decision does not
activate runtime persistence.

## Reason

Oracle needs natural-language explanation across existing authoritative
Services without allowing a model, prompt or presentation layer to become a
new source of truth. A grounded transient boundary preserves ownership,
minimises disclosure and remains useful during provider outage.

## Alternatives Considered

Persisted conversation history was rejected because it creates a sensitive
retention domain. A model-native agent with direct tools was rejected because
prompt injection could influence authority-bearing operations. Deterministic
conversation alone was rejected as the sole experience, but remains the
mandatory factual authority and outage fallback.

## Consequences

- Conversation Service owns orchestration only.
- Source Services provide authenticated read-only projections.
- Provider failure produces an observable degraded response.
- Strict grounding may clarify or refuse broad, stale or unsupported requests.
- No Migration 015 is required.

## Reversibility

Providers, prompts, classifiers and synthesis implementations may be replaced
behind compatible contracts. Retention may be introduced only through a
separately approved decision. Direct model authority or weaker grounding
requires a superseding Founder-approved ADR.

## Authority Boundary

This ADR authorises Sprint 25 planning, source implementation, local
verification, certification, manifest reconciliation and documentation only.
It does not authorise production deployment, any migration, conversation
retention, runtime persistence, persisted producers or consumers, Gate C,
production changes, model mutation or direct tool authority, or weakening
ADR-040 through ADR-043.

## Status

Accepted — Founder-approved 25 July 2026.

---

# ADR-044

## Title

Companion Observation Privacy, Consent and Ephemerality

## Decision

Oracle Companion may observe visible pixels only through an external,
Operator-enabled and purpose-scoped desktop boundary. Observation is disabled
by default. Enabling it requires an explicit transient consent action for the
currently attached supported target and approved observation purpose.

Active observation must always have a renderer-safe visible indicator.
Pause, revoke, detach, target replacement, process loss, unsupported display
mode, certificate invalidation and runtime recovery stop observation and
invalidate pending work immediately.

Capture is restricted to the attached game window and versioned allowlisted
regions. The capture implementation must reject screens, unrelated windows,
unapproved regions, minimized targets and dimensions outside the certified
profile. Renderers receive observation state and bounded controls only; they
never receive pixels, native images, capture sources, window handles or
recognizer implementations.

Sprint 27 processing is local only. Raw frames are transient capabilities:
they may exist only inside one capture operation, must never be logged,
serialized, retained, cached, uploaded or projected to another boundary, and
must be released and overwritten where practical immediately after local
recognition. Screenshots and clips are not created.

Derived observations must be immutable, schema-validated, confidence-bearing,
freshness-bounded, purpose-scoped and non-authoritative. Low-confidence,
contradictory, stale or out-of-profile results fail closed and cannot advance
Context. Contextual progress is an instance-owned transient projection. It
cannot create or mutate Session, Evidence, Understanding, Memory, Mission,
Progression or any other authoritative Oracle state.

Any retention, upload, external processing, cross-session progress, hidden
observation or additional observation purpose requires a new Founder decision.

## Reason

Visible desktop pixels can contain unrelated and sensitive information even
when capture is technically possible. Permission to observe is not permission
to retain, upload, infer broadly or create durable truth. A permanent,
fail-closed boundary makes consent, minimisation and ephemerality structural
properties of the Companion rather than integration-specific conventions.

## Alternatives Considered

Always-on capture was rejected because it removes meaningful consent and
increases privacy exposure. Full-display capture was rejected because it can
collect unrelated applications and notifications. Frame retention for later
analysis was rejected because it creates a new sensitive retention domain.
Cloud OCR was rejected because Sprint 27 authorises no upload or external
processing.

## Consequences

- observation begins only after explicit transient consent;
- capture indication and immediate pause/revoke are mandatory;
- raw frames never cross the local observation operation;
- recognition must work from bounded local input;
- recovery constructs a fresh observation runtime with consent disabled;
- uncertainty reduces capability rather than broadening capture; and
- durable progress remains unavailable in Sprint 27.

## Reversibility

Capture and local recognition implementations may be replaced behind the same
boundary. Allowlisted regions and purposes may evolve through versioned,
certified profiles. Weakening consent, minimisation, local processing or
ephemerality requires a superseding Founder-approved ADR.

## Authority Boundary

This ADR authorises the bounded Sprint 27 Windows single-player observation
implementation, local verification, certification and documentation only. It
does not authorise production deployment, persistence, retention, upload,
external processing, multiplayer, game APIs, mods, automated input,
authoritative mutation or any change to ADR-031's External Companion boundary.

## Status

Accepted — Founder-approved 25 July 2026.

---

# ADR-045

## Title

Game Integration Compatibility and Certification

## Decision

Oracle support is governed by immutable, versioned compatibility certificates.
Support must never be represented as a permanent boolean.

Every certificate has one explicit lifecycle state:

- `certified` — all declared capabilities are currently verified for the exact
  profile and may operate;
- `provisionally-certified` — the profile is under bounded revalidation;
  only capabilities independently proven unaffected may operate and every
  capability affected by uncertainty remains disabled;
- `expired` — the review interval elapsed and all profile capabilities are
  disabled; or
- `revoked` — policy, account-safety, version, executable, capture, integration
  or incident evidence invalidated the certificate and all capabilities are
  disabled immediately.

Provisionally certified is fail-closed. It never means "probably supported"
and cannot preserve a capability whose relevant assumption is uncertain.

Certificates bind the game, edition, version, operating system, executable
identity, locale, display mode, UI assumptions, player mode, observation
methods, capability set, policy sources, review evidence, issue time and expiry
time. The maximum review interval is 90 days. Material publisher-policy,
account-safety, game-version, executable, capture-assumption or integration
changes invalidate the affected certificate immediately.

Runtime eligibility is resolved from the certificate state, exact profile
match and per-capability evidence. Unknown, missing, malformed, mismatched,
expired or revoked certificates fail closed. Detection may identify a game
without representing it as supported.

Every Game Integration must pass common deterministic detection, immutable
Context, serialisation, observation, privacy, Guidance, performance,
invalidation and failure conformance tests. Game-specific recognition and
knowledge remain inside the Game Integration. Shared Platform code consumes
only versioned serializable contracts.

Certification, deployment and activation remain independent lifecycle states.
ADR-040 manifest equality remains mandatory whenever an integration or provider
changes runtime composition.

## Initial Certificate

Sprint 27 may create one certificate for:

- Minecraft: Java Edition `26.1.1`;
- Windows;
- Founder-controlled single-player;
- English (United States);
- windowed or borderless-windowed mode;
- the bounded UI scale and capture regions recorded by the certificate;
- local screen observation only; and
- one original text-only diamond advancement/discovery Guidance journey.

Multiplayer, Realms, servers, mods, add-ons, plugins, APIs, other versions,
locales and display profiles are outside the certificate.

## Reason

Publisher rules, anti-cheat systems, executables and UI assumptions change.
A simple `supported` flag would silently outlive the evidence that justified
it. Explicit lifecycle and expiry make account safety, policy drift and
capability reduction visible and mechanically enforceable.

## Alternatives Considered

A permanent support boolean was rejected because it cannot express review or
invalidation. Manual documentation without runtime enforcement was rejected
because stale claims could remain active. Treating provisional status as broad
temporary support was rejected because uncertainty must disable affected
capabilities. Per-launch publisher networking was rejected because it adds an
unapproved remote dependency and cannot replace reviewed interpretation.

## Consequences

- exact profiles, not game names, are certified;
- certificates expire after at most 90 days;
- material changes revoke support immediately;
- provisional capability is explicitly narrowed;
- unsupported modes remain detectable but ineligible;
- future integrations reuse one conformance suite; and
- release claims must name the certified scope.

## Reversibility

Certificates can expire or be revoked without migrating data. New profiles,
versions, locales and modes can be added independently after evidence review.
Removing an integration from composition is safe because Sprint 27 creates no
durable observation or progress. Replacing the lifecycle model or weakening
fail-closed semantics requires a superseding Founder-approved ADR.

## Authority Boundary

This ADR authorises Sprint 27 source implementation, local certification,
manifest 1.6.0 reconciliation and documentation only. It does not authorise
production deployment, migrations, persistence, broad Minecraft support,
multiplayer, APIs, mods, External Companion boundary changes or weakening
ADR-031 through ADR-044.

## Status

Accepted — Founder-approved 25 July 2026.

---

# ADR-046

## Title

Desktop Distribution, Release Integrity and Update Authority

## Decision

Oracle's Windows Desktop distribution uses a governed MSIX package. Windows
package deployment owns installation, package replacement, repair and removal.
An instance-owned Desktop Update Coordinator in the Electron main process may
check the configured release channel, validate release eligibility, coordinate
safe Companion detach and runtime shutdown, and project immutable update state
to the renderer. It cannot create or modify Oracle truth.

The immutable, versioned and signed Oracle Release Manifest is the canonical
distribution contract. It declares the exact package identity, publisher
identity, release channel, version, architecture, artifact hashes, native-
helper hashes, runtime composition-manifest version, rollback eligibility,
provenance and SBOM references. Certification must mechanically verify that the
constructed package and every declared artifact exactly match the manifest.
Any divergence is a release failure.

The Release Manifest and ADR-040 runtime composition manifest govern separate
contracts. The Release Manifest answers exactly what Oracle distributes. The
runtime composition manifest answers exactly what Oracle constructs. Neither
may replace or weaken the other.

Package, executable, native-helper and Release Manifest signatures are
mandatory for an externally distributable release. Production signing
credentials must be non-exportable, externally protected and unavailable to
source code, artifacts, renderers, runtime Services and developer
workstations. Release automation may receive only short-lived,
least-privilege signing authority.

Release channels are isolated and versioned. Unknown, missing, malformed,
unsigned, altered, cross-channel, wrong-identity or unauthorised-version
artifacts fail closed. Rollback is not a general downgrade capability. A
rollback target must remain signed, explicitly authorised by the active
channel contract and compatible with the current local-data schema.

The packaged renderer remains presentation-only. It receives validated
availability, progress, failure, limitation and recovery projections plus
bounded check, consent, defer and restart controls. It receives no package
path, release URL, signing material, filesystem authority, process object,
installer handle or arbitrary execution capability.

Release builds load only packaged immutable renderer content and allowlisted
HTTPS Service endpoints. They must not depend on a separately started
development server or execute remotely supplied renderer code. Renderer
sandboxing, context isolation, disabled Node integration, navigation
allowlisting and IPC sender validation are mandatory.

Update and repair preserve the OS-protected encrypted refresh-token vault and
required trusted-device metadata. Uninstall removes Oracle binaries, native
helpers, update cache, transient diagnostics and the local encrypted
credential vault. It does not delete the permanent Operator or authoritative
server-owned data. Online device revocation uses the existing Trust & Control
lifecycle; offline uninstall clears local credentials immediately without
inventing remote revocation success.

The following principle is permanent:

> **Local test signing proves packaging and distribution mechanics only. It
> must never be interpreted as production publisher trust, public release
> readiness, operational certification, deployment authority or permission to
> distribute Oracle externally.**

Accordingly:

- packaged does not mean published;
- locally signed does not mean production trusted;
- locally certified does not mean externally distributed; and
- release mechanics proven does not mean production release authorised.

These distinctions survive Sprint 29 closure and every future local
certification.

## Reason

Installer and update mechanisms can replace executable software on an
Operator's machine. Without a canonical signed contract and a single
least-privilege authority, a compromised signing identity, mutable release
feed, renderer-controlled updater, confused channel, substituted helper or
destructive uninstall could bypass Oracle's established runtime boundaries.

MSIX provides Windows package identity, signature enforcement and
transactional package deployment. The additional Release Manifest prevents
the packaging tool or hosting layout from becoming informal architecture and
makes the intended artifact set mechanically auditable.

## Alternatives Considered

Microsoft Store-first MSIX was rejected as the initial Sprint 29 path because
it would introduce publication, Partner Center and third-party review
decisions beyond local implementation and certification.

A direct Squirrel, WiX or NSIS installer with an application-managed updater
was rejected as the default because it gives Oracle more privileged
replacement, repair and rollback code and creates a larger custom update
attack surface.

A signed manual installer without updates was rejected because it does not
satisfy secure maintenance, recovery or version-governance requirements.

## Consequences

- Windows package deployment is the sole install, replace, repair and remove
  authority.
- The Release Manifest becomes a permanent mechanically verified
  distribution contract.
- Release and runtime manifests remain independently mandatory.
- Update coordination is main-process-only, instance-owned and
  renderer-safe.
- Safe detach and fresh runtime construction precede replacement or recovery.
- `beta` and `stable` channels remain isolated; Sprint 29 exercises only
  `beta`.
- Test and production signing identities are structurally distinct.
- Local certification cannot create a publication, trust, distribution or
  deployment claim.
- Production publisher identity, managed signing, hosting and rollout remain
  separate Founder operational gates.

## Reversibility

Packaging tools and release hosting may change behind the Release Manifest and
Windows package authority. A future Store channel may reuse the same MSIX
model.

Package identity and publisher identity become difficult to change after
external distribution because Windows uses them for trust and update
continuity. Sprint 29 therefore uses an explicitly non-production test
identity and grants no authority to establish or publish the production
identity.

Weakening the Release Manifest, mechanical equality, renderer isolation,
channel separation, production-key protection or permanent local-signing
distinction requires a superseding Founder-approved ADR.

## Authority Boundary

This ADR authorises Sprint 29 planning, source implementation, project-local
packaging dependencies, isolated self-signed test identities, local Windows
packaging, local install/update/repair/rollback/uninstall tests, SBOM and
provenance generation, clean-machine local certification and documentation.

It does not authorise production publisher registration, certificate purchase,
production signing credentials, managed signing enrolment, release hosting,
Store submission, external distribution, publication, deployment, remote
push, database migrations, runtime persistence, persisted producers or
consumers, Gate C, Minecraft certificate promotion or observation activation,
retention, AI/renderer/updater authority over Oracle truth, Guidance v2,
Desktop Platform API v2, External Companion boundary changes or weakening
ADR-040 through ADR-045.

## Status

Accepted — Founder-approved 25 July 2026.

---

# ADR-047

## Title

Privacy-Safe Operational Diagnostics and Crash Reporting

## Decision

Oracle owns one governed operational-diagnostics capability for diagnosing,
recovering, supporting and improving Oracle as software. Operational
diagnostics are non-authoritative and remain structurally separate from
Operator Intelligence and every lifecycle that creates Oracle Truth.

The following principle is permanent:

> **Operational diagnostics exist solely to diagnose, recover, support and
> improve Oracle as software. They must never become a source of Operator
> Intelligence, Memory, behavioural profiling, gameplay understanding or
> Oracle Truth.**

Diagnostic data must never:

- become Evidence, Understanding or Memory;
- influence coaching, recommendations, planning, Missions, progression or
  future intelligence;
- enter an Operator profile or cross-session behavioural record;
- contain raw frames, screenshots, clips, captured content, credentials,
  tokens, prompts, provider responses or authoritative Oracle payloads; or
- grant mutation, tool, Service, Repository or lifecycle authority.

Every admitted diagnostic uses a versioned immutable envelope with fixed
`software-support` purpose and `non-authoritative` authority. Admission is
explicit, schema-bound, code-allowlisted, field-minimised and fail-closed.
Arbitrary messages and undeclared attributes are prohibited. Diagnostic
definitions own stable summaries and exact allowed attributes.

The admission service and diagnostic sink are explicitly injected and
instance-owned. Required admission and privacy controls fail startup or
admission closed. Optional delivery may enter an observable degraded state,
but uncertainty never broadens collection.

Renderers may receive only bounded immutable health or support projections.
They receive no diagnostic sink, transport, filesystem, process, native,
credential or arbitrary-query authority.

Sprint 30 local certification uses only a bounded process-memory sink with no
filesystem or network transport. Stop and recovery clear the sink and construct
fresh diagnostic state. No production endpoint, external provider, automatic
upload, retention period or consent model is approved.

Any future external provider, upload, retention, production telemetry or
support-correlation model requires a new Founder decision and applicable
privacy, consent, security and trust-boundary review.

If diagnostics become part of runtime construction, ADR-040 requires both
target-specific canonical manifests to declare the exact capability and
mechanically equal their constructed runtimes.

## Reason

Operational failures must be diagnosable without creating a shadow
intelligence system or silently collecting sensitive Operator or gameplay
content. A narrow Platform-owned admission boundary makes privacy,
non-authority, minimisation and ephemerality enforceable rather than relying on
logging conventions.

## Alternatives Considered

Unstructured application logging was rejected because arbitrary messages and
fields can leak sensitive content and cannot be governed mechanically.

Reusing Evidence, Understanding or Memory storage was rejected because
software-support data has a different purpose and must never influence
Operator Intelligence.

A production external crash-reporting provider was rejected for Sprint 30
because it would create unapproved upload, processing, retention, consent and
trust boundaries.

Disabling all diagnostic work was rejected because Sprint 30 must establish
repeatable privacy-safe support and recovery evidence.

## Consequences

- Operational diagnostics become a governed Platform capability.
- Stable diagnostic definitions replace arbitrary support messages.
- Diagnostic admission can reject information even when a subsystem can see
  it.
- Local qualification proves the contract and privacy controls, not production
  telemetry operation.
- A future provider may replace the sink only behind the same non-authoritative
  admission boundary and separate Founder authority.

## Reversibility

Definitions, local sinks and future providers are replaceable behind the
versioned contract. Local qualification state is transient and removable.

The separation from Oracle Intelligence and the prohibition on diagnostic
truth or mutation authority are permanent. Weakening them requires a
Founder-approved superseding ADR.

## Authority Boundary

This ADR authorises Sprint 30 planning, source implementation, isolated local
verification, disposable qualification persistence and certification evidence
under the approved phased plan.

It does not authorise production deployment, production database migration,
production persistence, Gate C, production signing, publication, external
distribution, production telemetry, external crash-reporting providers,
automatic upload, retention, Guidance v2, Desktop Platform API v2, Gate 7
approval, Sprint 31, Beta certification, release, remote push or weakening
ADR-040 through ADR-046.

## Status

Accepted — Founder-approved 26 July 2026.

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
