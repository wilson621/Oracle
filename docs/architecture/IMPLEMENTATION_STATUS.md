# ORACLE IMPLEMENTATION STATUS

**Authority:** Canonical evidence-backed record of implemented repository capability
**Scope:** Verified implementation, public boundaries, known integration limits and verification evidence
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Updated when verified implementation or accepted technical debt changes
**Supersedes:** Earlier active implementation-status records
**Superseded By:** None
**Last Reviewed:** 21 July 2026
**Verified Branch:** `sprint-9-overlay`
**Verified Repository Baseline:** `01a4bdb`
**Sprint 14 Implementation Baseline:** `3868975`

---

# Purpose

This document records what is demonstrably implemented in the Oracle
repository. It is the first document engineers should read when determining
current delivery status.

`docs/founding/ORACLE_FOUNDING_CHARTER.md` defines why Oracle exists and
`docs/founding/ORACLE_STRATEGY.md` defines the long-term strategic direction.
This document separately records what is implemented now. Governance approval
does not itself constitute product capability.

The Constitution and accepted ADRs remain the architectural authority. This
document does not redefine them. When planning documents disagree with the
repository, this document records the verified implementation and identifies
the disagreement for review.

Update this file during every sprint closure audit.

---

# Latest Closed Sprint

## Sprint 14 — Companion Intelligence Foundation

The sprint is complete and its closure has been approved on
`sprint-9-overlay`. Oracle now has a permanent, game-agnostic path for external
Companion Guidance. Call of Duty supplies the first reviewed knowledge package
through that path; it does not own Companion architecture.

Implemented milestones:

- immutable, versioned and deeply frozen Guidance Framework contracts
- compatibility rules and safe handling of unknown category, type, source and
  provenance identifiers
- immutable projections of authoritative Companion Session Context
- deterministic, dependency-injected Guidance Provider Service
- output validation, immutable Service results and structured provider failure
  isolation
- curated, source-attributed Call of Duty Guidance package with no runtime
  networking or game-process interaction
- immutable Companion Guidance Application state, Guidance Cards and
  Operator-safe diagnostics
- `/companion` presentation of loading, ready, empty, partial-success and
  unavailable Application states
- focused Guidance, presentation, web, desktop, lint, architecture and visual
  closure verification

The production `/companion` route uses the Applications-owned unavailable-state
factory. It does not fabricate Session Context, Guidance, recommendations or
Operator data. The desktop composition root does not yet project authoritative
Session Context into a Guidance Request, execute the Provider Service and
deliver the resulting Application state through a renderer-safe runtime
boundary. That live delivery is deferred to Sprint 15.

No Sprint 14 engineering objective remains open. AI inference, ranking,
personalisation, runtime networking, gameplay automation and any form of game
process interaction remain explicitly out of scope.

The release decision is to close the verified sprint branch without creating
a product release tag. A tag remains a separately authorised release action.

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

## Companion Intelligence Foundation

Implemented across the permanent ownership layers:

- Platform / Companion Foundation (`lib/companion/guidance/`) owns immutable
  Guidance contracts, Session projections, validation, compatibility and
  versioning
- Services (`lib/oracle/services/companion-guidance/`) own explicit provider
  injection, eligibility, deterministic execution, output validation and
  structured failure isolation
- Applications (`lib/oracle/applications/companion/`) own immutable
  presentation state, Guidance Card view models and Operator-safe diagnostics
- React (`app/companion/` and `components/companion/guidance/`) renders only
  Application-owned models
- Game Integrations own reviewed game-specific packages under their integration
  directories

The Provider Service intentionally does not rank, personalise or make coaching
decisions. React preserves the supplied card order and performs no orchestration
or selection. Future AI providers must populate the same Guidance contract.

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
- game-agnostic Game Integration Coordinator and production registry wiring
- serialized supported-game discovery, attachment and process replacement
- renderer-safe Companion presentation projection and restricted additive
  preload bridge
- frozen Desktop Platform API version 1 and compatibility manifest

Desktop Platform services exchange serializable data and do not expose
Electron objects through their contracts.

## Game Integrations

Implemented under `lib/oracle/game-integrations/`:

- Game Integration contract and registry
- deterministic integration evaluator
- deterministic not-detected, detected and ambiguous outcomes
- executable detection profile and matcher
- Call of Duty integration with a verified `cod.exe` profile
- Warzone title evidence and launcher exclusion
- serializable game-context contract
- side-effect-free production registry factory consumed by the desktop
  coordinator
- reviewed Call of Duty curated Guidance catalogue and deterministic provider

The Call of Duty integration is the first active end-to-end implementation of
the shared Game Integration architecture. Game-specific executable and title
knowledge remains isolated inside that integration.

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
- reading the renderer-safe Companion presentation state
- subscribing to validated Companion presentation-state changes

The Companion presentation bridge is additive and separate from the frozen
Desktop Platform API version 1 namespace. It exposes only contract identity,
status, capture time and minimal active-game identity.

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
3. `/companion` exists, but authoritative Guidance Application state is not yet
   delivered from the desktop composition root; the route therefore renders an
   honest unavailable state.
4. `lib/companion` and `desktop/companion` model different lifecycle layers but
   have no implemented integration contract.
5. Curated source freshness is a manual review responsibility, and production
   runtime data has not exercised ready and partial-success presentation paths.
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
- Game Integrations provide only safe external detection and immutable,
  serializable game context.
- Desktop observation uses independent Windows facilities and never injects.
- Desktop truth crosses subsystem boundaries as immutable serializable
  snapshots and versioned events.
- Timeline is the authoritative chronological desktop record; Telemetry is a
  derived view.
- Desktop Platform API version 1 is frozen behind one explicit public import
  surface; breaking version 2 work requires an accepted ADR.
- ADR-032 defines one Guidance model and the Platform → Services → Applications
  → Game Integrations ownership boundary for Companion Intelligence.
- Any proposal requiring injection, protected-memory access or modification,
  hooks, patching, automation, input simulation, anti-cheat interference or an
  unfair-advantage technique is an architectural blocker and must be escalated.

See `docs/Decisions.md` for the complete ADR record.

---

# Verification Scope

This status was re-verified from source inspection and Git history using
`3868975` as the clean Sprint 14 implementation baseline before documentation
reconciliation.

Final closure verification passed:

- `npm run architecture:audit`
- `npm run desktop:compile`
- `npm run lint` with zero errors and five unrelated existing warnings
- `npm run build`
- `npm run guidance:verify`
- `npm run companion:presentation:verify`
- focused contract, Provider Service, curated package and Application-boundary
  verification
- desktop and narrow-screen Companion visual review with no console errors
- emitted Electron entry and native-helper path validation
- `git diff --check`
- working-tree and untracked-file inspection

Focused deterministic verification scripts are registered in `package.json`.
An interactive Electron UI smoke test remains a release-environment activity
rather than a documentation-closure requirement.

Accepted technical debt remains documented in
`DEPENDENCY_BOUNDARY_AUDIT.md`, `SPRINT_12_1_RETROSPECTIVE.md` and
`docs/sprints/SPRINT_14_CLOSURE.md`.
