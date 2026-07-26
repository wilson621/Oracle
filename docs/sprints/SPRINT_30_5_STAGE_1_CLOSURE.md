# Sprint 30.5 Stage 1 — Environment Admission Closure

**Status:** Founder-accepted and closed
**Closed:** 26 July 2026
**Scope:** Environment Admission only
**Stage 2:** Not started and not authorised
**Production:** Unchanged

## Founder decision

The Founder accepted the complete Stage 1 evidence chain and directed formal
closure. Stage 1 must not be reopened unless new evidence demonstrates a
genuine qualification defect.

## Accepted outcome

The ASUS ROG Zephyrus G15 is accepted as a controlled non-pristine physical
qualification host. It must not be represented as pristine or as satisfying
the separate clean Windows qualification required before production
certification.

Installed Node.js, npm, Python, .NET and Visual Studio Build Tools were
inventoried. The standalone Stage 1 path used Windows PowerShell and the
embedded Electron runtime and did not invoke or depend on those ambient tools.
Their presence therefore does not fail Stage 1 under the Founder-approved
policy.

## Evidence conclusion

| Evidence | Result |
| --- | --- |
| Source/destination transfer integrity | Passed |
| Kit manifest integrity | Passed |
| Windows and hardware baseline | Collected and accepted under the controlled non-pristine policy |
| Oracle installation absence | Passed |
| Documented restore point | Passed |
| Temporary Auth route | Passed; HTTP 200 |
| PostgreSQL and Mailpit isolation | Passed; inaccessible from the laptop |
| Non-allowlisted route | Passed; rejected |
| Electron GPU admission | Passed |
| Electron / Chromium | `39.8.10` / `142.0.7444.265` |
| Hardware renderer | AMD Radeon D3D11 through ANGLE |
| RTX 3070 Laptop GPU detection | Passed |
| Active software fallback | None |
| Development-PC teardown | Passed |
| Laptop kit, process and misplaced evidence cleanup | Passed |
| Production resource use | None |

The final cleanup record SHA-256 is
`96f2d2b92ca6bfcc915c45c8048a96ec7610a7f7375b519b0f6556ddd22e5c2b`.

## Frozen evidence

The raw Stage 1 evidence is frozen in the workspace-local, Git-ignored archive:

`Oracle.Sprint30.5.Stage1Evidence.zip`

SHA-256:

`841b5ea14bc06966ce969dda0a6794110633e9ad7f0c74d0d11ee1d54938a78d`

The committed frozen-evidence record contains the archive and entry hashes
without committing the raw installed-software inventory or local user path.

## Closure state

- Stage 1 technical evidence is complete.
- Stage 1 cleanup is complete.
- No Stage 1 action or evidence gap remains.
- Separate clean Windows qualification remains mandatory in a later stage.
- Stage 1 grants no package, signing, deployment, distribution, persistence,
  migration, Gate C, Gate 7, Sprint 31, Beta or production authority.
- Stage 2 has not begun.
