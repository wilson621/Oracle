# Sprint 30.5 Stage 5 R6/R12/R4 Qualification-Impact Assessment

**Status:** Assessment complete; Stage 5 engineering and qualification remain
unauthorised
**Authority:** Founder-authorised programme-state and qualification-impact
assessment only
**Assessment date:** 4 August 2026

## Decision

Stage 5 can be completed without invalidating the accepted Stage 2 R6, Stage 3
R12 and Stage 4 R4 chain, but only as an unchanged-package qualification of the
exact accepted R6 MSIX on the admitted replacement host. Stage 5 may extend the
chain; it may not silently replace any earlier claim.

The accepted product binding is:

- candidate commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`;
- candidate tree `8455a05780989a9d5f6c6d527f7d427d94526b04`;
- MSIX SHA-256
  `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`;
- Stage 2 R6 accepted-evidence-index SHA-256
  `3ef36e908803528853c1bd16a1ee555a520b40648e64e6f0e2f1ed643ea46863`;
- Stage 3 R12 accepted-evidence-index SHA-256
  `e02f94d8231c6ae683c3fecef372c077d36e1fc5db84327e2af5c7947f624a1f`;
- Stage 4 R4 accepted-evidence-index SHA-256
  `f54bb660578bcd2dadf8ad4412f1d58738441df4688816eabc64ea3f7cdeeac8`.

All three accepted indexes rehash successfully at the assessment baseline. The
repository was clean at branch `sprint-9-overlay`, HEAD
`a35f3a165f9dc91133ebf4cf6d49a735ad82f91c`, tree
`0e91cf1291de1e515ee51ef9206364e774d8f22c`, with origin at the same commit.

## Current programme state

Stage 4 R4 removed the prior downstream blocker: the exact R6 installed package
has now passed clean-host installation, live authentication and protected
rendering through the accepted R12/R4 chain. Stage 5 is therefore the next
possible qualification stage. Its registered scope is installed-package GPU,
performance and accessibility.

The Stage 5 execution target must remain the admitted `Founder-QA-01` replacement
host (`MEDION ERAZER P6605 MD61596`) and the exact accepted R6 package. Historical
standalone GPU evidence from the ASUS Stage 1 host does not transfer to that host
and must not be inferred as replacement-host installed-package evidence.

## Chain-preserving boundary

A future Stage 5 mission preserves the accepted chain only if it:

1. installs and exercises the exact R6 MSIX hash above;
2. changes no qualification-owned product path, package bytes, package manifest,
   runtime configuration, dependency set or product behaviour;
3. keeps any Stage 5 harness and records outside the product candidate paths and
   invokes them directly rather than adding convenience scripts to `package.json`;
4. uses fresh Stage 5 identities, transfer, authority, attempt and evidence
   namespaces under a separately granted mission;
5. performs fresh host, package, trust, security, isolation, zero-state and
   pre-authority admission before any authority is created; and
6. reports unavailable measurements as unavailable or failed, never as inferred
   passes.

The only current source-path difference from the accepted candidate within the
qualified product-path set is `package.json`; inspection shows qualification
convenience scripts rather than a dependency or shipped-product change. That does
not alter the exact accepted MSIX, but Stage 5 must bind the package itself and
must not treat current repository HEAD as a replacement product candidate.

## Dependency required before engineering

The Stage 5 acceptance contract is not yet authoritative. The existing
`SPRINT_30_5_STAGE_1_GPU_PROTOCOL_PROPOSED.md` explicitly remains proposed only
and requires Founder acceptance of its thresholds. Earlier browser accessibility
evidence also records protected canonical routes as unavailable and contains
method limitations; R4 established installed protected rendering but did not
convert those limitations into installed accessibility qualification.

Before Stage 5 engineering is authorised, the Founder must accept a bounded
mission that freezes the Stage 5 protocol and pass/fail contract. That contract
must define at least:

- required installed journeys, observation duration, repeat count and sampling
  cadence;
- hardware-acceleration, GPU-process stability, crash/restart and
  software-fallback rules;
- GPU and total-process memory, CPU, startup, interaction and Guidance latency
  budgets;
- keyboard order, focus visibility, semantic names/roles/states, live-region
  behaviour, contrast, reflow/scaling, reduced-motion and protected-route
  coverage;
- permitted display scaling, active adapter, driver and hybrid-GPU state; and
- strict treatment of unavailable metrics, warnings, residue and non-zero exits.

The proposed numerical GPU thresholds may be adopted, revised or rejected only
through that Founder-level criteria decision. Engineering must not freeze those
programme acceptance thresholds by implication.

## Product-defect dependency

If preparation or qualification finds a defect that requires any product or
package change, the accepted R6/R12/R4 records remain immutable historical
evidence but do not qualify the corrected candidate. The mandatory dependency
chain is then:

`new Stage 2 package revision -> new Stage 3 clean-host qualification -> new Stage 4 live-authentication qualification -> new Stage 5 qualification`

No previous authority, attempt, transfer or evidence namespace may be reused,
and there is no permitted shortcut around that sequence.

## Recommended next Founder mission

Authorise a bounded **Stage 5 R1 engineering-preparation and acceptance-contract
freeze** mission. It should permit investigation, non-product harness
implementation, regression and adversarial validation, and installed
non-qualification rehearsal against the exact R6 package on `Founder-QA-01`.
It should not create a qualification authority, transfer or attempt. Qualification
execution must remain subject to a later, explicit Founder authority after the
frozen contract and preparation evidence are independently reviewed.

No Stage 5 engineering, transfer preparation, authority creation or qualification
execution occurred during this assessment.
