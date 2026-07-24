# SPRINT 19 MIGRATION 012 VERIFICATION

**Artifact:** `database/012_operator_identity_lifecycle.sql`

**Status:** Implemented and certified; not deployed; not activated

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

## Disposable PostgreSQL certification

PostgreSQL 17.10 exercised the canonical
`009 → 010 → 011 → 012` chain in an isolated Docker container. Certification
proved:

- apply and transactional rollback with identical pre/post catalogs;
- preservation of existing Operator, binding, Session and predecessor data;
- one winner under concurrent case-insensitive Callsign claims;
- Founder-reserved, prohibited and Unicode-homoglyph rejection;
- non-unique Display Name behavior;
- three initial Callsign Change Tokens;
- one-token consumption and six-month restoration up to the balance of three;
- 12-month quarantine and release;
- immediate Account-deletion quarantine while permanent Operator identity
  remains;
- service-role-only identity mutation;
- trusted Callsign generation; and
- unchanged hashes for Migrations 009, 010 and 011.

The rollback catalog hash was identical before and after:

`988a529d4827dbef9b0182aae4c040dfb25768136c51f565263199ed04782167`

Machine-readable evidence is stored at
`docs/sprints/evidence/sprint-19/generated/migration-012-certification.json`.

Certification does not grant deployment or activation authority.
