# Sprint 30.5 Stage 4 R5 Pre-Authority Failure and Replacement

## Immutable failed transfer

Transfer `transfer-stage4-r5-20260806T181151844Z-ac1fb503` is accepted as an
immutable pre-authority engineering failure. Its source and USB content remain
unchanged and it is prohibited from admission or execution.

The manual offline Step 01 reached only recoverable main-PC private-link
configuration. Provider pre-authority verification then failed closed because
the verifier read a mandatory `version` property from every tool binding while
the governed `taskkill` binding intentionally contains only path and SHA-256.
No readiness record, rehearsal root, provider state, return root, authority,
attempt or qualification evidence was created. The private-link configuration
was restored successfully and its recovery state record was removed.

Immutable transfer hashes:

- manifest: `37062aa55411eba20159d20f8a0ab15b929219eb35a79644861318b43972fce5`;
- custody: `2bfd6a5320c7c0b73912feec55e2aa0b437d60729cd0ca0cc60582162fc864c0`;
- verification: `a44fe8378e8455a7ba47f0a48fa71ed8e1b51ea5bc7009a34b7b60f32744fd0a`.

## Correction

Tool path and SHA-256 remain mandatory. Version is preserved when the binding
defines it and is recorded as null when the binding is intentionally hash-only.
The correction neither weakens tool identity nor changes the R8 product,
R13 lifecycle, provider topology, journey contract, authority boundary or
single-attempt rule.

Regression validation requires the hash-only `taskkill` binding to pass,
versioned bindings to remain versioned, missing hashes to remain inadmissible,
and the replacement transfer manifest and custody records to bind the exact
failed transfer they replace.

No authority or attempt is permitted before all replacement-transfer,
continuity, host-admission, network, rehearsal and final pre-authority gates
pass.
