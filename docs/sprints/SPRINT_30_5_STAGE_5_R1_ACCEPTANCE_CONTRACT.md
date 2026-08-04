# Sprint 30.5 Stage 5 R1 Frozen Acceptance Contract

**Status:** Frozen engineering contract; qualification not authorised
**Applies to:** Exact accepted R6 MSIX on admitted Founder-QA-01
**Machine-readable authority:** scripts/sprint-30-5/stage-5-r1/Oracle.Stage5R1Contract.json
**Last Reviewed:** 4 August 2026

## Qualification question

Does the exact accepted R6 installed package sustain hardware-accelerated
rendering, the accepted performance budgets and installed protected-route
accessibility on the admitted replacement host without crashes, fallback,
unavailable measurements or residue?

A Stage 5 pass may extend R6/R12/R4 only. It cannot alter or reinterpret those
accepted results.

## Execution profile

One governed Stage 5 attempt must contain two independent cycles. Each cycle
starts from zero Oracle package, trust, process, provider and runtime-
configuration state; establishes fresh temporary trust and installation; runs
the same hash-bound configuration; and returns to zero state.

Each cycle contains:

- 30 minutes of active canonical route and Companion-transition exercise;
- 60 minutes of bounded idle/interaction soak;
- one-second process, GPU-engine, CPU and memory sampling;
- at least 99 percent of the expected 5,400 samples;
- all eight protected routes;
- Companion attach, detach, degradation and recovery; and
- fresh installed accessibility measurements.

Candidate and configuration hashes must be identical across cycles. A metric
that is unavailable, a warning that is unexplained, a non-zero exit, a crash,
a fallback or residue fails closed.

## Frozen performance thresholds

The accepted Phase 4 limits are retained:

| Measure | Maximum |
| --- | ---: |
| Installed startup | 15,000 ms |
| Protected route p95 | 250 ms |
| Protected route p99 | 500 ms |
| Protected API p95 | 250 ms |
| HTML response | 524,288 bytes |
| Active measured-workload CPU | 15 seconds |
| Guidance p95 | 5 ms |
| Guidance p99 | 10 ms |
| Total Oracle process-tree peak working set | 768 MiB |

The installed soak adds:

| Measure | Maximum |
| --- | ---: |
| Process-tree CPU p95 | 15 percent |
| GPU-process private working-set p95 | 256 MiB |
| GPU-process private working-set peak | 384 MiB |
| GPU crashes | 0 |
| Unexplained GPU restarts | 0 |
| Renderer hangs | 0 |
| Main/renderer crashes | 0 |
| Software fallback events | 0 |

## Frozen GPU proof

Hardware acceleration is proved only when an ownership-verified process from
the exact installed package has a stable Chromium GPU child, that child has
positive Windows GPU-engine utilization in each cycle, and neither its command
line nor the observed adapter state contains a software-rendering or
acceleration-disabling indicator. Host GPU inventory alone is not proof.
Forced acceleration flags are prohibited.

The accepted Oracle product does not use or claim WebGL. R1 therefore does not
invent a WebGL product requirement or inject diagnostic switches into the
unchanged package. WebGL is explicitly not claimed. A future product change
that uses WebGL requires a revised contract and the applicable upstream
requalification analysis.

## Frozen installed accessibility proof

Every protected route must be exercised after authenticated installed-package
rendering and must prove:

- document language en;
- at least one main landmark and one level-one heading;
- zero unnamed enabled focusable controls;
- zero positive tabindex values;
- natural keyboard order, a working skip target and zero keyboard traps;
- a visible focus indicator;
- a semantic accessibility-tree snapshot with appropriate names, roles,
  states and status/alert live regions;
- zero WCAG AA contrast violations at 4.5:1 for normal text and 3:1 for large
  text and user-interface components;
- zero horizontal overflow at 200-percent text/layout scaling; and
- rendered reduced-motion behaviour.

The browser accessibility snapshot is a semantic inspection method, not a
claim of external assistive-technology certification. That certification is
outside Stage 5.

## Rehearsal versus qualification

The installed development rehearsal is intentionally shorter. It validates
exact-package lifecycle reuse, package-owned GPU sampling, Windows GPU-engine
counter availability, Windows UI Automation discovery, accepted source
contracts and zero residue. It may use accepted Phase 4 timings only as
explicit references and makes no installed Stage 5 timing or accessibility
qualification claim.

Only a separately authorised full-duration governed attempt may produce Stage
5 qualification evidence.
