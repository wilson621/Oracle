# SPRINT 18 PHASE 1 CURRENT-STATE AND DELETION-TOPOLOGY AUDIT

**Sprint:** 18 — Operator Trust and Control
**Authority:** Phase 1 evidence beneath the Founder-approved Sprint 18 Plan
**Owner:** Oracle Platform Engineering
**Status:** Approved by the Founder on 24 July 2026
**Audited:** 24 July 2026
**Production change:** None

---

# Purpose

This record satisfies the Sprint 18 Phase 1 requirement to audit the deployed
state, identify every current content-bearing path relevant to Operator
control, and propose the minimum implementation shape before schema or
control-path implementation.

It grants no migration, deployment, production activation, inference,
Observation, Evidence admission, Understanding accumulation or Memory
promotion authority.

# Governance Applied

The audit applies:

- the Oracle Platform Constitution;
- the Oracle Codex;
- the Oracle Founding Charter;
- Oracle Strategy;
- Oracle Architecture;
- the Oracle Engineering Programme;
- the Sprint Index;
- the Founder-approved Sprint 18 Plan;
- ADR-037, ADR-038 and ADR-039; and
- Oracle Platform v0.9 as the canonical starting baseline.

The required ownership remains:

| Responsibility | Authority |
|---|---|
| Authentication | Supabase Auth |
| Account-to-Operator ownership | Operator Service and Operator Repository |
| Identity, Preference and Goal declarations | Operator Service |
| Evidence-reference and claim lifecycle | Operator Intelligence Service |
| Retention, decay and eligibility policy | Memory Service policy boundary |
| Persistent access | Repositories |
| Trust Centre presentation and orchestration | Oracle Application |
| Game meaning | Game Integrations |
| Raw source Evidence | Existing source owner |

# Repository Verification

The activation baseline passed:

| Check | Result |
|---|---|
| Canonical baseline | Oracle Platform v0.9 remains the canonical starting baseline |
| Active Sprint | Sprint 18 is active under the Sprint Index and approved Plan |
| ADR authority | ADR-037, ADR-038 and ADR-039 are Accepted |
| Branch | `sprint-9-overlay` |
| Working tree before audit | Clean |
| Origin | Fresh fetch completed; `HEAD...origin/sprint-9-overlay` was `0 0` |
| Activation commit | `5e78ca1` — governance-only |
| Runtime persistence | Disabled; no production entry point invokes Platform bootstrap or Operator Intelligence control consumption |
| Production release | Unchanged; no deployment or production control-path action occurred |

The point-in-time v0.9 document truthfully records that Sprint 18 was inactive
when that baseline was established. The later Sprint Index, approved Plan and
activation commit supply the separate current activation authority without
altering the canonical starting baseline.

# Fresh Production Read-Only Verification

On 24 July 2026, a read-only server-side Supabase REST inspection confirmed
that the deployed API schema still exposes:

- all four ownership/source tables;
- all ten Migration 009 tables; and
- all nine Migration 009 trusted RPC functions.

Exact live row counts were:

| Relation | Rows |
|---|---:|
| `operator_account_bindings` | 2 |
| `operators` | 3 |
| `oracle_sessions` | 7 |
| `operator_achievements` | 0 |
| `operator_data_policy_versions` | 0 |
| `operator_consent_decisions` | 0 |
| `operator_intelligence_evidence` | 0 |
| `operator_intelligence_evidence_dispositions` | 0 |
| `operator_intelligence_evidence_admissions` | 0 |
| `operator_intelligence_claims` | 0 |
| `operator_intelligence_claim_revisions` | 0 |
| `operator_intelligence_claim_evidence` | 0 |
| `operator_intelligence_eligibility_assessments` | 0 |
| `operator_intelligence_claim_head_events` | 0 |

These counts match the verified production baseline: the protected ownership
fixtures and legacy Sessions remain, and every Migration 009 table remains
empty.

The production deployment closure remains the authoritative catalog, RLS,
grant, constraint, function and index evidence. The fresh inspection confirmed
that the deployed relations and functions still exist and that no Sprint 18
data has been introduced. No production mutation was performed.

# Current Implementation Audit

## Existing usable foundations

- immutable, validated Operator Understanding contract version 1;
- structural epistemic classes;
- claim and declaration lifecycle validation;
- content-free claim and declaration tombstone contracts;
- purpose-specific consent contracts and deterministic consent resolution;
- Evidence disposition contracts;
- policy-version binding;
- authenticated Account-to-Operator ownership;
- bounded claim, lifecycle and eligibility reads;
- exact retry, immutable-conflict and stale-concurrency semantics;
- trusted Repository RPC boundary;
- database-enforced Operator isolation; and
- an inactive request-scoped server composition helper.

## Missing operational capability

- no configurable Sprint 18 governance policy-set contract;
- no declaration Repository or persistence for Identity, Preference and Goal
  revisions;
- no Operator Service declaration commands;
- no operational consent Service commands;
- no claim/Evidence/explanation inspection projection for the Trust Centre;
- no correction or dispute command implementation;
- no export contract or bounded exporter;
- no deletion scope contract or topology executor;
- no retention executor at the Memory policy boundary;
- no operation receipt, checkpoint, failure or recovery persistence;
- no deletion ledger or restore-reapplication authority;
- no policy-authorised control tombstone persistence;
- no Trust Centre Application model or authenticated route; and
- no Sprint 18 verification suite.

The existing `transitionClaim` deliberately fails unavailable. The existing
declaration Service is an interface with one read method. The existing narrow
data-policy definition contains the Sprint 16 game-pattern admission policy;
it does not define the wider Sprint 18 consent, declaration, retention,
deletion, backup, processor, export, audit, tombstone or recovery policy.

# Content-Bearing Topology

| Path | Content | Authority | Sprint 18 treatment |
|---|---|---|---|
| `auth.users` | Account identity and credentials | Supabase Auth | Never treated as Operator Understanding; Account deletion remains separate |
| `operator_account_bindings` | Account/Operator identifiers | Operator Repository | Ownership resolution only; complete-Operator deletion may remove the binding without deleting the Account |
| `operators` | email, callsign, designation, game and progression fields | Operator Service / Operator Repository | Identity inspection and approved complete-Operator deletion; no Application-owned mutation policy |
| `oracle_sessions` | prompt, assessment, performance and game fields | Session source owner | Raw source content; deletion requires explicit source-owner coordination and must not be reimplemented in Operator Intelligence |
| `operator_achievements` | achievement identity and time | Progression source owner | Complete-Operator topology only; no Sprint 18 progression behaviour |
| `operator_data_policy_versions` | narrow immutable admission-policy contract | Operator Intelligence Repository | Preserved; linked from the broader governed policy set rather than duplicated |
| `operator_consent_decisions` | consent purpose, state, provenance and policy | Operator Service decision; Operator Intelligence Repository persistence | Existing append-only relation can support grant/revocation after Service controls are implemented |
| `operator_intelligence_evidence` | minimal Evidence reference, digest, source and policy | Operator Intelligence Service / Repository | Inspectable and disposition-controlled; raw content stays with source owner |
| `operator_intelligence_evidence_dispositions` | availability/withdrawal state and reason | Operator Intelligence Service / Repository | Existing append-only relation supports removal from eligibility |
| `operator_intelligence_evidence_admissions` | admission linkage and consent/policy evidence | Operator Intelligence Service / Repository | Read-only inspection in Sprint 18; no new admission |
| `operator_intelligence_claims` | current claim head identity | Operator Intelligence Service / Repository | Governed correction, dispute and deletion only |
| `operator_intelligence_claim_revisions` | claim value, confidence, explanation, provenance and scope | Operator Intelligence Service / Repository | Content-bearing history; deletion must remove prohibited historical content, not merely append a visible tombstone |
| `operator_intelligence_claim_evidence` | Evidence relation and rationale | Operator Intelligence Service / Repository | Removed or de-identified with affected content |
| `operator_intelligence_eligibility_assessments` | purpose-specific eligibility history | Operator Intelligence Service / Repository | Immediate ineligibility record before later projection |
| `operator_intelligence_claim_head_events` | bounded head projection including scope | Operator Intelligence Repository | Derived projection only; must follow authoritative revision state |
| generated export response | approved current-Operator projection | Operator Intelligence Service | Streamed/generated without a durable server artifact in Sprint 18 |
| Application state | immutable presentation model | Trust Centre Application | Ephemeral; no browser cache or alternate source of truth |
| backups | copies of production relations | Supabase operational owner under approved policy | Live deletion cannot be described as backup expiry; restore must reapply the deletion ledger before normal use |
| external processors | none identified for current Operator Intelligence data | N/A | Policy remains configurable and fails closed if a future processor is declared without treatment |

# Deletion Scope Topology

All scopes begin with authenticated current-Operator resolution and immediate
eligibility removal. Physical deletion and completion reporting remain
separate.

| Scope | Required selectors | Affected current authorities |
|---|---|---|
| Item | declaration, claim or Evidence-reference identity | Owning declaration or intelligence Repository plus linked projections |
| Purpose | purpose and policy binding | consent, Evidence references, admissions, claims, eligibility, declarations and projections carrying that purpose |
| Game Integration | integration identity and version/scope policy | game-scoped Evidence, admissions, claims, declarations and projections; raw source coordination where declared |
| Understanding domain | approved domain taxonomy | declaration or claim families mapped by the governed policy set |
| Complete Operator | authenticated Operator identity | all Operator-owned live content across Operator, Session/source, Intelligence and Progression owners; Account remains distinct |

An Application-maintained table list is prohibited. The Service-owned
orchestrator must execute a policy-validated topology whose Repository steps
are explicit, idempotent and independently reportable.

# Minimum Implementation Proposal

## Contracts and policy

Add immutable versioned contracts for:

- a Sprint 18 governed policy set;
- purpose and optional-observation-category definitions without capture;
- declaration commands and typed results;
- inspection projections;
- correction and dispute commands;
- export schema version 1;
- deletion scopes and topology;
- retention and Evidence disposition commands;
- content-free audit and tombstone records; and
- operation receipts, steps and recoverable outcomes.

Every governance value remains an injected, versioned value. No retention
duration, legal-retention exception, processor rule, export bound, tombstone
field or recovery threshold receives a code default. Missing authority fails
closed.

## Minimum additive persistence

A schema change is necessary. The current deployed schema cannot durably
represent declarations, broad policy configuration, recoverable multi-owner
operations or restore-safe deletion state.

The proposed additive shape is:

1. one authoritative versioned control-policy-set relation that references,
   but does not replace, narrow admission policy versions;
2. declaration aggregate, immutable revision and bounded head-projection
   relations owned by the Operator Repository;
3. content-free control-operation receipt and step/checkpoint relations;
4. a content-free policy-authorised deletion ledger/tombstone relation for
   replay prevention and restore reapplication;
5. trusted functions for exact command retry, monotonic declaration revision,
   consent decisions, claim correction/dispute, immediate eligibility removal
   and scoped deletion steps; and
6. authenticated own-Operator read policies with direct mutation denied and
   trusted writes restricted to `service_role`.

The migration identity and exact SQL remain undecided until this audited shape
is approved, as required by Gate B. No permanent deployment is proposed.

## Services and Repositories

- extend Operator Service for authenticated declaration inspection and
  lifecycle commands;
- extend Operator Intelligence Service for consent-sensitive inspection,
  correction, dispute, export and control transitions;
- add the Memory Service policy boundary for retention eligibility and expiry
  execution only, without Memory promotion;
- add a Service-owned deletion coordinator over explicit source-owner ports;
- keep every database call in a Repository;
- make operation retries resolve to one logical receipt; and
- report pending, ineligible, legally retained, live-system physically deleted,
  processor-pending and backup-pending states separately.

## Trust Centre Application

Add an authenticated `/trust` Oracle Application that consumes request-scoped
Services and renders Application-owned immutable models. React owns no policy,
eligibility, deletion or Repository logic.

The experience covers consent, declarations, inspection, explanation,
correction, dispute, export, retention visibility, deletion and recoverable
operation status. Undefined policy produces a truthful unavailable state and
cannot enable optional processing.

## Verification

Add focused contract, Service, Repository, migration, two-Operator, deletion
residue, retry, recovery, export-bound, accessibility and architecture tests.
Use transaction rollback for database verification until a separate Founder
deployment decision.

No test or implementation may activate a candidate producer, Observation,
Evidence admission, Understanding accumulation, Snapshot consumption, Oracle
Context, Behavioural Intelligence, Guidance, Prediction, personalisation,
Platform bootstrap or alternate persistence path.

# Proposed Configurable Bounds

The policy contract must require explicit values for:

- inspection page size;
- declaration history page size;
- export item and byte limits;
- deletion batch size;
- operation retry and checkpoint limits;
- temporary export handling;
- retention and reassessment schedules;
- backup treatment;
- processor treatment; and
- completion-status expectations.

Existing hard engineering ceilings remain safety constraints where already
authoritative: claim pages are at most 100 items, reconstructed claims at most
32 Evidence references and bounded claim results at most 512 KiB. Policy may
choose stricter values but cannot exceed an engineering ceiling.

No new bound is enabled until supplied by an approved policy version.

# Phase 1 Decision

The audited implementation shape is additive and preserves the four-layer
architecture, Service ownership, Repository ownership, Operator isolation and
the ADR-038 promotion boundary.

Implementation must now pause at the Sprint 18 Phase 1 Founder gate.

Founder approval is required for:

1. the content-bearing and deletion topology above;
2. the conclusion that an additive schema change is necessary;
3. the minimum persistence and Service shape;
4. the configurable fail-closed policy approach; and
5. proceeding to Phase 2 contracts and policy validation.

Approval of this shape will authorise implementation and rollback-only
verification. It will not authorise permanent database deployment, production
control-path activation, runtime persistence, inference or later Programme
work.

# Founder Decision

The Founder approved the additive-schema conclusion, continued immutability of
Migration 009, proposed ownership model, configurable fail-closed governance
approach and progression into Phase 2 on 24 July 2026.

The approved schema remains the audited minimum and may later be simplified
only where equivalent ownership, lifecycle, governance and performance are
demonstrated. The deletion coordinator remains orchestration only. No new
architectural layer, migration implementation, permanent deployment or
production activation was authorised by this decision.
