# Sprint 21 Permanent Certification Evidence

This directory contains the machine-readable local certification evidence for
ADR-041 and Sprint 21.

- `generated/session-lifecycle-certification.json` proves the authoritative
  Service lifecycle, idempotency, recovery, deletion, history and Companion
  correlation contracts.
- `generated/platform-composition-certification.json` proves exact canonical
  manifest/runtime equality for Web and Electron manifest version `1.1.0`.
- `generated/migration-013-certification.json` proves disposable PostgreSQL
  rollback equality, preservation, concurrency, minimisation, privilege and
  RLS properties.

The evidence records implementation and certification only. It is not
deployment evidence and does not activate runtime persistence, a producer,
consumer, Migration 010–013 or Gate C.
