# SPRINT 21 IMPLEMENTATION EVIDENCE

**Sprint:** 21 — Oracle Session and Evidence Lifecycle

**Status:** Source implementation complete and locally certified

**Date:** 24 July 2026

**Authority:** ADR-041

## Delivered architecture

### Authoritative Session lifecycle

`lib/oracle/sessions/` defines immutable versioned Session, command, Evidence,
status and Companion-correlation contracts.

`OracleSessionService` is the only lifecycle owner. It implements:

- authenticated begin, resume, recover, complete and abandon;
- stable Session identity;
- optimistic lifecycle versions;
- ownership-bound idempotency;
- explicit Evidence admission;
- recoverable deletion-pending and deletion-complete transitions;
- renderer-safe status and export projections;
- deterministic history pagination and filtering; and
- lifecycle diagnostics and metrics.

The in-memory Repository provides isolated runtime and contract verification.
The Supabase Repository provides the source adapter for the trusted
Migration 013 function but is deliberately not composed while runtime
persistence remains disabled.

### Companion correlation

The Desktop Companion Session Manager retains live Session, attachment and
current Context authority. It can establish exactly one immutable versioned
correlation to a durable Session identity. Desktop and durable Session
identities remain distinct, and correlation creates no Desktop persistence
authority.

### Session History

The Applications layer now includes a registered `sessions` Application and a
real `OracleSessionHistoryApplication` boundary for paginated history, detail,
renderer-safe export and deletion requests.

The `/sessions` route remains on its inactive presentation because activating
the persisted consumer was explicitly not authorised. Local certification
exercises the real Application against the authoritative Service.

### Composition contract

The Web and Electron canonical manifests are version `1.1.0`. Both declare:

- the registered `sessions` Application;
- required `session-lifecycle` subsystem; and
- `oracle.session-lifecycle` contract version 1;
- Session Service authority; and
- persistence disabled.

Mechanical verification compares that declaration with the constructed fresh
runtime. Recovery constructs a new Session Service instance.

### Legacy seam reduction

The browser-owned `saveOracleSession` direct Supabase writer was removed.
The analysis UI no longer creates a competing Session authority or hard-codes
game identity into Session persistence. The dependency baseline reduced from
47 to 45 exceptions.

## Migration 013

`database/013_authoritative_session_lifecycle.sql`:

- evolves `oracle_sessions` into the canonical lifecycle record while
  preserving existing owned and unowned historical Sessions;
- adds stable lifecycle, Context, eligibility, deletion and contract fields;
- adds minimised Evidence-reference and idempotent command-receipt relations;
- removes authenticated direct Session insertion;
- exposes one service-role-only mutation function;
- adds authenticated own-Operator read policies;
- enforces raw-content exclusion for new lifecycle and Evidence contracts;
- supports deterministic history indexes; and
- remains transactional and rollback-safe.

Migration 013 SHA-256:

`7228c0384caed59f2a042e17eb6b2ea935bfed6b72e6372649d93f0874c5f68a`

## Explicitly unchanged

- Production remains post-Migration-009.
- Migrations 010–013 are undeployed and inactive.
- Gate C remains deferred.
- Runtime persistence remains disabled.
- No persisted producer or consumer was activated.
- No raw observation retention was introduced.
- The External Companion trust boundary is unchanged.
- Migration 009–012 bytes are unchanged.
