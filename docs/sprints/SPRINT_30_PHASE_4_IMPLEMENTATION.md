# Sprint 30 Phase 4 — Performance, Accessibility, Compatibility and Support

**Status:** Complete and locally verified for Founder review
**Authority:** Founder acceptance of Phase 3 and authorisation of Phase 4
**Runtime Manifest:** `1.7.0`, unchanged and mechanically equal
**Production / signing / distribution:** Unchanged and unauthorised
**Next phase:** Phase 5 not started

## Outcome

Phase 4 establishes frozen, reproducible local budgets and evidence without
changing runtime composition. It adds no subsystem, migration, persistence,
provider, upload, signing, package, deployment or production behaviour.

The current-host production Web build passes startup, authentication-boundary,
CPU, memory and response-size budgets. Deterministic curated Warzone Guidance
passes its latency budget. The public authentication journey passes bounded
semantic, keyboard-order, focus-foundation, contrast, compact-layout and
screen-reader-tree review.

## Frozen budgets and observed evidence

| Measure | Budget | Observed | Result |
| --- | ---: | ---: | --- |
| Production Web startup | ≤ 15,000 ms | 579.672 ms | Passed |
| Protected route boundary p95 | ≤ 250 ms | 5.029 ms maximum | Passed |
| Protected route boundary p99 | ≤ 500 ms | 5.029 ms maximum | Passed |
| API authentication boundary p95 | ≤ 250 ms | 5.281 ms maximum | Passed |
| Web process working set | ≤ 768 MiB | 120.410 MiB | Passed |
| Measured workload CPU | ≤ 15 seconds | 0.172 seconds | Passed |
| HTML response size | ≤ 512 KiB | 8,601 bytes public auth | Passed |
| Deterministic Guidance p95 | ≤ 5 ms | 0.094 ms | Passed |
| Deterministic Guidance p99 | ≤ 10 ms | 0.156 ms | Passed |

These are current-host, loopback and synthetic qualification measurements.
They are not production network, persistence, live-provider or release
performance claims.

## Accessibility evidence

- The public authentication journey exposes one main landmark, one level-one
  heading, labelled Email and Password inputs and six enabled native
  focusable controls in natural document order.
- The browser semantic snapshot exposes the correct heading, textboxes,
  buttons, status/alert boundary and permanent-identity explanation.
- Bounded computed contrast review found zero threshold violations across ten
  visible text and control samples.
- Desktop `1440 × 900` and compact `390 × 844` layouts have no horizontal
  document overflow.
- The compact layout is the 390-CSS-pixel reflow equivalent produced by 200%
  zoom on a 780-pixel viewport; native zoom control was not exercised.
- Global `:focus-visible` and `prefers-reduced-motion` contracts are
  mechanically verified. The bounded browser could not emulate the reduced
  motion preference, so no false rendered-emulation claim is made.

Protected canonical routes correctly redirect to `/auth` because no authorised
live Supabase Auth provider exists. Their rendered accessibility is
unavailable, not passed.

## Compatibility and support

The compatibility matrix now separates the current Windows development host,
deferred clean Windows, unavailable live Auth, bounded viewport evidence,
current-source Electron and unavailable installed-package GPU measurement.
COD/Warzone remains the first proving ground. Minecraft remains
`provisionally-certified`, observation disabled and operationally deferred.

The warning register identifies every high qualification/governance gap. The
local support runbook defines privacy-safe intake, four severity levels,
fail-closed escalation and closure criteria. Operational Diagnostics remains
non-authoritative and disabled, with no provider, upload or retention.

## Honest limitations and blockers

| Evidence | State |
| --- | --- |
| Live Supabase Auth/GoTrue transaction | Unavailable; no pass claimed |
| Protected-route rendered review | Unavailable behind the preserved Auth boundary |
| Installed-package Electron GPU budget | Unavailable |
| Disposable clean Windows | Deferred; Sprint 30 completion remains blocked |
| Sprint 29 package/runtime reconciliation | Separate Founder authority required |
| Remote continuity | Local branch remains ahead; push not authorised |

The immutable Sprint 29 package remains bound to Runtime Manifest `1.6.0`.
Current source remains `1.7.0`. Nothing was rebuilt, resigned or distributed.

## Phase exit

Phase 4 is complete as a bounded local engineering phase. Phase 5 has not
started. Sprint 30 cannot be finally accepted as fully qualified while its
mandatory clean-Windows evidence remains deferred, and Phase 5 requires
separate Founder authorisation under the approved phased process.
