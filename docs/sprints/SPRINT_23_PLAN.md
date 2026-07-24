# ORACLE SPRINT 23 ENGINEERING PLAN

**Sprint:** 23 — Oracle Session Intelligence
**Authority:** Founder-authorised beneath ADR-003, ADR-015, ADR-016, ADR-040,
ADR-041 and the Oracle Engineering Programme
**Owner:** Oracle Platform Engineering
**Status:** Implemented and locally certified; awaiting Founder acceptance
**Prepared:** 24 July 2026
**Activated:** 24 July 2026
**Production:** No deployment, migration execution, persisted producer or
runtime-persistence activation authorised

## Objective

Generate one trustworthy post-Session Oracle assessment from an authoritative
completed Session, admitted Evidence and eligible governed Understanding.

## Architectural invariants

- Session Service remains the sole Session lifecycle authority.
- Operator Intelligence remains the sole Understanding lifecycle authority.
- Session Report Service is the exclusive report construction boundary.
- Engine registries are instance-owned and dependency-injected.
- Game-specific Evidence semantics are resolved only by the owning Game
  Integration provider.
- Shared report engines validate and consume provider projections without
  inventing game meaning.
- Every assessment and recommendation is attributable to admitted Evidence,
  eligible Understanding or reviewed knowledge.
- Confidence is calculated from explicit evidence completeness and engine
  agreement.
- Unsupported conclusions are Unknown, Suspected or omitted.
- Exactly one deterministic primary assessment and recommendation is selected.
- Model enrichment is optional, schema-validated and cannot override
  deterministic evidence, confidence or recommendation authority.
- Provider outage or invalid model output produces an observable degraded
  report, not fabricated success.
- Reports are immutable, versioned read records. In-memory history is inactive
  certification infrastructure and does not authorise persistence.
- ADR-040 manifest/runtime equality and ADR-041 Session authority remain
  mandatory.

## Delivery phases

### Phase 1 — Contracts and context

- versioned Session Report and comparison contracts;
- authenticated completed-Session projection through Session Service;
- admitted Evidence and governed Understanding assembly;
- Game Integration evidence resolver contract;
- explicit incomplete and conflicting Evidence representation.

### Phase 2 — Intelligence runtime

- instance-owned Engine Registry;
- Behaviour, Trend, bounded Prediction, Memory and Contextual report engines;
- deterministic dependency ordering and failure isolation;
- evidence-backed confidence and disagreement handling;
- one primary assessment and one primary recommendation.

### Phase 3 — Report Service

- immutable explanation and Evidence trail;
- structured optional model-output validation;
- provider outage and invalid-output degraded modes;
- idempotent report construction;
- bounded history and comparison Repository;
- removal of the prompt-only API authority.

### Phase 4 — Certification

- known completed Session end-to-end trace;
- incomplete Evidence, disagreement and provider outage;
- invalid model output rejection;
- report history and comparison;
- cross-Operator, non-completed Session and unadmitted Evidence rejection;
- exact manifest/runtime equality;
- TypeScript, Desktop TypeScript, lint, build and architecture audit;
- Migration 009–013 immutable hashes.

## Schema decision

Sprint 23 introduces no Migration 014. Report history remains an inactive
Repository abstraction with an in-memory certification implementation.
Production persistence requires a separately authorised future migration and
activation gate.

## Definition of done

Given a known completed Session, the assessment, recommendation, Evidence,
confidence, disagreement, degraded-state handling and reassessment trigger are
inspectable and deterministic. Unsupported output is never promoted to fact.
