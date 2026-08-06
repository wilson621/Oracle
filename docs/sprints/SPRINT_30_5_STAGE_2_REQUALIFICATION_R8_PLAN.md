# Sprint 30.5 Stage 2 Requalification R8 Plan

Status: ENGINEERING PREPARATION COMPLETE - TRANSFER AND QUALIFICATION BARRED
Date: 6 August 2026

## Purpose

R8 restores the established split-host Stage 2 architecture after the Founder rejected the R7 main-PC qualification model. It binds corrected product candidate `4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d`, tree `1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a`, while preserving all accepted and failed historical evidence unchanged.

## Permanent host boundary

- Engineering workstation `DESKTOP-M3H22E4`: repository, developer toolchain, source validation, build, local-test signing, release verification, private-material destruction, immutable candidate freeze, future transfer creation and independent transfer verification.
- Qualification host `Founder-QA-01`: clean Windows qualification only. It requires no repository, Git, Node, npm, Supabase CLI or Docker. A future admitted transfer runs with Windows PowerShell 5.1 and built-in Windows APIs/services.

## Ordered future lifecycle

1. Founder accepts the exact engineering freeze and grants a separate execution mission.
2. The engineering workstation creates one fresh create-only transfer from the exact freeze and independently verifies it.
3. The Founder physically moves the transfer to Founder-QA-01 and copies it to a fresh local create-only root.
4. The laptop verifies exact manifest, custody, verification and payload inventory; then passes host admission, continuity and pre-authority zero state.
5. Only after every gate passes may one authority and one attempt be created and consumed.
6. The clean host verifies pre-trust rejection, package and detached signatures, exact package identity and absence of runtime-configuration canaries; exact temporary trust is removed in `finally`.
7. Evidence returns create-only. A permanent failure is not retryable. A pass stops awaiting Founder review.

## Current authority boundary

This preparation authorises no transfer, authority, attempt or qualification execution. The contract and both future entry points fail closed while those flags remain false. Stages 3-5 and production activity remain unauthorised.
