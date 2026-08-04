# Sprint 30.5 Stage 5 R1 Engineering Preparation Plan

**Authority:** Founder-authorised bounded engineering preparation and
acceptance-contract freeze
**Status:** In progress; qualification barred
**Execution surface:** Exact accepted Stage 2 R6 MSIX
**Accepted chain:** Stage 2 R6 / Stage 3 R12 / Stage 4 R4
**Last Reviewed:** 4 August 2026

## Objective

Prepare Stage 5 Installed Package GPU, Performance and Accessibility
qualification without changing the accepted product or weakening any earlier
qualification. R1 freezes the protocol, implements a non-product measurement
harness, proves positive and adversarial policy behaviour, and rehearses the
exact installed package through the accepted Stage 4 lifecycle.

## Product boundary

The product candidate remains commit
ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff, tree
8455a05780989a9d5f6c6d527f7d427d94526b04, and MSIX SHA-256
492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430.

Stage 5 files live only in scripts/sprint-30-5/stage-5-r1, sprint
documentation and non-evidence .artifacts rehearsal output. No product path,
package byte, package manifest, runtime configuration or dependency may change.
The known post-candidate package.json drift is limited to qualification
convenience scripts and Stage 5 does not extend it.

## Engineering lifecycle

1. Rehash the accepted R6, R12 and R4 evidence indexes and exact MSIX.
2. Freeze the Stage 5 acceptance contract.
3. Validate current product-path drift against the accepted R6 commit.
4. Implement deterministic positive, regression and adversarial evaluators.
5. Rehearse accepted-candidate source accessibility contracts.
6. Run one elevated installed-package development rehearsal on the bound main
   engineering workstation, DESKTOP-M3H22E4, through the accepted Stage 4 R4
   lifecycle. A held observation runs for at least 30 seconds and continues
   until it has at least five complete Windows GPU-counter and UI Automation
   samples. New polls stop by 180 seconds and completion fails closed beyond
   240 seconds. The laptop remains reserved for governed qualification.
7. Independently evaluate the installed rehearsal record and prove zero
   package, process and certificate residue.
8. Freeze a complete preparation inventory, independently validate it, and
   record engineering closure.

## Authority boundary

This revision is permanently qualification-barred. It may create no transfer,
qualification authority, attempt or qualification evidence. All corresponding
flags and maxima are false or zero. The installed rehearsal is classified
NON-QUALIFICATION, NON-AUTHORITY, NON-EVIDENCE, and
INSTALLED DEVELOPMENT REHEARSAL.

A later qualification mission requires separate Founder authority, a separately
bound execution-enabled baseline, fresh identities and all pre-authority gates.
