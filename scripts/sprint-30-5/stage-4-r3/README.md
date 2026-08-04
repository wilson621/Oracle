# Stage 4 R3 engineering-preparation harness

This harness qualifies the exact accepted Stage 2 R6 installed MSIX against the
ten Stage 4 R1 live authentication and protected-rendering journeys. It binds the
accepted R6/R12 chain and preserves R1 as immutable historical evidence.

Direct engineering entry points:

- `node scripts/sprint-30-5/stage-4-r3/verify-preparation.mjs`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sprint-30-5/stage-4-r3/Invoke-OracleStage4R3DevelopmentRehearsal.ps1`
- elevated, non-qualification only: `Invoke-OracleStage4R3InstalledDevelopmentRehearsal.ps1 -ResultPath <fresh-path-under-rehearsal-root>`
- future pre-authority only: `Invoke-OracleStage4R3PreAuthorityPreflight.ps1 <bound-arguments>`
- future governed execution only: `Invoke-OracleStage4R3Qualification.ps1 <Founder-bound-arguments>`

The committed contract currently records every execution-authority flag as false.
Validation and development rehearsal cannot create an authority, attempt or
qualification evidence. The installed rehearsal uses the exact R6 MSIX but remains
explicitly NON-QUALIFICATION / NON-AUTHORITY / NON-EVIDENCE and requires complete
package, trust, runtime-configuration and provider teardown.

Every external tool is admitted by exact path, real path, SHA-256, regular-file
state, reparse-free ancestry and applicable version. A future pre-authority gate
also requires Administrator context, zero installed/provider residue and no active
IPv4 or IPv6 default route; it verifies and never changes network configuration.

Execution-enabled overlay: the Founder-authorised contract requires one create-only governed transfer, independent full-inventory verification, fresh elevated/network-isolated pre-authority admission, and at most one consumed authority/attempt. The accepted preparation directory remains unchanged.
