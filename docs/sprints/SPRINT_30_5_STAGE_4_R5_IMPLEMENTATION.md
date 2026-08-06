# Sprint 30.5 Stage 4 Requalification R5 Implementation

**Status:** Complete engineering preparation
**Classification:** Non-qualification; non-authority; non-evidence
**Product change:** None

## Implemented preparation surface

The R5 namespace is `scripts/sprint-30-5/stage-4-r5/`. It contains:

- an exact R8/R13 and immutable R4-bound preparation contract;
- the isolated split-host provider topology;
- the retained twenty-phase fail-closed lifecycle;
- pure private-link, no-default-route, relay-plan and clean-host admission
  policies;
- provider image, migration, publication and public-record admission policy;
- a PowerShell 5.1 clean-host journey driver implementing all ten R4 journeys;
- secret and JWT redaction gates;
- hostile policy fixtures; and
- an engineering-only preparation verifier.

The clean-host driver performs direct standards-based HTTP calls to the real
provider and installed package. It creates two fresh synthetic accounts,
proves unverified rejection and no signup session, captures local confirmation
mail, verifies both accounts, signs in, provisions distinct Operators, creates
the Supabase SSR cookie encoding required by the installed package, proves
protected rendering and API authorization, queries row-level-security bindings
as each principal, globally signs out and proves token and route invalidation.

No source-built Web server or provider fixture is accepted as qualification.
The protected render method is contractually
`authenticated-installed-package-server-render`.

## Deliberate execution-overlay boundary

Host-specific relay mutation, provider startup and exact provider-host tool
hash binding are not performed or frozen by this preparation authority. They
belong to a future execution-enabled overlay after the actual two-host private
link is known. The current contract makes provider, relay and qualification
execution impossible and requires a separate Founder mission.
