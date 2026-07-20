# ORACLE IMPLEMENTATION STATUS

**Status:** Canonical living implementation record
**Last verified:** 20 July 2026
**Verified branch:** `sprint-9-overlay`
**Verified baseline before Commit 5:** `54a7298`

---

# Purpose

This document records what is demonstrably implemented in the Oracle
repository. It is the first document engineers should read when determining
current delivery status.

`docs/PROJECT_VISION.md` explains what Oracle is being built to become and why.
This document separately records what is implemented now.

The Constitution and accepted ADRs remain the architectural authority. This
document does not redefine them. When planning documents disagree with the
repository, this document records the verified implementation and identifies
the disagreement for review.

Update this file during every sprint closure audit.

---

# Current Sprint

## Sprint 12.1 — Desktop Platform Foundation and Hardening

The sprint is active on `sprint-9-overlay`.

Implemented milestones:

- Companion Session lifecycle and authoritative Session Manager
- Immutable desktop-owned Companion Context snapshots
- Canonical Desktop Host Snapshot contract and builder
- Desktop Host Snapshot Coordinator
- Versioned Desktop Host Event Stream
- Desktop Diagnostics
- Desktop Recovery lifecycle tracking
- Unified Desktop Timeline
- Derived Desktop Telemetry
- Complete Session Lifecycle (Commit 3)
- Desktop Platform API version 1 freeze (Commit 4)
- automated dependency-boundary baseline and enforcement (Commit 5)
- zero runtime circular dependency groups after engine import-path correction

Commit 3 keeps the active Session aligned with host attachment state:

- attachment moves a ready Session to `attached`
- detachment moves an attached Session back to `ready`
- reattachment reuses the active Session
- renderer load failure closes the controller and ends the started Session
  through the existing idempotent shutdown path

Remaining before Sprint 12.1 closure:

- Full build and runtime verification
- Sprint closure commit, push and release decision

Commit 6 and the remaining closure objectives are future work, not verified
functionality. Sprint 13 has not started.

---

# Verified Platform Capabilities

## Web Intelligence Platform

Implemented under `lib/oracle/`:

- Oracle Context and Context Builder
- Intelligence Pipeline and Intelligence Bus
- Engine Registry, Engine Runtime, validation and health evaluation
- Behaviour, Trend, Prediction, Mission, Memory, Evolution, Coaching,
  Contextual and Planner intelligence
- Signals, Decisions, Explainability, Timeline and Intelligence Graph
- Oracle Brain and `OracleIntelligenceState`
- Supabase-backed Operator and Session access paths

The Intelligence page builds Oracle Context and invokes the Intelligence
Pipeline directly. Several other pages also call repositories or engines
directly. The Service and Application registries are therefore not yet the
exclusive production access path.

## Platform Coordination Foundations

Implemented under `lib/oracle/platform/`, `services/`, `applications/` and
`lib/companion/`:

- Platform Runtime and bootstrap function
- ten registered Service definitions
- six registered Application definitions
- Companion Runtime foundation
- Extension Runtime and resolver
- Capability Graph
- Companion connector contracts and registry

These foundations compile, but `bootstrapOraclePlatform()` is not currently
called by a production web or Electron entry point. Registry availability must
not be described as end-to-end runtime activation.

## Desktop Platform

Implemented under `desktop/`:

- Electron main process and restricted preload bridge
- authorized IPC handlers
- transparent, frameless desktop host window
- passive click-through and interactive recovery controls
- multi-display and DPI-aware bounds handling
- native Windows discovery and observation helpers
- deterministic target evidence, scoring and selection
- attachment lifecycle and target following
- immutable host snapshots and events
- diagnostics, recovery, timeline and telemetry services
- Companion Session lifecycle and context ownership
- attachment-driven Session lifecycle synchronisation and renderer-load
  failure cleanup
- frozen Desktop Platform API version 1 and compatibility manifest

Desktop Platform services exchange serializable data and do not expose
Electron objects through their contracts.

## Game Integrations

Implemented under `lib/oracle/game-integrations/`:

- Game Integration contract and registry
- deterministic integration evaluator
- executable detection profile and matcher
- Call of Duty integration with a verified `cod.exe` profile
- Warzone title evidence and launcher exclusion
- serializable game-context contract

The Call of Duty integration is not currently registered or invoked by the
desktop host. It must not yet be described as an active end-to-end Companion
integration.

---

# Public APIs

## Verified External Boundary

The renderer-accessible desktop API is `OracleDesktopBridge` in
`desktop/contracts.ts`, exposed by `desktop/preload.ts`. It currently supports:

- reading desktop host state
- toggling overlay preview
- toggling always-on-top
- toggling click-through
- restoring interaction
- minimizing, maximizing and closing the window
- subscribing to host-state changes

IPC requests are accepted only from the controller-owned renderer.

## Frozen Desktop Platform API Version 1

The sole supported external import surface is `desktop/platform/index.ts`.
It exposes the API manifest and these immutable version 1 contracts:

- `oracle.desktop-host-snapshot`
- `oracle.desktop-host-event`
- `oracle.desktop-diagnostic`
- `oracle.desktop-recovery`
- `oracle.desktop-timeline-entry`
- `oracle.desktop-telemetry-snapshot`

`ORACLE_DESKTOP_PLATFORM_API_MANIFEST` records the API identity, version and
contract versions without duplicating their values. Services, controllers,
builders, coordinators, Electron objects and native helpers remain internal.
Existing internal leaf imports may remain, but new external consumers must use
the public index. Compatibility guarantees are documented in
`desktop/platform/API_COMPATIBILITY.md`.

---

# Architecture Validation

Oracle still follows the intended ownership model as its target architecture:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

Verified strengths:

- desktop contracts contain plain serializable data
- game-specific executable knowledge stays in the Call of Duty integration
- telemetry derives from the Timeline rather than duplicating source history
- Companion Session Manager is the single desktop Session owner
- diagnostics and recovery remain separate from Electron recovery mechanics
- the Desktop Platform public surface exposes contracts rather than services
  or host implementation objects

Open boundary findings:

1. Web Applications still import repositories, pipelines and engines directly.
2. Platform bootstrap is implemented but is not wired into production startup.
3. The registered Companion route is `/companion`, but no such App Router page
   exists; Electron currently loads `/oracle`.
4. `lib/companion` and `desktop/companion` model different lifecycle layers but
   have no implemented integration contract.
5. Game Integration evaluation is not connected to desktop Companion Context.

These are recorded findings, not authorisation to redesign verified systems.
They are now measured by `npm run architecture:audit`; documented legacy
exceptions remain technical debt and new violations fail verification.
See `docs/architecture/DEPENDENCY_BOUNDARY_AUDIT.md` for classifications,
evidence and correction priorities.

---

# Architectural Decisions in Force

- The Oracle Platform Constitution is the highest authority.
- Platform → Services → Applications → Game Integrations is the target ownership
  model.
- Companion is an Oracle Platform subsystem and remains external to games.
- Desktop observation uses independent Windows facilities and never injects.
- Desktop truth crosses subsystem boundaries as immutable serializable
  snapshots and versioned events.
- Timeline is the authoritative chronological desktop record; Telemetry is a
  derived view.
- Desktop Platform API version 1 is frozen behind one explicit public import
  surface; breaking version 2 work requires an accepted ADR.

See `docs/Decisions.md` for the complete ADR record.

---

# Verification Scope

This status was produced from source inspection and Git history using
`54a7298` as the clean baseline before Commit 5. Commit 5 verification includes
the automated dependency audit, desktop TypeScript compilation, lint,
production build, `git diff --check` and working-tree inspection. Runtime UI
verification and the work explicitly listed under remaining Sprint 12.1
objectives are not claimed by this document.
