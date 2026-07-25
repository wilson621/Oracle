# SPRINT 28 PRODUCT TRUTH INVENTORY

**Status:** Complete — governs Sprint 28 UI implementation
**Inventory date:** 25 July 2026
**Authority:** Founder-approved Sprint 28 Option A

---

# Decision Method

Every route and navigation entry was assessed independently against:

1. **Architectural Truth** — authoritative capability, governed evidence and
   ownership, renderer/privacy/consent/trust boundaries, and absence of mocks
   or implied support.
2. **Operator Value** — clear outcome, understandable purpose, repeat-use
   value, and material support for coaching, evidence, understanding,
   planning, progression, trust or decisions.

`retain` means the route belongs in the canonical journey. `consolidate` means
its valuable outcome moves into a stronger retained route. `defer` means the
capability is represented honestly but is not part of the active journey.
`redirect` preserves an old URL without preserving a redundant experience.
`remove` eliminates a non-product or mock-only surface.

# Route Inventory

| Route | Current truth | Architectural Truth | Operator Value | Decision | Sprint 28 contract |
|---|---|---|---|---|---|
| `/` | Server redirect to Oracle | Correct, no authority | Clear entry | retain | Continue canonical redirect to `/oracle` |
| `/auth` | Canonical Email + Password with optional verified-account methods | Auth Service boundary; browser credential interaction is approved | Required access journey | retain | Preserve and align language/accessibility |
| `/auth/callback` | Auth callback handler | Auth boundary; not a product surface | Required authentication completion | retain | Preserve, exclude from primary navigation |
| `/auth/verify-email` | Mandatory verification state | Correct commissioning gate | Clear next action | retain | Preserve, exclude from primary navigation |
| `/onboarding` | Server-authorised commissioning | Operator Service boundary | Required first-run outcome | retain | Preserve; successful commissioning enters Oracle home |
| `/oracle` | Grounded Conversation UI; API truthfully fails unavailable while consumers inactive | Conversation is non-authoritative; response exposes evidence metadata | Highest-value daily starting point | retain and improve | Become Home: knowledge, uncertainty, next action, primary journey and transient grounded question |
| `/companion` | Renderer-safe Guidance state; browser unavailable, Electron bridge optional | Correct Desktop-owned transient coordinator | High in-session value | retain and improve | Explain platform state, COD/Warzone first-proving-ground position, consent and Minecraft deferral |
| `/sessions` | Static empty page with unsupported search and implied active collection | Session Service owns lifecycle, but runtime persistence/producers are inactive | Essential evidence history | retain and replace | Explicit inactive history state, Session authority, evidence requirements and next action |
| `/reports` | Placeholder text only | Session Report Service exists; consumers inactive | High post-session decision value | retain and replace | Explain deterministic evidence-bound reports and inactive runtime |
| `/intelligence` | Legacy browser pipeline and calculated state | Bypasses accepted Understanding projection and can imply live truth | High value when framed as “what Oracle knows” | retain and replace | Purpose-scoped Understanding state with provenance/freshness/uncertainty contract; currently inactive |
| `/memory` | Legacy client getter and ungoverned “AI Memory” language | Duplicates governed Understanding and implies persistence | Outcome duplicates Intelligence | consolidate and redirect | Redirect to `/intelligence`; remove from navigation |
| `/dna` | Legacy client-derived behavioural profile | Duplicates governed Understanding and may overclaim inference | Outcome duplicates Intelligence | consolidate and redirect | Redirect to `/intelligence`; remove from navigation |
| `/coach` | Legacy client report with mission/XP language | Can imply awards and recommendations outside authoritative services | High repeat-use “what next” outcome | retain and replace | One coaching/planning surface; evidence-bound capability shown inactive until consumers activate |
| `/planner` | Manifest Application has a route but no page | Planner authority exists; missing route is a dead manifest claim | Valuable only with Coach | consolidate and redirect | Redirect to `/coach`; no separate navigation entry |
| `/progress` | Placeholder text | Progression Service owns exactly-once accounting; consumers inactive | High long-term return value | retain and replace | Unified Progress and Achievements surface with verified-evidence rule and inactive state |
| `/career` | Legacy client progression calculation | Risks browser-owned progression presentation from legacy source | Duplicates Progress | consolidate and redirect | Redirect to `/progress`; remove from navigation |
| `/achievements` | Legacy client achievement calculation | Risks browser-owned award state | Duplicates Progress | consolidate and redirect | Redirect to `/progress`; remove from navigation |
| `/operator` | Large legacy client page importing Repository and engines directly | Violates desired presentation boundary and duplicates identity/progress/intelligence | Weak as a separate technical dossier | consolidate and redirect | Redirect to `/settings`; remove from navigation |
| `/settings` | Missing | Needed presentation hub; underlying identity/security boundaries already exist | Clear control and trust outcome | retain and create | Hub for identity, security, privacy, consent, support and current runtime limitations |
| `/profile` | Server-authorised identity settings | Correct Operator identity boundary | Valuable settings subjourney | retain as subroute | Link from Settings; no separate primary navigation entry |
| `/account/security` | Approved browser Auth Service operations | Correct credential boundary; recent-auth rules remain Service-owned | Valuable settings subjourney | retain as subroute | Link from Settings; no separate primary navigation entry |
| `/loadouts` | Report generated from hard-coded mock weapon performance | False production evidence and unsupported recommendation | Potential future COD value, no truthful current outcome | defer and replace | Remove mock path; show explicit deferral; remove from navigation |

# API and Non-Page Route Inventory

| Route | Decision | Contract |
|---|---|---|
| `POST /api/oracle/conversation` | retain | Authenticated, transient and deterministic-unavailable while persisted sources are inactive; no model or mutation authority |
| `POST /api/oracle/analyze` | retain | Requires authoritative completed Session identity and remains inactive; no fabricated report |
| unmatched routes | improve | Accessible product-aware not-found state with route back to Oracle |
| uncaught route errors | improve | Accessible recovery state without leaking sensitive detail |

# Navigation Inventory

## Existing entries

| Entry | Existing destination | Decision | Canonical destination |
|---|---|---|---|
| Oracle | `/oracle` | retain | `/oracle` |
| Companion | `/companion` | retain | `/companion` |
| Session History | `/sessions` | retain | `/sessions` |
| AI Coach | `/coach` | retain and rename | `/coach` as Coach & Plan |
| AI Memory | `/memory` | consolidate | `/intelligence` |
| Intelligence | `/intelligence` | retain | `/intelligence` |
| Oracle DNA | `/dna` | consolidate | `/intelligence` |
| Operator | `/operator` | consolidate | `/settings` |
| Career | `/career` | consolidate | `/progress` |
| Achievements | `/achievements` | consolidate | `/progress` |
| Loadouts | `/loadouts` | defer | no primary entry |
| Combat Progress | `/progress` | retain and rename | `/progress` as Progress |
| Profile | `/profile` | consolidate under Settings | `/settings` |
| Security | `/account/security` | consolidate under Settings | `/settings` |
| legacy Oracle | `/oracle` | remove duplicate navigation source | `/oracle` |
| legacy Reports | `/reports` | retain in canonical source | `/reports` |
| legacy Loadouts | `/loadouts` | defer | no primary entry |
| legacy Progress | `/progress` | retain in canonical source | `/progress` |
| legacy Profile | `/profile` | consolidate | `/settings` |

## Canonical primary navigation

1. Oracle — daily starting point and next best action.
2. Companion — live, transient in-session delivery.
3. Sessions — authoritative evidence history.
4. Reports — deterministic post-session explanation.
5. Intelligence — governed understanding and uncertainty.
6. Coach & Plan — evidence-bound next action.
7. Progress — verified development over time.
8. Settings — identity, security, privacy and limitations.

# Surviving Founder Beta Journey

1. Sign in or complete commissioning.
2. Land on Oracle and understand current runtime readiness.
3. Open Companion and see whether in-session Guidance is available, why, and
   what consent applies.
4. Inspect Sessions as the sole historical evidence source.
5. Follow evidence into deterministic Reports.
6. Inspect governed Intelligence: knowledge, provenance, freshness and
   uncertainty.
7. See the next evidence-bound coaching and planning action.
8. Understand verified Progress and Achievement rules.
9. Review permanent identity, security, privacy, consent and support limits in
   Settings.
10. Return for another Session because new verified evidence is the only path
    to richer reports, understanding, coaching and progression.

# Non-Negotiable Status

- COD/Warzone remains the first proving ground.
- Minecraft is not operationally supported.
- Its certificate remains `provisionally-certified`.
- Minecraft observation remains disabled.
- Runtime persistence and persisted producers and consumers remain disabled.
- No production deployment, migration, Gate C or trust-boundary change is
  authorised.
