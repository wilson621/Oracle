# Sprint 30.5 Stage 3 Requalification R10 Preparation Validation Report

**Status:** Passed
**Date:** 3 August 2026
**Classification:** Non-qualification preparation evidence

## Scope and immutable bindings

R10 is bound exclusively to accepted Stage 2 R4 attempt `r4-20260803T115002258Z-31ab0bf6`, authority `authority-r4-20260803T115002258Z-31ab0bf6`, product commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree `5d7eca4c012874df0b839533dfab283b54778661`, and harness commit `a31c2897dd063e8e995e558cd83ecd188b8392ff`, tree `ec0dc354553b6be38daaee4cd2383e325bd94837`.

Accepted Stage 2 R4 binding and immutable rehash passed for the accepted evidence index, final evidence manifest, archive, MSIX, Release Manifest, detached signature, SBOM and provenance. The MSIX SHA-256 remained `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`; archive SHA-256 remained `3f1f11dd04ddbc3b4eb51db344f71c12252cc7e41e8ae072950d3a74c1452495`. The accepted product and historical evidence were not modified.

## Executed validation

- All 32 R10 PowerShell files parsed under 64-bit Windows PowerShell 5.1.26100.8875.
- All R10 Node `.mjs` files passed `node --check`.
- `npm.cmd run sprint-30-5:stage-3:r10:validate` passed. It covered exact R4 bindings, create-only paths, reparse rejection, process envelopes, authority/attempt/transfer identities, certificate margin, all R2-R9 regression policies, canonical package inventory, historical protection, runtime configuration and living governance.
- `npm.cmd run sprint-30-5:stage-3:r10:rehearse` passed as `NON-QUALIFICATION`, `NON-AUTHORITY`, `NON-EVIDENCE`, `DEVELOPMENT REHEARSAL`. The real shared policies traversed all 14 lifecycle phases, injected one failure at every phase, verified teardown obligations, published and rehashed an isolated create-only rehearsal archive, then removed the rehearsal root.
- `npm.cmd run installed-runtime-config:verify` passed the TypeScript consumer tests and Windows PowerShell 5.1 policy fixtures. The fixtures proved one-time atomic consumption, 12 negative cases, create-only namespace/ACL behavior, binding mismatch rejection, tamper and partial-consumption failure, secret-free admission records and zero residue.
- Focused ESLint for all R10 `.mjs` files passed.
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run architecture:audit` scanned 462 TypeScript files with no new or unexpected dependency-boundary violations.
- The read-only development-machine compatibility probe passed under Windows PowerShell Desktop 5.1 x64: 11 required command surfaces, deterministic `certutil.exe` and `reagentc.exe`, direct activation API availability, untrusted MSIX signer exposure, exact detached signer thumbprint, registry and TCP object shapes, and `Compress-Archive -LiteralPath`. It explicitly inferred no host admission.
- `git diff --check` passed.

PowerShell Script Analyzer was not installed and was not claimed as executed. Parser validation, the 1,098-member StrictMode audit, policy fixtures, full rehearsal and focused ESLint are the compensating gates.

## Optional-member and StrictMode audit

The machine-readable audit parsed every reachable operational PowerShell source, classified 1,098 member accesses and reported zero unclassified accesses. The ADR-048 installed runtime-configuration policy and its policy-owned result shapes are included. Missing optional registry `DisplayName`, absent required JSON members, null/scalar/array divergence and process-query failures remain fail closed according to their policy contracts.

## Lifecycle and failure-path audit

The phase audit defines preconditions, expected host state, files read/created, registry/package/certificate operations, external commands, success, failure, teardown, evidence, retry rule and next transition for all 14 phases. Lifecycle tests reject skips and repeats. Runtime-configuration removal and final zero runtime-configuration residue are explicit teardown obligations after package installation.

The ADR-048 installed runtime-configuration lifecycle creates a restrictive, attempt-scoped LocalState file before both initial and post-reset activation, carries only path and SHA-256 through direct activation, proves atomic consumption, removes the empty namespace, and removes exact residual state during failure teardown. Secret values do not enter package bytes, command evidence, logs or archives. Stage 3 proves boundary admission/consumption and clean-host package operation; it makes no provider-connectivity or authentication claim. Installed-authentication requalification remains mandatory before Stage 5.

## Regression preservation

The suite preserved script-scope path capture, `powershell.exe -File`, ordinal-ignore-case host identity with raw evidence casing, deterministic Windows executable resolution, encoded MSIX names, canonical logical paths, exact `[Content_Types].xml`, duplicate/traversal/hash/size rejection, direct AppX activation, discovery-array normalization, AppModel ownership, complete 60,000 ms monotonic observation, safe process-exit race classification, exact machine trust, repair/reset, evidence freeze and zero residue.

## Adversarial review findings and corrections

1. The copied package-inventory check compared its R4 `harnessCommit` to the candidate commit. It now compares the explicit accepted R4 harness commit.
2. Runtime-configuration cleanup was implemented in the harness but absent from shared lifecycle obligations, optional-member audit and complete rehearsal. All three now cover it.
3. A multi-line runtime-policy self-hash expression did not parse in Windows PowerShell 5.1. It was reduced to an unambiguous expression and parser-tested.
4. The development rehearsal exceeded the legacy Win32 path limit. Its isolated root is now short and unique; the full rehearsal passes without changing production paths.
5. The copied historical-root list included the current R10 output and evidence roots, which would have rejected an authorised create-only transfer. Current R10 roots were removed from historical protection; R1-R9 remain protected, and regression tests prove both conditions.
6. Inherited R8 correction/custody wording and current R9 operational package aliases could misidentify the active revision. R10 custody language is revision-correct, historical R9 return verification remains available, and current operational aliases point only to R10.
7. The provider proof boundary was implicit. Contract, preflight and plan now state that Stage 3 does not claim provider connectivity or authentication and cannot satisfy the later installed-authentication requalification.
8. The PowerShell entropy failure fixture exposed array-wrapping behavior in its injected test seam. It now converts the provider result directly to `byte[]`; production remains `RandomNumberGenerator.Create().GetBytes`, and entropy failure/all-zero outputs are rejected.

A second complete validation pass after these corrections succeeded. No credible unresolved deterministic harness defect was identified.

## Pre-authority host probe and limitations

Package installation, machine trust, real registered activation, repair/reset and removal were not performed on this development machine. Performing them would mutate machine trust/package state and was unnecessary for preparation. The transferred elevated pre-authority probe must revalidate Windows PowerShell 5.1 x64, elevation, command/cmdlet shape, host continuity, certificate margin, package/certificate/process absence, runtime-variable absence and return-root eligibility on Founder-QA-01 before any authority or attempt can exist.

No qualification, authority, attempt, transfer, certificate-store mutation, package installation or qualification evidence was created by preparation. Transfer construction and execution each require separate Founder decisions.

## Governance-contradiction recovery

A later read-only Founder-QA-01 admission exposed one deterministic contradiction: the transfer manifest carried the governing identity `Sprint 30.5 Stage 3 Requalification R10`, while the pre-authority script required `Sprint 30.5 Stage 3 Qualification R10`. The canonical identity was independently resolved from the plan, contract revision lineage, phase audit, README and programme index as the Requalification form. No alias or dual-name acceptance was introduced.

The correction makes the contract identity authoritative for transfer manifest, custody, continuity, preflight, authority, lifecycle, completion/failure, evidence-manifest, archive-manifest and returned-evidence verification. Both rejected R10 transfer identities are contract-prohibited. Exact-case, spacing, punctuation, stage, revision and Qualification/Requalification variants fail regression validation.

Post-correction validation executed JSON parsing, Node syntax, all Windows PowerShell 5.1 parsers, the 1,136-access optional-member audit with zero unclassified accesses, full R10 preparation validation, all 14 rehearsal success/failure paths, installed-runtime-configuration tests, full ESLint, TypeScript semantic checking, the 462-file architecture audit and `git diff --check`. Accepted Stage 2 R4 artifact rehashes remained exact. External rejected-transfer byte rehash and replacement-medium admission remain mandatory immediately before replacement construction; neither external record is modified by repository validation.

Adversarial review found and corrected two test-path defects during this recovery: the initial rejected-transfer lookup used direct pipeline-member access under StrictMode, and the first full quality-gate pass found one trailing-whitespace line. Mandatory-property expansion replaced the direct access, the optional-member audit returned zero unclassified accesses, whitespace was removed, and the complete relevant suite was rerun.
