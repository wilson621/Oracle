ORACLE SPRINT 30.5 STAGE 3 QUALIFICATION KIT

HOST

Founder-QA-01
MEDION ERAZER P6605 MD61596

PURPOSE

This PowerShell-only kit qualifies the exact frozen Stage 2 MSIX on the
Founder-admitted Windows installation. It requires no Node.js, Git, compiler,
SDK, development server or Oracle source.

The kit is phase-gated. Run only the phase explicitly supplied by Codex after
the preceding evidence has been reviewed.

REVISION 4 CORRECTION

Revision 2 established trust in CurrentUser\Root, which the Windows MSIX
deployment provider did not accept. The resulting 0x800B0109 failure and all
Revision 2 evidence remain preserved and hash-bound.

Revision 3 uses only LocalMachine\TrustedPeople for temporary public-certificate
trust. Windows exposes that physical entry through inherited Current User
logical store views. Revision 3 incorrectly counted those inherited projections
as additional physical trust.

Revision 4 governs trust scope from physical certificate-store entries and
records inherited logical projections separately. It preserves and binds both
prior failures. It does not rebuild or re-sign the accepted MSIX.

REVISION 5 CONTINUATION

Revision 4 remains an immutable InstallAndStartup timeout failure. It proved
installation, package identity, executable signature and Windows/AppX
activation, including Oracle.exe process creation after the defective
20-second observation deadline. It did not prove visible readiness, sustained
runtime, Founder interaction, orderly exit or a product defect.

Revision 5 adds a qualification-harness-only InstallAndStartupContinuation
phase. It requires the exact already-installed package and never reinstalls it.
It binds the Revision 4 failure and 02b evidence, then applies one shared
milestone observer to continuation and the later repair relaunch:

  process creation deadline: 90 seconds
  window readiness deadline: 60 seconds after process creation
  sampling interval: 1 second
  responsiveness gate: 5 consecutive successful samples
  sustained runtime: 120 continuous seconds after readiness
  graceful-close deadline: 30 seconds

The observer requires the exact packaged executable, a visible responsive
window, matching AppX activation evidence, and no active non-loopback Oracle
connection. Any unproven milestone fails closed.

PHASES

PreExecution
  Read-only binding and transfer verification, archive expansion, release
  evidence verification and public-certificate derivation. Does not trust or
  install anything.

Revision2TrustCleanup
  Verifies and preserves the exact Revision 2 evidence, confirms that no
  package or Phase 03 evidence exists, and removes only the obsolete exact
  CurrentUser\Root public-certificate trust. Produces separate cleanup evidence
  and permits only a restart from NegativePathAndTrust.

NegativePathAndTrust
  Proves the original package is rejected before trust, temporarily trusts
  only the exact public test certificate in LocalMachine\TrustedPeople,
  verifies the accepted MSIX signature under that trust, and proves a
  tampered copy is rejected. Produces separate Revision 3 evidence without
  overwriting prior evidence. Revision 4 requires exactly one physical
  LocalMachine\TrustedPeople entry while keeping inherited logical projections
  visible but non-authoritative.

InstallAndStartup
  Revision 4 historical phase. It must not be rerun. Its timeout outcome stays
  classified as failed and is preserved by the Revision 4 failure record. The
  implementation is retained solely to preserve prior behavior and history.

InstallAndStartupContinuation
  Revalidates the admitted host, installed package and executable, frozen MSIX,
  signature, bounded LocalMachine\TrustedPeople trust, certificate window,
  Revision 4 bindings and absence of Phase 03 success evidence. It then observes
  activation, process creation, window readiness, responsiveness, sustained
  runtime, network isolation and orderly exit. Only after automated readiness
  passes does it ask four bounded Founder questions. It always writes separate
  Revision 5 diagnostic evidence for a handled outcome and writes canonical
  Phase 03 success evidence only when every criterion passes.

REVISION 6 RECOVERY

The Founder-QA-01 Revision 5 attempt is immutable historical evidence. Its
PreExecution evidence and finalised continuation diagnostic must be transferred
byte-for-byte into immutable-history/revision-5-failed-attempt. The exact
Revision 4 02b evidence and original sidecar must be transferred byte-for-byte
into immutable-history/revision-4 and mechanically verified before the recovery
package can be generated.

Revision 6 always uses a fresh revision-6-recovery directory. It never resumes
or writes inside revision-5-incoming.

The legacy PreExecution phase is prohibited for Revision 6. It represented a
new-install admission state and incorrectly rejected the installed package and
bounded trust required by a continuation.

Because Revision 5 removed the package and trust, recovery has three separately
governed steps:

  1. Invoke-OracleStage3RecoveryRestoration.ps1 -Operation Restore
     Restores only the exact frozen MSIX and exact public certificate in
     LocalMachine\TrustedPeople. It requires a separately approved Founder
     authority identifier and can never run automatically.

  2. RecoveryContinuationPreflight
     Requires and revalidates the restored package, executable, signature,
     frozen MSIX, bounded certificate trust, immutable Revision 4 evidence,
     immutable Revision 5 failed-attempt evidence and restoration evidence.

  3. InstallAndStartupRecoveryContinuation
     Uses the hardened startup observer and create-only Revision 6 diagnostic
     evidence. It cannot overwrite Revision 5 or Revision 4 evidence.

Preparation, transfer, restoration, preflight and continuation remain distinct
gates. Package generation fails closed until all exact historical evidence
bytes and sidecars are available on the development PC.

RepairAndRemoval
  Exercises reset/repair, verifies the same package identity, relaunches and
  uninstalls. Revision 5 applies the same milestone observer to its relaunch.

Cleanup
  Removes temporary certificate trust, package residue and transferred
  executable artifacts while preserving returned evidence.

AUTHORITY

This kit grants no production trust, deployment, publication, external
distribution, product change, Stage 4 or private-key authority.

Do not run any phase until Codex provides the exact command for that phase.
