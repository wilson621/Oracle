# Stage 5 R1 engineering-preparation harness

This directory freezes and validates the Stage 5 Installed Package GPU,
Performance and Accessibility contract for the exact accepted R6 MSIX and the
accepted R6/R12/R4 chain.

Entry points:

- node scripts/sprint-30-5/stage-5-r1/verify-preparation.mjs
- node scripts/sprint-30-5/stage-5-r1/Test-OracleStage5R1Policies.mjs
- node scripts/sprint-30-5/stage-5-r1/run-development-rehearsal.mjs
- elevated installed rehearsal:
  Invoke-OracleStage5R1InstalledDevelopmentRehearsal.ps1 -ResultPath <fresh-path>
- installed result verification:
  node scripts/sprint-30-5/stage-5-r1/verify-installed-rehearsal.mjs <result-path>

Every result is non-qualification, non-authority and non-evidence. The
preparation contract permits zero transfers, zero authorities and zero
attempts. No qualification entry point or transfer builder exists here.

The installed rehearsal invokes the accepted Stage 4 R4 installed lifecycle,
samples only processes owned by the exact installed package, requires a stable
GPU child and positive PID-addressable Windows GPU-engine activity, performs a
Windows UI Automation smoke inspection, and independently confirms package,
process and certificate zero residue.

The full frozen qualification contract requires two fresh 90-minute cycles and
complete installed-route accessibility evidence. This directory cannot execute
that contract. A separate Founder-authorised execution-enabled baseline is
required.
