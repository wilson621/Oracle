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
**Last Reviewed:** 3 August 2026

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
| 2 | Candidate Freeze and Package Reconciliation | **R6 Founder-accepted and formally closed** | Passing attempt `r6-20260803T171057940Z-5e914d18`; final manifest `a637a7fdf49f6b2a957738c89cb02015b6384d227c2c72f77a2aabdd721bf288`; archive `7884c93b222cd5f16f51dd5ba1b56c51af5008e1f6c999dcff92a8c1a26ac690`; MSIX `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`; zero residue | Prepare a newly R6-bound clean-host revision; R10 remains barred |
| 3 | Clean Windows Qualification | **R9 accepted history; R11 prepared and execution blocked pending transfer/admission gates** | R11 binds accepted R6 MSIX `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`; R10 remains barred with two immutable rejected transfers | Construct and verify one R11 transfer, then require fresh host continuity and passing elevated pre-authority admission before the authorised single attempt |
| 4 | Live Authentication and Protected Rendering | **R1 Founder-accepted and formally closed** | Passing attempt `stage4-r1-20260803T093803115Z-7fc6b185`; manifest SHA-256 `1f516e1f7d1b30d88c8e9fbd22774068bd9c7071935cc415b1d1243b7b5d4c9d`; archive SHA-256 `91116098c123c960ba736114176c08876f7a4f66b0b777efbcb2bda1e53d2a15`; ten journeys and zero-residue teardown passed | None for Stage 4; history is closed and further Stage 4 execution is unauthorised |
| 5 | Installed Package GPU, Performance and Accessibility | **Blocked pending a newly qualified corrected package and downstream requalification** | R4 qualifies only its immutable historical package; corrected current source has no accepted Stage 2 package, clean-host result or installed-authentication result | Stage 2 qualification authority when requested, followed by separately governed downstream authority |
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
- Stage 4 is formally closed and grants no Stage 5 or production authority.
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
| Production qualification | **Incomplete** | Stages 1-4 are Founder-accepted and closed; Stage 4 R1 is the accepted passing result; Stages 5-7 have not started |
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
