# Sprint 22 Permanent Certification Evidence

This directory contains machine-readable local certification evidence for
Sprint 22 Operator Understanding Accumulation.

- `generated/operator-understanding-accumulation-certification.json` proves
  stable candidate identity, exact replay, game scope, policy-gated
  acceptance, contradiction, dispute, recovery, supersession, deletion,
  Snapshot freshness and renderer-safe Context projection.
- `generated/platform-composition-certification.json` proves exact canonical
  manifest/runtime equality for Web and Electron manifest version `1.2.0`.
- `generated/session-lifecycle-regression-certification.json` proves the
  permanent ADR-041 Session authority remained intact during Sprint 22.
- `generated/migration-regression-certification.json` records disposable
  PostgreSQL 17.10 regression results for Migrations 011–013 and immutable
  hashes for Migrations 009–013.

The evidence records source implementation and local certification only. It
does not activate a persisted producer or consumer, runtime persistence,
Migrations 010–013, Gate C, deployment or a production policy.
