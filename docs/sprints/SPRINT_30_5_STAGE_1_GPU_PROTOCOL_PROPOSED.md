# Sprint 30.5 Stage 1 — Proposed Installed Electron GPU Protocol

**Status:** Proposed only; not frozen and not executed

This protocol cannot become qualification evidence until a suitable clean
Windows/GPU environment is admitted and the Founder accepts the thresholds.

## Required environment

- resettable clean Windows 11 x64 guest or authorised physical test machine;
- hardware acceleration available to the installed Electron package;
- approved local-test certificate trusted only for the exercise;
- exact frozen MSIX candidate;
- 1440 × 900 or larger display at 100% or 125% Windows scaling;
- no Node.js, Git, compiler or development server;
- synthetic authenticated Operator only; and
- no production endpoint, credential or data.

## Measurement sequence

1. Record OS, GPU, driver, WDDM, scaling and display state.
2. Confirm Electron reports hardware acceleration without forced flags.
3. Record baseline main, renderer and GPU processes.
4. Execute the canonical eight-destination Operator journey for 30 minutes.
5. Exercise permitted Companion attach, detach, degradation and recovery.
6. Continue a bounded 60-minute idle/interaction soak.
7. Record process restarts, crashes, hangs, fallback events, CPU and memory.
8. Repeat from an independent clean snapshot.

## Proposed pass thresholds

- zero GPU-process crashes;
- zero unexplained GPU-process restarts;
- zero software-rendering fallback events;
- zero renderer hangs or unresponsive events;
- zero main-process or renderer-process crashes;
- total installed Oracle process-tree peak working set no greater than the
  accepted `768 MiB` Phase 4 ceiling;
- GPU-process private working-set p95 no greater than `256 MiB`;
- GPU-process private working-set peak no greater than `384 MiB`;
- startup, CPU, response-size and Guidance-latency budgets remain within the
  accepted Phase 4 limits;
- no renderer authority, sandbox or context-isolation regression; and
- both independent runs use identical candidate and configuration hashes.

Any unavailable metric, unexplained warning or fallback remains a failure or
unavailable result. It cannot be inferred from host GPU capability.
