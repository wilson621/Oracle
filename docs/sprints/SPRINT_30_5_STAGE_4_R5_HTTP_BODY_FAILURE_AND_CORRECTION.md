# Sprint 30.5 Stage 4 R5 HTTP Body Failure and Correction

## Preserved non-transfer rehearsal failure

The independently verified engineering-rehearsal bundle
`engineering-rehearsal-stage4-r5-20260807T072508258Z-6d842320` remains
unchanged. Its manifest SHA-256 is
`7df20dd55dff35b867a3508f1ce01cf84cf44118df86a9f548b69ff259ba9f21`.
The bundle and its returned records are non-qualification, non-authority,
non-evidence and non-transfer state.

Founder-QA-01 passed isolated private-link admission, zero-state admission,
trust establishment, package installation, runtime-configuration creation,
AppX activation with HRESULT zero and PID 7756, and exact installed-server
admission at `http://127.0.0.1:61470`. The first live journey then failed before
an HTTP response with:

`Exception calling "GetRequestStream" with "0" argument(s): "Cannot send a content-body with this verb-type."`

The installed result SHA-256 is
`d13941264eb5d0e199d4e268e3938c4c79df318188026efde3e3dfd3157f182e`;
the qualification-host failure SHA-256 is
`4587ff82317a20698845130dfeec04487f07d7b660ac24f99ac0df367e45b623`;
the returned manifest SHA-256 is
`79a64d537c82f54d4c87b47f9d204840667bab964af755ad7f5d75fb58a60830`;
and the terminal SHA-256 is
`0be6b9838f8a174889a9cbb35bebcf0cd378ca3c9a2a5534f037324cbc79d991`.

Qualification-host cleanup removed package, trust, runtime configuration and
private-link state with zero residue. Provider teardown subsequently passed
with zero containers, volumes, networks, relays, firewall rules or work root;
its SHA-256 is
`4bb1c8bf9097501ff3a82cf65bee84ea6e37a57750fda50006ede1902c458974`.
The main-PC network snapshot was restored and its create-only state record was
removed. No authority or attempt was created.

## Root cause

`Invoke-OracleStage4R5Http` declared its optional request body as
`[AllowNull()][string]$Body = $null` and selected the body path with
`$null -ne $Body`. Windows PowerShell coerces the typed null default to an
empty string. A caller that omitted `-Body` therefore entered
`GetRequestStream()` even for GET. The first anonymous protected-route GET
failed locally before the request reached the installed application.

This was an R5 harness defect. It did not change or invalidate the accepted R8
product, R13 evidence, provider topology, journey contract or qualification
chain.

## Batched correction and validation

Both the preparation and execution journey copies now use
`$PSBoundParameters.ContainsKey("Body")` to distinguish omission from an
explicit body. Methods are normalized before assignment. Explicit bodies on
GET, HEAD and TRACE are rejected fail closed before transport; POST bodies
remain supported. A previously escaped source-line separator in the adjacent
signup boundary was also normalized without changing semantics.

A new non-qualification regression executes the exact helper extracted from
the journey source and proves:

- omitted GET bodies never enter request-body handling;
- explicit bodies on GET, HEAD and TRACE are rejected;
- POST body handling remains admitted; and
- preparation and execution helper definitions remain identical.

The complete execution-baseline verifier passes all 31 PowerShell scripts,
seven Node modules, ten journeys and twenty lifecycle phases. Existing
private-link reconciliation, protected-variable, timestamp, restoration,
transactional lifecycle, success/failure completion, engineering-boundary and
package-application identity regressions also pass. The verifier created no
provider, relay, transfer, authority, attempt or qualification state.

A further physical rehearsal or any governed transfer requires separate
Founder authority. No such state was prepared by this correction.
