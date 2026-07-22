# Sprint 17 Permanent Verification Evidence

This directory retains the machine-readable evidence produced by the approved
Sprint 17 closure command:

```powershell
npm run operator-intelligence:scale:verify
```

The command recreates a dedicated disposable PostgreSQL 17 database, applies
the exact tracked migrations, runs the complete Sprint 17 verification matrix
and replaces only the files under `generated/` after all relevant assertions
have passed.

The retained files are:

- `performance-and-query-plans.json` — exact fixture counts, latency samples,
  payload and heap results, complete before/after `EXPLAIN (ANALYZE, BUFFERS,
  FORMAT JSON)` documents, summarized rows and buffers, the complete Migration
  009 index inventory, measured index selection and an explicit justification
  for every retained index;
- `concurrency-repetition-1.json` through
  `concurrency-repetition-3.json` — three independently recreated database
  repetitions of the approved 1/8/32-worker retry, competing-revision,
  trust-mutation race, conflict and durable-row assertions;
- `rollback-and-catalog.json` — exact Migration 009 hash, PostgreSQL version,
  independent pre/post rollback catalog hashes and preservation counts;
- `verification-manifest.json` — the exact suite inventory and overall result.

All evidence is local and disposable-database evidence. It is not proof of
permanent deployment, production activation or Founder deployment approval.
