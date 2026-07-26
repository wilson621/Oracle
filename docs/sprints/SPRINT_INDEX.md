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
| 27 | Contextual Companion and Reference Integration | Complete — Founder-accepted and closed; source/synthetic certification accepted; Operational Certification Deferred; live profile provisional and observation disabled | None | [Plan](SPRINT_27_PLAN.md), [Implementation](SPRINT_27_IMPLEMENTATION.md), [Certification](SPRINT_27_CERTIFICATION.md), [Closure](SPRINT_27_CLOSURE.md), [Founder acceptance package](SPRINT_27_FOUNDER_ACCEPTANCE_REQUIRED.md), [ADRs 044–045](../Decisions.md) |
| 28 | Unified Oracle Product Experience | Complete, locally certified, Founder-accepted and closed | None | [Decision package](SPRINT_28_FOUNDER_DECISION_REQUIRED.md), [Plan](SPRINT_28_PLAN.md), [Product Truth Inventory](SPRINT_28_PRODUCT_TRUTH_INVENTORY.md), [Implementation](SPRINT_28_IMPLEMENTATION.md), [Certification](SPRINT_28_CERTIFICATION.md), [Founder acceptance package](SPRINT_28_FOUNDER_ACCEPTANCE_REQUIRED.md), [Closure](SPRINT_28_CLOSURE.md) |
| 29 | Secure Desktop Operations and Distribution | Complete, locally certified, Founder-accepted and closed; Clean-Machine Certification Deferred | None | [Decision package](SPRINT_29_FOUNDER_DECISION_REQUIRED.md), [Plan](SPRINT_29_PLAN.md), [Implementation](SPRINT_29_IMPLEMENTATION.md), [Certification](SPRINT_29_CERTIFICATION.md), [Founder acceptance package](SPRINT_29_FOUNDER_ACCEPTANCE_REQUIRED.md), [Closure](SPRINT_29_CLOSURE.md), [ADR-046](../Decisions.md) |
| 30 | Production Qualification | Founder-approved and active; Phases 1–5 locally verified; Sprint 30.5 Stages 1–2 Founder-accepted and closed; Stage 3 host admitted with Founder provenance exception; Stage 3 execution not authorised; Stages 3–7 remain | None | [Decision package](SPRINT_30_FOUNDER_DECISION_REQUIRED.md), [Plan](SPRINT_30_PLAN.md), [Phase 1 implementation](SPRINT_30_PHASE_1_IMPLEMENTATION.md), [Phase 2 implementation](SPRINT_30_PHASE_2_IMPLEMENTATION.md), [Phase 3 implementation](SPRINT_30_PHASE_3_IMPLEMENTATION.md), [Phase 4 implementation](SPRINT_30_PHASE_4_IMPLEMENTATION.md), [Phase 5 implementation](SPRINT_30_PHASE_5_IMPLEMENTATION.md), [Production Qualification dossier](SPRINT_30_PRODUCTION_QUALIFICATION_DOSSIER.md), [Founder acceptance package](SPRINT_30_FOUNDER_ACCEPTANCE_REQUIRED.md), [Stage 1 closure](SPRINT_30_5_STAGE_1_CLOSURE.md), [Stage 1 evidence](evidence/sprint-30-5/stage-1/README.md), [Stage 2 plan](SPRINT_30_5_STAGE_2_PLAN.md), [Stage 2 implementation](SPRINT_30_5_STAGE_2_IMPLEMENTATION.md), [Stage 2 qualification package](SPRINT_30_5_STAGE_2_QUALIFICATION_PACKAGE.md), [Stage 2 closure](SPRINT_30_5_STAGE_2_CLOSURE.md), [Stage 2 evidence](evidence/sprint-30-5/stage-2/README.md), [Stage 3 plan](SPRINT_30_5_STAGE_3_PLAN.md), [Stage 3 host admission](SPRINT_30_5_STAGE_3_HOST_ADMISSION.md), [Stage 3 admission decision](SPRINT_30_5_STAGE_3_HOST_ADMISSION_DECISION.md), [Qualification Register](../QUALIFICATION_REGISTER.md), [ADR-047](../Decisions.md) |
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
Operational certification is formally deferred because the required
third-party environment is unavailable. The exact live observation profile
remains provisional and observation remains disabled. Sprint 27 is
Founder-accepted and closed; its operational certification remains deferred
without creating a support, activation or deployment claim. Sprint 28 Option A
is complete, locally certified, Founder-accepted and closed. Sprint 29 Option A
is complete, locally certified, Founder-accepted and closed under ADR-046.
Clean-Machine Certification Deferred — Required Disposable Windows
Environment Unavailable remains the independent programme status. Sprint 30
Option A and ADR-047 are Founder-approved. Phases 1–5 are complete and locally
verified. Phase 3 integrates disabled Operational Diagnostics through exact
manifest `1.7.0` composition, and proves failure isolation, bounded local
diagnostics, fresh recovery, backup/restore/deletion and Sprint 29 rollback
regression. The live Supabase Auth provider transaction remains unavailable.
The immutable Sprint 29 package remains at `1.6.0` and requires later
candidate reconciliation. Phase 4 passes bounded current-host performance,
public accessibility and support qualification. Live authenticated rendering,
installed-package GPU evidence and clean Windows remain unavailable or
deferred without a pass claim. Phase 5 completes the integrated matrix and
Production Qualification dossier. Sprint 30.5 Stage 1 Environment Admission
is Founder-accepted and closed with frozen controlled non-pristine host,
isolated network, standalone GPU and cleanup evidence. It does not satisfy the
separate clean Windows requirement. Stage 2 package reconciliation is
Founder-accepted and closed with frozen evidence. Sprint 30 remains
qualification-incomplete until Stages 3–7 complete, beginning with separately
authorised clean Windows qualification. The Stage 3 host is admitted with a
Founder provenance exception, but Stage 3 has not begun.
