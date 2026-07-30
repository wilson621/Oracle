# Sprint 30.5 Stage 3 Qualification R5 Preparation Validation Report

**Status:** Passed preparation validation; execution remains unauthorised

**Classification:** Governed engineering record; not qualification evidence

**Programme:** Sprint 30.5 Stage 3 Qualification R5
**Accepted input:** Stage 2 Requalification R2 attempt
`r2-20260728T203503018Z-ec577cf4`

## R4 root cause and minimum correction

R4 failed under Windows PowerShell 5.1 `Set-StrictMode -Version Latest`
because uninstall registry objects without a `DisplayName` member were read as
`$_.DisplayName`. The old predicate was reproduced and raised
`PropertyNotFoundStrict`; read-only development observation also found
legitimate entries without that member.

R5 uses one shared installed-software policy for preflight, qualification and
invariance. It inspects `PSObject.Properties`, ignores missing, null, empty and
whitespace-only names, deterministically stringifies usable non-string values,
preserves valid records and duplicates, sorts with `StringComparer.Ordinal`,
reads native-machine, WOW6432-machine and current-user views, and fails closed
on inaccessible views or null records. StrictMode remains enabled.

## Optional-member and StrictMode audit

`Test-OracleStage3R5OptionalMemberAudit.ps1` parses every reachable production
PowerShell source and classifies each non-static member access as mandatory,
explicitly existence-checked or unsafe. The final audit classified 792 member
accesses with zero unclassified accesses. Its machine-readable result is
regenerated from committed operational sources during transfer construction
and is manifest-bound in the transfer.

## Lifecycle and failure-path audit

`Oracle.Stage3R5PhaseAudit.json` records preconditions, host state, reads,
writes, registry/package/certificate/process activity, success, failure,
teardown, evidence, retry prohibition and next state for all 14 phases:

1. authority-consumed;
2. transfer-verified;
3. host-admitted;
4. untrusted-rejection-passed;
5. trust-established;
6. negative-path-passed;
7. package-installed;
8. runtime-observed;
9. repair-observed;
10. package-removed;
11. trust-removed;
12. transfer-removed;
13. cleanup-passed;
14. evidence-frozen.

The shared lifecycle policy rejects skips and repeats. Failure injection before
every phase proved forward execution stops, retry remains prohibited, the
attempt is preserved and teardown obligations reflect whether trust or package
state may exist.

The production failure path now performs no mutation before authority is
consumed, runs each exact teardown independently, verifies zero package,
certificate and process residue, records the actual completed phases and
preserves the original failure separately from teardown or publication errors.

## Fixtures and development rehearsal

Host-shape fixtures cover present, absent, null, empty, whitespace and
non-string software names; mixed records; duplicates; ordering; all three
registry views; inaccessible views; null records; missing mandatory CIM, TPM,
Defender and continuity members; package/certificate cardinality; and native
window cardinality.

The governed-process policy was tested with success, startup error, signal,
null status and non-zero status envelopes. All five envelopes were captured
before classification, including executable, arguments, UTC timestamps,
stdout, stderr, exit code, signal and process error. Paths with spaces remained
distinct arguments.

The development rehearsal marks every record `NON-QUALIFICATION`,
`NON-AUTHORITY`, `NON-EVIDENCE` and `DEVELOPMENT REHEARSAL`. It exercised the
real identity, installed-software, process and lifecycle policies, traversed
all 14 simulated success phases, injected failure before every phase, tested
create-only archive publication and verified its SHA-256. It consumed no
authority, created no qualification evidence, mutated no host state and
removed its isolated temporary output.

Package installation, trust mutation, registered launch, repair/reset and
removal were necessarily simulated. Their actual Windows surface is checked
by the transfer-bound read-only pre-authority probe on `Founder-QA-01`.

## Pre-authority host probe

The manifest-bound R5 probe runs before authority and attempt identity
creation. It verifies the exact running probe and every transfer byte before
sourcing policy code. It rejects unexpected root or payload files and checks
manifest, custody, sidecars, preparation commit/tree and accepted R2 bindings.

Without host mutation it checks Windows PowerShell Desktop 5.1 x64, cmdlets
and parameters, uninstall registry views under StrictMode, AppX and governed
certificate absence, certificate stores, Secure Boot, TPM, Defender,
activation, recovery, development-tool absence, host identity, continuity,
path isolation, reparse points, certificate time margin, detached CMS signer
identity, untrusted MSIX status and live TCP-provider shape. It emits JSON only
and creates no authority, attempt or evidence.

The approved transfer is copied create-only to a verified isolated local
staging root; the immutable USB is removed before execution and is never used
as `TransferRoot`.

## Prior correction preservation

Executed R2, R3 and R4 preparation validators passed. R5 also preserves
script-scope path capture under `powershell.exe -File`; ordinal case-insensitive
host identity with raw casing; canonical decoded MSIX paths;
`[Content_Types].xml`; duplicate/traversal rejection; complete package
reconciliation; exact certificate identity and CertUtil lifecycle; mandatory
Authenticode `Status = Valid`; package, Release Manifest, SBOM and provenance
bindings; and create-only evidence/archive publication.

## Accepted-artifact rehash

The validator confirmed:

- candidate commit:
  `11475fe01fff2ec69f0188547107f4e901c531d7`;
- candidate tree:
  `1cec636603031aa8f63c8b331aea5bbcb916567d`;
- MSIX SHA-256:
  `6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc`;
- Release Manifest SHA-256:
  `22d11f7273c2721efe032f5fedd956fdd4a2bfb587c55e7f84fde73dad8726ad`;
- qualification archive SHA-256:
  `6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f`;
- final evidence manifest SHA-256:
  `84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d`.

No accepted package or evidence file was changed.

## Executed quality gates

- PowerShell parser, Node syntax and JSON parsing: passed.
- StrictMode installed-software, host-shape and process fixtures: passed.
- Optional-member AST audit: 792 classified, zero unclassified.
- Lifecycle order and per-phase failure injection: 14/14 passed.
- Development rehearsal: 14/14 passed; archive reverified; no residue.
- Accepted package inventory: 2,202 ZIP, 2,201 logical, 70 decoded, zero
  mismatches.
- R2, R3 and R4 preparation regressions: passed.
- Windows PowerShell 5.1 x64 development compatibility: passed; 11 command
  surfaces, actual StrictMode inventory, detached CMS signer, Authenticode and
  TCP provider exercised. This is not host admission.
- Returned-archive fixture: inventory, final lifecycle, completion and evidence
  bindings passed; mismatched manifest rejected.
- TypeScript semantic validation, focused/full ESLint and architecture audit:
  passed; 455 TypeScript files and no new unexpected boundary violation.
- `git diff --check`: passed.

PowerShell Script Analyzer was unavailable and was not installed or
substituted. Parser validation, StrictMode fixtures, the AST audit, policy
tests and the target pre-authority probe are the compensating controls.

## Adversarial review findings

The review found and corrected reachable deterministic hazards:

- mandatory audit JSON members lacked explicit existence checks;
- policy code could be sourced before transfer verification;
- pre-authority failure could enter mutation-capable teardown;
- one teardown failure could suppress later cleanup;
- failure recording used an out-of-scope phase variable and could hide the
  original error;
- network-provider errors could be interpreted as zero connections;
- preflight checked `Compress-Archive Path` while production uses
  `LiteralPath`;
- returned archive content was not independently inspected;
- untrusted MSIX Authenticode can return `UnknownError` without a usable signer;
  R5 extracts the exact public certificate from the bound detached CMS and
  still requires exact MSIX signer identity after trust yields `Valid`;
- documentation did not distinguish the removable local transfer copy from
  the immutable USB directory.

All are regression-covered. No credible unresolved deterministic harness
defect remained at this validation checkpoint.

## Validation boundary

Executed validation is identified above. The 14-phase rehearsal is simulated;
static analysis covers source contracts and member access. Only
`Founder-QA-01` can validate live host identity and continuity, target
providers, security state, package/certificate/tool absence, path eligibility
and current certificate margin. Those checks must pass before authority
creation.

Stage 3 execution, authority creation, continuity collection, package
installation, certificate trust and qualification evidence generation remain
unauthorised by this preparation record.
