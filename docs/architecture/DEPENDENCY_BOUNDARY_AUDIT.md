# ORACLE DEPENDENCY BOUNDARY AUDIT

**Sprint:** 12.1 Commit 5
**Baseline commit:** `54a7298`
**Audit date:** 20 July 2026
**Status:** Implemented; review gate pending

---

# Executive Summary

Oracle's Desktop Platform boundary is healthy. Its frozen version 1 API exposes
only immutable contracts, external consumers have no leaf-module imports, and
the Desktop, preload, IPC and Companion Session ownership boundaries remain
isolated from game-specific knowledge.

The broader web architecture has documented legacy exceptions. Applications
still bypass operational Service boundaries, Platform bootstrap imports lower
layer registries, and five game-specific defaults remain outside Game
Integrations. Five source-level type/barrel cycle groups also remain. These are
accepted as a measured baseline for this commit, not accepted architecture.

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

The Commit 5 graph covers 317 TypeScript files.

- runtime circular groups: 0
- source-level type/barrel circular groups: 5
- documented boundary exceptions: 55
- new or unexpected violations: 0

The source cycle groups contain 49 file memberships across Contextual Intent,
Intelligence Engines, Loadouts, Companion Capabilities and Companion Connector
types. Their import edges are type-only or barrel-related after the runtime
engine cycle correction.

---

# Findings

## High — Applications bypass Services

**Evidence:** 46 exact imports from `app/` or `components/` into repositories,
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

## Medium — Platform bootstrap imports lower-layer registries

**Evidence:** Four imports connect Platform runtime/types to Service and
Application registry modules.

**Impact:** Registration orchestration is coupled to lower-layer definitions,
which weakens dependency inversion even though production bootstrap is not yet
active.

**Recommended correction:** Supply registration definitions through an
explicit bootstrap composition boundary when production Platform activation is
planned.

**Implementation risk:** Medium. Changing it before bootstrap activation would
redesign an unproven integration seam.

## Medium — Source-level circular dependencies

**Evidence:** Five baselined source groups remain; no runtime group remains.

**Impact:** Type ownership and barrel usage are harder to extract and reason
about, but current runtime initialization is no longer circular.

**Recommended correction:** Reduce cycles incrementally by moving shared types
to leaf contract modules and avoiding imports from a barrel within the same
subsystem.

**Implementation risk:** Medium. A broad cleanup would touch mature
intelligence code and is outside this commit.

## Observation — Inactive integration foundations

Platform bootstrap is not called by production entry points, the Platform and
desktop Companion lifecycle models remain separate, and Game Integration
evaluation does not populate desktop Companion Context.

These are known integration limits, not dependency defects corrected by this
commit.

---

# Layer Assessment

## Platform

Shared Desktop Platform contracts remain serializable and game-agnostic. The
frozen public surface is respected. The four baselined registry imports remain
the principal coordination-layer exception.

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
4. Invert Platform registration dependencies when production bootstrap is
   activated.
5. Reduce source-level type/barrel cycles during focused subsystem work.

Only item 1 and the minimal runtime-cycle import correction belong to Commit 5.
