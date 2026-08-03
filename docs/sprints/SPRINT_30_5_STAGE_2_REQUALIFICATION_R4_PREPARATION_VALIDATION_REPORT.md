# Sprint 30.5 Stage 2 Requalification R4 Preparation Validation Report

Status: **PASS — PREPARATION ONLY; EXECUTION NOT AUTHORISED**

## Executed validation

All commands ran on 3 August 2026 in the authoritative `sprint-9-overlay` checkout:

- Node `--check` passed for every R4 `.mjs` module.
- Windows PowerShell 5.1 parser validation passed for every R4 `.ps1` file.
- `verify-execution-identity.ps1` passed entropy failure, null, wrong-length, all-zero, uniqueness and deterministic fixture cases without creating an authority or attempt.
- `verify-runtime-configuration-custody.mjs` passed 12 ambient-file, case-insensitive environment, deterministic-canary and leakage fixtures.
- `verify-harness-static.mjs` passed all inherited authority, identity, npm/npx, lifecycle, signing, trust, teardown, evidence, historical-protection and publication fixtures plus R4 bindings.
- full `npm run lint`, TypeScript `--noEmit --incremental false`, and `npm run architecture:audit` passed; the architecture audit scanned 462 TypeScript files with no new violations.
- `npm run installed-runtime-config:verify` passed the real Node consumer and Windows PowerShell 5.1 custody policy: 12 negative consumer cases, create-only ACL-bound custody, deterministic activation arguments, tamper/partial-consumption rejection and zero residue.
- deterministic production `npm run build`, `npm run desktop:compile` and `npm run native:build` passed.
- post-build canary scans passed across 2,006 `.next` files, 420 Electron files and 2 native executables.
- `npm run installed-runtime-config:rehearse` passed using the real standalone server and loopback provider fixture, explicitly classified `NON-QUALIFICATION`, `NON-AUTHORITY`, `NON-EVIDENCE`, `DEVELOPMENT REHEARSAL`.
- `git diff --check`, exact candidate-tree verification and governed product-path immutability passed.

## Adversarial review and corrections

The first review found two material issues: stale `0.1.1` SBOM/provenance filenames in the R4 clone and a TOCTOU gap because ignored ambient files were checked only before authority consumption. Artifact names now use `0.1.2`; ambient configuration is checked pre-authority, immediately pre-build and post-build, and static validation requires all three checks. A locale-sensitive evidence sort was also replaced with explicit ordinal comparison. Independent wrapper review then found inherited PATH-based Node/Git/PowerShell/.NET/bsdtar selection; R4 now binds exact regular-file, non-reparse paths in the contract and tests rejection of missing, non-file and redirected surfaces. The complete suite passed again after correction.

## Coverage classification and limitations

Static validation proves bindings, lifecycle wiring, fail-closed paths, create-only semantics and prohibited historical access. Fixture validation proves hostile environment casing, prohibited local files, deterministic canaries, successful scans and leakage rejection. The standalone rehearsal exercises the real installed runtime consumer in a temporary non-package process.

The development checkout contains an ignored `.env.local`; the rehearsal build was non-qualification and used deterministic process canaries. R4 correctly refuses a governed attempt while that file is present. It must be privately isolated outside the repository before a future pre-authority gate. Real MSIX construction, signing, certificate-store mutation, strict signature verification, teardown, archive creation and evidence publication were not executed during preparation; those operations require a separate Founder-authorised attempt. Their inherited implementations and failure fixtures passed static validation.

No R4 authority, attempt, certificate, package, qualification archive or repository qualification evidence was created.
