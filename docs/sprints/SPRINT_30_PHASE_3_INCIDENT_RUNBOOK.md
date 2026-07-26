# Sprint 30 Phase 3 — Local Incident and Recovery Runbook

**Scope:** Isolated local qualification only
**Production authority:** None
**External reporting:** None
**Retention:** None

---

# Purpose

This runbook governs the Phase 3 synthetic runtime-failure exercise. It does
not establish a production incident process, telemetry provider, upload path
or retained support record.

# Response Sequence

1. Detect the failure through the renderer-safe Platform health projection.
2. Confirm the affected subsystem and required/optional classification without
   exposing raw diagnostic envelopes or failure payloads to the renderer.
3. Keep required failures closed. Isolate optional or local-sink failures in
   an observable degraded state.
4. Stop the affected runtime. Stopping clears the bounded transient diagnostic
   sink.
5. Construct a fresh composition, runtime, registries and Operational
   Diagnostics instance.
6. Revalidate exact Runtime Manifest equality and required subsystem health.
7. Resume only when the fresh runtime reaches `ready` or an explicitly
   permitted observable `degraded` state.
8. Keep production, persistence, upload, deployment and Gate authority closed.

# Evidence Boundary

The exercise records only fixed result classifications and aggregate metrics.
It never records raw frames, screenshots, clips, credentials, tokens, prompts,
provider responses, Operator identity, gameplay content, Oracle Evidence,
Understanding, Memory or authoritative state.

# Escalation Conditions

Stop and return for Founder review if recovery would require an external
provider, upload, retention, a new trust boundary, production credentials,
production persistence, deployment, Gate progression or a weakened
diagnostic-admission policy.
