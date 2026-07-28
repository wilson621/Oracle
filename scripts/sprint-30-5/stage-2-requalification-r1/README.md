# Sprint 30.5 Stage 2 Requalification R1 Harness

This directory contains preparation infrastructure for the permanently named
`Sprint 30.5 Stage 2 Requalification R1` programme.

The preparation does not itself authorise an R1 build, package, signing,
certificate mutation or qualification attempt. `execute-attempt.mjs` is the
single ordered execution entry point and refuses to start unless it receives
the exact single-attempt Founder authority token and all immutable attempt
bindings. It exposes no independently runnable execution phases.

`prepare-attempt.mjs` performs repository and identity preflight and creates one
fresh attempt directory containing a create-only attempt record. It never
reuses an existing attempt directory. Its required output is exactly:

`.artifacts/sprint-30-5/stage-2-requalification/<attempt-id>/`

The attempt record carries explicit candidate, harness, machine, package,
certificate, lifecycle, stop-reason, evidence-manifest and final-evidence-hash
fields. Certificate and final-evidence values remain explicitly unbound until
their separately authorised lifecycle operations occur.

Historical Stage 2 and Stage 3 roots are deny-listed and cannot be selected as
R1 output. Historical build and verification scripts remain available only as
process history; the R1 entry points do not invoke them.

`remove-exact-certificate.ps1` is the future bounded teardown primitive. It
requires the exact generated thumbprint, validates its expected subject and
removes only that thumbprint. It must not be run during harness preparation.

Run the authorised static validation only with:

`npm.cmd run sprint-30-5:stage-2:r1:validate`

After a separate Founder single-attempt decision, the complete lifecycle is
entered only through:

`npm.cmd run sprint-30-5:stage-2:r1:execute -- <governed arguments>`

The executor records every phase, stops on the first failure, never retries,
uses exact-thumbprint teardown and publishes evidence only through fresh
attempt-scoped create-only paths.
