# SPRINT 17 CLOSURE REPORT

**Sprint:** 17 — Scale-Safe Trust Data Plane

**Engineering status:** Complete — Founder-approved and closed

**Date:** 22 July 2026

**Branch:** `sprint-9-overlay`

**Migration 009:** Undeployed

**Founder closure approval:** 22 July 2026

**Next Sprint:** Sprint 18 not started or authorised

## Outcome

Sprint 17 implemented the approved scale-safe trust data plane without
activating inference, runtime consumers, control operations, Applications or
Migration 009. Platform authority, Service behaviour ownership, Application
presentation ownership and exclusive Repository persistence ownership remain
intact.

The delivered boundary now provides immutable versioned page contracts,
query-bound opaque cursors, stable snapshot traversal, database-side purpose
and scope filtering, bounded current/history reads, typed payload and Snapshot
budgets, exact-retry idempotency, stale/immutable conflict outcomes, real
PostgreSQL concurrency evidence, production-shaped plan evidence and one
automated scale gate.

Following the independent Founder Closure Review, the authorised remediation
made the complete gate self-contained and retained its machine-readable
performance, plan, index, concurrency, rollback and suite evidence under
[`evidence/sprint-17/`](evidence/sprint-17/README.md). No product implementation,
architecture, trust boundary, ownership boundary or Migration 009 artifact was
changed.

## Phase completion

| Phase | Outcome | Commit |
|---|---|---|
| 0 — Activation | Scope and approved envelope locked | `28f0d45` |
| 1 — Contracts | Versioned page, cursor and budget contracts | `e64926e` |
| 2 — Eligible reads | One bounded, filtered Repository RPC | `455857b` |
| 3 — Histories/Snapshot | Bounded lifecycle, eligibility and Snapshot envelopes | `7a82861` |
| 4 — Idempotency | Exact retry and typed conflict semantics | `a5f47d2` |
| 5 — Concurrency | Real PostgreSQL atomicity and race verification | `3991773` |
| 6 — Optimisation | Measured immutable projection and justified indexes | `ce2fcc7` |
| 7 — Gates | One end-to-end command now includes Snapshot and the complete regression matrix | `c437d2d` plus closure remediation |
| 8 — Rehearsal | Permanent performance, plan, concurrency, rollback, security and catalog evidence | `3d57725` plus closure remediation |

No phases were skipped or merged.

## Verification summary

The final single Sprint 17 command passed on PostgreSQL 17.10. It applied the
exact migration to fresh disposable databases, exercised empty and normal
fixtures, ran three independently recreated 1/8/32-worker idempotency and
contention repetitions, loaded the exact 10,000-head production-shaped
fixture, enforced page and Snapshot budgets, retained before/after plans and
all 29 index dispositions, checked database security and rollback, and ran the
complete regression matrix.

Final hot-path eligible-page latency was p95 8.398 ms and p99 10.691 ms against
limits of 250 ms and 500 ms. Write p95/p99 results were at most 0.496/0.512 ms
against 200/400 ms limits. The 50-item page was 314,005 bytes with 406,176
bytes incremental heap. The retained pre-projection query examined 223,202
rows across plan nodes in 254.939 ms; the final scoped projection examined 303
rows across plan nodes in 1.258 ms. Approved final plans used bounded index
access with no fact-table sequential scan or disk spill.

The permanent evidence consists of the full raw `EXPLAIN (ANALYZE, BUFFERS,
FORMAT JSON)` documents, plan summaries, buffer usage, rows examined and
returned, complete index catalog and justification, three concurrency records,
rollback record and final suite manifest. The evidence is version-pinned to the
Migration 009 hash below.

The exact Migration 009 hash is
`fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f`,
pinned to implementation commit
`ce2fcc753ab5caf5769dff8a6fe1bb1ef7b1d6d8`. Independent pre/post rollback
catalog hashes both equal
`c26169e4540f57f0cc0ba525ceade571327cb393d02ffd735d2a313cadb08c65`.

The required regression matrix passed:

- Operator ownership, Understanding, persistence, authority and trust
- Guidance provider/application and Companion presentation
- dependency-boundary audit: 366 files, no new violations, no runtime cycles
- desktop TypeScript compilation
- ESLint with zero errors and five unchanged pre-existing warnings
- Next.js 16.2.10 production build and all 20 static pages
- `git diff --check`

The sandboxed build first failed only because configured Google fonts could not
be fetched; the approved network-enabled rerun completed successfully.

## Sprint success criteria

| # | Criterion | Result |
|---:|---|---|
| 1 | Operator, purpose and scope filter precede limit | Pass |
| 2 | Current/history pages cannot exceed 100 | Pass |
| 3 | Versioned opaque query-bound keyset cursor and watermark | Pass |
| 4 | Frozen traversal has no duplicate/missing identifier | Pass |
| 5 | Current page no more than four round trips | Pass — one |
| 6 | History page no more than two round trips | Pass — one |
| 7 | No more than 32 Evidence references per claim | Pass |
| 8 | Snapshot 100/250/512 KiB budgets | Pass |
| 9 | Exact retries produce one durable result | Pass |
| 10 | Conflicting identity does not mutate original | Pass |
| 11 | Competing revision gives one next head/no gap/stale result | Pass |
| 12 | Repeated 32-worker scenarios have no unexplained deadlock/loss | Pass — three retained repetitions |
| 13 | Production-shaped latency, memory, payload and query gates | Pass |
| 14 | Every retained index has evidence or integrity purpose | Pass — all 29 retained dispositions |
| 15 | No unbounded scale scan or disk sort | Pass |
| 16 | Ownership, RLS, role, anonymous and isolation checks | Pass |
| 17 | No new dependency exception or runtime cycle | Pass |
| 18 | Full build/lint/architecture/domain/desktop matrix | Pass |
| 19 | Exact final Migration 009 rollback/catalog rehearsal | Pass |
| 20 | Dossier pins exact commit and hash | Pass |
| 21 | Migration 009 remains undeployed | Pass — disposable local databases only |
| 22 | No producer, consumer, control, Application or Platform activation | Pass |
| 23 | Living documentation reflects repository reality | Pass — nine phases recorded consistently |
| 24 | Founder closure approval and separately approved closure commit | Pass — Founder approved closure on 22 July 2026 |
| 25 | Working tree clean | Pass — confirmed for final closure submission |

The Founder approved Sprint 17 closure on 22 July 2026 after accepting the
independent review and closure evidence remediation. All approved success
criteria are satisfied. This approval does not authorise Migration 009 deployment or
Sprint 18 activation.

## Deployment and boundary confirmation

Migration 009 was executed only in isolated disposable PostgreSQL databases
for required migration, performance, security and rollback tests. No permanent
or remote deployment was attempted. The production deployment decision remains
separate and is governed by the
[Migration 009 dossier](SPRINT_17_MIGRATION_009_DOSSIER.md).

No Repository ownership exception, Application persistence access, alternate
data store, cache, new runtime dependency, candidate producer, inference path,
Snapshot consumer or Context projection was introduced.

## Founder closure decision

The Founder approves Sprint 17 closure. Sprint 17 implementation,
verification, documentation and permanent closure evidence are complete, and
no further Sprint 17 engineering work is required.

Migration 009 remains intentionally undeployed and awaits a separate explicit
Founder deployment decision. Sprint 18 has not started and requires its own
explicit Founder instruction. Engineering stops at Sprint 17 closure.
