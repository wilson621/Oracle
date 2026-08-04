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
process and certificate zero residue. The non-qualification lifecycle holds
the installed package for at least 30 seconds and continues until at least five
complete Windows GPU-counter/UI Automation samples exist. New polls stop by
180 seconds and completion fails closed beyond 240 seconds, so host counter
latency cannot truncate the intended observation or create an unbounded run.
Each sample runs a concurrent one-pixel reflow and redraw pulse on an
ownership-verified package window across two one-second GPU-counter samples,
then restores the original rectangle in a finally path. A positive counter
from the exact package GPU PID is still mandatory, and no acceleration flag is
used. Process-exit races discard the affected poll after current GPU PID,
package path and creation-identity revalidation; they never synthesize a
measurement. Measurement occurs only in this held observer. The outer layer
supervises the child through teardown, rejects malformed returned observations,
rechecks zero residue and writes the create-only result; it performs no
concurrent GPU, UI Automation or process sampling.

The full frozen qualification contract requires two fresh 90-minute cycles and
complete installed-route accessibility evidence. This directory cannot execute
that contract. A separate Founder-authorised execution-enabled baseline is
required.
