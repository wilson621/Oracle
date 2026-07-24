# SPRINT 18 CLOSURE REPORT

**Sprint:** 18 — Operator Trust and Control

**Engineering status:** Complete — Founder-approved and closed

**Date:** 24 July 2026

**Branch:** `sprint-9-overlay`

**Closure baseline:** `sprint-18-complete`

**Production schema:** Pre-Migration-010

**Runtime persistence:** Disabled

**Next Sprint:** Sprint 19 planning not started or authorised

## Outcome

Sprint 18 establishes Oracle's approved Operator Trust and Control foundation
without activating Observation, Evidence Admission, Understanding
accumulation, Memory promotion, runtime persistence or a production control
path.

The Founder accepts the governance implementation, ADR-037 through ADR-039,
Trust and Control contracts, persistence architecture, Repository ownership
model, verification suites, Persistence Contract, Gate C Operational Package
and formal Gate C deferral. No further Sprint 18 implementation is authorised.

Sprint 18 closes with Migration 010 certified and deployment-ready but absent
from production. Gate C is intentionally deferred until immediately before
the first production release that requires Operator Trust and Control
persistence.

## Objectives achieved

Sprint 18 delivered the approved foundation required for future Operator
agency:

- Operator Intelligence primacy is constitutional and architectural authority;
- Observation, Evidence, Understanding and Memory have explicit promotion
  boundaries rather than automatic progression;
- retention, deletion, audit and tombstone responsibilities are governed by
  ADR-039;
- immutable contracts cover versioned control policy, consent, declarations,
  inspection, export, lifecycle commands, content-free receipts, recoverable
  steps and policy-authorised tombstones;
- undefined governance values remain configurable and fail closed;
- broad Operator control policy and Migration 009 Evidence-admission policy
  remain explicit, separate authorities;
- persistence ownership is allocated without adding a layer, alternative
  store or duplicated source of truth; and
- the approved additive persistence candidate is statically verified,
  transactionally exercised, performance-checked and rollback-proven.

This closure does not claim that the deferred runtime Service controls or Trust
Centre are operational. The Founder closure decision accepts the implemented
governance, contract and persistence architecture as the completed Sprint 18
outcome and terminates further Sprint 18 implementation.

## Phase and decision record

| Stage | Outcome | Evidence |
|---|---|---|
| Activation | Oracle Platform v0.9 baseline and Sprint scope locked | `5e78ca1` |
| Phase 1 | Additive-schema need, topology and ownership audited | [Phase 1 audit](SPRINT_18_PHASE_1_AUDIT.md) |
| Phase 2 | Trust and Control contracts and fail-closed policy boundary implemented | `61dd8fa`, [Phase 2 evidence](SPRINT_18_PHASE_2_IMPLEMENTATION.md) |
| Phase 3 | Eight-relation persistence and Repository implementations completed | `acb23e2`, [Phase 3 evidence](SPRINT_18_PHASE_3_IMPLEMENTATION.md) |
| Persistence approval | Production candidate fixed and tagged | `sprint-18-phase-3-persistence-approved` |
| Gate C package | Production execution procedure prepared and accepted | `252be39`, [Operational package](SPRINT_18_GATE_C_OPERATIONAL_PACKAGE.md) |
| Gate C deferral | Candidate retained; permanent execution deferred | `36891bf`, [Deferral](SPRINT_18_GATE_C_DEFERRAL.md) |
| Phases 4–6 | Not begun; runtime controls, Trust Centre and activation verification deferred | Founder closure decision |
| Phase 7 | Sprint accepted and closed; no further Sprint 18 work authorised | This report |

## Architectural outcomes

The permanent four-layer architecture remains unchanged:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

Applications do not access Repositories. Repositories serialize accepted
contracts and own persistence but do not choose policy or orchestrate
cross-owner work. Trusted SQL enforces only durable integrity, security,
isolation and bounded atomic operations. Contract factories remain the
semantic validation authority.

Repository ownership is:

- Operator Repository — broad consent and declaration aggregates;
- Operator Intelligence Repository — claim, Evidence disposition and
  eligibility control adapters;
- Operator Control Repository — policy versions and content-free operation,
  step and tombstone persistence; and
- source-owner Repositories — their existing authoritative source records.

The future deletion coordinator remains Service orchestration only. It owns no
table, Repository, policy or deletion semantics.

## Governance decisions

- ADR-037 makes Operator Intelligence the primary governed intelligence model.
- ADR-038 prevents automatic Observation-to-Evidence,
  Evidence-to-Understanding and Understanding-to-Memory promotion.
- ADR-039 defines distinct retention, eligibility, deletion, audit, tombstone,
  backup and restore states.
- Migration 009 is immutable.
- Migration 010 is additive, inert and the sole certified production
  candidate.
- Broad control consent does not replace or imply Migration 009 admission
  consent.
- No default Founder policy value is embedded in contracts, Repositories or
  SQL.
- Gate C deployment, Gate D activation and runtime registration remain
  separate decisions.

## Verification evidence

The accepted Phase 3 evidence records PostgreSQL 17.10 verification of all
eight relations and fifteen trusted functions, exact replay, immutable
conflict, stale concurrency, two-Operator isolation, direct-write and
untrusted-RPC denial, completion gating, fail-closed tombstone policy,
deletion residue removal, deleted-identity replay prevention and bounded
indexed reads.

The exact rollback rehearsal produced identical pre/post catalogs:

```text
catalog before  7448c2933fba2892f0154c6afe9c51106f31a3c7cbb678fbaa843cb898cda12b
catalog after   7448c2933fba2892f0154c6afe9c51106f31a3c7cbb678fbaa843cb898cda12b
```

Closure verification on 24 July 2026 produced:

| Verification | Result |
|---|---|
| Operator Control contracts | Pass |
| Operator Control Repositories | Pass |
| Migration 010 static manifest and hashes | Pass — 8 relations, 15 functions |
| Operator ownership | Pass |
| Operator Understanding contracts, lifecycle and Services | Pass |
| Operator Intelligence persistence, authority and trust | Pass |
| Guidance and Companion regression | Pass |
| Architecture audit | Pass — 372 files, no new violations, zero runtime cycle groups |
| Desktop TypeScript compilation | Pass |
| ESLint | Pass — zero errors, five unchanged warnings |
| Next.js 16.2.10 production build | Pass — 20 static pages |
| `git diff --check` | Pass |

The production build's first sandboxed attempt could not fetch configured
Google fonts. The network-enabled rerun passed without source modification.

The database-backed Migration 010 suites were not repeated during closure
because no disposable PostgreSQL connection was configured. An attempted
invocation stopped at its mandatory environment precondition before opening a
database connection. The Founder-accepted, version-pinned Phase 3 persistence,
performance and rollback evidence remains applicable because the certified
Migration 009 and Migration 010 hashes are unchanged.

## Certified artifacts

| Artifact | Certified identity |
|---|---|
| Migration 010 implementation commit | `acb23e2f7025ac04b921b399ff9e8dd295c6e953` |
| Migration 010 tag | `sprint-18-phase-3-persistence-approved` |
| Migration 010 SHA-256 | `7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715` |
| Migration 009 SHA-256 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |
| Completed Sprint baseline | `sprint-18-complete` |

## Deferred work

The following work is intentionally not part of the closed implementation:

- permanent Migration 010 execution and post-deployment verification;
- actual Founder governance policy values;
- runtime registration and production persistence;
- authenticated Operator Service controls;
- multi-owner deletion coordination;
- retention and processor execution;
- Trust Centre Application and accessibility walkthrough;
- Gate D production control-path activation;
- Observation capture and Evidence Admission;
- Understanding accumulation and Memory promotion;
- Snapshot or Oracle Context runtime consumption;
- Behavioural Intelligence, Guidance, Prediction and personalisation; and
- production release.

Unstarted Sprint 18 Plan phases are not implicitly carried forward as active
work. Any future implementation requires a newly approved Sprint or explicit
Founder authority.

## Current platform state

Oracle Platform v0.9 remains the canonical platform baseline. Migration 009 is
deployed and verified in production. Production remains pre-Migration-010.
Migration 010 is the approved production candidate and Gate C is deferred.

Runtime persistence, Platform bootstrap and all Sprint 18 production control
paths remain disabled. No Observation, Evidence Admission, Understanding,
Memory, Trust Centre or inference behavior was activated by Sprint 18.

## Recommended starting point for Sprint 19

Stop after this closure. Sprint 19 planning should begin only under explicit
Founder instruction.

When authorised, planning should start from:

1. the Constitution and accepted ADR-037 through ADR-039;
2. the authoritative [Persistence Contract](../architecture/PERSISTENCE_CONTRACT.md);
3. the fact that production is pre-Migration-010;
4. the certified but deferred Gate C package;
5. the accepted Trust and Control contracts and Repository boundaries; and
6. the Engineering Programme objective for Account, Identity and
   Commissioning.

Sprint 19 must not silently absorb deferred Sprint 18 runtime controls or
assume Gate C completion. Any dependency on Migration 010 requires Gate C to
be explicitly reopened and completed first.

## Founder closure decision

The Founder declares Sprint 18 complete and accepts its governance,
architecture, contracts, persistence, ownership, verification and deployment
deferral evidence. Gate C remains intentionally deferred. No further Sprint 18
implementation is authorised, and Sprint 18 must not be reopened without
explicit Founder approval.
