# Sprint 30.5 Stage 2 Requalification R3 — Preparation Implementation

**Status:** Founder-accepted and formally closed
**Execution:** Completed by accepted attempt `r3-20260731T171651908Z-9a8a2532`

## Implementation

The R3 harness is versioned under
`scripts/sprint-30-5/stage-2-requalification-r3/` and retains the proven R2
ordered lifecycle, exact-certificate trust/teardown model, create-only evidence
publication and immutable failure handling.

R3-specific controls add:

- exact candidate commit and tree enforcement;
- exact Migration 011 and Migration 012 SHA-256 bindings;
- split candidate/harness identity with product-path equality enforcement;
- R3-specific authority token, attempt, certificate, package, artifact and
  evidence namespaces;
- accepted R2 and Stage 3 R9 historical-evidence hash preflight;
- expanded historical root deny-list including R2 and Stage 3 R9;
- no standalone attempt-preparation entry point; and
- no R3 `package.json` script, preserving byte identity of the candidate
  product inputs.

## Failed-attempt correction

The immutable first attempt
`r3-20260731T163246422Z-00000000` exposed two harness defects. Direct Node
invocation did not populate npm's `npm_execpath`, so candidate freeze could
not resolve npm despite the approved installation being intact. The executor
now binds npm and npx to the exact contract-versioned npm package installed
beside the exact Node executable, and invokes each CLI as an argument to that
Node executable.

The original external identity command used the .NET Core static
`RandomNumberGenerator.Fill` surface, which Windows PowerShell 5.1 does not
provide. Its non-terminating method error left a zero-initialised byte array
and produced the prohibited suffix `00000000`. The governed
`invoke-attempt.ps1` wrapper now uses the Windows PowerShell 5.1-compatible
instance `GetBytes` API under terminating-error semantics, rejects null,
wrong-length and all-zero entropy, and generates a matching authority/attempt
pair only after repository preflight. The internal executor now rejects direct
invocation unless the parent-bound governed-wrapper protocol is present and
records that invocation surface in the initial attempt record. Future failed
executions also publish a create-only terminal failure outcome binding the creation, authority and
lifecycle records and recording residue verification.

## Stage 4 draft isolation

The unrelated Stage 4 R1 preparation draft was removed from the R3 worktree
without loss using stash object
`d554bf884b9d7657bc193b7b965cb251ab4337fd` and durable local reference
`refs/oracle/isolation/stage4-r1-draft-before-stage2-r3`. A disposable short-path
worktree restore proved every tracked and untracked draft file against its Git
blob identity. The draft is not part of the R3 candidate or preparation change.

## Validation boundary

Preparation validation is static, fixture-backed and non-qualification. It may
parse scripts, validate JSON, exercise lifecycle and create-only fixtures, hash
immutable inputs and run repository semantic checks. It must not build Oracle,
create an MSIX, create or trust a certificate, create authority/attempt state,
sign artifacts or generate qualification evidence.
