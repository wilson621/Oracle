# ORACLE GOVERNANCE REFACTOR DOCUMENTATION AUDIT

**Authority:** Evidence record for Oracle's first governance refactor
**Scope:** Documentation authority, classification, duplication, conflicts, links, status and repository integration
**Owner:** Oracle Governance and Platform Engineering
**Status:** Draft pending architectural review
**Classification:** Historical
**Expected Stability:** Immutable after acceptance; corrections require an appended audit or explicit amendment record
**Supersedes:** None
**Superseded By:** None
**Last Reviewed:** 21 July 2026

---

# Objective

Establish Oracle's first strategic governance layer without implementing
product functionality, beginning Sprint 15, redesigning architecture or
changing runtime behaviour.

The audit reviewed the documentation corpus that existed at baseline
`01a4bdba659731a16768cefd91ffc8a16192c5ed`, including:

- 37 Markdown files under `docs`
- repository entry and agent documentation
- the Desktop Platform API compatibility guide
- active, historical, archived, product, architecture, delivery, brand and
  exploratory document classes

# Approved Governance Model

The approved core hierarchy is:

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

The Founding Charter is the highest institutional authority. The Constitution
remains the highest product and architectural authority. Strategy and
Engineering Principles are peer operational authorities below the Constitution
and cannot override it.

Accepted ADRs and the Oracle Codex are supporting controls between Engineering
Principles and Architecture. ADRs preserve specific decisions; the Codex owns
operational practice.

# Documents Introduced

- `docs/founding/ORACLE_FOUNDING_CHARTER.md`
- `docs/founding/THE_ORACLE_WAY.md`
- `docs/founding/ORACLE_STRATEGY.md`
- `docs/founding/ORACLE_ENGINEERING_PRINCIPLES.md`
- `docs/DOCUMENTATION_INDEX.md`
- this audit record

# Classification Model

## Stable

Enduring institutional, cultural, constitutional and engineering principles.
Changes require explicit governance review.

## Living

Strategy, operational standards, architecture, status and delivery documents
reviewed as Oracle evolves.

## Historical

Accepted decisions, closures, retrospectives, audits and archives. Historical
records are appended or explicitly superseded rather than silently rewritten.

Existing historical records created before the metadata standard were
catalogued without being rewritten merely to add new metadata.

# Findings and Resolution

## Authority Conflicts

### Finding

The Manifesto claimed to be the foundation of all future decisions, the
Constitution claimed highest Oracle authority, and the Codex claimed to be
secondary only to the Constitution while omitting ADRs from its hierarchy.

### Resolution

- Founding Charter established as highest institutional authority.
- Constitution preserved as highest product and architectural authority.
- Manifesto retained as non-authoritative interpretation.
- Codex authority and hierarchy reconciled.
- accepted ADRs retained as specific binding architectural decisions beneath
  the Constitution and Engineering Principles.

## Canonical Content Duplication

### Finding

Mission, vision, culture, strategy and engineering principles were repeated
across the Manifesto, Project Vision, Constitution, Oracle Principles, Codex,
Roadmap and Master Build Plan.

### Resolution

- Founding Charter owns purpose, mission and vision.
- The Oracle Way owns internal culture and behaviour.
- Oracle Strategy owns strategic doctrine.
- Oracle Engineering Principles owns durable engineering values.
- Project Vision and Oracle Principles are explicitly superseded while their
  content and paths remain preserved.
- Codex, Roadmap, Master Build Plan and Architecture now reference canonical
  sources rather than claiming competing principle sets.

## Constitutional Protection

### Finding

The proposed founding layer could have created ambiguity about whether
institutional or strategic documents could override architectural safety.

### Resolution

The Founding Charter, Constitution, Engineering Principles, Strategy, Codex and
Documentation Index explicitly state that:

- founding documents cannot override constitutional architecture
- Strategy cannot authorise constitutionally prohibited behaviour
- Engineering Principles cannot override the Constitution
- the External Companion Principle remains binding unless the Constitution
  itself is formally amended

## Product Identity

### Finding

Existing Branding defines Project Meta as the company and repository identity,
and Oracle as the product and platform. A document named Oracle Founding Charter
could have silently implied a corporate rename.

### Resolution

The Charter governs the Oracle initiative and its stewards. Branding explicitly
preserves the current company, repository and product identities until a
separate deliberate decision changes them.

## Competitive Versus Universal Positioning

### Finding

The Constitution defines a broad multi-game platform, while the README,
Manifesto, Brand Bible and Oracle Principles used narrower competitive-gaming
language.

### Resolution

Oracle Strategy defines Oracle as an Operator Intelligence Platform for gaming.
Competitive improvement remains an important initial market and use case, not
an institutional or architectural limit. Brand positioning was reconciled with
that distinction.

## Release Governance

### Finding

The Codex, Roadmap and Master Build Plan described push and release tags as
mandatory Sprint-closure stages, while recent accepted closure records treated
release tagging as separately authorised.

### Resolution

Sprint closure requires an approved commit and clean repository. Push, merge
and product-release tags are separately authorised release activities. Release
verification remains mandatory when those activities are approved.

## Status Drift

### Finding

The README reported Sprint 12.1 complete and Sprint 13 not started. Active
planning documents used “Current Sprint” even though Sprint 14 was closed and
Sprint 15 had not begun. The Architecture Index introduction described current
architecture primarily through Sprint 12.1.

### Resolution

- README reflects formal Sprint 14 closure and the non-Sprint governance work.
- Project Board distinguishes current governance activity from the latest
  closed Sprint.
- Master Build Plan states that no Sprint is active.
- Implementation Status uses “Latest Closed Sprint.”
- Architecture Index introduction reflects delivery through Sprint 14.

## Structural Duplication

### Finding

The Project Board contained a duplicate Sprint 13 heading and the Brand Bible
contained a duplicate Taglines heading.

### Resolution

Both duplicate headings were removed without altering historical delivery or
brand content.

## Recommendation Ownership Wording

### Finding

Architecture stated that recommendations belonged exclusively to Decision
Intelligence, while accepted ADR-032 established Companion Guidance as a
separate external recommendation model.

### Resolution

Architecture now scopes Decision Intelligence ownership to the Oracle
Intelligence pipeline and explicitly recognises ADR-032's Companion Guidance
boundary. This is documentation reconciliation, not architectural redesign.

## Documentation Entry Point

### Finding

No canonical Documentation Index or contributor governance reading path
existed. The README table was incomplete and did not identify authority or
historical status.

### Resolution

`docs/DOCUMENTATION_INDEX.md` now owns hierarchy, reading order,
classification, canonical ownership, supporting documents and supersession.
README directs contributors to that index. A separate contributor guide was not
created because the Index and Codex cover the current need without another
governance surface.

# Historical Preservation

- Existing ADR bodies were not rewritten.
- Existing Sprint closure reports, retrospectives and implementation audits
  were not rewritten.
- Archived documentation was not promoted or modified.
- Project Vision, Oracle Principles and Manifesto paths remain available with
  explicit status and canonical replacements.
- Git preserves the complete pre-refactor content of reduced or reclassified
  living documents.

# Intentionally Deferred Documentation Work

The following items do not block the governance refactor:

- consolidating the Sprint 5 `Contextual-Intelligence.md` description into
  current product architecture
- creating a dedicated contributor guide if contributor onboarding later
  requires more than the Documentation Index and Codex
- broader editorial standardisation of historical and archived documents
- adding the modern metadata block to pre-existing historical files, which
  would conflict with the new immutable-history rule

# Scope Confirmation

This refactor changes documentation governance only.

It does not:

- implement product functionality
- change runtime behaviour
- redesign Platform, Services, Applications or Game Integrations
- alter accepted ADR decisions
- modify the External Companion Principle
- begin Sprint 15

# Verification Record

Final verification passed:

- the approved hierarchy is represented consistently in the Documentation
  Index, Constitution and operational governance
- the Founding Charter is the only highest institutional authority
- the Constitution remains the only highest product and architectural authority
- Strategy and Engineering Principles explicitly remain beneath the
  Constitution
- the External Companion Principle is protected explicitly across founding,
  constitutional, strategic and engineering governance
- canonical ownership is unique and superseded sources are clearly marked
- all relative Markdown links resolve
- all 25 metadata-bearing documents contain the required fields and use Stable,
  Living or Historical classification
- audited stale Sprint, route, authority and mandatory-release wording is absent
  from active governance
- duplicate Project Board and Brand Bible headings are removed
- existing Sprint and archive records are unchanged
- all 26 changed files are README or Markdown files under `docs`
- `git diff --check` passes
- `npm run architecture:audit` passes across 342 TypeScript files with 55
  documented legacy exceptions, five documented source-cycle groups, zero
  runtime-cycle groups and no new boundary violations
- `npm run guidance:verify` passes contract, Provider Service, curated package
  and Application-boundary verification
- `npm run companion:presentation:verify` passes
- `npm run desktop:compile` passes
- `npm run build` passes and includes `/companion`
- `npm run lint` passes with zero errors and the five pre-existing warnings

No product functionality, runtime behaviour or architectural ownership changed.
No Sprint 15 work began. No genuine blocker remains.
