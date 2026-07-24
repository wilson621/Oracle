# SPRINT 19 MIGRATION 012 VERIFICATION

**Artifact:** `database/012_operator_identity_lifecycle.sql`

**Status:** Implemented; static verification passed; disposable PostgreSQL
certification pending

**Date:** 24 July 2026

**Production change:** None

## Artifact identity

| Artifact | SHA-256 |
|---|---|
| Migration 009 | `fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f` |
| Migration 010 | `7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715` |
| Migration 011 | `5be24f86228d018dc2d5aacbf3f186c9414432c18c2b573a7a3a1e340496d505` |
| Migration 012 | `a436c0df6a2a9296c112d9c4ab6f6dd50dd44daa5fcf54dd01c5a2d213b435b0` |

The immutable hashes prove that implementing Migration 012 did not amend
Migrations 009–011.

## Static verification

`npm run migration-012:static:verify` verifies:

- transactional framing;
- immutable predecessor hashes;
- Display Name and three-token schema;
- case-insensitive uniqueness;
- initial ASCII policy;
- Founder-reserved names;
- moderation data;
- six-month restoration;
- 12-month quarantine;
- trusted change, generation and profile operations;
- service-role-only authority;
- RLS and privilege revocation; and
- independence from deferred Operator Intelligence and Trust & Control
  runtime persistence.

The static verifier passes.

## Certification boundary

Migration 012 is not yet certified for deployment. The available machine did
not have a running disposable PostgreSQL/Supabase environment; Docker was not
running, and no production or shared database was used as a substitute.

Before this artifact can become certified, a disposable PostgreSQL
certification must prove apply/rollback catalog identity, concurrent
case-insensitive claims, token accrual, quarantine release, deletion capture,
reserved/prohibited rejection, privilege isolation and compatibility on the
canonical `009 → 010 → 011 → 012` chain.

This is an engineering verification dependency, not a Founder product or
architecture decision. It grants no deployment authority.
