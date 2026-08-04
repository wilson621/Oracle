# Sprint 30.5 Stage 5 R1 Clean-Host Bootstrap Blocker

**Status:** Genuine pre-authority architecture and governance blocker
**Qualification host:** `Founder-QA-01` clean qualification laptop
**Transfer:** `transfer-stage5-r1-20260804T180558891Z-a3943eac`
**Authority created:** No
**Attempt created:** No
**Qualification evidence:** None
**Last Reviewed:** 4 August 2026

## Observed failure

The physical handoff reached `Founder-QA-01`, but preparation stopped before
copying or admitting the transfer because the bootstrap expected a repository at
`C:\Dev\project-meta`. A proposed offline Git-bundle bootstrap then established
that Git is not installed. This is expected host state: `Founder-QA-01` is an
intentionally clean qualification host, not a development workstation.

The returned USB transfer rehashes unchanged:

- manifest SHA-256:
  `097a0a0157d8203367617a6fcd799e4b3acbbe74661a24a3048e95dfd19c1dc3`;
- custody SHA-256:
  `458dd9169cb42af3e5638202a2de152a21e6a19b927f43bd012947d751ac07d8`;
- independent verification SHA-256:
  `9be89ce7b7b8d09d570fb940e75f2bc92e6b330cc6f6fd9d76d19dd5d9be93f6`.

No laptop-local transfer, host continuity, preflight, authority, attempt or
qualification evidence was created. Main-PC Stage 5 state also contains no
preflight, authority or attempt namespace.

## Root cause

The defect is architectural, not limited to the bootstrap script.

The R1 execution contract binds developer-workstation identities for Git, Node,
npm, Supabase CLI, Supabase native CLI and Docker. Several paths are specific to
the main workstation. The pre-authority implementation invokes the inherited
Stage 4 checks, which require those tools and a repository containing historical
bindings.

The qualification controller then actively requires Node, npm, Supabase CLI and
Docker. It starts a disposable Supabase container topology, validates Docker
images and containers, and uses a Node workload with Supabase client libraries.
The frozen provider contract describes a Next.js production server, governed
Node client, Docker-published Supabase services and Mailpit.

Therefore removing the Git check or copying a repository would not correct the
mission. Qualification would still depend on installing and executing developer
tooling on the clean host. Installing those tools is explicitly prohibited by
the Founder workstation boundary and conflicts with the clean-host continuity
model previously used by accepted Stage 3 qualification.

## Fail-closed disposition

The replacement transfer is not admissible and must not be executed. It remains
immutable history alongside the earlier failed transfer. No retry or additional
transfer is authorised.

Engineering cannot replace the current provider/runtime with a mock, emulator,
portable container stack or reduced journey without changing the frozen Stage 5
acceptance protocol and its security/isolation claims. Treating bundled
developer tools as qualification runtime would not resolve the contradiction.

## Required Founder decision

Choose and authorise a new Stage 5 clean-host architecture before further
engineering:

1. authorise a self-contained, manifest-bound qualification appliance whose
   behaviour and equivalence to the frozen provider and workload are explicitly
   defined and revalidated; or
2. revise the Stage 5 acceptance protocol to a clean-host test surface that
   relies on the accepted R6/R12/R4 chain without repeating the developer-stack
   provider lifecycle.

Either decision requires a new engineering revision and, after acceptance, a
fresh separately authorised transfer. Installing development tooling on
`Founder-QA-01`, using the main PC as qualification host, admitting either R1
transfer, weakening fail-closed gates or starting Stage 6 are not permissible.
