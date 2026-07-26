# Sprint 30.5 Stage 1 Evidence Index

**Stage result:** Founder-accepted and closed

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
- `generated/laptop-evidence-return-review.json` records the immutable return
  archive review, controlled non-pristine host classification, recovered GPU
  admission and completed development-PC teardown.
- `generated/stage-1-frozen-evidence.json` records the privacy-minimised hash
  and inventory of the frozen local evidence package.
- `SPRINT_30_5_STAGE_1_CLOSURE.md` records Founder acceptance and closure.

## Deliverable disposition

| Required deliverable | Disposition |
| --- | --- |
| Revised Environment Admission Record | Produced — Founder-accepted and closed |
| Windows environment specification | Collected; controlled non-pristine host accepted |
| GPU capability record | Recovered; SHA-256 verified; admission passed |
| Auth/PostgreSQL/email topology | Provisioned, recreated and removed |
| Isolation/prohibited-path checklist | Laptop route passed; prohibited paths remained inaccessible |
| Snapshot/reset/teardown procedure | Restore point recorded; development-PC and laptop teardown passed |
| Proposed GPU protocol and thresholds | Produced; not frozen |
| Stage 1 evidence index | Produced |

The disposable service topology left no Supabase instance, PostgreSQL volume,
email, identity, session, certificate, trust entry, container, network or
temporary directory. The firewall allowlist and source-validating relay were
also removed. All mandatory technical admission evidence is now present.
Stage 1 has no remaining action or evidence gap. Stage 2 has not begun.
