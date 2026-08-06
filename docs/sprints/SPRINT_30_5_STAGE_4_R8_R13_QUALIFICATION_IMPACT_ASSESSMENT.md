# Sprint 30.5 Stage 4 R8/R13 Qualification Impact Assessment

**Authority:** Founder-authorised programme-state and qualification-impact assessment
**Scope:** Accepted Stage 2 R8 and Stage 3 R13 baseline against accepted historical Stage 4 R4
**Owner:** Oracle Platform Engineering and Oracle Governance
**Status:** Complete
**Classification:** Programme assessment; non-qualification; no execution authority
**Expected Stability:** Immutable assessment once accepted
**Supersedes:** Stage 4 impact-undecided state recorded at R13 closure
**Superseded By:** None
**Last Reviewed:** 6 August 2026

---

# Decision

Stage 4 R4 remains accepted, closed and immutable evidence for the exact Stage
2 R6 / Stage 3 R12 chain. It does not qualify the accepted Stage 2 R8 / Stage
3 R13 baseline.

The current programme state is therefore:

- Stage 2 R8 is accepted and closed;
- Stage 3 R13 is accepted and closed for the exact R8 MSIX;
- Stage 4 R4 is accepted historical evidence only;
- Stage 4 qualification of the R8/R13 baseline is incomplete;
- Stage 5 remains blocked for the current baseline; and
- Stages 6 and 7 remain not started.

No new Stage 4 product defect was identified by this assessment. The mandatory
work is qualification-protocol adaptation and requalification, not an inferred
product correction.

This assessment creates no Stage 4 engineering, transfer, authority, attempt,
certificate-trust, installation, provider, qualification-evidence, production,
publication, deployment or release authority.

# Evidence Bindings

## Accepted current baseline

- Stage 2 R8 candidate commit:
  `4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d`
- Stage 2 R8 candidate tree:
  `1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a`
- Stage 2 R8 package version: `0.1.6.0`
- Stage 2 R8 MSIX SHA-256:
  `97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490`
- Stage 2 R8 certificate thumbprint:
  `A01F08EB5A07308FEAB3812692516C667D50EA56`
- Stage 2 R8 passing attempt:
  `stage2-r8-20260806T134157536Z-a0bf3986`
- Stage 3 R13 passing attempt:
  `stage3-r13-20260806T162253957Z-b0cb2a17`
- Stage 3 R13 final evidence-manifest SHA-256:
  `ee12f0307d5c55dc05027c50dcba4860923ff36544c432055417005cee3e19f8`
- Stage 3 R13 archive SHA-256:
  `4e7fb5b75b036e7edf78438117950f4be78c74ad26bc0d102e77dc6658da3c7a`
- Stage 3 R13 accepted-evidence-index SHA-256:
  `830a3dd59c493de17bfb7c51da49e882f8d09e6ac135e5aaaefd7cbb9b648cb6`

## Accepted historical Stage 4 baseline

- Stage 4 R4 accepted chain: Stage 2 R6 / Stage 3 R12
- Stage 4 R4 R6 MSIX SHA-256:
  `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`
- Stage 4 R4 passing attempt:
  `stage4-r4-20260804T133045451Z-13f6da53`
- Stage 4 R4 authority:
  `authority-stage4-r4-20260804T133045451Z-13f6da53` (consumed)
- Stage 4 R4 evidence-manifest SHA-256:
  `0b740dfc12e2334a63807d3097e302f864b9adaa1caf58b2b8757b3c57752b46`
- Stage 4 R4 archive SHA-256:
  `7f01fe4fcf5bee2b32b220a26660ea163a92e98450c093d1e7dc4c6752c7598c`
- Stage 4 R4 accepted-evidence-index SHA-256:
  `f54bb660578bcd2dadf8ad4412f1d58738441df4688816eabc64ea3f7cdeeac8`

# Qualification Impact

R4 is exact-candidate evidence. Its contract names Stage 2 R6, the R6 package
hash and signer, Stage 3 R12, the R12 evidence bindings, and execution surface
`accepted-r6-installed-msix`. R8 changes the package hash, package version,
signer and candidate identity. R13 establishes the R8 installed lifecycle but,
like R12 before it, does not establish the ten live provider, authentication,
session and protected-rendering journeys owned by Stage 4.

The R6-to-R8 product delta is primarily the accepted accessibility correction.
It includes presentation changes in both authentication pages and a wider set
of rendered components. The two authentication-page changes improve text
contrast without changing authentication logic. That narrow implementation
fact does not permit evidence carry-forward: the installed artifact and its
cryptographic identity changed, while R4's contract rejects package drift.

All ten R4 journeys therefore require a fresh R8-bound result:

| Required journey | R8/R13 evidence state |
| --- | --- |
| Anonymous protected route rejected | Not established by R13; requalification required |
| Account created without session | Not established by R13; requalification required |
| Confirmation mail captured locally | Not established by R13; requalification required |
| Email verified | Not established by R13; requalification required |
| Verified password sign-in | Not established by R13; requalification required |
| Unverified account rejected | Not established by R13; requalification required |
| Protected route rendered | Changed installed artifact; requalification required |
| Protected API authorised | Not established by R13; requalification required |
| Cross-account isolation | Not established by R13; requalification required |
| Sign-out invalidates session | Not established by R13; requalification required |

# Clean-Host Architecture Dependency

The accepted R8/R13 architecture assigns qualification to `Founder-QA-01` as
a clean host. It must not require a development repository, Git, Node, npm,
Supabase CLI or Docker. Engineering, build, signing, freeze, transfer creation,
independent verification, evidence reconciliation and closure remain on the
engineering workstation.

The accepted R4 protocol cannot be reused unchanged under that architecture.
Its contract binds Git, Node, npm, Supabase CLI and Docker executables on the
engineering workstation. Its qualification controller creates and controls a
five-service disposable Supabase environment with Docker, builds source-
equivalent Web output, and executes Node-based journey logic. Those are
development-workstation assumptions and are absent by design from
`Founder-QA-01`.

This incompatibility must be resolved before any Stage 4 transfer or execution
mission. It must not be resolved by installing developer tooling or a
repository on `Founder-QA-01`, by executing qualification on the main PC, by
using an ungoverned external provider, or by weakening the ten journeys,
network isolation, credential separation, create-only evidence or zero-residue
requirements.

# Reusable and Non-Reusable R4 Assets

The following R4 programme facts and acceptance semantics remain reusable as
engineering inputs:

- all ten required journeys;
- the twenty-phase fail-closed lifecycle;
- disposable non-production provider semantics;
- locally captured confirmation mail;
- two-principal cross-account isolation;
- public and privileged credential separation;
- installed LocalState runtime-configuration consumption;
- ownership-verified process teardown and zero residue; and
- the immutable R1-R4 historical evidence chain.

The following cannot be carried forward:

- R4's R6 package, signer and R12 evidence bindings;
- any R4 transfer, authority, attempt, account, provider or evidence identity;
- its workstation-specific executable paths and hashes;
- its repository-dependent source build during qualification; and
- its Node/npm/Supabase CLI/Docker qualification-host assumption.

# Adversarial Review

1. **The accessibility correction does not change authentication logic, so R4
   remains current.** Rejected. R4 is exact-artifact evidence and the installed
   MSIX, version and signer changed.
2. **R13 activation and reset/repair cover Stage 4.** Rejected. R13 proves the
   installed lifecycle, not live provider, authentication, authorization,
   isolation or session semantics.
3. **Run the unchanged R4 controller on the main PC.** Rejected. That would
   recreate the Founder-rejected main-PC qualification exception and violate
   the accepted split-host architecture.
4. **Install R4's toolchain on Founder-QA-01.** Rejected. The clean-host
   contract expressly prohibits dependence on those development tools.
5. **Point the package at a convenient remote provider.** Rejected. It would
   change provider custody, network isolation and evidence boundaries without
   a governed design and validation record.
6. **Rewrite or invalidate R4.** Rejected. R4 remains valid immutable history
   for its exact R6/R12 chain.

# Recommended Founder-Level Mission

Authorise a bounded **Stage 4 Requalification R5 engineering-preparation
mission**. It should permit protocol design, implementation, validation,
regression testing, adversarial review, rehearsal, documentation, commit and
push only. It should not permit transfer creation, authority creation or a
qualification attempt.

The R5 preparation must:

1. bind the exact accepted R8 package and independently verified R13 closure;
2. preserve every historical Stage 4 record unchanged;
3. retain all ten R4 journeys and all fail-closed evidence requirements;
4. establish a governed provider and journey-execution design compatible with
   a repository-free, Git-free, Node-free, npm-free, Supabase-CLI-free and
   Docker-free `Founder-QA-01`;
5. keep build, signing, freeze and transfer construction on the engineering
   workstation;
6. prove that no main-PC qualification exception, production endpoint,
   ungoverned remote service or ambient credential is introduced;
7. preserve runtime-configuration secrecy, network admission, two-principal
   isolation, ownership-verified teardown and zero residue;
8. use entirely fresh identities and namespaces in any later separately
   authorised execution mission; and
9. stop and return a qualification-impact decision if the required clean-host
   provider semantics cannot be achieved without changing the product.

Stage 5 must remain blocked until a fresh R8/R13-bound Stage 4 result is
executed, independently reconciled and Founder-accepted.

# Closure

The authorised assessment is complete. No Stage 4 engineering or qualification
was begun, and no transfer, authority, attempt, provider, account or evidence
namespace was created.