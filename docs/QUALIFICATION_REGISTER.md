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
**Last Reviewed:** 26 July 2026

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
| 2 | Candidate Freeze and Package Reconciliation | **Complete — awaiting Founder acceptance** | Runtime Manifest `1.7.0` package and Release Manifest reconcile; artifact/content/signature/SBOM/provenance checks pass; signer destroyed and trust removed; frozen evidence SHA-256 `8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876` | Founder Stage 2 review; Stage 3 remains separately unauthorised |
| 3 | Clean Windows Qualification | **Not started** | Separate clean Windows state remains mandatory; Stage 1 host is expressly non-pristine | Stage 2 acceptance, then separate Stage 3 authority |
| 4 | Live Authentication and Protected Rendering | **Not started** | Disposable live Supabase Email + Password and protected rendering evidence remain outstanding | Stage 3 acceptance, then separate Stage 4 authority |
| 5 | Installed Package GPU, Performance and Accessibility | **Not started** | Must use the reconciled installed package; Stage 1 proves host suitability only | Stage 4 acceptance, then separate Stage 5 authority |
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

# Independent Carried Qualification States

| Capability | State | Binding limitation |
| --- | --- | --- |
| Sprint 29 clean-machine distribution | **Deferred** | Current-host package mechanics passed; separate clean Windows package qualification remains outstanding and is not satisfied by Sprint 30.5 Stage 1 |
| Minecraft Java observation | **Provisionally certified** | Operational Certification Deferred — Required Test Environment Unavailable; observation disabled and no support claim authorised |
| Production qualification | **Incomplete** | Stage 2 engineering is complete awaiting acceptance; Stages 3–7 remain incomplete |
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
