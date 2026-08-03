# Sprint 30.5 Stage 3 Requalification R12 Harness

R12 is the engineering-only successor to immutable failed R11 under programme `Sprint 30.5 Stage 3 Requalification R12`. It continues to bind only the accepted Stage 2 R6 package. R9 remains accepted passing history; R11 and every prior transfer/evidence tree remain immutable.

The correction addresses the asynchronous post-reset package-data lifecycle. Before reset the harness snapshots exact AppX identities. After reset it waits for one exact registration using a bounded 120-poll, 250-millisecond policy; the package root may be absent or may reappear during stabilization. It then invokes `Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily` and requires the returned `LocalFolder` to equal the exact expected `LocalState` without reparse traversal before creating the second attempt-bound configuration. Manual root creation and unconfigured bootstrap activation are forbidden.

Non-qualification engineering validation:

```powershell
npm.cmd run sprint-30-5:stage-3:r12:validate
npm.cmd run sprint-30-5:stage-3:r12:rehearse
```

No R12 transfer, return or execution package entry point exists. The contract and operational entry points also fail closed because transfer construction and qualification execution are not authorised. A later qualification requires a new explicit Founder mission.
