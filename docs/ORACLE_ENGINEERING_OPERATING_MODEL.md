# ORACLE ENGINEERING OPERATING MODEL

**Authority:** Constitutional engineering operating model beneath the Oracle Platform Constitution and Oracle Engineering Principles
**Scope:** Engineering authority, evidence, lifecycle, qualification and delivery control
**Owner:** Founder and Oracle Engineering
**Status:** Active
**Classification:** Stable
**Expected Stability:** Changes only through explicit Founder approval
**Supersedes:** Informal operating conventions demonstrated during Sprint 30.5 Stage 2 Requalifications R1 and R2
**Superseded By:** None
**Established:** 28 July 2026
**Version:** 1.0

---

# Purpose

The Oracle Engineering Operating Model (OEOM) defines how Oracle engineering
work is authorised, performed, evidenced, reviewed and closed.

OEOM is subordinate to the Founding Charter, The Oracle Way, the Oracle
Platform Constitution and the Oracle Engineering Principles. It does not
create product authority or an architectural exception. The Oracle Codex and
Oracle Engineering Governance apply this model operationally.

# Roles and authority

- The **Founder** owns governance decisions, activation, material scope,
  qualification execution, evidence acceptance, closure, deployment and
  release gates.
- The **Chief Architect** owns architectural interpretation, boundary
  coherence and recommendations within Founder authority.
- The **Lead Engineer** owns evidence-led investigation, implementation,
  validation, critical review and accurate reporting within the granted scope.

Authority is explicit, bounded and non-transitive. Authority for preparation
does not authorise execution. Execution does not imply acceptance. Acceptance
does not imply closure. Closure does not imply deployment or release.

# Governed lifecycle

Every governed engineering objective proceeds through the applicable states:

```text
investigate
  -> decide and authorise
  -> prepare
  -> implement
  -> validate
  -> critically review
  -> commit and, when authorised, push
  -> execute qualification
  -> reconcile evidence
  -> Founder acceptance
  -> formal closure
```

A state may be skipped only when it is demonstrably inapplicable and the
governing plan records why. A commit is a checkpoint, not proof that the
objective is complete.

# Evidence is the highest engineering authority

Claims must be supported by inspected implementation, deterministic
verification or immutable execution evidence. Names, intent, green partial
checks and missing results do not establish a pass.

Evidence must bind the identities necessary to reproduce and review the claim,
including as applicable:

- programme, revision, authority and attempt;
- branch, commit, tree, candidate and harness;
- machine, operating system and toolchain;
- package, manifest, SBOM, provenance and hashes;
- signer, certificate, trust stores and validity window;
- lifecycle state, stop reason, inventory and final evidence hash.

Unknown, malformed, incomplete, conflicting or unavailable mandatory evidence
fails closed. It is never inferred as successful.

# Immutable history and attempt isolation

Accepted evidence and every completed, failed, stopped or interrupted attempt
are immutable historical records.

New work uses a new versioned programme or revision and a unique authority and
attempt identity. Governed destinations are attempt-scoped, create-only and
atomically published. Existing destinations are never reused, replaced,
normalised or repaired in place.

Historical paths are deny-listed by current tooling. Symlink, junction,
reparse-point, traversal, alias or case-normalisation escape fails closed.
Corrections create new implementation and new evidence; they do not rewrite
the record that exposed the defect.

# Fail-closed execution

Governed tooling must:

- validate authority, ordering, identities and prerequisites before mutation;
- expose one ordered lifecycle rather than independently runnable destructive
  phases;
- capture command, arguments, timestamps, output, status, signal and process
  errors;
- stop at the first mandatory failure;
- never retry automatically or manufacture a replacement attempt;
- preserve the original failure while performing only authorised safety
  teardown;
- make success impossible until all required assertions and final invariance
  checks pass.

Unexpected state is a failure, not an invitation to broaden cleanup or
authority.

# Security, trust and machine mutation

Product, package, certificate, trust, installation, migration and deployment
actions require specific authority.

Temporary certificates are local-test-only, identity-bound and selected by
exact thumbprint. Trust and private material are removed by exact identity,
never by subject, prefix, wildcard or broad store action. Final zero-residue
verification is mandatory.

Production credentials, signing identities, endpoints, data and trust are
never substituted into local qualification.

# Separation of engineering states

Oracle distinguishes:

- implemented;
- validated;
- qualified;
- Founder-accepted;
- formally closed;
- deployed;
- activated;
- released.

No state implies a later state. Living status records must use these terms
precisely and preserve limitations, unavailable evidence and residual risk.

# Defect handling

Investigation precedes correction. The first evidenced failure is diagnosed
without speculative product changes or weakened gates.

An in-scope defect may be corrected only within current authority. The
affected validations are rerun and the complete changed path is critically
reviewed. Product, architecture, trust-boundary or governance decisions stop
for the appropriate authority.

# Qualification and closure

Qualification requires a versioned plan, contract, deterministic harness,
explicit execution authority, immutable attempt evidence and complete
teardown. One authority identity governs one attempt.

After execution, evidence is independently reconciled. The Founder alone
accepts the evidence. Formal closure records the accepted identities, hashes,
limitations and next gate. Qualification never silently authorises a later
stage.

# Terminal states

A governed mission ends only as:

- **PASS** - every authorised objective and closure requirement is proven;
- **FOUNDER DECISION REQUIRED** - a genuine governance choice or new authority
  is necessary; or
- **EXTERNAL BLOCKER** - an external condition prevents safe progress.

Difficulty, elapsed time, a commit or partial success is not a terminal state.

# Required final invariance

Before completion, verify:

- local and remote source identities where push is required;
- working tree and index state;
- expected evidence and hashes;
- historical-evidence integrity;
- package, process, listener, certificate, trust and private-material residue;
- that prohibited later-stage, production, deployment and release actions did
  not occur.

The final report states what changed, what passed, what remains unauthorised
and the exact next governed operation.

# Mission recovery

If execution is interrupted by a model reset, environment loss, development
environment restart, machine reboot or similar event, the Lead Engineer shall:

- recover the repository state;
- determine completed and outstanding work;
- validate recovered work;
- continue the authorised mission;
- avoid repeating or undoing valid engineering; and
- return only when the original mission reaches a terminal state.
