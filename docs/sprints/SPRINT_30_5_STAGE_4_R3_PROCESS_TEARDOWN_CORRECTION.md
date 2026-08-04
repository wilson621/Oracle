# Sprint 30.5 Stage 4 R3 Process-Teardown Correction

**Classification:** Evidence-led non-qualification engineering
**Status:** Implemented and validated
**Qualification authority:** None
**Last Reviewed:** 4 August 2026

## Root cause

Stop-PackageProcesses first captured and ownership-verified the installed package
processes. It then called Stop-Process with ErrorAction Stop. PID 1324 exited
naturally between those operations, so Stop-Process raised a not-found error. The
controller treated every stop exception as cleanup failure even though package,
trust, runtime configuration and provider residue were zero.

## Correction

The stop operation is now governed by a separate process-teardown policy. Ownership
must be verified before any stop request. If the stop request fails, the current PID
state is queried:

- absence is accepted only as already-exited-after-verified-observation;
- one surviving PID is ownership-verified again and the stop failure remains fatal;
- a reused non-package PID is rejected;
- multiple current identities are rejected as ambiguous;
- an initially unowned process never reaches the stop action.

No exception-message matching, blind retry, arbitrary process kill, or weakened
ownership rule is used. The controller records observed, stop-requested and
already-exited counts, then independently waits for zero package-owned processes.

The corrected contract is engineering-correction-qualification-barred. Founder
execution, transfer preparation, authority creation and attempt execution are false;
the maximum attempt count is zero.
