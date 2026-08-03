# INSTALLED PACKAGE RUNTIME CONFIGURATION

**Authority:** ADR-048 and the Founder-authorised bounded product-baseline correction
**Scope:** Local-qualification configuration of the registered Oracle MSIX
**Owner:** Oracle Desktop and Qualification Engineering
**Status:** Implemented; requalification required
**Classification:** Living architecture
**Last Reviewed:** 3 August 2026
**Contract:** `oracle.installed-runtime-configuration` version 1

---

# Decision

The registered Oracle AppX activation path receives two non-secret arguments:

- the absolute path of one attempt-scoped runtime configuration; and
- the SHA-256 of the exact file bytes.

The file exists only under:

```text
%LOCALAPPDATA%\Packages\<exact package family>\LocalState\Oracle\
  QualificationRuntime\<runtime configuration identity>\runtime.json
```

The Electron main process atomically renames, validates, consumes and deletes
the file before it starts the packaged Next.js server. Missing configuration
does not start a fallback product. Invalid or stale configuration fails closed.

# Contract and bindings

The exact JSON object contains no optional or additional members. It binds:

- contract name and version;
- `local-qualification` purpose;
- one matching Founder grant, authority, attempt and runtime-configuration
  identity;
- issue and expiry timestamps with a maximum fifteen-minute lifetime;
- exact package identity and observed package family;
- candidate commit, tree and MSIX SHA-256;
- exact loopback disposable-provider origin;
- public provider key;
- server-only provider service credential; and
- server-only web-session integrity secret.

The activation arguments bind the raw JSON bytes through SHA-256. The product
rejects duplicate or unknown Oracle activation arguments, wrong paths,
traversal, symlink/junction redirection, non-regular files, unexpected object
members, malformed identities, mismatched identities, invalid timestamps,
non-loopback qualification providers and malformed credentials.

# Secret custody

The service credential and web-session secret:

- are generated and held by the governed qualification lifecycle;
- enter neither source control nor package bytes;
- are written once into the package-specific LocalState namespace under a
  protected current-user/SYSTEM/Administrators DACL;
- are never placed on the AppX command line;
- are never included in the secret-free admission record;
- are read only by the installed package main process;
- are projected only into the packaged Next.js server child process;
- are never projected into HTML, browser metadata, renderer bundles, IPC,
  diagnostics, stdout, stderr or qualification evidence; and
- are removed when the main process consumes the file or by exact-path/hash
  teardown if startup does not consume it.

The Supabase service credential remains server-only. Only the provider URL and
public anonymous key are rendered into exact, unique HTML metadata for the
browser client. The web-session secret remains available only to the server
session-integrity policy.

No production credential or endpoint is authorised by this contract.

# Next.js runtime boundary

Direct client references to `process.env.NEXT_PUBLIC_*` are prohibited for
this boundary because the installed Next.js version freezes those references
at build time. The installed server reads the `ORACLE_SUPABASE_*` pair through
indexed dynamic lookup. Source-hosted development retains the existing
`NEXT_PUBLIC_SUPABASE_*` pair through the same server policy; partial or
conflicting dual configuration fails closed. The root layout calls
`connection()`, renders the public values at request time, and exposes only
those values through fixed metadata names. The browser Supabase client requires
exactly one value for each metadata name.

Server Supabase clients use the same validated runtime source. The trusted
server client separately requires the server-only service credential.

# Lifecycle

1. The package is installed and its exact family identity is observed.
2. The governed harness proves observed package and candidate bindings match
   the separately supplied contract expectations, then proves the target
   LocalState ancestry is not reparse-directed and that the attempt namespace`n   does not exist.
3. It creates the attempt directory, applies the restricted DACL and writes
   `runtime.json` with `FileMode.CreateNew`.
4. It hashes the exact bytes and emits a secret-free admission record.
5. Direct `IApplicationActivationManager::ActivateApplication` activation
   carries only the quoted path and hash.
6. Electron atomically renames the file to a PID-specific consuming name.
7. Electron verifies the physical root, digest, schema, internal execution
   identities, package-family path, provider and time window.
8. Electron deletes the consuming file before starting the packaged server.
9. Runtime public values reach the renderer only through fixed metadata.
10. Teardown removes only an unconsumed exact-path file after exact hash
    verification, removes its empty attempt directory and requires zero
    residue.

Any failure stops startup or qualification. A new execution requires new
Founder authority and new identities; configuration is never regenerated for
a consumed attempt.

# Threat model

The boundary prevents:

- secrets frozen into immutable MSIX bytes;
- dependence on AppX environment inheritance;
- machine-global mutable configuration;
- stale or cross-attempt reuse;
- path substitution and common reparse redirection;
- ambiguous additional JSON or activation arguments;
- non-loopback local-qualification provider substitution;
- renderer access to service or session credentials;
- fallback-page substitution for authenticated product behavior; and
- silent cleanup of a file whose bytes differ from the admitted hash.

The boundary does not claim to resist the current user, local administrators,
SYSTEM or a fully compromised host. Those principals already control the
qualification process or machine. Host admission, process ownership, network
isolation, disposable-provider provenance and final residue verification
remain separate mandatory controls.

# Requalification impact

This is a product-source and installed-runtime trust-boundary change after the
accepted Stage 2 R3 candidate freeze. Historical Stage 2 R3, Stage 3 R9 and
Stage 4 R1 evidence remains accepted and immutable, but cannot qualify the new
package bytes.

Before Stage 5 execution, governance requires:

1. a new Stage 2 candidate revision to build, sign and reconcile the changed
   package;
2. clean-host package lifecycle qualification of that exact candidate with
   the configuration boundary active;
3. live authentication and protected-rendering requalification using the
   installed package and the same disposable-provider boundary; and
4. a refreshed Stage 5 preparation binding only to the newly accepted results.

No qualification or later-stage authority is created by this implementation.

# Packaged server environment allowlist

The Electron utility-process child does not inherit the ambient parent-process
environment. Its frozen environment contains only the four validated ADR-048
runtime values, NODE_ENV, HOSTNAME, PORT and SystemRoot.

SystemRoot is the sole admitted operating-system dependency. The product
requires Windows, an absolute root, a regular unredirected root directory, a
regular unredirected System32\bcrypt.dll and matching physical real paths.
Missing, redirected or invalid identity fails startup closed. PATH, TEMP, TMP,
NEXT_PUBLIC provider values, qualification state and every other ambient value
remain excluded.

This policy was added after accepted Stage 2 R4. R4 remains immutable accepted
history for its exact package, but does not qualify the corrected current
source. The R4-bound Stage 3 R10 preparation must not be transferred or
executed for the corrected source; qualification returns to Stage 2.
