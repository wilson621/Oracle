# Sprint 30.5 Stage 4 R5 Private-Link Failure and Correction

## Immutable pre-authority engineering failure

Founder acceptance makes transfer
`transfer-stage4-r5-20260806T200338718Z-3af1860e` immutable pre-authority
engineering failure history. Its source, USB transfer, failure record and
teardown record must remain unchanged, and the transfer is prohibited from
admission or execution.

The transfer remains bound by these independently reverified SHA-256 values:

- manifest: `80f5edb9e075125a47d7e8936f9b9423a4ad88fa6be1c28f7aa6ab118de29e99`;
- custody: `ed8199dd085f372d7eb492902c64ef902d099663413d61ae02b5a26141eb757a`;
- independent verification: `c7bd3314b3faaed97694d7e5a2da3c0763e99a0ef7df8012684a914ddc93ca9c`.

Main-PC Step 01 created only the non-qualification rehearsal provider. On
`Founder-QA-01`, private-link initialization failed before the rehearsal began:
the exact-address query found no `192.168.70.2/30` instance, while
`New-NetIPAddress` rejected creation because an instance for the same address
already existed. The laptop restoration completed. The governed main-PC
teardown then reported zero containers, volumes, networks, relays, firewall
rules and provider work state.

The create-only pre-rehearsal failure record has SHA-256
`0833a33bf5ead1d9b0633b42f7fb473e04762e2d9aca13bc52f4b5e64e6c0db2`.
The provider teardown has SHA-256
`584503f83f07e022045bc986cdc40bcad60c06d8447e6ccfc63aafe8e2d633c8`.
No return namespace, qualification authority or qualification attempt exists.

## Root cause

The initializer removed addresses only when their IP differed from the target.
It therefore retained a target IP with the wrong prefix, while its subsequent
exact-state query required both IP and prefix. The code then attempted to
create the exact address alongside the retained mismatched instance and failed
closed with `Instance MSFT_NetIPAddress already exists`.

The same check-then-create sequence also had a race window: another actor could
create the exact address after the query but before `New-NetIPAddress`.

## Engineering correction

Private-link address reconciliation now:

1. rejects duplicate exact target instances;
2. removes every non-exact address, including the target IP with a mismatched
   prefix;
3. preserves one already-exact address without recreating it;
4. treats a creation error as a benign race only after a fresh query proves
   exactly one correct target instance;
5. propagates every creation error that cannot be proven to have converged on
   the exact governed state; and
6. performs a final exact-count assertion before network admission continues.

The correction changes no product artifact, accepted R8/R13 evidence, provider
topology, journey claim, authority boundary or retry rule.

## Validation boundary

The non-qualification regression covers mismatched-prefix replacement,
idempotent exact state, concurrent exact creation, duplicate exact-address
rejection and unverified creation-failure rejection. Existing R5 execution and
hostile policy suites remain mandatory. Validation creates no provider,
transfer, authority, attempt or qualification evidence.
