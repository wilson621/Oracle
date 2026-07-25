# SPRINT 26 PLAN — AUTHORITATIVE COMPANION GUIDANCE DELIVERY

**Status:** Implemented and locally certified; Founder acceptance required
**Architecture:** ADR-031, ADR-032, ADR-040, ADR-041, ADR-042 and ADR-043
**Deployment:** Not authorised

## Objective

Deliver validated transient Guidance from authoritative Desktop Companion
Session Context to the `/companion` presentation without creating knowledge,
Session, persistence or renderer authority.

## Scope

1. Desktop-owned instance-scoped transient Guidance delivery coordinator.
2. Immutable Session-to-Guidance Request projection.
3. Explicit injected deterministic provider execution and source freshness.
4. Renderer-safe loading, ready, empty, partial-success and unavailable state.
5. Compatible additive restricted-renderer state, subscription and bounded
   category/spoiler request controls.
6. Attach, detach, Context change, stale-result, renderer replacement and
   recovery invalidation.
7. Offline curated and provider-failure behavior.
8. Desktop shell `/companion` integration.
9. Manifest version 1.5.0 exact equality certification.
10. End-to-end desktop lifecycle certification and documentation.

## Exclusions

No deployment, migration, persistence, retention, delivery history, Gate C,
Guidance v2, Desktop Platform API v2, AI Guidance, hidden personalisation,
Session mutation, renderer privilege expansion or External Companion
trust-boundary change is authorised.

## Exit criteria

A supported attached Session produces only validated current Guidance.
Obsolete and late results cannot reach presentation. Detach and recovery clear
Guidance. Controls remain bounded and transient. Offline and provider-failure
states are honest. Exact manifest/runtime equality and complete verification
pass.
