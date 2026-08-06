# ORACLE SPRINT INDEX

**Authority:** Canonical index of Oracle production objectives and historical Sprint aliases
**Scope:** Sprint numbering, title, status, plans, closure evidence and aliases
**Owner:** Oracle Delivery
**Status:** Active
**Classification:** Living index over historical records
**Expected Stability:** Updated at Sprint activation, closure or approved renumbering
**Supersedes:** Informal Sprint numbering inferred from individual planning documents
**Superseded By:** None
**Last Reviewed:** 6 August 2026

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
| 29 | Secure Desktop Operations and Distribution | Complete, locally certified, Founder-accepted and closed; clean-machine lifecycle subsequently qualified by Stage 3 R9 | None | [Decision package](SPRINT_29_FOUNDER_DECISION_REQUIRED.md), [Plan](SPRINT_29_PLAN.md), [Implementation](SPRINT_29_IMPLEMENTATION.md), [Certification](SPRINT_29_CERTIFICATION.md), [Founder acceptance package](SPRINT_29_FOUNDER_ACCEPTANCE_REQUIRED.md), [Closure](SPRINT_29_CLOSURE.md), [ADR-046](../Decisions.md) |
| 30 | Production Qualification | Founder-approved and active; Stage 2 R8 is Founder-accepted and closed as the current package baseline; R6/R12/R4 remain immutable history for the prior package; Stages 3-5 require new R8-bound decisions; Stages 6-7 remain | None | [Decision package](SPRINT_30_FOUNDER_DECISION_REQUIRED.md), [Plan](SPRINT_30_PLAN.md), [Production Qualification dossier](SPRINT_30_PRODUCTION_QUALIFICATION_DOSSIER.md), [Stage 1 closure](SPRINT_30_5_STAGE_1_CLOSURE.md), [Stage 2 R8 closure](SPRINT_30_5_STAGE_2_REQUALIFICATION_R8_CLOSURE.md), [Stage 2 R8 evidence](evidence/sprint-30-5/stage-2-requalification-r8/README.md), [Historical Stage 2 R6 closure](SPRINT_30_5_STAGE_2_REQUALIFICATION_R6_CLOSURE.md), [Historical Stage 3 R12 closure](SPRINT_30_5_STAGE_3_R12_QUALIFICATION_CLOSURE.md), [Qualification Register](../QUALIFICATION_REGISTER.md), [ADR-047](../Decisions.md) |
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
The independent clean-machine lifecycle was subsequently qualified by Stage
3 R9 for the accepted Stage 2 R2 package. Sprint 30
Option A and ADR-047 are Founder-approved. Phases 1–5 are complete and locally
verified. Phase 3 integrates disabled Operational Diagnostics through exact
manifest `1.7.0` composition, and proves failure isolation, bounded local
diagnostics, fresh recovery, backup/restore/deletion and Sprint 29 rollback
regression. The live Supabase Auth provider transaction remains unavailable.
The immutable Sprint 29 package remains at `1.6.0` and requires later
candidate reconciliation. Phase 4 passes bounded current-host performance,
public accessibility and support qualification. Live authenticated rendering
and installed-package GPU evidence remain unavailable or deferred without a
pass claim. Phase 5 completes the integrated matrix and
Production Qualification dossier. Sprint 30.5 Stage 1 Environment Admission
is Founder-accepted and closed with frozen controlled non-pristine host,
isolated network, standalone GPU and cleanup evidence. It does not satisfy the
separate clean Windows requirement. Historical Stage 2 package reconciliation
remains Founder-accepted, closed and immutable with frozen evidence, but
post-freeze product-source corrections mean its candidate no longer qualifies
the current source revision. Sprint 30.5 Stage 2 Requalification R1 is
Founder-accepted and formally closed for current-source Candidate Freeze and
Package Reconciliation. Its accepted attempt is
`r1-20260728T190335052Z-d2ffe76a` at candidate
`cd3b7ca1a49d53d85a718a24d594267c93531994`. Stage 3 was subsequently
Founder-authorised and attempted on the host admitted with a Founder
provenance exception. Recovered Revision 4 NegativePathAndTrust evidence
passed, but Revision 4 InstallAndStartup failed, Revision 5 remained incomplete
and Revision 6 is abandoned. Sprint 30 remains qualification-incomplete because
Stage 4 execution and Stages 5-7 have not started. Stage 2 Requalification R2 remains the package
historically qualified by Stage 3 R9. Stage 2 Requalification R3 attempt
`r3-20260731T171651908Z-9a8a2532` qualifies the corrected Migration 011/012
baseline, is Founder-accepted and formally closed. Stage 3 R1 and failed R2-R8
remain immutable historical records.
Stage 3 R9 attempt `stage3-r9-20260730T221251043Z-71af9db7` passed all
fourteen governed lifecycle phases, was Founder-accepted and is formally
closed. Any further Stage 3 execution is unauthorised. Its final evidence manifest SHA-256 is
`19a8248a06b37d5fac73b42d35ac96049d3ede09249360b064d9dd692d07defe` and
its qualification archive SHA-256 is
`5eadd80469edcafbe62cd461404c9a2bd782eb1393e542b78969784925e2f41e`.
Stage 4 R1 subsequently passed, was Founder-accepted and is formally closed.

## Sprint 30.5 Stage 2 Requalification R4

R4 attempt `r4-20260803T115002258Z-31ab0bf6` passed against the installed-
runtime-configuration product baseline at commit
`f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree
`5d7eca4c012874df0b839533dfab283b54778661`. The Founder accepted the
immutable evidence and R4 is formally closed. R1-R3, Stage 3 R9 and Stage 4 R1
remain immutable; downstream execution remains separately authorised.
## Stage 3 Requalification R10 Preparation

Stage 3 R9 remains Founder-accepted, formally closed and immutable for the historical Stage 2 R2 candidate. Stage 3 Requalification R10 is the current preparation revision and is bound exclusively to the accepted Stage 2 R4 candidate commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree `5d7eca4c012874df0b839533dfab283b54778661`, and MSIX SHA-256 `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`.

R10 preparation defines the complete clean-Windows lifecycle, including the ADR-048 attempt-scoped installed runtime-configuration boundary. Preparation creates no transfer, execution, certificate-trust, installation, Stage 4, Stage 5, production or release authority. A separate Founder decision is required for transfer construction; execution requires a later separate Founder decision after transfer and admission review. Stage 5 remains blocked pending accepted downstream requalification.

## Sprint 30.5 Stage 2 Requalification R5

R5 is the current prepared revision for corrected commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`, and package version `0.1.3.0`. Its governed one-attempt execution is Founder-authorised but not yet consumed. R4 remains immutable accepted history. Stage 3 R10 remains R4-bound and barred; downstream qualification requires an accepted R5 result and a newly bound revision.

## Stage 2 R5 Terminal Result and R6 Preparation

R5 attempt `r5-20260803T170318060Z-658ee6f0` stopped non-zero on a stale harness-only manifest-version assertion after package construction and signing. Exact certificate teardown and zero-residue reconciliation passed. Its consumed authority and artifact root are immutable.

R6 is prepared for the unchanged corrected product candidate with unique package version `0.1.4.0`, exact R5 failure bindings and regression coverage that requires the current manifest version and prohibits the stale assertion. One R6 attempt is Founder-authorised. Stage 3 R10 remains R4-bound and barred.

## Stage 2 Requalification R6 Acceptance and Closure

R6 attempt `r6-20260803T171057940Z-5e914d18` passed and is Founder-accepted and formally closed for corrected commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`, and MSIX SHA-256 `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`. Independent reconciliation verified exact evidence and zero residue.

R5 remains immutable failed history. Stage 3 R10 remains R4-bound and barred. A newly R6-bound clean-host revision may now be prepared under the continuing Founder mission. Stage 5 and production remain blocked.

## Stage 3 Requalification R11 Preparation

R11 is the current clean-host preparation revision for accepted Stage 2 R6 MSIX SHA-256 `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`. Stage 3 R9 remains accepted immutable history; R10 remains barred with two immutable rejected transfers. R11 execution is blocked until create-only transfer verification, fresh host continuity and elevated pre-authority admission all pass.

The continuing Founder mission authorises these gates sequentially; it does not authorise R10, namespace reuse, production or release.

## Stage 3 Requalification R12 Engineering Correction

R11 is immutable failed qualification evidence. R12 engineering correction and non-qualification validation are complete without transfer or qualification authority. R9 remains the accepted passing Stage 3 history; any R12 qualification requires a new explicit Founder mission.

## Stage 3 Requalification R12 Authorised Mission

The Founder accepted the completed R12 engineering baseline and authorised one governed Stage 3 R12 qualification mission. Transfer and execution are sequentially authorised; the single authority may be created and consumed only after independent transfer verification, fresh host continuity and elevated pre-authority admission pass. Stage 4, production, publication and deployment remain not authorised.

## Stage 3 Requalification R12 Pre-Authority Failure and Replacement

The first R12 package is closed as immutable pre-authority engineering failure `transfer-stage3-r12-20260803T190836740Z-2b8363bb`; its transfer, custody, failed continuity and expired identities remain unchanged and barred from reuse. The manifest-authoritative payload correction and one independently verified fresh replacement transfer are authorised. Stage 3 execution is blocked and unauthorised; no qualification authority or attempt may be created.

## Stage 3 Requalification R12 Replacement Transfer Complete

Corrected commit `68a304d6caad3caaf84d3a6b4f63802ab4b6fe83` and replacement transfer `transfer-stage3-r12-20260803T201110346Z-3cf28c94` are complete and independently verified. The first R12 failure package and failed continuity remain immutable and unchanged. Stage 3 execution is blocked and unauthorised; no qualification authority or attempt exists.

## Stage 3 Requalification R12 Execution-Enabled Mission

The replacement-only transfer is preserved as immutable execution-barred history. A fresh execution-enabled baseline, new create-only transfer and one governed R12 attempt are Founder-authorised in sequence. Authority creation remains barred until complete transfer, continuity, elevated pre-authority, zero-state, security, trust and return-root admission passes.

## Stage 3 R12 Execution Transfer Handoff

Execution-enabled transfer transfer-stage3-r12-20260803T203230543Z-6c8c1069 is independently verified. Physical attachment to exact host Founder-QA-01 is required before fresh continuity and elevated admission. No authority or attempt exists.

## Stage 3 Requalification R12 Qualification Closure

Attempt `stage3-r12-20260803T204415402Z-b886be44` passed all fourteen phases on
`Founder-QA-01`. The return package passed independent archive, manifest,
expanded-tree and repository-copy reconciliation, and final governed residue
is zero. R12 is formally closed for Stage 2 R6. Stage 4 remains outside this
closure and requires a separate Founder-level programme-state decision.

## Stage 2 R8 qualification acceptance and closure - 6 August 2026

Stage 2 R8 attempt `stage2-r8-20260806T134157536Z-a0bf3986` passed on clean qualification host `Founder-QA-01` under consumed authority `authority-stage2-r8-20260806T134157536Z-a0bf3986`. Independent source-workstation reconciliation verified the exact transfer and lineage, all four final-manifest records, all nine canonical compact evidence records, the complete 2,038-file returned attempt, valid package and detached-manifest signatures, zero runtime canaries and zero final residue.

The Founder accepted R8 for candidate `4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d`, tree `1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a`, package version `0.1.6.0`, SHA-256 `97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490`. R8 is formally closed and is the current Stage 2 qualification baseline.

Accepted R6/R12/R4 evidence remains unchanged and authoritative history for the prior R6 MSIX only. It does not qualify the R8 package. Stage 3, Stage 4, Stage 5, production, publication and deployment remain unauthorised. The next Founder-level mission is a separate Stage 3 programme-state and qualification-impact assessment against R8.

## Stage 3 R8-baseline qualification-impact assessment - 6 August 2026

The Founder-authorised assessment is complete. R12 remains accepted immutable
history for the R6 package but cannot qualify R8's changed package, version and
signer. Stage 3 is incomplete for R8; the recommended next mission is bounded
Stage 3 R13 engineering preparation with no execution authority. Stage 4 and
Stage 5 remain blocked for the current baseline.

## Stage 3 R13 engineering preparation complete - 6 August 2026

The R13 preparation is complete against accepted Stage 2 R8 package SHA-256 97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490. It reuses the accepted R12 fourteen-phase lifecycle and post-reset correction while restoring the R8 clean-host split.

Exact immutable bindings, 35 PowerShell parses, 15 policy and compatibility tests, all fourteen lifecycle phases, fourteen injected failures, optional-member audit and the elevated R8 post-reset integration passed. Managed LocalState was recreated through ApplicationDataManager without unconfigured activation; final package, trust and work residue was zero.

No transfer, authority, attempt or qualification evidence was created. Stage 3 remains unqualified for R8, and Stage 4 and later work remain blocked. The next Founder-level decision is whether to accept R13 preparation and authorise exactly one governed R13 mission.

## Stage 3 R13 exactly-one execution mission authorised - 6 August 2026

Mission mission-stage3-r13-20260806T160537355Z-aed09e3b authorises exactly one fresh create-only R13 transfer, one authority and one attempt against accepted R8. Authority and attempt creation remain barred until independent transfer verification, clean-host admission, fresh continuity and every elevated pre-authority gate pass.

No retry is authorised after a consumed authority or permanent failed attempt. Stage 4 and later work remain unauthorised.

## Stage 3 R13 Founder-accepted and formally closed - 6 August 2026

The Founder accepted Stage 3 Requalification R13 as the current Stage 3 baseline for the accepted R8 package. Independent source-workstation verification passed for attempt `stage3-r13-20260806T162253957Z-b0cb2a17`; its sole authority `authority-stage3-r13-20260806T162253957Z-b0cb2a17` is consumed and no retry is authorised.

The returned archive SHA-256 is `4e7fb5b75b036e7edf78438117950f4be78c74ad26bc0d102e77dc6658da3c7a`; final evidence-manifest SHA-256 is `ee12f0307d5c55dc05027c50dcba4860923ff36544c432055417005cee3e19f8`. All 144 frozen inventory entries, 148 attempt files, 154 preserved return files and fourteen lifecycle phases verified exactly. Pre-authority purity, clean-host admission, both runtime observations, reset/repair, post-reset managed LocalState initialization and final zero residue passed.

Canonical evidence is frozen under `docs/sprints/evidence/sprint-30-5/stage-3-r13/`. All historical evidence remains unchanged. Stage 4 is not started and not authorised; the next Founder-level mission is a separate Stage 4 programme-state and qualification-impact assessment against the accepted R8/R13 baseline.

## Stage 4 R8/R13 qualification-impact assessment - 6 August 2026

The Founder-authorised assessment is complete. R4 remains accepted immutable
history for R6/R12 but cannot qualify R8/R13. Its ten-journey acceptance
semantics remain reusable, while its repository and developer-tool-dependent
execution design conflicts with clean `Founder-QA-01`. Stage 4 is incomplete,
Stage 5 remains blocked, and the recommended next mission is bounded,
execution-barred Stage 4 R5 engineering preparation.

## Stage 4 R5 clean-host engineering preparation - 6 August 2026

The bounded R5 preparation is complete for R8/R13. It retains R4's real
provider, ten journeys and twenty phases while keeping `Founder-QA-01` free of
repositories and developer tooling. The provider-only main-PC role, isolated
private link and two exact loopback relays are contractually separated from
package qualification. Validation passed without provider, relay or governed
qualification state. A separate execution-enabled R5 mission is required.
