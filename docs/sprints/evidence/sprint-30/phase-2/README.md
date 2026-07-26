# Sprint 30 Phase 2 Evidence

This directory contains locally generated, non-production qualification
evidence for the exact Phase 2 candidate.

## Generated evidence

- `generated/qualification-candidate.json` — immutable candidate inputs,
  hashes and environment provenance.
- `generated/target-journeys.json` — Web and release-environment Electron
  runtime and route qualification.
- `generated/session-lifecycle-postgres.json` — canonical Migration 009–013
  lifecycle, rollback, replay, concurrency and RLS evidence.
- `generated/postgres-critical-journey.json` — Migration 009–014 synthetic
  authenticated critical-journey evidence.

All PostgreSQL evidence comes from the disposable
`oracle-sprint-30-phase-2-postgres` container. The harness removes that exact
container after verification.

## Qualification boundary

The authenticated database role/JWT boundary passed. A live Supabase
Auth/GoTrue Email + Password transaction is unavailable because no local
provider is configured. It is not represented as passed and no production
endpoint or credential was used.

The evidence grants no deployment, persistence, migration execution,
production signing, publication, distribution, Gate C or Gate 7 authority.
