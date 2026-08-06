# Stage 4 R5 governed execution overlay

This namespace implements the single Founder-authorised Stage 4 R5 mission for
the accepted R8/R13 baseline. It is fail-closed and preserves the split-host
model: the main PC owns the disposable provider; Founder-QA-01 owns package
installation and qualification.

The ordering is mandatory:

1. freeze and independently verify exactly one create-only transfer;
2. isolate and configure the two-host `/30` private link;
3. complete one non-authority two-host development rehearsal;
4. tear both hosts down to zero residue;
5. independently validate the rehearsal completion;
6. produce a fresh post-rehearsal provider pre-authority record;
7. admit the transfer and clean qualification host;
8. create and consume one authority and execute one attempt;
9. tear down both hosts, return evidence, independently verify, reconcile and
   close.

No script may create an authority before the exact rehearsal-completion hash is
bound into the fresh provider pre-authority record. Qualification is never
executed on the engineering workstation. The qualification host does not
require Git, Node, npm, Supabase CLI, Docker, Python, .NET SDK or MSBuild.
