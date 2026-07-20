# DESKTOP PLATFORM API COMPATIBILITY

**Current API:** `oracle.desktop-platform-api`
**Current version:** `1`
**Supported import:** `desktop/platform/index.js`

---

# Public Surface

`desktop/platform/index.ts` is the sole supported public import surface for
external Desktop Platform consumers. Existing imports between internal desktop
modules may continue to use leaf modules, but new external consumers must not
import those modules directly.

The version 1 surface contains only the immutable, serializable Host Snapshot,
Host Event, Diagnostic, Recovery, Timeline Entry and Telemetry Snapshot
contracts listed by `ORACLE_DESKTOP_PLATFORM_API_MANIFEST`.

Desktop services, controllers, builders, coordinators, Electron objects,
native helpers and game-specific knowledge are not public API.

---

# Compatibility Guarantees

Within API version 1, Oracle guarantees that:

- existing exported names will retain their meaning
- existing contract identifiers will not change
- existing serialized fields will not be removed or renamed
- existing field meanings and value types will remain compatible
- existing union members will not be removed
- the supported public import path will remain available

---

# Allowed Version 1 Changes

Compatible changes may include:

- documentation and comment improvements
- internal implementation changes that do not affect public contracts
- new optional fields with safe defaults and documented consumer handling
- new public contracts or exports added without changing existing behavior
- new union members only when consumers are documented and designed to handle
  unknown future values safely

Every addition must remain immutable, serializable, game-agnostic and free of
Electron or native implementation objects.

---

# Prohibited Version 1 Changes

API version 1 must not:

- remove or rename a public export
- remove, rename or change the type of a serialized field
- change a contract identifier
- reuse a contract version for an incompatible schema
- narrow an existing union
- expose mutable controllers, services, Electron objects or native handles
- require consumers to import a leaf module

An incompatible contract schema must increment that contract's version. A
change that breaks the Desktop Platform public surface requires API version 2.

---

# API Version 2

Desktop Platform API version 2 may be introduced only through an accepted ADR
that documents the reason, alternatives, migration path, compatibility period
and consumer impact. Version 1 must not be removed without an explicit
migration and deprecation decision.
