# Sprint 30.5 Stage 2 Requalification R3 — Preparation Implementation

**Status:** Preparation complete and validated; awaiting commit authorisation
**Execution:** Not authorised

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
