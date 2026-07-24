# SPRINT 19 FOUNDER DECISIONS IMPLEMENTATION EVIDENCE

**Sprint:** 19 — Account, Identity and Commissioning

**Status:** Implemented and code-certified; deployment and activation prohibited

**Date:** 24 July 2026

**Production change:** None

## Authoritative decision implementation

Oracle now implements Email + Password as the canonical Account credential.
Account creation routes through provider-native verification, and Proxy,
callback, onboarding and mutation boundaries all reject an unverified Account.
Verified Accounts may use Magic Links and Passkeys. OAuth remains an
architecturally supported future adapter rather than an enabled provider.

The web policy records Remember Me as enabled by default, a 30-day idle
timeout and recent authentication for sensitive identity mutation. Callsign
changes currently enforce a 15-minute recent-sign-in window. Provider and
deployment configuration must match these values before activation.

## Operator identity

The implementation separates:

- permanent `operators.id`;
- non-unique, freely mutable Display Name;
- permanent unique designation;
- globally unique, case-insensitive Callsign with preserved display case; and
- Account credentials owned by Supabase Auth.

Initial Callsigns are 3–32 ASCII characters. Letters, numbers, internal
spaces, hyphens and underscores are accepted. Restricting the initial policy
to ASCII rejects Unicode homoglyphs without inventing a confusable-character
registry.

Operators may choose a Callsign or ask Oracle to generate one. The eight
Founder-reserved identities are seeded. Moderation is data-driven and begins
with a prohibited-term baseline. Additive policy expansion does not change
Operator identity.

## Callsign lifecycle

Migration 012 implements:

- a maximum balance of three Callsign Change Tokens;
- consumption of one token per successful change;
- restoration of one consumed token per six elapsed months;
- a 12-month quarantine on every changed or deleted Callsign;
- historical Operator ownership in the quarantine ledger;
- case-insensitive current ownership;
- reserved and prohibited-name enforcement;
- trusted Callsign generation;
- service-role-only change authority; and
- deletion-time quarantine capture.

Changing email, password, Display Name or Callsign never creates a new
Operator or reassigns Oracle Intelligence.

## Desktop Companion

The Desktop Companion auth boundary is implemented in the Electron main
process as an inactive contract and service. It:

- accepts no password;
- persists only an OS-encrypted refresh token, trusted-device metadata and
  required Account/Operator identifiers;
- keeps access tokens in main-process memory;
- automatically rotates the encrypted refresh token after refresh;
- exposes only a credential-free projection;
- clears custody on explicit sign-out or provider reauthentication outcomes;
  and
- represents only the approved reauthentication reasons.

No credential field was added to the preload bridge or renderer contract.
Desktop auth composition is not activated.

## Lifecycle declaration

| Capability | Implemented | Certified | Deployed | Activated |
|---|---:|---:|---:|---:|
| Web authentication and verification journey | Yes | Yes | No | No |
| Operator commissioning application journey | Yes | Yes | No | No |
| Callsign and Display Name application controls | Yes | Yes | No | No |
| Desktop trusted-device custody contracts | Yes | Yes | No | No |
| Migration 012 SQL candidate | Yes | Yes | No | No |

Migrations 009, 010 and 011 remain byte-for-byte unchanged. Migration 010 and
Migration 011 remain undeployed. Gate C remains deferred. Runtime persistence
remains disabled.
