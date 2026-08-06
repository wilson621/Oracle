# Sprint 30.5 Stage 4 R5 End-to-End Rehearsal Correction

## Preserved engineering rehearsal finding

The non-transfer engineering rehearsal bundle
`engineering-rehearsal-stage4-r5-20260806T220249959Z-a1dbfc39` exercised the
clean-host split workflow without creating a governed transfer, authority,
attempt or qualification evidence.

Main-PC provider admission passed on the isolated `192.168.70.0/30` link. On
`Founder-QA-01`, package trust and installation passed, but runtime
configuration creation failed closed with `Installed runtime configuration
execution identity is invalid.` The installed controller then removed the
package and trust with zero residue. The laptop returned an identity-bound
`failed-awaiting-provider-teardown` terminal and manifest. Main-PC provider
teardown passed with zero containers, volumes, networks, relays, firewall
rules and provider work state; teardown SHA-256 was
`6394673b41906e90b136d5111db8eca85850203e09d28fd0e766ddb7cb9d2778`.
The private-link state was restored and removed.

The post-teardown completion check then reported the secondary message
`Qualification-host rehearsal terminal record differs.` That message did not
describe the installed-controller failure even though the failure terminal was
valid and teardown had succeeded.

## Root causes

The installed R8 product accepts the established qualification-shaped runtime
configuration identity contract. The R5 rehearsal controller instead supplied
literal `NO-AUTHORITY` and `NO-FOUNDER-GRANT` sentinels. Those sentinels were
correct governance labels but invalid runtime-configuration values.

The completion validator admitted only a passed rehearsal terminal. It
therefore rejected a legitimate, identity-bound failed terminal after provider
zero residue had already been established, masking the first failure.

## Batched correction

The non-authority rehearsal now derives an ephemeral runtime-compatible
identity from its create-only rehearsal identity. The compatibility identity
is used only inside the secret-bearing installed runtime configuration. No
authority record or attempt namespace is created, and all public rehearsal
records retain `authorityCreated: false` and `attemptCreated: false`.
Qualification execution continues to use only its consumed governed authority.

Passed and failed rehearsal terminals now share one fail-closed validator. It
requires exact transfer, rehearsal and provider identity binding, exact
terminal/manifest result parity, and absence of governed state. Completion
then verifies provider zero residue and the complete returned inventory. A
failed installed result is admissible only when it is explicitly
non-qualification, non-authority, non-evidence and reports qualification-host
zero residue. The original failure is then surfaced after teardown instead of
being replaced by a terminal-contract error.

## Regression and adversarial validation

The bounded regression suite now covers:

- valid rehearsal-to-runtime identity derivation and rejection of malformed
  identities;
- admission of matching passed and failed terminal/manifest pairs;
- rejection of result mismatches and any governed state in a rehearsal
  terminal;
- full local success completion using the actual completion entry point;
- full local failed completion, immutable diagnostic preservation and exact
  underlying-failure reporting after zero-residue teardown;
- transactional relay, secret-handoff, provider recovery, private-link restore,
  timestamp, protected-variable and non-transfer boundary controls.

Final execution-baseline verification passed all 29 PowerShell scripts, seven
Node modules, ten journeys and twenty lifecycle phases. It created no transfer,
provider state, relay state, authority or attempt. Historical transfers and
failure records remain unchanged.

## Governance state

This correction is engineering only. It does not complete the required
physical two-host rehearsal and does not authorise transfer preparation or
qualification. A new immutable transfer remains prohibited until a fresh
non-transfer rehearsal passes the complete physical split-host path.
