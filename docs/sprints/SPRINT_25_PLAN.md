# SPRINT 25 PLAN — CONVERSATIONAL ORACLE

**Status:** Active — Founder-approved 25 July 2026
**Architecture:** ADR-043
**Deployment:** Not authorised

## Objective

Deliver a transient, evidence-grounded conversational boundary that retrieves
and explains authoritative Oracle knowledge without becoming a truth,
mutation or retention authority.

## Scope

1. Versioned intent, retrieval, evidence-packet, provider and response
   contracts.
2. Deterministic allowlisted intent classification and read-only retrieval.
3. Evidence closure, freshness gates, isolation and renderer-safe provenance.
4. Optional bounded model synthesis with deterministic factual fallback.
5. Injection, prohibited-request, stale-data and clarification policies.
6. Oracle Brain application and Web/Electron manifest reconciliation.
7. Reviewed synthetic quality corpus and local certification.

## Exclusions

No migration, retention, runtime-persistence activation, persisted producer or
consumer, direct model tool or mutation, deployment, Gate C or External
Companion trust-boundary change is authorised.

## Exit criteria

Conversation cannot mutate authoritative state; retrieval remains
authenticated, scoped, allowlisted and read-only; provider failure retains a
deterministic answer; model evidence references close over admitted evidence;
renderer responses expose provenance and limitations; adverse cases fail
safely; manifests match mechanically; and complete verification passes.
