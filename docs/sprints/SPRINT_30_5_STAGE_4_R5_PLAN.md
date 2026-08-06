# Sprint 30.5 Stage 4 Requalification R5 Plan

**Authority:** Founder-authorised bounded engineering preparation
**Baseline:** Accepted Stage 2 R8 / Stage 3 R13
**Historical input:** Accepted immutable Stage 4 R4
**Status:** Engineering preparation only; qualification barred
**Last reviewed:** 6 August 2026

## Objective

Prepare a Stage 4 protocol that retains R4's ten live authentication and
protected-rendering journeys while preserving `Founder-QA-01` as the sole clean
qualification host. The accepted R8 package must be exercised without a
repository, Git, Node, npm, Supabase CLI, Docker, Python, .NET SDK or MSBuild on
that host.

## Architecture

R5 uses an isolated split-host qualification cell:

- engineering provider host `DESKTOP-M3H22E4` owns only the accepted R4
  disposable Supabase stack, provider custody and provider teardown;
- qualification host `Founder-QA-01` owns R8 trust, installation, runtime
  configuration, activation, the ten journeys, package teardown and evidence;
- the two admitted hosts communicate only over a private RFC1918 on-link route
  with no IPv4 or IPv6 default route;
- only provider API port 54321 and local-mail port 54324 may cross the private
  link; PostgreSQL is never published;
- Windows built-in loopback relays preserve the package-bound
  `http://127.0.0.1:54321` origin on `Founder-QA-01`; and
- both hosts must prove zero relay, provider, package, trust, runtime,
  identity, mail, session and work residue before evidence freeze.

This is not a main-PC qualification exception. The engineering workstation
does not install or qualify the Oracle package and cannot produce the Stage 4
journey result.

## Retained R4 acceptance contract

R5 retains all ten journeys and the twenty ordered lifecycle phases. It uses
the same real, disposable, non-production Supabase services and migration
chain. Provider fixtures cannot substitute for provider identity,
authentication, mail confirmation, row-level security or session invalidation.

## Authority boundary

This preparation may create source and documentation only. It may not create a
transfer, provider state, network relay, qualification authority, attempt,
certificate trust, package installation or qualification evidence. Any future
execution overlay must bind fresh provider-host tool identities, fresh host
continuity, exact private-link addresses and entirely new governed identities
before authority creation is considered.
