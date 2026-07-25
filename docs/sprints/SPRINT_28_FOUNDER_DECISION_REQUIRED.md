# SPRINT 28 FOUNDER DECISION PACKAGE — UNIFIED ORACLE PRODUCT EXPERIENCE

**Status:** Founder decision required; implementation not started
**Prepared:** 25 July 2026
**Recommended option:** Option A
**ADR required:** No
**Migration proposed:** None

---

# Decision Requested

Approve Option A: a governed product-convergence Sprint that makes the existing
Oracle capabilities one coherent, truthful Beta journey without moving
business authority into presentation code or expanding any production,
persistence, game-support or trust boundary.

# Architectural and Product Problem

Sprints 17–27 established authoritative Services, evidence governance,
composition roots, renderer-safe contracts and a bounded Companion. The
current product surface does not yet present those capabilities as one
coherent Operator journey.

Repository inspection found:

- two independent Sidebar implementations with different route inventories;
- thin or disconnected routes, including reports and progress;
- no canonical Settings route despite account and security configuration
  surfaces;
- a production-path `Mock Adventure` connector;
- mock weapon-performance data used by the loadout engine; and
- separate UI surfaces that do not yet share one consistent loading, empty,
  degraded, error, recovery, evidence and freshness language.

The problem is therefore controlled product convergence. Oracle must expose
only capabilities that are genuinely available, connect them through one
navigation and state model, and remove or explicitly defer anything that
cannot be truthfully supported.

COD/Warzone remains Oracle's first proving ground. Minecraft is only the
second bounded reference profile and is not operationally supported. Sprint 28
must not invert, obscure or broaden that position.

# Viable Options

## Option A — Governed Full-Journey Convergence (Recommended)

Create a route-by-route truth matrix, adopt one canonical product shell and
navigation model, connect each retained surface to existing renderer-safe
Application projections, remove production mock data, and use explicit
unavailable or deferred states wherever an approved capability is inactive.

### Advantages

- Meets the approved Sprint 28 objective and Definition of Done directly.
- Produces one testable Beta walkthrough rather than a collection of pages.
- Removes mock and dead-end product claims.
- Preserves authoritative Service ownership and renderer restrictions.
- Makes unavailable features, including Minecraft observation, explicit and
  fail-closed.
- Allows Web and Electron to share presentation semantics without sharing
  native authority.

### Disadvantages

- Has a broader UI regression surface than a navigation-only change.
- Requires disciplined route inventory and deletion decisions.
- May remove visually complete surfaces whose underlying capability is not
  truthful or connected.
- Requires end-to-end accessibility and responsive verification across the
  retained journey.

## Option B — Shell and Navigation Consolidation Only

Replace the duplicate shell and repair links, but leave most page-local data
flows and state handling unchanged.

### Advantages

- Smallest source change and shortest immediate implementation.
- Lower short-term visual regression risk.
- Establishes a canonical navigation component.

### Disadvantages

- Does not remove mock recommendations or disconnected product states.
- Leaves inconsistent truth, evidence and degraded-state presentation.
- Cannot satisfy Sprint 28 acceptance or the approved Beta walkthrough.
- Defers the highest-value convergence work while creating a misleading sense
  of product completeness.

## Option C — Reprogramme Sprint 28 as Multiple Product Sprints

Split audit, navigation, capability integration, accessibility and end-to-end
qualification into separately governed Sprints.

### Advantages

- Reduces the size and review surface of each delivery unit.
- Allows each product area to receive an independent acceptance milestone.
- Provides additional scheduling flexibility if material unknowns emerge.

### Disadvantages

- Changes the approved Engineering Programme sequence.
- Delays a coherent Beta journey and downstream packaging qualification.
- Adds governance overhead without resolving a presently known architectural
  conflict.
- Risks inconsistent intermediate shells and state models.

## Option D — Contract to a Minimal Beta Surface

Remove every incomplete route and ship only the smallest already-connected
Oracle, Companion and Session journey.

### Advantages

- Produces the smallest product and certification surface.
- Removes unsupported claims decisively.
- Lowers short-term UI maintenance and regression cost.

### Disadvantages

- Discards approved, implemented capability that can be connected truthfully.
- Fails the Programme objective for a coherent full Operator experience.
- Weakens the Beta's ability to demonstrate Oracle's evidence, coaching,
  understanding, trust and progression architecture.
- Would require a Founder product-scope decision about which promised
  experiences to remove.

# Recommendation

Approve Option A.

It is preferred because the required work is already authorised by the
existing architecture: Services own truth and mutation, Applications expose
safe projections, renderers present those projections, and ADR-040 verifies
runtime composition. Sprint 28 can consolidate the product without inventing
a new authority, persistence model, trust boundary or migration.

# Proposed Engineering Plan

## Phase 1 — Product Truth Inventory

- Record every route, navigation entry, data source, authority, supported
  state and intended Operator outcome.
- Classify each surface as retain and connect, consolidate, explicitly defer,
  redirect or remove.
- Treat Minecraft observation as unavailable: its provisional certificate and
  disabled capability cannot satisfy any required Beta step.

## Phase 2 — Canonical Shell and Journey

- Establish one canonical Web/Electron-compatible product shell.
- Establish one navigation and information architecture.
- Define a coherent journey across Oracle, Companion, Sessions, Reports,
  Intelligence, Coach and Planner, Understanding, Operator and Trust,
  Progression, Settings, first-run and diagnostics.
- Remove dead routes and conflicting navigation.

## Phase 3 — Truthful Surface Integration

- Bind retained surfaces only to existing authenticated, renderer-safe
  Application or Service projections.
- Remove production use of the mock game connector and mock loadout
  performance.
- Keep test fixtures isolated to tests and certification.
- Use explicit unavailable or deferred presentation where no authoritative
  capability is active.
- Keep business rules, mutation and factual authority out of React and
  renderer processes.

## Phase 4 — Unified Product States

- Reconcile loading, empty, unavailable, degraded, error and recovery states.
- Present evidence, provenance, confidence, freshness, scope and limitations
  consistently wherever required by the owning contract.
- Reconcile privacy, consent, account security, accessibility, responsive
  behaviour and support diagnostics.

## Phase 5 — Certification and Reconciliation

- Certify the complete Founder Beta walkthrough in Web and Electron.
- Verify route integrity, keyboard navigation, responsive behaviour and
  renderer boundaries.
- Verify no production mock recommendations, dead routes or unexplained
  placeholders remain.
- Reconcile manifests only if runtime composition actually changes; exact
  mechanical equality remains mandatory.
- Reconcile implementation and programme documentation.

# Architectural Boundaries

Sprint 28 will not create a new source of truth. Existing authoritative
ownership under ADR-040 through ADR-045 remains unchanged.

- React and renderer code remain presentation-only.
- Web and Electron consume renderer-safe projections.
- Native capture, process and controller authority stays outside renderers.
- Conversation remains non-authoritative and transient.
- Sessions, Evidence, Understanding, Reports, Missions and Progression retain
  their existing owners.
- Guidance delivery remains transient and non-authoritative.
- The Minecraft profile remains provisional, disabled and outside operational
  support.
- Manifest equality cannot be bypassed or weakened.

# ADR Assessment

No new ADR is recommended. The proposal consolidates presentation within
accepted composition, authority and trust boundaries. It does not alter those
boundaries.

A new Founder decision would be required before implementation could introduce
a new lifecycle owner, persistence or retention, a trust-boundary change,
authoritative renderer behaviour, a new game-support claim or another
architectural exception.

# Long-Term Implications

Option A establishes the product shell and truthful state vocabulary that
future surfaces must reuse. It reduces parallel presentation structures and
makes capability support auditable at the UI boundary.

The decision is reversible at the visual and navigation level. Individual
routes and layouts can evolve later. The underlying rule—that product claims
must reflect authoritative capability and governed evidence—should remain
permanent.

# Risks and Controls

- **Accidental authority leakage:** enforce dependency audits and renderer-safe
  contracts.
- **Cosmetic completion without real integration:** require the route truth
  matrix and end-to-end walkthrough.
- **Feature loss through premature removal:** preserve truthful capability;
  defer or consolidate only after tracing its authoritative source.
- **Regression across two targets:** certify both Web and Electron paths.
- **False Minecraft support:** keep the provisional certificate visible,
  observation disabled and the operational step non-blocking.
- **Scope expansion:** return for Founder review if the work requires a
  migration, persistence, retention, new API version, trust change or new
  authority.

# Certification Standard

Sprint 28 is complete only when:

- the Founder can perform the full approved Beta walkthrough without mock
  recommendations, dead routes or unexplained placeholders;
- all retained surfaces truthfully represent active, inactive, degraded and
  deferred capability;
- TypeScript, lint, production build and Electron compilation pass;
- architectural dependency and renderer-boundary checks pass;
- manifest/runtime equality passes for both targets;
- accessibility, responsive behaviour and route integrity are verified; and
- production, migrations, persistence, Gate C and the Minecraft operational
  certificate remain unchanged.

# Authority Requested

Approval of Option A would authorise:

- Sprint 28 planning and source implementation;
- local verification and certification;
- route, shell and presentation consolidation;
- removal or honest deferral of unsupported UI and production mock paths;
- manifest reconciliation if composition changes, without weakening equality;
  and
- documentation reconciliation.

It would not authorise:

- production deployment or production environment changes;
- any database migration;
- runtime persistence or persisted producers or consumers;
- Gate C;
- Minecraft certificate promotion, live observation activation or a support
  claim;
- captured-content, Guidance, conversation or progress retention;
- AI or renderer mutation authority;
- Guidance v2 or Desktop Platform API v2;
- External Companion trust-boundary changes; or
- weakening ADR-040, ADR-041, ADR-042, ADR-043, ADR-044 or ADR-045.

# Founder Decision Required

Approve or reject Option A and authorise Sprint 28 implementation and local
certification within the boundaries above.

Sprint 28 implementation has not begun.
