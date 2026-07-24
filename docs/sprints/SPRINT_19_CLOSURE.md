# SPRINT 19 CLOSURE REPORT

**Sprint:** 19 — Account, Identity and Commissioning

**Engineering status:** Complete and certified

**Date:** 24 July 2026

**Branch:** `sprint-9-overlay`

**Production schema:** Post-Migration-009; pre-Migration-010

**Runtime persistence:** Disabled

**Deployment change:** None

## Outcome

Sprint 19 delivers the complete implemented Account-to-Operator identity
foundation under the Founder decisions without changing production.

Email + Password is canonical. Email verification is mandatory. Magic Links
and Passkeys are optional for verified Accounts, and OAuth remains a future
adapter. Web sessions remember by default, enforce a signed 30-day idle
window and require recent authentication for sensitive identity mutation.

Operator identity remains permanent while credentials, Display Name and
Callsign may evolve. Display Names are non-unique and freely mutable.
Callsigns are globally unique without regard to case, preserve selected
capitalisation, support Oracle generation, reject the initial reserved and
prohibited sets, exclude Unicode homoglyphs, use three renewable change
tokens and enter 12-month quarantine after change or Account deletion.

The Desktop trusted-device boundary accepts no password, stores only an
OS-encrypted refresh token, trusted-device metadata and required identifiers,
keeps access credentials out of renderer projections and models automatic
refresh and the approved reauthentication outcomes. Composition remains
undeployed and inactive.

## Persistence certification

Migration 011 remains certified at SHA-256
`5be24f86228d018dc2d5aacbf3f186c9414432c18c2b573a7a3a1e340496d505`.

Migration 012 is certified at SHA-256
`a436c0df6a2a9296c112d9c4ab6f6dd50dd44daa5fcf54dd01c5a2d213b435b0`.
PostgreSQL 17.10 verified the canonical
`009 → 010 → 011 → 012` chain, rollback catalog identity, concurrent
case-insensitive claims, moderation, token accrual, quarantine and release,
Account-deletion capture, permanent Operator retention and least privilege.

Neither migration is deployed or activated.

## Architectural integrity

The four-layer architecture is unchanged:

```text
Oracle Platform
        ↓
Oracle Services
        ↓
Oracle Applications
        ↓
Game Integrations
```

Applications depend on Services rather than Supabase or Repositories. Operator
Service injects authenticated Account authority. Operator Repository owns the
trusted persistence boundary. Proxy performs only optimistic routing; Server
Components and Server Actions repeat authentication and verification checks.

## Lifecycle declaration

| Artifact or capability | Implemented | Certified | Deployed | Activated |
|---|---:|---:|---:|---:|
| Sprint 19 application and identity contracts | Yes | Yes | No | No |
| Migration 011 | Yes | Yes | No | No |
| Migration 012 | Yes | Yes | No | No |
| Production runtime persistence | Yes, as prior architecture | Prior evidence | No | No |

Migration 009 remains deployed and unchanged. Migration 010 remains certified,
undeployed and inactive. Gate C remains intentionally deferred.

## Closure conclusion

Sprint 19 is engineering-complete and certified. The next planned objective is
Sprint 20 — Platform Runtime Activation. Sprint 20 implementation must preserve
deployment and activation as separate gates and may not deploy Migrations 010,
011 or 012, reopen Gate C or enable runtime persistence without explicit
Founder authority. Sprint 20 has not begun because its production
composition-root ADR requires the Founder decision recorded in
`SPRINT_20_FOUNDER_DECISION_REQUIRED.md`.
