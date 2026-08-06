# ORACLE QUALIFICATION REGISTER

**Authority:** Canonical register of operational qualification states
**Scope:** Evidence-backed qualification completion, deferral, invalidation and
remaining environment or governance prerequisites
**Owner:** Oracle Platform Engineering and Oracle Governance
**Status:** Active
**Classification:** Living register over immutable evidence
**Expected Stability:** Updated at every qualification stage review, closure,
expiry or revocation
**Supersedes:** Qualification status inferred across Sprint and programme
documents
**Superseded By:** None
**Last Reviewed:** 4 August 2026

---

# Interpretation

Qualification is independent from implementation, certification, deployment
and activation. A passed qualification does not authorise production,
publication, signing, distribution, migration execution, persistence, Gate C,
Gate 7, Beta or release.

Unavailable evidence is never inferred as passed. Historical evidence is not
rewritten when later evidence is added. A new evidence record extends the
chain and may change the current register state without changing historical
results.

# Sprint 30.5 Production Qualification Completion

| Stage | Scope | Current state | Evidence or blocker | Next authority |
| --- | --- | --- | --- | --- |
| 1 | Environment Admission | **Founder-accepted and closed** | Controlled non-pristine ASUS physical host; transfer, baseline, network, GPU and cleanup evidence complete; frozen package SHA-256 `841b5ea14bc06966ce969dda0a6794110633e9ad7f0c74d0d11ee1d54938a78d` | None for Stage 1; history is closed |
| 2 | Candidate Freeze and Package Reconciliation | **R6 Founder-accepted and formally closed** | Passing attempt `r6-20260803T171057940Z-5e914d18`; final manifest `a637a7fdf49f6b2a957738c89cb02015b6384d227c2c72f77a2aabdd721bf288`; archive `7884c93b222cd5f16f51dd5ba1b56c51af5008e1f6c999dcff92a8c1a26ac690`; MSIX `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`; zero residue | None for R6; downstream work requires separate authority |
| 3 | Clean Windows Qualification | **R12 independently verified and formally closed** | Passing attempt `stage3-r12-20260803T204415402Z-b886be44`; evidence manifest `d0238d0859a871d2589f66cbddc5f337b33638b32a02375b71f39fc2dac461d0`; archive `1e583ef3a67755a40ec2d4ec50e0535e38ee3e2eab9b65767d48a3a17f8f5055`; zero residue | None for R12; consumed authority permits no retry |
| 4 | Live Authentication and Protected Rendering | **R4 Founder-accepted and formally closed** | Passing attempt `stage4-r4-20260804T133045451Z-13f6da53`; final manifest `0b740dfc12e2334a63807d3097e302f864b9adaa1caf58b2b8757b3c57752b46`; archive `7f01fe4fcf5bee2b32b220a26660ea163a92e98450c093d1e7dc4c6752c7598c`; zero residue | None for R4; consumed authority permits no retry |
| 5 | Installed Package GPU, Performance and Accessibility | **R1 engineering preparation complete; qualification not executed** | Exact unchanged R6 MSIX; acceptance contract frozen; deterministic, adversarial and elevated installed validation passed with zero residue | Founder decision on a separately authorised execution-enabled R1 qualification mission |
| 6 | Reproducibility and Environment Teardown | **Not started** | Requires accepted Stages 2–5 | Stage 5 acceptance, then separate Stage 6 authority |
| 7 | Final Integrated Qualification and Sprint 30 Closure Package | **Not started** | Requires complete immutable evidence from Stages 1–6 | Stage 6 acceptance, then separate Stage 7 authority |

# Stage 1 Permanent Qualification Position

- The ASUS ROG Zephyrus G15 is admitted as a **controlled non-pristine
  physical qualification host**.
- It is not a pristine or clean-machine environment.
- Installed Node.js, npm, Python, .NET and Visual Studio Build Tools did not
  participate in the qualification execution path and need not be removed
  solely for Stage 1.
- The separate clean Windows qualification requirement was fulfilled by the
  accepted Stage 3 R9 result; production certification still requires Stages
  4-7.
- Stage 1 may be reopened only when new evidence demonstrates a genuine
  qualification defect.
- The ASUS remains the accepted historical Stage 1 host but is not the Stage 3
  host. Its hardware, GPU, driver, display and network facts do not transfer
  to the Founder-designated replacement laptop.

# Stage 2 Permanent Qualification Position

- Historical Stage 2 is Founder-accepted, closed and immutable.
- The Stage 3 host change did not alter historical candidate
  `d850743977735929f6873457fe122d2cf9697d9e`, Runtime Manifest `1.7.0`,
  signed Release Manifest, accepted MSIX, artifact hashes or frozen Stage 2
  evidence.
- Post-freeze product-source corrections at
  `6113565765a95b990415b6cdf2f2f1d7ff3e83c8` invalidate the historical
  candidate for qualification of current source.
- Sprint 30.5 Stage 2 Requalification R1 is Founder-accepted and formally
  closed for current-source Candidate Freeze and Package Reconciliation.
- The accepted attempt is `r1-20260728T190335052Z-d2ffe76a`, candidate and
  harness commit `cd3b7ca1a49d53d85a718a24d594267c93531994`.
- Requalification R1 creates no Stage 3, production-signing, publication,
  distribution, deployment or release authority.
- Sprint 30.5 Stage 2 Requalification R2 was a separately Founder-authorised
  candidate refresh necessitated only by the remaining R1 certificate window.
- R2 permits a maximum 30-day isolated local-test certificate per attempt.
  Exact trust and private-material teardown remain mandatory.
- R2 attempt `r2-20260728T203503018Z-ec577cf4` passed execution and
  independent reconciliation, was Founder-accepted and is formally closed.
  Its candidate was the authoritative input to the accepted Stage 3 R9
  qualification and remains unchanged.
- Migration 011 and Migration 012 pgcrypto schema corrections at
  `a7fc67f207d9c95407c70812828fa66bd487285d` changed product source after the
  R2 freeze. Under the permanent invalidation rule, R2 remains accepted
  historical evidence but does not qualify this corrected baseline.
- Stage 2 Requalification R3 attempt `r3-20260731T171651908Z-9a8a2532`, under
  authority `authority-r3-20260731T171651908Z-9a8a2532`, passed all twelve
  governed lifecycle phases and was Founder-accepted and formally closed.
- R3 binds candidate commit `a7fc67f207d9c95407c70812828fa66bd487285d`,
  tree `356f6d52f1bf70065692e892af8bf916acc8727a`, and harness commit
  `a25c7a2cfafd43cf80339cf4d0fbeeb77d760912`, tree
  `11042dedd8c49db88b30724e1b718f7cad91ae84`.
- R3 final evidence manifest SHA-256 is
  `79ae9b219f24c8f61c48b6e3a0094d1730f72fe29a932e02ff1e92f7b07c1229`;
  archive SHA-256 is
  `82ad4a46721c2ab0e7103c57f192394887844fd4c311ec3fcea92d2ba05e0688`;
  MSIX SHA-256 is
  `c2dc7c68bcc9b6dd8c3a8e39d6db5f1d5b8230b64906524e9a4c01cf25aa65d1`.
- Exact certificate, trust, package and private-material residue is zero. R3
  grants no Stage 4 execution or production authority.
- Stage 2 Requalification R4 attempt `r4-20260803T115002258Z-31ab0bf6`,
  under authority `authority-r4-20260803T115002258Z-31ab0bf6`, passed all
  twelve phases and was Founder-accepted and formally closed.
- R4 binds candidate commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`,
  tree `5d7eca4c012874df0b839533dfab283b54778661`, and harness commit
  `a31c2897dd063e8e995e558cd83ecd188b8392ff`, tree
  `ec0dc354553b6be38daaee4cd2383e325bd94837`.
- R4 final evidence manifest SHA-256 is
  `876be1c0342c7dc9f70965faa3daffe0c9c1d8d7a3e2c41b144155350557784d`;
  archive SHA-256 is
  `3f1f11dd04ddbc3b4eb51db344f71c12252cc7e41e8ae072950d3a74c1452495`;
  MSIX SHA-256 is
  `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`.
- R4 package, exact certificate, trust and private-material residue is zero.
  Downstream Stage 3, Stage 4 and Stage 5 activity remains separately authorised.
- Replacement-host installed GPU evidence remains a separate Stage 5
  requirement.

# Stage 3 Host Admission Position

- `Founder-QA-01`, manufacturer/model `MEDION ERAZER P6605 MD61596`, is
  **Admitted with Founder Provenance Exception**.
- Machine state:
  `admitted-with-founder-provenance-exception`.
- Admission classification:
  `founder-provenance-exception`.
- This is distinct from `standard` admission. Standard admission requires all
  mandatory technical and provenance controls to pass.
- The exception is bound to host-admission SHA-256
  `6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e`
  and the current Windows installation only.
- `installationMediaEvidencePresent` remains `false`; the missing original
  installation-media hash has not been inferred or represented as passed.
- The machine-readable approval record has SHA-256
  `0d9a9668dbbf11c91f08d58bd84261f48baa2d3d3fd13184434965b66ffe2282`.
- Admission is invalidated by reinstall, reset, system-disk replacement,
  system-image restoration, Secure Boot or TPM changes, contamination,
  unexplained software or failed integrity controls.
- Host admission supplied one prerequisite to the separately authorised R9
  execution; it did not itself grant certificate trust, artifact transfer,
  package installation, deployment or security-boundary authority.
- Stage 3 R9 passed and is formally closed. Host admission remains an
  immutable qualification binding for that attempt and creates no continuing
  execution, certificate-trust, artifact-transfer, package-installation or
  requalification authority.

# Stage 3 Permanent Qualification Position

- Stage 3 R1 and failed R2-R8 remain immutable historical records.
- Stage 3 R9 attempt `stage3-r9-20260730T221251043Z-71af9db7` passed all
  fourteen governed lifecycle phases and was Founder-accepted.
- Qualification commit `fc3b4775c505cf2cd3b45333bff8ee75d4cbfb3d`,
  tree `2172155e15cfc777def43b4f89778dab3fd91d4a`, is bound through transfer
  manifest SHA-256
  `4915a08336718a92f299833cb24d8c03916b5246559425b920cfa423e8d11416`.
- Initial and repair observations each contain more than `60000` measured
  milliseconds of valid evidence.
- Final cleanup records zero governed package, certificate, process,
  transfer, work and package-data residue.
- The canonical evidence is indexed by
  [Sprint 30.5 Stage 3 Qualification R9 Evidence](sprints/evidence/sprint-30-5/stage-3-r9/README.md).
- Stage 3 closure grants no Stage 4, production-signing, publication,
  distribution, deployment or release authority.

# Stage 4 Permanent Qualification Position

- Stage 4 R1 attempt `stage4-r1-20260803T093803115Z-7fc6b185`, under consumed
  authority `authority-stage4-r1-20260803T093803115Z-7fc6b185`, passed all
  thirteen lifecycle phases and all ten authentication and isolation journeys.
- Preparation commit `3994d483a4a7fc8dfe91a7d21c7c54d1d10a72c3`, tree
  `6062c99988c4251b824b39f05d414b8155743506`, remained bound to Stage 2 R3
  candidate `a7fc67f207d9c95407c70812828fa66bd487285d`.
- Final manifest SHA-256 is
  `1f516e1f7d1b30d88c8e9fbd22774068bd9c7071935cc415b1d1243b7b5d4c9d`;
  archive SHA-256 is
  `91116098c123c960ba736114176c08876f7a4f66b0b777efbcb2bda1e53d2a15`.
- Protected rendering, protected API authorisation, two-principal isolation,
  local email verification and session invalidation passed. Final residue is
  zero.
- The canonical evidence is indexed by
  [Sprint 30.5 Stage 4 R1 Evidence](sprints/evidence/sprint-30-5/stage-4-r1/README.md).
- Stage 4 R1 is formally closed for its exact R3 candidate and grants no Stage
  5 or production authority. It is not the current R6/R12 Stage 4 baseline.
# Post-Stage 4 Product-Baseline Position

- ADR-048 implements an attempt-scoped installed-package runtime configuration
  boundary after the accepted Stage 2 R3 candidate freeze.
- The boundary removes the unauthenticated packaged fallback as an admissible
  runtime, keeps provider credentials outside package bytes, projects the
  service credential and session secret only to the packaged server process,
  and exposes only the public provider URL and anonymous key to the renderer.
- This source change does not alter Stage 2 R3, Stage 3 R9 or Stage 4 R1
  historical evidence. Those results remain accepted and immutable.
- Under the permanent invalidation rule, the changed source requires a new
  Stage 2 candidate. The resulting exact package must then complete applicable
  clean-host and installed-authentication requalification before Stage 5.
- No new candidate, package, qualification authority, attempt or evidence has
  been created by the correction.

# Independent Carried Qualification States

| Capability | State | Binding limitation |
| --- | --- | --- |
| Sprint 29 clean-machine distribution | **Qualified by Stage 3 R9** | The accepted Stage 2 R2 MSIX completed governed installation, activation, runtime, repair, removal and zero-residue validation on Founder-QA-01; this does not grant production release authority |
| Minecraft Java observation | **Provisionally certified** | Operational Certification Deferred — Required Test Environment Unavailable; observation disabled and no support claim authorised |
| Production qualification | **Incomplete** | Stages 1-3 are accepted and closed for the current R6/R12 chain; Stage 4 R1 remains accepted history but a newly R6/R12-bound Stage 4 result is required; Stages 5-7 have not started |
| Gate 7 | **Not authorised** | May be considered only after Production Qualification completes |
| Beta | **Not authorised** | Requires later Founder decision after the governed qualification and Gate sequence |

# Invalidation Rules

- Any product-source correction after Stage 2 candidate freeze invalidates that
  candidate and returns qualification to Stage 2.
- Any package, Runtime Manifest or Release Manifest divergence is an
  architectural qualification failure.
- Any unavailable environment evidence remains unavailable.
- Any architecture, trust-boundary, security-policy, migration or product
  decision stops the active stage for separate Founder authority.
- No stage may overlap the preceding stage or begin without its separate
  Founder authorisation.
## Stage 3 Requalification R10 Preparation

Stage 3 R9 remains Founder-accepted, formally closed and immutable for the historical Stage 2 R2 candidate. Stage 3 Requalification R10 is the current preparation revision and is bound exclusively to the accepted Stage 2 R4 candidate commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree `5d7eca4c012874df0b839533dfab283b54778661`, and MSIX SHA-256 `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`.

R10 preparation defines the complete clean-Windows lifecycle, including the ADR-048 attempt-scoped installed runtime-configuration boundary. Preparation creates no transfer, execution, certificate-trust, installation, Stage 4, Stage 5, production or release authority. A separate Founder decision is required for transfer construction; execution requires a later separate Founder decision after transfer and admission review. Stage 5 remains blocked pending accepted downstream requalification.

## Post-R4 Packaged Server Environment Correction

The packaged-server environment correction is engineering-complete and
non-qualification validation passes. The privileged Next.js utility child now
receives exactly the four ADR-048 runtime values, fixed production/loopback
values and a physically validated Windows SystemRoot. It does not inherit the
ambient parent-process environment.

Stage 2 R4 remains Founder-accepted, formally closed and immutable for its
exact package. Because this is a later product-source change, that R4 package
no longer qualifies the current source baseline. The permanent invalidation
rule returns current qualification to Stage 2.

Stage 3 Requalification R10 remains bound only to the accepted R4 package and
must not be transferred or executed as qualification of the corrected source.
A new Stage 2 candidate must be accepted before newly bound clean-host and
installed-authentication requalification can proceed. Stage 5 remains blocked.
No qualification authority, attempt, package or evidence was created.

## Stage 2 Requalification R5 Preparation

R5 is prepared for corrected commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`, and package version `0.1.3.0`. Static, custody, identity, source, architecture, build, desktop/native and standalone rehearsal gates pass. No R5 authority or attempt has yet been consumed.

The Founder has authorised the governed requalification mission beginning at Stage 2. Exactly one R5 attempt may be created through its wrapper. R4 and all earlier accepted evidence remain immutable. Stage 3 R10 remains R4-bound and barred; a newly bound downstream revision may be prepared only after an accepted R5 result.

## Stage 2 R5 Terminal Result and R6 Preparation

R5 attempt `r5-20260803T170318060Z-658ee6f0` stopped non-zero when a stale harness assertion demanded manifest version `0.1.2.0` although the constructed package correctly declared `0.1.3.0`. Exact certificate teardown passed; no package, certificate or private material remains. R5 and its authority are immutable and cannot be retried.

R6 is prepared with unique package version `0.1.4.0`, immutable R5 failure bindings and positive/negative manifest-version regression coverage. One governed R6 attempt is authorised under the continuing Founder mission. R10 remains R4-bound and barred.

## Stage 2 Requalification R6 Acceptance and Closure

R6 attempt `r6-20260803T171057940Z-5e914d18` passed all eleven lifecycle phases and is Founder-accepted and formally closed. Independent reconciliation verified all 29 manifest-bound files, 48 safe archive entries, exact signatures, archive/final-manifest hashes, and zero machine residue. R6 is the accepted corrected Stage 2 baseline.

R5 remains immutable failed history. R10 remains R4-bound and barred. The continuing Founder mission permits preparation of a newly R6-bound clean-host revision; no production authority exists.

## Stage 3 Requalification R11 Preparation

R11 is the current clean-host preparation revision, bound exclusively to the accepted Stage 2 R6 package and immutable R10 rejected-transfer history. Preparation validation is in progress. Stage 3 execution remains blocked until one create-only R11 transfer is constructed and independently verified, fresh `Founder-QA-01` continuity is collected, and elevated pre-authority admission passes.

The continuing Founder mission authorises those gates sequentially. It does not permit R10 transfer or execution, namespace reuse, production activity or bypass of any non-zero result.

## Stage 3 Requalification R11 Immutable Failure

R11 failed closed after eight of fourteen phases because `Reset-AppxPackage` removed the package-data root before the second runtime configuration. The Founder accepted the evidence as immutable failed qualification. The authority is consumed, no retry is authorised, and only successor engineering is active. R9 remains accepted passing history.

## Stage 3 Requalification R12 Engineering Status

R12 engineering correction and non-qualification validation are complete. The asynchronous post-reset registration lifecycle is now bounded and the exact `LocalState` is resolved through the Windows management API. No transfer, authority, attempt or qualification evidence was created; a new explicit Founder mission is required for any qualification.

## Stage 3 Requalification R12 Founder-Authorised Mission

The Founder accepted the completed R12 engineering baseline and authorised one governed Stage 3 R12 qualification mission. Transfer and execution are sequentially authorised; the single authority may be created and consumed only after independent transfer verification, fresh host continuity and elevated pre-authority admission pass. Stage 4, production, publication and deployment remain not authorised.

## Stage 3 Requalification R12 Pre-Authority Failure and Replacement Preparation

The first R12 execution package, `transfer-stage3-r12-20260803T190836740Z-2b8363bb`, is closed as immutable pre-authority engineering failure. Its manifest SHA-256 is `81e05a570cfffb886af7f65e60ab8658d1fdb92d6d9b1d21ae23981b36b830f0`, custody SHA-256 is `b31cde2f075b3b1ac34d168c6bbdd3a671bb9a447426388272a50a1de7b42115`, and failed host-continuity SHA-256 is `a71d06ee38b2568384aa46c84bd23af5a7cfbfcb988fad9c676b127fec9622d8`. No authority or attempt was created; its expired identities are barred from reuse.

The payload-inventory correction and one fresh create-only replacement transfer are authorised. Stage 3 execution is blocked and unauthorised; no qualification authority or attempt may be created under this preparation authority.

## Stage 3 Requalification R12 Replacement Transfer Completion

Corrected baseline `68a304d6caad3caaf84d3a6b4f63802ab4b6fe83` and replacement transfer `transfer-stage3-r12-20260803T201110346Z-3cf28c94` are prepared and independently verified. Manifest SHA-256 is `603b86c649463e4871a9a0ba2e43a9d231f1ec755c0c01fdf79428cafc55f66a`; custody SHA-256 is `681ea3eeb092d2be4ec66ab3603c499782d0757ed8c8c7094273e4829674904e`. Stage 3 execution remains blocked and unauthorised. Authority and attempt counts remain zero.

## Stage 3 Requalification R12 Execution-Enabled Mission

The replacement-only transfer transfer-stage3-r12-20260803T201110346Z-3cf28c94 is immutable execution-barred history. The Founder authorised one fresh execution-enabled R12 baseline, create-only transfer and governed attempt. Execution is authorised only after complete transfer verification, fresh continuity, elevated pre-authority admission, exact zero state, security/trust and create-only return-root gates pass. No historical identity or namespace may be reused.

## Stage 3 R12 Execution Transfer Verified — Physical Handoff Pending

Execution-enabled transfer transfer-stage3-r12-20260803T203230543Z-6c8c1069 passed independent full-payload verification at manifest SHA-256 cf4a0dfadecd49cef3163f37dd33089ab91db9edb41892e3573da4c58c1309c8 and custody SHA-256 334043da4a341fbc7b49b23221c544ce1b6e41f2a711ef798cc1c1a9bb6f163d. Execution is pending physical connection to exact host Founder-QA-01. No fresh continuity, authority or attempt exists.

## Stage 3 Requalification R12 Independent Verification and Closure

R12 attempt `stage3-r12-20260803T204415402Z-b886be44` passed all fourteen
governed lifecycle phases on `Founder-QA-01`. Independent source-workstation
verification proved the archive, sidecars, final manifest, `148/148` archive
entries, `153/153` returned-to-repository files, consumed single authority,
passing completion and zero final residue. The evidence manifest SHA-256 is
`d0238d0859a871d2589f66cbddc5f337b33638b32a02375b71f39fc2dac461d0`;
the archive SHA-256 is
`1e583ef3a67755a40ec2d4ec50e0535e38ee3e2eab9b65767d48a3a17f8f5055`.

Stage 3 R12 is formally closed for the accepted R6 package. No Stage 4 or new
programme work is authorised. The next Founder-level mission is a separate
Stage 4 programme-state and qualification-impact decision.

## Stage 4 R6/R12 Qualification Impact Assessment

The Founder-authorised assessment is complete. Stage 4 R1 remains accepted,
closed and immutable for Stage 2 R3 candidate
`a7fc67f207d9c95407c70812828fa66bd487285d`; it does not qualify the accepted
R6/R12 baseline. The R3-to-R6 delta changes 17 paths inside R1's exact product
contract, including root rendering, all Supabase adapters and the installed
runtime and packaged-server configuration boundary. R12 expressly claims
neither provider connectivity nor authentication.

Current Stage 4 qualification is therefore incomplete. Stage 5 remains
blocked. The recommended next Founder mission is bounded Stage 4 R2
engineering preparation for the exact R6 MSIX and installed runtime path,
without qualification authority or execution. This assessment created no
Stage 4 implementation, transfer, authority, attempt or evidence namespace.

## Stage 4 Requalification R2 Engineering Preparation Complete

The Founder-authorised bounded R2 engineering preparation is complete for the
accepted R6/R12 baseline. The harness binds the exact R6 candidate, tree, MSIX and
temporary public certificate, accepted R12 closure and immutable R1 history. It
retains all ten R1 journeys and executes them through the installed R6 package,
attempt-scoped LocalState configuration, ownership-verified packaged loopback
server and disposable local provider.

Static, regression, adversarial, source-equivalent and elevated installed-package
development validation passed. The exact-package rehearsal completed ten journeys
with zero package, certificate, runtime-configuration and provider residue. It
created no authority, attempt or qualification evidence.

The preparation contract remains execution-barred. Stage 4 is incomplete for the
R6/R12 chain and Stage 5 remains blocked. The next Founder-level mission is to
accept the preparation baseline and separately authorise one execution-enabled R2
baseline and one governed attempt, with authority creation only after fresh
pre-authority admission.

## Stage 4 R2 Execution-Enabled Mission

The Founder accepted the R2 engineering preparation and authorised one separate
execution-enabled baseline, one create-only governed transfer and at most one Stage
4 R2 qualification attempt. Transfer manifest/custody, independent full-inventory
verification, fresh elevated host admission, zero state and network isolation are
mandatory before authority. A consumed authority or permanent failed attempt cannot
be retried. Stage 5 and later work remain unauthorised.
## Stage 4 R2 Failure Accepted and Engineering Correction Complete

Stage 4 R2 attempt `stage4-r2-20260804T112122028Z-609ab6f0` is accepted immutable
failed qualification evidence. Its single authority is consumed and retry is
prohibited. The attempt failed after `baseline-verified` because the qualification
harness and live controller both claimed creation ownership of `logs/`; safety
teardown and independent verification proved zero residue.

The evidence-led correction is complete at commit
`8fc782df9869bc3c0e85a0d6d01ee7ef0d866175`, tree
`911684539ef85f88e2092daacb896795097e0dd8`. `logs/` is now launcher-owned and
shared only through create-only files; ephemeral `provider/` remains exclusively
controller-owned. Exact qualification and rehearsal inventories reject missing,
linked, file-backed, unexpected and pre-existing controller layouts before provider
mutation.

The accepted failure index rehashes nineteen immutable records. Static, adversarial,
full source-equivalent and elevated exact-R6 installed rehearsals passed; both live
rehearsals completed all ten journeys with zero residue. The corrected R2 contract
is qualification-barred, transfer preparation is prohibited, remaining R2 attempts
are zero, and this engineering mission created no transfer, authority or attempt.

Stage 4 remains incomplete for R6/R12 and Stage 5 remains blocked. The recommended
next Founder mission is a fresh Stage 4 Requalification R3 execution-enabled
baseline, create-only transfer and one governed attempt using new identities and
namespaces, with authority creation only after every fresh gate passes. No R2
identity or evidence namespace may be reused.

## Stage 4 Requalification R3 preparation registration

- Founder-authorised mission: one fresh Stage 4 R3 qualification lifecycle.
- Preparation result: passed; qualification not yet executed.
- Preparation manifest SHA-256:
  A855ED1244025ABFBE788C09822A6C3F8797091CB6111E2EB77FF57B711EACAC.
- Installed non-qualification rehearsal result SHA-256:
  C7BFCE696A56BC2997CDBC7DA0D1DF9492178867CB47E366B491C428A8297D3A.
- Historical bindings reverified: 20.
- R3 transfer, grant, authority, attempt and evidence identities: none created.
- R2 failed attempt and all historical evidence remain immutable and ineligible for
  reuse.
- Maximum attempts in the preparation baseline: zero. A later execution-enabled
  overlay may permit one only after all fresh pre-authority gates pass.

## Stage 4 Requalification R3 execution baseline registration

- Accepted preparation commit: c3accf832d23f395560c643ae3268c868c27f020.
- Accepted preparation tree: 23f0099959ed51fdb4c83914d257b7aebc6b9607.
- Execution manifest SHA-256:
  a124055936e08f34a19fd8b556bccf67a67bbc588d7b8bc915cb9c3a71283de8.
- Exact execution files: 29; historical bindings reverified: 22.
- Transfer preparation: permitted once under the Founder-authorised mission.
- Maximum governed attempts: one.
- Transfer, authority and attempt identities created at registration: none.

## Stage 4 Requalification R3 permanent disposition

- Founder grant: founder-stage4-r3-grant-20260804T123436312Z-03b9cd2d.
- Authority: authority-stage4-r3-20260804T123436312Z-03b9cd2d — consumed.
- Attempt: stage4-r3-20260804T123436312Z-03b9cd2d — permanently failed.
- Failure SHA-256:
  0c981997b0e62368331acc2532c2d55621487194c2870d934dcb1b25858931a6.
- Accepted failed-evidence index SHA-256:
  14264450be92dee9af007d25dbfc6c5d6fa3037935a7e024d7f48df9c6d8f9a6.
- Inner result: exact R6 installation, activation, runtime configuration and all ten
  journeys passed; cleanup rejected a naturally exited ownership-verified PID.
- Teardown: governed zero residue and passing safety teardown.
- Retry: prohibited.
- Engineering correction: complete and qualification-barred.
- Corrected manifest SHA-256:
  648ae4d856c954b2a61af90b8b08272252d95acff71a0e9b70c0ac42245248df.
- Current transfer/authority/attempt permissions: false/false/false; maximum
  attempts zero.

## Sprint 30.5 Stage 4 R4 preparation

Status: engineering preparation passed; qualification not executed. No R4 transfer, authority, attempt or qualification evidence exists. R1 is accepted historical evidence; R2 and R3 are accepted immutable failed evidence. R4 execution requires new identities and all fresh pre-authority gates.

## Sprint 30.5 Stage 4 R4 execution-enabled state

The execution overlay is prepared and validated. No transfer, authority or attempt exists yet. One attempt is permitted only after a fresh transfer and every pre-authority gate pass; retry after consumed authority remains prohibited.

## Sprint 30.5 Stage 4 R4 qualification closure

R4 attempt `stage4-r4-20260804T133045451Z-13f6da53` passed all twenty lifecycle phases and ten journeys. Independent reconciliation proved exact returned evidence, archive parity, zero non-zero processes and zero residue. R4 is closed as the current Stage 4 qualification baseline for R6/R12. Stage 5 was not started.

## Stage 5 R6/R12/R4 qualification-impact assessment

Stage 5 can extend the accepted chain without invalidating it only by qualifying
the exact R6 MSIX unchanged on `Founder-QA-01`. Its acceptance criteria are not
yet frozen: the GPU protocol remains proposed and installed protected-route
accessibility requires an authoritative contract. The next permissible mission is
bounded Stage 5 R1 engineering preparation plus Founder acceptance of that
contract. No Stage 5 engineering, transfer, authority or attempt is authorised.

Any product or package correction discovered by Stage 5 returns the corrected
candidate to a new Stage 2 revision followed by new Stage 3, Stage 4 and Stage 5
qualification. Accepted R6/R12/R4 evidence remains immutable history.
## Stage 5 R1 engineering preparation closure

The bounded R1 engineering preparation and acceptance-contract freeze are
complete against the exact unchanged R6 MSIX and accepted R6/R12/R4 chain.
Independent installed-rehearsal verification passed five samples, one stable
GPU identity, two positive GPU-engine samples, all ten Stage 4 journeys, named
UI Automation coverage and zero residue. No transfer, authority, attempt or
qualification evidence was created. Qualification requires a separate Founder
authorisation and execution-enabled baseline.
## Stage 5 accessibility correction and Stage 2 R7 preparation — 6 August 2026

The Stage 5 R2 rendered-browser investigation established a genuine product defect in the immutable R6 package: enabled informational foregrounds measured approximately 4.22–4.25:1 against the frozen 4.5:1 threshold. The Founder authorised a bounded product correction.

Corrected candidate commit 4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d, tree 1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a, replaces only the failing text and placeholder foregrounds. Static inventory, all-eight-route authenticated Edge integration, lint, TypeScript, architecture, production build, and relevant Companion regressions pass.

Stage 2 Requalification R7 engineering preparation is complete for future package version 0.1.5.0. Its new namespace binds the exact corrected candidate, requires the accessibility gate in the governed source matrix, and hash-binds accepted R6/R12/R4 indexes and closures. Accepted R6/R12/R4 evidence remains unchanged and authoritative history for the exact R6 MSIX, but it does not qualify the corrected candidate.

No transfer, authority, attempt, certificate, package, or qualification evidence was created. Stage 3, Stage 4, and Stage 5 are blocked for the current candidate pending a newly accepted Stage 2 baseline and separately authorised downstream missions. The next Founder-level decision is whether to accept the committed R7 preparation baseline and authorise exactly one governed Stage 2 R7 qualification attempt.