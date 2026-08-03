# Sprint 30.5 Packaged Server Environment Correction

**Status:** Engineering complete; non-qualification validation passed
**Authority:** Existing bounded ADR-048 product-baseline correction authority
**Classification:** Engineering implementation and validation record
**Qualification executed:** No
**Authority, attempt or evidence created:** No
**Date:** 3 August 2026

## Finding

The accepted Stage 2 R4 package starts the packaged Next.js server through
Electron utility-process forking with an explicit, secret-minimised
environment. Source review confirmed that the map contained the four admitted
ADR-048 runtime values plus NODE_ENV, HOSTNAME and PORT, but omitted the
Windows SystemRoot required by the packaged Windows utility-process launch
boundary.

Spreading the parent process environment would have admitted ambient provider
values, execution state, tool paths and unrelated secrets into the privileged
server child. The correction therefore preserves the strict allowlist and
admits only one validated operating-system dependency.

## Implementation

The packaged-server environment policy now constructs the complete child
environment and fails closed unless:

- the platform is Windows and the loopback port is a safe integer in the TCP
  port range;
- the runtime object has exactly the four ADR-048 keys and every value is a
  non-empty string;
- SystemRoot is absolute and contains an unredirected physical Windows root
  plus System32\bcrypt.dll; and
- the root, system library and their real paths are regular and not symbolic
  links.

The returned frozen environment contains exactly:

- ORACLE_SUPABASE_URL;
- ORACLE_SUPABASE_ANON_KEY;
- ORACLE_WEB_SESSION_SECRET;
- SUPABASE_SECRET_KEY;
- SystemRoot;
- NODE_ENV;
- HOSTNAME; and
- PORT.

No PATH, TEMP, TMP, NEXT_PUBLIC provider value, qualification output path or
other ambient process value is inherited. The packaged server uses this
constructor directly; missing or invalid Windows identity stops startup.

## Validation

The installed-runtime configuration suite, desktop compilation and focused
ESLint passed. Regression coverage proves the exact frozen key set; hostile
ambient PATH, public-provider and qualification-output exclusion; and extra
runtime-key, invalid-port, non-Windows-platform and missing-SystemRoot
rejection. The installed-runtime suite continues to pass all twelve
configuration rejection cases, create-only restricted-ACL policy fixtures,
secret-free admission, tamper and partial-consumption rejection, and zero
residue. Git whitespace validation also passes.

Full repository lint, TypeScript semantic checking, the 463-file architecture
audit, production Next.js build, desktop compilation and the real standalone
runtime rehearsal also pass.

The historical Sprint 29 verifier was executed and was not reported as passed.
Its current release-contract portion passed, then it stopped non-zero because
the immutable Sprint 29 provenance binds package-lock SHA-256
ce49d65c5fab06d53e06543eebd06a0eec3f89bececac60f1f238c1a0c5251a9
while the unchanged current package lock hashes to
8948f6d1128e02217805fc88f8fa057740a4e6040106252b041f573934769adf.
The correction changes neither file, and the historical release artifact was
not rewritten to manufacture a pass.

## Qualification consequence

Stage 2 R4 attempt r4-20260803T115002258Z-31ab0bf6, its package and its evidence
remain Founder-accepted, formally closed and immutable for exact product commit
f7203f9b602b182a2bd006bc3cff3113b839be8e. This correction is a later
product-source change, so the permanent invalidation rule returns the current
product baseline to Stage 2 qualification.

Stage 3 Requalification R10 remains an R4-bound preparation record. It must
not be transferred or executed as qualification of the corrected source. A
new Stage 2 candidate revision must first qualify the correction; clean-host
and installed-authentication requalification must then bind the newly accepted
exact package before Stage 5 can resume.

This engineering work creates no qualification authority, attempt, package or
evidence and grants no Stage 3, Stage 4, Stage 5, production, publication,
deployment or release authority.
