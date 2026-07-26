ORACLE SPRINT 30.5 STAGE 1 — GPU EVIDENCE RECOVERY ONLY

This helper does not launch Electron and does not rerun baseline, network, GPU,
or any other qualification.

1. Copy these three files into the existing extracted
   Oracle.Stage1EvidenceKit folder:

   Recover-OracleStage1GpuEvidence.cmd
   Recover-OracleStage1GpuEvidence.ps1
   README-OracleStage1GpuRecovery.txt

2. Double-click Recover-OracleStage1GpuEvidence.cmd.

3. If recovery succeeds, transfer these two files back to the development PC:

   Oracle.Stage1GpuEvidenceRecovery.zip
   Oracle.Stage1GpuEvidenceRecovery.zip.sha256.txt

4. If the window reports that no recoverable GPU evidence was found, do not
   rerun the full Stage 1 kit. Report that result to Codex.

5. Do not run cleanup until Codex has verified the recovery result.

Stage 2 must not begin.
