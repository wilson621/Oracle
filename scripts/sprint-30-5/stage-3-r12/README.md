# Sprint 30.5 Stage 3 Requalification R12 Harness

R12 is the engineering-only successor to immutable failed R11 under programme `Sprint 30.5 Stage 3 Requalification R12`. It continues to bind only the accepted Stage 2 R6 package. R9 remains accepted passing history; R11 and every prior transfer/evidence tree remain immutable.

The correction addresses the asynchronous post-reset package-data lifecycle. Before reset the harness snapshots exact AppX identities. After reset it waits for one exact registration using a bounded 120-poll, 250-millisecond policy; the package root may be absent or may reappear during stabilization. It then invokes `Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily` and requires the returned `LocalFolder` to equal the exact expected `LocalState` without reparse traversal before creating the second attempt-bound configuration. Manual root creation and unconfigured bootstrap activation are forbidden.

Non-qualification engineering validation:

```powershell
npm.cmd run sprint-30-5:stage-3:r12:validate
npm.cmd run sprint-30-5:stage-3:r12:rehearse
```

The first R12 transfer is immutable pre-authority engineering failure `transfer-stage3-r12-20260803T190836740Z-2b8363bb`. The replacement preparation uses the exact Founder-bound manifest as the complete payload inventory authority and a contract-defined mandatory subset as a fail-closed floor. The physical payload directory must equal the manifest and every manifested file is size/hash verified.

No R12 transfer, return or execution entry point is exposed through `package.json`. Direct token-gated construction of one fresh, create-only replacement transfer is authorised. Qualification authority creation and execution are not authorised and remain fail closed.
