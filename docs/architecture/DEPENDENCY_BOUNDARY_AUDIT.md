# ORACLE DEPENDENCY BOUNDARY AUDIT

**Sprint:** 12.1 Commit 5
**Baseline commit:** `54a7298`
**Audit date:** 24 July 2026
**Status:** Active enforced baseline; reconciled by Sprint 21

---

# Executive Summary

Oracle's Desktop Platform boundary is healthy. Its frozen version 1 API exposes
only immutable contracts, external consumers have no leaf-module imports, and
the Desktop, preload, IPC and Companion Session ownership boundaries remain
isolated from game-specific knowledge.

The broader web architecture has documented legacy exceptions. Applications
still bypass operational Service boundaries, and game-specific defaults remain
outside Game Integrations. Five source-level type/barrel cycle groups also
remain. These are a measured migration baseline, not accepted architecture.

Sprint 20 removed the active Platform Runtime imports of lower-layer global
registries. Target-specific composition roots now perform assembly outside the
Platform layer and inject instance-owned registries through Platform-owned
contracts.

Sprint 21 removed the browser-owned direct Session persistence path and its
hard-coded game knowledge. Session mutation now exists only behind the
authoritative Session Service source boundary, reducing the baseline by two.

The genuine engine runtime barrel cycle was removed through import-path changes
only. The verified runtime dependency graph now contains zero circular groups.

No Critical finding was identified. No product behavior or public contract was
changed.

---

# Automated Enforcement

Run:

```text
npm run architecture:audit
```

The audit scans repository TypeScript imports and game-specific source terms.
It fails when it finds:

- a new dependency-direction violation
- a new external Desktop Platform leaf import
- a new game-specific knowledge leak outside Game Integrations
- a new member in a source dependency cycle
- any runtime dependency cycle

The checked-in baseline records existing exceptions by exact identity. Removing
an exception is allowed. Adding a new exception requires deliberate review and
must not be hidden by regenerating the baseline.

---

# Dependency Graph Assessment

The Sprint 21 graph covers 404 TypeScript files.

- runtime circular groups: 0
- source-level type/barrel circular groups: 5
- documented boundary exceptions: 45
- new or unexpected violations: 0

The source cycle groups contain 49 file memberships across Contextual Intent,
Intelligence Engines, Loadouts, Companion Capabilities and Companion Connector
types. Their import edges are type-only or barrel-related after the runtime
engine cycle correction.

---

# Findings

## High — Applications bypass Services

**Evidence:** The enforced baseline retains exact imports from `app/` or
`components/` into repositories,
pipelines, engines, feature functions or Platform-owned types.

**Impact:** Registered Services are metadata rather than the exclusive
operational capability boundary. Applications are coupled to implementation
layout, increasing migration and testing cost.

**Recommended correction:** Introduce operational Service contracts and migrate
Applications incrementally by user journey. Do not perform a repository-wide
rewrite.

**Implementation risk:** High. This affects working web behavior and requires
separate architecture and migration approval.

## High — Game-specific defaults outside Game Integrations

**Evidence:** Five Call of Duty defaults remain in Application and shared
modules, including the analysis prompt, Operator creation, Session persistence
and two page fallbacks.

**Impact:** Game knowledge is not exclusively owned by Game Integrations.

**Recommended correction:** Replace defaults only after the existing Game
Integration result is connected through an approved game-context boundary.

**Implementation risk:** Medium to high. Premature removal would change current
product defaults without a replacement runtime source.

## Resolved in Sprint 20 — Platform bootstrap imported lower-layer registries

**Prior evidence:** Platform runtime imported global Service and Application
registries.

**Resolution:** ADR-040 introduced Web and Electron composition roots outside
the Platform layer. They inject instance-owned Service, Application, Game
Integration and Guidance registries through Platform-owned contracts. Global
Service and Application registry authority was removed.

Eight resolved baseline entries were removed. Reintroduction now fails the
audit.

## Medium — Source-level circular dependencies

**Evidence:** Five baselined source groups remain; no runtime group remains.

**Impact:** Type ownership and barrel usage are harder to extract and reason
about, but current runtime initialization is no longer circular.

**Recommended correction:** Reduce cycles incrementally by moving shared types
to leaf contract modules and avoiding imports from a barrel within the same
subsystem.

**Implementation risk:** Medium. A broad cleanup would touch mature
intelligence code and is outside this commit.

## Observation — Remaining integration limits

Production-capable Web and Electron source entry points now invoke explicit
composition roots. Platform Companion readiness and Desktop Companion Session
ownership remain deliberately separate under a versioned lifecycle contract.
Authoritative live Guidance delivery remains later Programme work.

These are known integration limits, not dependency defects corrected by this
commit.

---

# Layer Assessment

## Platform

Shared Platform and Desktop contracts remain serializable and game-agnostic.
The Platform imports only composition contracts; host roots own lower-layer
assembly.

## Services

Service registry modules do not import Applications or Game Integrations.
Services remain game-agnostic, but they are metadata definitions rather than
operational capability facades.

## Applications

Applications do not import Desktop Platform leaf modules and do not directly
import Game Integrations. Their 46 direct shared-implementation imports remain
the largest architectural debt.

## Game Integrations

Call of Duty detection knowledge is correctly isolated under
`lib/oracle/game-integrations/call-of-duty`. Five older defaults elsewhere are
baselined for later migration.

## Desktop Platform and Companion

The restricted preload exposes only `OracleDesktopBridge`; IPC is owned and
authorized by the host controller. Desktop Platform version 1 is consumed only
through its public index by external consumers. Companion Session Manager
remains the authoritative desktop Session and Context owner.

---

# Correction Priority

1. Prevent new violations through the Commit 5 automated audit.
2. Migrate Application workflows to operational Services incrementally.
3. Connect Game Integration context before removing legacy game defaults.
4. Reduce source-level type/barrel cycles during focused subsystem work.

Only item 1 and the minimal runtime-cycle import correction belong to Commit 5.
