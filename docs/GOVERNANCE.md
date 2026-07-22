# ORACLE ENGINEERING GOVERNANCE

**Authority:** Canonical engineering governance reference beneath the Oracle Platform Constitution
**Scope:** Delivery hierarchy, approval gates, Sprint lifecycle, definition of done and deployment governance
**Owner:** Oracle Governance and Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Updated only through explicit founder governance approval
**Supersedes:** Delivery-process guidance duplicated across living planning documents
**Superseded By:** None
**Last Reviewed:** 22 July 2026
**Version:** 1.1

---

# Purpose

This document defines how Oracle converts strategy into reviewed production
outcomes. It governs delivery sequencing and approval. It does not override the
Oracle Platform Constitution, accepted ADRs, the Oracle Codex or architectural
ownership boundaries.

# Governance Hierarchy

```text
Roadmap
Vision and strategic direction
        |
        v
Epic
Major platform capability
        |
        v
Sprint
Independently reviewable production objective
        |
        v
Phase
Internal implementation stage within a Sprint
```

- A Roadmap expresses strategic direction. Placement does not authorise work.
- An Epic groups related production objectives into a major capability.
- A Sprint delivers one bounded, independently reviewable production objective.
- A Phase is an internal sequencing and verification boundary. It is not a
  separately activated Roadmap objective.

# Authority and Delivery Records

The governance documents have distinct responsibilities:

1. The Roadmap orders approved strategic direction and Epics.
2. The Engineering Programme defines the approved multi-Epic Sprint sequence,
   dependencies, Beta Gates and Founder review points from Sprint 17 to Beta.
3. Accepted ADRs bind architectural decisions within constitutional limits.
4. The Master Build Plan identifies the next approved production objective and
   its sequencing.
5. A Sprint Plan defines scope, exclusions, phases, acceptance criteria and
   verification for one Sprint.
6. The Project Board records current approved progress.
7. Implementation fulfils the approved Sprint Plan.
8. Implementation Status records only evidence-backed repository capability.
9. Sprint closure records preserve the accepted outcome and verification.

No lower record may silently expand or reinterpret a higher authority.

# Sprint Lifecycle

Every Sprint follows this lifecycle:

```text
Architectural audit
        -> Planning proposal
        -> Founder planning approval
        -> Sprint activation
        -> Phased implementation and verification
        -> Founder phase gates where required
        -> Full closure verification
        -> Founder closure approval
        -> Closure commit
        -> Separately authorised push or release activity
```

Implementation may begin only after the Sprint is explicitly activated.
Failure at a required phase gate stops later phases. A Sprint is not active
merely because it appears on the Roadmap, Project Board or Master Build Plan.

# Founder Approval Gates

Founder approval is required for:

- architectural direction and material boundary changes
- Sprint Plan acceptance and activation
- scope changes after activation
- progression through explicitly gated phases
- permanent database deployment
- Sprint closure and the closure commit
- production release, tagging or other externally consequential delivery

Approval for one action does not imply approval for the next. In particular,
implementation approval does not authorise deployment, and closure approval
does not authorise a production release unless explicitly stated.

# Definition of Done

A Sprint is complete only when:

- the approved production objective and acceptance criteria are satisfied
- architectural and ownership boundaries remain compliant
- focused and regression verification pass
- security, privacy and migration gates pass where applicable
- relevant living documentation reflects verified reality
- historical records remain accurate
- founder closure approval is recorded
- the approved closure commit exists
- the repository is clean

Deferred work and outstanding risks must be explicit. A green build alone is
not completion.

# Database Deployment Governance

Database work follows Oracle's standard migration discipline:

```text
Implementation
-> Static Verification
-> Rollback Validation
-> Independent Catalog Verification
-> Founder Review
-> Permanent Deployment
-> Security Verification
-> Authenticated Isolation Verification
-> Founder Closure
-> Commit
```

Rollback validation does not authorise permanent deployment. Permanent
deployment requires explicit founder approval, and any migration failure stops
the sequence without an unapproved repair or second migration attempt.

# Historical Alias Policy

Canonical numbering may replace a transitional planning label, but history is
never rewritten.

- Living documents use the canonical Sprint number.
- Historical records may retain the execution-time alias.
- When traceability requires it, living documents record both forms once, for
  example: `Sprint 16 — Trust Boundary (executed as Sprint 15.5A)`.
- Commits, accepted ADRs, approved Sprint Plans and archived records are not
  renamed or rewritten solely to adopt a new convention.
- The Sprint Index records canonical numbers, aliases, status and evidence.

# Current Numbering Transition

- Sprint 15 — Operator Understanding Foundation: historical.
- Sprint 16 — Trust Boundary: complete; executed under the alias Sprint 15.5A.
- Sprint 17 — Scale-Safe Trust Data Plane: Founder-approved and fully complete,
  including Migration 009 production deployment; previously proposed as Scale
  Hardening under the alias Sprint 15.5B.
- Sprint 18 — Operator Trust and Control: approved in the Engineering
  Programme but not started or activated.

Migration 009 is deployed and verified, but runtime persistence remains
disabled. Deployment or closure of one Sprint does not activate the next
Sprint.
