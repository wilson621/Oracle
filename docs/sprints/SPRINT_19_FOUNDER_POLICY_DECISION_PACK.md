# SPRINT 19 FOUNDER POLICY DECISION PACK

**Sprint:** 19 — Account, Identity and Commissioning

**Decision point:** Phase 1 exit

**Status:** Historical — superseded by the authoritative Founder decisions of
24 July 2026

**Date:** 24 July 2026

**Production change:** None

## Decision requested

This section records the decision boundary as it existed at Phase 1 exit. The
Founder has since supplied the authoritative policy values. Where this pack
differs, the later Founder decisions and
`SPRINT_19_FOUNDER_DECISIONS_IMPLEMENTATION.md` control.

The Founder is asked to decide whether and how Sprint 19 may continue after the
Phase 1 audit established that clean-account provisioning requires an additive
trusted database operation.

No implementation begins from this pack. Approval must state the exact next
authority.

## 1. Architectural justification

Oracle must create exactly one durable Operator for one authenticated Account
without orphaned records, duplicate bindings, duplicate designations or
ambiguous retry results.

The accepted ownership model requires:

- Supabase Auth to own the Account;
- Operator Service to decide provisioning and commissioning;
- Operator Repository to serialize the decision; and
- PostgreSQL to enforce cross-request, concurrency and failure integrity.

The current database exposes no transaction that creates the Operator,
binding, designation and callsign together. A database capability is therefore
required for correctness, not convenience.

## 2. Proposed persistence approach

Approve the architecture of one additive, narrow, `service_role`-only trusted
function beneath the existing Operator Repository.

The function should:

- act only for a server-validated Account;
- create the Operator and binding atomically;
- allocate designation and persist callsign in the same transaction;
- return the original result for exact replay;
- reject immutable conflict and stale/competing state;
- preserve the one-to-one constraints and existing RLS;
- use a fixed safe `search_path`;
- expose no direct authenticated mutation;
- create no new source of truth or Repository; and
- remain independent of Migration 010 tables and Sprint 18 runtime controls.

Exact SQL, function identity, migration artifact and deployment procedure are
not approved by accepting this architecture.

## 3. Gate C implications

Gate C remains intentionally deferred today.

If the Founder chooses normal migration ordering, Gate C must be explicitly
reopened and completed before a later Sprint 19 migration can be permanently
deployed. That would deploy Migration 010 earlier than the current
release-timed plan, even though runtime registration and activation could
remain disabled.

If Gate C remains deferred, Sprint 19 needs an explicitly governed
out-of-order migration/deployment mechanism or must defer implementation.
Neither option is currently authorised.

No choice may imply runtime persistence, production control paths, Trust
Centre activation or any later Sprint capability.

## 4. Migration sequencing implications

### Option A — Gate C first, then normal later migration

**Effect:** Reverify and deploy certified Migration 010 under its Operational
Package, then design a normal additive Sprint 19 migration.

**Advantages:**

- preserves ordinary numeric ordering;
- keeps one linear deployed migration history; and
- uses the already-certified 010 package.

**Costs and risks:**

- changes the Founder-approved timing of Gate C;
- expands the production catalog before a release needs Sprint 18
  persistence; and
- requires fresh backup, rollback, catalog, security, isolation and closure
  evidence.

### Option B — Governed out-of-order Sprint 19 migration

**Effect:** Keep Migration 010 absent while separately deploying a narrow
Sprint 19 artifact.

**Advantages:**

- preserves Gate C deferral; and
- unblocks the Sprint 19 critical path.

**Costs and risks:**

- requires explicit migration-ledger and tooling policy;
- creates non-linear artifact ordering that every future deployment must
  understand;
- requires proof that later Migration 010 remains additive and compatible;
  and
- must not become an untracked SQL exception.

### Option C — Defer Sprint 19 implementation

**Effect:** Keep Phase 1 as the final Sprint 19 result until Gate C is due.

**Advantages:**

- preserves current production and migration ordering exactly.

**Costs and risks:**

- blocks Sprint 19 and the Programme critical path to Sprint 20.

### Rejected sequencing

- amend or renumber Migration 008, 009 or 010;
- replace the certified Migration 010 candidate;
- deploy untracked SQL;
- execute Migration 011 manually while pretending normal order was followed;
  or
- weaken atomicity through compensating Application or Service logic.

## 5. Alternative designs considered

| Design | Decision |
|---|---|
| Client-owned provisioning | Reject |
| Two service-role REST writes | Reject |
| Compensating cleanup | Reject |
| Auth metadata as Operator mapping | Reject |
| Placeholder Operator at sign-up | Reject |
| Auth trigger that invents placeholder identity | Reject |
| Manual/pre-created Operators | Reject |
| Shared development Operator | Reject |
| One trusted transaction at final commissioning | Recommend |

## 6. Founder decision required

### A. Database and sequencing

Choose one:

- **A1:** Reopen Gate C and preserve normal migration ordering.
- **A2:** Preserve Gate C deferral and commission a governed out-of-order
  migration design for separate review.
- **A3:** Defer Sprint 19 implementation.

Recommended decision: **A2**, subject to a dedicated migration-governance
proposal proving ledger, tooling, rollback and future Migration 010
compatibility. This best preserves the explicit Gate C deferral while keeping
the Programme moving. If Oracle does not accept non-linear migration history,
choose A1.

### B. Credential methods

Decide:

- initial credential method(s);
- whether optional social, passkey, MFA or enterprise methods are excluded;
  and
- whether provider configuration is ready for production-equivalent testing.

Recommended initial scope: one provider-native email credential flow; keep
social identity, passkeys, MFA and enterprise identity out of Sprint 19 unless
separately selected.

### C. Verification

Decide whether verification is mandatory before:

- Operator provisioning;
- commissioning;
- protected product access; and
- desktop handoff.

Recommended policy: verification is mandatory before provisioning and every
protected journey.

### D. Session and reauthentication

Supply:

- session lifetime;
- inactivity behavior;
- refresh behavior;
- security-sensitive reauthentication requirements; and
- revoked/expired/offline behavior.

Recommendation: use provider-managed rotation, validate authority server-side,
fail closed when authority cannot be established and require
reauthentication for sensitive identity changes. Exact durations remain a
Founder value.

### E. Recovery

Decide:

- approved recovery method;
- assurance required before credential replacement;
- public error behavior; and
- recovery-link expiry/reuse policy.

Recommendation: provider-native email recovery with non-enumerating public
responses. Exact assurance and expiry remain Founder values.

### F. Callsign and designation

Decide:

- syntax and length;
- case/Unicode normalization;
- whether callsigns are globally unique;
- reserved words and moderation;
- mutability and any cooldown; and
- whether designation is permanent and the stable public disambiguator.

Recommended model: designation is permanent and unique; callsign is a
moderated display identity and need not be globally unique. This avoids
turning a mutable human-readable name into the durable identity key. Exact
syntax and mutability remain Founder values.

### G. Account and Operator controls

Decide:

- whether Account email change is allowed and requires reverification;
- which Operator identity controls are allowed in Sprint 19; and
- whether Account deletion is available before Operator deletion
  orchestration exists.

Recommendation: allow only provider-governed email change with
reverification; keep physical Account deletion unavailable in Sprint 19 and
explain that Account and Operator deletion are separate.

### H. Redirects and web origins

Supply:

- exact production and development origins;
- approved callback destinations;
- safe default destination; and
- permitted return-to-flow rules.

Recommendation: exact origin allowlist plus server-validated same-origin
relative paths only. External return destinations are rejected.

### I. Desktop authentication custody

Choose:

- system-browser versus embedded authentication;
- approved callback mechanism;
- main-process storage mechanism;
- renderer/IPC projection; and
- sign-out/revocation synchronization behavior.

Recommended model: system browser with authorization code and PKCE; callback
validated by the desktop main process; credentials held in OS-protected
main-process storage; renderer receives only minimal Auth/Operator state and
commands, never privileged keys or raw refresh tokens.

### J. Phase 2 authority

If the decisions above are sufficient, decide whether to authorise Phase 2 as:

- identity state and failure contracts;
- Auth adapter boundary;
- Operator Service behavior design; and
- verification fixtures only.

Phase 2 approval must explicitly exclude:

- SQL or migration creation;
- Service or Repository persistence implementation;
- production Auth configuration changes;
- web or desktop journey implementation;
- Gate C execution;
- deployment;
- runtime persistence;
- Platform bootstrap; and
- Sprint 20 or later capability.

## Recommended Founder resolution

1. Accept the Phase 1 finding that additive database capability is necessary.
2. Accept the narrow trusted atomic-provisioning architecture.
3. Choose migration option A2 for a separate governance proposal, or A1 if
   linear migration history is mandatory.
4. Approve the recommended policy direction while supplying the exact
   unresolved values.
5. Keep Gate C deferred unless A1 is explicitly selected.
6. Do not authorise Phase 2 until the database sequencing decision and minimum
   policy set are recorded.
7. Require a separate review before any SQL, production configuration,
   deployment or activation.

## Current stop state

Sprint 18 remains immutable. Migration 009 and Migration 010 are unchanged.
Production remains pre-Migration-010. Runtime persistence remains disabled.
Phase 2 has not begun.
