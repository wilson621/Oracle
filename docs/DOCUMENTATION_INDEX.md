# ORACLE DOCUMENTATION INDEX

**Authority:** Canonical repository entry point for Oracle documentation
**Scope:** Governance hierarchy, reading order, classifications, ownership and document status
**Owner:** Oracle Governance and Platform Engineering
**Status:** Active
**Classification:** Living
**Expected Stability:** Reviewed whenever governance or canonical documentation changes
**Supersedes:** The incomplete documentation table in `README.md` as the canonical documentation index
**Superseded By:** None
**Last Reviewed:** 21 July 2026

---

# Purpose

This index is the repository entry point for Oracle documentation. It identifies
which documents are authoritative, what each document owns, how documents
relate and where current implementation truth is recorded.

This index is navigational. It does not create product, architectural or
delivery authority of its own.

# Core Governance Hierarchy

```text
Oracle Founding Charter
        │
        ▼
The Oracle Way
        │
        ▼
Oracle Platform Constitution
        │
        ├──────────────┐
        ▼              ▼
Oracle Engineering   Oracle Strategy
Principles
        │              │
        └──────┬───────┘
               ▼
Architecture
               ▼
Roadmap
               ▼
Master Build Plan
               ▼
Project Board
               ▼
Sprint Execution
               ▼
Implementation
```

The Founding Charter is the highest institutional authority. The Oracle
Platform Constitution is the highest product and architectural authority.
Neither Oracle Strategy nor Oracle Engineering Principles may override the
Constitution.

Founding documents cannot authorise a constitutional exception. Strategy
cannot authorise behaviour prohibited by the Constitution. The External
Companion Principle remains binding unless the Constitution itself is formally
amended.

Accepted ADRs and the Oracle Codex are supporting controls between Engineering
Principles and Architecture:

- accepted ADRs preserve specific binding architectural decisions
- the Codex defines operational engineering standards and workflow
- both remain subordinate to the Constitution and Engineering Principles
- Architecture must reflect accepted ADRs and compliant engineering practice

[Oracle Engineering Governance](GOVERNANCE.md) governs how approved strategy
and architecture become Epics, Sprints, internal Phases, deployments and
closure evidence. It is subordinate to the Constitution, accepted ADRs and the
Codex and does not create implementation authority by itself.

# Document Classifications

## Stable

Stable documents define enduring identity, culture or constitutional
principles. They change rarely and require explicit governance review.

Examples:

- Founding Charter
- The Oracle Way
- Oracle Platform Constitution
- Oracle Engineering Principles

## Living

Living documents are reviewed continuously as strategy, architecture,
implementation or delivery changes. They must remain aligned with higher
authority and current evidence.

Examples:

- Oracle Strategy
- Oracle Codex
- Architecture and Architecture Index
- Implementation Status
- Roadmap
- Master Build Plan
- Project Board
- Oracle Engineering Governance
- Sprint Index
- this Documentation Index

## Historical

Historical documents preserve decisions or delivery evidence at a point in
time. Their records are immutable after acceptance or closure. New information
is appended through a new record, amendment entry or superseding decision; old
records are not silently rewritten.

Examples:

- individual ADRs in the Decisions ledger
- Sprint closure reports
- retrospectives and implementation audits
- archived documents
- the Governance Refactor Documentation Audit

Existing historical files created before this metadata standard are catalogued
here without being rewritten solely to add metadata.

# Authority Rules

1. Lower-level documents and implementation must comply with higher-level
   authority.
2. Domain authority applies only within the document's stated scope.
3. The Constitution blocks prohibited product or architectural behaviour even
   when a strategic or commercial document recommends it.
4. Accepted ADRs may refine architecture but cannot override the Constitution.
5. Living status documents must distinguish aspiration, plan and verified
   implementation.
6. Historical records are preserved. A new record supersedes or amends; it does
   not rewrite prior evidence.
7. When documents conflict, stop, identify their scope and authority, and
   reconcile the lower-authority source.

# Required Reading Order

## All Oracle Stewards

1. [Oracle Founding Charter](founding/ORACLE_FOUNDING_CHARTER.md)
2. [The Oracle Way](founding/THE_ORACLE_WAY.md)
3. [Oracle Platform Constitution](ORACLE_PLATFORM_CONSTITUTION.md)
4. [Oracle Strategy](founding/ORACLE_STRATEGY.md)

## Engineering Work

Continue with:

5. [Oracle Engineering Principles](founding/ORACLE_ENGINEERING_PRINCIPLES.md)
6. [Architectural Decisions](Decisions.md)
7. [Oracle Codex](Oracle_Codex.md)
8. [Architecture](Architecture.md)
9. [Architecture Index](architecture/ARCHITECTURE_INDEX.md)
10. [Implementation Status](architecture/IMPLEMENTATION_STATUS.md)
11. [Oracle Engineering Governance](GOVERNANCE.md)

## Planning and Delivery

Continue with:

12. [Roadmap](Roadmap.md)
13. [Master Build Plan](MASTER_BUILD_PLAN.md)
14. [Project Board](PROJECT_BOARD.md)
15. [Sprint Index](sprints/SPRINT_INDEX.md)
16. the relevant Sprint record under [`docs/sprints`](sprints/)

Implementation begins only after the applicable governance, architecture and
delivery authorities have been reviewed.

# Canonical Governance Ownership

| Concern | Canonical owner | Classification |
|---|---|---|
| Institutional purpose, mission and vision | [Founding Charter](founding/ORACLE_FOUNDING_CHARTER.md) | Stable |
| Culture, behaviour, leadership and hiring | [The Oracle Way](founding/THE_ORACLE_WAY.md) | Stable |
| Product and architectural constraints | [Platform Constitution](ORACLE_PLATFORM_CONSTITUTION.md) | Stable |
| Long-term strategic doctrine | [Oracle Strategy](founding/ORACLE_STRATEGY.md) | Living |
| Durable engineering values | [Engineering Principles](founding/ORACLE_ENGINEERING_PRINCIPLES.md) | Stable |
| Specific architectural decisions | [Decisions / ADR ledger](Decisions.md) | Historical, append-only |
| Operational engineering standards | [Oracle Codex](Oracle_Codex.md) | Living |
| Current designed architecture | [Architecture](Architecture.md) | Living |
| Subsystem ownership and boundaries | [Architecture Index](architecture/ARCHITECTURE_INDEX.md) | Living |
| Verified repository capability | [Implementation Status](architecture/IMPLEMENTATION_STATUS.md) | Living |
| Engineering delivery governance and approval gates | [Oracle Engineering Governance](GOVERNANCE.md) | Living |
| Strategic delivery sequence | [Roadmap](Roadmap.md) | Living |
| Approved engineering execution plan | [Master Build Plan](MASTER_BUILD_PLAN.md) | Living |
| Current approved progress | [Project Board](PROJECT_BOARD.md) | Living |
| Canonical Sprint numbering and aliases | [Sprint Index](sprints/SPRINT_INDEX.md) | Living index |
| Closed Sprint evidence | [`docs/sprints`](sprints/) | Historical |

# Supporting Documentation

## Product and Architecture

- [Companion Architecture](product/COMPANION_ARCHITECTURE.md) — Companion
  product and technical boundary; Living
- [Call of Duty Guidance Package](product/CALL_OF_DUTY_GUIDANCE_PACKAGE.md) —
  reviewed package scope and sources; Living
- [Dependency Boundary Audit](architecture/DEPENDENCY_BOUNDARY_AUDIT.md) —
  accepted audit baseline with automated enforcement; Historical
- [Architecture v4.1](architecture/ARCHITECTURE_v4.1.md) — historical engine
  runtime baseline; Historical
- [Desktop API Compatibility](../desktop/platform/API_COMPATIBILITY.md) — frozen
  Desktop Platform API version 1 policy; Stable within that API version

## Brand and Experience

- [Branding](BRANDING.md) — product and repository naming
- [Brand Bible](Brand-Bible.md) — external product identity, language and voice
- [Oracle Design System](Oracle-Design-System.md) — visual and interaction
  standards

These documents govern product expression within the Founding Charter, Oracle
Way and Constitution. They do not define internal company culture or
architectural exceptions.

## Exploration

- [Ideas](Ideas.md) — uncommitted research and innovation backlog
- [Signature Features](SIGNATURE_FEATURES.md) — proposed defining experiences
- [Contextual Intelligence](Contextual-Intelligence.md) — Sprint 5 subsystem
  description; retained for historical context pending separate consolidation

Exploratory documents are non-authoritative. Recording an idea does not place it
on the Roadmap or authorise implementation.

# Superseded and Interpretive Documents

| Document | Status | Canonical replacement |
|---|---|---|
| [Project Vision](PROJECT_VISION.md) | Superseded navigation document | Founding Charter and Oracle Strategy |
| [Oracle Principles](Oracle-Principles.md) | Superseded navigation document | The Oracle Way, Constitution and Engineering Principles |
| [Manifesto](Manifesto.md) | Retained interpretive statement; non-authoritative | Founding Charter for purpose, mission and vision |

These paths are retained to preserve links and historical context. Their status
must be explicit, and they must not duplicate or override canonical governance.

# Historical Records

Historical Sprint records are stored under [`docs/sprints`](sprints/).
Superseded early documentation is stored under [`docs/archive`](archive/).

Archive location alone does not make content current or authoritative. Archived
documents are evidence of earlier thinking and must not be used to override an
active canonical source.

# Metadata Standard

New governing documents use this metadata order:

```text
Authority:
Scope:
Owner:
Status:
Classification:
Expected Stability:
Supersedes:
Superseded By:
Last Reviewed:
```

Use `None` when no supersession relationship exists. Historical records include
the metadata when created; accepted historical content is not rewritten merely
to adopt a later formatting standard.

# Maintenance Rules

- Update this index whenever a canonical document is created, superseded,
  relocated or reclassified.
- Do not duplicate canonical mission, vision, culture, strategy or engineering
  principles in lower-level documents.
- Link to canonical sources and state only the local operational consequence.
- Review living documents at relevant strategic, architectural and Sprint
  transitions.
- Preserve historical records and use Git for immutable history.
- Verify relative links and authority terminology before governance changes are
  accepted.
