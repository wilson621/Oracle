# ORACLE SPRINT 21 ENGINEERING PLAN

**Sprint:** 21 — Oracle Session and Evidence Lifecycle
**Authority:** Founder-approved beneath ADR-041 and the Oracle Engineering
Programme
**Owner:** Oracle Platform Engineering
**Status:** Complete, certified and Founder-accepted
**Prepared:** 24 July 2026
**Approved:** 24 July 2026
**Activated:** 24 July 2026
**Closed:** 24 July 2026
**Production:** No deployment, migration execution or runtime activation
authorised

## Objective

Make one Oracle Session an authenticated, authoritative and recoverable
historical record from begin through completion, abandonment, recovery, export
and deletion.

## Architectural invariants

- Session Service is the only durable lifecycle authority.
- Desktop Companion is the only live device capture, attachment and current
  Context authority.
- Their immutable versioned correlation contract never merges those owners.
- Every mutation is authenticated, Operator-bound, idempotent and
  concurrency-safe.
- Evidence admission is explicit, minimised, policy-bound and source-owned.
- Raw observations are transient by default.
- Session deletion follows ADR-038 recoverable orchestration.
- Renderer projections contain no raw Evidence or internal diagnostics.
- ADR-040 canonical manifests exactly equal constructed runtimes.
- Runtime persistence remains disabled.

## Delivery phases

### Phase 1 — Contracts and lifecycle

- immutable Session aggregate and lifecycle command contracts;
- begin, resume, complete, abandon and recover transitions;
- stable identity, idempotency and optimistic versioning;
- Evidence-source and admission contracts;
- renderer-safe status, history, detail and export projections;
- versioned Companion correlation contract.

### Phase 2 — Persistence

- Migration 013 durable Session, lifecycle receipt, Evidence reference and
  deletion-orchestration schema;
- RLS, authenticated ownership and trusted mutation functions;
- exclusive Repository implementation;
- deterministic pagination, filtering and idempotent command storage;
- disposable PostgreSQL migration, rollback and isolation certification.

### Phase 3 — Runtime integration

- operational Session Service injected through composition roots;
- canonical Web and Electron manifest updates;
- Desktop correlation without Desktop persistence authority;
- Applications-owned Session History queries and projections;
- controlled legacy direct-write seam reduction;
- lifecycle diagnostics and metrics.

### Phase 4 — Certification

- focused contract and lifecycle verification;
- persistence, concurrency, retry, recovery and RLS verification;
- evidence minimisation and cross-Operator isolation;
- deletion topology and truthful status;
- renderer-safety and export verification;
- exact manifest/runtime equality;
- TypeScript, Desktop TypeScript, lint, build and architecture audit;
- immutable Migration 009–012 hashes.

## Explicit exclusions

- production deployment or production migration execution;
- runtime persistence or persisted producer/consumer activation;
- Gate C;
- raw screenshot, prompt, game-memory or observation retention;
- Session Intelligence, coaching or inferred Understanding generation;
- External Companion trust-boundary changes;
- event sourcing;
- replacement of ADR-038 retention policy;
- migration of unrelated legacy product paths.

## Definition of done

One supported gameplay period maps to exactly one authoritative, recoverable
Session owned by the authenticated Operator. Completion is idempotent,
Evidence is traceable and permitted, history is real and isolated, export is
renderer-safe, deletion truthfully coordinates related owners, composition
manifests match mechanically, and all work remains undeployed and inactive.
