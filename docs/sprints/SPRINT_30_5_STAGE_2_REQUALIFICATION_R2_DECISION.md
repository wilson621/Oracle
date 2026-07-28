# Sprint 30.5 Stage 2 Requalification R2 — Candidate Refresh Decision

**Decision:** Founder-authorised
**Date:** 28 July 2026
**Permanent identity:** `Sprint 30.5 Stage 2 Requalification R2`
**Stage 3:** Blocked and unauthorised

## Reason

The accepted Stage 2 Requalification R1 result remains valid, closed and
immutable. Its isolated local-test signer expires at
`2026-07-30T19:08:37Z`. The mandatory 24-hour Stage 3 execution-start margin
therefore closes at `2026-07-29T19:08:37Z`.

The Stage 3 readiness review concluded that a new current-candidate plan,
attempt-scoped transfer system, qualification harness, independent review,
host-continuity review and transfer-method decision could not safely complete
inside that remaining margin. No R1 evidence or conclusion is invalidated by
this timing disposition.

The Founder authorised a return to Stage 2 for a separately governed
replacement candidate. R2 exists only to provide the current approved Oracle
source with a new isolated local-test signing identity and a validity budget
appropriate to the remaining governed qualification lifecycle.

## Source position

The last qualified product-source candidate is
`cd3b7ca1a49d53d85a718a24d594267c93531994`, tree
`e7933a866fe656ae03689a62956c44641eb16a23`.

Only Stage 2 R1 evidence and governance closure documentation changed after
that candidate. R2 must mechanically freeze and verify its own exact
repository, product-source and harness identities before constructing a new
package.

## Certificate-validity budget

R2 permits one isolated local-test signing certificate per governed attempt,
with a maximum lifetime of **30 calendar days**.

The budget provides for:

- Stage 2 build, qualification, failure analysis and reconciliation;
- independent engineering and Founder evidence review;
- Stage 2 acceptance and closure;
- Stage 3 preparation, implementation, fixtures and independent review;
- transfer-method approval;
- clean-host continuity verification;
- transfer construction, transfer verification and evidence return;
- Stage 3 execution with the complete mandatory 24-hour start margin; and
- reasonable contingency for evidence-supported engineering failures.

Thirty days is a maximum, not production trust. The private key, PFX,
password, exported CER and every temporary trust entry must be destroyed
during each Stage 2 attempt. The public signer remains only as part of the
immutable signed artifacts and detached signature evidence needed for later
local qualification.

## Authority

The Founder authorises R2 governance activation, harness preparation, build,
local packaging, creation of one isolated local-test certificate per governed
attempt, temporary exact-certificate trust, local-test signing, mechanical
verification, exact teardown, evidence generation, evidence freeze and
archive publication.

Evidence-supported later attempts remain separately identified, immutable and
append-only. No attempt may be retried, overwritten or deleted.

This authority does not permit:

- Founder acceptance or formal R2 closure by engineering;
- Stage 3 preparation, transfer or execution;
- installation on `Founder-QA-01`;
- production signing or publisher trust;
- publication, distribution, deployment or release; or
- Stage 4 or later work.
