# Oracle Engineering Validation Phase A5 Evidence

This directory preserves the canonical local interactive Electron source-health
qualification for Oracle Engineering Validation Phase A5.

## Qualified revision

- Branch: `sprint-9-overlay`
- Commit: `6113565765a95b990415b6cdf2f2f1d7ff3e83c8`
- Commit message:
  `fix(desktop): bundle sandbox preload and harden window discovery`
- Repository state before and after qualification: clean and unchanged

## Canonical run

- Run ID: `20260728T124957338Z-13d3309b`
- Result: `PASS`
- Report:
  `generated/Oracle.PhaseA5Qualification.json`
- Report SHA-256:
  `8821e4c0d12dde6ca339d74f2d6baeb43d0b6a5fc286eff8d3c7c6780b65da64`
- Sidecar:
  `generated/Oracle.PhaseA5Qualification.json.sha256.txt`

The run verifies standalone Web startup, Electron launch, same-origin renderer
load completion, restricted preload availability, ready and complete Platform
Health, unique native Oracle-window ownership, a 15-second stability interval,
graceful shutdown, complete process/listener cleanup and repository integrity.

This is local engineering source-health evidence only. It does not reopen or
complete Sprint 30.5 Stage 3, qualify an installed production package, or
authorise signing, publication, distribution, deployment or production use.
