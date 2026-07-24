# SPRINT 24 FOUNDER PROPOSAL

**Sprint:** 24 — Adaptive Coaching, Planner and Progression

**Status:** Proposed for Founder architectural and planning review; not active

**Prepared:** 24 July 2026

## Founder decision requested

Approve Option A, authorise ADR-042 — Authoritative Operator Development
Lifecycle and Progression Accounting, and authorise preparation and activation
of the bounded Sprint 24 Plan described here.

No implementation begins from this proposal alone.

## Architectural problem

Sprint 23 can produce one trustworthy evidence-bound recommendation. Oracle
cannot yet carry that recommendation through a durable development loop:

```text
Session Report recommendation
        -> coaching focus
        -> measurable Mission
        -> Planner priority
        -> later Session Evidence
        -> Mission completion
        -> exactly-once progression
        -> outcome reassessment
```

Current source contains useful Mission, coaching and Planner engines, but the
surrounding product paths are fragmented:

- Mission outputs have no stable identity or authoritative lifecycle;
- Planner output is a transient engine profile rather than a governed Service
  projection;
- progression derives directly from browser-owned Session queries and a
  mutable Operator XP total;
- achievement unlocks write directly from a browser-facing module;
- the current achievement table cannot prove exactly-once XP accounting;
- recommendation and reassessment history have no authoritative owner; and
- existing coaching code can state expected improvement without sufficient
  outcome evidence.

Extending those seams would create competing authorities and would not satisfy
the Programme, Constitution or Codex.

## Options considered

### Option A — Distinct authoritative Services with one versioned development contract

Recommended.

- Session Report Service remains the factual recommendation authority.
- AI Coach Service owns the coaching focus derived from a report; it may
  prioritise but cannot rewrite report evidence or confidence.
- Mission Engine remains the sole mission-generation algorithm.
- Mission Service owns stable Mission identity and the lifecycle from proposed
  through accepted, active, completed, abandoned, superseded and deleted.
- Planner Service owns ordering and scheduling projections, not Mission or
  progression lifecycle.
- Progression Service owns the append-only, idempotent XP and Achievement award
  ledger and its renderer-safe projections.
- Session Service remains the sole Session lifecycle authority and supplies
  later completed Sessions and admitted Evidence for Mission evaluation.
- One versioned non-merging contract correlates recommendation, Mission,
  Planner entry, Session Evidence, completion and progression award.
- Coaching-effectiveness output is explicitly correlational unless a future
  approved causal-evidence policy exists.
- Trust & Control deletion orchestration propagates through every new owner.

This option requires ADR-042 because it establishes durable lifecycle and
accounting authority across several Services.

Advantages:

- clear single ownership;
- exactly-once awards under retry and concurrency;
- explainable recommendation-to-outcome history;
- no Application or renderer business authority;
- preserves ADR-040, ADR-041 and the Sprint 23 report directive;
- supports future coaching and conversation without parallel records.

Disadvantages:

- requires new versioned contracts and a new migration;
- requires reconciliation of several legacy direct-access paths;
- introduces cross-Service workflow certification complexity.

### Option B — In-memory development loop only

Implement the Service contracts and certify with in-memory Repositories, but
do not define durable Mission or progression persistence.

Advantages:

- smallest immediate schema scope;
- no Migration 014.

Disadvantages:

- history and exactly-once awards do not survive restart;
- cannot satisfy the approved Sprint 24 definition of done;
- defers the hardest integrity problem and creates throwaway product logic.

Rejected.

### Option C — Extend existing browser-owned tables and direct writes

Continue using the mutable Operator XP column and
`operator_achievements`, adding Mission rows and more Application-side logic.

Advantages:

- superficially fast;
- reuses existing tables.

Disadvantages:

- Applications become lifecycle and accounting authorities;
- duplicate awards remain possible under retry and concurrency;
- bypasses explicit Service ownership and manifest composition;
- cannot provide trustworthy causal or audit history;
- grows legacy boundary exceptions.

Rejected.

### Option D — One monolithic Development Service

Give one new Service ownership of coaching, Mission generation, planning,
progression and Achievements.

Advantages:

- one orchestration boundary;
- fewer public Service contracts initially.

Disadvantages:

- conflicts with the constitutional Mission Engine authority;
- collapses independent lifecycles and accounting responsibilities;
- creates a future bottleneck for Coach, Career, Planner and conversational
  Applications;
- weakens replaceability and testability.

Rejected.

## Recommended architecture

ADR-042 should establish these permanent rules:

1. Session Report Service owns factual Session recommendations.
2. AI Coach Service owns report-derived coaching focus.
3. Mission Engine owns deterministic Mission generation.
4. Mission Service is the sole durable Mission lifecycle authority.
5. Planner Service owns priority and schedule projections only.
6. Progression Service is the sole XP and Achievement accounting authority.
7. Every mutation uses authenticated Operator ownership, stable identity,
   idempotency and optimistic concurrency.
8. Mission completion requires measurable criteria evaluated against approved
   completed-Session Evidence; manual status alone cannot create an award.
9. One completion identity can produce at most one progression transaction and
   one instance of each eligible Achievement award.
10. Reassessment compares later evidence with the original recommendation
    without rewriting either record.
11. Effectiveness remains correlation with evidence, scope, confidence and
    limitations; causal claims require separately approved methodology.
12. Applications and renderers receive immutable, renderer-safe projections.
13. Trust & Control export, deletion, retention and tombstone rules apply.
14. Game-specific measurement semantics remain in Game Integrations.
15. Optional model participation cannot generate completion Evidence, XP,
    Achievement eligibility or factual effectiveness conclusions.

## Proposed Sprint scope

### Phase 1 — ADR and contracts

- create and accept ADR-042;
- versioned Coaching Focus, Mission, Planner Entry, Progression Transaction,
  Achievement Award and Development History contracts;
- stable correlation, evidence and confidence rules;
- explicit lifecycle, deletion and renderer-safe projections.

### Phase 2 — authoritative Services

- adapt AI Coach Service to consume Session Reports;
- retain deterministic Mission Engine generation;
- implement Mission Service lifecycle authority;
- introduce Planner Service projections;
- implement Progression Service exactly-once accounting;
- implement recommendation and reassessment history;
- retain instance-owned injected registries and Repositories.

### Phase 3 — Migration 014

Implement Migration 014 for:

- authoritative Missions and lifecycle receipts;
- Planner entries or projections where durable scheduling is required;
- append-only progression transactions;
- Achievement definitions and idempotent awards;
- recommendation-to-outcome correlation;
- authenticated ownership, RLS, constraints, indexes and trusted mutation
  functions;
- recoverable Trust & Control deletion topology.

Migration 014 would be implemented and certified only. It would remain
undeployed and inactive.

### Phase 4 — Applications and composition

- complete AI Coach, Planner, Career, Progress and Achievements journeys;
- remove direct browser-owned Mission, XP and Achievement mutation authority;
- update Web and Electron manifests for every added Service/Application and
  lifecycle declaration;
- advance the manifest from `1.2.0` to the next compatible version and
  mechanically verify exact constructed-runtime equality;
- ensure unavailable persistence produces honest inactive or degraded states.

### Phase 5 — certification

- trace one report recommendation through Mission generation, acceptance,
  planning, later Session Evidence, completion, exactly-once XP/Achievement
  award and reassessment;
- repeat exact commands and concurrent competing commands;
- prove cross-Operator isolation;
- prove unsupported completion and reward attempts fail closed;
- prove disagreement, insufficient Evidence and model outage cannot create
  awards;
- prove deletion and export topology;
- certify Migration 014 on disposable PostgreSQL;
- execute complete TypeScript, lint, build, architecture and manifest
  verification.

## Expected manifest impact

Sprint 24 is expected to add Planner as an explicit Service and to reconcile
Planner, Progress and Achievements as registered Applications. It changes
runtime inventory and lifecycle declarations, so ADR-040 requires a new
canonical manifest version and exact mechanical equality for Web and Electron.

Development capabilities should be optional to Platform boot but fail closed
within dependent Applications. Their failure must be observable and must never
produce synthetic progression.

## Migration recommendation

Migration 014 is recommended. Existing `operators.xp` and
`operator_achievements` structures do not provide the append-only,
idempotent, evidence-correlated accounting required by Sprint 24.

Migration 014 may preserve those fields as compatibility projections while
moving mutation authority to Progression Service and its trusted Repository.
Production execution remains a separate Founder deployment decision.

## Reversibility

Service implementations, transports, Repositories, reward formulae and
Application presentation are replaceable behind versioned contracts.

Changing Mission lifecycle ownership, progression accounting ownership or the
meaning of an issued transaction would require a superseding Founder-approved
ADR and governed migration. Award corrections should use compensating
transactions rather than history rewriting.

## Risks introduced

- reward inflation or duplicate awards;
- gamification displacing actual improvement;
- false causal claims;
- Missions becoming unstable when recommendations change;
- cross-Service partial failure;
- cross-Operator leakage;
- stale Game Integration measurement semantics;
- deletion being reported complete before every owner finishes;
- manifest drift; and
- the legacy browser seam remaining in use.

Controls include deterministic generation, stable identities, evidence gates,
idempotent append-only accounting, optimistic concurrency, compensating
transactions, explicit correlation language, Trust & Control orchestration,
renderer-safe projections, shrinking dependency exceptions and mechanical
manifest equality.

## Authority boundary requested

If the Founder approves Option A and ADR-042, the subsequent activation
decision should authorise only:

- ADR-042 creation and acceptance;
- Sprint 24 planning and source implementation;
- Migration 014 implementation;
- disposable PostgreSQL verification;
- local certification and evidence;
- manifest reconciliation and mechanical equality verification; and
- documentation reconciliation.

It should not authorise:

- production deployment;
- execution of Migrations 010–014 in production;
- Gate C;
- runtime persistence activation;
- persisted producer or consumer activation;
- production-environment changes;
- External Companion trust-boundary changes;
- weakening ADR-040 manifest verification;
- bypassing ADR-041 Session authority;
- weakening the Sprint 22 Understanding directive; or
- weakening the Sprint 23 report-authority directive.

## Recommendation

Approve Option A and ADR-042. It is the only option that satisfies Sprint 24's
end-to-end product objective while preserving single ownership, evidence,
exactly-once accounting, explainability and future architectural flexibility.
