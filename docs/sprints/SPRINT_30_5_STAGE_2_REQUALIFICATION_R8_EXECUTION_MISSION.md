# Sprint 30.5 Stage 2 Requalification R8 Execution Mission

Status: CORRECTED REPLACEMENT AUTHORISED - PRE-TRANSFER
Date: 6 August 2026

## Exact authority

The Founder accepted the Stage 2 R8 preparation and freeze and authorised exactly one governed clean-host R8 mission. The execution overlay bound:

- Founder grant: `founder-stage2-r8-grant-20260806T123612020Z-338a5276`
- authorised transfer: `transfer-stage2-r8-20260806T123612020Z-338a5276`
- maximum transfers: 1
- maximum authorities: 1
- maximum attempts: 1
- retry after consumed authority: prohibited
- Stage 3 and later work: not authorised

## Host and lifecycle boundary

`DESKTOP-M3H22E4` owns the execution-enabled baseline, transfer construction and independent verification. `Founder-QA-01` remains a clean Windows PowerShell 5.1 qualification host with no repository or development tooling.

The transfer manifest binds the exact Founder grant, execution contract hash, engineering freeze, candidate package and public certificate. Authority may exist only after source and local transfer admission, host zero-state admission, continuity and all pre-authority gates.

## Pre-transfer validation

The execution-enabled preparation verifier passed all 29 historical evidence hash bindings, JavaScript and PowerShell syntax, exact mission limits, clean-host dependency prohibition, transfer bindings, fail-closed ordering, absent-transfer rejection and streaming canary fixtures. At that point no transfer, authority or attempt existed.

## Immutable transfer result

The one authorised transfer was created and independently verified:

- transfer: `transfer-stage2-r8-20260806T123612020Z-338a5276`
- execution commit: `f18ab5c00b9cddc760963139ed1b4c4d888ba4a3`
- manifest SHA-256: `579d514b8817b8a06d7e6328f8861e5852cdeba7082b456158230f1a9d3717ae`
- custody SHA-256: `31b61f8b6fb60a682ff7aeca6dc8573a753c1d2444bd03bbd1ba85de4f775c6c`
- independent verification SHA-256: `61c92d9cea891627a707276a6fdb1727442c152e1e051ef179ff9e757fcac51d`
- payload: 15 files, 215,856,330 bytes

Clean-host PowerShell admission then failed closed before USB handoff, continuity, authority or attempt. The first error was `Transfer payload inventory differs.` The manifest inventory used Node case-sensitive ordering; PowerShell `Sort-Object` used Windows case-insensitive ordering. Exact files moved to different indexes even though every path, size and hash was present.

The transfer remains unchanged and is prohibited from admission or execution. The separate immutable failure record is `.artifacts/sprint-30-5/stage-2-r8-pre-authority-failures/transfer-stage2-r8-20260806T123612020Z-338a5276-admission-failure.json`, SHA-256 `6b6281b2bbcc43a3c3a0404d63832099391b015e7143ce845e5b200832845bac`.

## Engineering correction

The repository comparator now uses case-sensitive ordinal path-keyed equality instead of index equality. It accepts order permutations while rejecting case changes, hash changes, duplicate payload paths and duplicate manifest paths. The corrected repository logic admits the preserved transfer read-only.

The execution contract is fail-closed: replacement transfer, authority, attempt and qualification are not authorised.

## Corrected replacement mission

The Founder accepted the immutable pre-authority failure and corrected baseline `e449803796256b54323c2a11c7bda90c3ef6ca08`, then authorised exactly one corrected replacement mission:

- replacement grant: `founder-stage2-r8-replacement-grant-20260806T125821770Z-cc9e03ce`
- replacement transfer: `transfer-stage2-r8-replacement-20260806T125821770Z-cc9e03ce`
- predecessor transfer: `transfer-stage2-r8-20260806T123612020Z-338a5276`
- maximum replacement transfers, authorities and attempts: one each
- authority creation: only after transfer, continuity, clean-host and all pre-authority gates
- retry after consumed authority or permanent failure: prohibited
- Stage 3 and later work: not authorised

The replacement namespace is separately bound; the original failed mission and transfer records remain unchanged. Pre-transfer validation passed with no replacement transfer, authority or attempt state.