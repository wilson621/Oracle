# Sprint 29 Evidence

This directory records durable evidence summaries for the local Sprint 29
certification. Large MSIX artifacts, the public test certificate and all
private signing material remain outside source control.

- `release-certification.json` records the mechanically verified package,
  signature, SBOM, provenance and trust-boundary result.
- `lifecycle-certification.json` records current-host install, invalid-update
  rejection, update, startup, repair, rollback, uninstall and cleanup.

The source of truth for reproducibility is the committed builder and
verification harness. The package itself was not published, distributed,
deployed or pushed.
