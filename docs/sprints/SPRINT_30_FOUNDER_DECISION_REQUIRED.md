# SPRINT 30 FOUNDER DECISION PACKAGE

**Status:** Founder decision required
**Sprint:** 30 — Production Qualification
**Prepared:** 25 July 2026
**Implementation:** Not started
**Recommended option:** Option A — Governed Isolated Production Qualification
**Expected ADR:** ADR-047 — Privacy-Safe Operational Diagnostics and Crash Reporting
**Deployment:** Not authorised

---

# Decision Requested

Approve or reject the authority needed to independently qualify the assembled
Oracle product without treating qualification as deployment, release or
permission to weaken any existing architectural boundary.

The recommendation is **Option A — Governed Isolated Production
Qualification**.

# Architectural and Governance Problem

Sprints 17–29 established the governed product, its authoritative Services,
its truthful Web and Electron journeys and its Windows distribution
mechanisms. Sprint 30 must now evaluate the complete assembled product across
security, privacy, reliability, performance, accessibility, recovery,
compatibility, diagnostics and support.

Three boundaries require an explicit Founder decision before this work starts:

1. Sprint 30 must exercise durable authentication, isolation, backup, restore,
   deletion and retention paths. Production remains on Migration 009 and
   runtime persistence remains disabled.
2. Privacy-safe operational diagnostics and crash reporting are a new
   concrete boundary identified by the Engineering Programme as requiring an
   ADR. Diagnostics must not silently create surveillance, captured-content
   retention or an external trust boundary.
3. Clean-machine Windows evidence remains unavailable. Sprint 30 must not
   convert the Sprint 29 deferral into a pass or claim Gate 7 while required
   environmental evidence is absent.

# Option A — Governed Isolated Production Qualification

Authorise Sprint 30 planning, implementation and certification in isolated,
disposable qualification environments, with ADR-047 defining a
privacy-minimised diagnostics and crash-reporting boundary.

The authority would permit:

- construction of repeatable qualification harnesses and evidence;
- use of the canonical migration chain through Migration 014 only in
  disposable local PostgreSQL qualification environments;
- activation of persisted producers and consumers only inside those
  disposable qualification environments and only for the tests that require
  them;
- production-shaped authentication, cross-Operator isolation, backup,
  restore, deletion and retention exercises using synthetic qualification
  identities and data;
- deterministic critical-journey, Electron smoke, soak, recovery,
  performance, accessibility, dependency, supply-chain, warning and support
  certification;
- exercise of the committed Sprint 29 distribution mechanisms without
  redesigning them;
- an instance-owned, dependency-injected diagnostic capability whose default
  production state remains disabled;
- local, purpose-scoped, minimised and redacted diagnostic envelopes for
  certification, with no automatic external upload and no third-party
  provider;
- renderer-safe health and diagnostic projections;
- a final Production Qualification dossier that distinguishes passed, failed,
  deferred and unavailable evidence mechanically and visibly.

The authority would not permit:

- production database migration, production persistence or production data;
- production deployment, publication, distribution, signing or hosting;
- external crash-reporting or telemetry providers;
- automatic upload or external processing;
- raw-frame, screenshot, clip, Guidance, conversation or progress retention;
- captured content, credentials, tokens, prompts, provider responses or
  authoritative Oracle records in diagnostic payloads;
- qualification of any unsupported game, environment or capability;
- promotion of the Minecraft certificate or activation of observation;
- Gate 7 approval, Sprint 31, Beta certification or release;
- weakening ADR-040 through ADR-046.

If a disposable Windows environment is still unavailable, Windows
clean-machine and compatibility results remain explicitly unavailable. Sprint
30 may make progress, but it cannot satisfy its Definition of Done or pass
Gate 7 until all mandatory environmental evidence exists.

## Advantages

- Tests the real authoritative lifecycle without changing production.
- Preserves the separation between implementation, certification, deployment,
  activation and release.
- Makes diagnostics useful for operations while minimising privacy exposure.
- Gives every qualification claim reproducible evidence and an explicit
  environment identity.
- Reuses rather than recreates Sprint 29 distribution mechanics.
- Fails closed when an environment or result is unavailable.

## Disadvantages

- Requires substantial disposable-environment orchestration and synthetic
  data management.
- Cannot complete clean-machine or supported-Windows coverage until an
  authorised disposable Windows environment exists.
- A local-only diagnostic sink proves the contract and privacy controls, not
  any future external provider's operational behaviour.
- Full qualification may expose defects that require separately governed
  corrective work before Sprint 30 can close.

# Option B — Source and Current-Host Qualification Only

Keep persistence inactive everywhere and certify only source, synthetic and
current-host behaviour.

## Advantages

- Smallest immediate authority.
- No temporary durable runtime activation.
- No new operational data-processing boundary.

## Disadvantages

- Cannot genuinely test authentication persistence, cross-Operator isolation,
  backup, restore, deletion or retention.
- Repeats the known current-host limitation rather than independently
  qualifying the product.
- Cannot satisfy Sprint 30's approved Definition of Done or Gate 7.
- Creates a serious risk that partial evidence is mistaken for production
  qualification.

# Option C — Production-Connected Qualification

Enable production persistence, production telemetry or an external
crash-reporting provider so qualification operates against live
infrastructure.

## Advantages

- Provides production-environment realism.
- Could exercise a real external diagnostic delivery chain.

## Disadvantages

- Conflates qualification with deployment and activation.
- Introduces production data, privacy, retention, credential and incident
  risk before qualification has passed.
- Requires production migrations, Gate decisions, provider selection,
  contractual review and new trust-boundary authority.
- Is disproportionate and contrary to Oracle's fail-closed lifecycle model.

# Option D — Defer Sprint 30 Entirely

Do not begin any Sprint 30 work until every disposable environment and any
future operational provider decision are available.

## Advantages

- Avoids a partially completed qualification programme.
- Keeps all current runtime and diagnostic states unchanged.

## Disadvantages

- Delays independent security, privacy, accessibility, performance and
  reliability evidence that can be produced safely now.
- Defers discovery of systemic defects.
- Incorrectly couples local contract certification to a future external
  diagnostics provider that Sprint 30 does not need.

# Recommendation

Approve **Option A**.

It is the only option that exercises the assembled authoritative product while
keeping production unchanged and evidence honest. It permits qualification to
advance in isolated environments, but it does not allow missing clean-machine
evidence to be hidden or converted into a pass.

# ADR-047

Option A requires creation and Founder acceptance of:

**ADR-047 — Privacy-Safe Operational Diagnostics and Crash Reporting**

ADR-047 should establish:

- Diagnostics observe runtime health and failures; they never become Oracle
  truth or mutation authority.
- Diagnostic admission is explicit, purpose-scoped, minimised, schema-bound,
  redacted and versioned.
- Captured content, credentials, tokens and authoritative payloads are denied
  by default.
- Renderer processes receive only bounded, immutable, renderer-safe health
  projections and hold no diagnostic transport authority.
- The diagnostic capability and sink are explicitly dependency-injected,
  instance-owned and represented in the ADR-040 Runtime Manifest when
  composition changes.
- Required diagnostic controls fail closed; optional diagnostic delivery may
  enter an observable degraded state.
- Local certification uses a non-networked disposable sink.
- No external provider, upload, retention period, production endpoint or
  consent model is authorised without a later Founder decision and, where
  necessary, a superseding or provider-specific ADR.
- Diagnostic evidence cannot be represented as production operation or
  release authority.

No amendment to ADR-040 through ADR-046 is recommended. ADR-047 complements
their existing authority boundaries.

# Long-Term Architectural Implications

- Production observability becomes a governed capability rather than
  incidental logging.
- Diagnostics remain downstream of authoritative state and cannot create,
  modify or supersede it.
- A future provider can replace the local sink without moving authority into
  the provider, renderer or client.
- Qualification environments become explicit, reproducible evidence
  boundaries.
- Gate 7 remains a genuine whole-product gate: unavailable mandatory evidence
  blocks passage rather than lowering the threshold.

# Reversibility

The qualification harnesses, disposable runtime activation and local
diagnostic sink are reversible and non-production. They can be removed without
changing production data or deployed state.

ADR-047's authority and minimisation rules are intended to be permanent. A
future external provider or retention model can be added behind the governed
capability, but only through new Founder authority. It must not require moving
truth or mutation authority.

# Risks and Controls

| Risk | Required control |
|---|---|
| Qualification data escapes its environment | Synthetic identities, disposable stores, no production credentials, teardown verification |
| Diagnostics capture sensitive content | Schema allowlist, deny tests, redaction tests and no raw captured content |
| Renderer or provider gains authority | Renderer-safe projections and no provider mutation/tool authority |
| Missing environment becomes false confidence | Evidence state must say passed, failed, deferred or unavailable; Gate 7 fails closed |
| Qualification mutates production | No production credentials/endpoints; environment identity verified before tests |
| Performance evidence is host-specific | Record hardware, OS, build, package and workload provenance with every result |
| Corrective work changes architecture silently | Stop for Founder review when an ADR, trust boundary or product decision is required |

# Proposed Sprint 30 Evidence Plan

1. Freeze the exact qualification candidate and record Release Manifest,
   Runtime Manifest, dependency, environment and migration provenance.
2. Create ADR-047 before diagnostic implementation.
3. Build the critical-journey and release-environment Electron suites.
4. Exercise isolated authentication, persistence, isolation, backup, restore,
   deletion and retention paths using disposable PostgreSQL.
5. Certify privacy-safe diagnostics, crash capture and fail-closed data
   admission locally.
6. Run security, privacy and supply-chain reviews.
7. Run smoke, soak, failure, incident, recovery and distribution rollback
   exercises.
8. Establish and verify CPU, GPU, memory, startup, Guidance-latency and API
   budgets.
9. Complete accessibility and supported-environment matrices.
10. Reconcile warnings, defects, limitations and support runbooks.
11. Run the disposable clean-Windows suite when the required environment is
    available; otherwise keep Sprint 30 incomplete and Gate 7 closed.
12. Produce one reproducible Production Qualification dossier for Founder
    review.

# Decision Effect

Approving Option A would authorise ADR-047, Sprint 30 planning, source
implementation, isolated local verification, disposable qualification
persistence and certification evidence only.

It would **not** authorise deployment, production migration execution,
production persistence, persisted production producers or consumers,
production diagnostics, external telemetry, upload, retention, publication,
distribution, production signing, Gate C, Gate 7 approval, Sprint 31, Beta
certification, release or remote push.

Until the Founder decides, Sprint 30 remains not activated and no
implementation may begin.
