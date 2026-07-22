# ORACLE PLATFORM v0.9 BASELINE

**Platform version:** Oracle Platform v0.9 Baseline

**Baseline date:** 22 July 2026

**Authority:** Point-in-time production and repository baseline

**Status:** Established

**Scope:** State immediately following the successful governed production deployment of Migration 009

This document is the authoritative Oracle platform baseline immediately
following Oracle's first governed production deployment. It records verified
state; it does not authorise implementation, deployment, runtime activation or
Sprint 18.

The supporting records are the [Migration 009 Deployment Closure
Report](sprints/SPRINT_17_MIGRATION_009_DEPLOYMENT_CLOSURE.md), [Migration 009
Dossier](sprints/SPRINT_17_MIGRATION_009_DOSSIER.md), [Implementation
Status](architecture/IMPLEMENTATION_STATUS.md), [Sprint
Index](sprints/SPRINT_INDEX.md), [Engineering Governance](GOVERNANCE.md) and
[Platform Constitution](ORACLE_PLATFORM_CONSTITUTION.md).

## Repository baseline

| Property | Baseline value |
|---|---|
| Repository | Oracle |
| Active branch | `sprint-9-overlay` |
| Baselined source commit | `9dccd8109539253fba37cc8fd90bbb2bc33c7d9f` |
| Commit purpose | Migration 009 deployment documentation closure |
| Working tree | Clean |
| Origin | Synchronized with `origin/sprint-9-overlay` |

The commit containing this document is the baseline-record commit. It changes
documentation only; the source and production state being baselined is anchored
at the parent commit above.

## Production baseline

| Property | Baseline value |
|---|---|
| Environment | Oracle production Supabase project |
| Database engine | PostgreSQL `17.6.1.141` |
| Deployment | Migration 009 deployed and verified |
| Deployment completed | `2026-07-22T19:54:43.8824144Z` |
| Artifact | `database/009_operator_intelligence_persistence.sql` |
| Artifact commit | `ce2fcc753ab5caf5769dff8a6fe1bb1ef7b1d6d8` |
| Artifact SHA-256 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |
| Deployment result | Success; one execution; exit code 0; transaction committed |

Post-deployment verification confirms that the production schema contains all
ten Migration 009 tables with RLS enabled, nine expected `SECURITY DEFINER`
functions, 29 expected indexes and ten expected policies. Constraints are
valid, grants match the certified artifact, protected pre-existing row counts
are unchanged and the newly deployed tables are empty. Own-Operator isolation,
cross-Operator exclusion, anonymous denial, authenticated write denial,
trusted-RPC denial and service-role execution all passed without residue.

The linked production metadata records PostgreSQL `17.6.1.141`. PostgreSQL
17.10 was used for the local client, backup tooling and retained Sprint 17
verification environment; it is not asserted as the managed server patch
version.

The verified pre-deployment backup package remains at
`.tmp-tools/deployment-backups/20260722T191125Z/` and contains:

- schema: `oracle-production-schema-20260722T191125Z.sql`, SHA-256
  `bbcf12246fc33dbf4e3574915deb96556c6c09ca69ae3a252776a9dda1292239`;
- data: `oracle-production-data-20260722T191125Z.sql`, SHA-256
  `70fb28f3cf7fa3a80f7d3cac5ab55e8389c4f42ccf9490c19900693f283b474d`.

## Runtime baseline

| Runtime concern | Baseline state |
|---|---|
| Operator Intelligence persistence schema | Present in production |
| Runtime persistence consumption | Disabled |
| Persistence writers and consumers | Not activated |
| Platform bootstrap | Implemented but not invoked by production entry points |
| Sprint 18 | Not started or activated |
| Active Sprint | None |

Schema availability is not runtime activation. No producer, inference path,
Snapshot consumer, control operation, Application persistence path or alternate
data store was enabled by the deployment.

## Architecture baseline

Oracle continues to use the constitutionally governed ownership chain:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

### Platform

The Platform owns shared contracts, runtimes, registries, capability
resolution, lifecycle, validation, diagnostics and health foundations. The
Operator Intelligence Repository remains the exclusive persistence owner. The
Platform bootstrap and coordination foundations compile but are not wired into
production startup. Migration 009 establishes schema capability without
activating that runtime.

### Services

Services own reusable business behaviour, including Operator Intelligence
trust decisions, ownership enforcement, bounded read contracts, idempotency and
conflict semantics. They remain independent of presentation. No new production
Service consumer or persistence writer is active at this baseline.

### Applications

Applications own presentation and Operator interaction and must consume
approved Service projections. Existing verified web, Companion and desktop
surfaces remain unchanged. Known legacy web paths that directly import
repositories, pipelines or engines remain documented boundary debt; this
baseline neither expands nor resolves that debt.

### Game Integrations

Game-specific knowledge remains isolated inside Game Integrations. Call of Duty
is the first verified end-to-end integration, including safe external detection,
serializable context and its curated Guidance package. No new Game Integration
or game-specific runtime behaviour was introduced by Migration 009.

## Engineering status

The canonical delivery line records these completed outcomes:

- Sprint 12.1 — Desktop Platform hardening: historical and complete;
- Sprint 13 — Game Integration vertical slice: historical and complete;
- Sprint 14 — Companion Intelligence Foundation: historical and complete;
- Sprint 15 — Operator Understanding Foundation: approved foundation phases
  complete and historical;
- Sprint 16 — Trust Boundary: complete; and
- Sprint 17 — Scale-Safe Trust Data Plane: fully complete, including governed
  Migration 009 production deployment and verification.

No Sprint is active. Sprint 18 is the next Programme objective but has not been
started, planned for execution or activated. Outstanding engineering work
remains the separately governed Sprint 18–31 Programme, including Operator
control, identity and commissioning, runtime activation, lifecycle,
Understanding accumulation, intelligence, product integration, distribution,
production qualification and Beta certification.

## Governance baseline

### Engineering Programme

The approved [Engineering Programme](ENGINEERING_PROGRAMME.md) remains the
authoritative Sprint 17–Beta sequence. Programme placement does not grant
implementation authority, and each Sprint requires its own approved plan and
explicit activation.

### Founder approval workflow

Founder authority remains required for Sprint planning and activation,
material scope or architecture changes, gated progression, permanent database
deployment, Sprint closure, production release and other externally
consequential actions. Approval for one stage never implies approval for the
next.

### Production deployment workflow

The governed workflow is implementation, static verification, rollback
validation, independent catalog verification, Founder review, exact-artifact
hash validation, verified backup, fresh production prerequisites, permanent
execution, post-deployment catalog and security verification, and documented
closure. Any execution error stops the sequence without retry, artifact change
or manual repair unless separately authorised.

### Backup standard

Before permanent database deployment, create separate schema-only and data
backups with supported PostgreSQL tooling against the intended production
database. Record filenames, byte sizes, UTC timestamps and SHA-256 hashes, then
verify completion markers, expected schema content, data content and protected
baseline counts before authorising execution.

### Verification standard

Verification is evidence-based and version-pinned. It includes artifact hashes,
catalog and grant inventories, valid constraints, RLS and role isolation,
protected-row preservation, rollback-only security probes, residue checks and
representative workload plans. Representative workloads are authoritative for
planner acceptance. Empty-table index choice is informational when PostgreSQL
uses an appropriate indexed path and performs no sequential scan.

## Known deferred work

### Runtime activation

Production invocation of Platform bootstrap, Operator Intelligence writers,
read consumers, inference and Context projection remains deferred. Deployment
of schema alone grants no activation authority.

### Sprint 18

Operator Trust and Control remains the next approved Programme objective, but
it requires its own Sprint Plan, Founder approval and explicit activation. No
Sprint 18 implementation is part of this baseline.

### Deployment packaging improvements

Future database delivery may improve repeatability by introducing a separately
approved, repository-native deployment package that binds the certified SQL,
hash, project identity, backup manifest, execution log and post-deployment
checks into one durable record. Any adoption must preserve historical artifact
identity, stop-on-error governance and explicit Founder authority; it must not
silently relocate old migrations, manufacture migration-ledger history or
convert deployment tooling into runtime activation.

## Baseline declaration

Oracle Platform v0.9 is the first authoritative platform baseline created
immediately after Oracle's first governed production deployment. At this point,
Migration 009 is deployed and verified, the production persistence foundation
is established, the repository is clean and synchronized, no Sprint is active,
Sprint 18 is inactive and runtime persistence remains disabled.
