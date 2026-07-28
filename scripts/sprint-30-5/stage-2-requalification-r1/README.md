# Sprint 30.5 Stage 2 Requalification R1 Harness

This directory contains preparation infrastructure for the permanently named
`Sprint 30.5 Stage 2 Requalification R1` programme.

The preparation does not authorise or expose an R1 build, package, signing,
certificate-mutation or qualification entry point. Those operations remain
behind the separate Founder pre-execution gate in the approved R1 plan.

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
