# Sprint 30.5 Stage 4 Requalification R2 Execution-Enabled Mission

**Authority:** Founder-authorised execution mission
**Accepted preparation:** Commit `82badb7bdc9c434815c9fcc4c49f6d88b9814bf6`, tree `51f9bbc9bed6eb949c87a8495fd465df5690473f`
**Scope:** One governed transfer and at most one Stage 4 R2 qualification attempt
**Stage 5:** Unauthorised
**Last Reviewed:** 4 August 2026

The Founder accepted the R2 engineering preparation and authorised engineering to
create a separate execution-enabled baseline, one create-only governed transfer,
fresh host and pre-authority admission, and one qualification attempt. The accepted
preparation directory and all Stage 2, Stage 3 and Stage 4 R1 evidence remain
immutable.

The execution transfer must bind the exact execution commit/tree, accepted R2
preparation manifest, R6 MSIX, R6 public certificate, migration chain and complete
execution harness. Its manifest and custody records are create-only and independently
verified by full physical inventory, byte count and SHA-256 before pre-authority.

Preflight must freshly verify transfer admission, clean exact repository state,
Administrator context, approved tools and images, zero Oracle/provider residue,
available ports and absence of active IPv4 or IPv6 default routes. Authority cannot
exist before that record passes and is revalidated. One Founder grant derives one
authority and one attempt identity. A consumed authority or permanent failed attempt
cannot be retried.

The attempt must execute all 20 lifecycle phases and all ten live journeys through
the exact transferred R6 package. It must preserve failure evidence, perform bounded
teardown, prove zero residue, freeze and reconcile returned evidence, and stop at
Stage 4 closure. No Stage 5, production, publication, deployment or release activity
is authorised.

## Pre-authority engineering correction

The first execution controller reached and passed the fresh elevated pre-authority
record `preflight-stage4-r2-20260804T111151420Z-2e376761.json` (SHA-256
`1bbf23460ba05d38504462e62fc84bd1ff43ddc542c33bb7def8875ce417266e`) against
transfer `transfer-stage4-r2-20260804T105750831Z-b5b1ceec`. It then stopped
fail-closed before authority creation because the qualification harness's second
transfer-admission call did not forward the mandatory independently verified
transfer hash. No authority, attempt, host mutation or qualification evidence was
created.

The immutable controller result is
`result-33a8e879a1694f31bff42f5a4840e38f.json` (SHA-256
`006c1cf69b79974a31ca255f06fdc48ddf1c3689957527d522aabe2993489805`). The passed
preflight, failed controller result and original transfer remain unchanged as
historical pre-authority engineering records. The corrected harness binds
`TransferVerificationSha256` at both transfer-admission checks, and baseline
validation now adversarially requires both bindings. Because the harness and
execution manifest changed, the prior transfer cannot be reused; qualification may
proceed only from a fresh execution commit/tree, new create-only transfer identity,
independent verification and fresh pre-authority record.
