# SPRINT 18 PHASE 2 IMPLEMENTATION EVIDENCE

**Sprint:** 18 — Operator Trust and Control
**Phase:** 2 — Contracts and policy validation
**Authority:** Founder-approved Sprint 18 Plan and Phase 1 decision
**Owner:** Oracle Platform Engineering
**Status:** Implemented and verified; awaiting authority for Phase 3
**Implemented:** 24 July 2026
**Production change:** None

---

# Outcome

Phase 2 implements presentation-independent, immutable contracts for the
Sprint 18 control plane without adding persistence, runtime registration,
Application consumption or production activation.

The implemented contract boundary covers:

- a versioned Operator control policy set;
- explicit purpose-to-Migration-009 admission-policy binding;
- purpose-specific consent commands;
- Identity, Preference and Goal declaration commands;
- correction, revision, withdrawal, expiry and deletion semantics;
- claim correction and dispute commands;
- claim, Evidence-reference and explanation inspection;
- deterministic bounded export;
- item, purpose, Game Integration, Understanding-domain and
  complete-Operator deletion commands;
- retention execution commands;
- Evidence disposition commands;
- content-free operation receipts and recoverable steps;
- policy-authorised content-free tombstones;
- exact command-replay validation;
- typed command results and failures; and
- operation and step lifecycle matrices.

# Policy Authority

`OperatorControlPolicySet` is the broad Sprint 18 governance contract. It does
not replace or reinterpret `OperatorDataPolicyDefinition`, which remains the
narrow Migration 009 Evidence-admission and claim-family policy.

Each processing purpose contains:

- an explicit admission-policy identity and version; or
- explicit `null`, meaning the purpose grants no Evidence-admission authority.

This prevents control permission from becoming Evidence permission
implicitly.

Governance values use one of two explicit states:

```text
configured(value)
unconfigured
```

Operations requiring an unconfigured value fail with the typed
`policy-unconfigured` outcome. No retention duration, legal authority, export
bound, deletion rule, audit field, tombstone rule, backup treatment, processor
treatment or recovery expectation receives a runtime default.

# Ownership Review

| Capability | Preserved owner |
|---|---|
| Shared immutable contracts | Oracle Platform contract boundary |
| Identity, Preference and Goal decisions | Operator Service |
| Claims, Evidence references, correction and dispute | Operator Intelligence Service |
| Retention and eligibility policy | Memory Service policy boundary |
| Future durable access | Repositories |
| Future deletion coordination | Service orchestration only |
| Future Trust Centre | Oracle Application |

The Phase 2 implementation adds no Service implementation, Repository method,
database access, React component or route. Commands contain no caller-selected
Operator identifier. Operator identity appears only in Service-produced
receipts and exports, where validation enforces one-Operator content.

# Lifecycle and Deletion Guarantees

- declaration expiry is now an explicit lifecycle state;
- correction commands require a replacement value and expected current
  revision;
- withdrawal, expiry and deletion commands cannot carry declaration content;
- disputes cannot carry replacement content;
- exact command replay is accepted only when immutable content matches;
- operation completion is terminal;
- recoverable failures may resume only through approved transitions;
- completion requires every approved live-system step to be `succeeded` or
  explicitly `retained-legal`;
- processor-pending and backup-pending steps cannot produce completed status;
- operations distinguish required eligibility removal from operations where it
  is not applicable;
- audit receipts reject content-bearing keys and free-text payload fields; and
- tombstones require an approved justification, approved field set and
  non-content integrity digest.

# Export Guarantees

The export contract:

- requires an authenticated-Service-supplied Operator identity;
- rejects mixed-Operator declarations, claims or Evidence references;
- canonicalises declarations, claims, Evidence references and retention states
  into deterministic order;
- calculates the final serialized byte count;
- enforces policy-supplied item and byte bounds;
- prohibits raw prompt payloads; and
- creates no durable export artifact.

# Existing Contract Reconciliation

Two narrow existing-contract changes were necessary:

1. `expired` was added to the declaration lifecycle because expiry is an
   explicit Sprint 18 requirement.
2. the existing Understanding scope validator gained a public immutable
   wrapper so control commands reuse the authoritative scope semantics instead
   of creating a parallel validator.

No existing contract version, Guidance contract, Desktop API or Migration 009
artifact changed.

# Verification

The focused Phase 2 suite verifies:

- serialization and deep immutability;
- explicit admission-policy absence;
- fail-closed unconfigured policy;
- effective policy binding;
- caller-selected Operator rejection;
- declaration lifecycle requirements;
- correction and dispute command shape;
- exact replay and immutable conflict;
- deterministic export ordering and bounds;
- cross-Operator export rejection;
- content-free audit and tombstone enforcement;
- truthful eligibility-removal state;
- operation and step transitions;
- completion gating;
- typed success and failure outcomes; and
- engineering page ceilings.

Verified commands:

```text
npm.cmd run operator-control:verify
npm.cmd run operator-understanding:verify
npm.cmd run operator-intelligence:trust:verify
npm.cmd run architecture:audit
.\node_modules\.bin\tsc.cmd --noEmit --pretty false
npm.cmd run lint -- <Phase 2 files>
```

All passed. Targeted lint completed with zero warnings. The architecture audit
reported zero new dependency violations and zero runtime cycle groups.

# Explicit Non-Implementation

Phase 2 did not implement:

- a database migration;
- any proposed Phase 1 table or function;
- Repository persistence;
- Service control behavior;
- a deletion coordinator;
- the Trust Centre;
- production policy values;
- Observation or Evidence admission;
- Understanding accumulation or Memory promotion;
- Snapshot or Oracle Context consumption;
- inference, Guidance, Prediction or personalisation;
- Platform bootstrap; or
- production deployment or activation.

# Phase Boundary

Phase 2 is implemented and verified. Phase 3 remains unstarted.

Any persistence implementation must preserve Migration 009 immutability, use
the approved additive minimum, keep the deletion coordinator orchestration-only
and pass rollback plus independent catalog verification. Permanent database
deployment remains a separate Founder decision.
