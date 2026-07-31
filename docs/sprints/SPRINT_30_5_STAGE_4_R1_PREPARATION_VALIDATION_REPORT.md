# Sprint 30.5 Stage 4 R1 — Preparation Validation and Reconciliation Report

**Result:** PASS — ready for Founder execution decision
**Qualification executed:** No
**Authority or attempt created:** No
**Accepted baseline:** Stage 2 Requalification R3 candidate `a7fc67f207d9c95407c70812828fa66bd487285d`, tree `356f6d52f1bf70065692e892af8bf916acc8727a`

## Recovery and disposition

The governed isolation ref `refs/oracle/isolation/stage4-r1-draft-before-stage2-r3` was verified and applied without deletion. Its base was `a7fc67f207d9c95407c70812828fa66bd487285d`. The ref remains available as a reversible provenance checkpoint. The restored package.json script draft was removed because package.json is accepted R3 product source; no draft content entered the product baseline.

## R3 reconciliation

The contract now binds the accepted R3 authority, attempt, candidate, harness, evidence manifest, archive, MSIX, Release Manifest and signer. Eight R3/R9 historical files are rehashed by validation. The corrected Migration 011/012 hashes are recorded as the resolved prerequisite. R1/R2/R3 and Stage 3 evidence roots remain write-denied by harness path policy.

## Material corrections

- Shared repository/tool/image/historical/pre-authority checks replace duplicated admission logic.
- Freshness and current-state revalidation occur before authority consumption.
- Authority and execution modes are explicit; internal live phases cannot be invoked as qualification without an immutable authority record.
- Required journeys are exact, complete, unique and include email verification; nested isolation/rendering assertions fail closed.
- Process evidence records executable, arguments, timestamps, output, status, signal and process error with secret redaction.
- Provider init/config/start are covered by failure preservation and safety teardown.
- Migration inventory is exact rather than a partial subset.
- Supabase CLI exclusions use the locked CLI's actual service names; exactly five contract images are required.
- Docker image/container JSON is parsed according to the governed `--format "{{json .}}"` object shape.
- Because the locked CLI publishes host ports on all interfaces, qualification requires a fresh read-only admission proving no active IPv4 or IPv6 default route before authority. Development rehearsal never claims this qualification admission.
- Runtime provider image IDs/digests, exact service set, published ports, route admission, process ownership and zero residue are mechanically verified.
- Evidence inventory ordering is ordinal/code-point deterministic; publication remains create-only and atomic.

## Executed validation

- Windows PowerShell 5.1 parser: all Stage 4 scripts passed.
- Node syntax: all Stage 4 modules passed.
- PowerShell policy regressions: passed.
- Lifecycle success plus failure injection at every one of 13 phases: passed.
- Full ESLint: passed.
- TypeScript semantic validation: passed.
- Architecture audit: 455 files; no new or unexpected violations.
- Stage 4 preparation validator: passed; eight accepted/historical artifacts rehashed.
- `git diff --check`: passed.
- Live disposable-provider development rehearsal: final run passed all 10 journeys and required operational phases; zero residue proved.

Three earlier non-qualification rehearsal failures were retained under ignored development-artifact paths and drove corrections: obsolete CLI exclusion names/container count, Docker image-inspect object shape and Docker container-inspect object shape. Every failure reported cleanup success and zero residue. No failure was retried as qualification.

## Independent/adversarial review

Review challenged candidate drift, historical writes, phase bypass, duplicate/missing journey acceptance, native-process failures, service-set assumptions, Docker object shapes, published-port exposure, stale preflight, partial mutation, exact-PID cleanup and archive replacement. Corrections above were applied and the complete suite rerun. No remaining material preparation defect is known.

## Deferred execution-time fact

The actual execution host must be deliberately network-isolated before the fresh pre-authority gate. The gate fails closed while any active IPv4 or IPv6 default route exists. This is a Founder-controlled host-state prerequisite, not preparation authority and not qualification evidence.


## Deterministic tool-resolution correction

A Founder-authorised pre-authority gate failed before authority because two Git installations were visible on PATH. The correction removes PATH selection from all reachable Stage 4 external-process paths. Git, Node, npm CLI, Supabase CLI, Docker, PowerShell and taskkill are now bound by exact path, real path, SHA-256, regular-file status, reparse-free ancestry and applicable versions. Regression fixtures prove rejection of the alternate Git path, a wrong hash and a junction/reparse ancestor. The live controller and development validator/rehearsal consume the same bindings.
