# Sprint 30.5 Stage 3 Requalification R12 Engineering Correction

**Status:** Engineering complete — NON-QUALIFICATION
**Programme:** `Sprint 30.5 Stage 3 Requalification R12`

## Evidence-led finding

R11 failed closed because its second runtime configuration was created
immediately after `Reset-AppxPackage`, while the installed package-data root was
absent. Real Windows integration testing established that reset is asynchronous:
the package registration is temporarily absent, then returns, and Windows may
recreate the package root during that stabilization interval.

The defect was therefore broader than the original package-root assumption. The
harness also assumed package registration was immediately stable and continued
to read identity values from a live AppX object after reset.

## Correction

R12 snapshots the exact package family and full names before reset. After reset,
it polls for the one exact registration for at most 120 polls at 250 milliseconds.
An unexpected or duplicate registration fails immediately; absence after the
bound fails closed. Only after registration stabilizes does R12 invoke
`Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily` and
require the returned `LocalFolder` to equal the exact expected `LocalState`.

The package root may be absent or may already have been recreated before the API
call. Its observed state is recorded. Manual package-root creation and
unconfigured product activation remain forbidden.

## Regression protection

- zero-registration timeout is rejected;
- mismatched and duplicate registrations are rejected immediately;
- delayed exact registration is accepted only within the bound;
- API failure and unexpected `LocalFolder` are rejected;
- exact `LocalState` recreation and teardown are required;
- AppX identity values used after reset are immutable snapshots;
- transfer construction and qualification execution remain contract-gated and
  absent from `package.json`.

## Immutable history

R11 evidence, authority, failure, continuity and closure records remain unchanged.
R12 creates no transfer, authority, attempt or qualification evidence.
