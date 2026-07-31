# Sprint 30.5 Stage 2 Requalification R3 — Pre-Execution Gate

**Status:** First attempt consumed and failed; corrected harness requires review, commit and separate new Founder authority
**Gate owner:** Founder
**Required candidate:** `a7fc67f207d9c95407c70812828fa66bd487285d`
**Required tree:** `356f6d52f1bf70065692e892af8bf916acc8727a`

## Gate purpose

This gate separates R3 preparation from any qualification attempt. Completing,
validating or committing the R3 harness does not create execution authority.

## Required preparation evidence

Before a Founder execution decision, engineering must prove:

- R3 plan, contract, harness and validator are committed and pushed;
- the preparation commit contains no product or packaging change relative to
  the exact candidate;
- branch and remote bindings are explicit and the execution worktree can begin
  clean;
- the isolated Stage 4 R1 draft remains recoverable outside the R3 worktree and
  is absent from the preparation commit;
- exact candidate commit/tree and Migration 011/012 hashes are contract-bound;
- R2 and Stage 3 R9 immutable archives, manifests and closure records pass
  their exact SHA-256 bindings;
- authority and attempt namespaces are unique, create-only and non-reusable;
- traversal, reparse, pre-existing-output and partial-state fixtures pass;
- source, build, package, signing, evidence and archive phases have one ordered
  entry point and cannot be invoked independently;
- exact certificate selection, trust, signature verification and teardown
  fixtures pass, including process startup/error/signal/null/nonzero failures;
- package, governed certificate and private signing residue is zero before
  execution;
- all non-qualification preparation validation passes; and
- no R3 authority, attempt, qualification evidence or package has been created.

## Separate Founder decision required

A later Founder prompt must bind:

- one committed R3 harness commit and tree;
- the exact candidate commit and tree above;
- authority for the governed wrapper to generate one canonical UTC timestamp
  and one cryptographically random identity;
- one unique generated `r3-...` attempt ID and its exact matching
  `authority-r3-...` authority ID;
- the required machine, package, output root and authority token; and
- authority for exactly one governed execution.

Only `invoke-attempt.ps1` may translate that decision into one internal
executor invocation. A failed gate must stop
before authority or attempt creation. A failed execution must preserve its
attempt and stop after governed safety teardown. No retry is implied.

## Explicit exclusions

This gate does not authorise R3 execution, Stage 4 execution, production
signing, production trust, publication, distribution, deployment, release,
commit amendment, force-push or mutation of accepted/historical evidence.
