# ORACLE SPRINT INDEX

**Authority:** Canonical index of Oracle production objectives and historical Sprint aliases
**Scope:** Sprint numbering, title, status, plans, closure evidence and aliases
**Owner:** Oracle Delivery
**Status:** Active
**Classification:** Living index over historical records
**Expected Stability:** Updated at Sprint activation, closure or approved renumbering
**Supersedes:** Informal Sprint numbering inferred from individual planning documents
**Superseded By:** None
**Last Reviewed:** 25 July 2026

---

# Numbering Convention

Under [Oracle Engineering Governance](../GOVERNANCE.md), a Sprint is an
independently reviewable production objective. Phases are internal
implementation stages and do not use fractional Sprint numbering.

# Current Delivery Line

| Sprint | Production objective | Status | Historical alias | Evidence |
|---|---|---|---|---|
| 12.1 | Desktop Platform hardening | Historical, complete | Retained historical number | [Audit](SPRINT_12_1_IMPLEMENTATION_AUDIT.md), [Retrospective](SPRINT_12_1_RETROSPECTIVE.md) |
| 13 | Game Integration vertical slice | Historical, complete | None | [Closure](SPRINT_13_CLOSURE.md) |
| 14 | Companion Intelligence Foundation | Historical, complete | None | [Closure](SPRINT_14_CLOSURE.md) |
| 15 | Operator Understanding Foundation | Historical; approved foundation phases complete | None | [Approved plan](SPRINT_15_PLAN.md) |
| 16 | Trust Boundary | Complete | Sprint 15.5A | Commit `58589b52de0db341e6518fa9f235bb18854e6b30` |
| 17 | Scale-Safe Trust Data Plane | Fully complete — Migration 009 deployed and verified in production | Sprint 15.5B; earlier proposed as Scale Hardening | [Plan](SPRINT_17_PLAN.md), [Closure](SPRINT_17_CLOSURE.md), [Migration dossier](SPRINT_17_MIGRATION_009_DOSSIER.md), [Deployment closure](SPRINT_17_MIGRATION_009_DEPLOYMENT_CLOSURE.md) |
| 18 | Operator Trust and Control | Complete — Founder-approved and closed; Migration 010 certified, Gate C intentionally deferred | None | [Plan](SPRINT_18_PLAN.md), [Closure](SPRINT_18_CLOSURE.md), [Phase 1 audit](SPRINT_18_PHASE_1_AUDIT.md), [Phase 2 evidence](SPRINT_18_PHASE_2_IMPLEMENTATION.md), [Phase 3 evidence](SPRINT_18_PHASE_3_IMPLEMENTATION.md), [Gate C package](SPRINT_18_GATE_C_OPERATIONAL_PACKAGE.md), [Gate C deferral](SPRINT_18_GATE_C_DEFERRAL.md), [ADRs 037–039](../Decisions.md) |
| 19 | Account, Identity and Commissioning | Complete and certified — Migrations 011 and 012 undeployed and inactive | None | [Engineering Programme](../ENGINEERING_PROGRAMME.md), [Closure](SPRINT_19_CLOSURE.md), [Founder decisions implementation](SPRINT_19_FOUNDER_DECISIONS_IMPLEMENTATION.md), [Migration 011 certification](SPRINT_19_MIGRATION_011_CERTIFICATION.md), [Migration 012 certification](SPRINT_19_MIGRATION_012_VERIFICATION.md), [Certification](SPRINT_19_CERTIFICATION.md) |
| 20 | Platform Runtime Activation | Complete, certified and Founder-accepted; undeployed and inactive | None | [Plan](SPRINT_20_PLAN.md), [Implementation](SPRINT_20_IMPLEMENTATION.md), [Certification](SPRINT_20_CERTIFICATION.md), [Closure](SPRINT_20_CLOSURE.md), [ADR-040](../Decisions.md) |
| 21 | Oracle Session and Evidence Lifecycle | Complete, certified and Founder-accepted; Migration 013 undeployed and inactive | None | [Plan](SPRINT_21_PLAN.md), [Implementation](SPRINT_21_IMPLEMENTATION.md), [Certification](SPRINT_21_CERTIFICATION.md), [Closure](SPRINT_21_CLOSURE.md), [ADR-041](../Decisions.md) |
| 22 | Operator Understanding Accumulation | Complete, certified and Founder-accepted | None | [Plan](SPRINT_22_PLAN.md), [Implementation](SPRINT_22_IMPLEMENTATION.md), [Certification](SPRINT_22_CERTIFICATION.md), [Closure](SPRINT_22_CLOSURE.md) |
| 23 | Oracle Session Intelligence | Complete, certified and Founder-accepted | None | [Plan](SPRINT_23_PLAN.md), [Implementation](SPRINT_23_IMPLEMENTATION.md), [Certification](SPRINT_23_CERTIFICATION.md), [Closure](SPRINT_23_CLOSURE.md) |
| 24 | Adaptive Coaching, Planner and Progression | Complete, certified and Founder-accepted; Migration 014 undeployed and inactive | None | [Proposal](SPRINT_24_PROPOSAL.md), [Plan](SPRINT_24_PLAN.md), [Implementation](SPRINT_24_IMPLEMENTATION.md), [Certification](SPRINT_24_CERTIFICATION.md), [Closure](SPRINT_24_CLOSURE.md), [ADR-042](../Decisions.md) |
| 25 | Conversational Oracle | Complete, certified and Founder-accepted | None | [Plan](SPRINT_25_PLAN.md), [Implementation](SPRINT_25_IMPLEMENTATION.md), [Certification](SPRINT_25_CERTIFICATION.md), [Closure](SPRINT_25_CLOSURE.md), [ADR-043](../Decisions.md) |
| 26 | Authoritative Companion Guidance Delivery | Complete, certified and Founder-accepted | None | [Plan](SPRINT_26_PLAN.md), [Implementation](SPRINT_26_IMPLEMENTATION.md), [Certification](SPRINT_26_CERTIFICATION.md), [Closure](SPRINT_26_CLOSURE.md), [Decision package](SPRINT_26_FOUNDER_DECISION_REQUIRED.md) |
| 27 | Contextual Companion and Reference Integration | Source-certified; live observation profile provisionally certified and disabled pending exact workstation test | None | [Plan](SPRINT_27_PLAN.md), [Implementation](SPRINT_27_IMPLEMENTATION.md), [Certification](SPRINT_27_CERTIFICATION.md), [Decision package](SPRINT_27_FOUNDER_DECISION_REQUIRED.md), [ADRs 044–045](../Decisions.md) |
| 28 | Unified Oracle Product Experience | Approved Programme; not activated | None | [Engineering Programme](../ENGINEERING_PROGRAMME.md) |
| 29 | Secure Desktop Operations and Distribution | Approved Programme; not activated | None | [Engineering Programme](../ENGINEERING_PROGRAMME.md) |
| 30 | Production Qualification | Approved Programme; not activated | None | [Engineering Programme](../ENGINEERING_PROGRAMME.md) |
| 31 | Oracle Beta Certification | Approved Programme; not activated | None | [Engineering Programme](../ENGINEERING_PROGRAMME.md) |

# Historical Integrity

This index does not rename historical commits, accepted ADRs, approved Sprint
Plans or archived records. Transitional aliases are retained only where they
are needed to trace contemporary reviews and implementation evidence.

The approved Engineering Programme defines the sequence but grants no
implementation authority. Every Sprint requires its own approved plan and
explicit activation. Sprint 17 is Founder-approved and fully complete. Migration
009 is deployed and verified, while runtime persistence remains disabled.
Sprint 18 was Founder-approved and activated on 24 July 2026 from the clean
synchronized governance baseline and is now complete and immutable. Sprint 19
is complete and certified under the Founder's lifecycle interpretation.
Migrations 011 and 012 are implemented and certified but neither deployed nor
activated. Production remains post-Migration-009 and pre-Migration-010, and
runtime persistence remains disabled. Sprint 20 is complete, certified and
Founder-accepted under ADR-040. Sprint 21 is complete, certified and
Founder-accepted under ADR-041. Sprint 22 is complete, certified and
Founder-accepted under the existing Operator Understanding ADRs. Sprint 23 is
complete, certified and Founder-accepted. Sprint 24 is complete, certified and
Founder-accepted. Sprint 25 is complete, certified and Founder-accepted under
ADR-043. Sprint 26 is complete, certified and Founder-accepted. Sprint 27
Option A, Minecraft: Java Edition `26.1.1`, ADR-044 and ADR-045 are approved.
Its bounded source implementation and synthetic certification are complete.
The exact live observation profile remains provisional and disabled pending a
test with the pinned game installed.
