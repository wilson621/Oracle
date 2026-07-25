# SPRINT 25 FOUNDER DECISION REQUIRED

**Sprint:** 25 — Conversational Oracle
**Status:** Decision accepted; superseded by ADR-043 and Sprint 25 plan
**Prepared:** 24 July 2026
**Resolution:** Option A and ADR-043 Founder-approved 25 July 2026; superseded
by `SPRINT_25_PLAN.md`.

## Decision requested

Approve Option A and authorise ADR-043 — Grounded Conversation, Model Provider,
Provenance and Retention Boundaries.

## Problem

Oracle must answer natural-language questions about Sessions, reports,
Understanding, coaching, Missions, Planner, progression and reviewed game
knowledge without turning a model into a truth source or giving untrusted text
authority over Services.

The current `/oracle` surface is a legacy prompt UI connected to a deliberately
inactive analysis route. Oracle has no approved contract defining:

- who owns conversational orchestration;
- which Services may be retrieved and how ownership is enforced;
- whether a model can select or invoke tools;
- how retrieved evidence and model text remain distinguishable;
- how prompt injection is contained;
- what conversation content may be retained;
- what external provider receives;
- how provenance, freshness and uncertainty are projected; or
- what happens when a provider is unavailable.

These are architecture, security, privacy and product-policy decisions and
cannot be invented during implementation.

## Options

### Option A — Grounded transient Conversation Service

Recommended.

- Conversation Service owns orchestration, intent classification, retrieval
  plans, prompt versions, response validation and renderer-safe projection.
- Existing Services remain authoritative for every fact and mutation.
- Retrieval is authenticated, allowlisted, purpose-scoped and read-only.
- The model receives a minimised evidence packet, not arbitrary repository or
  tool access.
- Model output is non-authoritative presentation synthesis.
- Deterministic handlers answer core factual intents and provide outage
  fallback.
- Every substantive answer includes evidence, provenance, confidence,
  freshness, scope and limitations.
- Instructions, retrieved data and user text are structurally separated.
  Retrieved or user-controlled content cannot issue system or tool commands.
- Conversation turns are transient by default. Sprint 25 stores no transcript,
  prompt or raw provider response.
- Explicit future conversation history requires a separate retention decision
  and Trust & Control integration.
- Provider failure creates an observable degraded state, never fabricated
  success.

Advantages:

- preserves Service truth and all existing lifecycle authorities;
- minimises privacy exposure and retention scope;
- contains prompt injection and provider dependence;
- keeps factual Oracle useful without a model;
- avoids Migration 015.

Disadvantages:

- no cross-device conversation history in Sprint 25;
- users must restate context not represented by governed Oracle records;
- strict grounding may refuse broad or underspecified questions.

### Option B — Persist complete conversation history

Store prompts, responses and evidence packets for continuity.

Advantages:

- multi-turn and cross-device continuity;
- easier support and quality review.

Disadvantages:

- creates a new sensitive retention domain;
- risks storing injected, irrelevant or personal content;
- requires Migration 015, deletion/export topology and explicit retention
  durations;
- can make generated text appear to be durable Oracle truth.

Rejected for Sprint 25.

### Option C — Model-native agent with direct tools

Allow the model to choose and invoke Service or Repository tools dynamically.

Advantages:

- broad flexibility;
- faster expansion of supported questions.

Disadvantages:

- prompt injection can influence authority-bearing actions;
- tool selection becomes opaque and provider-dependent;
- threatens cross-Operator isolation and source ownership;
- conflicts with deterministic and evidence-first principles.

Rejected.

### Option D — Deterministic conversation only

Use intent templates and Service projections without a language model.

Advantages:

- strongest predictability and offline behaviour;
- minimal provider/privacy risk.

Disadvantages:

- limited natural-language usefulness;
- brittle clarification and synthesis;
- does not fulfil the intended conversational product objective.

Rejected as the sole mode; retained as the required fallback.

## Recommended ADR-043 rules

1. Conversation Service owns orchestration, not underlying truth.
2. Source Services remain authoritative and are retrieved read-only through
   authenticated contracts.
3. The model has no direct Repository, mutation, progression, Session,
   Understanding, Mission or tool authority.
4. Model output is schema-validated non-authoritative synthesis.
5. Factual assertions must map to supplied evidence references.
6. Unsupported, stale, prohibited or cross-Operator requests refuse or clarify.
7. Intent and retrieval planning are deterministic and allowlisted.
8. User text and retrieved content are untrusted data, never instructions.
9. Conversation content is transient by default and creates no Evidence,
   Understanding, Memory or retention authority.
10. No transcript, raw prompt or provider response persistence is implemented
    in Sprint 25.
11. External provider packets are minimised and exclude credentials, raw
    observations and unrelated Operator data.
12. Provider unavailability degrades to deterministic responses where possible.
13. Renderer projections include answer, evidence, confidence, scope,
    freshness, limitations and provider/degraded state without private
    diagnostics.
14. Quality evaluation uses reviewed synthetic or explicitly authorised
    fixtures, not retained production conversations.

## Proposed scope

- accept ADR-043;
- implement versioned intent, retrieval-plan, evidence-packet and response
  contracts;
- implement Conversation Service and model-provider abstraction;
- implement deterministic factual handlers and bounded model synthesis;
- implement injection, stale-data, refusal and clarification policies;
- replace the legacy `/oracle` prompt path with authenticated conversational
  Application orchestration;
- create a quality corpus for known, uncertain, stale, prohibited, injected and
  cross-Operator cases;
- update canonical manifests and mechanically verify equality;
- perform local certification and documentation reconciliation.

No Migration 015 is recommended because conversation retention is excluded.

## Long-term implications

Oracle gains one reusable conversational boundary for Web, Desktop, voice and
future clients without making conversation a fifth source of truth. A future
history feature can be added behind explicit retention and deletion policy
without changing answer grounding.

## Reversibility

Model providers, prompt versions, intent classifiers and synthesis
implementations are replaceable behind versioned contracts. Transient default
retention can later become explicit opt-in history through a separately
approved ADR and migration. Granting models direct authority would require a
superseding Founder-approved ADR.

## Risks

- hallucinated synthesis despite grounded packets;
- prompt injection through user or retrieved content;
- privacy leakage to a provider;
- stale or incomplete source projections;
- provider outage;
- excessive refusals; and
- conversational text being mistaken for new Evidence.

Controls are strict schemas, evidence-reference closure, allowlisted retrieval,
instruction/data separation, minimisation, transient handling, deterministic
fallback, freshness gates, renderer-safe provenance and evaluation.

## Authority requested

Approval should authorise only ADR-043 creation/acceptance, Sprint 25 planning,
source implementation, local verification, certification, manifest
reconciliation and documentation.

It should not authorise production deployment, any migration, conversation
retention, runtime persistence, persisted producers/consumers, Gate C,
production changes, model mutation authority, External Companion
trust-boundary changes or weakening ADR-040 through ADR-043.

## Recommendation

Approve Option A. It is the only option that delivers natural conversation
while preserving Oracle truth, minimising retention and preventing a model or
prompt from gaining architectural authority.
