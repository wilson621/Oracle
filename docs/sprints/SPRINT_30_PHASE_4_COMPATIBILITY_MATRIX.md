# Sprint 30 Phase 4 Compatibility Matrix

**Status:** Phase 4 local qualification candidate
**Runtime Manifest:** `1.7.0`, mechanically equal for Web and Electron
**Release Manifest:** immutable Sprint 29 package remains bound to `1.6.0`

| Environment or capability | Evidence state | Support consequence |
| --- | --- | --- |
| Current Windows 11 x64 development host | Locally qualified | Source, production Web build, Electron compilation and bounded current-host journeys may be reported only as local evidence. |
| Disposable clean Windows host | **Clean-Machine Certification Deferred — Required Disposable Windows Environment Unavailable** | No clean-machine or external distribution-readiness claim. |
| Live Supabase Auth/GoTrue Email + Password | Unavailable | No live authenticated-provider transaction may be reported as passed. |
| Web desktop viewport, 1440 × 900 | Locally qualified | Canonical routes are included in rendered accessibility and responsive review. |
| Web compact viewport, 390 × 844 | Locally qualified | Canonical routes are included in rendered accessibility and responsive review. |
| Scalable-text reflow at a 390 CSS-pixel layout width (200%-zoom layout equivalent for a 780-pixel viewport) | Locally qualified | The public authentication journey reflows without horizontal document overflow. Native browser-zoom control was not used. |
| Reduced-motion preference | Source and rendered review | Global animation and transition durations collapse to `0.01ms`; no runtime preference is retained. |
| Electron current-host source target | Locally qualified | Compilation and renderer-safe contracts only; this is not an installed clean-machine package test. |
| Electron GPU process under installed package | Unavailable | GPU budget cannot pass until the deferred disposable Windows environment exists. |
| COD/Warzone | First proving ground; existing bounded evidence only | Phase 4 makes no new game compatibility or live-operation claim. |
| Minecraft: Java Edition pinned profile | `provisionally-certified`; observation disabled | Operational certification remains deferred and no support claim is permitted. |

The clean-Windows and live-auth gaps are independent. Neither may be inferred
from source, synthetic, current-host, packaging or browser evidence.

The immutable Sprint 29 Release Manifest and package are not rebuilt, resigned
or altered. Their `1.6.0` runtime declaration is intentionally not reconciled
to current source `1.7.0` without separate Founder authority.
