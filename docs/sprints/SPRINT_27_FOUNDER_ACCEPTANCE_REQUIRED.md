# SPRINT 27 FOUNDER ACCEPTANCE PACKAGE

**Sprint:** 27 — Contextual Companion and Reference Integration
**Status:** Founder acceptance required; do not close yet
**Operational status:** Operational Certification Deferred — Required Test
Environment Unavailable
**Prepared:** 25 July 2026

---

# Recommendation

Accept and close Sprint 27 as an engineering and architectural Sprint while
retaining the exact Minecraft live observation certificate as
`provisionally-certified`, deferred and fail-closed.

Closure should accept the completed architecture, implementation and
source/synthetic certification. It must not imply live-game certification,
Minecraft operational support, activation, deployment or permission to enable
observation.

# What Sprint 27 Conclusively Proved

Sprint 27 conclusively proved:

- Oracle can add a second Game Integration and Guidance provider through the
  existing shared runtime without changing the four-layer architecture;
- Web and Electron manifest version `1.6.0` mechanically equals both
  constructed runtimes;
- ADR-044 consent, indication, pause, revoke, locality, minimisation,
  ephemerality and renderer-safety rules are implemented and source-certified;
- ADR-045 implements immutable exact-profile certification with `certified`,
  `provisionally-certified`, `expired` and `revoked` lifecycle states;
- provisional uncertainty disables the affected capability;
- exact version, executable, single-player title and profile mismatches fail
  closed;
- the local capture adapter is attached-window-only and region-allowlisted;
- synthetic raw frames remain inside one operation, are overwritten and never
  enter storage, upload or renderer boundaries;
- derived observations are validated, confidence-bearing, purpose-scoped,
  freshness-bounded, transient and non-authoritative;
- the original diamond discovery Guidance journey is deterministic, text-only,
  spoiler-bounded and rejects non-single-player Context;
- no automated input, authoritative mutation, persistence, retention,
  multiplayer, API, mod or external-processing path was introduced; and
- Call of Duty/Warzone remains Oracle's first proving ground. Minecraft is only
  the bounded second reference integration.

# What Sprint 27 Did Not Prove

Sprint 27 did not prove:

- that Oracle can capture or recognise a real Minecraft `26.1.1` window;
- that the pinned executable/title/capture assumptions match a live installed
  runtime;
- that the approved locale, GUI scale, display modes and minimum bounds work
  together in the real game;
- live performance, reliability or recovery characteristics;
- account safety beyond the reviewed architecture, policy and prohibited-path
  evidence;
- multiplayer, Realms, server, mod, add-on, plugin, API, other-version,
  other-locale or wider-display compatibility; or
- operational Minecraft support.

No source, synthetic or architectural evidence is represented as a successful
real-game observation test.

The original live operational acceptance criterion was therefore not executed
and has not passed. The approved deferral asks the Founder to accept that
criterion as outstanding operational work rather than misrepresent it as
completed engineering evidence.

# Why Observation Remains Disabled

ADR-045 permits provisional operation only for independently verified
capabilities. The required third-party runtime is unavailable, so live
observation assumptions remain uncertain. Observation is therefore listed as
an uncertain capability and mechanically excluded from runtime eligibility.

This is fail-closed behaviour, not an implementation workaround. Promoting the
profile without live evidence would violate ADR-045 and the Founder directive.

# Closure Ambiguity Assessment

Closing the engineering Sprint creates no architectural ambiguity if closure
language explicitly separates implementation, source/synthetic certification,
operational certification, deployment and activation.

It creates no commercial commitment because Oracle will not claim Minecraft
support and no purchase, licence, distribution or partnership is implied.

It creates no account-safety ambiguity because observation remains disabled,
no gameplay automation exists and the operational profile is not supported.

It creates no governance ambiguity because Operational Certification Deferred
is a Sprint/programme status, not a fifth ADR-045 certificate state. The
certificate remains `provisionally-certified`.

# Completing Certification Later

An authorised tester may later provide the exact approved environment:

- Windows;
- Minecraft: Java Edition `26.1.1`;
- English (United States);
- GUI scale 3;
- at least 1280 by 720;
- windowed or borderless-windowed;
- Founder-controlled single-player world; and
- no multiplayer, Realms, server, mod, add-on, plugin or API.

The tester can execute the existing live attached-window certification
procedure and record fresh operational evidence. If it passes, Oracle should
issue the appropriate immutable successor compatibility certificate or review
record under ADR-045. Historical Sprint 27 evidence and this deferral remain
unchanged. Sprint 27 does not need to be reopened or rewritten.

Failure, mismatch or material policy/version change leaves observation
disabled and may expire or revoke the applicable certificate.

# Required Canonical Wording

## Sprint Index

> Operational Certification Deferred — Required Test Environment Unavailable;
> source complete; source/synthetic certification passed; Founder acceptance
> pending; live profile provisional and observation disabled.

## Project Board

> Sprint 27 source implementation and source/synthetic certification are
> complete. Live Minecraft observation is untested because the required
> third-party environment is unavailable. The compatibility profile remains
> provisionally certified and observation remains disabled.

## Roadmap

> Sprint 27 engineering is complete within the approved bounded architecture.
> Operational Minecraft observation certification is deferred, conveys no
> support claim and remains fail-closed.

## Implementation Status

> Source complete and source-certified. Operational Certification Deferred —
> Required Test Environment Unavailable. Live profile provisional; observation
> disabled; undeployed and inactive.

# Recommendation on Sprint 28

Sprint 28 may begin after Founder acceptance and closure of Sprint 27 without
representing Minecraft as operationally supported.

Sprint 28 must treat Minecraft observation as unavailable and must not depend
on it for any acceptance criterion, walkthrough, support statement, default
configuration or production journey. Later operational certification can
enable only the separately verified capability through ADR-045.

# Authority Boundary

Accepting this package would authorise closure of Sprint 27 as an engineering
and architectural Sprint only.

It would not authorise:

- Minecraft operational support;
- promotion of the provisional certificate;
- observation activation;
- production deployment;
- database migration;
- runtime persistence or persisted producers/consumers;
- retention or upload;
- multiplayer, APIs, mods or automated input;
- authoritative mutation;
- Gate C;
- Guidance v2;
- Desktop Platform API v2; or
- Sprint 28 implementation.

# Founder Decision Requested

Approve or reject the recommendation to accept and close Sprint 27 with:

- source implementation complete;
- source and synthetic certification passed;
- Operational Certification Deferred — Required Test Environment Unavailable;
- the exact compatibility profile remaining `provisionally-certified`;
- observation remaining disabled; and
- all deployment, activation and support authority withheld.
