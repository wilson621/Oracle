# Sprint 30.5 Stage 3 Requalification R13 Harness

R13 is a bounded engineering-preparation successor to the accepted Stage 3 R12 lifecycle. It binds that lifecycle to the exact accepted Stage 2 R8 candidate and restores the established clean-host qualification architecture.

The candidate is immutable: package version `0.1.6.0`, package SHA-256 `97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490`, and certificate thumbprint `A01F08EB5A07308FEAB3812692516C667D50EA56`. Accepted R8 and R12 evidence remains immutable history.

Founder-QA-01 is a qualification host. The transferred runtime must not depend on a repository or on Git, Node, npm, Supabase CLI, Docker, Python, .NET SDK, or MSBuild. The engineering workstation remains responsible for source control, construction, validation, and any later transfer creation.

The R12 fourteen-phase lifecycle and its bounded post-reset package-data stabilization are retained. After reset, the harness waits for the exact AppX registration, uses `Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily`, verifies the returned `LocalFolder`, and creates the second attempt-bound configuration without manual package-root creation.

Current authority is preparation only. Transfer construction, qualification authority creation, qualification attempts, qualification evidence, Stage 4 work, production, publication, and deployment are not authorised. The harness and transfer builder fail closed on those boundaries.

Non-qualification engineering validation:

```powershell
node scripts/sprint-30-5/stage-3-r13/verify-preparation.mjs
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/sprint-30-5/stage-3-r13/Invoke-OracleStage3R13DevelopmentRehearsal.ps1
```