# ORACLE PERSISTENCE CONTRACT

**Authority:** Oracle Platform Constitution, Oracle Architecture, ADR-037,
ADR-038, ADR-039 and Founder-approved Sprint 18 Phase 3

**Status:** Authoritative persistence architecture

## Boundary

Oracle persistence is an implementation boundary beneath authoritative
Services. It stores validated contracts and enforces integrity that must
survive concurrency, process failure and hostile direct access. It does not
decide product policy, infer meaning, promote information or orchestrate
cross-owner work.

The authority flow is:

```text
Immutable Platform contract
        ↓
Authoritative Service decision
        ↓
Repository serialization and ownership check
        ↓
Trusted SQL integrity and isolation
```

Applications never access Repositories. Repositories never become Services.
SQL never becomes an alternative business-logic layer.

## Repository ownership

| Repository | Durable responsibility | Excluded authority |
|---|---|---|
| Operator Repository | Account-to-Operator lookup, broad consent decisions, Identity/Preference/Goal declaration aggregates and revisions | Claim lifecycle, retention policy, deletion orchestration |
| Operator Intelligence Repository | Evidence references, Evidence dispositions and admissions, claims, claim revisions, Evidence relationships and eligibility | Raw source content, declarations, Memory promotion |
| Operator Control Repository | Control-policy versions, content-free operation receipts, recoverable steps and policy-authorised tombstones | Consent decisions, declaration meaning, claim meaning, topology or orchestration |
| Source-owner Repositories | Their existing authoritative source records | Operator Intelligence reconstruction or cross-owner deletion policy |

The future deletion coordinator is a Service orchestration component over
owner-specific ports. It owns no table, Repository, policy or deletion
semantics.

## Policy separation

`operator_control_policy_sets` stores the broad Sprint 18 control policy.
Migration 009's `operator_data_policy_versions` remains the narrow Evidence
admission and claim-family policy.

Each broad purpose contains either:

- an exact admission-policy identity and version; or
- explicit `null`, which grants no Evidence-admission authority.

Registration verifies each non-null reference. A broad control permission
never becomes Evidence permission implicitly.

Migration 009's `operator_consent_decisions` remains its narrow admission
record. `operator_control_consent_decisions` is the Operator Service's broad
control decision. The relations are not interchangeable, and Sprint 18 does
not activate an admission producer or dual-write path between them.

## Trusted SQL surface

Trusted functions are narrow durable operations. They:

- require `service_role`;
- use a fixed `pg_catalog` search path;
- verify Operator ownership;
- enforce contract identity and stored-field consistency;
- enforce exact retry, immutable conflict and monotonic concurrency;
- enforce durable lifecycle and content-free constraints; and
- apply hard engineering ceilings while accepting stricter configured bounds.

Trusted functions do not choose purposes, retention periods, legal authority,
audit fields, tombstone policy, backup policy, processor treatment,
eligibility policy or deletion topology.

The Sprint 18 Phase 3 trusted surface covers:

- control-policy registration;
- broad consent append;
- declaration revision persistence and bounded reads;
- control operation, step and tombstone persistence;
- bounded operation-status reads; and
- future owner-local control adapters over existing Migration 009 persistence.

## Database authority

The database may enforce:

- authenticated Operator isolation;
- composite same-Operator foreign keys;
- immutable identities and exact replay;
- monotonic revisions and stale-concurrency rejection;
- allowed persisted lifecycle states;
- content-free deleted, receipt and tombstone shapes;
- contract name/version and extracted-column consistency;
- bounded query and batch ceilings;
- RLS, grants and trusted-role restrictions; and
- transactional atomicity within one authoritative owner.

The database must not:

- create governance defaults;
- decide a processing purpose;
- infer consent or eligibility;
- promote Observation, Evidence, Understanding or Memory;
- widen purpose or scope;
- select legal-retention authority;
- coordinate multiple owners;
- report deletion complete while required steps remain pending;
- retain deleted content in audit or tombstones; or
- expose an alternative persistence path.

Contract factories remain authoritative for complete semantic validation.
Database checks intentionally repeat only the subset required for durable
integrity and security.

## Isolation and grants

All Operator-owned relations use RLS derived from
`operator_account_bindings`. Anonymous access is denied. Authenticated callers
receive own-Operator reads only and no direct mutation. Trusted writes are
available only through explicitly granted `service_role` functions.

Policy relations are authenticated-readable but never directly mutable.
Cross-Operator composite keys prevent a trusted implementation error from
linking one Operator's records to another Operator.

## Deletion and recovery

Operation receipts and steps are content-free operational state. Tombstones
exist only when a configured policy permits the justification and field set.
They may never retain values, prompts, Evidence summaries, explanations,
confidence rationale or source payloads.

Eligibility removal, live-system physical deletion, legally required
retention, processor completion and backup expiry remain separate states.
Completion is prohibited while an approved step is neither `succeeded` nor
`retained-legal`.

Restore procedures must reapply the approved deletion ledger before restored
content becomes available to normal runtime paths.

## Migration discipline

Migration 009 is immutable. Migration 010 is additive and inert. A migration
artifact is verified statically, exercised in a disposable database, rolled
back with an independent catalog comparison and reviewed by the Founder before
any permanent execution.

Schema deployment, runtime registration and production control-path activation
are separate decisions. None implies another.
