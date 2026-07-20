# ORACLE PROJECT BOARD

**Version:** 4.0
**Last updated:** 20 July 2026
**Branch:** `sprint-9-overlay`
**Implementation baseline before Commit 6:** `6084b7e`

---

# Current Sprint

## Sprint 12.1 — Desktop Platform Foundation and Hardening

**Status:** Complete — final hardening and closure verification passed

Sprint 13 has not started.

---

# Completed Sprint 12.1 Milestones

- [x] Companion Session Manager
- [x] Companion Context Ownership
- [x] Desktop Host Snapshot
- [x] Snapshot Coordinator
- [x] Desktop Host Event Stream
- [x] Desktop Diagnostics
- [x] Desktop Recovery
- [x] Desktop Timeline
- [x] Desktop Telemetry
- [x] Documentation implementation audit
- [x] Canonical `IMPLEMENTATION_STATUS.md`
- [x] Permanent `PROJECT_VISION.md`
- [x] Commit 3 — Complete Session Lifecycle
- [x] Commit 4 — Desktop Platform API Freeze
- [x] Commit 5 — Dependency Boundary Audit
- [x] Commit 6 — Final Hardening and Sprint Closure

Commit 3 synchronises attachment changes with the authoritative Companion
Session lifecycle and guarantees cleanup when the renderer fails to load.

---

# Sprint 12 Commit Sequence

- [x] Commit 1
- [x] Commit 2
- [x] Commit 3 — Complete Session Lifecycle
- [x] Commit 4 — Desktop Platform API Freeze
- [x] Commit 5 — Dependency Boundary Audit
- [x] Commit 6 — Final Hardening and Sprint Closure

---

# Remaining Sprint 12.1 Work

- [x] Dependency-boundary audit implementation and automated enforcement
- [x] Final-closure desktop TypeScript compilation
- [x] Final-closure lint verification
- [x] Final-closure Next.js production build
- [x] Native Windows helper build verification
- [x] Runtime and lifecycle source review proportional to desktop risk
- [x] Issue classification and documentation closure
- [x] Sprint closure and release decision

No Sprint 12.1 engineering objective remains open. The release decision is to
close the verified sprint on `sprint-9-overlay` without creating a product
release tag; tagging remains part of a separately authorised release workflow.

---

# Verified Platform State

## Intelligence Runtime

- Oracle Context, Pipeline and Intelligence Bus implemented
- Engine Registry and Engine Runtime implemented
- Signals, Decisions, Explainability, Timeline and Intelligence State
  implemented
- production Intelligence page calls the Pipeline directly

## Platform Coordination

- Platform Runtime and bootstrap function implemented
- ten Service definitions registered by Platform Runtime
- six Application definitions registered by Platform Runtime
- Extension Runtime and Capability Graph implemented
- production startup does not currently invoke Platform bootstrap

## Desktop Platform

- Electron host and restricted preload bridge implemented
- deterministic discovery, target scoring and attachment implemented
- native Windows discovery and observation implemented
- versioned immutable desktop contracts implemented
- Diagnostics, Recovery, Timeline and Telemetry implemented
- Desktop Platform API version 1 is frozen through the sole supported external
  import surface at `desktop/platform/index.ts`

## Companion

- Platform-level Companion Runtime foundation implemented
- desktop Companion Session and Context ownership implemented
- attachment and detachment transitions are reflected in the active desktop
  Companion Session
- renderer load failure closes the desktop controller and ends the started
  Session
- the two lifecycle layers are not yet connected by an explicit contract
- Electron currently loads `/oracle`; registered `/companion` route is absent

## Game Integrations

- Game Integration contract, registry and evaluator implemented
- Call of Duty integration and executable profile implemented
- integration is not registered into the desktop host
- desktop Companion game context remains unset

---

# Architecture Audit

Target ownership remains:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

Open findings:

1. some web Applications directly import repositories, pipelines and engines
2. Platform bootstrap is not a production entry-point dependency
3. registered Services and Applications are metadata foundations, not the
   exclusive runtime boundary
4. Game Integration output is not connected to desktop Companion Context

These findings are measured legacy exceptions recorded by Commit 5. They are
accepted technical debt for Sprint 12.1 closure and do not authorise redesign
or begin Sprint 13.

---

# Documentation Health

- [x] Constitution reviewed; no change required
- [x] Codex reviewed; normative standards remain authoritative
- [x] Oracle Principles reviewed; no change required
- [x] Architecture aligned to verified implementation
- [x] Companion Architecture aligned to verified implementation
- [x] Roadmap distinguishes projection from delivered work
- [x] Master Build Plan reflects Sprint 12.1
- [x] ADRs record desktop snapshot/event and Timeline/Telemetry ownership
- [x] ADR records the Desktop Platform API version 1 compatibility commitment
- [x] Sprint 12.1 implementation audit added
- [x] Sprint 12.1 retrospective added

---

# Closure Rule

Sprint 12.1 closure verification passed on 20 July 2026. The architecture
audit, desktop TypeScript compilation, lint, production build, native helper
builds, dependency inspection and repository checks all passed. The five
existing lint warnings remain documented, unrelated technical debt.
