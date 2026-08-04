# Sprint 30.5 Stage 5 R1 Development Rehearsal Investigation

**Classification:** Engineering investigation; non-qualification; non-authority; non-evidence
**Status:** Root causes corrected; installed validation passed
**Accepted product:** unchanged Stage 2 R6 MSIX
**Last Reviewed:** 4 August 2026

## Boundary

This investigation does not alter or reinterpret accepted Stage 2 R6, Stage 3
R12 or Stage 4 R4 evidence. Every rehearsal result and retained Stage 4 lifecycle
directory below remains unchanged. No transfer, authority, qualification attempt
or qualification evidence was created.

## Preserved outer results

| Result | SHA-256 | First underlying failure |
| --- | --- | --- |
| installed-r1-preparation-01.json | 531507f9188b53fe3103639662dcebb3729039fd03cb50aa73bed46fcc6b3a70 | Process wrapper did not capture the completed child exit code. |
| installed-r1-preparation-02.json | 29fed6c6de772e31420e913886e6d36cdda608944631684ac02f48dca82f851e | Short external observation collected no complete GPU sample. |
| installed-r1-preparation-03.json | c41107cf75185dae6ca7dcd469f568843478ef45a49015699ff96e5a58bfafb4 | Short external observation collected no complete GPU sample. |
| installed-r1-preparation-04.json | 5d4e405ef0f845ef2a36a86503f2ae9467b1f65db3bdbff256711b374e37a441 | External observer completed GPU sampling before observing the installed UI. |
| installed-r1-preparation-05.json | 43e47f712cece6602406a275c8c0b15ae5eaff3ee88ea0bb93f87c7af0f5ac69 | External observer did not obtain a Windows GPU-engine counter sample. |
| installed-r1-preparation-06.json | 196dc220cadd4ced23d671e83180323589ab578b42a6ba49e1aaf0ebfdaf95fe | Held observer's 15-second window completed with four samples, below five. |
| installed-r1-preparation-07.json | 5948b5b7c679a99b7b4fe51e7e3bc575ddc7b303d1c5f571867f8457b025f30f | Held observer treated every OS descendant as package-owned. |
| installed-r1-preparation-08.json | 500b0ba4a4182b1a36dbe896bd0015415fd993c0b84c42373c050b30b3336545 | Idle held window produced no positive exact-package GPU-engine activity. |
| installed-r1-preparation-09.json | 3f8e712d43b71520f2df32a9c715e46b36b2d340adb9b5f1fe880cb68b6a588a | Package PID 39676 exited between CIM snapshot and bulk Get-Process. |
| installed-r1-preparation-10.json | 618b44b16a78a9614daa9e70b0aaea74903cf2523df4250905490dbcf67e4613 | The redundant outer observer repeated the same stale-PID lookup for PID 3184. |
| installed-r1-preparation-12.json | b170929ea6f47bac93e6ebe3fbeb326fc169295e1fb8be3013a6a29013f82a1d | Fixed deadline ended the held observer below five samples while the concurrent outer observer contended for the same expensive counters. |
| installed-r1-preparation-13.json | 37f5dc211f82f4c768527ff248c2f51dfa83e83a52a6d7508f4ca94c3488a656 | Brief owned-window resize completed before GPU-counter sampling and produced no overlapping positive activity. |
| installed-r1-preparation-14.json | 4211b5ef92e511ac914ed1c68544603ac88c7405a72b54d95e9b0ebcf08ed103 | 416 overlapping top-level HWND reflow/redraw operations exercised Windows/DWM but did not require exact Chromium-renderer GPU work. |
| installed-r1-preparation-15.json | 17b96a914337173a97f4d36bbdce4f84798a653392b27cfb9b3d08025dbfe351 | Windows rejected the observer's attempt to restore the Administrator terminal as foreground; this cross-process UI courtesy incorrectly aborted the evidence path before appending the first sample. |
| installed-r1-preparation-17.json | f8d7dbaba02992b6dc8e26c49fbece82fa33d5938030fc4a77c6e07a50f7517f | Passed end to end after asynchronous output draining; five samples, two positive GPU samples, ten journeys and zero residue. |

The attempted `-11` invocation created no result file and never entered the
installed lifecycle. Its strict-mode diagnostics initializer used bare `false`
instead of `$false`; that wrapper-only defect is regression guarded.

The `-16` invocation also created no outer result, but for a different reason.
Its inner lifecycle `installed-rehearsal-d2eb5fa2` passed completely before the
wrapper deadlocked on redirected output. A queued operator interrupt released after
targeted termination of the verified Node child, so no outer result was fabricated.

## Preserved inner lifecycle diagnostics

| Directory | Primary failure | Installed result SHA-256 | Environment result SHA-256 |
| --- | --- | --- | --- |
| installed-rehearsal-71d79849 | Fewer than five held GPU samples | 409c10494ff2ae63b3e663c461085237c949306c619007310e07c3f2fe2fc5fd | c2b5898661f45b60b22e97f455655048ccc7398373c09f1c0ff3f7dc75029cf5 |
| installed-rehearsal-282b3787 | Foreign descendant rejected as if package-owned | 3714b4d281b2837754b67f5402bcb4ef5c3456e3bf8fface84c3344eb075e8f6 | 34ba82efd50672b2bee2fa5b9a59216dd66d74cfe8235cff013bf230872fcd1c |
| installed-rehearsal-e471e148 | No positive GPU activity while idle | 0842e98a48a7d741f80e804a8bc5498157678f6be27e1285b02bbfbd24359bcf | 6d3aa7d954bd2831740b22b28e7b6c3a5c60c969f03c775f9606e8a3c940d9a6 |
| installed-rehearsal-3eb969ae | PID 39676 exited before bulk lookup | 63b7518e2a51ff7247001588d5c95cac26920a50e762cf1387c9aa9d355ae30b | ac37ed713c05b5fbb64bbba3e6eba03003f6ce63e804fc337ee52d7c34c2e1dc |
| installed-rehearsal-32a96074 | Fewer than five held GPU samples | 7990fa78824a7a15bd0907584bde32f70480040a65a449268de0a2ec855e74db | 9427a935748b509b765afd2109c596fb1a8a7bf26f4679a3b176fb5d7564dfd3 |
| installed-rehearsal-a726b923 | Fewer than five held GPU samples | 27e964ddbd0751b92f3f919c34f762e5a145153a1d819f67c41903b97c8053bc | afbe2cf884d42350890c8788a55eb68cd88eb88f99d0a9340e4c3329d1c59f6b |
| installed-rehearsal-27db935b | No positive GPU activity because stimulus and counter did not overlap | 5422c83d3f3f3514da909736468c450f049b07020c547b29e5b73beafac21c7a | 28b4786f3004264a20bfcc5c70884ddee247efdc03b47d2a7af85588bdeb7496 |
| installed-rehearsal-d1033309 | No positive exact GPU-PID activity because top-level HWND work did not require Chromium-renderer work | 429decff158bc8c5325c08c9cfb38618046adf954a4cf7c9eaf38b2e9ad1f7ad | 304c7a882607ac1fb8ca78f755cbfb98d3fcd2a59d22500987f2b12ba4278dc4 |
| installed-rehearsal-301475e9 | Cross-process foreground restoration was rejected before the first sample append | 8efba3e7f8cfc791e20c69e8445041f35cc06bc22ac1552ea5456b84fdcbad06 | 9d41a29b8464822a70a6da9b60fe54131029d99a83bf9bbbb2a0cbe1ce83562a |
| installed-rehearsal-d2eb5fa2 | Inner lifecycle passed; outer wrapper deadlocked before consuming its success payload | d674e82cdaac9674733bb7f3940b4fdf235aefc59ac39e94818d61f1b9bdba30 | d14743ca95ca46d2eed2c5ae1e375b5e5c0c41e03821a4d738543fd8bb137090 |

Every listed inner result recorded package zero residue, environment zero
residue and zero cleanup failures.

## Root-cause conclusion

The first architectural cause was an observation/lifecycle mismatch. Stage 5
initially observed outside the accepted Stage 4 lifecycle, then added a held
observer without removing the external observer. Two observers consequently
contended for GPU counters and UI Automation while independently racing a
short-lived Electron process set. The fixed wall-clock deadline was a second
cause because counter latency could end the held window below its sample gate.
Individual ownership, idle-render and stale-PID failures were manifestations of
those two structural defects. Run 14 then isolated the remaining stimulus defect:
with one stable observer, five complete samples, exact GPU PID 14560, available
counters, 416 concurrent operations, complete UI Automation and zero residue,
top-level `SetWindowPos`/`RedrawWindow` activity still yielded zero exact-PID GPU
activity. Those calls can exercise Windows/DWM without requiring the Chromium
renderer to submit a frame, so operation count was not proof of renderer work.
Run 15 then proved the renderer-facing pulse reached its finally path, but Windows
rejected returning focus to the previously foreground Administrator terminal.
Foreground restoration is neither an exact-package measurement nor a residue or
ownership gate; promoting that cross-process OS courtesy to a mandatory assertion
was the next concrete lifecycle defect.
Run 16 proved that correction: all ten journeys, the held observation, exact GPU
attribution and both zero-residue checks passed. It also isolated a post-success
wrapper defect. The parent called `WaitForExit` before draining redirected stdout
and stderr; the large success payload filled the pipe, blocking the child before
its diagnostic-root removal while the parent waited for exit.

## Correction

The corrected architecture has one measurement owner: the held observer inside
the installed lifecycle. It:

- selects only exact-package executable paths under an ownership-verified root;
- rejects a reused root and a second or orphaned package tree;
- excludes foreign descendants from every metric;
- uses PID plus creation identity and discards an exited GPU poll;
- accumulates CPU per process identity from a single CIM snapshot;
- foregrounds the ownership-verified Oracle window, combines reflow/redraw with
  non-activating Tab focus-navigation messages across two one-second GPU-counter
  samples and restores the exact rectangle; Oracle remains foreground until the
  governed lifecycle closes it;
- requires positive PID-addressable Windows GPU-engine activity;
- runs for at least 30 seconds and at least five complete samples;
- stops starting new polls by 180 seconds and fails completion beyond 240; and
- preserves all unavailable-measurement, identity, resource and accessibility
  gates.

The wrapper begins asynchronous stdout and stderr draining immediately after child
launch, then waits, joins both reads and parses the complete payload. A live 2 MiB
redirected-output regression fixture proves the ordering without truncation or
deadlock.

The outer layer performs no GPU, UI Automation or process measurement. It
supervises the child through teardown, adversarially reconciles the returned
held-observer record, independently verifies zero residue and writes the
create-only non-qualification result.

## Validation status

Parser validation, deterministic policy evaluation, 51 qualification
adversarial cases, five development-rehearsal adversarial cases, ownership
fixtures, exit-code fixtures, invalid-window native-stimulus failure and
one-positive/ten-negative reconciliation fixtures pass. The corrected source also
requires foreground activation, key-down/key-up delivery and exact bounds
restoration in the native finally path. Cross-process foreground restoration is
explicitly not an evidence gate. The live 2 MiB redirected-output fixture passed,
then installed result `installed-r1-preparation-17.json` passed independent
verification with five complete samples, two positive exact-PID GPU samples, ten
journeys, complete named UI Automation controls and zero residue.
