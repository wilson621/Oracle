# ORACLE SPRINT 20 ENGINEERING PLAN

**Sprint:** 20 — Platform Runtime Activation
**Authority:** Founder-approved Sprint Plan beneath ADR-040 and the Oracle
Engineering Programme
**Owner:** Oracle Platform Engineering
**Status:** Complete, certified and Founder-accepted
**Classification:** Living approved Sprint Plan
**Expected Stability:** Scope changes require explicit Founder approval
**Prepared:** 24 July 2026
**Approved:** 24 July 2026
**Activated:** 24 July 2026
**Closed:** 24 July 2026
**Production:** No deployment or production-environment change authorised

---

# Objective

Activate Oracle's established Platform composition model in production-capable
Web and Electron source entry points without deploying it, enabling runtime
persistence or changing production.

# Architectural Authority

Sprint 20 implements ADR-040. The runtime composition manifest is the canonical
runtime contract. Constructed runtime identities must mechanically equal the
independently declared manifest. Any divergence is an architectural failure.

# In Scope

- explicit Web and Electron composition roots;
- one shared dependency-injected Platform runtime;
- instance-owned Service, Application and Game Integration registries;
- explicit Guidance provider composition;
- immutable versioned target manifests;
- exact manifest-to-runtime mechanical verification;
- required fail-closed and optional degraded readiness;
- renderer-safe unified health projection;
- fresh runtime recovery attempts;
- explicit Platform/Desktop Companion lifecycle contract;
- Next.js server instrumentation invocation;
- Electron main startup and shutdown invocation;
- controlled non-growing legacy registry seam;
- architecture, governance, verification and certification evidence.

# Explicit Exclusions

- deployment;
- Migration 010, 011 or 012 execution or modification;
- any new database migration;
- Gate C reopening or execution;
- runtime persistence activation;
- persisted producer or consumer activation;
- production environment changes;
- External Companion trust-boundary changes;
- Desktop Platform API version 2;
- authoritative Session lifecycle;
- live Companion Guidance delivery;
- wholesale legacy Application migration.

# Required Runtime Contract

Each target manifest declares:

- contract identity and version;
- target host;
- manifest version;
- subsystem identities and required/optional classification;
- Service identities;
- Application identities;
- Game Integration identities; and
- Guidance provider identities.

Certification must prove exact equality with the constructed registries and
providers. Runtime construction cannot generate or silently repair its own
manifest.

# Lifecycle Ownership

| Responsibility | Owner |
|---|---|
| Web host startup | Next.js server instrumentation |
| Desktop host startup and shutdown | Electron main |
| Oracle capability composition and readiness | Shared Platform runtime |
| Platform Companion capability readiness | Platform Companion Runtime |
| Desktop Session and Context lifecycle | Desktop Companion Session Manager |
| Game-specific knowledge | Injected Game Integrations |
| Guidance generation boundary | Injected Guidance Provider Service |
| Renderer projection | Immutable Platform health contract |

# Verification

Certification will cover:

- exact manifest equality and intentional divergence failure;
- duplicate identity rejection;
- required subsystem failure;
- optional subsystem degradation;
- fresh recovery identity and state;
- renderer-safe serialisation;
- Platform/Desktop Companion ownership separation;
- Web and Electron entry-point wiring;
- absence of global registry use in production roots;
- dependency-boundary non-growth;
- TypeScript, Desktop TypeScript, ESLint and production build;
- existing Oracle regression suites;
- immutable Migration 009–012 hashes.

# Definition of Done

- supported Web and Electron source entry points invoke their approved roots;
- constructed runtime exactly equals its declared manifest;
- Platform readiness is observable and renderer-safe;
- required subsystems fail closed;
- optional failures remain isolated;
- recovery constructs a fresh runtime;
- Platform and Desktop Companion ownership remains distinct;
- the legacy boundary baseline does not grow;
- runtime persistence remains disabled;
- no production or migration state changes;
- evidence and living documentation reflect verified reality.
