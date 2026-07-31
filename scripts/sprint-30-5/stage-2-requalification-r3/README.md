# Sprint 30.5 Stage 2 Requalification R3 Harness

This directory contains the preparation infrastructure for the permanently
versioned `Sprint 30.5 Stage 2 Requalification R3` programme.

R3 qualifies the exact corrected product candidate commit
`a7fc67f207d9c95407c70812828fa66bd487285d`, tree
`356f6d52f1bf70065692e892af8bf916acc8727a`. A later preparation commit may
contain only R3 harness and governance files. The executor requires the
candidate commit to be an ancestor of the harness commit and mechanically
rejects any candidate-to-harness change in governed product or packaging
inputs.

Preparation does not authorise build, package construction, signing,
certificate mutation or qualification execution. `execute-attempt.mjs` is the
only operational R3 entry point. It cannot run without the exact token
`FOUNDER-AUTHORISED-STAGE-2-R3-SINGLE-ATTEMPT` plus one unique authority ID,
attempt ID and complete immutable binding set. No standalone attempt,
build, package, signing, certificate, freeze or verification phase is exposed.

Each authorised execution uses exactly:

`.artifacts/sprint-30-5/stage-2-requalification-r3/<attempt-id>/`

and publishes repository evidence only to:

`docs/sprints/evidence/sprint-30-5/stage-2-requalification-r3/<attempt-id>/`

Both roots are attempt-scoped, create-only and non-reusable. Historical Stage
2, R1, R2 and Stage 3 evidence roots are deny-listed and selected accepted R2
and Stage 3 records are hash-bound before authority consumption.

The proven R2 local-test certificate model is retained under an R3-specific
subject and namespace: exact-thumbprint selection, noninteractive CertUtil
CurrentUser Root trust, strict Authenticode `Valid`, exact signer and raw-byte
checks, exact-thumbprint teardown, private-material destruction and mandatory
zero residue. The 30-day maximum remains bounded to local-test qualification;
Stage 4 does not consume this signer or MSIX as its runtime qualification input.

Run preparation validation only with:

`node scripts/sprint-30-5/stage-2-requalification-r3/verify-harness-static.mjs`

After a separate Founder single-attempt execution decision, invoke only:

`node scripts/sprint-30-5/stage-2-requalification-r3/execute-attempt.mjs <governed arguments>`

The executor records each ordered phase, stops on the first failure, never
retries, permits only bounded safety teardown after certificate mutation, and
publishes evidence only through fresh create-only destinations. A passing
attempt stops at `complete-awaiting-founder-review`; it does not accept or close
R3 and grants no Stage 4 execution or production authority.
