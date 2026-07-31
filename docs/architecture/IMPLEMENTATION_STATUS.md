# ORACLE IMPLEMENTATION STATUS

**Authority:** Canonical evidence-backed record of implemented repository capability
**Scope:** Verified implementation, public boundaries, known integration limits and verification evidence
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Updated when verified implementation or accepted technical debt changes
**Supersedes:** Earlier active implementation-status records
**Superseded By:** None
**Last Reviewed:** 30 July 2026
**Verified Branch:** `sprint-9-overlay`
**Verified Repository Baseline:** `fc3b4775c505cf2cd3b45333bff8ee75d4cbfb3d`
**Sprint 14 Implementation Baseline:** `3868975`
**Sprint 15 Phase 1:** Complete and committed
**Sprint 15 Phase 2:** Complete and committed
**Sprint 15 Phase 3:** Complete and committed
**Sprint 16:** Trust Boundary complete and committed
**Sprint 17:** Scale-Safe Trust Data Plane fully complete; Migration 009 deployed and verified in production
**Sprint 18:** Complete — Founder-approved and closed; persistence architecture
complete; Migration 010 certified and Gate C intentionally deferred
**Sprint 19:** Complete and certified — Founder authentication and identity
decisions implemented; Migrations 011 and 012 certified, undeployed and
inactive
**Sprint 20:** Complete, certified and Founder-accepted — composition roots and
canonical manifest/runtime equality implemented; undeployed and inactive
**Sprint 21:** Complete, certified and Founder-accepted under ADR-041 —
Migration 013 certified, undeployed and inactive
**Sprint 22:** Complete, certified and Founder-accepted — governed recurring
game-pattern accumulation, Snapshot and Context projection complete; persisted
producers and consumers inactive
**Sprint 23:** Complete, certified and Founder-accepted — evidence-bound Session
reports complete; runtime delivery and persistence inactive
**Sprint 24:** Complete, certified and Founder-accepted under ADR-042 —
authoritative Mission, Planner and Progression source complete; Migration 014
undeployed and inactive
**Sprint 25:** Complete, certified and Founder-accepted under ADR-043;
transient grounded Conversation complete; no migration or retention
**Sprint 26:** Complete, certified and Founder-accepted; transient Desktop-owned
Guidance delivery complete
**Sprint 27:** Complete — Founder-accepted and closed; source and synthetic
certification accepted; Operational Certification Deferred — Required Test
Environment Unavailable; live profile provisional and observation disabled
**Sprint 28:** Complete, locally certified, Founder-accepted and closed —
Product Truth Inventory, canonical product shell, truthful inactive states,
route consolidation, production mock removal and bounded Web/Electron
walkthrough accepted
**Sprint 29:** Complete, locally certified, Founder-accepted and closed under
ADR-046; its deferred clean-machine package lifecycle was subsequently
qualified by Stage 3 R9
**Sprint 30:** Founder-approved and active under ADR-047; Phases 1-5 locally
verified; Sprint 30.5 Stages 1, 2 and 3 Founder-accepted and closed; Stage 3 R1
and failed R2-R8 remain immutable; R9 is the accepted passing Clean Windows
Qualification; Stages 4-7 remain unstarted; production qualification is not
yet complete

Stage 3 R9 attempt `stage3-r9-20260730T221251043Z-71af9db7` passed all
fourteen lifecycle phases from preparation commit
`fc3b4775c505cf2cd3b45333bff8ee75d4cbfb3d`. The final evidence manifest
SHA-256 is
`19a8248a06b37d5fac73b42d35ac96049d3ede09249360b064d9dd692d07defe`,
the qualification archive SHA-256 is
`5eadd80469edcafbe62cd461404c9a2bd782eb1393e542b78969784925e2f41e`,
and final package, certificate, process, transfer, work and package-data
residue is zero. Stage 4 execution remains unstarted and unauthorised.

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

# Latest Verified Sprint Progress

## Sprint 30 Phase 1 — Diagnostic Admission Foundation

ADR-047 is accepted. The implemented Platform contract fixes operational
diagnostics to `software-support` purpose and `non-authoritative` authority.
Definitions are immutable and code-allowlisted, attributes are explicitly
minimised, arbitrary messages are absent, and prohibited or unsafe data fails
admission closed.

The local certification sink is bounded, process-memory-only and cleared on
stop. It has no filesystem, network, upload, retention, Service, Repository or
renderer authority. The capability has no dependency on Evidence,
Understanding, Memory, coaching, planning or progression.

Phase 1 has not changed Web or Electron runtime construction. Manifest `1.6.0`
therefore remains unchanged and mandatory. No production diagnostics,
persistence, migration, deployment or Gate activity has occurred.

## Sprint 30 Phase 2 — Qualification Candidate and Critical Journeys

The exact local candidate is frozen across source, Runtime Manifest, Release
Manifest, dependency lock, Migration 009–014 and environment provenance. Web
and release-environment Electron composition roots construct ready runtimes
that mechanically match manifest `1.6.0`.

Disposable PostgreSQL 17 certification applies the canonical chain through
Migration 014 and passes the authenticated Session, Evidence, Understanding,
Mission, Planner, Progression, export, deletion and cross-Operator isolation
journeys using synthetic data. The exact container is removed afterwards.

The database authenticated role/JWT boundary passed. A live Supabase
Auth/GoTrue Email + Password provider transaction is unavailable because the
local provider is not configured; no production endpoint or credential was
substituted.

## Sprint 30 Phase 3 — Runtime Diagnostics, Reliability and Recovery

Operational Diagnostics is explicitly injected through both composition
roots and declared as a required subsystem in Runtime Manifest `1.7.0`.
Canonical Web and Electron delivery remains disabled. The renderer-safe health
projection exposes only fixed authority, mode, status, transport, retention
and aggregate metrics.

Isolated local certification passes smoke, bounded soak, minimised crash
envelopes, optional and sink failure degradation, required failure closure,
teardown clearing and fresh-runtime recovery. Disposable PostgreSQL
backup/restore preserves eligible, deletion-pending and final-deleted states
through Migration 014 while preserving permanent Operator identity.

The accepted Sprint 29 package remains immutable and bound to manifest
`1.6.0`. It passed rollback regression but requires candidate reconciliation
before later integrated qualification. No rebuild, signing, deployment or
push occurred in Phase 3.

## Sprint 30 Phases 4–5 — Quality Envelope and Integrated Dossier

Phase 4 passes the frozen current-host startup, CPU, memory, response-size,
authentication-boundary, deterministic Guidance-latency, public
authentication accessibility and Runtime Manifest `1.7.0` equality checks.
Unavailable live Auth, protected rendering, installed-package GPU and clean
Windows evidence remain explicit.

Phase 5 completes the authorised integrated architecture, source, domain,
database, recovery, supply-chain, package-integrity, performance,
accessibility and support matrix. All critical and high-severity engineering
findings are closed. The Production Qualification dossier remains incomplete
only for the separately governed Sprint 30.5 evidence sequence.

## Sprint 30.5 Stage 1 — Environment Admission

Stage 1 is Founder-accepted and closed. The ASUS ROG Zephyrus G15 is admitted
as a controlled non-pristine physical qualification host. Transfer integrity,
Windows and hardware inventory, restore point, isolated Auth access,
PostgreSQL/Mailpit denial, non-allowlisted denial, standalone Electron
`39.8.10` hardware GPU operation and complete teardown pass.

Installed development tools were inventoried but were not invoked by the
qualification path. The host is not a clean Windows environment and does not
satisfy that later mandatory qualification. The frozen local evidence archive
has SHA-256
`841b5ea14bc06966ce969dda0a6794110633e9ad7f0c74d0d11ee1d54938a78d`.
Historical Stage 2 and Stage 2 Requalification R1 remain Founder-accepted,
closed and immutable. Stage 2 Requalification R2 is the authoritative package
qualified by Stage 3 R9. The designated Stage 3 host was admitted with a
Founder provenance exception, and Stage 3 R9 is Founder-accepted and formally
closed with immutable passing evidence. Stage 4 execution remains unstarted and
unauthorised.
## Sprint 30.5 Stage 2 — Historical Candidate Freeze and Package Reconciliation

Source commit `d850743977735929f6873457fe122d2cf9697d9e` is frozen into
local-only MSIX `0.1.1.0`. Runtime Manifest `1.7.0` mechanically equals both
composition targets and the signed Release Manifest declaration. Package
identity, 2,201 content entries, artifacts, native helpers, SBOM, provenance
and signatures pass. The immutable Sprint 29 package remains unchanged at
`1.6.0`.

The first teardown verification failed closed on packaging-tool residue in the
elevated CurrentUser personal certificate store. The exact test identity and
private key were removed, teardown was corrected, and final verification
reports zero certificate-store matches and no retained PFX, CER, PEM or key.
No runtime, product, architecture, trust-boundary or migration change was
introduced.

The historical candidate, package, manifests, hashes and evidence remain
accepted and immutable. Post-freeze product-source corrections committed at
`6113565765a95b990415b6cdf2f2f1d7ff3e83c8` mean that candidate no longer
qualifies the current source revision.

## Sprint 30.5 Stage 2 Requalification R1 — Current-Source Reconciliation

Requalification R1 is Founder-accepted and formally closed. Accepted attempt
`r1-20260728T190335052Z-d2ffe76a` binds candidate and harness commit
`cd3b7ca1a49d53d85a718a24d594267c93531994`, tree
`e7933a866fe656ae03689a62956c44641eb16a23`.

Runtime Manifest `1.7.0` equality, source validation, local-only MSIX
construction, all `2201` package-content entries, strict Authenticode,
detached Release Manifest verification, CycloneDX `1.6` SBOM, SLSA-shaped
provenance, exact-certificate teardown and atomic evidence freeze passed. The
accepted MSIX SHA-256 is
`c9c3b4b624f1b7528123a4f0c86737fef6cab8832d6b6b042ea5b44bfcb9bdbb`;
the final evidence manifest SHA-256 is
`0903762efa6605611b7a6213b3cec157d7618030945c6068aea8c28b1ab0b36d`.

No governed package, certificate trust or private signing material remains.
The accepted evidence is indexed by
[Sprint 30.5 Stage 2 Requalification R1 Evidence](../sprints/evidence/sprint-30-5/stage-2-requalification/README.md).
Requalification R1 acceptance creates no authority to resume Stage 3 or begin
Stage 4 or any later stage.

## Sprint 30.5 Stage 2 Requalification R2 - Candidate Refresh

R1 remains accepted, closed and immutable. R2 was separately
Founder-authorised because R1's remaining certificate-validity window could
not safely accommodate the full Stage 3 preparation and execution lifecycle.
R2 permits a maximum 30-day isolated local-test signer per attempt, with exact
trust and private-material teardown.

R2 attempt `r2-20260728T203503018Z-ec577cf4` passed from candidate and harness
commit `11475fe01fff2ec69f0188547107f4e901c531d7`, tree
`1cec636603031aa8f63c8b331aea5bbcb916567d`. Independent reconciliation
confirmed final evidence manifest SHA-256
`84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d`,
archive SHA-256
`6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f`
and MSIX SHA-256
`6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc`.
The Founder accepted the result and R2 is formally closed. Candidate
`11475fe01fff2ec69f0188547107f4e901c531d7` is authoritative for any later
separately authorised Stage 3 preparation decision.

## Sprint 30.5 Stage 2 Requalification R3 - Corrected Baseline Preparation

Migration 011 and Migration 012 pgcrypto schema dependencies are corrected at
commit `a7fc67f207d9c95407c70812828fa66bd487285d`, tree
`356f6d52f1bf70065692e892af8bf916acc8727a`. This post-R2 product-source change
activates the permanent Stage 2 invalidation rule without changing R2 or Stage
3 R9 historical acceptance.

R3 preparation is complete and validated and binds the exact candidate, corrected
migration hashes, a separate future harness HEAD, R3-only authority/attempt,
package, certificate, artifact and evidence namespaces, and immutable R2/R9
historical hashes. R3 qualification execution is not authorised and no R3
authority, attempt, package or qualification evidence exists.

## Sprint 30.5 Stage 3 R9 - Clean Windows Qualification

`Founder-QA-01`, a `MEDION ERAZER P6605 MD61596`, is bound to the accepted
R9 evidence under its Founder provenance exception. Passing attempt
`stage3-r9-20260730T221251043Z-71af9db7` and consumed authority
`authority-stage3-r9-20260730T221251043Z-71af9db7` completed all fourteen
lifecycle phases. Both native-window observation periods exceeded the
mandatory 60,000 measured milliseconds. Exact AppModel ownership,
Authenticode, signer, installation, direct activation, repair, removal,
machine-trust teardown and final zero-residue checks passed.

The canonical evidence is indexed by
[Sprint 30.5 Stage 3 Qualification R9 Evidence](../sprints/evidence/sprint-30-5/stage-3-r9/README.md).
Stage 3 R1 and failed R2-R8 remain immutable. Stage 3 closure grants no Stage
4 or production authority.

## Sprint 29 — Secure Desktop Operations and Distribution

ADR-046 establishes MSIX as the Windows package authority and the signed
immutable Release Manifest as the canonical distribution contract. The local
package binds its standalone Next.js server only to an ephemeral loopback
origin, enables Electron sandboxing, disables renderer Node integration,
denies navigation, window, webview and permission escalation, and validates
both WebContents and frame origin for IPC.

The instance-owned update coordinator exposes only immutable local-test
availability state and remains inactive because release hosting is not
authorised. It invalidates observation, detaches the Companion and stops the
runtime before replacement. Desktop Platform API v1 and Guidance v1 are
unchanged.

The Windows x64 candidate, both native helpers, SBOM and provenance
mechanically equal the signed Release Manifest. Current-host install,
invalid-signature rejection, update, packaged startup, repair, declared
rollback, uninstall and temporary certificate cleanup pass. Exported private
test-signing material is destroyed.

Clean-machine certification remains explicitly deferred because this Windows
Home workstation has no Windows Sandbox or disposable Windows VM. This is not
production publisher trust, operational certification, release readiness,
distribution or deployment. Manifest `1.6.0` remains exact because runtime
composition did not change.

## Sprint 28 — Unified Oracle Product Experience

Every route and navigation entry has an explicit Architectural Truth and
Operator Value decision. Oracle now exposes one canonical navigation across
Oracle, Companion, Sessions, Reports, Intelligence, Coach & Plan, Progress and
Settings.

Legacy Memory/DNA, Career/Achievements, Operator and Planner pages consolidate
through redirects. Evidence-dependent surfaces no longer use legacy browser
calculations or direct Repository access. They expose explicit inactive states
while runtime persistence and persisted consumers remain disabled. The mock
game connector and hard-coded weapon evidence are removed; Loadouts is
disabled and honestly deferred.

The Web production build, Electron and native helper builds, architectural
audit and bounded Founder Beta walkthrough pass. Documented dependency
exceptions fell from 42 to 22 with zero runtime cycles. Manifest version
`1.6.0` remains exact across Web and Electron because runtime composition did
not change. The Founder accepted and closed Sprint 28 on 25 July 2026. The
accepted operational and certification limitations remain explicit.

## Sprint 27 — Contextual Companion and Reference Integration

Minecraft: Java Edition `26.1.1` is Oracle's second bounded Beta reference
integration. Exact Windows single-player detection, immutable compatibility
certification, a deterministic text-only diamond discovery journey and
Operator-enabled local observation are implemented.

ADR-044 keeps observation disabled by default, visible, revocable, local and
ephemeral. Raw buffers are overwritten after one operation and never cross the
main-process boundary. The renderer receives only a confidence-bearing,
purpose-scoped, two-second non-authoritative visible-frame projection.
ADR-045 replaces permanent support booleans with certified, provisional,
expired and revoked lifecycle states. Provisional uncertainty, expiry,
revocation and profile mismatch fail closed.

Manifest version `1.6.0` mechanically equals Web and Electron composition and
adds exactly the Minecraft integration and diamond Guidance provider. No
migration, persistence, retained observation/progress, upload, multiplayer,
API, mod, automated-input, production or Gate C change exists. Source and
synthetic certification are complete. Because the pinned game is absent from
the workstation, live observation remains provisional and disabled.
Operational Certification Deferred is the Sprint status explaining that
limitation; it is not an ADR-045 certificate state or support claim.
Sprint 27 is Founder-accepted and closed. That engineering closure does not
promote the certificate or establish operational support.

## Sprint 26 — Authoritative Companion Guidance Delivery

The Desktop Companion now owns a transient Guidance delivery coordinator that
projects immutable Guidance v1 Requests from authoritative attached Session
Context. Guidance execution remains explicitly injected, deterministic,
spoiler-bounded and source-freshness governed. Detach, Context replacement,
renderer replacement and recovery invalidate obsolete work; generation
ownership prevents stale asynchronous results from reaching presentation.

The restricted renderer receives only validated immutable Application state
and bounded category/spoiler controls through an additive bridge. It gains no
Service, Repository, controller, native, process, Session mutation or retention
authority. Offline curated Guidance remains available and provider failure
degrades safely. Canonical Web and Electron manifest version 1.5.0 continues
mechanical runtime equality. Guidance v1 and Desktop Platform API v1 remain
unchanged. No migration, persistence, production activation or Gate C change
exists. Sprint 26 is complete, certified and Founder-accepted.

## Sprint 25 — Conversational Oracle

ADR-043 establishes Conversation Service as a transient orchestration and
presentation boundary, never an authority for truth or mutation.
Authenticated, purpose-scoped and allowlisted retrieval consumes only
read-only source-Service projections. Deterministic handlers own factual
answers and outage fallback. Optional model synthesis is schema-bound to a
minimised evidence packet and cannot use tools or cite unadmitted evidence.

Renderer-safe responses expose evidence, provenance, confidence, freshness,
scope and limitations. Prompt injection, conversational mutation, stale
evidence and cross-Operator access fail safely. No transcript, prompt or
provider response is retained. Manifest version 1.4.0 declares Conversation
Service exactly in Web and Electron. No Migration 015 was created and runtime
persistence remains disabled. Sprint 25 is Founder-accepted and closed.

## Sprint 24 — Adaptive Coaching, Planner and Progression

ADR-042 establishes exclusive Mission lifecycle and progression accounting.
Session Reports produce evidence-bound Coaching Focus, deterministic Mission
generation, Planner projections and verified completion. Progression Service
alone issues replay-safe XP and Achievement transactions. Reassessment is
correlational and never claims causation.

Web and Electron manifest version 1.3.0 adds Planner Service and Planner,
Progress and Achievements Applications with mechanical runtime equality.
Migration 014 is implemented and certified on disposable PostgreSQL 17.10 but
remains undeployed and inactive. Sprint 24 is Founder-accepted and closed.

## Sprint 23 — Oracle Session Intelligence

The Session Report Service constructs immutable reports from authoritative
completed Sessions, admitted Evidence and governed Understanding. An
instance-owned provider registry keeps game semantics within the owning Game
Integration, while an instance-owned Engine Registry executes Behaviour,
Trend, bounded Prediction, Memory and Contextual outputs. Reports preserve
epistemic status, evidence, confidence, disagreements and reassessment
triggers. Optional model output is strict-schema enrichment only.

Exact replay, history and comparison use an in-memory certification Repository.
The prompt-only report authority is permanently retired. Deterministic engines
remain factual authority and optional model output is enrichment only.
Manifest version 1.2.0 remains
mechanically exact because Service inventory and lifecycle classification did
not change. Sprint 23 is Founder-accepted and closed. Runtime persistence and
report delivery remain inactive.

## Sprint 19 — Account, Identity and Commissioning

Sprint 19 Phase 1 is complete. Phase 2 implements immutable provisioning
contracts, authenticated Account injection, an explicit fail-closed
commissioning-policy boundary, Repository serialization and server-only trusted
composition. The legacy browser-owned two-step commissioning mutation now
fails closed. The replacement journey is implemented through verified
server-owned commissioning and remains undeployed and inactive.

Migration 011 is the minimum additive atomic provisioning candidate. It
creates one Operator, one Account-to-Operator binding, one transactional
designation and one original idempotent result in a single trusted operation.
It has no dependency on Migration 010 and has been certified on disposable
PostgreSQL 17.10 databases through both `009 → 011` and
`009 → 010 → 011`, including rollback catalog identity, replay, conflict,
concurrency and least-privilege verification.

Migration 011 is implemented and certified but is not deployed or activated.
Migration 010 remains byte-for-byte immutable and undeployed, Gate C remains
deferred, production remains post-Migration-009, and runtime persistence
remains disabled.

The Founder authentication and identity decisions are implemented through
canonical Email + Password authentication, mandatory verification, optional
Magic Link and Passkey methods, separate mutable Display Name, globally unique
case-insensitive Callsign, Oracle generation, three renewable change tokens,
12-month quarantine and deletion capture. Desktop credential custody is
implemented as an inactive main-process-only contract using OS-encrypted
refresh-token storage and credential-free renderer projections.

Migration 012 is the additive Operator identity lifecycle candidate.
PostgreSQL 17.10 certifies its persistence, rollback, security and concurrency
behavior on the canonical `009 → 010 → 011 → 012` chain. It is not deployed or
activated.

## Sprint 17 — Scale-Safe Trust Data Plane

Sprint 17 engineering implementation is complete through Phase 8. Verified
capability includes bounded purpose- and scope-filtered current/history reads,
opaque query-bound keyset cursors, snapshot-stable traversal, typed page and
Snapshot budgets, exact-retry idempotency, immutable/stale conflict outcomes,
real PostgreSQL contention verification and production-shaped plan gates.

The immutable claim-head event projection and its scoped/unscoped indexes are
supported by measured PostgreSQL 17.10 evidence. The one-command scale suite
verifies empty, normal and 10,000-head hot fixtures, 1/8/32-worker behaviour,
latency, payload, heap, plans, RLS and architecture boundaries. The exact final
Migration 009 hash is pinned in the Sprint 17 deployment dossier and has passed
fresh transactional rollback plus independent catalog comparison.

No runtime producer, consumer, control operation, Snapshot construction,
Context projection, Application persistence path or Platform activation was
added or activated. Sprint 17 is Founder-approved and fully complete. Migration
009 is deployed and verified, establishing the production persistence
foundation while runtime persistence remains disabled.

## Sprint 18 — Phase 3 Repository and Persistence

Phase 3 implements the inert additive Migration 010 candidate, the Operator
Control Repository, additive Operator and Operator Intelligence control
Repository interfaces, RLS, narrow trusted SQL functions and rollback/catalog
verification. Migration 009 remains byte-identical. Broad control purposes
bind an exact Migration 009 admission policy or explicit null; the policy and
consent authorities are not interchangeable.

Disposable PostgreSQL 17.10 verification proves exact replay, stale
concurrency, two-Operator isolation, direct-write denial, untrusted-RPC denial,
completion gating, fail-closed policy, deletion residue removal, replay
prevention, bounded indexed reads and byte-identical rollback catalogs.
Migration 010 is undeployed, and no runtime registration, Service behavior,
Application or future intelligence capability is active.

The Founder has accepted Migration 010 as the production candidate and
intentionally deferred Gate C until immediately before the first production
release requiring Operator Trust and Control persistence. Development may rely
on the accepted persistence architecture as complete, but production behavior
must continue to treat Migration 010 as absent.

## Sprint 18 — Phase 2 Contracts and Policy Validation

Sprint 18 Phase 1 was Founder-reviewed and approved on 24 July 2026. Phase 2
now implements immutable, presentation-independent control contracts,
configurable fail-closed governance policy, declaration expiry, typed command
outcomes, deterministic bounded export, deletion scopes, content-free
operation receipts and tombstones, and recoverable lifecycle matrices.

The broad control-policy contract explicitly binds each purpose to an existing
Migration 009 admission policy or to `null`, which grants no Evidence-admission
authority. It does not replace the narrow admission-policy contract.

Focused control, existing Understanding, existing trust, TypeScript, lint and
architecture verification pass. No Repository persistence, migration, runtime
registration, Application, production policy value, production deployment,
runtime persistence, inference or personalisation was added or activated.

## Sprint 15 Phase 1 — Ownership Foundation

Phase 1 is implemented, permanently deployed and approved through founder
closure review. Verified capability includes:

- stable one-to-one Account-to-Operator bindings without changing existing
  Operator identifiers
- authenticated current-Operator resolution through the Operator Service
- direct database access confined to the Operator Repository
- removal of arbitrary first-row resolution and shared development fallback
- production-equivalent authentication requirements in local development and
  test
- deployed RLS and least-privilege grants for bindings, Operators, Sessions and
  achievements
- anonymous rejection and authenticated cross-Operator isolation enforced by
  the database independently of application filtering
- preservation of one pre-existing Operator, five pre-existing Sessions and
  two unowned historical Sessions with no speculative reassignment

The deployed regression environment contains two dedicated Auth principals,
two dedicated Operators, two bindings and two Sessions. These permanent
fixtures are reserved exclusively for migration, ownership, RLS,
authentication and security regression testing.

Phase 1 does not implement Operator Understanding contracts, candidate claims,
control operations or Oracle Context projection.

## Sprint 15 Phase 2 — Understanding Contracts

Phase 2 is implemented, verified and approved through founder implementation
review. It establishes contract authority only:

- immutable, versioned and serialisable Operator Understanding contracts
- structural Known, Declared, Observed, Inferred, Suspected and Unknown
  epistemic classes
- separate evidence quality, producer-native confidence and accepted claim
  confidence
- authoritative-source Evidence references with raw-prompt minimisation
- support and contradiction claim relationships
- explicit claim and declaration lifecycle transition validation
- monotonic immutable revisions and content-free deletion tombstones
- deterministic, versioned and evidence-backed explanations owned by accepted
  inferred claim revisions
- explicit Operator, Application, Game Integration and Session scopes with no
  implicit cross-game or Operator-wide promotion
- interface-only Operator Declaration, Operator Intelligence and Operator
  Understanding Service ownership
- deeply immutable, purpose-scoped `OperatorUnderstandingSnapshot` projection
  with distinct Identity, Preferences, Goals, State, Memory, Intelligence and
  Unknown sections

The implementation is located under `lib/oracle/understanding/` and the
interface-only Service boundaries under `lib/oracle/services/`. The focused
`operator-understanding:verify` suite validates contracts, lifecycle and
Service projection boundaries.

Phase 2 does not add persistence, migrations, Repositories, RLS, engine
adapters, runtime Service registration, Oracle Context projection,
Application consumption, Operator-control operations or UI.

## Sprint 15 Phase 3 — Operator Intelligence Persistence

Phase 3 is implemented, rollback-verified and approved through founder
implementation review. Verified repository capability includes:

- six durable tables for per-Operator policy versions, minimal Evidence
  references, claim identity, immutable claim revisions, evidence
  relationships and append-only eligibility assessments
- composite ownership foreign keys that prevent cross-Operator references
- monotonic head revision enforcement and persisted content-free tombstones
- deterministic accepted-claim explanations stored inside immutable revisions
- explicit lifecycle transition checks and sensitive-inference rejection
- RLS derived from authenticated Account-to-Operator bindings
- revocation of inherited direct writes with authenticated read-only table
  access and authenticated atomic function execution
- a dedicated `SupabaseOperatorIntelligenceRepository` that validates Phase 2
  contracts before persistence and reconstructs eligible current claims
- focused schema, Repository and ownership verification through
  `operator-intelligence:persistence:verify`

The exact migration passed explicit rollback validation and independent
post-rollback catalog verification. Transactional functional validation proved
own-Operator visibility, cross-Operator isolation, anonymous rejection and
direct-write denial. The deployed catalog and all existing Operator, Session
and binding rows remain unchanged because permanent migration execution has
not been authorised.

Phase 3 did not register an Operator Intelligence Service, create a candidate
producer, persist an Understanding Snapshot, integrate Oracle Context, expose
Application consumption, execute retention or control operations, or add UI.
Unstarted work from the historical Sprint 15 plan is not implicitly active.

## Sprint 16 — Trust Boundary

Sprint 16 is implemented, verified, founder-approved and committed at
`58589b52de0db341e6518fa9f235bb18854e6b30`. It was executed under the
historical alias Sprint 15.5A.

Verified repository capability includes:

- `OperatorIntelligenceService` as the only permitted durable Operator
  Intelligence mutation authority
- a server-only trusted Supabase client whose credential is unavailable to
  client bundles
- authenticated current-Operator resolution and trusted ownership injection
- runtime rejection of caller-supplied Operator identifiers
- global, Operator-independent policy definitions
- append-only consent decisions and evidence lifecycle dispositions
- immutable, game-scoped evidence admissions with stable Game Integration
  identity and semantic-version validation
- service-role-only persistence functions with no authenticated direct
  mutation or RPC execution authority
- durable evidence, admission, claim revision and eligibility invariants
- focused trust and authority verification in addition to the existing
  ownership, understanding and persistence suites

Migration 009 now contains the hardened trust-boundary schema and permissions.
It executed successfully inside an explicit rollback transaction and was
followed by independent catalog verification proving that no schema object or
constraint remained. It is not permanently deployed.

No candidate producer, intelligence accumulation, runtime Service
registration, Understanding Snapshot runtime, Context integration,
Application consumption or Sprint 17 implementation is active.

---

# Historical Closure Context

## Sprint 16 — Trust Boundary

Sprint 16 Founder closure, commit and push are complete. Migration 009 was
subsequently deployed through its separately authorised production decision.

# Earlier Closed Sprint

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

At Sprint 14 closure, the production `/companion` route used the
Applications-owned unavailable-state factory and authoritative delivery
remained deferred. Sprint 26 later resolved that historical seam with a
transient Desktop-owned coordinator and restricted renderer-safe
Application-state boundary. It does not fabricate Session Context, Guidance,
recommendations or Operator data.

Sprint 15 is historical. Its Phase 1 ownership foundation, Phase 2 contract
foundation and Phase 3 persistence foundation are verified and
founder-approved. Sprint 16 subsequently completed the Trust Boundary.

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

## Authoritative Session Lifecycle

Implemented under `lib/oracle/sessions/`, `lib/oracle/services/sessions/`,
`lib/oracle/repositories/`, `lib/oracle/applications/sessions/` and
`desktop/companion/`:

- one versioned immutable Session aggregate and command contract;
- sole durable lifecycle authority in Session Service;
- authenticated idempotent begin, resume, recover, complete and abandon;
- stable identity and optimistic concurrency;
- explicit minimised Evidence-reference admission;
- recoverable deletion and immediate eligibility removal;
- renderer-safe history, detail and export projections;
- versioned non-merging Desktop correlation;
- Supabase Repository source adapter;
- Migration 013 trusted persistence boundary; and
- focused lifecycle, concurrency, RLS and PostgreSQL certification.

Migration 013 and its Repository adapter are not composed into persisted
runtime operation. Production remains unchanged and runtime persistence is
disabled.

## Platform Coordination Foundations

Implemented under `lib/oracle/platform/`, `lib/oracle/composition/`,
`services/`, `applications/`, `lib/companion/` and `desktop/platform/`:

- shared dependency-injected Platform Runtime
- canonical immutable versioned Web and Electron manifests
- exact manifest-to-constructed-runtime validation
- instance-owned Service and Application registries
- ten injected Service definitions
- six injected Application definitions
- explicit Game Integration and Guidance provider composition
- Companion Runtime foundation
- Extension Runtime and resolver
- Capability Graph
- Companion connector contracts and registry
- required fail-closed and optional degraded readiness
- fresh composition recovery attempts
- renderer-safe unified Platform health snapshots
- Next.js instrumentation and Electron main composition invocation

These foundations are implemented in production-capable source entry points
and locally certified under ADR-040. They are not deployed. Runtime persistence
remains disabled. Sprint 20 is Founder-accepted and closed. The canonical
manifest remains a permanent mechanically verified runtime contract.

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
- renderer-safe Platform health projection
- injected composed Game Integration registry
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
- reading the validated renderer-safe Platform health snapshot

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
2. `/companion` exists, but authoritative Guidance Application state is not yet
   delivered from the desktop composition root; the route therefore renders an
   honest unavailable state.
3. Curated source freshness is a manual review responsibility, and production
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
- ADR-037 defines Operator Intelligence primacy and games as governed
  performance contexts.
- ADR-038 defines the non-automatic Observation → Evidence → Understanding →
  Memory promotion boundary.
- ADR-039 defines retention, operational deletion, eligibility removal,
  legally required retention, physical deletion, audit and tombstone policy.
- ADR-040 defines target-specific composition roots, the canonical manifest,
  instance-owned injection, readiness, recovery and renderer-safe health.
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

Oracle Engineering Validation Phase A5 passed on 28 July 2026 from clean
committed revision `6113565765a95b990415b6cdf2f2f1d7ff3e83c8` on
`sprint-9-overlay`. Canonical run `20260728T124957338Z-13d3309b`, SHA-256
`8821e4c0d12dde6ca339d74f2d6baeb43d0b6a5fc286eff8d3c7c6780b65da64`,
verified standalone Web startup, Electron launch, same-origin renderer load,
the restricted preload bridge, ready and complete Platform Health, one visible
native Oracle window owned by the launched Electron main process, a 15-second
stability interval, graceful shutdown and zero remaining test processes or
listeners.

The result is local engineering source-health evidence only. It does not
reopen or complete Sprint 30.5 Stage 3, qualify an installed production
package, or authorise signing, publication, distribution, deployment or
production use. The immutable report and sidecar are recorded in
[Phase A5 Engineering Validation Evidence](../sprints/evidence/sprint-30-5/engineering-validation/phase-a5/README.md).

Accepted technical debt remains documented in
`DEPENDENCY_BOUNDARY_AUDIT.md`, `SPRINT_12_1_RETROSPECTIVE.md` and
`docs/sprints/SPRINT_14_CLOSURE.md`.
