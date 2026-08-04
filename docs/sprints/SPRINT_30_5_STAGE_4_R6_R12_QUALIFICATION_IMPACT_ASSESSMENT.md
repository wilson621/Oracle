# Sprint 30.5 Stage 4 R6/R12 Qualification Impact Assessment

**Authority:** Founder-authorised programme-state and qualification-impact assessment
**Scope:** Accepted Stage 2 R6 and Stage 3 R12 baseline against historical Stage 4 R1
**Owner:** Oracle Platform Engineering and Oracle Governance
**Status:** Complete
**Classification:** Programme assessment; non-qualification; no execution authority
**Expected Stability:** Immutable assessment once accepted
**Supersedes:** Stage 4 impact undecided state recorded at R12 closure
**Superseded By:** None
**Last Reviewed:** 4 August 2026

---

# Decision

Stage 4 R1 remains accepted, closed and immutable evidence for Stage 2 R3
candidate `a7fc67f207d9c95407c70812828fa66bd487285d`. It does not qualify the
accepted Stage 2 R6 / Stage 3 R12 baseline.

The current programme state is therefore:

- Stage 2 R6 is accepted and closed;
- Stage 3 R12 is accepted and closed for the exact R6 MSIX;
- Stage 4 R1 is accepted historical evidence only;
- Stage 4 qualification of the R6/R12 baseline is incomplete and requires a
  newly bound revision;
- Stage 5 remains blocked; and
- Stages 6 and 7 remain not started.

This assessment creates no Stage 4 engineering, transfer, authority, attempt,
certificate-trust, installation, production, publication, deployment or
release authority.

# Evidence Bindings

## Accepted current baseline

- Stage 2 R6 candidate commit:
  `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`
- Stage 2 R6 candidate tree:
  `8455a05780989a9d5f6c6d527f7d427d94526b04`
- Stage 2 R6 MSIX SHA-256:
  `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`
- Stage 3 R12 passing attempt:
  `stage3-r12-20260803T204415402Z-b886be44`
- Stage 3 R12 evidence manifest SHA-256:
  `d0238d0859a871d2589f66cbddc5f337b33638b32a02375b71f39fc2dac461d0`
- Stage 3 R12 archive SHA-256:
  `1e583ef3a67755a40ec2d4ec50e0535e38ee3e2eab9b65767d48a3a17f8f5055`

## Historical Stage 4 baseline

- Stage 4 R1 candidate commit:
  `a7fc67f207d9c95407c70812828fa66bd487285d`
- Stage 4 R1 candidate tree:
  `356f6d52f1bf70065692e892af8bf916acc8727a`
- Stage 4 R1 passing attempt:
  `stage4-r1-20260803T093803115Z-7fc6b185`
- Stage 4 R1 evidence manifest SHA-256:
  `1f516e1f7d1b30d88c8e9fbd22774068bd9c7071935cc415b1d1243b7b5d4c9d`
- Stage 4 R1 archive SHA-256:
  `91116098c123c960ba736114176c08876f7a4f66b0b777efbcb2bda1e53d2a15`

# Technical Impact

The R3-to-R6 comparison contains no database migration or dependency-lockfile
change, but it changes 17 paths inside the exact Stage 4 R1 product-path
contract: 826 insertions and 266 deletions. The affected paths include:

- `app/layout.tsx`;
- all four Supabase browser, middleware, server and trusted-server adapters;
- the public, browser and server runtime-configuration policy;
- the installed runtime-configuration consumer;
- the packaged Next.js server and its strict child environment; and
- desktop activation and packaged-request-origin handling.

These are material Stage 4 paths. Public provider values now flow through a
validated server configuration and unique HTML metadata before browser use.
Installed execution uses `ORACLE_SUPABASE_URL` and
`ORACLE_SUPABASE_ANON_KEY`; privileged provider and session values enter only
the packaged server's explicit environment. Ambiguous, incomplete or invalid
configuration fails closed. The unauthenticated packaged fallback was
removed.

The change intersects every R1 journey because all ten journeys depend on the
provider client, middleware session handling, server authentication or trusted
server boundary. The protected-rendering journey additionally depends on the
new root-layout configuration projection. Cross-account isolation still uses
the unchanged R3 database migrations, but its application/provider path has
changed and therefore cannot be carried forward by inference.

# Qualification Gap

Stage 4 R1 executed a source-built standalone Web application with
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SECRET_KEY` and `ORACLE_WEB_SESSION_SECRET` supplied directly to the
server process. Its contract is explicitly bound to the R3 commit and rejects
product-path drift.

Stage 3 R12 exercised the exact R6 MSIX through trust, installation, direct
activation, runtime observation, reset/repair, second activation, removal and
zero-residue teardown. Its contract explicitly records
`providerConnectivityClaimed: false` and `authenticationClaimed: false`.
Consequently, R12 does not fill the Stage 4 gap.

The two evidence sets are complementary but non-substitutable:

- R1 proves live authentication and protected rendering on the earlier
  source-runtime path;
- R12 proves the corrected installed-package lifecycle without claiming live
  provider or authentication behaviour; and
- neither proves the ten Stage 4 journeys through the R6 installed runtime
  configuration and packaged-server environment.

Under the permanent invalidation rule, the changed product source cannot be
qualified by the earlier candidate-bound result. Treating R1 as current would
infer unavailable evidence and weaken fail-closed governance.

# Journey Impact Matrix

| R1 journey | R6/R12 impact | Current evidence state |
| --- | --- | --- |
| Anonymous protected route rejected | Middleware provider resolution changed | Requalification required |
| Account created without session | Browser configuration delivery changed | Requalification required |
| Confirmation mail captured locally | Browser/provider path changed | Requalification required |
| Email verified | Browser/provider path changed | Requalification required |
| Verified password sign-in | Browser, server and middleware paths changed | Requalification required |
| Unverified account rejected | Middleware provider resolution changed | Requalification required |
| Protected route rendered | Root layout, browser and middleware paths changed | Requalification required |
| Protected API authorised | Server provider resolution changed | Requalification required |
| Cross-account isolation | Trusted-server and application/provider paths changed; database policy unchanged | Requalification required |
| Sign-out invalidates session | Browser and middleware session paths changed | Requalification required |

# Adversarial Review

The following carry-forward arguments were considered and rejected:

1. **The R6 correction is packaging-only.** False. Authentication adapters,
   root rendering and provider configuration changed inside R1's contract.
2. **Unchanged migrations preserve R1.** Insufficient. Database policy is only
   one part of the end-to-end journeys; the application and credential paths
   changed.
3. **R12 activation proves authentication.** False. R12 expressly disclaims
   provider connectivity and authentication.
4. **The source fallback means R1 still applies.** False. Compatibility of a
   source path does not prove the newly required installed path, and R1 is
   candidate-hash bound.
5. **Historical R1 should be invalidated or rewritten.** False. Its result is
   valid for its exact historical candidate and remains immutable.

# Recommended Founder-Level Mission

Authorise a bounded **Stage 4 Requalification R2 engineering-preparation
mission**. The mission should permit investigation, harness implementation,
non-qualification regression and adversarial validation, documentation, and
preparation review only. It should not initially permit authority creation or
qualification execution.

The R2 preparation contract should:

1. bind the exact accepted R6 candidate, tree and MSIX plus the independently
   verified R12 closure evidence;
2. preserve R1 and all Stage 2/3 evidence unchanged;
3. retain all ten R1 authentication, protected-rendering, session and
   two-principal isolation journeys;
4. exercise those journeys through the installed R6 package, attempt-scoped
   LocalState runtime configuration and strict packaged-server environment;
5. use a disposable local, non-production provider on a network-isolated
   admitted host;
6. prove public/privileged credential separation and reject missing,
   incomplete, ambiguous, expired, tampered and ambient configuration;
7. use fresh transfer, authority, attempt, provider, account and evidence
   identities;
8. preserve create-only and zero-residue controls; and
9. require a later, separate Founder authorisation before any qualification
   authority or attempt is created.

Stage 5 must remain blocked until a newly bound Stage 4 result is executed,
independently reconciled and Founder-accepted.

# Closure

The authorised assessment is complete. No Stage 4 engineering or
qualification was begun, and no governed identity, transfer, authority,
attempt or evidence namespace was created.
