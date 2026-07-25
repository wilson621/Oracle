# SPRINT 29 FOUNDER DECISION PACKAGE — SECURE DESKTOP OPERATIONS AND DISTRIBUTION

**Status:** Founder decision required; implementation not started
**Prepared:** 25 July 2026
**Recommended option:** Option A — Windows-native governed MSIX distribution
**ADR required:** ADR-046 — Desktop Distribution, Release Integrity and Update Authority
**Migration proposed:** None
**Deployment proposed:** None

---

# Founder Decision Requested

Approve or reject:

1. Option A as Oracle's Windows Beta packaging and update architecture;
2. creation and acceptance of ADR-046;
3. the immutable signed Release Manifest as the canonical distribution
   contract;
4. Sprint 29 planning, source implementation, local test signing, local
   verification, local clean-machine certification and documentation
   reconciliation; and
5. explicit deferral of production publisher credential establishment, public
   release hosting and external distribution to a separate Founder
   operational decision.

This package does not request production deployment, publication, certificate
purchase, signing-service enrolment or remote push authority.

# Architectural Problem

Sprint 28 created one coherent product journey. Oracle still runs as a
development Electron host served by a separately started Next.js process. The
repository compiles Electron and two self-contained native helpers, but it has
no installer, signed executable, package identity, release channel, updater,
release provenance, SBOM, repair path or governed uninstall.

Distribution creates a new security boundary. Installer and update code can
replace executable software on an Operator's machine. A compromised signing
identity, mutable release record, renderer-controlled updater, confused
channel, unverified native helper or destructive uninstall would bypass
Oracle's otherwise strict runtime authority.

The architecture must therefore answer:

- who owns packaging, signing, update, repair, rollback and uninstall;
- what immutable record declares an authorised release;
- how package, executable and native-helper integrity is verified;
- how signing credentials remain outside source, artifacts and developer
  workstations;
- how Beta and future Stable channels remain isolated;
- what renderer-safe status and bounded controls may cross the preload bridge;
- how a live Companion attachment is stopped before replacement or shutdown;
- what local credentials and data are removed during uninstall; and
- how local mechanism certification remains distinct from production
  publisher trust and distribution authority.

This is an architectural and security decision. It cannot be selected during
routine implementation.

# Current Repository Evidence

- Electron `39.2.7` is compiled directly; no packaging framework is installed.
- No MSIX, MSI, Squirrel, NSIS or Store packaging configuration exists.
- No updater or release-channel implementation exists.
- No signing, timestamping, provenance or SBOM pipeline exists.
- Native discovery and observation helpers build as self-contained Windows
  executables but are not packaged or signed.
- Refresh tokens use Electron `safeStorage` and do not cross the renderer
  boundary.
- Renderer Node integration is disabled and context isolation is enabled.
- The current development window explicitly disables renderer sandboxing;
  Sprint 29 must remove that exception or prove a narrowly isolated
  incompatibility before release packaging can pass.
- Desktop Platform API v1 and Guidance v1 contain no distribution authority.

# Inherited Boundaries

Every option must preserve:

- ADR-040 exact manifest/runtime equality;
- ADR-041 Session Service lifecycle authority;
- ADR-042 evidence-led progression authority;
- ADR-043 non-authoritative transient Conversation;
- ADR-044 observation consent, privacy and ephemerality;
- ADR-045 compatibility certification;
- the External Companion trust boundary;
- renderer presentation-only authority;
- OS-protected refresh-token custody;
- no embedded production secrets;
- no runtime persistence or persisted producers or consumers; and
- no deployment, Gate C, migration or production activation.

# Options Considered

## Option A — Windows-native governed MSIX distribution

**Recommended.**

Package Oracle and its native helpers as a Windows x64 MSIX. Use Windows App
Installer for direct, Founder-controlled Beta install, update and repair.
Electron main-process code may coordinate checks and expose immutable
renderer-safe update state, but Windows package deployment remains the
installer and replacement authority.

The release build loads only packaged, immutable Desktop renderer content and
approved HTTPS service endpoints. It must not depend on a separately started
localhost development server or execute remotely supplied renderer code.

An immutable, versioned and signed Oracle Release Manifest declares the exact
package, channel, version, package identity, publisher identity, artifact hash,
native-helper hashes, runtime manifest version, minimum supported version,
rollback eligibility, provenance and SBOM references. Certification
mechanically compares the produced artifacts with this contract.

Local certification uses an isolated self-signed test identity trusted only on
disposable clean-machine test environments. Production publisher identity,
managed signing, public hosting and distribution remain separately gated.

Advantages:

- Windows verifies the mandatory MSIX signature and package identity;
- App Installer provides OS-level update and repair mechanisms;
- transactional package replacement reduces partial-update risk;
- direct Beta distribution remains Founder-controlled without committing
  Oracle to a public Store listing;
- a later Microsoft Store path can reuse the MSIX packaging model;
- package and runtime manifests create parallel mechanically verified
  contracts; and
- update authority stays outside renderers and authoritative Oracle Services.

Disadvantages:

- MSIX package identity and publisher identity require careful permanent
  selection;
- direct external distribution requires a trusted production signing identity
  and HTTPS hosting;
- local self-signed evidence cannot prove real production publisher trust;
- App Installer behaviour constrains custom updater UX;
- native helper, overlay, startup and filesystem assumptions require packaged
  Windows verification; and
- Windows-only delivery does not create macOS or Linux distribution support.

## Option B — Microsoft Store-first MSIX distribution

Submit MSIX directly to Microsoft Store and use Store-managed signing,
delivery and updates.

Advantages:

- Microsoft re-signs Store MSIX submissions;
- trusted installation, hosting and updates are managed by Windows;
- no Oracle production certificate purchase is required for the Store MSIX;
- Store discovery and staged delivery are available; and
- reduced Oracle-operated update infrastructure.

Disadvantages:

- immediately introduces Partner Center, Store policy and review dependencies;
- creates publication and commercial decisions beyond a local engineering
  Sprint;
- release timing and availability depend on a third party;
- private Founder Beta distribution is less direct;
- Store identity must be reserved before final packaging identity is fixed;
  and
- Store acceptance is operational evidence that cannot be manufactured
  locally.

This is viable for production distribution later, but is premature as the only
Sprint 29 implementation path.

## Option C — Direct Win32 installer with Electron-managed updates

Use Squirrel.Windows, WiX MSI or NSIS with Electron's updater and an
Oracle-hosted release feed.

Advantages:

- conventional Electron tooling and flexible install UX;
- broad control over per-user installation, update prompts and channels;
- fewer MSIX container constraints; and
- straightforward private release hosting.

Disadvantages:

- Oracle owns more privileged install, repair, rollback and update code;
- partial-update and uninstall behaviour require more custom hardening;
- the updater and installer expand the application-controlled attack surface;
- every PE and installer still requires trusted signing;
- release-feed and channel correctness become more application-specific; and
- a later Store/MSIX transition creates a second packaging lifecycle.

This remains viable if packaged native behaviour proves incompatible with
MSIX, but it is not the preferred initial trust model.

## Option D — Signed manual installer with no update mechanism

Create signed versioned installers and require manual reinstall for updates.

Advantages:

- smallest updater attack surface;
- simplest initial packaging implementation; and
- useful as an internal packaging proof.

Disadvantages:

- fails the approved Sprint 29 maintenance and recovery objective;
- leaves Operators on vulnerable or incompatible releases;
- provides no governed channel, failed-update recovery or rollback journey;
- pushes version judgment onto Operators; and
- defers rather than solves operational support.

This is not sufficient for Sprint 29 completion.

# Recommended Architecture

## Release authority

The Release Pipeline owns artifact construction, provenance, SBOM generation
and submission for signing. It does not own Oracle runtime truth.

The signed Release Manifest is the canonical distribution contract. It is
immutable per release. Any artifact, hash, identity, channel, version,
provenance or SBOM divergence is a release failure.

Production signing keys must be non-exportable and held by a Founder-approved
managed signing provider. Automation receives only short-lived, least-
privilege signing authority. No signing secret may be committed, embedded in
an artifact, stored in a renderer or copied to a developer workstation.

## Desktop update authority

Windows package deployment owns installation, replacement, repair and removal.
An instance-owned Desktop Update Coordinator in the Electron main process
owns:

- checking the approved channel;
- validating the Release Manifest and expected package identity;
- projecting renderer-safe availability, progress, failure and recovery state;
- coordinating clean Companion detach and runtime shutdown; and
- requesting the OS-governed update or repair action.

The renderer may request only bounded check, download-consent, restart and
defer controls. It receives no URL, filesystem path, package handle, process
object, signing material or arbitrary install authority.

## Fail-closed rules

Installation or update fails closed when:

- the Release Manifest signature is invalid or absent;
- the MSIX publisher or package identity differs;
- artifact or native-helper hashes differ;
- the channel is not the configured channel;
- the version transition is not authorised;
- required provenance or SBOM evidence is absent;
- the application cannot detach live capture safely; or
- rollback targets are not explicitly allowed and signed.

Downgrade is never a general Operator capability. Recovery may select only a
still-authorised, signed release declared by the current channel contract.

## Local data and uninstall

Normal update and repair preserve the OS-protected refresh-token vault and
required trusted-device metadata.

Uninstall removes Oracle binaries, native helpers, update cache, transient
diagnostics and the local encrypted credential vault. It does not delete the
Operator or authoritative server-owned data. Online trusted-device revocation
must use the existing authenticated Trust & Control lifecycle before removal;
an offline uninstall clears local credentials immediately and leaves remote
revocation observable for later account management. No new retention or
deletion authority is created.

## Release channels

Sprint 29 implements `beta` and `stable` as distinct versioned contracts.
Only `beta` may be exercised locally. Stable publication remains inactive and
unauthorised. Cross-channel update or rollback fails closed.

# ADR-046

ADR-046 — Desktop Distribution, Release Integrity and Update Authority should
establish permanently:

1. Windows package deployment is the installation, update, repair and removal
   authority.
2. The immutable signed Release Manifest is the canonical distribution
   contract.
3. Produced artifacts must mechanically equal the declared Release Manifest.
4. Package, executable and native-helper signatures and hashes are mandatory.
5. Signing identity is non-exportable, externally protected and unavailable to
   source, renderers and runtime Services.
6. Release channels are isolated, versioned and fail closed.
7. The Desktop Update Coordinator is instance-owned and main-process-only.
8. Renderers receive only validated projections and bounded controls.
9. Update and rollback coordinate safe Companion detach and fresh runtime
   construction.
10. Rollback is limited to explicitly authorised signed releases.
11. Update, repair and uninstall local-data behaviour is explicit and
    testable.
12. Production publisher trust, hosting, publication and rollout require a
    separate Founder operational decision.

ADR-040 is not amended. The runtime composition manifest and Release Manifest
govern different contracts and must not be conflated.

# Detailed Sprint 29 Plan if Approved

## Phase 1 — Release contract and threat model

- accept ADR-046;
- inventory binaries, native helpers, runtime assets and local state;
- define the Release Manifest schema and channel rules;
- threat-model signing, update, downgrade, helper replacement and uninstall;
- define production/test identity separation; and
- define clean-machine certification profiles.

## Phase 2 — Least-privilege packaged runtime

- move the Electron host from development URL assumptions to packaged local
  content and approved HTTPS endpoints only;
- enable renderer sandboxing;
- validate every IPC sender and navigation target;
- package native helpers without exposing their paths or handles;
- isolate environment configuration and prove distributable artifacts contain
  no secrets; and
- preserve Desktop Platform API v1 and Guidance v1.

## Phase 3 — Reproducible packaging and release evidence

- create deterministic Windows x64 MSIX packaging;
- prove the pinned Electron release supports the selected MSIX integration or
  perform a separately verified routine dependency update within the approved
  architecture;
- generate SPDX or CycloneDX SBOM evidence;
- generate build provenance and artifact hashes;
- sign executables, native helpers, package and Release Manifest with the test
  identity;
- mechanically compare the package to the Release Manifest; and
- prove unsigned, altered or cross-channel artifacts fail closed.

## Phase 4 — Update, repair, rollback and uninstall

- implement the main-process Desktop Update Coordinator;
- add renderer-safe state and bounded controls;
- coordinate detach, shutdown and fresh-runtime recovery;
- exercise successful and failed update paths;
- exercise authorised rollback and reject arbitrary downgrade;
- exercise repair;
- exercise predictable uninstall and governed local-data removal; and
- verify the Operator identity and authoritative data are unaffected.

## Phase 5 — Clean-machine certification

- install on supported disposable clean Windows profiles;
- verify test publisher identity is visibly distinct from production;
- start, authenticate, attach/detach and recover;
- update, fail, repair, roll back and uninstall;
- verify secrets, permissions, native helpers, provenance and SBOM;
- verify Web remains independent of native authority;
- run the complete repository verification suite; and
- prepare a Founder Acceptance Package with all operational limitations.

# Long-Term Architectural Implications

Option A gives Oracle a second permanent mechanical contract: runtime
composition says what Oracle constructs; release composition says exactly what
Oracle distributes. This prevents packaging scripts or update infrastructure
from becoming informal architecture.

The Windows-native model can later support Store distribution without granting
the Store authority over Oracle truth. Future platforms require their own
packaging profiles beneath ADR-046, not a new runtime architecture.

# Reversibility

The packaging tool and distribution channel are reversible before external
release. The Release Manifest contract, renderer isolation and non-exportable
signing principle should remain permanent.

Package identity and publisher identity become difficult to reverse after
distribution because Windows uses them for trust and update continuity.
Sprint 29 must therefore keep production identity configurable and must not
claim or publish it until the Founder approves the actual signing route and
publisher registration.

# Risks Introduced

- signing identity compromise;
- confused-deputy or renderer-driven update requests;
- downgrade to a vulnerable release;
- packaged-path or native-helper failures;
- MSIX constraints affecting overlay or startup behaviour;
- stale clients after an update-channel outage;
- destructive uninstall of local credentials or diagnostics;
- test certificates being mistaken for production trust;
- accidental embedding of environment secrets; and
- a local signed build being misrepresented as distributed product readiness.

Controls are non-exportable signing, short-lived CI identity, mechanical
manifest equality, OS package verification, isolated channels, explicit
rollback allowlists, test/production identity separation, clean-machine
destructive-path tests and truthful certification language.

# Certification Boundary

Local test signing proves package mechanics, tamper detection, update,
rollback, repair and uninstall. It does not prove:

- ownership or reputation of Oracle's production publisher identity;
- production managed-signing availability;
- public HTTPS update hosting;
- Microsoft Store acceptance;
- external distribution;
- production rollout or rollback; or
- Sprint 30 whole-product qualification.

If production signing infrastructure is unavailable, the Sprint may report
**Operational Signing Certification Deferred — Production Publisher Identity
Unavailable**. That programme status must never promote test signing to
production trust or grant deployment authority.

# Authority Requested

Approval should authorise only:

- Option A and ADR-046;
- Sprint 29 planning and source implementation;
- dependency additions required for approved packaging and verification;
- isolated local test certificates on disposable test machines;
- local Windows packaging and clean-machine certification;
- update, repair, rollback and uninstall tests using local artifacts;
- release-manifest and runtime-manifest verification;
- SBOM and provenance generation; and
- documentation reconciliation.

Approval must not authorise:

- production deployment or publication;
- public or private external distribution;
- production publisher registration or certificate purchase;
- managed signing-service or public update-hosting configuration;
- use of a test certificate as production identity;
- remote push;
- database migrations;
- runtime persistence or persisted producers or consumers;
- Gate C;
- Minecraft certificate promotion or observation activation;
- captured-content, Guidance, conversation or progress retention;
- AI, renderer or updater authority over Oracle truth;
- Guidance v2 or Desktop Platform API v2;
- External Companion trust-boundary changes; or
- weakening ADR-040 through ADR-045.

# External Basis Reviewed

Primary platform sources reviewed on 25 July 2026:

- Microsoft requires installable MSIX packages to be signed and trusted:
  <https://learn.microsoft.com/windows/msix/package/signing-package-overview>
- App Installer supports non-Store automatic update and repair:
  <https://learn.microsoft.com/windows/msix/app-installer/auto-update-and-repair--overview>
- Microsoft compares Store and direct Windows distribution:
  <https://learn.microsoft.com/windows/apps/package-and-deploy/choose-distribution-path>
- Electron documents MSIX-aware main-process updates:
  <https://www.electronjs.org/docs/latest/api/auto-updater/>
- Electron requires renderer sandboxing, context isolation and bounded IPC:
  <https://www.electronjs.org/docs/latest/tutorial/security>
- Electron documents Windows code-signing choices:
  <https://www.electronjs.org/docs/latest/tutorial/code-signing>

# Recommended Founder Decision

Approve Option A, ADR-046 and local Sprint 29 implementation/certification
authority. Preserve production publisher identity, managed signing, hosting,
publication, deployment and push as separate Founder operational decisions.

Do not begin Sprint 29 implementation until that decision is made.
