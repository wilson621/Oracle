# Sprint 30.5 Stage 5 R1 Pre-Authority Transfer Failure

**Status:** Immutable pre-authority engineering failure
**Transfer:** `transfer-stage5-r1-20260804T174913211Z-e7b00bae`
**Authority created:** No
**Attempt created:** No
**Qualification evidence:** None
**Last Reviewed:** 4 August 2026

The single create-only R1 transfer was prepared from pushed execution commit
`997f0c98e8d60a64829e4738a24c5275f9ac1ed1`, tree
`1826e57d4ff784e396eb2d6c0aed858457f612d5`, and independently verified. Its
51-file, 215,961,342-byte payload is preserved unchanged.

Transfer manifest SHA-256:
`3af250895c9d450ec7f933dbc777916fa08019d6f52408ccbc4f57311fb74ffb`.
Custody SHA-256:
`e4235914fe2b72c9e235599bb103fc0098a8ac620119be717c396206a32709e0`.
Independent verification SHA-256:
`e8cc9a5ded1db7264a8bba3e24e61e6447e500de3fe21438c8679129796e2cb5`.

Post-creation inspection found that
`Invoke-OracleStage5R1PreAuthorityPreflight.ps1` would emit a Stage 5 host and
measurement admission record with the stale contract name
`oracle.sprint-30-5.stage-4-r4-pre-authority-preflight`. The file hash is
`2ef4c2106357c42ee1117e5fe906bbf249dc933e175fd8b7e6c9cfaffc929575`
and exactly matches the immutable transfer manifest. Executing the transfer
would therefore create internally mislabeled programme evidence.

The transfer is unusable and must not be copied, admitted or executed. It is not
a qualification attempt and consumed no authority. The Stage 5 artifact root
contained no `authorities`, attempt or preflight namespace when the failure was
closed. The transfer must remain immutable and cannot be repaired or reused.
