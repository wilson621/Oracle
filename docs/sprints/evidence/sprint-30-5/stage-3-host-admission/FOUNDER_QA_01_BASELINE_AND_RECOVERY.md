# Founder-QA-01 Clean Baseline and Recovery Procedure

**Purpose:** Sprint 30.5 Stage 3 replacement-host admission evidence  
**Host:** `Founder-QA-01`  
**Manufacturer:** MEDION  
**Model:** ERAZER P6605 MD61596  
**Procedure status:** Documented, not exercised by this record  
**Stage 3 status:** Not started and not authorised

## Evidence-bound baseline

This baseline is bound to:

- admission evidence collected at `2026-07-26T21:18:09.0339410Z`;
- admission JSON SHA-256
  `dec902fe556d630d05572744df9321f589c715cc413533b7b5c390df0ed3fc2a`;
- collector revision `3`;
- collector SHA-256
  `245e8e8a7af2735593ad3cf531af4c125fc4909917c7722e4b45a7483af6e459`;
- Windows 11 Home x64, edition identifier `Core`, display version `25H2`,
  build `26200`;
- activated Windows licence;
- enabled Secure Boot;
- present and ready TPM;
- enabled Windows Recovery Environment;
- enabled Microsoft Defender antivirus and real-time protection;
- present storage, GPU and signed-driver inventories;
- no detected Oracle installation, process, service, task, package or
  qualification residue;
- no detected production-indicator environment-variable name; and
- Founder confirmation that required data is backed up and no production
  Oracle credential or data is present.

The admission record currently remains failed closed for the separately
recorded installation-media, Python execution-alias and documentation checks.
This document resolves only the documentation check after Founder review; it
does not itself resolve the other checks or admit the host.

## Approved recovery objective

Recovery must return this exact physical device to a supported, activated,
clean Windows 11 Home x64 state without Oracle, development tooling,
qualification residue, production credentials or production data.

No recovery action may begin without separate Founder authority when it would
erase data, reinstall Windows or otherwise make a destructive change.

## Recovery prerequisites

Before recovery:

1. obtain explicit Founder authority for the selected recovery action;
2. confirm required data remains independently backed up;
3. confirm the hardware identity against the salted identity in the admission
   evidence;
4. confirm the existing Windows 11 Home digital licence;
5. prepare official Microsoft recovery or installation media;
6. hash-bind the media before use;
7. retain no product key, recovery key, account identifier or credential in
   committed evidence;
8. confirm that no production Oracle credential or data is required; and
9. stop if recovery would require a purchase, edition upgrade, paid provider
   or changed trust boundary.

## Recovery routes

### Route A — Windows Recovery Environment

Use Windows Recovery Environment only when it can restore the required clean
state and the exact selected reset action has separate Founder authority.
Record the chosen recovery option, start/end timestamps, Windows edition and
result.

### Route B — Official Microsoft installation USB

When a clean installation is required:

1. create or retain official Windows 11 installation media using Microsoft's
   supported Media Creation Tool workflow;
2. record the Media Creation Tool identity and SHA-256 when available;
3. record a deterministic SHA-256 inventory of the resulting USB contents;
4. verify Microsoft Authenticode signatures on applicable Microsoft
   executables, including root `setup.exe`;
5. boot the designated host from that media;
6. install the existing licensed Windows 11 Home edition only;
7. erase or repartition only the intended Windows target after separate
   destructive-action authority;
8. do not restore applications, development tools, Oracle data, project data
   or prior settings;
9. apply stable Windows Update and official device-manufacturer drivers; and
10. reboot until no mandatory update remains.

## Post-recovery admission

Before Stage 3 authority is requested:

1. set and verify the device name `Founder-QA-01`;
2. rerun the approved read-only host-admission collector;
3. verify hardware continuity against the salted identity;
4. verify Windows activation, Secure Boot, TPM, WinRE and Defender;
5. verify storage, GPU, display, driver and installed-software inventories;
6. verify Oracle, development tooling and qualification residue are absent;
7. verify production credentials and production data remain absent;
8. bind the returned evidence to SHA-256;
9. remove the collector and temporary admission evidence after verified
   return; and
10. record separate removal evidence.

Any failed mandatory check keeps the host fail-closed. A documented recovery
route does not authorise recovery, Stage 3, certificate trust, package
transfer or MSIX installation.

## Official references

- Microsoft, “Create installation media for Windows”:
  <https://support.microsoft.com/windows/create-installation-media-for-windows-99a58364-8c02-206f-aa6f-40c3b507420d>
- Microsoft, “Reinstall Windows with the installation media”:
  <https://support.microsoft.com/windows/reinstall-windows-with-the-installation-media-d8369486-3e33-7d9c-dccc-859e2b022fc7>
