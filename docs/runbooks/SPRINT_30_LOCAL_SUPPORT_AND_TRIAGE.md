# Sprint 30 Local Support and Triage Runbook

This runbook covers local qualification support only. Operational Diagnostics
is non-authoritative software-support data. It must never become Evidence,
Understanding, Memory, coaching input, planning input, progression input or
Oracle Truth.

## Intake safety

Never request passwords, refresh tokens, session tokens, production
credentials, raw frames, screenshots, clips, gameplay observations, Guidance
history, conversation content or private Operator data. Do not ask an Operator
to weaken authentication, privacy, consent, renderer or trust boundaries.

Use only the allowlisted renderer-safe health projection, exact local commit,
Runtime Manifest version, target, Windows version and reproducible action.
Diagnostic delivery, upload and retention remain disabled.

## Triage

| Level | Meaning | Local response |
| --- | --- | --- |
| Severity 1 | Security/trust-boundary breach, authoritative-state corruption, prohibited capture/retention or production impact | Stop testing, preserve only minimised non-sensitive facts, and escalate immediately for Founder/security review. |
| Severity 2 | Required subsystem cannot start, recovery fails, data deletion/restore fails, or manifest equality diverges | Stop the affected phase, reproduce locally, and escalate to the owning architectural boundary. |
| Severity 3 | Bounded feature or optional subsystem degradation with a safe fallback | Record the degraded state, confirm fail-closed behaviour, and assign corrective engineering work. |
| Severity 4 | Cosmetic, documentation or low-impact usability issue | Record and schedule without overstating qualification. |

## Escalation boundary

Escalate to the Founder before any proposed architecture, trust-boundary,
security-model, production, deployment, signing, publication, persistence,
external-provider or Gate decision. A missing environment remains deferred or
unavailable. Support must not manufacture evidence by using production
credentials, external uploads or an unapproved substitute environment.

## Recovery and closure

Use the Phase 3 incident and recovery runbook for fresh-runtime recovery,
PostgreSQL backup/restore/deletion and Sprint 29 rollback mechanics. Close a
support item only after its stated reproduction and verification passes.
Record limitations separately from defects and never infer operational support
from a local pass.
