# SPRINT 27 FOUNDER DECISION REQUIRED

**Sprint:** 27 — Contextual Companion and Reference Integration
**Status:** Option A, ADR-044 and ADR-045 Founder-approved; superseded by
Sprint 27 plan
**Prepared:** 25 July 2026

## Decision requested

Approve Option A:

1. select Minecraft: Java Edition as Oracle's second Beta reference game;
2. limit Sprint 27 certification to a controlled Windows single-player
   experience using external, Operator-enabled, bounded screen observation;
3. authorise ADR-044 — Companion Observation Privacy, Consent and Ephemerality;
4. authorise ADR-045 — Game Integration Compatibility and Certification; and
5. authorise Sprint 27 planning, source implementation, local verification,
   certification, manifest reconciliation and documentation reconciliation.

## Architectural problem

Sprint 26 proved that authoritative Context can drive safe transient Guidance.
Oracle has not yet proved that the same Platform works for a materially
different game or that permitted screen observations can be admitted without
expanding the External Companion trust boundary.

The repository currently supports deterministic process/window detection and
serializable Game Context. It does not yet define:

- the selected second Beta reference game;
- the permitted observation source and exact capture scope;
- affirmative consent, indication, pause and revocation semantics;
- raw-frame, derived-observation and progress retention;
- local versus external processing;
- policy and compatibility certification validity;
- automatic invalidation when a game, policy, version or capture assumption
  changes; or
- the reusable conformance requirements for future Game Integrations.

These are product, privacy, security and architectural decisions. They cannot
be inferred during implementation.

## Inherited constraints

Every option must preserve:

- ADR-031's permanent External Companion boundary;
- ADR-032's single Guidance v1 framework;
- ADR-040 manifest/runtime equality;
- ADR-041 Session Service lifecycle authority;
- ADR-042 evidence-led progression authority;
- ADR-043's non-authoritative model boundary;
- Sprint 26's transient delivery-only authority;
- no injection, protected-memory access, hooks, executable patching, game-file
  modification, network interception, input simulation or automation;
- no renderer, provider or Game Integration mutation authority; and
- fail-closed support whenever compatibility or policy is uncertain.

## Evaluation criteria

The reference game must:

1. exercise a materially different integration pattern from Call of Duty;
2. support exploration, objective, discovery or collectible assistance;
3. permit a useful external observation flow without privileged access;
4. allow progressive spoiler-controlled Guidance;
5. present acceptable publisher, account and anti-cheat risk;
6. support a bounded certification slice rather than an unbounded content
   programme; and
7. strengthen the reusable Game Integration architecture rather than add
   game-specific logic to shared Platform code.

## Options considered

### Option A — Minecraft: Java Edition single-player reference

Recommended.

Sprint 27 certifies one pinned Minecraft: Java Edition version on Windows in a
Founder-controlled single-player world. Oracle detects the external game
window, observes only explicitly selected and allowlisted screen regions, and
locally extracts the minimum context needed for one advancement/discovery
journey. The Operator invokes any relevant Minecraft UI or debug display;
Oracle never sends input.

The initial proof uses an original text-only curated knowledge package and one
bounded advancement/discovery flow with progressive hints. It does not use or
ship Minecraft art, textures, code, game files or copied guide text. It does
not use mods, add-ons, server plugins, game-service APIs, Realms or multiplayer.

Official-policy basis reviewed on 25 July 2026:

- the Minecraft EULA expressly permits independently branded tools, plug-ins
  and services, subject to the EULA and Usage Guidelines;
- screenshots and recorded gameplay are addressed by the Usage Guidelines;
  and
- the policies remain changeable, so support must be versioned, reviewed and
  automatically expire rather than assumed permanently.

Advantages:

- materially different exploration and discovery model from Call of Duty;
- low anti-cheat exposure in the proposed single-player, screen-only scope;
- user-invoked on-screen information provides a bounded observation proof;
- strong fit for progressive hints, spoiler controls and contextual progress;
- already named as an intended Game Integration in the Constitution and
  Roadmap; and
- no External Companion architecture change is required.

Disadvantages:

- screen layout, UI scale, language and version changes can break recognition;
- Minecraft branding and content use require continuing policy review;
- the single-player proof does not certify multiplayer or third-party servers;
- reliable observation may initially require a narrow supported display,
  language and UI configuration; and
- a bounded advancement proof does not establish broad Minecraft coverage.

### Option B — Old School RuneScape external-observation reference

Use the official client and observe only visible quest or activity UI.

Advantages:

- excellent quest, objective, item and progress semantics;
- stable interface regions are suitable for contextual assistance;
- progressive quest hints strongly demonstrate the Companion product; and
- materially different from Call of Duty.

Disadvantages:

- Jagex's official rules treat third-party software that helps play
  conservatively and advise users not to proceed when classification is in
  doubt;
- approved RuneLite support does not automatically approve Oracle;
- account-safety risk remains material without written publisher
  clarification;
- dense text and UI create privacy and OCR-scope risks; and
- release certification would be blocked pending clearer permission.

This remains a viable future integration after publisher clarification, but is
not the safest Beta reference.

### Option C — Elden Ring single-player/offline reference

Observe visible map, menu or status information and provide progressive
exploration Guidance.

Advantages:

- exceptionally strong exploration, discovery, hidden-content and spoiler
  use case;
- clearly demonstrates a different product pattern from Call of Duty; and
- a narrow single-player flow can avoid competitive assistance.

Disadvantages:

- the PC title uses Easy Anti-Cheat and no official source reviewed grants
  specific approval for an external contextual assistant;
- online/offline state and anti-cheat interaction create account-safety
  ambiguity;
- visual recognition is more complex and expensive to certify;
- content and version scope are large; and
- a useful proof risks drifting into combat or hidden-state assistance.

This is strategically attractive but should remain unsupported until policy
clarity and a lower-risk observation profile exist.

### Option D — Factorio external-observation reference

Use screen-only observation of visible production and objective state.

Advantages:

- deterministic interfaces and systems support reliable structured Guidance;
- official modding documentation and ecosystem show strong extension support;
- low competitive and anti-cheat risk; and
- excellent future optimisation and planning opportunities.

Disadvantages:

- Factorio's most reliable structured integration route is its in-process mod
  API, which Sprint 27 may not use under ADR-031;
- screen-only observation would ignore the game's strongest integration
  mechanism while providing a weaker exploration/hidden-content proof;
- the initial objective is less representative of Companion discovery; and
- using a mod would require a separate Founder decision about the External
  Companion boundary and is therefore outside current architecture.

Factorio remains viable for a future planning-oriented integration, not the
recommended Sprint 27 proof.

### Option E — Defer the reference-game proof

Keep Sprint 26 as the last implemented Companion capability and postpone all
screen observation and second-game work.

Advantages:

- introduces no new privacy, capture, publisher or compatibility risk;
- preserves engineering capacity for later product-completion work; and
- allows time to seek direct publisher clarification.

Disadvantages:

- leaves Oracle's supposedly game-agnostic architecture proven by only one
  game family;
- blocks the approved Sprint 27 objective and weakens Beta evidence;
- carries observation and certification uncertainty into later Sprints; and
- makes Sprint 28 product integration depend on an unproven Companion path.

Viable as a deliberate programme deferral, but not recommended.

### Candidates not carried forward

- Battlefield repeats the competitive shooter and anti-cheat profile already
  represented by Call of Duty and does not provide the required materially
  different proof.
- Football Manager is a strong future analysis integration but does not meet
  Sprint 27's exploration/discovery acceptance journey.
- Monster Hunter has attractive objective and item semantics, but a useful
  screen-only slice is less bounded and more combat-adjacent than Minecraft.

## Recommended Option A implementation boundary

### Reference scope

- Windows desktop;
- Minecraft: Java Edition;
- one pinned game version recorded in the compatibility profile;
- single-player only;
- borderless-windowed or windowed display;
- one approved locale and bounded UI-scale range;
- one original curated advancement/discovery knowledge package; and
- one end-to-end progressive-hint and transient progress journey.

Multiplayer, Realms, third-party servers, mods, add-ons, plugins, game-service
APIs and general Minecraft support remain explicitly uncertified.

### Observation boundary

- capture is off until the Operator affirmatively enables it;
- a persistent visible indicator identifies active observation;
- pause, revoke and detach stop capture immediately;
- only the attached game window and allowlisted regions may be observed;
- capture of unrelated windows, displays, notifications or background desktop
  content fails closed;
- processing is local;
- raw frames are never retained or uploaded;
- derived observations are schema-validated, confidence-bearing and transient;
- low-confidence or contradictory observations do not advance Context;
- Session-scoped progress is an ephemeral projection, not authoritative
  Session, Understanding, Mission or Progression state; and
- cross-session or durable collectible progress requires a future Founder
  retention decision, ADR and migration.

### Runtime and manifest

The Minecraft Game Integration and curated Guidance provider are explicit,
instance-owned runtime dependencies. If approved and implemented, canonical
Web and Electron manifests move together to version 1.6.0 and must continue to
match the constructed runtimes exactly. Required integration contracts fail
closed; uncertified game/version/mode combinations remain unsupported.

## ADR-044 — Companion Observation Privacy, Consent and Ephemerality

ADR-044 should establish:

1. explicit opt-in before any pixel observation;
2. a continuous renderer-safe capture indicator;
3. immediate pause, revoke, detach and process-loss invalidation;
4. target-window and allowlisted-region minimisation;
5. local processing for the Sprint 27 proof;
6. zero raw-frame retention and zero upload;
7. transient, validated, purpose-scoped derived observations;
8. confidence, freshness and contradiction handling;
9. no observation-derived authoritative mutation;
10. renderer isolation from frames, capture handles and native objects;
11. observable fail-closed degraded states; and
12. a separate Founder decision for any durable observation, progress,
    screenshot, clip, upload or provider processing.

## ADR-045 — Game Integration Compatibility and Certification

ADR-045 should establish:

1. every supported game/version/mode requires a versioned compatibility
   profile and certificate;
2. profiles record publisher rules, terms, anti-cheat, capture, overlay,
   competitive-mode, API and accessibility conclusions with review dates;
3. support is disabled unless the exact profile is currently certified;
4. policy, game-version, executable, capture or integration changes invalidate
   certification until reverified;
5. certificates expire on a defined review interval even without a detected
   change;
6. each integration passes common detection, Context, serialisation,
   observation, privacy, performance, Guidance and failure conformance tests;
7. game-specific knowledge and recognition stay inside the Game Integration;
8. shared contracts never expose process, capture or provider implementations;
9. competitive or ambiguous modes may be explicitly unsupported; and
10. certification is independent from deployment and runtime activation.

The recommended initial review interval is 90 days. A shorter emergency
invalidation path applies immediately when publisher policy or account-safety
information changes.

## Long-term implications

Option A proves the extension model without redesigning Guidance, Session or
runtime ownership. ADR-044 becomes the reusable privacy boundary for any
future visual observation. ADR-045 prevents "supported game" from becoming an
informal claim and makes policy drift mechanically visible.

The intentionally narrow first certificate creates a scalable pattern:
additional versions, locales, modes and games expand through new profiles and
evidence rather than conditionals in shared code.

## Reversibility

The reference-game selection is reversible before deployment because the Game
Integration and provider are isolated extensions. Minecraft can be removed
from the manifest without migrating authoritative data because Sprint 27
retains no observation or progress.

ADR-044's zero-retention default can later be extended only through a
Founder-approved superseding decision. ADR-045 certificates can be revoked or
allowed to expire without changing shared contracts. The External Companion
boundary is not made reversible by this decision.

## Risks introduced by the recommendation

- Minecraft policy or branding rules may change;
- UI, locale, scaling and version variation may reduce recognition accuracy;
- screen capture could include unrelated content if region enforcement fails;
- false-positive observations could present irrelevant Guidance;
- a narrow proof could be misrepresented as broad game support;
- source knowledge could accidentally reproduce protected expression; and
- observation could affect gameplay performance.

Controls are expiring compatibility certificates, original text-only curated
content, no game assets, strict window/region clipping, local processing, zero
raw retention, confidence gates, explicit compatibility labels, performance
budgets and fail-closed unsupported states.

## Authority requested

Approval should authorise only:

- Option A reference-game selection and bounded scope;
- creation and acceptance of ADR-044 and ADR-045;
- Sprint 27 planning and source implementation;
- local observation and compatibility verification;
- local certification and evidence;
- manifest version 1.6.0 reconciliation if the declared runtime changes; and
- documentation reconciliation.

Approval must not authorise:

- production deployment;
- any database migration;
- runtime persistence or persisted producers/consumers;
- raw-frame, screenshot, clip, observation or Guidance retention;
- durable contextual-progress retention;
- upload or external processing of captured content;
- multiplayer, Realms or third-party-server support;
- mods, add-ons, plugins or Minecraft game-service API access;
- broad Minecraft compatibility claims;
- Gate C;
- Guidance v2 or Desktop Platform API v2;
- AI-generated Guidance;
- automated input or gameplay;
- Session, Understanding, Mission or Progression mutation;
- renderer access to Services, Repositories, controllers, capture objects,
  native handles or process objects;
- External Companion trust-boundary changes; or
- weakening ADR-031, ADR-032, ADR-040, ADR-041, ADR-042 or ADR-043.

## Recommendation

Approve Option A and ADR-044/ADR-045. It is the strongest game-agnostic proof
available within Oracle's permanent External Companion architecture and has
the lowest combined account-safety, anti-cheat, privacy and implementation
risk of the viable exploration-oriented candidates.

Sprint 27 implementation must not begin until the Founder formally selects the
reference game and approves the observation and certification architecture.

## Policy sources reviewed

- Minecraft EULA:
  https://www.minecraft.net/en-us/eula
- Minecraft Usage Guidelines:
  https://www.minecraft.net/en-us/usage-guidelines
- Old School RuneScape Rules:
  https://legal.jagex.com/docs/rules/rules-of-old-school-runescape
- Jagex End User Licence Agreement:
  https://legal.jagex.com/docs/terms/eula
- Elden Ring official Easy Anti-Cheat update:
  https://en.bandainamcoent.eu/elden-ring/news/elden-ring-patch-notes-version-1101
- Factorio API documentation:
  https://lua-api.factorio.com/latest/
- Factorio Terms of Service:
  https://www.factorio.com/terms-of-service
