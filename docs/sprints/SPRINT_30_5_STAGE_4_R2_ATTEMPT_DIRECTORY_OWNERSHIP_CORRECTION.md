# Sprint 30.5 Stage 4 R2 Attempt-Directory Ownership Correction

**Classification:** Evidence-led engineering correction
**Qualification authority:** None
**Qualification execution:** Prohibited
**Last Reviewed:** 4 August 2026

## Finding

The R2 failure was deterministic and repository-related. It was not an operating
system, elevation, transfer, network-isolation or host-residue failure. The
qualification harness owned the attempt root and wrote the create-only transfer
admission record under `logs/`. The live-environment controller independently
claimed exclusive creation of both `provider/` and `logs/`. Its `mkdir` of the
existing `logs/` path failed closed with `EEXIST`.

Development rehearsals did not expose the conflict because their wrappers created
only the rehearsal root and allowed the live controller to create both children.
The source-equivalent and qualification layouts therefore differed at the exact
controller boundary.

## Corrected ownership contract

The contract now assigns one owner to every attempt subtree:

- the qualification or rehearsal launcher owns the create-only attempt root;
- the launcher owns `logs/`, shared only through create-only record files;
- the qualification harness owns lifecycle records;
- the journey controller owns create-only journey evidence;
- the live-environment controller exclusively owns ephemeral `provider/`.

Qualification controller admission requires the exact initial root inventory
`lifecycle/` and `logs/`, with exactly `logs/transfer-admission.json`. Development
rehearsal requires exactly an empty caller-owned `logs/`. Missing logs, file-backed
logs, linked logs, unexpected root entries, unexpected log files and a pre-existing
provider root are rejected before provider mutation. Teardown admission is
non-mutating over the preserved attempt layout.

The R2 contract is now `engineering-correction-qualification-barred`. Founder
qualification execution, authority creation, qualification attempt creation and
transfer preparation are all false; remaining attempts are zero and the consumed
R2 token is removed. Static regression checks prove transfer preparation and
qualification stop before identity or namespace creation.

## Immutable history

The accepted failed-evidence index rehashes nineteen authority, preflight, transfer,
controller and attempt records. A dedicated verifier reconciles the exact nine-file
attempt inventory, consumed authority, failed lifecycle, passed safety teardown,
absence of final/archive/repository evidence and retry prohibition. Exact R2
historical roots are contract-protected from create-only engineering operations.

No accepted Stage 2, Stage 3, Stage 4 R1 or Stage 4 R2 evidence was modified.