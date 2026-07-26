# Sprint 30 Phase 4 Warning Register

| ID | Severity | State | Warning and disposition |
| --- | --- | --- | --- |
| W-001 | High | Deferred | Clean disposable Windows evidence is unavailable. Sprint 30 completion remains blocked; no clean-machine claim is allowed. |
| W-002 | High | Unavailable | Live Supabase Auth/GoTrue Email + Password qualification has no authorised local provider. It is not passed and no production endpoint or credential may substitute. |
| W-003 | High | Open governance dependency | Immutable Sprint 29 package declares Runtime Manifest `1.6.0`; source declares `1.7.0`. Rebuild or test signing needs separate Founder authority before integrated qualification. |
| W-004 | Medium | Explicit continuity risk | The local branch is ahead of its remote. Push is not authorised; recovery depends on the local repository and existing workstation safeguards. |
| W-005 | Medium | Unavailable | Installed Electron GPU-process measurement depends on the deferred disposable Windows environment and is not passed. |
| W-006 | Informational | Governed | Minecraft remains `provisionally-certified`, observation disabled and operational certification deferred. |

No open critical or high-severity source finding was created by Phase 4.
The high-severity entries above are qualification or governance blockers, not
software defects, and none is converted into a pass.
