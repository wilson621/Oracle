# PROJECT META

# Architectural Decisions

Version 2.0

Last Updated: 7 July 2026

---

# Purpose

This document records significant architectural and product decisions made during the development of Project Meta.

These decisions exist to preserve long-term consistency and explain *why* important choices were made.

Every future architectural decision should be added to this document.

---

# DEC-001

Date

4 July 2026

Decision

Project Meta is the company.

Oracle is the flagship product.

Reason

Separating the company from the product allows Oracle to expand beyond a single game while enabling Project Meta to build additional products in the future.

Status

✅ Accepted

---

# DEC-002

Date

4 July 2026

Decision

Players are called Operators.

Reason

"Operator" creates identity and immersion.

It reflects the tactical nature of Oracle better than the generic term "user."

Status

✅ Accepted

---

# DEC-003

Date

4 July 2026

Decision

Every analysis is called an Oracle Session.

Reason

"Report" describes a document.

"Oracle Session" describes an experience.

Status

✅ Accepted

---

# DEC-004

Date

4 July 2026

Decision

Oracle exists to build better players rather than simply provide AI answers.

Reason

The long-term mission is player improvement.

Every feature must contribute towards that goal.

Status

✅ Accepted

---

# DEC-005

Date

4 July 2026

Decision

Oracle will be built as a platform rather than a single-game application.

Reason

Call of Duty is Version One.

The long-term vision is to create the world's most trusted AI gaming coach across multiple games while maintaining one philosophy, one brand and one user experience.

Status

✅ Accepted

---

# DEC-006

Date

4 July 2026

Decision

Every major product decision must satisfy three questions.

- Does this make the Operator better?
- Does this strengthen the Oracle brand?
- Would we still make this decision if Oracle had one million Operators?

Reason

These questions ensure short-term convenience never compromises the long-term vision.

Status

✅ Accepted

---

# DEC-007

Date

4 July 2026

Decision

Whenever possible, Oracle should show rather than tell.

Reason

Visual learning is faster, more memorable and more actionable than text alone.

Maps, diagrams, timelines and annotated gameplay should always be preferred over unnecessary paragraphs.

Status

✅ Accepted

---

# DEC-008

Date

4 July 2026

Decision

Every player becomes an Operator when creating an Oracle account.

Reason

An Operator is more than a user account.

It represents the beginning of a player's journey and reinforces Oracle's identity from the first interaction.

Status

✅ Accepted

---

# DEC-009

Date

7 July 2026

Decision

OracleBrain became the intelligence orchestration layer.

Reason

Rather than allowing UI components to communicate directly with multiple intelligence engines, OracleBrain became the single entry point for all Oracle intelligence.

This keeps business logic out of the interface and allows every future application to reuse the same intelligence.

Status

✅ Accepted

---

# DEC-010

Date

7 July 2026

Decision

Project Meta adopted a reusable design system.

Reason

Reusable UI components improve consistency, reduce duplicated styling and accelerate future feature development.

The initial design system includes:

- Card
- MetricCard
- AnimatedNumber
- ConfidenceRing
- StatusBadge

Future components should extend this design system rather than introducing duplicate implementations.

Status

✅ Accepted

---

# DEC-011

Date

7 July 2026

Decision

Every significant UI improvement requires a visual review.

Reason

Successful compilation does not guarantee a premium experience.

Project Meta now follows a development workflow where major interface changes are reviewed visually before being considered complete.

Status

✅ Accepted

---

# DEC-012

Date

7 July 2026

Decision

Documentation evolves alongside the software.

Reason

Documentation should accurately describe the current architecture, workflow and product vision.

Technical documentation is treated as part of the product rather than an afterthought.

Status

✅ Accepted

---

# DEC-013

Date

7 July 2026

Decision

Oracle communicates intelligence before statistics.

Reason

Operators should first understand Oracle's conclusions before being presented with supporting metrics.

This principle will guide future development of Oracle Voice, Dynamic Briefings, AI Coach and dashboard experiences.

Status

✅ Accepted

---

# Future Decisions

Every significant architectural, product or workflow decision should be recorded here.

This document serves as the long-term decision history for Project Meta.