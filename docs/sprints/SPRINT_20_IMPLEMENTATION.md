# SPRINT 20 IMPLEMENTATION REPORT

**Sprint:** 20 — Platform Runtime Activation

**Status:** Implementation complete; locally certified; awaiting Founder
closure

**Date:** 24 July 2026

**Authority:** ADR-040 and Founder-approved Sprint 20 Plan

**Production change:** None

## Outcome

Oracle now has explicit target-specific Web and Electron composition roots
constructing one shared dependency-injected Platform runtime.

The immutable versioned composition manifest is canonical. Each target declares
its manifest independently, constructs instance-owned registries and providers,
and fails closed unless the constructed Service, Application, Game Integration
and Guidance identities exactly equal the declaration in the declared order.

## Implemented architecture

- `instrumentation.ts` invokes the Web root for the Node.js Next.js runtime.
- `desktop/main.ts` starts and stops the Electron root.
- `lib/oracle/composition/` owns lower-layer assembly outside the Platform.
- `lib/oracle/platform/` owns composition contracts, manifest validation,
  lifecycle, readiness, recovery and health projection.
- Service and Application process-global registries were removed.
- Service, Application and Game Integration registries are instance-owned.
- the Services-owned Guidance Provider Service is injected explicitly.
- required subsystems fail startup closed.
- optional failures produce an observable degraded state.
- recovery discards the previous runtime and constructs fresh registries,
  providers, extension state and Platform Companion state.
- the renderer-safe `oracle.platform-health` version 1 projection is available
  through the restricted Electron bridge.
- Electron reuses the Platform-composed Game Integration registry instead of
  constructing a second hidden registry.

## Companion ownership

The versioned lifecycle contract preserves two different authorities:

| Lifecycle | Owner |
|---|---|
| Platform Companion capability readiness | Oracle Platform |
| Desktop Companion Session and Context | Desktop Companion Session Manager |

The authorities are composed and observable but not merged. No Session
lifecycle authority moved into the Platform Companion Runtime.

## Canonical manifest inventories

Both target version `1.0.0` manifests declare:

- 7 runtime subsystems;
- 10 Services;
- 6 Applications;
- 1 Game Integration (`call-of-duty`);
- 1 Guidance provider
  (`game-integrations.call-of-duty.curated-guidance`).

Web and Electron differ by target identity, not by hidden capability
construction.

## Legacy seam

The dependency audit baseline fell from 55 stored exceptions to 47. Eight
resolved entries were removed from the baseline, so they cannot return without
failing certification.

Existing web Application-to-internal imports remain measured later migration
work. Sprint 20 did not perform a wholesale Application rewrite.

## Authority preserved

- no migration was executed or modified;
- Gate C remains deferred;
- runtime persistence remains disabled;
- no persisted producer or consumer was activated;
- production was not changed;
- the External Companion boundary was not changed;
- Desktop Platform API version 1 was not superseded.
