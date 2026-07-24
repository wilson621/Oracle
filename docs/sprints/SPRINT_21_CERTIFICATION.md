# SPRINT 21 LOCAL CERTIFICATION

**Sprint:** 21 — Oracle Session and Evidence Lifecycle

**Status:** Certified locally; awaiting Founder closure

**Date:** 24 July 2026

**Deployment:** Not authorised and not performed

## Contract and lifecycle certification

Focused verification proves:

- Session Service is the sole authoritative lifecycle owner;
- authenticated ownership is mandatory;
- begin identity is stable;
- retries replay exactly by idempotency key;
- conflicting key reuse fails;
- concurrent Session creation has one winner;
- optimistic stale commands fail;
- recovery and resume preserve the same Session;
- completion is terminal and idempotent;
- Evidence admission is explicit, source-owned and minimised;
- raw Evidence content is absent;
- renderer-safe history, detail and export are verified;
- deletion first becomes recoverable and ineligible, then removes admitted
  Evidence on completion;
- cross-Operator access fails;
- Desktop correlation preserves separate owners and identities; and
- lifecycle diagnostics and metrics are observable.

Evidence:

- `docs/sprints/evidence/sprint-21/generated/session-lifecycle-certification.json`
- `docs/sprints/evidence/sprint-21/generated/platform-composition-certification.json`

## Migration 013 PostgreSQL certification

Disposable PostgreSQL `16.14` verification proved:

- canonical chain `009 -> 010 -> 011 -> 012 -> 013`;
- transaction rollback leaves the catalog byte-equivalent;
- existing owned and unowned historical Sessions are preserved;
- legacy rows become completed historical Session contracts;
- authenticated direct insertion is denied;
- mutation is service-role-only;
- idempotent replay returns exact results;
- conflicting replay fails;
- concurrent completion produces one winner;
- Evidence references contain minimised provenance only;
- deletion immediately removes read eligibility; and
- RLS prevents cross-Operator reads.

The disposable container was stopped and removed after certification.

Evidence:

`docs/sprints/evidence/sprint-21/generated/migration-013-certification.json`

## Complete verification

Passing:

- TypeScript;
- Desktop TypeScript;
- ESLint with zero warnings;
- Next.js 16.2.10 production build;
- Session lifecycle verifier;
- Platform composition and exact manifest verifier;
- dependency architecture audit;
- Operator ownership;
- Operator Understanding contracts, lifecycle and Services;
- Operator Intelligence persistence contracts, authority and trust;
- Operator control contracts and Repository;
- Companion Guidance contracts, providers, packages and Application;
- Companion presentation boundary;
- Sprint 19 authentication and identity;
- Migration 010–013 static verification; and
- Migration 013 disposable PostgreSQL persistence verification.

Architecture audit result:

- 404 TypeScript files;
- 45 documented legacy exceptions, reduced by two;
- five documented source cycle groups;
- zero runtime cycle groups; and
- no new or unexpected boundary violation.

## Migration lifecycle declaration

| Migration | Implemented | Certified | Deployed | Activated |
|---|---:|---:|---:|---:|
| 009 | Yes | Yes | Yes | No |
| 010 | Yes | Yes | No | No |
| 011 | Yes | Yes | No | No |
| 012 | Yes | Yes | No | No |
| 013 | Yes | Yes | No | No |

Production remains unchanged on Migration 009. Runtime persistence remains
disabled. Gate C remains deferred.

## Certification conclusion

Sprint 21 source implementation satisfies ADR-041 and the approved Sprint
Plan. All authorised local certification has passed. Founder acceptance and
closure is the next governance decision; no deployment or activation authority
is requested.
