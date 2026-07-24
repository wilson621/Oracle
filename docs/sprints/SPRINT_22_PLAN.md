# ORACLE SPRINT 22 ENGINEERING PLAN

**Sprint:** 22 — Operator Understanding Accumulation
**Authority:** Founder-authorised beneath ADR-033 through ADR-040 and the
Oracle Engineering Programme
**Owner:** Oracle Platform Engineering
**Status:** Implementation complete and locally certified; Founder acceptance
pending
**Prepared:** 24 July 2026
**Activated:** 24 July 2026
**Certified:** 24 July 2026
**Production:** No deployment, migration execution, persisted producer or
runtime-persistence activation authorised

## Objective

Safely transform admitted evidence from completed Sessions into revisable,
governed and purpose-scoped Operator Understanding without turning existing
heuristics into facts.

## Architectural invariants

- Operator Intelligence Service remains the sole claim-lifecycle authority.
- Session Service remains the sole Session-lifecycle authority.
- Memory remains a specialised producer and does not own durable claims.
- Only recurring game strength and recurring game weakness candidates are
  admitted.
- Candidate identities are stable and repeated processing is idempotent.
- Game-scoped evidence cannot become Operator-wide or cross-game
  Understanding.
- Suspected candidates are not eligible for ordinary personalisation.
- Acceptance depends on an injected, versioned policy; production thresholds
  and retention durations are not invented by implementation.
- Confidence preserves the producer-native value and separately explains the
  accepted-claim assessment.
- Every transition remains evidence-backed, explainable, inspectable,
  reversible where allowed, and subject to Trust & Control deletion.
- Understanding Snapshots are immutable, purpose-scoped, freshness-bound and
  budgeted read projections, never a source of truth.
- Sensitive, AI-generated and implicit cross-game inference remains rejected.
- Runtime persistence and persisted producers or consumers remain disabled.

## Delivery phases

### Phase 1 — Accumulation contracts

- recurring Memory candidate adapter;
- stable natural identity and duplicate suppression;
- explicit accumulation policy reference;
- supporting and contradicting Evidence relationships;
- producer-native confidence preservation;
- deterministic accepted-claim explanation.

### Phase 2 — Governed lifecycle

- suspected candidate, acceptance and reassessment;
- contradiction, expiry, supersession, dispute and deletion;
- monotonic immutable revisions;
- inspectable transition and eligibility history;
- authenticated Operator ownership at the Service boundary.

### Phase 3 — Projections and Context gate

- purpose-scoped Understanding Snapshot construction;
- explicit Unknown and excluded Suspected behaviour;
- item, evidence-fan-out, payload and freshness budgets;
- explicit Oracle Context eligibility gate;
- renderer-safe projection with no raw observations.

### Phase 4 — Certification

- trace one claim through candidate, acceptance, contradiction, dispute,
  supersession and deletion;
- prove stable identity, idempotency and duplicate suppression;
- reject non-completed Sessions, unsupported claim families, sensitive
  inference, AI-generated inference and cross-game scope widening;
- verify Snapshot budgets, freshness, purpose and Context gating;
- run TypeScript, Desktop TypeScript, lint, production build, architecture
  audit and all existing focused verification;
- confirm Migrations 009–013 remain unchanged, certified, undeployed as
  applicable, and inactive.

## Schema decision

Sprint 22 introduces no Migration 014. Migrations 009 and 010 already contain
the approved claim, immutable revision, Evidence, eligibility and Trust &
Control persistence topology. Sprint 22 implements and certifies the source
boundary without deploying or activating those stores.

## Explicit exclusions

- production deployment or migration execution;
- Gate C;
- runtime persistence or persisted producer/consumer activation;
- production accumulation-policy values;
- raw observation retention;
- sensitive or AI-generated inference;
- cross-game portability or Operator-wide promotion;
- live Guidance activation;
- External Companion trust-boundary changes.

## Definition of done

A completed Session can contribute only admitted evidence to the approved
recurring game-pattern family. The resulting claim lifecycle is stable,
idempotent, scoped, evidence-backed, policy-governed, explainable, inspectable
and controllable. Only fresh, active and purpose-eligible inferred claims may
enter a bounded Snapshot or Oracle Context projection.
