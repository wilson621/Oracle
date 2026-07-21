# CALL OF DUTY CURATED GUIDANCE PACKAGE

Version 1.0

Status: Sprint 14 reference Game Integration guidance package

Source review date: 21 July 2026

---

# Purpose

This package is the canonical reference for how a Game Integration contributes
reviewed knowledge through the Platform Guidance contracts and the
Services-owned Guidance Provider Service.

The package owns Call of Duty knowledge only. It does not own Guidance
contracts, provider orchestration, recommendation ranking, personalisation,
presentation, Companion Session lifecycle or game detection.

# Supported Scope

Version 1 supports an immutable Session projection when:

- the active integration identity is `call-of-duty`
- the active integration version is the reviewed `1.0.0`
- the integration declares Warzone as its supported experience
- the detected experience is conclusively `warzone`

A family-level Call of Duty detection does not produce Warzone guidance. The
provider returns no result until the immutable projection establishes the
supported experience.

The initial catalogue contains four advisory recommendations:

| Category | Type | Recommendation scope |
| --- | --- | --- |
| `preparation` | `control-settings-review` | Operator-led control and sensitivity preparation |
| `preparation` | `loadout-familiarity` | Learning the strengths and limitations of chosen equipment |
| `operator-development` | `fundamentals-practice` | Using currently available official training options |
| `performance` | `shader-preload-readiness` | Allowing PC shader preloading to complete before play |

No item specifies a weapon, attachment, perk, map route, seasonal meta or live
tactical response.

# Reviewed Sources

## Warzone: How to Play

- Publisher: Call of Duty
- Type: Official guide
- URL: https://www.callofduty.com/guides/training/call-of-duty-guides-warzone-how-to-play
- Reviewed: 21 July 2026
- Accepted use: pre-session settings preparation, loadout familiarity and the
  general value of official training
- Excluded: named weapons, loadout recipes, map-specific advice, mode counts,
  player counts and other balance- or season-sensitive details

The accepted claims are conservative fundamentals. References to training are
conditional because mode names and availability can change.

## Call of Duty: Warzone PC Troubleshooting

- Publisher: Activision Support
- Type: Official support article
- URL: https://support.activision.com/warzone-2/articles/warzone-2-pc-troubleshooting
- Reviewed: 21 July 2026
- Accepted use: the direction to let shader preloading finish before starting
  play on PC
- Excluded: driver-version values and issue-specific troubleshooting that can
  become stale

Source metadata is shipped with the catalogue. The provider performs no
runtime request to either source.

# Assumptions

- The current Oracle Call of Duty integration version is `1.0.0`.
- The desktop integration represents a PC environment, but the shader guidance
  remains explicitly conditional on PC and active shader preloading.
- Official source availability and content are reviewed during development;
  this package does not claim continuous source freshness.
- Guidance timestamps come from the validated immutable request, not the
  system clock.
- Confidence describes support for the stated recommendation, not a prediction
  of match outcomes or Operator performance.

# Provider Ownership and Lifecycle

The provider factory is exported by the Call of Duty Game Integration. An
Application or composition root may explicitly inject the resulting provider
into the Guidance Provider Service. The package never registers itself.

```text
Call of Duty curated catalogue
        |
        v
Call of Duty provider (Game Integration)
        |
        | explicit dependency injection
        v
Guidance Provider Service (Services)
        |
        | validated immutable Guidance
        v
Companion Application (Applications)
```

The provider reads only the validated Guidance Request and its immutable
Session projection. It does not receive the authoritative Session object, a
detector, a desktop controller, a process handle, a renderer object or a
network client.

# Deterministic Behaviour

- The provider snapshots its injected catalogue dependency at construction.
- Eligibility depends only on immutable request data.
- Catalogue entries are evaluated in declared order.
- Optional category and type filters are exact matches.
- Output order is catalogue order; the provider does not rank or personalise.
- `createdAt`, `generatedAt` and compatibility values derive from the request.
- Identical requests and catalogue snapshots produce structurally identical
  output.
- The Provider Service remains the validation and failure-isolation boundary.

# Fair Play Assessment

The package complies with the External Companion Principle.

It uses public, reviewed knowledge to provide pre-session coaching and
operational readiness guidance. It does not inspect or modify game memory,
inject code, hook functions, read network traffic, interact with anti-cheat,
simulate input, automate gameplay or infer hidden live state. It does not
observe opponents or issue time-sensitive tactical directions.

All recommendations are advisory and require deliberate Operator action. The
package has no executable payload and no authority over the game or Companion
Session lifecycle.

# Known Limitations

- The catalogue is intentionally small and is not a complete Warzone guide.
- Source review is manual; a future source-governance Service may add freshness
  monitoring without moving game knowledge out of the integration.
- The package does not determine Operator skill, preferences or recent
  performance.
- It does not rank, suppress or schedule recommendations beyond exact request
  filters. Those are future Intelligence Service responsibilities.
- It does not detect whether shader preloading is currently active; the advice
  is explicitly conditional.
- It does not consume screenshots, clips, telemetry or live gameplay state.
- Family-level Call of Duty detection is insufficient for eligibility.
- A future Call of Duty integration version remains ineligible until the
  package receives an explicit compatibility review.

Future integrations should preserve this structure: reviewed immutable
catalogue, explicit provider factory, exact integration scope, source
attribution, deterministic output and documented Fair Play review.
