# SPRINT 18 PHASE 3 IMPLEMENTATION EVIDENCE

**Sprint:** 18 — Operator Trust and Control
**Phase:** 3 — Repository and persistence implementation
**Authority:** Founder-approved Sprint 18 Plan and Phase 3 readiness decision
**Owner:** Oracle Platform Engineering
**Status:** Founder-accepted; Migration 010 certified and deployment-ready;
Gate C intentionally deferred
**Implemented:** 24 July 2026
**Production change:** None

## Outcome

Phase 3 implements the approved inert, additive persistence boundary beneath
the accepted Phase 2 contracts. It adds no Service behavior, Application,
deletion coordinator, runtime registration or production activation.

The accepted Phase 2 state was first recorded as checkpoint commit `61dd8fa`.

## Migration artifact

```text
database/010_operator_trust_control_persistence.sql
SHA-256 7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715
```

Migration 009 remains byte-identical at SHA-256
`fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f`.

Migration 010 creates exactly:

1. `operator_control_policy_sets`
2. `operator_control_consent_decisions`
3. `operator_declarations`
4. `operator_declaration_revisions`
5. `operator_declaration_head_events`
6. `operator_control_operations`
7. `operator_control_operation_steps`
8. `operator_control_tombstones`

It does not alter a Migration 009 relation or replace a Migration 009
function.

## Governance and durable integrity

Policy registration verifies every non-null purpose admission binding against
the exact Migration 009 policy identity, version and purpose. Explicit `null`
grants no Evidence-admission authority. Broad consent is stored separately
from Migration 009 admission consent, with no admission producer or dual-write
path.

No governance value receives a database default. Receipt persistence requires
a configured audit policy with the minimum content-free field set. Tombstone
persistence requires a configured tombstone policy containing the requested
justification and complete approved field set. Missing authority fails closed.

The database enforces:

- contract identity/version and extracted-column consistency;
- same-Operator integrity and RLS isolation;
- immutable identity, exact replay and conflicting-replay rejection;
- monotonic declaration revisions and stale concurrency;
- content-free receipts, steps, deleted revisions and tombstones;
- completion only when every recorded step is `succeeded` or
  `retained-legal`;
- prior eligibility removal and policy-authorised tombstones before physical
  deletion batches;
- deletion of declaration history and projections;
- prevention of replay for tombstoned declaration identities; and
- engineering ceilings of 100 for database pages and batches.

## Trusted SQL surface

Fifteen narrow functions cover policy registration, broad consent append,
declaration persistence and reads, operation/step/tombstone persistence,
bounded operation reads, atomic adapters over existing claim and Evidence
disposition persistence, bounded ineligibility append and owner-local deletion
batches.

Every function requires `service_role`, uses a fixed `pg_catalog` search path
and is denied to anonymous and authenticated roles. SQL enforces durable
integrity; it does not choose policy, purpose, eligibility, topology,
retention, legal authority or completion meaning.

## Repository ownership

- `SupabaseOperatorControlRepository` owns policy-set and content-free
  operation, step and tombstone persistence.
- `SupabaseOperatorRepository` implements the additive
  `OperatorControlDecisionRepository` for broad consent and declarations.
- `SupabaseOperatorIntelligenceRepository` implements the additive
  `OperatorIntelligenceControlRepository` for controlled claim, Evidence
  disposition and ineligibility persistence.

Existing base Repository interfaces remain source-compatible. All inputs and
outputs cross the accepted Phase 2 factories. No Repository contains Service
policy or deletion orchestration.

## Security and performance

All eight relations have RLS. Authenticated users have binding-derived
own-Operator reads only. Anonymous access, authenticated mutation and
untrusted RPC execution are denied.

A disposable PostgreSQL 17.10 verification cluster—not production—proved:

- null admission binding and missing non-null binding rejection;
- broad-consent exact replay and immutable conflict;
- one winner under competing declaration revisions;
- two-Operator isolation;
- completion gating;
- fail-closed tombstone policy;
- policy-authorised tombstone persistence;
- deletion-residue removal and deleted-identity replay prevention; and
- no verification residue.

Production-shaped transactional fixtures contained 10,000 declaration heads
and 10,000 operations. Bounded 50-item reads selected
`operator_declaration_head_page_idx` and
`operator_control_operation_page_idx`; neither hot relation used a sequential
scan.

## Rollback

The verifier built `001 → 007 → 008 → immutable 009`, captured the catalog and
protected rows, ran every Migration 010 statement with only terminal `COMMIT`
changed to `ROLLBACK`, and independently captured the result.

```text
catalog before  7448c2933fba2892f0154c6afe9c51106f31a3c7cbb678fbaa843cb898cda12b
catalog after   7448c2933fba2892f0154c6afe9c51106f31a3c7cbb678fbaa843cb898cda12b
identical       true
```

The Operator, binding, Session and all ten Migration 009 relations were
preserved. Zero Migration 010 relations remained. This proves pre-commit
rollback only; it does not authorize destructive production rollback.

## Verification commands

The Migration 010 static, persistence, performance and rollback suites passed,
as did Operator control, Repository, Understanding, Intelligence persistence,
authority, trust, ownership, architecture, TypeScript and targeted lint
verification. The production build passed on Next.js 16.2.10. Architecture
reported no new boundary violation and zero runtime cycle groups.

## Explicit non-implementation

Phase 3 did not implement or activate permanent database execution, production
policy values, runtime persistence, Service controls, deletion coordination,
retention execution, Trust Centre UI, Observation, Evidence admission,
Understanding accumulation, Memory promotion, Snapshot/Context consumption,
inference, Guidance, Prediction, personalisation, deployment, release, push or
tag.

## Phase boundary

Phase 3 is implemented and verified in the repository and remains undeployed.
Phase 4 has not started. Permanent Migration 010 execution requires a separate
Founder Gate C decision.
