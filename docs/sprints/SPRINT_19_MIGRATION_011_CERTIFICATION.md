# SPRINT 19 MIGRATION 011 CERTIFICATION

**Sprint:** 19 — Account, Identity and Commissioning

**Artifact:** `database/011_operator_account_provisioning.sql`

**Status:** Implemented and certified; not deployed; not activated

**Date:** 24 July 2026

**Production change:** None

## Certified identity

| Artifact | SHA-256 |
|---|---|
| Migration 009 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |
| Migration 010 | `7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715` |
| Migration 011 | `5be24f86228d018dc2d5aacbf3f186c9414432c18c2b573a7a3a1e340496d505` |

Any change to Migration 011 creates a different candidate and invalidates this
certification. Migrations 009 and 010 remained byte-for-byte unchanged.

## Minimum durable shape

Migration 011 introduces:

1. one transactional designation allocator;
2. one idempotency receipt relation; and
3. one `service_role`-only trusted provisioning operation.

The trusted operation atomically creates exactly one Operator, one
Account-to-Operator binding, one stable designation and one original result
receipt. It accepts a server-injected Account identifier, not an
Application-selected Operator identifier.

The designation allocator replaces non-transactional sequence consumption for
this path. Failed transactions therefore leave both identity records and the
next designation unchanged. The receipt stores the original result so exact
replay returns it byte-equivalently even if later policy permits identity
changes.

Migration 011 references no Migration 010 relation or trusted function. It
does not register a runtime Service, policy, producer, consumer or
Application.

## Certification matrix

PostgreSQL 17.10 disposable databases verified:

| Chain | Rollback catalog | Persistence | Security | Concurrency |
|---|---|---|---|---|
| `009 → 011` | Identical | Pass | Pass | One winner |
| `009 → 010 → 011` | Identical | Pass | Pass | One winner |

Both chains proved:

- exact replay returns the original result;
- changed content under the same identity fails immutably;
- a competing command for an already-provisioned Account fails;
- an existing binding is not silently replaced;
- anonymous and authenticated callers cannot invoke the trusted operation;
- authenticated direct Operator mutation is denied;
- one Account produces one Operator, binding and receipt under concurrency;
- cross-record Account/Operator integrity is enforced;
- designation allocation rolls back with the transaction; and
- Migration 011 leaves Migration 009 and Migration 010 objects unchanged.

Machine-readable evidence is stored at
`docs/sprints/evidence/sprint-19/generated/migration-011-certification.json`.

## Lifecycle declaration

| State | Migration 011 |
|---|---|
| Implemented | Yes |
| Certified | Yes |
| Deployed | No |
| Activated | No |

Production remains post-Migration-009 and pre-Migration-010. Gate C remains
deferred. Migration 011 has no deployment authority, and no runtime
persistence path is active.
