# SPRINT 27 CERTIFICATION

**Status:** Operational Certification Deferred — Required Test Environment
Unavailable; source and synthetic certification passed and Founder-accepted;
Sprint closed; live observation untested and disabled
**Date:** 25 July 2026
**Environment:** Windows development workstation
**Production affected:** No

---

# Certification Result

Sprint 27 passes its bounded source and synthetic local certification. The
workstation does not currently contain a Minecraft installation or running
`javaw.exe` game window, so the exact live observation profile is correctly
`provisionally-certified`. Observation is the uncertain capability and remains
disabled until it is reverified against the installed pinned game.

The dedicated suite proves:

- exact Minecraft Java `26.1.1` single-player detection;
- rejection of other versions, multiplayer and the launcher;
- all four compatibility-certificate lifecycle states, including the declared
  provisional profile;
- fail-closed provisional uncertainty, expiry, revocation and profile mismatch;
- the 90-day maximum review interval;
- deterministic original text-only Guidance with spoiler bounds;
- rejection of non-single-player Guidance;
- explicit consent before observation;
- allowlisted local frame derivation;
- raw-buffer overwrite after recognition;
- pixel-free and handle-free renderer projection;
- pause and revocation invalidation;
- absence of upload, storage and automated-input paths; and
- ADR-040 exact manifest/runtime equality for version `1.6.0`.

This report does not claim a successful live-game capture. Promoting the
certificate to `certified` requires one local test using Minecraft: Java
Edition `26.1.1`, English (United States), GUI scale 3, a Founder-controlled
single-player world and a visible windowed or borderless-windowed game window
of at least 1280 by 720.

The Founder has approved deferral because the required third-party runtime is
unavailable and will not be purchased solely for certification. Deferral does
not alter ADR-045: the certificate remains `provisionally-certified`,
observation remains disabled, and no operational-support claim is permitted.

**Founder acceptance status:** Accepted and closed on 25 July 2026. This does
not alter the deferred operational certificate: it remains provisional and
observation remains disabled.

# Commands

```text
npm.cmd run sprint-27:verify
npm.cmd run platform-composition:verify
npx.cmd tsc --noEmit
```

The complete repository verification results are recorded in the evidence
README after final execution.

The accepted Sprint 17 load evidence remains authoritative under the Sprint 22
Founder directive because Sprint 27 changes none of its query paths,
assumptions or performance characteristics. Its native-`psql` harness was
therefore not modified merely to duplicate accepted load evidence. Migration
010's immutable hashes and downstream canonical-chain execution were
reverified without changing or deploying it.

# Lifecycle and Production Boundary

Migration 009 remains the only production-deployed migration. Migrations
010–014 remain implemented and certified, undeployed and inactive. No Migration
015 was created. Runtime persistence and persisted producers/consumers remain
disabled. Gate C remains deferred. Sprint 27 is not deployed or activated.
