# Sprint 30.5 Stage 2 Requalification R7 Harness

This directory is the versioned preparation infrastructure for Sprint 30.5 Stage 2 Requalification R7.

R7 binds corrected product commit 4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d, tree 1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a. The candidate corrects the Stage 5 accessibility finding without changing the provider, runtime-configuration, packaging, or authentication architecture. A later preparation commit may change only the R7 harness and living governance files. Candidate-to-harness changes in governed product or packaging inputs are rejected.

Preparation grants no transfer, build, package, signing, certificate-mutation, authority, attempt, or qualification authority. invoke-attempt.ps1 remains the sole future Founder-facing operational entry point. It requires a separately granted exact token FOUNDER-AUTHORISED-STAGE-2-R7-SINGLE-ATTEMPT; no current authority permits invoking it.

A future authorised attempt uses new create-only R7 roots:

- .artifacts/sprint-30-5/stage-2-requalification-r7/<attempt-id>/
- docs/sprints/evidence/sprint-30-5/stage-2-requalification-r7/<attempt-id>/

The contract hash-binds the accepted Stage 2 R6, Stage 3 R12, and Stage 4 R4 indexes and closure records and deny-lists every existing Stage 2 and Stage 3 namespace. Those accepted results remain immutable historical evidence for their exact R6 package, but they do not qualify the corrected R7 candidate.

The governed source matrix now requires accessibility:color:verify before architecture and production-build gates. It rejects any product text-slate-500 foreground or the exact failed Companion CSS colour and binds the validated accessible-foreground inventory.

Preparation validation entry points are:

- node scripts/sprint-30-5/stage-2-requalification-r7/verify-harness-static.mjs
- node scripts/sprint-30-5/stage-2-requalification-r7/verify-runtime-configuration-custody.mjs
- Windows PowerShell 5.1 verify-execution-identity.ps1

A future execution decision must bind the exact committed preparation HEAD and tree. A passing attempt would stop at complete-awaiting-founder-review; it would not accept R7 or authorise Stage 3, Stage 4, Stage 5, production, publication, or deployment.