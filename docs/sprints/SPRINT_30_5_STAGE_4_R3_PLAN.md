# Sprint 30.5 Stage 4 Requalification R3 Plan

**Authority:** Founder-authorised complete Stage 4 R3 mission
**Status:** Engineering preparation complete; execution authority not yet created
**Execution surface:** Exact accepted Stage 2 R6 installed MSIX
**Baseline:** Accepted Stage 2 R6 / Stage 3 R12 and accepted Stage 4 R2 correction
**Classification:** Governed engineering preparation
**Last Reviewed:** 4 August 2026

## Objective

Qualify the accepted R6/R12 baseline through a fresh Stage 4 successor while
preserving the accepted R2 failed attempt and correction as immutable history.
R3 uses entirely new transfer, grant, authority, attempt and evidence identities.

## Architecture and lifecycle

R3 retains the corrected R2 installed-package architecture and explicit attempt-root
ownership model. The launcher exclusively creates the attempt root and logs
directory. The live controller exclusively creates its ephemeral provider directory.
Shared directories contain only create-only files; linked, unexpected, pre-existing
or file-backed layouts fail before provider mutation.

The exact accepted R6 public certificate is temporarily trusted, the hash-bound MSIX
is installed, attempt-scoped LocalState configuration is atomically consumed, and
the package is directly activated. Only an ownership-verified packaged process tree
and loopback listener may serve the ten unchanged Stage 4 authentication,
protected-rendering, API-authority, session and two-principal isolation journeys.

## Authority boundary

The preparation baseline records Founder execution, transfer preparation, authority
creation and attempt execution as false, with maximum attempts zero. A separate
execution-enabled overlay must bind this reviewed preparation commit and tree,
permit one create-only transfer, and encode the current Founder-authorised mission.

No authority may be created until transfer integrity, independent verification,
host continuity, elevated pre-authority, zero-state, create-only, security, trust,
network-isolation and return-root gates all pass. A consumed authority or permanent
failed attempt cannot be retried. Stage 5 and later work remain unauthorised.
