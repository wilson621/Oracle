# Sprint 30.5 Stage 2 Requalification R7 Implementation

Status: ENGINEERING COMPLETE — QUALIFICATION BARRED

## Product correction

The Stage 5 browser probe established that enabled informational text rendered at approximately 4.22–4.25:1 against the actual background, below the frozen 4.5:1 threshold. The bounded correction:

- replaces 96 product text-slate-500 and placeholder foreground uses with text-slate-400;
- replaces four Companion CSS rgb(100 116 139) foreground declarations with rgb(148 163 184);
- leaves non-text slate-500 borders and gradients unchanged;
- adds a fail-closed source inventory that prohibits both failing foreground forms; and
- retains the 4.5:1 rendered threshold unchanged.

## R7 harness

R7 is a new namespace derived from the accepted R6 lifecycle. It uses version 0.1.5.0 and binds the corrected candidate commit and tree. The source matrix now executes accessibility:color:verify before architecture and production build.

The contract adds exact SHA-256 bindings for the accepted R6, R12, and R4 evidence indexes and closures, and denies output into every existing Stage 2 and Stage 3 namespace. The wrapper-only, single-authority, create-only, deterministic toolchain, exact-signature, exact-certificate, teardown, zero-residue, and immutable-failure controls are retained.

No historical evidence or accepted package was modified. No qualification state was created.