# SPRINT 19 PLANNING REPORT

**Proposed Sprint:** 19 — Account, Identity and Commissioning

**Status:** Proposed — awaiting Founder approval

**Planning date:** 24 July 2026

**Authority:** Planning report only; no implementation, migration, deployment
or runtime activation authority

**Immutable predecessor:** Sprint 18 — Operator Trust and Control

**Repository baseline:** `841b041d0850a4feb5bd3f7ec54eb37f02f2fcf4`
(`sprint-18-complete`)

**Production baseline:** Oracle Platform v0.9; Migration 009 deployed;
Migration 010 absent

**Runtime persistence:** Disabled

## Executive recommendation

Approve Sprint 19 planning for the Programme-defined objective:

> Deliver the complete authenticated journey from Account creation to a
> commissioned Operator across the supported web and desktop surfaces.

This is the highest-priority unauthorised Oracle work because authenticated
identity is the next approved critical-path dependency after Operator Trust
and Control. Sprint 20 runtime activation explicitly depends on Sprint 19.
Observation, Evidence, Understanding, Memory, Guidance and personalisation
must not be activated before Oracle can reliably identify, isolate and
reconnect the Operator whose intelligence is being governed.

The first authorised activity should be a bounded implementation-readiness
phase. It must settle authentication policy, session custody, commissioning
atomicity and migration sequencing before implementation. Sprint 19 must not
assume that deferred Gate C has occurred.

## Audit basis

The planning audit re-read the complete canonical governance, product,
architecture, programme, decision and delivery record, including:

- the Oracle Platform Constitution, Oracle Codex, Founding Charter, Oracle
  Way, Strategy, Engineering Principles and Governance;
- Architecture, Architecture Index, implementation status and the Persistence
  Contract;
- the Roadmap, Engineering Programme, Master Build Plan, Project Board and
  Sprint Index;
- ADR-001 through ADR-039, with particular attention to ADR-033 through
  ADR-039;
- the Oracle Platform v0.9 baseline and the complete Sprint 18 planning,
  implementation, Gate C and closure record; and
- the remaining historical Sprint, migration, audit and verification
  documents in the 70-document repository inventory.

The repository audit covered all 514 tracked files and the current source,
database, desktop, scripts, configuration and verification surfaces. The
automated dependency audit scanned 372 TypeScript files and passed with 54
documented legacy exceptions, five documented source-cycle groups and no
runtime cycle groups. The existing Operator ownership verification also
passed.

At audit start:

- the active branch was `sprint-9-overlay`;
- `HEAD`, local `main`, `origin/main` and `origin/sprint-9-overlay` resolved to
  the Sprint 18 closure commit;
- the annotated `sprint-18-complete` tag identified that closure commit;
- the working tree was clean;
- Migration 009 and Migration 010 retained their certified SHA-256 values;
- production remained documented as pre-Migration-010; and
- no runtime persistence or Phase 4 capability was active.

No production connection or mutation was made during this planning audit.
Remote synchronization is asserted from the checked local remote-tracking
references; no fetch, push, deployment or external-state change was performed.

## Highest-priority determination

| Candidate work | Finding | Planning disposition |
|---|---|---|
| Account, Identity and Commissioning | Next approved Programme objective; required by Sprint 20 and every protected Operator journey | **Recommend as Sprint 19** |
| Permanent Migration 010 execution | Certified but explicitly deferred by the Founder | Exclude; revisit only under a separate Gate C decision |
| Sprint 18 runtime controls and Trust Centre | Sprint 18 is closed; unfinished phases did not carry forward | Exclude unless separately authorised in a future objective |
| Platform runtime activation | Programme Sprint 20 and dependent on authenticated identity | Defer to Sprint 20 |
| Observation and Evidence lifecycle | Programme Sprint 21; trust and identity prerequisites are not operational | Defer to Sprint 21 |
| Understanding accumulation | Programme Sprint 22 | Defer to Sprint 22 |
| Broad legacy boundary remediation | Real debt, but Sprint 20 owns composition-root migration and Sprint 28 owns unified product completion | Prevent growth; do not absorb wholesale |
| Companion guidance, personalisation and broader product completion | Later Programme objectives | Defer to their authorised Sprints |

## Repository findings

### Existing foundations to preserve

- Supabase Auth is already the canonical Account identity provider.
- ADR-033 establishes that an Account authenticates while an Operator remains
  Oracle's durable domain identity.
- Migration 008 owns the one-to-one
  `operator_account_bindings` relationship and Operator-scoped RLS.
- Operator Service resolves the authenticated Account through Operator
  Repository and returns an immutable Operator projection.
- Repository verification proves authentication is required, shared fallback
  is prohibited and two Account bindings resolve to separate Operators.
- A server-only trusted Supabase client exists and keeps the privileged
  credential outside Client Components.
- Browser and desktop foundations already exist and must be extended through
  existing layer ownership, not through a fifth layer.

### Material gaps

- There is no Account creation, sign-in, sign-out, callback, verified-email,
  reauthentication or credential-recovery route.
- The session middleware refreshes Auth state but does not enforce protected
  route or API policy.
- The root route redirects directly to `/oracle`, and the Oracle analysis API
  does not establish an authenticated Operator boundary.
- The current onboarding page assumes that an Account-to-Operator binding and
  Operator record already exist. It cannot create either and has incomplete
  failure handling.
- Commissioning currently updates an already-owned Operator in two client-side
  Repository operations: designation generation followed by Operator update.
  It is not the Account-to-Operator provisioning transaction required for a
  clean first run.
- `operators.callsign` is non-null in the historical schema, while current
  commissioning contracts model an uncommissioned callsign as nullable. The
  deployed catalog must be audited before selecting a provisioning design.
- No current path automatically and idempotently creates an Operator and binds
  it to the authenticated Account.
- The desktop host loads the web Oracle URL directly and has no explicit Auth
  journey, disconnection state, reconnection contract or reviewed token
  custody boundary.
- No dedicated Account/identity verification suite covers callback integrity,
  expired sessions, recovery, return-to-flow safety, commissioning
  contention, desktop reconnection or two-Account route isolation.
- Product metadata still contains `Create Next App`, `Generated by create next
  app` and `PROJECT META`; navigation links to a missing `/settings` route.
- Existing Applications and helpers contain documented direct Repository and
  database access. Sprint 19 must protect identity-bearing entry points
  without claiming the later Sprint 20 composition migration.

### Documentation observations

The living status documents establish the correct Sprint 18 closure baseline.
Some historical or duplicated paragraphs still describe earlier delivery
states, including Sprint 18 as active or Migration 009 as undeployed. Sprint
19 should reconcile only living current-state summaries and preserve accepted
historical records verbatim.

## Recommended objective

Make Operator Service the operational identity facade across web and desktop
so that a new person can create and verify an Account, establish exactly one
durable Operator, complete commissioning, safely resume or recover access and
sign out, while every protected journey preserves Account/Operator
distinction and Operator isolation.

## Architectural dependencies

### Authoritative dependencies

1. **Supabase Auth owns Account authentication.** Passwords, approved
   credentials, email verification and Auth sessions remain outside Oracle
   domain persistence.
2. **Operator Service owns identity workflow behaviour.** Applications may
   render states and issue commands but may not own provisioning, binding,
   commissioning or recovery decisions.
3. **Operator Repository owns Operator and binding persistence.** No
   Application, desktop renderer or parallel store may write those relations
   directly.
4. **Migration 008 is the deployed ownership foundation.** Existing one-to-one
   binding constraints and RLS remain authoritative.
5. **Sprint 18 contracts remain accepted but dormant.** Sprint 19 may respect
   their control vocabulary; it may not execute Migration 010, register its
   Repositories or activate its runtime paths.
6. **Next.js 16.2.10 and Supabase SSR are pinned implementation constraints.**
   The installed Next.js documentation must be re-read for the selected
   proxy, cookie, route-handler and redirect patterns immediately before code
   is written.
7. **Desktop security boundaries remain authoritative.** Authentication must
   not expose privileged keys or unnecessarily expose bearer tokens to the
   renderer or IPC surface.

### Ownership model

No new architectural layer is proposed.

| Concern | Owner |
|---|---|
| Account credential and Auth-session authority | Supabase Auth |
| Account access workflow and approved Auth adapter contract | Oracle Service boundary |
| Account-to-Operator provisioning and identity behaviour | Operator Service |
| Operator and binding serialization | Operator Repository |
| Durable uniqueness, referential integrity, RLS and any approved atomic database operation | PostgreSQL |
| Route rendering, forms, accessibility and state presentation | Applications |
| Desktop window lifecycle and secure session/reconnection integration | Desktop host, consuming the same Service contracts |
| Founder-configurable authentication and identity policy | Versioned configuration supplied to Services; unavailable policy fails closed |

Repository ownership does not move. Sprint 19 makes the accepted Operator
Service boundary usable; it does not create a parallel Account database,
identity Repository or presentation-owned Supabase workflow.

## Proposed scope

### 1. Readiness and authority audit

- Inspect the deployed Migration 008 catalog, current Auth provider
  configuration and supported production authentication methods without
  exposing credentials.
- Define the Account, Auth-session, Operator ownership and commissioning state
  machines, including invalid, expired, unverified, disconnected and recovery
  states.
- Record the web/desktop session-custody and threat model.
- Decide whether atomic Operator provisioning can be implemented using the
  deployed architecture or requires additive SQL.
- Produce a migration-sequencing decision if any database change is proposed.
- Stop for Founder review before any SQL, production configuration or
  consequential Auth change.

### 2. Identity contracts and Service behaviour

- Introduce the minimum immutable commands, results and failure projections
  needed for Account access, Auth-session state, return-to-flow and
  commissioning.
- Extend Operator Service as the operational identity facade.
- Keep provider-specific serialization in an adapter/Repository boundary.
- Validate callsign and permitted identity controls once Founder policy is
  supplied; do not invent defaults.
- Make provisioning and commissioning idempotent and safe under retries and
  concurrent requests.

### 3. Web Account journey

- Account creation using only Founder-approved credential methods.
- Verified-email pending, success, invalid and expired-link handling.
- Sign-in, sign-out, session expiry and reauthentication.
- Approved credential recovery without account enumeration.
- Protected page and API enforcement.
- Validated same-origin return-to-flow handling with a safe default
  destination.
- Accessible error, disconnected, recovery and retry states.

### 4. Operator provisioning and commissioning

- Establish exactly one Operator for one authenticated Account through
  Operator Service.
- Establish exactly one durable Account-to-Operator binding through Operator
  Repository.
- Complete first-run callsign and designation commissioning without a
  presentation-owned write.
- Define truthful behaviour for retries, pre-existing partial state,
  collisions and unavailable policy.
- Preserve the distinction between Account identity, Operator identity,
  callsign and designation.

### 5. Returning-Operator and identity controls

- Resolve the current Operator on every supported authenticated journey.
- Permit only the identity changes approved by Founder policy.
- Present Account deletion and Operator deletion as distinct governed
  concepts.
- Do not implement physical Operator deletion, multi-owner deletion
  orchestration or Migration 010 control execution within this Sprint.

### 6. Desktop authentication and reconnection

- Provide an explicit desktop access journey compatible with the same
  Account/Operator contracts.
- Define secure session handoff or browser-mediated authentication using the
  approved custody model.
- Handle startup while signed out, verification pending, expired,
  disconnected and reauthenticated.
- Prove that secrets and prohibited token material do not cross renderer or
  IPC boundaries.

### 7. Product identity and documentation

- Replace stale framework and `PROJECT META` metadata with approved Oracle
  identity.
- Remove or resolve identity-navigation paths that would otherwise be dead
  ends within the approved journey.
- Update living architecture, implementation status, Project Board, Sprint
  Index and verification documentation only as approved milestones occur.
- Preserve Sprint 18 documents and certified artifacts unchanged.

## Explicit exclusions

Sprint 19 must not:

- execute, amend, supersede or silently depend on Migration 010;
- revisit Sprint 18 implementation or activate its deferred Service controls,
  Trust Centre, retention processors, deletion coordinator or control paths;
- enable runtime persistence or invoke Platform bootstrap;
- activate Observation capture, Evidence Admission, Understanding
  accumulation, Memory promotion, inference, Guidance, Prediction or
  personalisation;
- implement the Sprint 20 composition-root migration or remove all documented
  legacy dependency exceptions;
- implement authoritative Session lifecycle or evidence-bearing Sessions;
- create an Oracle-owned password store, parallel Account store or alternative
  Account-to-Operator mapping;
- place Auth, commissioning or persistence decisions in Applications;
- hard-code credential methods, email-verification rules, session durations,
  callsign policy, deletion policy, redirect allowlists or other Founder
  policy;
- perform physical Operator deletion or cross-owner data deletion;
- add social identity providers, passkeys, MFA or enterprise identity unless
  specifically selected by the Founder for Sprint 19;
- redesign the complete product shell, replace all placeholder product data or
  advance later Programme objectives; or
- deploy, release or activate production behaviour without its own explicit
  approval.

## Persistence sequencing constraint

Migration 010 is the certified production candidate but is intentionally
absent from production. A later-numbered migration for Sprint 19 could cause
standard migration tooling to execute Migration 010 first, contradicting the
Gate C deferral. Renumbering, amending or replacing certified Migration 010
would violate the accepted Sprint 18 baseline.

Therefore:

1. Sprint 19 planning does **not** pre-authorise a new migration.
2. The readiness audit must first determine whether the deployed Migration 008
   model can support atomic, idempotent provisioning without weakening
   integrity or using compensating business logic in Applications.
3. If additive SQL is required, implementation must stop and present the exact
   schema, trusted-function surface, grants, RLS, artifact ordering and
   deployment implications to the Founder.
4. The Founder must then explicitly choose a sequencing path that preserves
   both Migration 010 certification and Gate C deferral.
5. No design may use direct client inserts, a parallel mapping store,
   placeholder ownership, inferred binding or best-effort partial
   provisioning as a shortcut.

## Founder policy decisions required

The following values cannot be inferred or defaulted:

- approved initial credential method or methods;
- whether email verification is mandatory before commissioning;
- session lifetime, inactivity, refresh and reauthentication policy;
- credential-recovery method and recovery assurance requirements;
- callsign syntax, uniqueness, reservation, mutability and moderation policy;
- permitted Account email and Operator identity controls;
- the approved web origins, callback destinations and desktop authentication
  handoff model;
- Account deletion availability and the exact product behaviour while
  Operator deletion orchestration remains deferred;
- Auth-provider email, rate-limit, abuse and production configuration; and
- whether any optional MFA, passkey, social or enterprise identity capability
  is in Sprint scope.

All unavailable policy must fail closed. Environment and provider
configuration may supply approved values; source code must not manufacture
Founder policy.

## Risks and controls

| Risk | Required control |
|---|---|
| Authentication or redirect loops | Explicit finite state model, bounded redirects and route-matrix tests |
| Open redirect or callback tampering | Same-origin/allowlisted destinations, signed or server-validated state |
| Email/account enumeration | Stable public error projections and security tests |
| Session fixation, stale cookies or split browser state | Server-validated identity, rotation/expiry tests and one canonical Auth adapter |
| Desktop token or secret exposure | Documented custody model, minimal IPC, renderer inspection and negative tests |
| Orphaned or duplicate Operator binding | Atomic idempotent provisioning, durable uniqueness and concurrency verification |
| Callsign collision or policy drift | Founder-supplied versioned policy and durable integrity enforcement where required |
| Account deletion orphaning an Operator | Explicit Account/Operator distinction and no deletion activation without owned orchestration |
| Migration 010 ordering conflict | Mandatory persistence-sequencing gate before SQL |
| Application ownership leakage | Service-facing contracts, dependency audit and no direct presentation writes |
| Legacy unprotected paths | Complete page/API route matrix and deny-by-default protected policy |
| Next.js/Supabase version mismatch | Implement against installed Next.js 16.2.10 and pinned Supabase documentation |
| Production Auth configuration drift | Separate configuration evidence and environment pre-flight before activation |
| Scope expansion into product cleanup | Change only identity-bearing presentation and defer broad experience work |

## Deliverables

1. Sprint 19 approved implementation plan and readiness audit.
2. Account/Auth-session/commissioning state and threat models.
3. Versioned Auth and identity contracts with explicit failure projections.
4. Operator Service identity facade and approved Auth adapter boundary.
5. Complete web Account creation, verification, access, recovery,
   reauthentication and sign-out journeys.
6. Idempotent Account-to-Operator provisioning and first-run commissioning.
7. Protected page and API route policy with safe return-to-flow.
8. Returning-Operator identity controls within Founder policy.
9. Desktop authentication, disconnection and reconnection journey.
10. Clear Account-deletion versus Operator-deletion presentation and
    contracts, without unauthorised physical deletion.
11. Approved Oracle product metadata for identity-bearing surfaces.
12. Dedicated automated verification suites and security evidence.
13. Updated living architecture and delivery documentation.
14. Sprint 19 implementation and closure reports.

Any SQL artifact, production Auth configuration or activation package is
conditional on a separate Founder decision after the readiness audit.

## Verification strategy

### Static and contract verification

- TypeScript strict compilation for all new contracts and Service boundaries.
- Contract factory tests for every success and fail-closed state.
- Dependency-boundary audit proving no new legacy exception or runtime cycle.
- Static secret scan proving privileged credentials are server-only.
- Next.js 16.2.10 route, cookie and proxy patterns checked against the
  installed documentation.

### Service and Repository verification

- Clean Account, existing Account, unverified, expired, disconnected,
  recovery and reauthenticated scenarios.
- Missing binding, existing binding, partial historical state, retry,
  collision and concurrent commissioning scenarios.
- Exactly-one Account-to-Operator and Operator-to-Account guarantees.
- Two-Account isolation across reads, writes, callbacks and route access.
- Repository serialization tests with Service-owned decisions and no
  Application persistence calls.

### Database and security verification

If a persistence change is separately approved:

- exact artifact hash and immutable predecessor hashes;
- transaction and rollback verification against the production database
  version;
- grants, RLS, function security, `search_path`, ownership and catalog
  manifests;
- anonymous, cross-Operator, authenticated-direct-write and untrusted-RPC
  denial;
- idempotency, collision, concurrency and partial-failure tests; and
- explicit proof that Migration 010 was neither executed nor changed.

### Web journey verification

- End-to-end Account creation, verification, sign-in, commissioning, sign-out,
  recovery and safe resume.
- Invalid, expired, reused and tampered callback links.
- Protected page and API route matrix for anonymous, unverified,
  uncommissioned and commissioned states.
- Return-to-flow validation, including malicious external destinations.
- Refresh, multi-tab, stale-cookie, offline and recovery behaviour.
- Keyboard, focus, label, error-announcement and reduced-motion accessibility.

### Desktop verification

- Signed-out startup, browser handoff if approved, successful return,
  reconnect and sign-out.
- Expired, revoked, offline and conflicting browser/desktop session states.
- Renderer, preload, IPC and log inspection proving prohibited secrets and
  token material are absent.
- Existing window security, interaction recovery and Companion presentation
  regressions.

### Regression and closure verification

- Existing Operator ownership, Operator Understanding, Operator Intelligence,
  Operator Control, Guidance and Companion suites.
- Desktop TypeScript compilation.
- One lint run and one Next.js 16.2.10 production build.
- Architecture audit, migration hash verification and `git diff --check`.
- No production deployment or runtime activation unless separately
  authorised.

## Success criteria

Sprint 19 is complete only when:

1. A clean person can create an approved Account and complete required
   verification.
2. The authenticated Account resolves to exactly one durable Operator through
   Operator Service.
3. First-run commissioning is idempotent, race-safe and free from orphaned
   bindings.
4. A commissioned Operator can sign in, sign out, expire, reauthenticate,
   recover and resume through supported web and desktop paths.
5. Anonymous, unverified and uncommissioned states reach only their explicitly
   permitted routes and APIs.
6. Safe return-to-flow never permits an external or unapproved destination.
7. Account, Operator, callsign and designation are visibly and contractually
   distinct.
8. Account deletion and Operator deletion are not conflated, and no
   unauthorised physical deletion occurs.
9. Two Accounts cannot observe, bind, commission or alter one another's
   Operator.
10. Applications own presentation only; Services own workflow behaviour and
    Repositories own serialization.
11. Desktop authentication does not expose server credentials or prohibited
    session material.
12. No Founder policy value is hard-coded and unavailable policy fails closed.
13. No new architecture layer, parallel persistence path, duplicate ownership
    or undocumented dependency exception is introduced.
14. Migration 009 and the certified Migration 010 artifact remain
    byte-for-byte unchanged; Migration 010 remains unexecuted unless Gate C is
    separately approved.
15. Runtime persistence, Platform bootstrap and later Programme capabilities
    remain disabled.
16. The full verification strategy passes and the Founder accepts the Sprint
    closure evidence.

## Recommended implementation sequence after approval

1. **Phase 1 — Readiness, policy and threat audit.** Resolve every Founder
   policy input and the persistence-sequencing question. Stop for approval.
2. **Phase 2 — Contracts and Service boundary.** Implement the versioned
   identity state model, Auth adapter and Operator Service behaviour. Stop for
   review.
3. **Phase 3 — Persistence, only if separately approved.** Implement and
   rollback-verify the accepted atomic provisioning design. No permanent
   execution without its own gate.
4. **Phase 4 — Web journey.** Implement protected Account, verification,
   commissioning, recovery and return-to-flow paths.
5. **Phase 5 — Desktop journey.** Implement the accepted custody,
   authentication and reconnection model.
6. **Phase 6 — Integration and hardening.** Complete route coverage,
   accessibility, security and regression verification.
7. **Phase 7 — Closure.** Produce evidence, update living documentation and
   stop for Founder acceptance.

Each phase is an internal Sprint stage, not an independent Sprint or implicit
authority for the next stage.

## Stop conditions

Implementation must stop for Founder direction if:

- a database change is required before migration sequencing is approved;
- the proposed design would require Migration 010 execution or amendment;
- production Auth policy or configuration is unavailable;
- Account-to-Operator provisioning cannot be made atomic and idempotent within
  accepted ownership;
- credential or session material would cross an unapproved desktop boundary;
- a required route cannot be protected without expanding into Sprint 20
  composition work;
- Account deletion would orphan or implicitly delete an Operator;
- any design introduces an architectural layer, parallel store, duplicated
  ownership, Application business logic or hard-coded Founder policy; or
- Migration 009, Migration 010, runtime dormancy or production behaviour
  differs from the accepted baseline.

## Founder decision required

Before any Sprint 19 implementation, the Founder is asked to:

1. approve or reject the recommended Sprint 19 objective;
2. approve the proposed scope, exclusions, ownership model, phases,
   verification strategy and success criteria;
3. supply or explicitly schedule the required authentication, session,
   callsign, identity-control and deletion policy decisions;
4. approve Phase 1 as audit-only work;
5. confirm that Gate C remains deferred and Migration 010 must remain
   unexecuted throughout Phase 1; and
6. require a further Founder review before any SQL, production Auth
   configuration, deployment or runtime activation.

Until that decision is given, Sprint 19 is not active and no implementation is
authorised.
