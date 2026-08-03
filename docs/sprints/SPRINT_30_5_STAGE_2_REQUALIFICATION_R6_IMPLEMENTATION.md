# Sprint 30.5 Stage 2 Requalification R6 Implementation

Status: **FOUNDER-ACCEPTED AND FORMALLY CLOSED**

R6 is a versioned derivation of R5. It preserves the complete wrapper-only, single-authority, deterministic build, package-secrecy, exact-signature, exact-certificate teardown, create-only evidence and fail-closed lifecycle model.

## R6 changes

- unique `0.1.4.0` package, R6 signer, authority/attempt and output identities;
- immutable protection for the entire R5 artifact root;
- exact hashes for R5 authority, attempt, terminal failure, lifecycle failure, teardown, failed MSIX and analysis records;
- corrected AppxManifest version assertion;
- a static positive requirement for `0.1.4.0` and negative regression for stale `0.1.2.0`;
- R6 plan, gate and preparation validation records.

No product source or accepted historical evidence is modified.
