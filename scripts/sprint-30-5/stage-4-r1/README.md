# Stage 4 R1 preparation harness

R3-bound Stage 4 preparation: contract, disposable topology, lifecycle/journey/shared-preflight policies, governed executor, fixtures, non-qualification rehearsals and validator.

No package.json command is added because package.json is accepted R3 product source. Direct entry points:

- `node scripts/sprint-30-5/stage-4-r1/verify-preparation.mjs`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sprint-30-5/stage-4-r1/Invoke-OracleStage4R1DevelopmentRehearsal.ps1`
- `node scripts/sprint-30-5/stage-4-r1/run-live-development-rehearsal.mjs`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sprint-30-5/stage-4-r1/Invoke-OracleStage4R1PreAuthorityPreflight.ps1 <bound arguments>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sprint-30-5/stage-4-r1/Invoke-OracleStage4R1Qualification.ps1 <Founder-bound arguments>`

Validation/rehearsal cannot mint authority. The live rehearsal uses isolated create-only paths and the real provider controller, then requires zero residue. Preflight is read-only except its non-evidence record. The executor requires exact Founder authority and fresh bound preflight. The accepted R3 MSIX and historical evidence are rehashed; no package install or certificate trust occurs.
