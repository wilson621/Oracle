# Sprint 30.5 Stage 2 Requalification R8

R8 restores the established split-host qualification architecture for corrected product candidate `4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d` (tree `1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a`).

## Host boundary

- `DESKTOP-M3H22E4` is the engineering workstation. It validates the source, builds and locally signs package version `0.1.6.0`, verifies the release, destroys private signing material, and freezes an immutable candidate before any transfer exists.
- `Founder-QA-01` is the clean qualification host. It must not contain the development repository or require Git, Node, npm, Supabase CLI, or Docker. The authorised transfer carries the frozen release plus a Windows PowerShell 5.1 qualification harness.

## Current authority boundary

The original transfer `transfer-stage2-r8-20260806T123612020Z-338a5276` remains an immutable pre-authority engineering failure and is prohibited from admission or execution.

A separately bound replacement mission authorises exactly one transfer, `transfer-stage2-r8-replacement-20260806T125821770Z-cc9e03ce`, under grant `founder-stage2-r8-replacement-grant-20260806T125821770Z-cc9e03ce`. Authority and attempt creation remain impossible until exact replacement-transfer admission, clean-host admission, continuity and every pre-authority gate pass. Retry and Stage 3 or later work remain unauthorised.
## Engineering entry points

- `node verify-preparation.mjs`
- `node prepare-candidate.mjs --preparation-id <fresh-id> --timestamp-utc <utc> --harness-commit <exact-clean-head>`
- `Invoke-OracleStage2R8EngineeringRehearsal.ps1 -ResultPath <fresh-path>` after the contract is bound to the accepted freeze

## Governed clean-host order

1. create and independently verify one create-only transfer on the engineering workstation;
2. physically transfer it to Founder-QA-01 and copy it to a fresh local create-only root;
3. verify the manifest, custody, independent-verification record, and exact payload inventory;
4. pass host admission and continuity with zero Oracle package/certificate state and no development tooling;
5. only after the exact bound pre-authority gates pass, create and consume one authority and one attempt;
6. verify the frozen package and detached release signature, reject pre-trusted or tampered state, scan package bytes for runtime-configuration canaries, remove exact temporary trust, produce evidence, and return it create-only.

A permanent failure is not retryable. Passing qualification stops awaiting Founder review and does not authorise Stage 3 or later work.
