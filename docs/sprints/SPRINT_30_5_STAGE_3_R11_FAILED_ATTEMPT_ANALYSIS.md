# Sprint 30.5 Stage 3 Requalification R11 Failed Attempt Analysis

Status: **IMMUTABLE FAILED QUALIFICATION — ENGINEERING INVESTIGATION AUTHORISED; NO RETRY AUTHORISED**

## Attempt identity

- programme: `Sprint 30.5 Stage 3 Requalification R11`
- Founder grant: `founder-stage3-r11-grant-20260803T175715661Z-84bf486c`
- authority: `authority-stage3-r11-20260803T175715661Z-84bf486c` (consumed)
- attempt: `stage3-r11-20260803T175715661Z-84bf486c` (failed)
- transfer: `transfer-stage3-r11-20260803T173458659Z-a1a8ad21`
- preparation commit: `632a063a887961ffed88a853a1595c62224ef32b`
- preparation tree: `3c1f0c4c3760941310baa40df27392629a020268`

## Terminal result

R11 stopped non-zero after completing eight of fourteen lifecycle phases. The
transfer and host were admitted, untrusted and tampered packages were rejected,
temporary trust and installation succeeded, direct activation returned S_OK,
and the native Oracle window passed 55 valid samples over 60.448 seconds. The
first runtime configuration was atomically consumed and its namespace removed.

After exact process stop, `Reset-AppxPackage` deleted the package app-data tree.
R11 then attempted to create its second runtime configuration beneath
`%LOCALAPPDATA%\Packages\<PFN>\LocalState` before reinitialising that Windows-
managed store. The transferred policy deliberately rejected an absent package
root, producing the mandatory failure `Installed runtime configuration package
root is absent.`

The authority is consumed, the attempt is permanently closed, and the attempt
is not retried, repaired, deleted, accepted as passing, or reinterpreted.

## Root cause

The defect is a qualification lifecycle assumption. Microsoft documents that
app reset permanently deletes app data and returns the application to freshly
installed behaviour. R11's isolated fixture created the package root before
testing and explicitly treated every absent root as hostile, so it did not model
the required post-reset transition.

The product runtime itself behaved correctly: it accepted exactly one governed,
hash-bound activation configuration, atomically consumed it, launched the signed
installed executable, and sustained the required native window. Starting the
product without configuration merely to recreate app data would weaken that
fail-closed boundary and is prohibited as a correction.

Windows exposes `Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily`
for development and management utilities to access a registered package's app-
data store. A successor harness may use that API after reset, with exact package
registration and path checks, before creating the second configuration. It must
prove both the absent-root transition and rejection of mismatched or redirected
roots.

## Teardown and residue

Bounded teardown reported no teardown failure and reconciled zero Oracle
packages, governed physical certificates, governed logical certificate views,
Oracle processes, runtime-configuration namespace and package-data root. Five
package-owned processes were ownership-verified and stopped.

The immutable failed-attempt work directory retains one public certificate file,
and the staged R11 transfer retains its 45 files. These are historical evidence
and transfer artefacts, not live trust, package, process or secret residue. They
must not be modified or reused.

## Immutable bindings

- failure record: `2e6cf6fb9d131c66376e247c94d5198db5e6ff4f8e740868b6f85194d004a489`
- authority record: `ffcb0ed83c936bd614c753d6ce76c2ad0867e981dbfe4d3f07048e0133879f6f`
- runtime observation: `33d5be4a89f7e30c4520a4f9381eb74627faf381948ac1a83c30012bae1e2afe`
- host continuity: `d8fd0187aaefb98cf6c5a7addbfbe26635376ce80a11a211035417baa30e30b0`
- preserved attempt files: `77`
- preserved attempt bytes: `123519`

## Corrective consequence

R11 remains unchanged. Correction requires a new R12 harness revision that binds
this failed history, models Windows' post-reset package-data lifecycle, performs
supported package-data initialisation without unconfigured product activation,
adds adversarial regressions, and passes all non-qualification preparation gates.

Engineering completion does not authorise transfer construction, authority
creation, an attempt, or qualification execution. Any future qualification
requires a separate explicit Founder mission.
