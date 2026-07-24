# SPRINT 18 GATE C OPERATIONAL EXECUTION PACKAGE

**Sprint:** 18 — Operator Trust and Control

**Gate:** C — Permanent Migration 010 execution

**Authority:** Founder-approved production candidate; Gate C execution
intentionally deferred

**Status:** Certified and deployment-ready; execution deferred until
immediately before the first production release requiring Operator Trust and
Control persistence

**Production change:** None

## Certified candidate

Only the following candidate may be considered at Gate C:

| Item | Certified value |
|---|---|
| Git commit | `acb23e2f7025ac04b921b399ff9e8dd295c6e953` |
| Git tag | `sprint-18-phase-3-persistence-approved` |
| Artifact | `database/010_operator_trust_control_persistence.sql` |
| Migration 010 SHA-256 | `7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715` |
| Migration 009 SHA-256 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |
| Expected database | PostgreSQL/Supabase production project selected by the authorised operator |

The tag points to the implementation commit, not this operational dossier.
The candidate must be checked out from the tag or exact commit. A working-copy
artifact, rebuilt artifact or artifact from another commit is not eligible.

The tag is local until a separate push is authorised. Gate C must verify that
the execution environment can resolve the exact accepted commit and tag.

The Founder approved this certified candidate and subsequently deferred Gate C
execution. The approval fixes the production candidate; it does not authorise
execution while Gate C is deferred and does not complete any operational
record field. Gate C must be revisited before the first production release
that requires this persistence.

### Certified object manifest

Migration 010 is eligible only if static verification reports exactly these
eight new relations:

1. `operator_control_policy_sets`
2. `operator_control_consent_decisions`
3. `operator_declarations`
4. `operator_declaration_revisions`
5. `operator_declaration_head_events`
6. `operator_control_operations`
7. `operator_control_operation_steps`
8. `operator_control_tombstones`

The trusted SQL surface is exactly:

1. `register_operator_control_policy_set`
2. `persist_operator_control_operation`
3. `append_operator_control_consent_decision`
4. `persist_operator_declaration_revision`
5. `persist_operator_control_operation_step`
6. `persist_operator_control_tombstone`
7. `persist_operator_controlled_claim_revision`
8. `append_operator_controlled_evidence_disposition`
9. `append_operator_control_ineligibility_batch`
10. `delete_operator_declaration_batch`
11. `delete_operator_intelligence_batch`
12. `read_operator_declaration_page`
13. `read_operator_declaration_lifecycle_page`
14. `read_operator_control_operation_page`
15. `read_operator_control_operation_steps`

The exact overload signatures and grants are defined only by the certified
artifact. A same-named function with another signature is not an approved
substitute and is treated as drift.

## Gate C approval record

The following values must be recorded in the execution log before any
production connection is opened:

| Required record | Value at preparation |
|---|---|
| Founder approval reference | Pending |
| Authorised migration operator | Pending |
| Repository operator identity | Pending |
| Production project identifier | Pending |
| Maintenance window start/end in UTC | Pending |
| Database monitoring owner | Pending |
| Application/runtime monitoring owner | Pending |
| Incident commander | Pending |
| Communication channel | Pending |
| Approved lock timeout | Pending |
| Approved statement timeout | Pending |
| Backup package identifier | Pending |
| Backup verification owner | Pending |
| Post-execution verifier | Pending |

No pending field may be inferred or defaulted. Any missing value stops Gate C.

## Production pre-flight checklist

### Authority and source

- [ ] Explicit Founder Gate C approval names the exact commit, tag, artifact
  and SHA-256 above.
- [ ] The authorised operator is named and independently authenticated.
- [ ] The repository is clean at the certified tag or commit.
- [ ] `git rev-parse HEAD` equals
  `acb23e2f7025ac04b921b399ff9e8dd295c6e953`.
- [ ] `git rev-list -n 1 sprint-18-phase-3-persistence-approved` resolves to
  the same commit.
- [ ] Migration 010 hashes to the certified SHA-256.
- [ ] Migration 009 hashes to its immutable certified SHA-256.
- [ ] No local patch, line-ending conversion or generated copy will be
  executed.
- [ ] Production credentials are obtained through the approved secret path and
  are not written to the repository, shell history or dossier.

### Production state

- [ ] The production project identifier and database host are independently
  confirmed by two signals.
- [ ] Server version and Supabase/PostgreSQL compatibility are recorded.
- [ ] Current UTC database time is recorded.
- [ ] The complete pre-010 catalog inventory is captured and hashed.
- [ ] The catalog matches the expected post-Migration-009 baseline.
- [ ] All ten Migration 009 relations, nine functions, RLS policies and grants
  are present.
- [ ] No Migration 010 relation, function, policy, grant or named index exists.
- [ ] Protected Operator, binding, Session, achievement and Migration 009 row
  counts are captured without assuming historical counts remain current.
- [ ] No untracked schema, function, grant or policy drift is present.
- [ ] Runtime persistence, producers, consumers and Platform bootstrap remain
  disabled.
- [ ] No Phase 4 Service or Trust Centre path is active.

### Lock, load and capacity

- [ ] Active sessions and long-running transactions are inventoried.
- [ ] No unexpected DDL, migration, backup restore or schema-cache operation is
  running.
- [ ] Lock waits and blockers are absent or explicitly resolved before the
  window.
- [ ] The approved lock and statement timeouts are set in the execution
  session without editing the migration artifact.
- [ ] Database storage and transaction-log headroom exceed the measured
  migration requirement plus the approved operational margin.
- [ ] CPU, memory, connection and I/O state are within the approved baseline.
- [ ] No concurrent release, maintenance or incident can overlap Gate C.

Any hash mismatch, catalog drift, backup uncertainty, unexpected lock,
ownership-row divergence, permission divergence, incompatible server state or
runtime activation stops the sequence before execution.

## Backup verification checklist

The backup must be created after pre-flight state capture and before Migration
010 execution.

- [ ] Create a timestamped, access-restricted backup package outside the
  repository.
- [ ] Record PostgreSQL client/server versions and the exact production project
  identifier.
- [ ] Capture a complete schema backup.
- [ ] Capture a complete data backup using an independently restorable format.
- [ ] Capture roles, grants, RLS policies, functions, constraints and indexes
  required to reconstruct the pre-010 database.
- [ ] Record SHA-256, byte size, creation time and exit code for every backup
  artifact.
- [ ] Confirm backup commands emitted no unreviewed error or warning.
- [ ] Restore the backup into a new isolated database.
- [ ] Compare the restored catalog with the captured production catalog.
- [ ] Compare protected row counts and representative checksums.
- [ ] Verify Migration 009 relations and trusted functions in the restored
  database.
- [ ] Verify the restored database contains no Migration 010 objects.
- [ ] Record restore duration and the operator who verified it.
- [ ] Confirm backup encryption, storage access and retention follow existing
  approved operational policy.
- [ ] Confirm the incident commander can access the verified package during
  the maintenance window.

A dump that has not passed an independent restore is not a verified backup.
Any backup or restore discrepancy stops Gate C.

## Maintenance window requirements

The maintenance window must:

- be explicitly approved with UTC start and end times;
- include pre-flight, backup, execution, verification and recovery capacity;
- reserve one authorised schema-change operator;
- reserve an independent verifier;
- prohibit concurrent migrations and production releases;
- keep runtime persistence and all Sprint 18 control paths disabled;
- maintain an open incident and communication channel;
- keep database, Supabase and application monitoring visible;
- preserve enough time to investigate without attempting an unauthorised
  second execution; and
- define an abort time after which execution may not begin.

The measured Migration 010 DDL duration from an isolated environment is
informational only. The production window must be based on the fresh catalog,
backup duration, restore rehearsal and current operational state.

## Explicit Gate C execution sequence

The following sequence is mandatory and strictly ordered.

1. Record the Founder Gate C approval and all previously pending operational
   identities.
2. Check out the exact certified commit or tag in a clean execution workspace.
3. Independently verify the commit, tag target and both migration hashes.
4. Establish a read-only production connection and independently confirm the
   production project identity.
5. Capture and hash the complete pre-execution catalog.
6. Capture protected row counts, grants, RLS, active sessions, locks, capacity
   and runtime-disabled evidence.
7. Create the production backup package.
8. Restore and verify that package in an isolated database.
9. Re-run Migration 010 static verification and exact rollback/catalog
   verification against an isolated post-009 database.
10. Reconfirm no production state changed during backup and rehearsal.
11. Enter the approved maintenance window and communication channel.
12. Open one controlled production `psql` session with:
    - `-X`;
    - `ON_ERROR_STOP=1`;
    - the approved session timeouts; and
    - stdout, stderr, start time and exit code captured.
13. Recompute the Migration 010 hash immediately before invocation.
14. Execute the exact artifact once. Do not paste statements, edit the file,
    skip statements or apply a generated variant.
15. On any statement error or stop condition before `COMMIT`, issue or confirm
    `ROLLBACK`, close the session, capture evidence and stop.
16. After a successful `COMMIT`, record completion time and prohibit any
    runtime activation.
17. Run the complete post-execution verification checklist below.
18. If every check passes, produce the immutable Gate C deployment closure
    report.
19. If any check fails, enter the production rollback/recovery strategy. Do
    not repair, retry or rerun Migration 010 without new Founder authority.
20. End the maintenance window only after the incident commander and verifier
    record the final database state.

### Controlled invocation

The operator must run the repository artifact as a file from the clean
certified checkout. The operational wrapper must be reviewed before the
window and must be equivalent to:

```powershell
$env:PGOPTIONS = "-c lock_timeout=$env:ORACLE_GATE_C_LOCK_TIMEOUT -c statement_timeout=$env:ORACLE_GATE_C_STATEMENT_TIMEOUT"
psql -X --dbname $env:ORACLE_GATE_C_DATABASE_URL --set ON_ERROR_STOP=1 --file database/010_operator_trust_control_persistence.sql
$gateCExitCode = $LASTEXITCODE
```

`ORACLE_GATE_C_DATABASE_URL`, `ORACLE_GATE_C_LOCK_TIMEOUT` and
`ORACLE_GATE_C_STATEMENT_TIMEOUT` must come from the completed approval record
and approved secret mechanism. They have no dossier default. The wrapper must
capture stdout and stderr outside the repository without placing the database
URL in command arguments or logs. A non-zero or indeterminate exit code is a
stop condition. Hash verification and production identity verification occur
outside this invocation and remain mandatory.

## Production rollback and recovery strategy

### Before `COMMIT`

```text
Any error or stop condition
        ↓
ROLLBACK the current transaction
        ↓
close the execution session
        ↓
capture stdout, stderr, locks and database logs
        ↓
independently compare catalog and protected rows
        ↓
stop for Founder review
```

The artifact must not be modified or immediately retried.

### After `COMMIT`, before any production write

- Keep runtime persistence and every control path disabled.
- Isolate trusted migration credentials.
- Preserve logs and capture the post-commit catalog.
- Determine whether the verified backup restore or a separately reviewed
  forward correction is safer.
- Obtain explicit Founder recovery authority before altering production.

Migration 010 is schema-only and its new relations are expected to be empty
immediately after execution, but that expectation does not itself authorise a
destructive down migration.

### After any production write

- Do not drop Migration 010 objects or run an improvised down migration.
- Stop writers and prevent further control-path access.
- Preserve affected records, logs and operation evidence.
- Use the verified backup or a data-preserving forward recovery designed and
  approved under a separate incident plan.
- Treat any partial restoration as unavailable until RLS, ownership and
  deletion-ledger state are independently verified.

The local rollback suite proves pre-commit transactional rollback only.

## Operational monitoring plan

### During execution

The database monitoring owner watches:

- migration session state and transaction state;
- lock acquisition, blockers and wait duration;
- PostgreSQL errors and warnings;
- CPU, memory, I/O, storage and connection pressure;
- replication or platform health where applicable; and
- unexpected catalog or role activity.

The application/runtime monitoring owner watches:

- API error rate and latency;
- authentication and Account-to-Operator resolution;
- existing Session and Operator reads;
- server error logs;
- Supabase/PostgREST schema-cache health; and
- proof that runtime persistence and Sprint 18 control paths remain disabled.

The operator records timestamped observations before execution, at transaction
start, immediately after `COMMIT` and after post-execution verification.

### Stop and escalation signals

Immediately stop or enter recovery on:

- any SQL error;
- unexpected or prolonged lock;
- loss of the execution connection before confirmed outcome;
- catalog object, constraint, RLS, function or grant mismatch;
- protected row-count change;
- anonymous or cross-Operator visibility;
- authenticated direct-write success;
- untrusted trusted-function execution;
- service-role failure;
- unexpected data in a new relation;
- runtime persistence activation;
- API or authentication regression; or
- inability to prove the final transaction state.

## Post-execution verification checklist

### Artifact and transaction

- [ ] The execution log names the exact commit, tag, artifact and hash.
- [ ] The execution occurred once.
- [ ] Exit code is zero and stderr contains no unreviewed output.
- [ ] PostgreSQL confirms `COMMIT`.
- [ ] Start, completion and verification times are recorded in UTC.

### Catalog

- [ ] All eight approved Migration 010 relations exist.
- [ ] All fifteen approved trusted functions exist with `SECURITY DEFINER` and
  fixed `pg_catalog` search paths.
- [ ] All eight relations have RLS enabled.
- [ ] Exactly the approved own-Operator and authenticated-policy read policies
  exist.
- [ ] Anonymous and authenticated roles have no mutation grants.
- [ ] Only `service_role` has approved trusted-function execution grants.
- [ ] All primary, unique, foreign-key, lifecycle, content-free and
  same-Operator constraints are valid.
- [ ] The seven named supporting indexes exist:
  - `operator_control_policy_effective_idx`
  - `operator_control_consent_current_idx`
  - `operator_declaration_head_page_idx`
  - `operator_declaration_lifecycle_page_idx`
  - `operator_control_operation_page_idx`
  - `operator_control_step_status_idx`
  - `operator_control_tombstone_subject_idx`
- [ ] No unexpected table, view, trigger, extension, function, policy, grant or
  index was introduced.
- [ ] The post-execution catalog is captured and hashed.

### Preservation and data

- [ ] Protected pre-execution row counts are unchanged.
- [ ] All ten Migration 009 relations and nine functions remain unchanged.
- [ ] Migration 009's artifact hash remains certified.
- [ ] All eight Migration 010 relations are empty.
- [ ] No production governance policy was inserted.
- [ ] No Observation, Evidence, claim, declaration, operation, step or
  tombstone was created permanently.

### Security and isolation

- [ ] Anonymous reads of every new relation are denied.
- [ ] Authenticated direct insert, update and delete are denied.
- [ ] Authenticated trusted-function execution is denied.
- [ ] Existing own-Operator reads remain available.
- [ ] Existing cross-Operator reads remain denied.
- [ ] A purpose-labelled transaction proves own-Operator visibility and
  cross-Operator isolation for new relations, then rolls back.
- [ ] A purpose-labelled transaction proves service-role function execution,
  exact replay, immutable conflict and fail-closed policy, then rolls back.
- [ ] Independent residue queries prove those verification transactions left
  no rows.

### Runtime and application

- [ ] Runtime persistence remains disabled.
- [ ] No Platform bootstrap registration changed.
- [ ] No Phase 4 Service or deletion coordinator is active.
- [ ] No Trust Centre route is active.
- [ ] Existing production health, authentication, Operator and Session paths
  pass.
- [ ] No Observation, Evidence admission, Understanding accumulation, Memory
  promotion, Snapshot/Context consumption, inference or personalisation path
  is active.

### Closure

- [ ] The monitoring owners report no unresolved regression.
- [ ] Backup package and execution evidence are access-controlled and retained
  under approved operational policy.
- [ ] A Migration 010 deployment closure report records all evidence.
- [ ] The Founder reviews the deployment outcome.
- [ ] Gate D and Phase 4 remain separately unapproved.

## Gate separation

Gate C approval would authorise permanent execution of only the exact
Migration 010 candidate named here.

It would not authorise:

- a changed artifact or second attempt;
- production policy registration;
- runtime persistence;
- Operator Service controls;
- deletion coordination;
- Trust Centre activation;
- Observation or Evidence admission;
- Understanding accumulation or Memory promotion;
- inference, Guidance, Prediction or personalisation;
- Phase 4; or
- an application release.

No production action may occur until the Founder explicitly reopens Gate C and
all pending operational fields and checklists are complete.
