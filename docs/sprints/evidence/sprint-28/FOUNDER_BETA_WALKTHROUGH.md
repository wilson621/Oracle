# SPRINT 28 FOUNDER BETA WALKTHROUGH EVIDENCE

**Result:** Pass — bounded local Web and Electron certification
**Date:** 25 July 2026
**Production affected:** No

---

# Certification Method

The walkthrough was exercised in two explicit layers so authentication was not
weakened:

1. The real local Web runtime verified the unauthenticated redirect, canonical
   Email + Password journey, optional Passkey and Magic Link presentation,
   Remember Me statement, 30-day idle timeout statement, labelled controls and
   mobile layout.
2. A disposable presentation-only copy omitted `proxy.ts` and exercised the
   authenticated interior without changing repository source or security. It
   was deleted immediately after certification.

No test Account or persistent session was created. Therefore this evidence
does not claim a live end-to-end Supabase sign-in transaction. Sprint 19's
accepted authentication certification remains authoritative for that boundary.

# Web Journey

The following routes rendered with one eight-entry navigation model, correct
`aria-current` state and no desktop horizontal overflow:

- `/oracle` — current readiness, grounded question boundary and evidence
  journey;
- `/companion` — renderer-safe unavailable state and Companion limitations;
- `/sessions` — authoritative but inactive historical evidence;
- `/reports` — deterministic report authority and evidence requirement;
- `/intelligence` — governed Understanding and explicit uncertainty;
- `/coach` — coaching, Mission and Planner ownership with no fabricated next
  action;
- `/progress` — verified-evidence progression accounting;
- `/settings` — identity, security, privacy, consent and compatibility status;
  and
- `/loadouts` — explicit deferred state outside primary navigation.

Redirects were exercised:

- `/memory` and `/dna` to `/intelligence`;
- `/career` and `/achievements` to `/progress`;
- `/operator` to `/settings`; and
- `/planner` to `/coach`.

# Responsive and Accessibility Evidence

At a 390 by 844 viewport:

- Oracle, Companion and Settings rendered without horizontal document
  overflow;
- all eight canonical navigation links remained available;
- Auth rendered without horizontal overflow;
- Email and Password retained programmatic labels;
- Password retained the correct `current-password` autocomplete contract;
- the 30-day idle-timeout statement remained visible; and
- the shared main-content target and skip-link contract were present.

An initial test found Companion's compact navigation widened the document. The
implementation was corrected to a bounded wrapping navigation and the exact
viewport was reverified at equal client and scroll widths.

# Electron Evidence

Electron was independently verified through:

- exact manifest/runtime equality for the Electron composition root;
- Electron TypeScript compilation;
- native Windows Window Discovery self-contained build;
- native Windows Window Observer self-contained build;
- Desktop Companion Guidance delivery certification;
- Sprint 27 privacy, observation and fail-closed compatibility certification;
  and
- renderer-safe Companion projection checks.

Sprint 29 owns installer, signing and distribution qualification. This
walkthrough does not claim a signed installed desktop release.

# Operator Journey Result

The surviving journey demonstrates:

- **what Oracle knows:** only governed evidence and projections;
- **why it believes it:** source, authority, confidence and freshness
  boundaries;
- **what remains uncertain:** explicit inactive, unavailable and deferred
  states;
- **what to do next:** establish verified Session Evidence before downstream
  analysis or development;
- **progress over time:** only authoritative exactly-once accounting;
- **trust:** identity, privacy, consent, renderer and retention limitations;
  and
- **return value:** every verified Session can enrich Reports, Understanding,
  Coaching and Progress after their separately governed activation.
