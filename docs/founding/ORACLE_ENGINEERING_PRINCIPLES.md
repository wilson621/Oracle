# ORACLE ENGINEERING PRINCIPLES

**Authority:** Canonical durable engineering principles within the Oracle Platform Constitution
**Scope:** Engineering judgment, quality, ownership and verification
**Owner:** Oracle Platform Engineering
**Status:** Active
**Classification:** Stable
**Expected Stability:** Multi-year; implementation practices evolve in the Codex
**Supersedes:** Engineering principles previously duplicated across Oracle Principles, Codex, Roadmap and Master Build Plan
**Superseded By:** None
**Last Reviewed:** 21 July 2026

---

# Purpose

These principles define the enduring standard for engineering Oracle. They
guide judgment when more detailed rules do not decide the answer.

The Oracle Codex owns operational standards, workflows and checklists. Accepted
ADRs own specific architectural decisions. Architecture documentation describes
the resulting system. None may contradict the Constitution.

# Constitutional Boundary

Engineering Principles do not override the Oracle Platform Constitution.

The Constitution remains the highest product and architectural authority.
Strategy, technical opportunity, performance, user demand and delivery urgency
cannot authorise prohibited behaviour.

The External Companion Principle remains immutable unless the Constitution
itself is formally amended. Oracle engineering must never introduce injection,
game-memory access or modification, hooks, gameplay or input automation,
anti-cheat interaction, or any other constitutionally prohibited technique.

# Principles

## 1. Quality Is Not Negotiable

Correctness, safety, clarity and maintainability are part of the product.
Incomplete work may be deferred. Unverified work must not be declared complete.

## 2. Platform Before Feature

Strengthen or correctly consume shared Platform capability when responsibility
is shared. Do not use platform ambition to justify infrastructure without a
defined Operator outcome.

## 3. Architecture Before Implementation

Understand ownership, boundaries, contracts and lifecycle before changing the
system. Extend verified architecture unless an explicit review approves a
change.

## 4. Explainability Is a Requirement

Important intelligence, recommendations, confidence and automated system
decisions must remain inspectable and supportable. Opaque convenience is not a
substitute for trustworthy reasoning.

## 5. Ownership Must Be Explicit

Every capability, source of truth and lifecycle has one authoritative owner.
Ambiguous ownership creates duplication and hidden failure.

## 6. Reuse Before Rebuild

Prefer an existing authoritative contract or capability when it owns the
responsibility. Reuse must not become forced coupling; local concerns may remain
local.

## 7. Simplicity Is a Feature

Choose the smallest design that satisfies the real requirement and preserves
future integrity. Complexity must earn its ongoing cost.

## 8. Contracts Over Coupling

Cross-boundary communication uses explicit, typed, versioned and testable
contracts. Provider implementations, mutable authority and platform objects do
not leak across ownership boundaries.

## 9. Evidence Before Confidence

Engineering claims are supported by inspection and verification. Product
confidence is calculated honestly. Unknowns and limitations are stated.

## 10. Verification Completes the Work

Verification is proportional to risk and covers behaviour, architecture,
failure paths and documentation. A green result is evidence, not ceremony.

## 11. Documentation Is Part of the System

Canonical documentation must reflect the implemented repository. Historical
records remain historical. Planning must not be confused with delivery.

## 12. Preserve Working Value

Do not redesign or discard verified systems for aesthetic consistency. Improve
incrementally through explicit compatibility boundaries.

## 13. Safety and Privacy Are Architectural

Safety, privacy, permissions and Fair Play are designed into boundaries and
defaults. They are not deferred to release review.

## 14. Leave Oracle Better Than You Found It

Every change should improve the relevant combination of Operator value,
correctness, clarity, architecture, verification or institutional knowledge.
Avoid unrelated refactoring and do not transfer hidden debt to the next steward.

# Engineering Decision Test

Before implementation, ask:

1. Is the Operator outcome clear?
2. Does the work comply with the Constitution?
3. Is ownership explicit and correctly layered?
4. Can an existing capability or contract responsibly serve the need?
5. Is the design simpler than the alternatives without hiding risk?
6. Can the result be explained and verified?
7. Does documentation identify truth, status and limitations accurately?
8. Will the change leave Oracle better for the next steward?

If a constitutional answer is no, stop and escalate. If another answer is
unclear, resolve it before implementation or record the deliberate trade-off.

# Relationship to Other Engineering Governance

```text
Oracle Platform Constitution
        ↓
Oracle Engineering Principles
        ↓
Accepted ADRs
        ↓
Oracle Codex
        ↓
Architecture Documentation
        ↓
Approved Delivery Plans
        ↓
Implementation
```

Oracle Strategy is a peer operational authority to these Principles beneath the
Constitution. Strategy chooses direction; Engineering Principles govern how
that direction is built. Architecture reconciles both. Neither peer may
override the Constitution.

# Review Standard

These principles are stable. Change them only when a durable engineering value
has genuinely changed, not to justify a local exception. Detailed practices
belong in the Codex; specific architectural commitments belong in ADRs.
