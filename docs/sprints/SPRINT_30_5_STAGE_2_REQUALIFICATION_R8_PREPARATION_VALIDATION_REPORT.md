# Sprint 30.5 Stage 2 Requalification R8 Preparation Validation Report

Status: PASS - NON-QUALIFICATION
Date: 6 August 2026

## Passed gates

- exact branch, candidate commit/tree and governed product-difference admission;
- historical evidence SHA-256 bindings: 29;
- installed runtime-configuration custody regression: 12 cases;
- TypeScript, lint, accessible-colour contract, architecture audit, production web build, Electron/preload build and native helper builds;
- signed MSIX, signed executable inventory, detached release-manifest signature, SBOM, provenance and package-content reconciliation;
- exact package identity `Oracle.Platform.LocalCertification`, version `0.1.6.0`, x64 and R8 publisher;
- package build-canary absence and forbidden private/certificate material checks;
- private signing-material destruction and exact certificate-store zero residue;
- independent freeze/hash/inventory reconciliation;
- transfer gate and qualification gate both fail closed;
- clean-host source contains no Git, Node, npm, Supabase CLI or Docker dependency;
- scanner fixtures: absent input rejected, UTF-8 chunk-boundary canary detected, UTF-16LE canary detected;
- final non-qualification rehearsal `installed-clean-host-protocol-02.json` passed in 28.4 seconds with package and detached signatures valid and zero residue.

## Preserved engineering failures

Five create-only engineering-freeze roots remain immutable: `candidate-r8-20260806T114901137Z-00000000`, `candidate-r8-20260806T115207039Z-85966fbe`, `candidate-r8-20260806T115353606Z-8d6fcb70`, `candidate-r8-20260806T115859429Z-31a0dc8b`, and `candidate-r8-20260806T120323054Z-c0e9ff8c`. They exposed, respectively, inherited dead attempt code, an engineering output-path mismatch, a stale version/teardown namespace, a malformed signature argument/public-certificate residue classification, and a missing public-certificate inventory entry.

The exact certificate left by the third failed freeze was ownership-verified, removed, and documented in a separate create-only teardown-recovery record. The first clean-host rehearsal timed out in the byte-by-byte scanner; its child and exact trust were ownership-verified and removed, work residue was removed, and `installed-clean-host-protocol-01.json` permanently records the non-qualification timeout. No failure was reused or overwritten.

## State counts

- transfer created: zero
- qualification authority created: zero
- qualification attempt created: zero
- qualification evidence created: zero
- Oracle package residue: zero
- R8 certificate residue: zero
- private signing material: zero
