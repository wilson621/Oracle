# SPRINT 21 FOUNDER ARCHITECTURAL DECISION REQUIRED

**Sprint:** 21 — Oracle Session and Evidence Lifecycle

**Status:** Discovery complete; not activated; implementation not started

**Decision requested:** Authorise ADR-041 — Durable Oracle Session Lifecycle
and Evidence Authority

**Prepared:** 24 July 2026

## Architectural problem

ADR-003 establishes an Oracle Session as the atomic unit of intelligence, but
the current implementation has two incomplete and different Session concepts:

- the Desktop Companion Session Manager owns live, device-side Session and
  Context transitions in memory; and
- the legacy `oracle_sessions` repository stores thin analysis/report rows
  directly through Supabase.

Sprint 21 must create one durable, authenticated and recoverable Oracle Session
without transferring Electron state into the server, allowing Web and Desktop
to compete for authority, treating all observations as evidence, or making a
Repository the owner of business lifecycle.

The decision must also settle stable identity, idempotency, evidence-source
ownership, recovery, completion, abandonment, renderer-safe status, export and
the relationship between Session deletion and derived Operator Understanding.

## Options considered

### Option A — Session Service owns the durable aggregate; Desktop owns live capture

The Oracle Session Service is the sole authority for the durable Session
aggregate and its lifecycle state. It issues or accepts a collision-resistant
stable Session identity through an idempotent authenticated begin command.
Web and Desktop invoke the same Service contract.

The Desktop Companion Session Manager remains the sole device-side authority
for live capture, attachment and current Companion Context. It acts as an
authenticated adapter to the Session Service and correlates its live state to
one durable Session identity. It does not become a persistence authority.

Evidence source owners retain their own source records. The Session Service
admits only minimised, policy-permitted evidence references and provenance
into the Session. Raw observations are transient unless a separately approved
contract and retention policy authorises durability.

Lifecycle transitions use optimistic concurrency and idempotency keys.
Completion is terminal and repeatable; interrupted active Sessions can resume
or recover through the durable Service state. Abandonment is explicit.
Deletion uses the existing Trust & Control orchestration: it immediately
removes eligibility, then reports pending or complete physical deletion
truthfully across the Session, admitted evidence and derived Understanding
owners.

Advantages:

- one durable authority for Web, Desktop, history, export and recovery;
- preserves Desktop ownership of live device state and ADR-040's non-merging
  lifecycle boundary;
- keeps business behaviour in Services and persistence in Repositories;
- provides a natural transaction and idempotency boundary;
- prevents unapproved raw observation retention;
- supports later Session Intelligence without making credentials,
  presentation or a device the Operator identity.

Disadvantages:

- requires a versioned command and projection contract between Desktop and the
  Session Service;
- offline interruption needs an explicit bounded reconciliation protocol;
- deletion spans multiple owners and cannot always be one transaction;
- requires a schema migration that must be separately implemented, certified
  and later deployed under its own authority.

### Option B — Desktop Companion owns the durable Session and synchronises it

The Desktop Companion Session Manager becomes the canonical Session authority.
It creates and evolves the durable aggregate locally, then synchronises state
to Oracle Services.

Advantages:

- naturally follows the source of desktop observations;
- can continue locally during temporary network loss;
- reduces initial round trips for desktop lifecycle changes.

Disadvantages:

- makes a device lifecycle component an enterprise data authority;
- complicates authenticated ownership, multi-device conflict resolution,
  deletion, Web-originated Sessions and cross-device recovery;
- risks local credential-adjacent storage growth and stale replicas;
- merges the live capture and durable Platform boundaries that ADR-040 kept
  distinct;
- creates a second durable architecture for non-Desktop Sessions.

Long term, Oracle would need distributed conflict resolution and a trusted
local database before it needs either. This option is viable but misaligned
with the existing architecture.

### Option C — An append-only Session event ledger is the primary authority

Every begin, observation admission, transition, recovery and deletion action
is appended as an immutable event. Current Session state is rebuilt into
projections.

Advantages:

- strong auditability and deterministic replay;
- naturally represents interrupted and repeated commands;
- supports future analytical projections.

Disadvantages:

- introduces event sourcing as a new platform-wide architectural pattern;
- materially increases projection, versioning, privacy and deletion
  complexity;
- immutable event content can conflict with deletion and minimisation duties;
- is disproportionate to the current product and operational maturity.

It could become appropriate later for non-content lifecycle metadata, but
adopting it now would broaden Sprint 21 and make the event ledger a new trust
boundary.

### Option D — Repository/database owns the lifecycle

Web and Desktop call stored procedures or Repository functions that encode
Session transitions, with no authoritative Session Service aggregate.

Advantages:

- direct transactional enforcement;
- comparatively small initial application-layer implementation;
- central state is immediately queryable.

Disadvantages:

- violates the established rule that Repositories own persistence while
  Services own business behaviour;
- couples product lifecycle to one storage model;
- weakens contract-level testing and renderer-safe projections;
- encourages Applications and hosts to bypass Services;
- makes evidence policy and recovery behaviour difficult to evolve.

This option is technically possible but architecturally regressive.

## Recommendation

Approve Option A.

It creates one durable Oracle Session authority while preserving the existing,
proven Desktop Companion boundary. It is the smallest architecture that
satisfies ADR-003, ADR-040, Trust & Control, evidence minimisation, Web/Desktop
convergence and later Session Intelligence.

The canonical runtime manifests must be updated because Sprint 21 will turn
the registered `sessions` Service from metadata into an operational runtime
capability and may alter its health/lifecycle contract. Mechanical
manifest/runtime equality remains mandatory.

## Proposed ADR-041 decisions

If approved, ADR-041 will establish:

- the Session Service as sole durable Session aggregate and lifecycle
  authority;
- the Desktop Companion Session Manager as sole live device capture,
  attachment and current Context authority;
- a non-merging, versioned correlation contract between those authorities;
- one stable Session identity across begin, resume, recover, complete,
  abandon, history, export and deletion;
- authenticated Operator ownership on every command and projection;
- idempotency keys plus optimistic concurrency for lifecycle mutation;
- terminal, idempotent completion and explicit abandonment;
- evidence-source owners retaining source-record authority;
- explicit, minimised, policy-bound evidence admission by the Session Service;
- raw observations remaining transient by default;
- renderer-safe immutable Session status projections;
- recoverable deletion orchestration under ADR-038 rather than false atomic
  completion;
- exact composition-manifest updates and verification under ADR-040; and
- no runtime persistence activation until separately authorised.

ADR-003 and ADR-040 remain unchanged. ADR-041 will refine their relationship
for durable Sessions. No accepted ADR needs amendment.

## Long-term implications

Oracle gains a single Session contract usable by Web, Desktop, history,
Intelligence and future clients. New capture sources can integrate as adapters
without becoming lifecycle authorities. Later Session Intelligence consumes
completed, admitted Session projections rather than raw device state.

The separation also allows the durable store, transport and desktop capture
implementation to evolve independently. It does require all future Session
producers to use the Service contract and requires the legacy direct
`oracle_sessions` paths to shrink rather than expand.

## Reversibility

The transport, Repository and storage schema are replaceable behind versioned
Service contracts. Desktop correlation and recovery policy can evolve through
compatible contract versions.

Changing which component owns the durable aggregate, merging Desktop and
Service authority, or adopting event sourcing as the primary authority would
require a superseding Founder-approved ADR and a governed data migration.

## Risks introduced by the recommendation

- concurrent or retried commands could create duplicates unless idempotency and
  ownership are enforced together;
- clock or connectivity loss could leave Desktop and durable status temporarily
  divergent;
- a broad evidence contract could accidentally retain raw content;
- deletion could be falsely reported complete while derived owners remain;
- renderer projections could leak sensitive evidence or diagnostics;
- the existing thin Session schema may tempt compatibility shortcuts;
- activating persistence accidentally would exceed Sprint authority; and
- manifest drift could hide the operational Session capability.

Certification must therefore cover concurrency, retry, cross-Operator
isolation, interruption and recovery, minimisation, deletion topology,
renderer safety, migration immutability, disabled runtime persistence and exact
manifest equality.

## Authority requested

Founder approval of Option A would authorise:

- creation of ADR-041;
- Sprint 21 planning;
- Sprint 21 implementation;
- a new Migration 013 only for the approved durable Session and evidence
  lifecycle schema;
- disposable local PostgreSQL verification;
- local verification and certification; and
- documentation reconciliation.

It would not authorise:

- production deployment;
- execution of Migration 010, 011, 012 or 013 in production;
- reopening Gate C;
- activation of runtime persistence;
- production environment changes;
- alteration of the External Companion trust boundary;
- broad raw observation retention;
- event sourcing as a Platform authority; or
- weakening or bypassing ADR-040 manifest verification.

## Required Founder decision

Approve, reject or amend Option A and the proposed ADR-041 authority boundary.
Sprint 21 implementation has not started and will not start until that
architectural decision is formally made.
