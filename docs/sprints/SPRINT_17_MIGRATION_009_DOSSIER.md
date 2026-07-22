# MIGRATION 009 PRODUCTION DEPLOYMENT DOSSIER

**Sprint:** 17 — Scale-Safe Trust Data Plane  
**Artifact:** `database/009_operator_intelligence_persistence.sql`  
**Artifact commit:** `ce2fcc753ab5caf5769dff8a6fe1bb1ef7b1d6d8`  
**SHA-256:** `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f`  
**Evidence date:** 22 July 2026  
**Status:** Decision-ready for a separate Founder deployment review  
**Deployment state:** Undeployed

This dossier is evidence for a future decision. Its approval would not itself
authorise or execute deployment. Migration 009 may be permanently executed
only through a separate, explicit Founder deployment instruction.

## Artifact and environment

The pinned artifact first appears in commit
`ce2fcc753ab5caf5769dff8a6fe1bb1ef7b1d6d8`. No subsequent Sprint 17 commit
changes it. Hash verification is automated and fails if one byte changes.

Verification used:

- PostgreSQL 17.10, official EDB Windows x64 portable binaries
- Node.js 24.18.0 and the repository-pinned TypeScript/Next.js dependencies
- Windows x64 local isolated clusters; no remote Supabase project was contacted
- five warm-up executions followed by 30 measured samples per read/write path
- empty, normal-Operator and production-shaped hot-Operator datasets
- 1, 8 and 32 concurrent exact-retry workers; 32 competing revision workers

The focused commands are:

```powershell
$env:SPRINT17_PSQL='<postgresql-17.10>/bin/psql.exe'
$env:SPRINT17_DATABASE_URL='postgresql://<verification-role>@127.0.0.1:<port>/<isolated-database>'
npm run operator-intelligence:scale:verify
npm run migration-009:rollback:verify
```

Both commands require a dedicated disposable database and reject `postgres` as
their target database. The rollback command is pinned to the SHA-256 above.

## Schema, functions and permissions

Migration 009 adds ten tables:

- `operator_data_policy_versions`
- `operator_consent_decisions`
- `operator_intelligence_evidence`
- `operator_intelligence_evidence_dispositions`
- `operator_intelligence_evidence_admissions`
- `operator_intelligence_claims`
- `operator_intelligence_claim_revisions`
- `operator_intelligence_claim_head_events`
- `operator_intelligence_claim_evidence`
- `operator_intelligence_eligibility_assessments`

It defines nine narrow functions: policy registration, consent append,
evidence admission, evidence disposition append, claim-revision persistence,
eligibility append, eligible-claim pagination, lifecycle pagination and
eligibility-history pagination. The verified catalog contains 29 indexes,
including primary, unique, integrity and query-support indexes, and ten RLS
policies.

All tables have RLS enabled. Anonymous access is denied. Authenticated callers
have only binding-derived own-Operator reads and cannot mutate tables or invoke
trusted RPCs. `service_role` receives the narrow function execution authority;
functions repeat ownership and trust checks and use fixed `pg_catalog` search
paths. Applications and engines have no Repository or credential path.

## Production-shaped workload

The tracked fixture contains exactly:

| Dimension | Verified shape |
|---|---:|
| Claim heads | 10,000 |
| Claim revisions | 100,000 |
| Eligibility assessments | 250,000 |
| Evidence, dispositions and admissions | 100,000 each |
| Claim-to-Evidence links | 300,000 |
| Operators | At least two |
| Revision history | 8 minimum, 9 median, 1,000 maximum |
| Current status | 90% active, 5% disputed, 5% expired |
| Scope | 90% Session, 10% Game Integration |
| Purpose | Primary plus secondary verification purpose |

The normal fixture is created by the concurrency suite. Empty migration
application is exercised before either fixture is loaded.

## Query-plan and benchmark evidence

Before optimisation, the eligible-head workload scanned the 100,000-row
revision history, performed external merge sorts totalling approximately
120 MiB of disk space, and executed in 241.377 ms after warm-up. The complete
pre-projection function took 477.191 ms.

The final immutable head-event projection makes the query proportional to the
requested page and preserves a PostgreSQL snapshot watermark across pages.
Final repeated results were:

| Scenario | p50 ms | p95 ms | p99 ms | Limit |
|---|---:|---:|---:|---:|
| Eligible page | 7.264 | 9.558 | 12.202 | p95 250 / p99 500 |
| Claim lifecycle page | 28.380 | 30.332 | 31.459 | p95 250 / p99 500 |
| Eligibility history page | 0.040 | 0.070 | 0.206 | p95 250 / p99 500 |
| Evidence admission exact replay | 0.030 | 0.048 | 0.118 | p95 200 / p99 400 |
| Claim revision exact replay | 0.214 | 0.317 | 0.506 | p95 200 / p99 400 |
| Eligibility exact replay | 0.016 | 0.034 | 0.111 | p95 200 / p99 400 |

A separately restarted cold eligible-page function execution was 14.888 ms.
The measured 50-item response was 314,005 bytes and added 407,128 bytes of
heap, below the 512 KiB and 32 MiB budgets.

Every approved direct plan used bounded index access. The scoped and unscoped
head selections returned 101 look-ahead rows in 1.412 ms and 0.461 ms,
respectively. Lifecycle, eligibility-history and Evidence fan-out plans used
their ownership keys and returned in at most 0.243 ms. No approved plan
performed an unbounded sequential scan, disk sort or spill.

## Index decisions and write cost

Two page indexes are retained:

- `operator_intelligence_claim_head_scope_page_idx` supports selective,
  database-side scope filtering and was selected by the scoped workload.
- `operator_intelligence_claim_head_page_idx` supports the authorised null-scope
  workload and was selected by the unscoped workload.

At 100,000 revisions, the immutable projection occupied 27,549,696 bytes; the
unscoped and scoped indexes occupied 47,652,864 and 48,955,392 bytes. This is a
material write/storage cost, but it replaces the measured whole-history scan
and spill while keeping writes well inside their gate. Existing primary,
unique, foreign-key and history indexes remain for integrity or a measured
approved path.

Rejected additions include a cache, materialized mutable head table, standalone
purpose index and standalone JSON scope index. They either introduce a second
authority, do not satisfy stable snapshot traversal, or add write cost without
measured benefit. No speculative index was added.

## Idempotency and concurrency

Repeated 1, 8 and 32-worker exact submissions produced one durable Evidence,
disposition, admission, claim revision and eligibility result. Conflicting
same-identity payloads returned immutable conflicts. Alternative-identifier
admission duplicates were rejected.

In the 32-worker competing-revision test, 16 submissions for the winning exact
identity returned that result and 16 competing submissions returned stale
conflicts. There was one revision-two head, no revision gap and no lost update.
Consent revocation and Evidence withdrawal races block eligibility commits;
transaction rollback left no residue. Three full repetitions completed with no
unexplained deadlock.

## Security and preservation evidence

Database verification proved:

- own-Operator authenticated visibility and cross-Operator exclusion
- anonymous table denial and authenticated direct-write denial
- non-service trusted-RPC denial and service-role success
- composite Operator ownership across Evidence, revisions and eligibility
- exact retry, conflicting retry, monotonic revision and rollback behaviour
- preservation of pre-existing Operator, binding and Session rows

No new architecture exception or runtime cycle was created. The Repository
remains the exclusive persistence owner; the Service remains the business
authority; no Application accesses persistence.

## Rollback and catalog evidence

Sprint 16 rollback evidence remains historical because Sprint 17 changed the
artifact. The final file was therefore reverified from a fresh Phase 1/7/8
baseline. The verifier hashes the untouched file, substitutes only the terminal
transaction decision from `COMMIT` to `ROLLBACK`, and sends every other exact
statement to PostgreSQL in its original order.

Independent connections captured the catalog before and after rollback:

```text
before: c26169e4540f57f0cc0ba525ceade571327cb393d02ffd735d2a313cadb08c65
after:  c26169e4540f57f0cc0ba525ceade571327cb393d02ffd735d2a313cadb08c65
```

The catalogs were byte-identical, zero Operator Intelligence relations
remained, and one seeded Operator, binding and Session were preserved. This
proves pre-commit transactional rollback. It does not prove that destructive
removal is safe after production writes exist.

## Deployment prerequisites and stop conditions

Permanent execution is blocked until a separate deployment record names the
Founder-authorised human migration operator and records:

- explicit Founder approval for this exact commit and hash
- an independently verified, restorable production backup
- deployed-catalog comparison against the expected pre-migration inventory
- PostgreSQL/Supabase compatibility and sufficient storage/lock headroom
- a maintenance window, monitoring owner and communication channel
- confirmation that no untracked Migration 009 objects or grants exist

Stop before `COMMIT` on hash mismatch, catalog drift, backup uncertainty,
unexpected locks, statement error, ownership-row change, permission divergence
or threshold regression. After deployment, stop activation and enter recovery
on any RLS, anonymous, cross-Operator, service-role, row-count or plan failure.

## Recovery decision tree

```text
Before COMMIT and any stop condition
  -> ROLLBACK; independently compare catalog; investigate.

After COMMIT, no production writes
  -> stop activation; prefer backup restore or reviewed forward correction.

After COMMIT, production writes exist
  -> do not run an improvised destructive down migration;
     isolate writers, preserve evidence, choose backup/restore or
     data-preserving forward recovery through a separately approved plan.
```

Transaction rehearsal gives high confidence before commit. Post-commit
recovery remains backup- and incident-plan-dependent. This dossier is not
deployment approval, Gate 1 approval or runtime activation authority.
