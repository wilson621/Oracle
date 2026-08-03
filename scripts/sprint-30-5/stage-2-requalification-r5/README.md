# Sprint 30.5 Stage 2 Requalification R5 Harness

This directory is the versioned preparation infrastructure for Sprint 30.5 Stage 2 Requalification R5.

R5 binds corrected product commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`. A later preparation commit may change only R5 harness and living governance files. Candidate-to-harness changes in governed product or packaging inputs are rejected.

Preparation grants no build, package, signing, certificate-mutation or qualification authority. `invoke-attempt.ps1` is the only Founder-facing operational entry point. It uses Windows PowerShell 5.1 cryptographic entropy to create one matching authority/attempt identity and invokes the internal executor exactly once. The executor requires its parent-bound wrapper protocol and exact token `FOUNDER-AUTHORISED-STAGE-2-R5-SINGLE-ATTEMPT`. No standalone attempt, phase, signing or verification entry point is exposed.

Each authorised attempt uses create-only roots:

- `.artifacts/sprint-30-5/stage-2-requalification-r5/<attempt-id>/`
- `docs/sprints/evidence/sprint-30-5/stage-2-requalification-r5/<attempt-id>/`

Historical Stage 2 R1-R4, Stage 3 and Stage 4 evidence roots are deny-listed. Accepted R2/R3/R4, Stage 3 R9 and Stage 4 R1 archives, manifests and closure records are hash-bound before authority consumption.

The proven exact-certificate model is retained under an R5-only subject: exact-thumbprint selection, noninteractive CertUtil CurrentUser Root trust, strict Authenticode `Valid`, exact signer/raw-byte checks, exact-thumbprint teardown, private-material destruction and mandatory zero residue. The 30-day certificate maximum remains local-test-only. Any future clean-host or installed-authentication requalification must bind a Founder-accepted R5 output through a separate decision.

The wrapper and executor resolve Node, Git, Windows PowerShell, .NET and bsdtar only through exact contract paths that must be regular files without reparse redirection. npm and npx resolve only through the exact contract-versioned npm package beside the approved Node executable; `PATH`, `npm.cmd`, Corepack and `npm_execpath` do not select them.

Before authority consumption and again around the build, the executor rejects ambient runtime variables and production Next environment files. Deterministic non-secret canaries drive the Web build and must be absent from all generated outputs and the unpacked package.

Preparation validation entry points are:

- `node scripts/sprint-30-5/stage-2-requalification-r5/verify-harness-static.mjs`
- `node scripts/sprint-30-5/stage-2-requalification-r5/verify-runtime-configuration-custody.mjs`

After a separate Founder execution decision, invoke only the exact Windows PowerShell 5.1 path with `invoke-attempt.ps1`, the exact authority token, and the committed harness commit/tree. A pass stops at `complete-awaiting-founder-review`; it does not accept or close R5 or authorise downstream qualification or production activity.
