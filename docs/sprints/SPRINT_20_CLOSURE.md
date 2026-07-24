# SPRINT 20 CLOSURE

**Sprint:** 20 — Platform Runtime Activation

**Status:** Complete, certified and Founder-accepted

**Closed:** 24 July 2026

**Deployment:** Not authorised and not performed

## Founder acceptance

The Founder accepted the Sprint 20 implementation and certification evidence
and formally closed the Sprint.

The accepted delivery comprises:

- explicit Web and Electron composition roots;
- one shared dependency-injected Oracle Platform runtime;
- immutable canonical composition manifests;
- mechanical equality verification between each declared manifest and its
  constructed runtime;
- instance-owned registries;
- fail-closed required subsystems;
- observable degraded states for optional subsystems;
- renderer-safe health projections;
- explicit Platform Companion and Desktop Companion lifecycle ownership; and
- fresh-runtime recovery semantics.

## Permanent runtime-contract directive

The runtime composition manifest is a permanent architectural contract.

Every future Sprint that introduces, removes or alters a Service, Application,
Game Integration, Guidance provider, required or optional subsystem
classification, or runtime lifecycle behaviour must update the canonical
manifest and preserve mechanical manifest-to-runtime equality verification.

No Sprint may bypass or weaken that verification without a superseding ADR
approved by the Founder. Architectural work should continue reducing the
remaining dependency-boundary exceptions where practical without compromising
delivery.

This directive reinforces ADR-040. It does not rewrite the accepted,
append-only ADR record.

## Certification environment

Sprint 20 certification completed after the development workstation was
upgraded to support Docker Desktop and WSL2 through a motherboard BIOS update.
That work enabled disposable PostgreSQL certification environments. It was an
engineering environment prerequisite only and changed neither Oracle
architecture nor production behaviour.

## Lifecycle state

| Capability | Implemented | Certified | Deployed | Activated |
|---|---:|---:|---:|---:|
| Web composition root | Yes | Yes | No | No |
| Electron composition root | Yes | Yes | No | No |
| Canonical composition manifests | Yes | Yes | No | No |
| Shared injected Platform runtime | Yes | Yes | No | No |
| Runtime persistence | Prior architecture only | Prior evidence | No | No |

Production remains unchanged. Migration 009 is the only deployed migration.
Migrations 010, 011 and 012 remain implemented and certified, undeployed and
inactive. Runtime persistence remains disabled, and Gate C remains deferred.

## Authority boundary

Closure does not authorise:

- production deployment;
- execution of Migration 010, 011 or 012;
- reopening Gate C;
- runtime persistence;
- production trust-boundary changes; or
- production environment changes.

Sprint 21 may proceed only within the Constitution, Codex, accepted ADRs and
approved Engineering Programme. Its expected durable Session lifecycle ADR
requires a separate Founder architectural decision before implementation.
