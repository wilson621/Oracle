# Sprint 30.5 Stage 1 — Environment Admission Record

**Historical status:** Superseded by the Founder-authorised controlled
non-pristine physical-host model and the closed
`SPRINT_30_5_STAGE_1_ENVIRONMENT_ADMISSION_REVISED.md` record. The result below
is retained as the honest outcome of the original environment-model attempt.

**Result:** Blocked — mandatory resettable Windows/GPU environment unavailable
**Admission decision:** Fail closed
**Product source changed:** No
**Infrastructure provisioned:** No
**Stage 2 authority:** Not requested

## Objective

Determine whether the existing authorised local environment can provide a
resettable clean Windows 11 x64 guest with usable hardware-accelerated Electron
GPU operation before provisioning any dependent qualification infrastructure.

The check was deliberately ordered first because failure of this prerequisite
is an approved immediate stop condition.

## Host capability observed

| Capability | Observed state |
| --- | --- |
| Host operating system | Microsoft Windows 11 Home, `10.0.26200`, x64 |
| BIOS | American Megatrends `3902`, 13 July 2026 |
| Microsoft hypervisor | Present |
| Firmware virtualisation | Enabled |
| WSL | Version 2 operational |
| Docker Desktop | `4.83.0` |
| Docker Engine | `29.6.2`, Linux containers |
| Host discrete GPU | NVIDIA GeForce RTX 4080, driver `610.62`, active |
| Host integrated GPU | AMD Radeon Graphics, driver `32.0.21043.5001` |

The physical development host has usable GPU hardware. That does not establish
a clean, disposable or independently resettable Windows qualification
environment.

## Mandatory Windows admission result

No existing resettable Windows guest or supported local guest controller was
discovered:

- `WindowsSandbox.exe` — unavailable;
- Hyper-V VM console `vmconnect.exe` — unavailable;
- Hyper-V Manager `virtmgmt.msc` — unavailable;
- VirtualBox controller `VBoxManage.exe` — unavailable;
- VMware controller `vmrun.exe` — unavailable; and
- no installed VirtualBox, VMware, Hyper-V Manager or Windows Sandbox product
  registration was discovered.

The workstation's Windows 11 Home installation and Docker/WSL2 Linux
virtualisation cannot substitute for a clean Windows guest. The physical host
cannot be reset for qualification without destroying the development
environment and is therefore inadmissible.

The required combination of clean snapshot, reliable reset and guest GPU
acceleration is unavailable in the authorised environment.

## Dependent topology status

The planned isolated topology remains:

```text
Disposable Windows guest
  |
  | allowlisted qualification-only network
  v
Disposable Supabase Auth/GoTrue
  +-- disposable PostgreSQL through Migration 014
  +-- local email-capture sink
```

This topology was not provisioned. The Windows/GPU prerequisite failed before
dependent infrastructure admission, so creating Auth identities, databases,
mail sinks, certificates or containers would not have advanced Stage 1 and
would have violated the immediate-stop instruction.

## Isolation and prohibited-path checklist

| Check | Result |
| --- | --- |
| Production endpoint used | No |
| Production credential used | No |
| Production data used | No |
| Product source changed | No |
| Architecture changed | No |
| Migration changed or created | No |
| Purchase or subscription made | No |
| New external provider installed or used | No |
| Supabase/Auth infrastructure created | No |
| PostgreSQL container created | No |
| Email-capture service created | No |
| Synthetic identity or session created | No |
| Test certificate created or trusted | No |
| Qualification artifact transferred | No |
| Remote push performed | No |

## Snapshot, reset and teardown

A snapshot/reset procedure cannot be admitted without a resettable Windows
guest. No substitute procedure is claimed.

Teardown is complete by construction because no disposable infrastructure,
identity, database, email, certificate, trust entry, container or artifact was
created. A filtered Docker inspection found no `oracle-sprint-30-5`,
`oracle-supabase` or `oracle-postgres` container.

## Stop condition

The approved stop condition has occurred:

> the Windows environment cannot be reliably reset.

Stage 1 is not complete. No other missing deliverable is represented as
passed. Stage 2 must not begin.

## Required Founder decision

Founder authority is required to identify or permit a suitable resettable
Windows 11 x64 environment with guest GPU acceleration. If satisfying that
requirement needs a purchase, paid provider, new virtualisation provider,
different environment model or another authorised tester, that choice must be
made separately before Stage 1 resumes.
