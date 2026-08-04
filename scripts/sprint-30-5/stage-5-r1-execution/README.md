# Stage 5 R1 governed execution harness

This directory is the execution-enabled overlay for one Founder-authorised Stage 5 R1 qualification mission. It preserves the exact accepted R6 MSIX and accepted R6/R12/R4 chain; it does not modify the product.

The harness creates at most one create-only transfer, one consumed authority and one immutable attempt. Authority creation is inside `Invoke-OracleStage5R1QualificationMission.ps1` and occurs only after independently verified transfer admission, fresh elevated preflight, host identity/display/GPU/browser admission, network isolation and zero-state checks all pass.

The governed attempt contains exactly two fresh installed package/trust cycles. Each cycle performs 1-second package-owned GPU/process sampling across 30 minutes active workload and 60 minutes soak, authenticated protected-route timing, browser CDP semantic/contrast/reflow/reduced-motion inspection, Companion transition exercise, Guidance timing and complete zero-residue teardown. Any unavailable measurement, warning, non-zero exit, threshold failure or residue fails closed and permanently consumes the attempt.

`Invoke-OracleStage5R1InstalledDevelopmentRehearsal.ps1` is retained only as source-level regression material for the accepted preparation correction. It is not a qualification entry point and the execution contract prevents it from creating governed state.
