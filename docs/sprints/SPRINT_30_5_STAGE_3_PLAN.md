# Sprint 30.5 Stage 3 — Clean Windows Qualification Plan

**Status:** Proposed — not authorised to begin
**Parent milestone:** Sprint 30.5 Production Qualification Completion
**Sequence:** Stage 3 of 7; Stages 1 and 2 are Founder-accepted and closed
**Estimated duration:** One engineering day after the clean environment and
backup prerequisites are ready
**Product changes:** None permitted
**Stage 4:** Not authorised

## Objective

Prove that the exact frozen Stage 2 MSIX can be transferred to, verified,
temporarily trusted, installed, started fail-closed, repaired and removed from
a genuinely clean Windows 11 x64 state without Node.js, Git, compilers,
development tooling, Oracle source, production credentials or production data.

Stage 3 qualifies the clean installation and Windows package lifecycle
boundary. It does not qualify live Supabase authentication, protected
authenticated rendering, installed-package GPU/performance/accessibility,
reproducibility, production signing, publication, distribution, deployment or
Beta.

## Recommended environment

Use the already authorised ASUS ROG Zephyrus G15, but only after an explicit
Founder-authorised clean reinstall of Windows 11 Home x64 from official
Microsoft installation media.

The install must remove applications, settings and data from the Windows
installation being qualified. It must use the machine's existing digital
licence and must not require a purchase, edition upgrade, paid provider or new
virtualisation provider.

This is recommended because:

- Windows Sandbox is not supported on Windows Home:
  <https://learn.microsoft.com/windows/security/application-security/application-isolation/windows-sandbox/>;
- client Hyper-V is not supported on Windows Home:
  <https://learn.microsoft.com/windows-server/virtualization/hyper-v/get-started/Install-Hyper-V>;
- a third-party VM would add a new provider, software and Windows licensing
  decision; and
- native-boot VHDX changes boot configuration and carries storage, BitLocker
  and recovery complexity without giving stronger evidence than a clean
  physical reinstall:
  <https://learn.microsoft.com/windows-hardware/manufacture/desktop/deploy-windows-on-a-vhd--native-boot>.

Microsoft documents that a clean reinstall using installation media erases
data, applications, settings and customisations:
<https://support.microsoft.com/windows/reinstall-windows-with-the-installation-media-d8369486-3e33-7d9c-dccc-859e2b022fc7>.

## Time-critical prerequisite

The frozen package is signed by an untimestamped local test certificate that
expires at `2026-07-28T15:45:27Z`.

Stage 3 installation and signature enforcement must complete while that
certificate is valid. If sufficient time remains unavailable, Stage 3 must
not begin. Rebuilding or resigning would create a new package hash and requires
separate Founder authority to return to candidate reconciliation; Stage 3 may
not manufacture a replacement.

## Prerequisites

1. Stage 2 closure commit exists and the repository is clean.
2. The Founder explicitly authorises Stage 3.
3. The Founder explicitly authorises destructive clean reinstallation of the
   dedicated ASUS qualification laptop.
4. The Founder confirms that all data requiring retention is backed up
   independently and that the machine may be erased.
5. Official Windows 11 Home x64 installation media and its provenance are
   available without purchase.
6. The machine's existing Windows digital licence and recovery information are
   available.
7. If Windows Home setup requires an online Microsoft identity, the Founder
   explicitly authorises one Founder-controlled, non-Oracle setup identity.
   No Oracle Operator, production or project credential may be used.
8. The Founder authorises Windows Update and official NVIDIA/ASUS driver
   retrieval solely for qualification-host preparation.
9. The Founder authorises temporary trust of the Stage 2 public test
   certificate solely on the qualification laptop. No private key is
   transferred.
10. The Founder authorises offline removable-media artifact transfer, or
    separately approves another isolated transfer method.
11. At least six hours remain before test-certificate expiry when installation
    qualification begins.

## Execution

### 1. Pre-destructive admission

- verify the laptop serial/model against Stage 1 evidence;
- record Windows activation and recovery readiness without retaining licence
  keys, account identifiers or recovery secrets;
- verify the external backup and recovery route;
- hash the official Windows installation media;
- record the planned Windows edition, build and language;
- confirm stable power and network availability; and
- stop for the explicit destructive-action confirmation.

### 2. Clean Windows construction

- perform an official clean Windows 11 Home x64 reinstall;
- do not restore applications, settings or user data;
- complete OOBE using only the authorised setup identity if required;
- apply stable Windows, NVIDIA and ASUS updates;
- reboot until no mandatory update remains;
- enable no optional development, gaming, cloud-sync or telemetry product;
  and
- create a documented post-update qualification baseline.

### 3. Clean-state admission

Collect a read-only baseline proving:

- exact Windows edition, version and build;
- Secure Boot, TPM and Defender state;
- hardware, display and driver identity;
- installed-software inventory;
- Oracle is absent;
- Node.js, npm, Git, Python, Docker, Visual Studio, SDKs and compilers are
  absent;
- no Oracle certificate, package, process, service, scheduled task, file or
  user-data directory exists;
- no production endpoint, credential or data is present; and
- the baseline collector itself is hash-bound and removed after collection.

Any ambient development tool or prior Oracle residue fails clean-state
admission.

### 4. Artifact transfer and pre-execution verification

- transfer the frozen Stage 2 evidence archive and a self-contained
  PowerShell-only Stage 3 qualification kit using the approved method;
- record source, destination and returned SHA-256 hashes;
- verify the frozen archive SHA-256
  `8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876`;
- verify the MSIX SHA-256
  `00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276`;
- verify Release Manifest, evidence-index and detached-CMS integrity;
- compare package identity, publisher, version and artifact hashes with the
  accepted Stage 2 record; and
- prove the kit requires no Node.js, Git, compiler, SDK or Oracle source.

No package may execute before all hashes pass.

### 5. Negative-path and temporary-trust qualification

- derive only the public certificate from the signed evidence;
- verify subject, thumbprint and validity against Stage 2 evidence;
- prove no private key is present;
- confirm the untrusted package cannot be installed;
- create a tampered package copy and prove Windows rejects it;
- import the exact public certificate temporarily into the minimum required
  local trust store; and
- record the before/after trust-store delta.

The accepted package must never be modified.

### 6. Clean install and fail-closed startup

- install the exact accepted MSIX;
- verify package family, publisher, architecture and version `0.1.1.0`;
- launch the installed application without production configuration;
- confirm it starts from packaged local content rather than a development
  server;
- confirm it presents the approved unavailable/local-qualification state;
- confirm no production endpoint, credential, persistence or external
  diagnostic path is used;
- confirm renderer sandboxing and process boundaries remain observable; and
- stop the package cleanly.

No live Auth or protected authenticated journey is attempted in Stage 3.

### 7. Repair and removal

- exercise Windows package repair/reset;
- verify the same package identity remains registered;
- relaunch and confirm the same fail-closed state;
- uninstall the package;
- confirm package registration, processes, binaries, application data,
  transient diagnostics and temporary files are removed; and
- confirm no remote account or server-state claim is made.

Update and rollback are not exercised in Stage 3 because the frozen Stage 2
evidence contains one candidate package only. No package may be rebuilt or
resigned to manufacture a lifecycle pair.

### 8. Evidence return and cleanup

- remove the temporary test certificate from every applicable certificate
  store;
- verify zero matching store entries and zero private-key material;
- remove the qualification kit and transferred package/archive after evidence
  return;
- verify Oracle remains uninstalled;
- collect a final software, package, process, certificate and file-residue
  audit;
- return the evidence through the approved transfer route;
- verify the returned archive hash on the development PC;
- freeze the Stage 3 evidence;
- reconcile only required documentation;
- create the local Stage 3 completion commit; and
- stop for Founder review.

The clean Windows baseline may remain on the dedicated laptop for a later
separately authorised Stage 4, but no Stage 4 software, Auth infrastructure,
identity or test may be provisioned.

## Acceptance criteria

Stage 3 passes only if all criteria are met:

1. The Windows installation is demonstrably new, supported, fully updated and
   free of prior Oracle and development tooling.
2. The exact accepted Stage 2 archive, MSIX and Release Manifest hashes match.
3. No product source, package, manifest, signature or migration changed.
4. The package fails before trust and a tampered copy is rejected.
5. Only the expected public test certificate is trusted, temporarily.
6. The exact package installs under the declared identity and publisher.
7. Packaged startup succeeds without a development server and fails product
   capability closed without production configuration.
8. Repair/reset succeeds without changing package identity.
9. Uninstall removes package registration, processes, binaries, application
   data and transient diagnostics.
10. Temporary trust, certificate files, private keys, transferred artifacts
    and kit files are removed.
11. No production endpoint, credential, data, migration, persistence,
    diagnostic upload, publication, distribution or deployment is used.
12. Every required item has hash-bound evidence; no unavailable result is
    represented as passed.
13. The repository is clean after the local completion commit.
14. Stage 4 remains not started.

Any failed mandatory criterion fails Stage 3. Partial results remain evidence
but do not create a pass.

## Evidence requirements

The Stage 3 package must contain:

- clean-install provenance and media SHA-256;
- redacted Windows activation, edition, version and build record;
- hardware, Secure Boot, TPM, Defender, driver and display record;
- before/after installed-software inventory;
- Oracle/development-tool absence record;
- production-resource prohibition checklist;
- qualification-kit manifest and SHA-256;
- artifact-transfer source/destination/return hashes;
- Stage 2 archive, package and Release Manifest verification result;
- pre-trust rejection result;
- tampered-package rejection result;
- public-certificate subject, thumbprint and validity record;
- trust-store before/import/remove/final-zero record;
- package installation identity and version record;
- packaged-startup and fail-closed-state result;
- repair/reset result;
- uninstall and residue audit;
- network/prohibited-endpoint evidence;
- environment cleanup result;
- Stage 3 evidence index;
- frozen Stage 3 archive and SHA-256;
- Stage 3 implementation/evidence report; and
- exact local completion commit, branch and ahead-of-remote count.

Account identifiers, licence keys, recovery keys, machine secrets and private
signing material must never enter the evidence package.

## Stop conditions

Stop immediately if:

- the Founder has not explicitly authorised laptop erasure;
- backup, recovery or Windows activation readiness cannot be demonstrated;
- official installation-media provenance cannot be established;
- a purchase, edition upgrade, paid provider or new virtualisation provider is
  required;
- fewer than six hours remain before certificate expiry;
- the certificate is expired or the package requires rebuilding/resigning;
- the Stage 2 archive, package, manifest or signature hash diverges;
- clean-state admission finds Oracle or development tooling;
- installation requires production credentials, endpoints or data;
- the package depends on Node.js, Git, a compiler, SDK or development server;
- Windows accepts the tampered package;
- unexpected network, persistence, diagnostic upload or renderer authority is
  observed;
- repair or removal leaves material residue;
- certificate trust or private-key material cannot be completely removed;
- product source, architecture, security policy, trust boundary, migration or
  product behaviour would need to change; or
- any missing evidence would have to be inferred.

## Rollback and recovery

- Before reinstall: make no change unless the backup, recovery information and
  explicit destructive confirmation are complete.
- Reinstall failure: use only the documented official Windows recovery path;
  do not improvise an unsupported image.
- Qualification failure: preserve failure evidence, remove Oracle and
  temporary certificate trust, return the laptop to the admitted clean
  baseline and stop.
- Package or source defect: do not rebuild, patch or resign. Return for Founder
  review; a product correction returns qualification to Stage 2.
- Environment defect: preserve the frozen Stage 2 candidate and replace or
  reconstruct only the Stage 3 environment after separate review.

## Founder decisions required before beginning

The Founder must explicitly approve:

1. **Sprint 30.5 Stage 3 execution.**
2. **Destructive clean reinstallation of Windows 11 Home x64 on the dedicated
   ASUS qualification laptop**, after confirming backup and recovery.
3. **Use of official Microsoft installation media, Windows Update, existing
   digital licensing and official NVIDIA/ASUS drivers** solely for host
   preparation.
4. **Use of a Founder-controlled non-Oracle Microsoft setup identity**, only
   if Windows Home OOBE requires it.
5. **Temporary local trust of the Stage 2 public test certificate and local
   installation of the frozen Stage 2 MSIX.**
6. **The approved offline artifact-transfer method.**
7. **Execution before the certificate-validity deadline**, with no implicit
   authority to rebuild or resign if the deadline cannot be met.

These approvals may be granted together in one Stage 3 Founder decision.

## Authority not requested

Stage 3 does not request product implementation, package rebuilding,
resigning, production signing, publisher registration, managed signing,
publication, external distribution, deployment, production endpoints,
production credentials, database migrations, runtime persistence, persisted
producers or consumers, live Auth qualification, protected rendering,
installed-package GPU/performance/accessibility qualification, Gate C, Gate 7,
Stage 4, Sprint 31, Beta or release.
