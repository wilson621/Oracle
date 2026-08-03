# Sprint 30.5 Stage 3 Requalification R11 Harness

This versioned harness requalifies only the Founder-accepted Stage 2 R6 ADR-048 MSIX. Stage 3 R9 remains accepted, closed and immutable; R1-R8 and all failed records remain historical.

R11 preserves the proven R9 direct AppX activation, LocalMachine TrustedPeople CertUtil trust, canonical package reconciliation, native window discovery/observation, AppModel ownership, 60-second monotonic evidence interval, process exit-race classification, create-only evidence, bounded teardown and zero-residue controls.

R11 additionally transfers and uses `Oracle.Stage3R11InstalledRuntimeConfigurationPolicy.ps1`. Before each initial and post-reset activation it creates one exact attempt-bound LocalState configuration with cryptographically generated transient values, restricted ACLs, a 15-minute validity window, exact candidate/package identities and a loopback origin. Activation carries only path and SHA-256. Consumption and namespace removal are affirmed; secrets never enter governed evidence.

Preparation validation:

```powershell
npm.cmd run sprint-30-5:stage-3:r11:validate
npm.cmd run sprint-30-5:stage-3:r11:rehearse
```

The continuing Founder mission authorises transfer construction after preparation passes and execution only after transfer verification, fresh continuity and pre-authority admission pass. No `stage-3:r11:execute` package script exists. Historical tooling and all R1-R9 paths are non-current and must not be reused.
