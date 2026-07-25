# SPRINT 26 FOUNDER DECISION REQUIRED

**Sprint:** 26 — Authoritative Companion Guidance Delivery
**Status:** Founder activation decision required; implementation not started
**Prepared:** 25 July 2026

## Decision requested

Approve Option A and authorise Sprint 26 planning, source implementation, local
desktop verification, certification, manifest reconciliation and
documentation reconciliation under existing ADR-031, ADR-032, ADR-040 and
ADR-041.

No new ADR is recommended.

## Architectural problem

Oracle already has:

- authoritative live Desktop Companion Session and Context ownership;
- immutable Guidance, Guidance Request and Session projection contracts;
- an explicitly injected deterministic Guidance Provider Service;
- a reviewed Call of Duty curated Guidance package;
- an Application-owned renderer-safe state model; and
- a `/companion` presentation that intentionally reports unavailable.

The missing seam is lifecycle-safe delivery. Authoritative Desktop Session
Context is not yet projected into a Guidance Request, executed through the
approved Service, transformed into Application state or delivered through the
restricted renderer bridge. The desktop shell still opens `/oracle`.

Sprint 26 must connect those accepted foundations without duplicating Session
authority, retaining stale Guidance, expanding renderer privilege or changing
the External Companion boundary.

## Options

### Option A — Desktop-owned transient delivery coordinator

Recommended.

The Desktop Companion owns an instance-scoped delivery coordinator because it
already owns live attachment and Context. The coordinator:

- receives immutable snapshots from the existing Session Manager;
- constructs version 1 Guidance Session and Request projections;
- invokes the explicitly injected Platform Guidance Provider Service;
- projects results through the existing Companion Guidance Application model;
- publishes validated immutable Application state over additive restricted IPC;
- accepts only bounded category, spoiler and explicit-request controls;
- clears obsolete state on detach, game/context identity change, renderer
  replacement and recovery;
- rejects late async results using a monotonic generation identity;
- enforces source freshness and Guidance expiry before presentation; and
- remains transient and performs no authoritative mutation.

The Desktop shell loads `/companion`. Curated Guidance remains available
offline. Provider failure yields partial-success or unavailable state without
fabrication.

Guidance contract version 1 and Desktop Platform API version 1 remain intact.
The restricted renderer bridge gains only validated immutable state and
bounded control messages; it gains no controller, native, process, Service or
Repository access.

Canonical manifest version 1.5.0 records the changed runtime lifecycle while
preserving exact mechanical Web/Electron composition verification.

Advantages:

- closes the deferred Sprint 14 seam using accepted ownership;
- preserves sole Desktop Context and Session Service lifecycle authorities;
- prevents stale or late Guidance from surviving context transitions;
- preserves offline deterministic operation;
- adds no migration, persistence or model dependency; and
- does not require Guidance v2 or Desktop Platform API v2.

Disadvantages:

- transient category and spoiler choices reset with the Desktop process;
- live delivery remains limited by externally observable Context;
- the coordinator adds concurrency and recovery state that requires extensive
  lifecycle certification.

### Option B — New Platform Guidance Delivery Service

Add a shared Service that owns live delivery state and subscriptions.

Advantages:

- potentially reusable across future hosts;
- centralises delivery lifecycle.

Disadvantages:

- duplicates Desktop Companion authority over live Context;
- introduces lifecycle state into the shared Platform without a non-Desktop
  consumer;
- risks merging the Platform and Desktop Companion boundaries rejected by
  ADR-040; and
- would likely require a new ADR and manifest subsystem.

Not recommended.

### Option C — Renderer or web-owned Guidance execution

Let `/companion` construct requests, select providers and execute Guidance.

Advantages:

- superficially simple UI wiring.

Disadvantages:

- moves Service orchestration and Context interpretation into presentation;
- expands renderer authority and attack surface;
- permits stale state across attachment transitions; and
- conflicts with ADR-032.

Rejected.

### Option D — Retain the unavailable seam

Advantages:

- no implementation risk.

Disadvantages:

- leaves the principal Sprint 14 deferral unresolved;
- provides no authoritative live Companion Guidance; and
- blocks the Sprint 27 multi-game proof.

Rejected.

## Long-term implications

Option A creates one reusable transient delivery pattern:

```text
Desktop Session Context
  -> immutable Guidance Request
  -> injected Guidance Provider Service
  -> Application-owned state
  -> validated restricted renderer projection
```

Future Game Integrations contribute providers without gaining delivery or
Session authority. Future presentation changes consume Application state
without provider knowledge. Persisting controls, introducing personalisation
from governed Understanding, or adding a remote delivery host remains separate
future work.

## ADR impact

No ADR is created or amended. Implementation is governed by:

- ADR-031 — permanent External Companion boundary;
- ADR-032 — Companion Guidance ownership and version 1 contracts;
- ADR-040 — explicit composition, lifecycle and manifest equality;
- ADR-041 — sole Session Service durable lifecycle authority.

If implementation discovers that Guidance v2, Desktop Platform API v2,
Platform/Desktop authority merging, or a new trust boundary is necessary, work
must stop for a new Founder-approved ADR.

## Reversibility

The coordinator, IPC transport, refresh policy and UI controls are replaceable
behind existing versioned contracts. Additive renderer channels can be retired
after consumers migrate. No stored data or migration makes the decision
irreversible.

Changing the Guidance contract incompatibly, merging lifecycle owners or
crossing the External Companion boundary is not covered and requires future
governance.

## Risks and controls

- **Stale or late Guidance:** generation identities, Context fingerprints,
  expiry checks and immediate clearing.
- **Renderer privilege expansion:** exact schemas, sender authorization,
  immutable projections and no implementation-object exposure.
- **Provider failure:** isolated execution with partial-success/unavailable
  projection.
- **Process replacement or recovery:** fresh coordinator construction and
  snapshot replay only from current authoritative Context.
- **Hidden ranking or personalisation:** preserve provider order; no
  personalisation in Sprint 26.
- **Spoilers:** conservative default and bounded Operator maximum.
- **Source staleness:** explicit reviewed-source freshness policy and
  fail-closed omission.
- **Fair Play drift:** external metadata only; no injection, memory access,
  hooks, automation or simulated input.

## Authority requested

Approval should authorise:

- Sprint 26 planning and implementation;
- transient Desktop Companion Guidance delivery;
- compatible additive restricted-renderer contracts;
- local desktop end-to-end verification and certification;
- manifest version 1.5.0 reconciliation; and
- documentation and Project Board updates.

Approval should not authorise:

- production deployment or production environment changes;
- any database migration;
- runtime persistence or persisted producers/consumers;
- retention of Guidance requests, controls or delivery history;
- Gate C;
- Guidance v2 or Desktop Platform API v2;
- AI-generated Guidance;
- persisted or hidden personalisation;
- Session lifecycle mutation;
- renderer access to Services, Repositories, controllers, native handles or
  process details;
- External Companion trust-boundary changes; or
- weakening ADR-031, ADR-032, ADR-040, ADR-041, ADR-042 or ADR-043.

## Recommendation

Approve Option A. It is the narrowest design that completes authoritative live
Guidance delivery while preserving every established ownership, security,
manifest and Fair Play boundary.
