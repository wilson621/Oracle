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

PHASES

PreExecution
  Read-only binding and transfer verification, archive expansion, release
  evidence verification and public-certificate derivation. Does not trust or
  install anything.

NegativePathAndTrust
  Proves the original package is rejected before trust, temporarily trusts
  only the exact public test certificate, and proves a tampered copy is
  rejected.

InstallAndStartup
  Installs the exact MSIX, verifies identity/version, launches the packaged
  application and records bounded Founder confirmations of the fail-closed
  local state.

RepairAndRemoval
  Exercises reset/repair, verifies the same package identity, relaunches and
  uninstalls.

Cleanup
  Removes temporary certificate trust, package residue and transferred
  executable artifacts while preserving returned evidence.

AUTHORITY

This kit grants no production trust, deployment, publication, external
distribution, product change, Stage 4 or private-key authority.

Do not run any phase until Codex provides the exact command for that phase.
