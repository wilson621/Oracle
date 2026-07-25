# SPRINT 27 IMPLEMENTATION

**Sprint:** Contextual Companion and Reference Integration
**Status:** Source complete and source-certified; exact live observation
profile remains provisionally certified
**Date:** 25 July 2026
**Deployment:** Not authorised
**Persistence:** Disabled

---

# Delivered

- ADR-044 and ADR-045 are accepted architectural records.
- Minecraft: Java Edition `26.1.1` is registered as Oracle's bounded second
  Beta reference integration on Windows.
- Detection requires `javaw.exe` and the exact single-player title. Other
  versions, multiplayer titles and the launcher fail closed.
- An immutable provisional compatibility certificate binds version, executable, locale,
  display mode, minimum window size, UI scale, player mode, observation method,
  capability set, reviewed policy sources and a maximum 90-day lifetime.
- Detection, Context, Guidance and transient progress conformance are verified.
  Observation remains explicitly uncertain and disabled until the installed
  pinned game passes the live attached-window test.
- Certificate resolution mechanically implements `certified`,
  `provisionally-certified`, `expired` and `revoked`. Provisional uncertainty
  disables every affected capability.
- One original, deterministic, text-only diamond discovery journey provides
  four Operator-selected spoiler levels. It never infers or awards completion.
- Desktop observation is disabled by default and requires explicit transient
  consent for the current attachment.
- Electron captures only an allowlisted region of the uniquely matched attached
  native window. Matching is by native handle, never title alone.
- Raw pixel buffers remain inside one local operation and are overwritten in a
  `finally` boundary. No screenshot, clip, serialization, storage, upload,
  external processing or renderer pixel path exists.
- The only derived observation states that a non-uniform game frame was visible.
  It is confidence-bearing, purpose-scoped, expires after two seconds and is
  explicitly non-authoritative.
- The restricted renderer receives a validated immutable observation state,
  visible on/off/paused indication and bounded enable/observe/pause/revoke
  controls. It receives no handles, sources, pixels, recognizers or controllers.
- Web and Electron composition manifests are version `1.6.0` and exactly list
  both Game Integrations and both Guidance providers.

# Explicitly Not Implemented

No production deployment, migration, persistence, retained progress, raw-frame
retention, external processing, multiplayer, Realms, server support, mods,
add-ons, plugins, Minecraft API, AI Guidance, automated input, authoritative
mutation, Gate C, Guidance v2, Desktop Platform API v2 or External Companion
trust-boundary change was introduced.

# Files of Record

- `docs/Decisions.md` — ADR-044 and ADR-045
- `docs/sprints/SPRINT_27_PLAN.md`
- `lib/oracle/game-integrations/compatibility`
- `lib/oracle/game-integrations/minecraft-java`
- `desktop/companion/companion-screen-observation-*`
- `desktop/companion/electron-local-window-capture.ts`
- `scripts/verify-sprint-27.ts`
- `docs/sprints/evidence/sprint-27`
