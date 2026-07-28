# Sprint 30.5 Stage 2 Requalification R1 — Invalidation Decision

**Status:** Founder-approved governance activation
**Decision date:** 28 July 2026
**Scope:** Candidate invalidation and Stage 2 requalification authority only
**Execution:** Not begun
**Stage 3:** Historically attempted, incomplete, blocked and unauthorised
**Production:** Unchanged and unauthorised

## Decision

The Founder accepts the Sprint 30.5 Stage 2 invalidation disposition audit and
authorises a return to the beginning of Stage 2 under the permanent
qualification identity:

`Sprint 30.5 Stage 2 Requalification R1`

The historical Stage 2 qualification remains accepted, closed and immutable
historical evidence. Its source candidate remains:

`d850743977735929f6873457fe122d2cf9697d9e`

Its frozen bindings remain:

- evidence archive SHA-256
  `8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876`;
- MSIX SHA-256
  `00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276`;
  and
- Release Manifest SHA-256
  `854b909a8d93a08ebd165d19a2f865ad6f3e84abe31f4bf1326e0647e761113d`.

No historical Stage 2 conclusion, artifact, evidence record, sidecar, plan,
implementation report, qualification package or closure record is rewritten
or reclassified by this decision.

## Invalidation basis

The current implementation includes post-freeze product and build-output
corrections committed as:

`6113565765a95b990415b6cdf2f2f1d7ff3e83c8`

`fix(desktop): bundle sandbox preload and harden window discovery`

Those corrections affect the packaged preload, the
`Oracle.WindowDiscovery.exe` native helper, dependency and SBOM inputs, MSIX
contents, Release Manifest artifact bindings, provenance and generated
qualification evidence.

Under the canonical Qualification Register and the accepted historical Stage 2
Plan, a product-source correction after candidate freeze invalidates that
candidate for continued qualification and returns qualification to the
beginning of Stage 2.

The historical candidate therefore remains valid historical evidence but is
not valid for qualification of the current source revision.

## Authority granted

The Founder authorises governance activation of Sprint 30.5 Stage 2
Requalification R1.

This authority permits:

- recording the invalidation disposition;
- creating the Requalification R1 execution plan;
- reconciling living governance and status documents; and
- preparing later bounded Stage 2 work for separate review.

Requalification R1 has not yet begun. Local package construction and isolated
temporary test signing require explicit Founder confirmation before execution.

## Authority excluded

This decision does not authorise:

- Stage 2 build, packaging, signing or qualification execution;
- certificate creation, import or trust;
- installation of any package;
- Stage 3 execution, repair, resumption or replacement;
- Stage 4 or any later qualification stage;
- production signing or publisher identity;
- publication, distribution, deployment or release;
- migration execution, persistence activation, Gate 7, Sprint 31 or Beta; or
- remote push.

Any architecture, security, trust-boundary, migration or further product
decision stops Requalification R1 for separate Founder authority.

## Historical Stage 3 position

Stage 3 remains historically Founder-authorised and attempted, incomplete and
blocked. Revision 4 NegativePathAndTrust passed, Revision 4 InstallAndStartup
failed, canonical Phase 03 success evidence is absent, Revision 5 remained
incomplete and Revision 6 is abandoned.

This decision does not alter, repair or supersede any Stage 3 historical or
reconciliation record.
