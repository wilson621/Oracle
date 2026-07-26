# SPRINT 30 PLAN — PRODUCTION QUALIFICATION

**Status:** Founder-approved; Phases 1–4 complete; Phase 5 not started
**Approved option:** Option A — Governed Isolated Production Qualification
**ADR:** ADR-047
**Migration:** None
**Production deployment:** Not authorised
**Gate 7 approval:** Not authorised
**Clean-machine status:** Clean-Machine Certification Deferred — Required
Disposable Windows Environment Unavailable

---

# Objective

Independently qualify the assembled Oracle product across security, privacy,
reliability, performance, accessibility, recovery, compatibility, diagnostics
and support without treating qualification as deployment, activation, release
or authority to weaken an existing boundary.

# Permanent Diagnostic Principle

Operational diagnostics exist solely to diagnose, recover, support and improve
Oracle as software. They never become Operator Intelligence, Evidence,
Understanding, Memory, behavioural profiling, gameplay understanding or
Oracle Truth, and never influence coaching, recommendations, planning or
future intelligence.

# Delivery Rules

- Work proceeds in separately verified and committed phases.
- Engineering stops after each phase and returns a progress report before
  beginning the next phase.
- Every qualification result is identified as passed, failed, deferred or
  unavailable.
- Missing mandatory evidence cannot be converted into a pass.
- Production endpoints, credentials, data, migrations and persistence remain
  outside every phase.
- Corrective work remains visible. Any new architectural, trust, security or
  product boundary returns for Founder review.

# Phase 1 — Authority and Diagnostic Admission Foundation

## Scope

- record the Founder decision and ADR-047;
- establish the versioned non-authoritative operational diagnostic envelope;
- establish instance-owned, allowlisted diagnostic definition and admission
  policy;
- prohibit arbitrary messages, undeclared fields, sensitive fields and unsafe
  values;
- implement a bounded, process-memory-only local certification sink;
- implement disabled, stopped and sink-failure fail-closed states;
- certify immutability, minimisation, separation and teardown;
- reconcile programme and architecture documentation.

## Exit Criteria

- ADR-047 is accepted and documented;
- diagnostic contracts compile independently;
- conformance certification passes;
- no diagnostic path depends on Evidence, Understanding, Memory, coaching,
  planning, progression or another authoritative Service;
- no runtime composition change has occurred, so manifest `1.6.0` equality
  remains mandatory and unchanged;
- TypeScript, lint, production build and architecture audit pass;
- one local Phase 1 commit exists and the repository is clean.

# Phase 2 — Qualification Candidate and Critical Journeys

Freeze exact Runtime Manifest, Release Manifest, dependency, migration and
environment provenance. Build repeatable Web and release-environment Electron
critical-journey suites. Exercise authentication, cross-Operator isolation,
Session, Evidence, Understanding, Mission, Progression, export and deletion
paths against synthetic data in disposable PostgreSQL using the canonical
migration chain through Migration 014.

Production persistence remains disabled. Any inability to establish a
production-shaped authenticated environment is recorded as unavailable rather
than bypassed.

**Completion status:** Complete and locally verified. The exact candidate is
frozen, Web and release-environment Electron target qualification passes, and
the disposable PostgreSQL critical journey through Migration 014 passes.
Authenticated database role/JWT isolation is proven. A live Supabase
Auth/GoTrue Email + Password transaction is honestly unavailable because no
local provider is configured. At the Phase 2 exit, Phase 3 had not begun.

# Phase 3 — Runtime Diagnostics, Reliability and Recovery

Integrate the ADR-047 capability through explicit composition roots if the
Phase 2 candidate proves the need. Any new subsystem must update both canonical
runtime manifests and preserve mechanical equality. Certify renderer-safe
health, local crash envelopes, smoke, soak, failure isolation, fresh recovery,
backup, restore, deletion, incident response and Sprint 29 rollback mechanics.

No external provider, network upload or retention is permitted.

**Completion status:** Complete and locally verified. ADR-047 is explicitly
injected through both composition roots as a required manifest-declared
subsystem. Canonical delivery remains disabled. Runtime Manifest `1.7.0`
equality, renderer-safe health, local crash envelopes, smoke, bounded soak,
failure isolation, fresh recovery, disposable backup/restore/deletion and
Sprint 29 rollback regression pass. The immutable Sprint 29 package remains
bound to `1.6.0`; later integrated candidate reconciliation is required and no
rebuild or signing occurred. At the Phase 3 exit, Phase 4 had not begun.

# Phase 4 — Performance, Accessibility, Compatibility and Support

Establish reproducible CPU, GPU, memory, startup, Guidance-latency and API
budgets. Complete keyboard, focus, contrast, scalable text, reduced motion and
screen-reader review. Reconcile the supported Windows/display matrix, warning
register, support runbooks, triage and escalation.

The disposable clean-Windows suite remains mandatory. If the environment is
unavailable, the affected evidence and Sprint 30 completion remain blocked.

**Completion status:** Complete and locally verified. Frozen current-host
budgets pass for production-build startup, authenticated route/API boundaries,
CPU, memory and deterministic Guidance latency. The public authentication
journey passes bounded keyboard/focus, contrast, semantic, compact-layout,
scalable-text reflow and reduced-motion source review. Live authenticated
protected-route rendering, installed-package GPU evidence and disposable
clean-Windows certification remain unavailable or deferred and are not
represented as passed. Phase 5 has not begun.

# Phase 5 — Integrated Qualification and Founder Acceptance Package

Run the complete qualification matrix against the frozen candidate. Close all
critical and high-severity findings, disposition lower-severity findings,
produce the final Production Qualification dossier and prepare the Sprint 30
Founder Acceptance Package.

This phase does not approve Gate 7. Gate 7 remains a separate Founder decision.

# Authority Not Granted

Sprint 30 does not authorise:

- production deployment or production-environment changes;
- production migration execution or persistence activation;
- Gate C or Gate 7 approval;
- production signing, hosting, publication or distribution;
- production telemetry or an external crash-reporting provider;
- automatic upload, external processing or diagnostic retention;
- captured-content, Guidance, conversation or progress retention;
- Minecraft certificate promotion or observation activation;
- Guidance v2 or Desktop Platform API v2;
- Sprint 31, Beta certification or release;
- remote push; or
- weakening ADR-040 through ADR-047.
