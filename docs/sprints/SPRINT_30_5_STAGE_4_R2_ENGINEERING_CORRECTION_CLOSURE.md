# Sprint 30.5 Stage 4 R2 Engineering Correction Closure

**Status:** Engineering mission complete
**Correction baseline:** `8fc782df9869bc3c0e85a0d6d01ee7ef0d866175`
**Correction tree:** `911684539ef85f88e2092daacb896795097e0dd8`
**Qualification authority:** None
**Qualification execution:** Prohibited
**Last Reviewed:** 4 August 2026

The evidence-led investigation into the permanent R2 failure is complete. The
failure was caused by conflicting directory ownership: the qualification harness
created a create-only transfer-admission record under `logs/`, while the live
controller attempted exclusive creation of the same directory. The correction
makes `logs/` launcher-owned and shared through create-only files, and preserves
exclusive ephemeral `provider/` ownership for the live controller.

Exact mode-bound inventories now fail closed before provider mutation. Qualification
admits only `lifecycle/`, `logs/` and `logs/transfer-admission.json`; development
rehearsal admits only an empty caller-owned `logs/`. Missing, file-backed, linked and
unexpected layouts and an existing provider root are adversarially rejected.

The accepted R2 failure is indexed and reverified from nineteen immutable records.
The consumed authority, nine-file attempt, failed lifecycle, passed safety teardown,
absence of final qualification products and retry prohibition are cryptographically
bound. Historical Stage 2, Stage 3, Stage 4 R1 and Stage 4 R2 evidence remains
unchanged.

Validation passed for all syntax, policy, activation, installed-runtime,
architecture, lint, lifecycle and adversarial suites. A full source-equivalent live
rehearsal and an elevated exact-R6 installed rehearsal each passed all ten journeys
and proved zero residue. The final manifest-bound validator rehashed 16 historical
bindings and 29 execution files.

The corrected R2 contract is qualification-barred. Transfer preparation, authority
creation and qualification execution are false; maximum remaining R2 attempts is
zero. This mission created no transfer, authority, attempt or qualification evidence.

Stage 4 remains incomplete for the accepted R6/R12 baseline and Stage 5 remains
blocked. The recommended next Founder-level mission is to accept correction baseline
`8fc782df9869bc3c0e85a0d6d01ee7ef0d866175` and authorise a fresh Stage 4
Requalification R3 execution-enabled baseline, create-only transfer and one governed
attempt. R3 must use new identities and namespaces, rehash all accepted history, and
create authority only after every fresh pre-authority gate passes. No R2 identity,
transfer, authority or attempt may be reused.