# Sprint 30.5 Stage 4 R5 Automatic-Variable Failure and Correction

## Immutable pre-authority engineering failure

Founder acceptance makes transfer
`transfer-stage4-r5-20260806T204257450Z-90944363` immutable pre-authority
engineering failure history. Its transfer, provider-start, failure and teardown
records remain unchanged, and the transfer is prohibited from admission or
execution.

The immutable transfer retains these independently verified SHA-256 values:

- manifest: `e557b4eea26cc94b189a85475f57a90524f96e6121078923f632922298ec55fc`;
- custody: `fc7620229a9efd2b90e0b1935a14e6795f379405097d4a94bbc7cee0d17d6e88`;
- independent verification: `d6c43111f91c2ec1ac8b3a45c37e0186b83e2ea22f2f29456902349275dbcbb1`.

Founder-QA-01 successfully established the exact `192.168.70.2/30` private
link with zero default routes. The two-host rehearsal then stopped before
local rehearsal-root creation because assignment to `$host` attempted to
overwrite PowerShell's case-insensitive, read-only automatic `$Host` variable.
The laptop wrapper restored its private-link state.

Because the collision occurred before the rehearsal script's terminal-writing
boundary, normal main-PC Step 03 rejected provider teardown due to the absent
terminal. A create-only pre-rehearsal failure record admitted teardown without
admitting qualification. Governed provider teardown reported zero containers,
volumes, networks, relays, firewall rules and provider work state, and main-PC
network restoration passed.

The failure record has SHA-256
`079bfed9ebc68f01ab5adc0bf6d819e5dbc25ec641854ae011f064a642056a49`.
The provider teardown has SHA-256
`174eaec2280ad3448dac389187e1f45f6220e3a977dc995ba694e0254054076e`.
No return namespace, authority or qualification attempt exists.

## Engineering finding

PowerShell variable names are case-insensitive. Two execution paths used the
colliding local name:

- `Invoke-OracleStage4R5TwoHostRehearsal.ps1` attempted the observed failing
  assignment; and
- `Invoke-OracleStage4R5FounderHandoff.ps1` contained the same latent defect
  before continuity and authority creation.

The second occurrence would have failed closed later even if the rehearsal
occurrence alone had been corrected.

## Correction and regression boundary

Both paths now use the explicit local name `$hostAdmission`. The continuity
record retains its governed JSON member name `host`; only the PowerShell local
variable changes.

The mandatory regression parses every Stage 4 R5 PowerShell script and rejects
case-insensitive references to protected automatic variables including
`Host`, `PID`, `PSVersionTable`, `PSEdition`, `ShellId`, `HOME`,
`ExecutionContext` and `PSHOME`. A hostile mixed-case `$hOsT` fixture must be
detected, and a runtime fixture proves the renamed admission binding leaves the
built-in `$Host` object unchanged.

The correction changes no accepted product artifact, R8/R13 evidence,
provider topology, lifecycle phase, journey claim, authority boundary or
single-attempt rule.
