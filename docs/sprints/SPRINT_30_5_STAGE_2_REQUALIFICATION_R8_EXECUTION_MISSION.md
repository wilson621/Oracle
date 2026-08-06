# Sprint 30.5 Stage 2 Requalification R8 Execution Mission

Status: HOSTNAME-CORRECTED TRANSFER SEALED - PHYSICAL CLEAN-HOST HANDOFF REQUIRED
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
## Sealed replacement transfer

The single corrected replacement transfer was created from execution commit `e9c0cb0e4da8955935cbb090b332617849e4d125` and independently verified:

- manifest SHA-256: `62b26194f10ce0b560cb906575f94cd2e55d6c589e149304151c098a38f5f0f1`
- custody SHA-256: `3853f9f4d6fe1032d9fe83fcc00cfe0bed8137a7d3035d0de1ac4b63bbf11484`
- verification SHA-256: `b8b08448bd025e61fa5e7676ce33224d411c29f406ca7293e07397f3c1b9e8e7`
- execution contract SHA-256: `a86f058e32a5ba68177dec3c728b17f4780a4ee20dee35807ed15707382df47f`
- payload: 15 files, 215,860,190 bytes
- full transfer: 18 files, 215,865,538 bytes

The exact PowerShell core embedded in the transfer admitted the sealed source transfer successfully. The create-only USB copy under `context-stage2-r8-replacement-cc9e03ce` passed the same embedded admission and a full file-by-file source comparison. The governed return root is `return-stage2-r8-replacement-cc9e03ce`.

Source transfer creation is closed. No continuity, authority, attempt or qualification evidence exists. The next action is the physical move of the USB to `Founder-QA-01` and execution of the exact clean-host handoff command.
## Replacement clean-host admission failure

On `Founder-QA-01`, the USB transfer and fresh local create-only copy were admitted successfully. Host admission then failed closed with `Qualification host identity differs.` before continuity, authority or attempt creation.

Read-only diagnostics proved:

- environment computer name: `FOUNDER-QA-01`
- CIM computer name: `FOUNDER-QA-01`
- governed expected name: `Founder-QA-01`
- local transfer exists: true
- attempt entries: 0
- return entries: 0

The defect is a case-sensitive comparison of a Windows computer name. Windows computer names are case-insensitive. The replacement transfer, USB copy and local copy remain unchanged and are prohibited from admission or execution. The immutable failure record is `.artifacts/sprint-30-5/stage-2-r8-pre-authority-failures/transfer-stage2-r8-replacement-20260806T125821770Z-cc9e03ce-host-identity-failure.json`, SHA-256 `fd30328ceca30c175565c77a1acd8969f9c21da32858e00089eca594035da81a`.

## Host-identity engineering correction

The repository now compares actual and expected computer names with `StringComparison.OrdinalIgnoreCase`. Exact, uppercase-Windows and lowercase-Windows forms pass. Different suffix, appended and truncated identities fail. The correction does not weaken exact host identity beyond Windows-native case semantics.

All transfer, authority, attempt and qualification permissions are fail-closed. No further transfer is authorised.

## Hostname-corrected mission

The Founder accepted the replacement failure and hostname correction baseline `6d86173a4090190e3e5b4c548d47c1e503b3651d`, then authorised one fresh mission:

- grant: `founder-stage2-r8-corrected-grant-20260806T132233022Z-d77af006`
- transfer: `transfer-stage2-r8-corrected-20260806T132233022Z-d77af006`
- immediate predecessor: `transfer-stage2-r8-replacement-20260806T125821770Z-cc9e03ce`
- preserved original predecessor: `transfer-stage2-r8-20260806T123612020Z-338a5276`
- maximum transfers, authorities and attempts: one each
- authority creation: only after every transfer, continuity, clean-host and pre-authority gate
- retry after consumed authority or permanent failure: prohibited
- Stage 3 and later work: not authorised

Pre-transfer validation hash-bound and read-only admitted both failed predecessors, validated complete two-generation lineage, and passed the inventory and hostname adversarial suites. No corrected transfer, authority or attempt existed at that gate.

## Sealed hostname-corrected transfer

The single authorised hostname-corrected transfer was created from execution commit `f163a246fc40a202cc1e1a0adbc4be23ec9d2fbc` (tree `55efd946b0abb0f39618e12f91bcf372d28c5d75`) and independently verified:

- manifest SHA-256: `2d72d30d005caf0a4b1fbb38cb1fd16a7d07442b53fa7a4ba6ee6f29f1bf75e2`
- custody SHA-256: `c9c52b5059f0ead02ab3d9b69ff5ef0bb51a0a4cbb6b86921148b6c02673de3c`
- verification SHA-256: `053ceffe040e5fad8b937fd145254289466f72dc859e52e16cb2a3169c722c12`
- execution contract SHA-256: `04731755fb83ca5e62abafd0448e5655713d07e08008c5d2f31058132a356d55`
- payload: 15 files, 215,865,015 bytes
- full transfer: 18 files, 215,870,639 bytes

The embedded PowerShell core admitted both the source transfer and the create-only USB copy. Full relative-path, byte-count and SHA-256 parity passed under USB context `context-stage2-r8-corrected-d77af006`; the governed return root is `return-stage2-r8-corrected-d77af006`.

Transfer creation is consumed and closed. No continuity, authority, attempt or qualification evidence exists. The next action is the physical move of the USB to `Founder-QA-01` and execution of the exact clean-host handoff command.