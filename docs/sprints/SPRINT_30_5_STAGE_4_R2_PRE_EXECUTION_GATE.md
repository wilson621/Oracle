# Sprint 30.5 Stage 4 Requalification R2 Pre-Execution Gate

**Status:** Prepared; execution remains unauthorised
**Classification:** Non-qualification / non-authority / non-evidence / read-only
**Last Reviewed:** 4 August 2026

Before any R2 authority can exist, the committed preflight must verify the exact R6
candidate, tree, MSIX, Release Manifest, public certificate and accepted R6/R12/R1
historical hashes; the reviewed R2 preparation commit/tree and clean repository;
Administrator context; exact approved tool paths, real paths, hashes, versions and
reparse-free ancestry; exact provider images and free ports; zero Oracle package,
certificate, process, package-data, runtime-configuration and disposable-provider
state; create-only evidence and return roots; and no active IPv4 or IPv6 default
route.

The preflight writes only a create-only non-evidence record and sidecar. It cannot
mint authority. A future Founder execution decision must bind one fresh grant, the
reviewed preparation commit/tree, a preflight no older than 15 minutes, its exact
path and SHA-256, and the contract's single-execution token. The executor rechecks
these facts before consuming authority.

Current `Oracle.Stage4R2Contract.json` deliberately records Founder execution,
authority creation and attempt execution as false. The qualification wrapper fails
closed before creating an authority or attempt while those values remain false.

Immediately before a future gate, the host owner must disconnect NordLynx and
Ethernet, or otherwise remove every active `0.0.0.0/0` and `::/0` route. The harness
verifies but never changes network configuration.
