# Sprint 30.5 Stage 3 Qualification R9 Preparation Validation Report

**Status:** Passed development preparation validation; focused engineering
review and commit remain separate operations

**Classification:** Governed engineering record; not qualification evidence

**Programme:** Sprint 30.5 Stage 3 Qualification R9

## Immutable inputs

R9 remains bound to the accepted Stage 2 R2 candidate:

- attempt `r2-20260728T203503018Z-ec577cf4`;
- commit `11475fe01fff2ec69f0188547107f4e901c531d7`;
- tree `1cec636603031aa8f63c8b331aea5bbcb916567d`;
- evidence archive SHA-256
  `6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f`;
- MSIX SHA-256
  `6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc`;
- Release Manifest SHA-256
  `22d11f7273c2721efe032f5fedd956fdd4a2bfb587c55e7f84fde73dad8726ad`;
- signer thumbprint `119937D4B90068ACE8765695C5A94321A2C40BD8`.

The complete validator rehashed these accepted inputs. No accepted package or
evidence was rewritten.

The failed R8 attempt and authority are immutable:

- `stage3-r8-20260730T210845862Z-ac6b9c67`;
- `authority-stage3-r8-20260730T210845862Z-ac6b9c67`.

The R8 transfer remains bound by manifest SHA-256
`82ef65f23fbcc63113886607dff9b202d38ba6734bbcab27a788e681f0658b4f`
and custody SHA-256
`083a94c5207475b3879a93a62af8423292407beee94997cbd5b809a68102ee89`.

## R8 observation root cause

R8 calculated a nominal deadline before the first observer command completed,
admitted samples only while wall-clock UTC was before that deadline, and then
treated sample count as completion proof. The first valid evidence timestamp
therefore began after the nominal interval began, and the loop could terminate
without a captured valid sample at least 60 complete seconds after the first.
The Founder-supplied immutable result—47 valid samples spanning 59.929
seconds—matches that implementation exactly.

R9 uses `Oracle.Stage3R9ObservationPolicy.ps1`. A monotonic
`System.Diagnostics.Stopwatch` is sampled after each valid native observation.
The first valid sample establishes zero. Sampling continues until a final
valid captured sample proves at least 60,000 elapsed milliseconds. The
measurement is neither rounded nor tolerated, and sample count is not duration
proof.

Focused fixtures reproduce the 59.929-second shortfall, prove that it does not
complete, then admit the next valid sample at exactly 60,000 milliseconds.
They also reject missing samples and backwards time.

## R8 teardown root cause

R8 enumerated an Oracle process and then queried its AppModel package-family
identity through `OpenProcess`. A normal process exit in that interval made
`OpenProcess` fail, but the untyped failure could not be distinguished from
access denial or another live-process verification failure.

R9 introduces a typed AppModel `ProcessOpenException` retaining the native
error. Only `ERROR_INVALID_PARAMETER` (`87`) followed immediately by proof
that the exact PID is absent is classified as
`exited-before-ownership-query`. Access denial, a still-live PID, package
identity mismatch, missing identity and every other error remain fatal.
Successful ownership still requires exact ordinal-ignore-case AppModel
package-family equality before `Stop-Process`. Final zero Oracle-process
residue verification remains mandatory.

The first self-review version treated any OpenProcess error followed by an
absent PID as safe. Adversarial review rejected that design because it could
weaken access-denial handling. The implementation and fixtures were corrected
before this report.

## Preserved regression surface

The complete validator retained and executed the prior correction suites for:

- R6 root cause and direct-activation correction;
- PowerShell 5.1 discovery-array normalization;
- exact AppModel ownership;
- package-inventory percent-decoding and `[Content_Types].xml`;
- Optional-member and StrictMode audit;
- Lifecycle and failure-path audit;
- machine trust, installed-software and Windows executable policies;
- script-scope harness path capture;
- create-only publication, archive and evidence integrity;
- authority separation and historical entry-point retirement.

## Development rehearsal

The rehearsal is explicitly classified:

- `NON-QUALIFICATION`;
- `NON-AUTHORITY`;
- `NON-EVIDENCE`;
- `DEVELOPMENT REHEARSAL`.

It executed the shared R9 lifecycle and policy implementations, including the
complete-duration observation policy and teardown exit-race policy. It
completed one simulated success lifecycle and injected failure before every
lifecycle phase, verifying teardown obligations, attempt preservation and
retry prohibition. Package, trust, installation, launch, repair and removal
remain fixture-backed; real host compatibility is the responsibility of the
read-only Pre-authority host probe before any future authority is created.

## Executed validation

The following completed successfully on 30 July 2026:

- Windows PowerShell 5.1 parser validation for every R9 PowerShell file;
- Node syntax checks for every R9 JavaScript module;
- JSON parsing for the R9 contract, phase audit and host-shape fixtures;
- `npm.cmd run sprint-30-5:stage-3:r9:validate`;
- focused observation-boundary fixtures;
- focused AppModel ownership and teardown-race fixtures;
- optional-member audit with zero unclassified reachable accesses;
- full simulated success lifecycle and per-phase failure injection;
- package reconciliation against the unchanged accepted MSIX;
- focused ESLint for R9 JavaScript modules;
- TypeScript semantic validation with `--noEmit`;
- `npm.cmd run architecture:audit`, scanning 455 TypeScript files with no new
  or unexpected boundary violations;
- `git diff --check`.

PowerShell Script Analyzer was not available as a governed repository
dependency. Parser validation, StrictMode fixtures, the AST optional-member
audit and the complete preparation suite are the compensating checks.

No product build, transfer construction, authority creation, attempt creation,
package installation, certificate operation or qualification execution
occurred.

## Result and boundary

R9 preparation validation passes. The repository changes remain unstaged for
one focused engineering review. Transfer construction and Stage 3 execution
remain blocked and require separate Founder decisions.
