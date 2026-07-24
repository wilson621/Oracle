# SPRINT 19 PHASE 2 IMPLEMENTATION EVIDENCE

**Sprint:** 19 — Account, Identity and Commissioning

**Phase:** 2 — Provisioning contracts and Service boundary

**Status:** Implemented and verified

**Date:** 24 July 2026

**Production change:** None

## Outcome

Phase 2 introduces the minimum immutable Operator commissioning policy and
provisioning command contracts needed to continue without inventing Founder
policy values.

The Operator Service now:

- requires authenticated Account authority;
- injects the Account identifier rather than accepting it from an
  Application;
- fails closed when commissioning policy is unavailable;
- validates and normalises callsigns only through an explicit versioned
  policy; and
- delegates durable serialization to the Operator Repository.

The Repository owns the future trusted RPC invocation and validates the
returned Operator projection. A server-only composition helper owns access to
the trusted Supabase client. No Client Component receives `service_role`
authority.

## Policy treatment

The contract can represent Founder-selected Unicode normalization, case
normalization, length bounds, allowed pattern, reserved callsigns, comparison
semantics and uniqueness policy. It supplies no default values.

The existing browser-owned commissioning helper now fails closed because its
two-operation designation/update sequence is not authoritative for Sprint 19.
No replacement UI or runtime path is activated in this Phase.

## Verification

- Operator authentication remains mandatory.
- Missing Account-to-Operator ownership still fails explicitly for existing
  reads.
- Provisioning receives the authenticated Account from Operator Service.
- Missing policy fails before Repository access.
- Account identifiers are absent from caller-created provisioning commands.
- Existing Operator Intelligence authority verification remains green.
- The dependency-boundary audit reports no new exception or runtime cycle.

## Lifecycle state

| Capability | Implemented | Certified | Deployed | Activated |
|---|---:|---:|---:|---:|
| Provisioning contracts and Service boundary | Yes | Yes | No | No |
| Migration 011 | See Migration 011 certification | See Migration 011 certification | No | No |

The remaining Account, credential, session, recovery, redirect, callsign and
desktop policy values still require Founder selection before their product
journeys can be implemented honestly.
