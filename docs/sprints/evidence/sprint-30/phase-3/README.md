# Sprint 30 Phase 3 Evidence

This directory contains isolated, non-production evidence for runtime
diagnostics, reliability, failure isolation and recovery.

- `generated/qualification-candidate.json` — Phase 3 source and environment
  provenance, manifest change and local continuity risk.
- `generated/platform-composition-certification.json` — exact Web/Electron
  Runtime Manifest `1.7.0` equality.
- `generated/runtime-reliability.json` — smoke, bounded soak, renderer-safe
  health, failure isolation, crash-envelope, teardown and fresh-recovery
  evidence.
- `generated/postgres-recovery.json` — disposable backup, restore and deletion
  continuity through Migration 014.
- `generated/sprint-29-rollback-regression.json` — immutable Sprint 29
  rollback mechanics and explicit package/current-runtime separation.

All diagnostic delivery used only a bounded process-memory local sink. All
PostgreSQL backups remained in process memory. No external provider, upload,
retention, production endpoint, production credential, deployment, signing,
publication, distribution or push was used.
