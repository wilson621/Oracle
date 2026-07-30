# ORACLE DOCUMENTATION INDEX

**Authority:** Canonical repository entry point for Oracle documentation
**Scope:** Governance hierarchy, reading order, classifications, ownership and document status
**Owner:** Oracle Governance and Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever governance or canonical documentation changes
**Supersedes:** The incomplete documentation table in `README.md` as the canonical documentation index
**Superseded By:** None
**Last Reviewed:** 28 July 2026

---

# Purpose

This index is the repository entry point for Oracle documentation. It identifies
which documents are authoritative, what each document owns, how documents
relate and where current implementation truth is recorded.

This index is navigational. It does not create product, architectural or
delivery authority of its own.

# Core Governance Hierarchy

```text
Oracle Founding Charter
        │
        ▼
The Oracle Way
        │
        ▼
Oracle Platform Constitution
        │
        ├──────────────┐
        ▼              ▼
Oracle Engineering   Oracle Strategy
Principles
        │              │
        └──────┬───────┘
               ▼
Architecture
               ▼
Roadmap
               ▼
Engineering Programme
               ▼
Master Build Plan
               ▼
Project Board
               ▼
Sprint Execution
               ▼
Implementation
```

The Founding Charter is the highest institutional authority. The Oracle
Platform Constitution is the highest product and architectural authority.
Neither Oracle Strategy nor Oracle Engineering Principles may override the
Constitution.

Founding documents cannot authorise a constitutional exception. Strategy
cannot authorise behaviour prohibited by the Constitution. The External
Companion Principle remains binding unless the Constitution itself is formally
amended.

Accepted ADRs and the Oracle Codex are supporting controls between Engineering
Principles and Architecture:

- accepted ADRs preserve specific binding architectural decisions
- the Codex defines operational engineering standards and workflow
- both remain subordinate to the Constitution and Engineering Principles
- Architecture must reflect accepted ADRs and compliant engineering practice

The [Oracle Engineering Operating Model](ORACLE_ENGINEERING_OPERATING_MODEL.md)
is the stable constitutional engineering control beneath the Constitution and
Engineering Principles. It governs authority separation, evidence,
qualification lifecycle, immutable attempts and fail-closed completion.

[Oracle Engineering Governance](GOVERNANCE.md) governs how approved strategy
and architecture become Epics, Sprints, internal Phases, deployments and
closure evidence. It is subordinate to the Constitution, accepted ADRs and the
Codex and does not create implementation authority by itself.

# Document Classifications

## Stable

Stable documents define enduring identity, culture or constitutional
principles. They change rarely and require explicit governance review.

Examples:

- Founding Charter
- The Oracle Way
- Oracle Platform Constitution
- Oracle Engineering Principles

## Living

Living documents are reviewed continuously as strategy, architecture,
implementation or delivery changes. They must remain aligned with higher
authority and current evidence.

Examples:

- Oracle Strategy
- Oracle Codex
- Architecture and Architecture Index
- Implementation Status
- Roadmap
- Engineering Programme
- Master Build Plan
- Project Board
- Oracle Engineering Governance
- Sprint Index
- this Documentation Index

## Historical

Historical documents preserve decisions or delivery evidence at a point in
time. Their records are immutable after acceptance or closure. New information
is appended through a new record, amendment entry or superseding decision; old
records are not silently rewritten.

Examples:

- individual ADRs in the Decisions ledger
- Sprint closure reports
- retrospectives and implementation audits
- archived documents
- the Governance Refactor Documentation Audit

Existing historical files created before this metadata standard are catalogued
here without being rewritten solely to add metadata.

# Authority Rules

1. Lower-level documents and implementation must comply with higher-level
   authority.
2. Domain authority applies only within the document's stated scope.
3. The Constitution blocks prohibited product or architectural behaviour even
   when a strategic or commercial document recommends it.
4. Accepted ADRs may refine architecture but cannot override the Constitution.
5. Living status documents must distinguish aspiration, plan and verified
   implementation.
6. Historical records are preserved. A new record supersedes or amends; it does
   not rewrite prior evidence.
7. When documents conflict, stop, identify their scope and authority, and
   reconcile the lower-authority source.

# Required Reading Order

## All Oracle Stewards

1. [Oracle Founding Charter](founding/ORACLE_FOUNDING_CHARTER.md)
2. [The Oracle Way](founding/THE_ORACLE_WAY.md)
3. [Oracle Platform Constitution](ORACLE_PLATFORM_CONSTITUTION.md)
4. [Oracle Strategy](founding/ORACLE_STRATEGY.md)

## Engineering Work

Continue with:

5. [Oracle Engineering Principles](founding/ORACLE_ENGINEERING_PRINCIPLES.md)
6. [Oracle Engineering Operating Model](ORACLE_ENGINEERING_OPERATING_MODEL.md)
7. [Architectural Decisions](Decisions.md)
8. [Oracle Codex](Oracle_Codex.md)
9. [Architecture](Architecture.md)
10. [Architecture Index](architecture/ARCHITECTURE_INDEX.md)
11. [Implementation Status](architecture/IMPLEMENTATION_STATUS.md)
12. [Oracle Engineering Governance](GOVERNANCE.md)

## Planning and Delivery

Continue with:

13. [Roadmap](Roadmap.md)
14. [Engineering Programme](ENGINEERING_PROGRAMME.md)
15. [Master Build Plan](MASTER_BUILD_PLAN.md)
16. [Project Board](PROJECT_BOARD.md)
17. [Qualification Register](QUALIFICATION_REGISTER.md)
18. [Sprint Index](sprints/SPRINT_INDEX.md)
19. the relevant Sprint record under [`docs/sprints`](sprints/)

Implementation begins only after the applicable governance, architecture and
delivery authorities have been reviewed.

# Canonical Governance Ownership

| Concern | Canonical owner | Classification |
|---|---|---|
| Institutional purpose, mission and vision | [Founding Charter](founding/ORACLE_FOUNDING_CHARTER.md) | Stable |
| Culture, behaviour, leadership and hiring | [The Oracle Way](founding/THE_ORACLE_WAY.md) | Stable |
| Product and architectural constraints | [Platform Constitution](ORACLE_PLATFORM_CONSTITUTION.md) | Stable |
| Engineering authority, evidence and lifecycle model | [Oracle Engineering Operating Model](ORACLE_ENGINEERING_OPERATING_MODEL.md) | Stable |
| Long-term strategic doctrine | [Oracle Strategy](founding/ORACLE_STRATEGY.md) | Living |
| Durable engineering values | [Engineering Principles](founding/ORACLE_ENGINEERING_PRINCIPLES.md) | Stable |
| Specific architectural decisions | [Decisions / ADR ledger](Decisions.md) | Historical, append-only |
| Operational engineering standards | [Oracle Codex](Oracle_Codex.md) | Living |
| Current designed architecture | [Architecture](Architecture.md) | Living |
| Subsystem ownership and boundaries | [Architecture Index](architecture/ARCHITECTURE_INDEX.md) | Living |
| Verified repository capability | [Implementation Status](architecture/IMPLEMENTATION_STATUS.md) | Living |
| Authoritative post-Migration 009 platform state | [Oracle Platform v0.9 Baseline](ORACLE_PLATFORM_V0.9_BASELINE.md) | Point-in-time baseline |
| Engineering delivery governance and approval gates | [Oracle Engineering Governance](GOVERNANCE.md) | Living |
| Strategic delivery sequence | [Roadmap](Roadmap.md) | Living |
| Approved Sprint 17–Beta Epics, Sprints, dependencies and gates | [Engineering Programme](ENGINEERING_PROGRAMME.md) | Living |
| Approved engineering execution plan | [Master Build Plan](MASTER_BUILD_PLAN.md) | Living |
| Current approved progress | [Project Board](PROJECT_BOARD.md) | Living |
| Operational qualification states and evidence gaps | [Qualification Register](QUALIFICATION_REGISTER.md) | Living register over immutable evidence |
| Canonical Sprint numbering and aliases | [Sprint Index](sprints/SPRINT_INDEX.md) | Living index |
| Closed Sprint evidence | [`docs/sprints`](sprints/) | Historical |
| Sprint 17 Founder-approved closure evidence | [Sprint 17 Closure Report](sprints/SPRINT_17_CLOSURE.md) | Closed Sprint record |
| Migration 009 deployment and verification evidence | [Migration 009 Dossier](sprints/SPRINT_17_MIGRATION_009_DOSSIER.md) | Closed deployment record |
| Migration 009 final production closure | [Migration 009 Deployment Closure Report](sprints/SPRINT_17_MIGRATION_009_DEPLOYMENT_CLOSURE.md) | Closed deployment record |
| Sprint 17 machine-readable verification evidence | [Sprint 17 Permanent Evidence](sprints/evidence/sprint-17/README.md) | Closure evidence |
| Sprint 18 authority | [Sprint 18 Plan](sprints/SPRINT_18_PLAN.md) | Approved, closed Sprint Plan |
| Sprint 18 Founder-approved closure evidence | [Sprint 18 Closure Report](sprints/SPRINT_18_CLOSURE.md) | Closed Sprint record |
| Sprint 18 deferred production candidate | [Gate C Operational Package](sprints/SPRINT_18_GATE_C_OPERATIONAL_PACKAGE.md) and [Deferral](sprints/SPRINT_18_GATE_C_DEFERRAL.md) | Certified, undeployed |
| Sprint 19 lifecycle interpretation | [Sprint 19 Lifecycle Interpretation](sprints/SPRINT_19_LIFECYCLE_INTERPRETATION.md) | Active Founder interpretation |
| Sprint 19 implementation evidence | [Sprint 19 Phase 2 Implementation](sprints/SPRINT_19_PHASE_2_IMPLEMENTATION.md) | Implemented and verified |
| Migration 011 certification | [Sprint 19 Migration 011 Certification](sprints/SPRINT_19_MIGRATION_011_CERTIFICATION.md) | Certified, undeployed and inactive |
| Sprint 19 Founder decisions implementation | [Sprint 19 Founder Decisions Implementation](sprints/SPRINT_19_FOUNDER_DECISIONS_IMPLEMENTATION.md) | Implemented and application-certified |
| Migration 012 verification | [Sprint 19 Migration 012 Verification](sprints/SPRINT_19_MIGRATION_012_VERIFICATION.md) | Certified, undeployed and inactive |
| Sprint 19 certification | [Sprint 19 Certification](sprints/SPRINT_19_CERTIFICATION.md) | Complete and certified |
| Sprint 19 closure | [Sprint 19 Closure](sprints/SPRINT_19_CLOSURE.md) | Engineering-complete; production unchanged |
| Sprint 20 architecture decision | [Sprint 20 Founder Decision](sprints/SPRINT_20_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A approved and ADR-040 accepted |
| Sprint 20 authority | [Sprint 20 Plan](sprints/SPRINT_20_PLAN.md) and [ADR-040](Decisions.md) | Founder-approved, complete and closed |
| Sprint 20 implementation | [Sprint 20 Implementation](sprints/SPRINT_20_IMPLEMENTATION.md) | Implementation complete; production unchanged |
| Sprint 20 certification | [Sprint 20 Certification](sprints/SPRINT_20_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 20 closure | [Sprint 20 Closure](sprints/SPRINT_20_CLOSURE.md) | Closed; permanent manifest-contract directive recorded |
| Sprint 21 architectural decision | [Sprint 21 Founder Decision Required](sprints/SPRINT_21_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A and ADR-041 approved |
| Sprint 21 authority | [Sprint 21 Plan](sprints/SPRINT_21_PLAN.md) and [ADR-041](Decisions.md) | Founder-approved, complete and closed |
| Sprint 21 implementation | [Sprint 21 Implementation](sprints/SPRINT_21_IMPLEMENTATION.md) | Source implementation complete; production unchanged |
| Sprint 21 certification | [Sprint 21 Certification](sprints/SPRINT_21_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 21 closure | [Sprint 21 Closure](sprints/SPRINT_21_CLOSURE.md) | Closed; permanent sole Session authority directive recorded |
| Sprint 21 machine evidence | [Sprint 21 Permanent Evidence](sprints/evidence/sprint-21/README.md) | Local certification evidence; no deployment or activation |
| Sprint 22 authority | [Sprint 22 Plan](sprints/SPRINT_22_PLAN.md) | Complete, certified and Founder-accepted |
| Sprint 22 implementation | [Sprint 22 Implementation](sprints/SPRINT_22_IMPLEMENTATION.md) | Source implementation complete; persistence inactive |
| Sprint 22 certification | [Sprint 22 Certification](sprints/SPRINT_22_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 22 closure | [Sprint 22 Closure](sprints/SPRINT_22_CLOSURE.md) | Closed; permanent governed-Understanding directive recorded |
| Sprint 22 machine evidence | [Sprint 22 Permanent Evidence](sprints/evidence/sprint-22/README.md) | Local certification evidence; no deployment or activation |
| Sprint 23 authority | [Sprint 23 Plan](sprints/SPRINT_23_PLAN.md) | Complete, certified and Founder-accepted |
| Sprint 23 implementation | [Sprint 23 Implementation](sprints/SPRINT_23_IMPLEMENTATION.md) | Source implementation complete; persistence inactive |
| Sprint 23 certification | [Sprint 23 Certification](sprints/SPRINT_23_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 23 closure | [Sprint 23 Closure](sprints/SPRINT_23_CLOSURE.md) | Closed; permanent deterministic report-authority directive recorded |
| Sprint 23 machine evidence | [Sprint 23 Certification Evidence](sprints/evidence/sprint-23/session-intelligence-certification.json) | Local certification evidence; no deployment or activation |
| Sprint 24 proposal | [Sprint 24 Founder Proposal](sprints/SPRINT_24_PROPOSAL.md) | Option A approved; superseded by active plan |
| Sprint 24 authority | [Sprint 24 Plan](sprints/SPRINT_24_PLAN.md) and [ADR-042](Decisions.md) | Founder-approved; implementation complete |
| Sprint 24 implementation | [Sprint 24 Implementation](sprints/SPRINT_24_IMPLEMENTATION.md) | Source complete; persistence inactive |
| Sprint 24 certification | [Sprint 24 Certification](sprints/SPRINT_24_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 24 evidence | [Sprint 24 Evidence](sprints/evidence/sprint-24/README.md) | Local certification; no deployment or activation |
| Sprint 24 closure | [Sprint 24 Closure](sprints/SPRINT_24_CLOSURE.md) | Closed; permanent evidence-led progression directive recorded |
| Sprint 25 decision package | [Sprint 25 Founder Decision Required](sprints/SPRINT_25_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A and ADR-043 approved |
| Sprint 25 authority | [Sprint 25 Plan](sprints/SPRINT_25_PLAN.md) and [ADR-043](Decisions.md) | Founder-approved and closed |
| Sprint 25 implementation | [Sprint 25 Implementation](sprints/SPRINT_25_IMPLEMENTATION.md) | Source complete, accepted, transient and undeployed |
| Sprint 25 certification | [Sprint 25 Certification](sprints/SPRINT_25_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 25 evidence | [Sprint 25 Evidence](sprints/evidence/sprint-25/README.md) | Machine-readable local certification |
| Sprint 25 closure | [Sprint 25 Closure](sprints/SPRINT_25_CLOSURE.md) | Closed; permanent non-authoritative Conversation directive recorded |
| Sprint 26 decision package | [Sprint 26 Founder Decision Required](sprints/SPRINT_26_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A approved |
| Sprint 26 authority | [Sprint 26 Plan](sprints/SPRINT_26_PLAN.md) | Founder-approved; implementation complete |
| Sprint 26 implementation | [Sprint 26 Implementation](sprints/SPRINT_26_IMPLEMENTATION.md) | Source complete, transient and undeployed |
| Sprint 26 certification | [Sprint 26 Certification](sprints/SPRINT_26_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 26 evidence | [Sprint 26 Evidence](sprints/evidence/sprint-26/README.md) | Machine-readable local certification |
| Sprint 26 closure | [Sprint 26 Closure](sprints/SPRINT_26_CLOSURE.md) | Closed; permanent non-authoritative Guidance delivery directive recorded |
| Sprint 27 authority | [Sprint 27 Plan](sprints/SPRINT_27_PLAN.md), [decision package](sprints/SPRINT_27_FOUNDER_DECISION_REQUIRED.md) and [ADRs 044–045](Decisions.md) | Option A approved; Founder-accepted and closed |
| Sprint 27 implementation | [Sprint 27 Implementation](sprints/SPRINT_27_IMPLEMENTATION.md) | Source complete, transient and undeployed |
| Sprint 27 certification | [Sprint 27 Certification](sprints/SPRINT_27_CERTIFICATION.md) | Source-certified; live observation provisional and disabled |
| Sprint 27 evidence | [Sprint 27 Evidence](sprints/evidence/sprint-27/README.md) | Machine-readable local certification |
| Sprint 27 Founder acceptance package | [Sprint 27 Founder Acceptance Required](sprints/SPRINT_27_FOUNDER_ACCEPTANCE_REQUIRED.md) | Decision resolved; operational certification remains deferred |
| Sprint 27 closure | [Sprint 27 Closure](sprints/SPRINT_27_CLOSURE.md) | Closed; operational certificate remains provisional and observation disabled |
| Sprint 28 Founder decision package | [Sprint 28 Founder Decision Required](sprints/SPRINT_28_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A approved |
| Sprint 28 authority | [Sprint 28 Plan](sprints/SPRINT_28_PLAN.md) | Founder-approved, accepted and closed |
| Sprint 28 product decisions | [Sprint 28 Product Truth Inventory](sprints/SPRINT_28_PRODUCT_TRUTH_INVENTORY.md) | Complete; governs retained and consolidated routes |
| Sprint 28 implementation | [Sprint 28 Implementation](sprints/SPRINT_28_IMPLEMENTATION.md) | Complete; Founder-accepted; production unchanged |
| Sprint 28 certification | [Sprint 28 Certification](sprints/SPRINT_28_CERTIFICATION.md) | Locally certified and Founder-accepted |
| Sprint 28 evidence | [Sprint 28 Evidence](sprints/evidence/sprint-28/README.md) | Accepted machine-readable and walkthrough evidence |
| Sprint 28 Founder acceptance package | [Sprint 28 Founder Acceptance Required](sprints/SPRINT_28_FOUNDER_ACCEPTANCE_REQUIRED.md) | Decision resolved; recommendation accepted |
| Sprint 28 closure | [Sprint 28 Closure](sprints/SPRINT_28_CLOSURE.md) | Founder-accepted and closed; limitations preserved |
| Sprint 29 Founder Decision Package | [Sprint 29 Founder Decision Required](sprints/SPRINT_29_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A approved |
| Sprint 29 plan | [Sprint 29 Plan](sprints/SPRINT_29_PLAN.md) | Complete, locally certified, Founder-accepted and closed |
| Sprint 29 implementation | [Sprint 29 Implementation](sprints/SPRINT_29_IMPLEMENTATION.md) | Source implementation complete |
| Sprint 29 certification | [Sprint 29 Certification](sprints/SPRINT_29_CERTIFICATION.md) | Current-host lifecycle passed; clean-machine certification deferred |
| Sprint 29 Founder acceptance package | [Sprint 29 Founder Acceptance Required](sprints/SPRINT_29_FOUNDER_ACCEPTANCE_REQUIRED.md) | Decision resolved; recommendation accepted |
| Sprint 29 closure | [Sprint 29 Closure](sprints/SPRINT_29_CLOSURE.md) | Founder-accepted and closed; clean-machine deferral preserved |
| Sprint 30 Founder Decision Package | [Sprint 30 Founder Decision Required](sprints/SPRINT_30_FOUNDER_DECISION_REQUIRED.md) | Resolved; Option A and ADR-047 approved |
| Sprint 30 plan | [Sprint 30 Plan](sprints/SPRINT_30_PLAN.md) | Founder-approved phased delivery |
| Sprint 30 Phase 1 implementation | [Sprint 30 Phase 1 Implementation](sprints/SPRINT_30_PHASE_1_IMPLEMENTATION.md) | Diagnostic admission foundation implemented |
| Sprint 30 Phase 2 implementation | [Sprint 30 Phase 2 Implementation](sprints/SPRINT_30_PHASE_2_IMPLEMENTATION.md) | Candidate and critical journeys locally qualified; provider transaction unavailable |
| Sprint 30 Phase 3 implementation | [Sprint 30 Phase 3 Implementation](sprints/SPRINT_30_PHASE_3_IMPLEMENTATION.md) | Runtime diagnostics, reliability and recovery locally qualified |
| Sprint 30 Phase 3 incident runbook | [Sprint 30 Phase 3 Incident Runbook](sprints/SPRINT_30_PHASE_3_INCIDENT_RUNBOOK.md) | Isolated local detect, fail-closed and fresh-recovery sequence |
| Sprint 30.5 Stage 1 closure | [Sprint 30.5 Stage 1 Closure](sprints/SPRINT_30_5_STAGE_1_CLOSURE.md) | Founder-accepted and closed; controlled non-pristine host admitted |
| Sprint 30.5 Stage 1 evidence | [Sprint 30.5 Stage 1 Evidence](sprints/evidence/sprint-30-5/stage-1/README.md) | Complete, frozen and hash-bound |
| Sprint 30.5 Stage 2 plan | [Sprint 30.5 Stage 2 Plan](sprints/SPRINT_30_5_STAGE_2_PLAN.md) | Founder-accepted and closed |
| Sprint 30.5 Stage 2 implementation | [Sprint 30.5 Stage 2 Implementation](sprints/SPRINT_30_5_STAGE_2_IMPLEMENTATION.md) | Founder-accepted and closed |
| Sprint 30.5 Stage 2 qualification package | [Sprint 30.5 Stage 2 Qualification Package](sprints/SPRINT_30_5_STAGE_2_QUALIFICATION_PACKAGE.md) | Decision resolved; accepted |
| Sprint 30.5 Stage 2 closure | [Sprint 30.5 Stage 2 Closure](sprints/SPRINT_30_5_STAGE_2_CLOSURE.md) | Founder-accepted and closed |
| Sprint 30.5 Stage 2 evidence | [Sprint 30.5 Stage 2 Evidence](sprints/evidence/sprint-30-5/stage-2/README.md) | Founder-accepted, frozen and hash-bound |
| Sprint 30.5 Stage 2 invalidation decision | [Sprint 30.5 Stage 2 Invalidation Decision](sprints/SPRINT_30_5_STAGE_2_INVALIDATION_DECISION.md) | Historical candidate preserved; current-source qualification invalidated after post-freeze product-source corrections |
| Sprint 30.5 Stage 2 Requalification R1 plan | [Sprint 30.5 Stage 2 Requalification R1 Plan](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_PLAN.md) | Historical execution plan; R1 is Founder-accepted and closed |
| Sprint 30.5 Stage 2 Requalification R1 implementation | [Sprint 30.5 Stage 2 Requalification R1 Implementation](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R1_IMPLEMENTATION.md) | Attempt-scoped fail-closed harness and accepted execution lineage |
| Sprint 30.5 Stage 2 Requalification R1 qualification package | [Sprint 30.5 Stage 2 Requalification R1 Founder Qualification Package](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R1_QUALIFICATION_PACKAGE.md) | Founder decision resolved; accepted |
| Sprint 30.5 Stage 2 Requalification R1 closure | [Sprint 30.5 Stage 2 Requalification R1 Closure](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R1_CLOSURE.md) | Founder-accepted and formally closed; Stage 3 unauthorised |
| Sprint 30.5 Stage 2 Requalification R1 evidence | [Sprint 30.5 Stage 2 Requalification R1 Evidence](sprints/evidence/sprint-30-5/stage-2-requalification/README.md) | Accepted attempt frozen, hash-bound and repository-indexed |
| Sprint 30.5 Stage 2 Requalification R2 decision | [Sprint 30.5 Stage 2 Requalification R2 Candidate Refresh Decision](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R2_DECISION.md) | Founder-authorised replacement-candidate refresh; R1 remains immutable |
| Sprint 30.5 Stage 2 Requalification R2 plan | [Sprint 30.5 Stage 2 Requalification R2 Candidate Refresh Plan](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R2_PLAN.md) | Historical R2 execution plan; R2 closed; Stage 3 unauthorised |
| Sprint 30.5 Stage 2 Requalification R2 implementation | [Sprint 30.5 Stage 2 Requalification R2 Implementation](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R2_IMPLEMENTATION.md) | Complete, Founder-accepted and formally closed |
| Sprint 30.5 Stage 2 Requalification R2 Founder decision | [Sprint 30.5 Stage 2 Requalification R2 Founder Acceptance Required](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R2_FOUNDER_ACCEPTANCE_REQUIRED.md) | Founder accepted; resolved |
| Sprint 30.5 Stage 2 Requalification R2 closure | [Sprint 30.5 Stage 2 Requalification R2 Closure](sprints/SPRINT_30_5_STAGE_2_REQUALIFICATION_R2_CLOSURE.md) | Founder-accepted and formally closed; Stage 3 unauthorised |
| Sprint 30.5 Stage 2 Requalification R2 evidence | [Sprint 30.5 Stage 2 Requalification R2 Evidence](sprints/evidence/sprint-30-5/stage-2-requalification-r2/README.md) | Accepted attempt frozen, hash-bound and repository-indexed |
| Sprint 30.5 Stage 3 Qualification R1 plan | [Sprint 30.5 Stage 3 Qualification R1 Plan](sprints/SPRINT_30_5_STAGE_3_R1_PLAN.md) | Preparation Founder-authorised and R2-bound; execution blocked and unauthorised |
| Sprint 30.5 Stage 3 Qualification R1 pre-execution gate | [Sprint 30.5 Stage 3 Qualification R1 Pre-Execution Gate](sprints/SPRINT_30_5_STAGE_3_R1_PRE_EXECUTION_GATE.md) | Preparation complete; exact remaining Founder transfer and execution decisions recorded |
| Sprint 30.5 Stage 3 Qualification R2 plan | [Sprint 30.5 Stage 3 Qualification R2 Plan](sprints/SPRINT_30_5_STAGE_3_R2_PLAN.md) | Corrective preparation Founder-authorised and accepted-R2-bound; R1 preserved; execution blocked |
| Sprint 30.5 Stage 3 Qualification R2 pre-execution gate | [Sprint 30.5 Stage 3 Qualification R2 Pre-Execution Gate](sprints/SPRINT_30_5_STAGE_3_R2_PRE_EXECUTION_GATE.md) | Corrective preparation complete; exact remaining Founder execution decisions recorded |
| Sprint 30.5 Stage 3 Qualification R3 plan | [Sprint 30.5 Stage 3 Qualification R3 Plan](sprints/SPRINT_30_5_STAGE_3_R3_PLAN.md) | R2 self-path defect corrected in a new revision; R1 and R2 immutable; execution blocked |
| Sprint 30.5 Stage 3 Qualification R3 pre-execution gate | [Sprint 30.5 Stage 3 Qualification R3 Pre-Execution Gate](sprints/SPRINT_30_5_STAGE_3_R3_PRE_EXECUTION_GATE.md) | R3 preparation authority and exact remaining Founder execution decisions recorded |
| Sprint 30.5 Stage 3 Qualification R4 plan | [Sprint 30.5 Stage 3 Qualification R4 Plan](sprints/SPRINT_30_5_STAGE_3_R4_PLAN.md) | R3 package-inventory semantic defect corrected; R1–R3 immutable; execution blocked |
| Sprint 30.5 Stage 3 Qualification R4 pre-execution gate | [Sprint 30.5 Stage 3 Qualification R4 Pre-Execution Gate](sprints/SPRINT_30_5_STAGE_3_R4_PRE_EXECUTION_GATE.md) | R4 preparation and package-inventory contract recorded; separate execution authority required |
| Sprint 30.5 Stage 3 plan | [Sprint 30.5 Stage 3 Plan](sprints/SPRINT_30_5_STAGE_3_PLAN.md) | Historical execution plan; Stage 3 was attempted but remains incomplete and blocked |
| Sprint 30.5 Stage 3 host admission | [Sprint 30.5 Stage 3 Host Admission](sprints/SPRINT_30_5_STAGE_3_HOST_ADMISSION.md) | Historical host-admission requirements; Founder-QA-01 remains admitted with Founder provenance exception |
| Sprint 30.5 Stage 3 admission decision | [Sprint 30.5 Stage 3 Host Admission Decision](sprints/SPRINT_30_5_STAGE_3_HOST_ADMISSION_DECISION.md) | Founder-approved historical admission decision; admission remains distinct from current execution authority |
| Sprint 30.5 Stage 3 provenance package | [Sprint 30.5 Stage 3 Provenance Exception Founder Approval Package](sprints/SPRINT_30_5_STAGE_3_PROVENANCE_EXCEPTION_FOUNDER_APPROVAL_PACKAGE.md) | Approved historical evidence and residual-risk package |
| Sprint 30.5 Stage 3 reconciliation | [Sprint 30.5 Stage 3 Reconciliation](sprints/SPRINT_30_5_STAGE_3_RECONCILIATION.md) | Stage 3 historically attempted, incomplete and blocked; no current resume authority |
| Sprint 30.5 Stage 3 reconciliation evidence | [Sprint 30.5 Stage 3 Reconciliation Evidence](sprints/evidence/sprint-30-5/stage-3-reconciliation/README.md) | Recovered phase evidence, chain of custody, unavailable dispositions and USB integrity incident |
| Sprint 30.5 post-reconciliation Phase A5 engineering validation evidence | [Phase A5 Engineering Validation Evidence](sprints/evidence/sprint-30-5/engineering-validation/phase-a5/README.md) | Clean committed local Electron source-health qualification passed; does not reopen or complete Stage 3 |
| Operator-first amendment record | [Sprint 18 Operator-First Reconciliation](governance/SPRINT_18_OPERATOR_FIRST_RECONCILIATION_PROPOSAL.md) | Applied historical governance record |

# Supporting Documentation

## Product and Architecture

- [Companion Architecture](product/COMPANION_ARCHITECTURE.md) — Companion
  product and technical boundary; Living
- [Call of Duty Guidance Package](product/CALL_OF_DUTY_GUIDANCE_PACKAGE.md) —
  reviewed package scope and sources; Living
- [Dependency Boundary Audit](architecture/DEPENDENCY_BOUNDARY_AUDIT.md) —
  accepted audit baseline with automated enforcement; Historical
- [Architecture v4.1](architecture/ARCHITECTURE_v4.1.md) — historical engine
  runtime baseline; Historical
- [Desktop API Compatibility](../desktop/platform/API_COMPATIBILITY.md) — frozen
  Desktop Platform API version 1 policy; Stable within that API version

## Brand and Experience

- [Company Brand Bible Foundation](company/COMPANY_BRAND_BIBLE_FOUNDATION.md) —
  proposed identity foundation for the unnamed company above Oracle; Draft,
  non-canonical pending Founder approval
- [Company Brand Bible Foundation Validation](company/COMPANY_BRAND_BIBLE_FOUNDATION_VALIDATION.md)
  — independent validation retaining the Foundation as a non-canonical draft;
  Historical review record
- [Branding](BRANDING.md) — product and repository naming
- [Brand Bible](Brand-Bible.md) — external product identity, language and voice
- [Oracle Design System](Oracle-Design-System.md) — visual and interaction
  standards

These documents govern product expression within the Founding Charter, Oracle
Way and Constitution. They do not define internal company culture or
architectural exceptions.

## Exploration

- [Ideas](Ideas.md) — uncommitted research and innovation backlog
- [Signature Features](SIGNATURE_FEATURES.md) — proposed defining experiences
- [Contextual Intelligence](Contextual-Intelligence.md) — Sprint 5 subsystem
  description; retained for historical context pending separate consolidation

Exploratory documents are non-authoritative. Recording an idea does not place it
on the Roadmap or authorise implementation.

# Superseded and Interpretive Documents

| Document | Status | Canonical replacement |
|---|---|---|
| [Project Vision](PROJECT_VISION.md) | Superseded navigation document | Founding Charter and Oracle Strategy |
| [Oracle Principles](Oracle-Principles.md) | Superseded navigation document | The Oracle Way, Constitution and Engineering Principles |
| [Manifesto](Manifesto.md) | Retained interpretive statement; non-authoritative | Founding Charter for purpose, mission and vision |

These paths are retained to preserve links and historical context. Their status
must be explicit, and they must not duplicate or override canonical governance.

# Historical Records

Historical Sprint records are stored under [`docs/sprints`](sprints/).
Superseded early documentation is stored under [`docs/archive`](archive/).

Archive location alone does not make content current or authoritative. Archived
documents are evidence of earlier thinking and must not be used to override an
active canonical source.

# Metadata Standard

New governing documents use this metadata order:

```text
Authority:
Scope:
Owner:
Status:
Classification:
Expected Stability:
Supersedes:
Superseded By:
Last Reviewed:
```

Use `None` when no supersession relationship exists. Historical records include
the metadata when created; accepted historical content is not rewritten merely
to adopt a later formatting standard.

# Maintenance Rules

- Update this index whenever a canonical document is created, superseded,
  relocated or reclassified.
- Do not duplicate canonical mission, vision, culture, strategy or engineering
  principles in lower-level documents.
- Link to canonical sources and state only the local operational consequence.
- Review living documents at relevant strategic, architectural and Sprint
  transitions.
- Preserve historical records and use Git for immutable history.
- Verify relative links and authority terminology before governance changes are
  accepted.
