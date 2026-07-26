# Sprint 30.5 Stage 1 — Revised Environment Admission Record

**Result:** Admission incomplete — authorised physical machine evidence pending
**Previous blocker:** Superseded by Founder clarification
**Product source changed:** No
**Stage 2 started:** No

## Founder-authorised qualification machine

The Founder has authorised the following dedicated physical environment as
satisfying the clean-machine model without a factory reset:

| Property | Founder-provided specification |
| --- | --- |
| Machine | ASUS ROG Zephyrus G15 `GA503QR` |
| Operating system | Windows 11 Home x64, fully updated |
| Processor | AMD Ryzen 9 5900HS |
| Memory | 16 GB |
| GPU | NVIDIA GeForce RTX 3070 Laptop GPU |
| Drivers | NVIDIA and ASUS updates completed |
| Baseline | Documented Windows restore point |
| Use | Dedicated Oracle qualification |
| Separation | Isolated from Oracle development |
| Data boundary | No production credentials or data |

This Founder clarification supersedes the earlier conclusion that only a
resettable Windows guest could be admitted. A dedicated physical machine with
the approved controls is now an acceptable environment model.

The specification above remains Founder-provided evidence. Machine-generated
inventory, restore-point enumeration and Electron GPU evidence have not yet
been collected from the laptop and are not represented as passed.

## Disposable service topology

The development workstation successfully provisioned the bounded local
topology twice:

```text
Authorised qualification machine (route pending)
  |
  | temporary allowlisted qualification route
  v
Kong 2.8.1
  +-- GoTrue 2.192.0
  +-- PostgreSQL 17.6 / image 17.6.1.143
  +-- Mailpit 1.30.2
```

Supabase CLI `2.109.1` created only PostgreSQL, GoTrue, Kong and Mailpit.
Studio, analytics, storage, PostgREST, Realtime, Edge Runtime, image
transformation, metadata and pooler services were excluded.

### Exact container images

| Service | Image | Image identifier |
| --- | --- | --- |
| PostgreSQL | `public.ecr.aws/supabase/postgres:17.6.1.143` | `sha256:80d7b27c3e8d77cfa7226eee9508671796da214781ff15a35b3670d7ad5ee453` |
| GoTrue | `public.ecr.aws/supabase/gotrue:v2.192.0` | `sha256:b252efb680be37d4a8bf77c210cf0439c19b63a4b51929233a65dd101d25bdab` |
| Kong | `public.ecr.aws/supabase/kong:2.8.1` | `sha256:1b53405d8680a09d6f44494b7990bf7da2ea43f84a258c59717d4539abf09f6d` |
| Mailpit | `public.ecr.aws/supabase/mailpit:v1.30.2` | `sha256:37a38e48e9338cd7e89dfeb487f37b02ebfcd9cb23111bed2d345e79d37d6dd6` |

## Service admission evidence

- the Oracle canonical schema and migration chain through Migration 014
  applied successfully on both topology runs;
- all four required terminal tables were present after recreation;
- all four retained containers reported healthy;
- synthetic `example.invalid` sign-ups created disposable Auth records;
- GoTrue issued no session before email verification;
- confirmation messages were captured by local Mailpit;
- no external email delivery occurred;
- no production endpoint, credential or data was used; and
- runtime persistence and persisted producers/consumers were not activated.

The full Email + Password verification transaction remains Stage 4 work. Stage
1 proves only that the isolated components and local confirmation-mail route
can support that later test.

## Isolation finding

Supabase CLI publishes its local API, PostgreSQL and Mailpit ports on all host
interfaces by default and displays an explicit local-development warning.

The services were used only for bounded localhost admission and were
immediately removed. This does not yet prove an isolated cross-machine route
from the qualification laptop.

Before Stage 1 can pass, the laptop route must use either:

- a temporary Windows Firewall allowlist restricted to the qualification
  laptop, with PostgreSQL and Mailpit remaining host-local; or
- an equivalently isolated direct private network.

The route must be tested from the laptop and from a non-allowlisted source.
Default shared local keys must never be treated as production secrets.

## Teardown and recreation

The first topology was stopped with data-volume deletion. Inspection confirmed
zero matching containers, volumes and networks. The topology was then
recreated, the canonical chain was reapplied, health and local email capture
were reverified, and it was stopped again with data-volume deletion.

Final inspection confirmed:

- zero Stage 1 containers;
- zero Stage 1 volumes;
- zero Stage 1 networks;
- zero retained synthetic identities or sessions;
- zero retained confirmation messages;
- zero certificates or trust entries created;
- zero temporary configuration directories; and
- no production or remote change.

Public container image layers remain in Docker's inert image cache. They
contain no Oracle identity, database, email, credential or runtime state and
are not running infrastructure.

## Remaining minimum actions

No purchase, paid provider, factory reset or new virtualisation provider is
required. The minimum outstanding actions are:

1. Run a read-only baseline collector on the authorised laptop and return the
   machine-generated OS, hardware, GPU driver, installed-software, Oracle
   absence, developer-tool absence and restore-point evidence.
2. Transfer a hash-bound, standalone Electron `39.8.10` GPU admission probe by
   the controlled local method; run it without installing development tooling;
   return its immutable JSON result.
3. Confirm hardware acceleration, GPU feature status and the absence of
   unexpected software fallback on the laptop.
4. Record the restore-point identifier and verify that System Restore is
   enabled and the baseline is selectable.
5. Establish and test the temporary allowlisted laptop-to-Auth route while
   keeping PostgreSQL and Mailpit inaccessible to non-allowlisted machines.
6. Record the artifact-transfer medium, source hash, destination hash and
   removal result.

These actions are within the existing Stage 1 authority. They require access
to or coordinated execution on the qualification laptop, not new Founder
architecture or product authority.

## Admission recommendation

Do not accept Stage 1 yet.

The physical-machine model is accepted in principle and the disposable service
topology, migration chain, local email capture, teardown and recreation have
passed. Stage 1 remains incomplete solely because laptop-local inventory,
restore, Electron GPU and isolated cross-machine-route evidence has not been
collected.

Stage 2 must not begin.
