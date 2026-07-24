# SPRINT 19 PHASE 1 AUDIT REPORT

**Sprint:** 19 — Account, Identity and Commissioning

**Phase:** 1 — Readiness, policy and threat audit

**Status:** Complete for Founder review; implementation blocked pending Founder
database and policy decisions

**Date:** 24 July 2026

**Authority:** Founder-authorised Sprint 19 Phase 1 only

**Immutable predecessor:** Sprint 18 — Operator Trust and Control

**Repository baseline:** `841b041d0850a4feb5bd3f7ec54eb37f02f2fcf4`
(`sprint-18-complete`)

**Production baseline:** Migration 009 deployed; Migration 010 absent

**Runtime persistence:** Disabled

## Executive conclusion

Sprint 19 is the correct next Programme objective, but Phase 2 must not proceed
yet.

The current deployed Migration 008 ownership model cannot atomically and
idempotently create a clean Account's Operator and one-to-one binding through
the accepted Service and Repository boundaries. The existing implementation
can only resolve and commission an Operator whose binding already exists.

An additive trusted database operation is therefore architecturally necessary
for the full Sprint 19 objective. This triggers the Founder database-change
stop condition. No SQL, contract, Service, Repository, Application, Auth
configuration, deployment or runtime activation has been implemented.

## Baseline confirmation

| Check | Result |
|---|---|
| Active branch | `sprint-9-overlay` |
| `HEAD` | `841b041d0850a4feb5bd3f7ec54eb37f02f2fcf4` |
| Closure baseline | `sprint-18-complete` identifies the same closure tip |
| Remote-tracking state | Local `origin/main` and `origin/sprint-9-overlay` point to the closure tip; no fetch was performed in Phase 1 |
| Working tree at audit start | One pre-existing untracked planning document: `docs/sprints/SPRINT_19_PLANNING_REPORT.md` |
| Migration 009 SHA-256 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |
| Migration 010 SHA-256 | `7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715` |
| Production schema authority | Pre-Migration-010 |
| Runtime persistence | Disabled |
| Phase 4 | Not begun |

The local remote-tracking references are not proof of current remote state.
No fetch, push, production connection or external mutation was authorised or
performed during this Phase.

## Documentation and architecture review

The audit applied the canonical reading order and current delivery evidence:

- Founding Charter, Oracle Way, Platform Constitution, Strategy and
  Engineering Principles;
- the complete accepted ADR ledger through ADR-039;
- Oracle Codex;
- Architecture, Architecture Index, Implementation Status, Persistence
  Contract and historical architecture baseline;
- Governance, Roadmap, Engineering Programme, Master Build Plan and Project
  Board;
- Sprint Index, Sprint 17 deployment/closure evidence, complete Sprint 18
  planning, implementation, Gate C, deferral and closure evidence; and
- the Sprint 19 Planning Report and repository implementation.

The binding consequences are:

1. Supabase Auth owns Account authentication.
2. Account and Operator remain different identities.
3. Operator Service owns provisioning and commissioning decisions.
4. Operator Repository owns Operator and binding serialization.
5. Applications may present state and issue commands but may not own Auth,
   provisioning or persistence decisions.
6. PostgreSQL must enforce integrity that must survive retries, concurrency
   and process failure.
7. Migration 009 and Migration 010 are immutable.
8. Gate C remains deferred.
9. Database deployment, runtime registration and activation remain separate.
10. Sprint 18 is closed and none of its deferred work transfers into Sprint
    19.

## Current implementation findings

### Authentication

- Supabase SSR browser, server and proxy clients exist.
- The proxy refreshes Auth state by calling `auth.getUser()`.
- No sign-up, sign-in, sign-out, callback, verification, recovery or
  reauthentication route exists.
- The proxy does not enforce a protected route/API matrix.
- `/` redirects directly to `/oracle`.
- `/api/oracle/analyze` does not establish authenticated current-Operator
  authority before analysis.
- The repository contains no selected credential, verification, session,
  recovery, redirect or desktop-custody policy.

### Identity and ownership

- Migration 008 establishes one Account to one Operator and one Operator to
  one Account through primary/unique constraints.
- Authenticated callers may read their binding and Operator and update their
  already-bound Operator.
- Authenticated callers cannot insert an Operator or binding.
- `OperatorService.getCurrentOperator()` correctly fails when authentication,
  binding or Operator state is absent.
- No Service operation provisions an Operator for a clean authenticated
  Account.
- Existing verification proves resolution and isolation for pre-created
  bindings; it does not prove clean-account provisioning.

### Commissioning

- The onboarding page assumes a bound Operator already exists.
- A missing binding produces an unhandled ownership error rather than a
  commissioning state.
- Commissioning calls `generate_operator_designation()` and then updates the
  Operator in a separate request.
- A failure after designation allocation consumes sequence state without
  completing commissioning.
- Repeating commissioning allocates another designation.
- No expected-state, idempotency key, immutable conflict or stale-concurrency
  result exists.
- Callsign validation is only trim, non-empty and UI `maxLength=24`.
- The historical schema requires `operators.callsign` to be non-null, while
  current TypeScript projects it as nullable.

### Desktop

- Electron loads `/oracle` directly.
- There is no explicit signed-out, verification-pending, expired,
  disconnected or reauthenticated desktop state.
- No approved browser-to-desktop handoff or token-custody model exists.
- The current restricted preload bridge exposes desktop host and Companion
  presentation operations only; it exposes no Auth material.
- Any future Auth bridge must preserve the current restricted renderer
  boundary and must not expose privileged credentials or raw refresh tokens.

### Product and route state

- Product metadata still contains `Create Next App` and
  `Generated by create next app`.
- navigation still displays `PROJECT META`;
- navigation links to missing `/settings`;
- all current product pages are statically reachable at the routing layer;
  protected-state policy is not implemented.

## State-model definition

The state models below define required semantics only. They introduce no
contracts or runtime behavior.

### Auth session

```text
absent
  -> authenticating
  -> verification-pending | active | failed

active
  -> refresh-required
  -> active | expired | revoked | disconnected

expired | revoked
  -> reauthentication-required
  -> authenticating

recovery-requested
  -> recovery-pending
  -> recovered | expired | invalid
```

`disconnected` describes inability to validate or refresh current authority.
It must not be treated as authenticated success.

### Account and Operator ownership

```text
authenticated-account
  -> unbound
  -> provisioning
  -> bound-uncommissioned
  -> commissioned

Any state
  -> unavailable-policy | conflict | inconsistent
```

`inconsistent` includes a binding whose Operator is missing or a partial
historical state. It is a fail-closed recovery state, not permission to create
another Operator.

### Commissioning

```text
bound-uncommissioned
  -> callsign-policy-validation
  -> atomic-commissioning
  -> commissioned

atomic-commissioning
  -> exact-replay returns original result
  -> conflicting-replay returns immutable-conflict
  -> competing-state returns stale-concurrency
  -> failure leaves the prior durable state unchanged
```

For a clean Account, provisioning and commissioning may be one atomic
operation after the Operator supplies an approved callsign. No placeholder
Operator identity is required.

## Threat model

| Threat | Current exposure | Required Phase 2+ control |
|---|---|---|
| Account enumeration | No recovery journey exists; future risk is unbounded | Stable public errors, rate limits and provider configuration |
| Open redirect/callback tampering | No callback exists | Exact origin/callback allowlist and server-validated relative return path |
| Session fixation or stale cookies | Proxy refresh only | Provider rotation semantics, server validation and route-matrix tests |
| Unverified Account reaches protected data | No verification policy or route gate | Explicit verified/unverified policy and deny-by-default enforcement |
| Duplicate/orphaned Operator | Clean provisioning absent | One trusted atomic idempotent operation plus durable uniqueness |
| Callsign collision/policy drift | Only client length limit | Founder-versioned policy and matching durable enforcement where required |
| Cross-Operator access | RLS foundation exists | Preserve RLS and independently test every new operation |
| Service-role misuse | Trusted client exists server-side | Narrow RPC, ownership injection, no caller-selected Operator and no client import |
| Desktop token theft | No desktop Auth exists | System-browser flow, main-process custody, OS-protected storage and minimal IPC |
| Renderer compromise | Restricted bridge exists | Never expose privileged key or refresh token; validate every message |
| Account deletion orphans Operator | Auth binding cascades on Account deletion | Disable or explicitly govern Account deletion until Operator treatment is approved |
| Migration ordering executes 010 | 010 is next certified artifact | Founder-approved sequencing decision before any SQL |
| Application becomes identity authority | Current onboarding invokes browser Service but handles workflow locally | Service-owned state/results and presentation-only Applications |

## Catalog and ownership audit

Phase 1 inspected the tracked Migration 001, deployed Migration 008 artifact,
certified Migration 009/010 artifacts, Repository interfaces and prior
production catalog evidence.

The live production catalog was not independently queried in this Phase. The
last accepted production evidence records Migration 008 and 009 deployed,
Migration 010 absent, two Account/Operator ownership fixtures, three
Operators and seven Sessions. A fresh read-only production pre-flight remains
mandatory before any persistence design is approved for execution.

Current durable ownership is sound:

| Concern | Authority |
|---|---|
| Account credentials/session | Supabase Auth |
| Account-to-Operator relation | Operator Service decision; Operator Repository serialization; PostgreSQL integrity |
| Operator identity and commissioning | Operator Service |
| Operator and binding persistence | Operator Repository |
| Route/form presentation | Oracle Applications |
| Desktop lifecycle | Desktop host consuming approved Service projections |

No new Repository or architectural layer is recommended.

## Commissioning atomicity assessment

The full Sprint 19 objective cannot be satisfied safely with the current
database surface.

The required clean-account outcome contains at least these durable changes:

1. create one Operator;
2. create the one-to-one Account binding;
3. allocate and persist one stable designation; and
4. persist the approved callsign.

The current API exposes these as separate capabilities, and it exposes no
transaction spanning them. Authenticated direct insertion is intentionally
denied. A server using `service_role` for multiple REST requests would bypass
RLS but would not create atomicity. Compensation cannot reliably restore
sequence state, distinguish exact retry from a competing request or guarantee
that a process failure leaves no orphan.

The minimum persistence approach is one narrow, service-role-only trusted
function that:

- accepts the server-resolved Account, approved callsign, policy identity and
  idempotency identity;
- verifies the Account and any existing binding;
- creates the Operator and binding in one transaction when absent;
- allocates and persists the designation in the same transaction;
- returns the existing durable result for exact replay;
- rejects conflicting replay and stale/competing state explicitly;
- never accepts an Application-selected Operator identifier;
- uses a fixed safe `search_path`;
- grants execution only to `service_role`; and
- leaves current RLS and authenticated read behavior intact.

Whether callsigns are globally unique materially changes the required
constraint/index design and remains a Founder policy decision.

## Alternatives considered

| Alternative | Disposition |
|---|---|
| Authenticated client inserts Operator and binding | Rejected: grants new direct mutation authority and cannot establish the binding-dependent RLS cycle safely |
| Two trusted server REST writes | Rejected: not atomic; process failure can orphan state |
| Compensating delete after failure | Rejected: not equivalent to atomicity; unsafe under concurrency and sequence allocation |
| Create placeholder Operators at Account sign-up | Rejected: requires database change, invents identity/callsign state and couples Auth creation to Oracle domain creation |
| Store the mapping or callsign in Auth metadata | Rejected: parallel source of truth and wrong ownership |
| Pre-create Operators manually | Rejected: not a production Account journey |
| Reuse a shared development Operator | Rejected by ADR-033 and existing access policy |
| Defer Operator creation until callsign submission, then use one trusted transaction | Recommended |
| Limit Sprint 19 to already-bound Accounts | Rejected: does not meet the Programme objective |

## Migration sequencing assessment

Migration 010 is immutable, certified and intentionally absent from
production. A standard later migration would ordinarily follow and therefore
execute after 010. Sprint 19 cannot silently assume that sequence.

The available governance choices are:

1. **Reopen and complete Gate C, then add a normal later migration.** This
   preserves numeric ordering but deploys Migration 010 earlier than its
   current release-timed deferral. It requires a separate Founder Gate C
   decision and fresh operational evidence.
2. **Approve a governed out-of-order Sprint 19 migration/deployment
   mechanism.** This could deploy the narrow provisioning function while 010
   remains pending, but it requires an explicit migration-ledger, tooling,
   rollback, catalog and future-ordering policy. It must not masquerade as an
   ordinary later migration.
3. **Defer Sprint 19 implementation until Gate C is due.** This preserves the
   current sequence but blocks the Programme critical path.
4. **Renumber or amend Migration 010, or amend Migration 008/009.** Rejected:
   this violates the immutable Sprint 18 and certified Migration 009/010
   baseline.
5. **Apply untracked production SQL.** Rejected: this violates Oracle
   migration discipline and recoverability.

No sequencing option is authorised by Phase 1.

## Documentation health

Current-state summaries are not fully reconciled:

- `Roadmap.md` contains a paragraph that still calls Sprint 18 active before a
  later section records it closed.
- `ARCHITECTURE_INDEX.md` contains an older statement that Migration 009 is
  not permanently deployed, while its current-status section records it
  deployed.
- `IMPLEMENTATION_STATUS.md` contains historical sections that call Sprint 16
  the latest closed Sprint and Migration 009 undeployed, despite its header
  and Sprint 17/18 sections recording the current state.
- Project Board and Master Build Plan correctly record Sprint 18 closure but
  still say Sprint 19 Phase 1 has not been authorised.

These are living-document reconciliation items. Historical accepted records
must remain unchanged.

## Verification

| Check | Result |
|---|---|
| `npm run architecture:audit` | Pass — 372 TypeScript files, 54 documented legacy exceptions, 5 source-cycle groups, 0 runtime-cycle groups |
| `npm run operator:ownership:verify` | Pass |
| `npm run build` | Pass — Next.js 16.2.10, TypeScript passed, 20 static pages generated |
| Initial sandboxed build | Failed only because Google Fonts could not be fetched |
| Network-enabled rerun | Passed without source modification |
| `git diff --check` before Phase 1 documentation | Pass |

## Architectural recommendations

1. Keep Supabase Auth as Account authority.
2. Make Operator Service the single identity/provisioning facade.
3. Add no new Repository; extend the Operator Repository only after Phase 2
   and database sequencing approval.
4. Provision at final commissioning rather than creating a placeholder
   Operator at sign-up.
5. Use one narrow trusted transaction for Operator, binding, designation and
   callsign.
6. Model Auth, ownership and commissioning as separate explicit state
   machines.
7. Enforce protected routes and APIs deny-by-default after the Founder selects
   verification and access policy.
8. Use system-browser desktop authentication with main-process custody; never
   expose privileged credentials or raw refresh tokens to the renderer.
9. Keep Account deletion unavailable or explicitly limited until the Founder
   approves its effect on the durable Operator.
10. Reconcile living current-state summaries without rewriting closed Sprint
    records.

## Phase 2 recommendation

**Do not proceed to Phase 2 yet.**

Phase 2 should proceed only after the Founder:

- selects a migration-sequencing option;
- approves the narrow trusted atomic-provisioning architecture;
- supplies or schedules the required authentication, session, callsign,
  identity-control, redirect and deletion policies; and
- confirms that Phase 2 remains contract/Service-boundary work only, with no
  SQL, production Auth configuration, deployment or activation authority.

## Stop declaration

The database-change stop condition is active. Work stops at Phase 1.

Migration 009 and Migration 010 remain byte-for-byte unchanged. Gate C remains
deferred. Runtime persistence remains disabled. Phase 2 has not begun.
