# SPRINT 18 GATE C DEFERRAL

**Sprint:** 18 — Operator Trust and Control

**Decision:** Gate C intentionally deferred

**Authority:** Founder decision

**Recorded:** 24 July 2026

**Production change:** None

## Decision

Migration 010 is certified and deployment-ready. It is the approved production
candidate for Operator Trust and Control persistence.

Gate C must not be executed now. It will be revisited immediately before the
first production release that requires Operator Trust and Control persistence.
The approved operational package remains the mandatory execution procedure.

## Approved production candidate

| Item | Approved value |
|---|---|
| Certified deployment commit | `acb23e2f7025ac04b921b399ff9e8dd295c6e953` |
| Operational package commit | `252be39142e1a27c99a04473fbe3b2c5b5ac00b6` |
| Certified Git tag | `sprint-18-phase-3-persistence-approved` |
| Migration 010 artifact | `database/010_operator_trust_control_persistence.sql` |
| Migration 010 SHA-256 | `7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715` |
| Immutable Migration 009 SHA-256 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |

Any artifact, commit, tag or hash change creates a different candidate and
requires renewed Founder review.

## Authoritative development assumption

Oracle development may continue on the basis that the Sprint 18 persistence
architecture, Repository ownership allocation, trusted SQL surface and
database authority boundaries are complete and approved.

That architectural completion is not deployment. Until Gate C is reopened and
successfully completed:

- Migration 010 remains absent from production;
- runtime persistence remains disabled;
- production code must not depend on Migration 010 being present;
- no production control path may invoke the new Repository or SQL surface; and
- deployment-sensitive verification must continue to distinguish the
  repository candidate from the deployed production catalog.

## Non-authorisation

This decision does not authorise:

- permanent Migration 010 execution;
- production policy registration;
- runtime persistence or Platform bootstrap registration;
- Observation or Evidence Admission;
- Understanding accumulation or Memory promotion;
- Trust Centre or any production control path;
- deployment, release or tag push; or
- a substitution, amendment or second migration candidate.

## Gate C resumption

Immediately before the first production release requiring Operator Trust and
Control persistence, Gate C must be explicitly reopened. Before any production
connection or execution:

1. every operational record field must contain an actual production value;
2. the approved commit, tag and both migration hashes must be reverified;
3. the production identity, catalog, locks, capacity and dormant runtime state
   must pass fresh pre-flight;
4. the production backup must be created and independently restore-verified;
5. the exact rollback and catalog rehearsal must pass again; and
6. the complete execution, monitoring, stop-condition and post-execution
   strategy in `SPRINT_18_GATE_C_OPERATIONAL_PACKAGE.md` must remain
   applicable without modification.

Any failed or unresolved check stops Gate C.
