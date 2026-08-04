# Sprint 30.5 Stage 4 Requalification R3 — Failure Closure

**Disposition:** Accepted immutable failed qualification
**Authority:** Consumed
**Retry:** Prohibited
**Last Reviewed:** 4 August 2026

Stage 4 R3 authority authority-stage4-r3-20260804T123436312Z-03b9cd2d
was consumed by attempt stage4-r3-20260804T123436312Z-03b9cd2d under Founder
grant founder-stage4-r3-grant-20260804T123436312Z-03b9cd2d. The attempt is
permanently closed and cannot be retried.

Fresh transfer, independent verification, elevated host admission, network
isolation, zero state and pre-authority checks passed. The outer lifecycle recorded
authority-consumed and baseline-verified. The exact accepted R6 package then
installed and activated, runtime configuration was consumed, the package-owned
loopback server was admitted, and all ten governed journeys passed.

The installed controller subsequently reported a cleanup failure because
ownership-verified PID 1324 exited after discovery and before Stop-Process. There
was no primary journey or package failure. Package and trust removal completed,
the safety teardown passed, and the governed environment proved zero residue.

Immutable bindings:

- failure SHA-256: 0c981997b0e62368331acc2532c2d55621487194c2870d934dcb1b25858931a6;
- authority SHA-256: 0197fee1ee4c792a4d52cb77cc8564084d53db73e3733501ad031a6d30b55b63;
- controller result SHA-256: 30e5b826fdc7c2b4dfb03d3dac6e0c0363566d96663ff3b9dca100ec6e133a94;
- accepted failed-evidence index SHA-256:
  14264450be92dee9af007d25dbfc6c5d6fa3037935a7e024d7f48df9c6d8f9a6.

The index rehashes 21 immutable records, including 11 attempt files totalling
130,856 bytes. No final evidence manifest, qualification archive, completion record
or repository qualification-evidence copy was produced.
