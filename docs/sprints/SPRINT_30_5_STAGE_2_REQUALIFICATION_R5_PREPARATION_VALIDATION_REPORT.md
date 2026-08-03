# Sprint 30.5 Stage 2 Requalification R5 Preparation Validation Report

Status: **PASS — PREPARATION ONLY; QUALIFICATION NOT YET EXECUTED**

## Executed validation

All commands ran on 3 August 2026 in the authoritative `sprint-9-overlay` checkout:

- Node `--check` passed for every R5 `.mjs` module.
- Windows PowerShell 5.1 parser validation passed for every R5 `.ps1` file.
- `verify-execution-identity.ps1` passed deterministic, entropy-failure, null, wrong-length, all-zero and uniqueness cases without creating authority or attempt state.
- `verify-runtime-configuration-custody.mjs` passed 12 ambient-file, case-insensitive environment, deterministic-canary and leakage fixtures.
- `verify-harness-static.mjs` passed all inherited authority, identity, lifecycle, signing, trust, teardown, publication and historical-protection fixtures plus the exact R5 correction bindings.
- `npm run lint` and TypeScript `--noEmit --incremental false` passed.
- `npm run architecture:audit` scanned 463 TypeScript files with no new or unexpected violation.
- `npm run installed-runtime-config:verify` passed 12 negative consumer cases, the strict runtime/SystemRoot child-environment allowlist, create-only ACL-bound custody, tamper/partial-consumption rejection and zero residue.
- `npm run build`, `npm run desktop:compile` and `npm run native:build` passed.
- `npm run installed-runtime-config:rehearse` passed using the real standalone server and loopback provider fixture, classified `NON-QUALIFICATION`, `NON-AUTHORITY`, `NON-EVIDENCE`, `DEVELOPMENT REHEARSAL`; no privileged value appeared in HTML or process output.
- `git diff --check`, candidate-tree verification and governed product-path immutability are required again on the committed preparation snapshot.

## Adversarial review

R5 uses a unique revision, package version, signer subject, authority/attempt pattern, output namespace and archive name. Accepted R4 roots are deny-listed and its archive, manifest, final-hash record and closure are hash-bound. The correction module is now an explicit product binding. Direct executor invocation fails closed; only the governed wrapper can consume the single-attempt authority.

The first R5 static run rejected stale cloned R4 candidate fixtures. Those two fixture constants were corrected to the exact R5 candidate commit and tree, after which the complete inherited suite passed. No qualification behavior was weakened.

## Limitations

Real R5 MSIX construction, signing, certificate-store mutation, signature verification, teardown, archive construction and repository evidence publication have not run during preparation. They are reserved for the authorised governed attempt. No R5 authority, attempt, certificate, package, archive or qualification evidence exists at this point.
