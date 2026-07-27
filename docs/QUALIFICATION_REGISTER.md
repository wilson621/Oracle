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
**Last Reviewed:** 27 July 2026

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
| 2 | Candidate Freeze and Package Reconciliation | **Founder-accepted and closed** | Runtime Manifest `1.7.0` package and Release Manifest reconcile; artifact/content/signature/SBOM/provenance checks pass; signer destroyed and trust removed; frozen evidence SHA-256 `8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876` | None for Stage 2; history is closed |
| 3 | Clean Windows Qualification | **Historically attempted — incomplete and blocked** | `Founder-QA-01`, `MEDION ERAZER P6605 MD61596`, remains `admitted-with-founder-provenance-exception`; `installationMediaEvidencePresent` remains false; recovered Revision 4 NegativePathAndTrust evidence passed with SHA-256 `164a5df278aeca15d98b7c131e4c73cadea40f511d0831f12ed4d0d46e3215e2`; Revision 4 InstallAndStartup failed; canonical Phase 03 success evidence is absent; Revision 5 remained incomplete; Revision 6 is abandoned; the certificate 24-hour start gate closed at `2026-07-27T15:45:27Z` | No current authority exists to resume Stage 3; any new harness, certificate, candidate or qualification revision requires a separate Founder decision |
| 4 | Live Authentication and Protected Rendering | **Not started** | Disposable live Supabase Email + Password and protected rendering evidence remain outstanding | Stage 3 acceptance, then separate Stage 4 authority |
| 5 | Installed Package GPU, Performance and Accessibility | **Not started** | Must use the reconciled installed package on the replacement host; ASUS Stage 1 GPU evidence does not transfer | Stage 4 acceptance, then separate Stage 5 authority and replacement-host GPU admission |
| 6 | Reproducibility and Environment Teardown | **Not started** | Requires accepted Stages 2–5 | Stage 5 acceptance, then separate Stage 6 authority |
| 7 | Final Integrated Qualification and Sprint 30 Closure Package | **Not started** | Requires complete immutable evidence from Stages 1–6 | Stage 6 acceptance, then separate Stage 7 authority |

# Stage 1 Permanent Qualification Position

- The ASUS ROG Zephyrus G15 is admitted as a **controlled non-pristine
  physical qualification host**.
- It is not a pristine or clean-machine environment.
- Installed Node.js, npm, Python, .NET and Visual Studio Build Tools did not
  participate in the qualification execution path and need not be removed
  solely for Stage 1.
- A separate clean Windows qualification remains mandatory before production
  certification.
- Stage 1 may be reopened only when new evidence demonstrates a genuine
  qualification defect.
- The ASUS remains the accepted historical Stage 1 host but is not the Stage 3
  host. Its hardware, GPU, driver, display and network facts do not transfer
  to the Founder-designated replacement laptop.

# Stage 2 Permanent Qualification Position

- Stage 2 is Founder-accepted and closed.
- The Stage 3 host change does not alter the source candidate, Runtime
  Manifest `1.7.0`, signed Release Manifest, accepted MSIX, artifact hashes or
  frozen Stage 2 evidence.
- No Stage 1 or Stage 2 repetition is required.
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
- Host admission grants no Stage 3 execution, certificate trust, artifact
  transfer, package installation, deployment or security-boundary authority.
- Stage 3 was historically Founder-authorised and attempted. It remains
  incomplete and blocked. Host admission remains valid for the admitted
  installation, but it creates no current execution, certificate-trust,
  artifact-transfer, package-installation or requalification authority.

# Independent Carried Qualification States

| Capability | State | Binding limitation |
| --- | --- | --- |
| Sprint 29 clean-machine distribution | **Deferred** | Current-host package mechanics passed; separate clean Windows package qualification remains outstanding and is not satisfied by Sprint 30.5 Stage 1 |
| Minecraft Java observation | **Provisionally certified** | Operational Certification Deferred — Required Test Environment Unavailable; observation disabled and no support claim authorised |
| Production qualification | **Incomplete** | Stages 1 and 2 are Founder-accepted and closed; Stage 3 was historically attempted but remains incomplete and blocked; Stages 4–7 have not started |
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
