# Sprint 30.5 Stage 1 Evidence Index

**Stage result:** Incomplete — authorised physical-machine evidence pending

## Evidence

- `SPRINT_30_5_STAGE_1_ENVIRONMENT_ADMISSION.md` preserves the original
  fail-closed environment audit.
- `SPRINT_30_5_STAGE_1_ENVIRONMENT_ADMISSION_REVISED.md` records the
  Founder-authorised physical-machine model, successfully exercised disposable
  service topology and remaining machine-local evidence.
- `SPRINT_30_5_STAGE_1_GPU_PROTOCOL_PROPOSED.md` records the proposed
  measurement method and thresholds. It is not frozen or executed.
- `generated/environment-admission.json` preserves the original machine-readable
  admission result.
- `generated/environment-admission-revised.json` provides the current
  machine-readable admission state.
- `SPRINT_30_5_STAGE_1_LAPTOP_EVIDENCE_KIT.md` provides the exact Founder and
  development-PC execution procedure.
- `generated/laptop-evidence-kit.json` records the transfer artifact, source
  commit, runtime versions, integrity result and bounded self-test.

## Deliverable disposition

| Required deliverable | Disposition |
| --- | --- |
| Revised Environment Admission Record | Produced — incomplete |
| Windows environment specification | Founder-authorised; machine evidence pending |
| GPU capability record | RTX 3070 specified; Electron GPU probe pending |
| Auth/PostgreSQL/email topology | Provisioned, recreated and removed |
| Isolation/prohibited-path checklist | Localhost passed; laptop allowlist pending |
| Snapshot/reset/teardown procedure | Service teardown passed; laptop restore evidence pending |
| Proposed GPU protocol and thresholds | Produced; not frozen |
| Stage 1 evidence index | Produced |

The disposable service topology left no Supabase instance, PostgreSQL volume,
email, identity, session, certificate, trust entry, container, network or
temporary directory. Stage 2 has not begun.
