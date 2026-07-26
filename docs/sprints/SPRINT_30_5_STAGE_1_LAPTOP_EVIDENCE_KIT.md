# Sprint 30.5 Stage 1 — Laptop Evidence Kit

**Status:** Founder-accepted and closed; retained as execution history
**Scope:** Stage 1 environment admission only
**Stage 2:** Not started

## Founder-approved host classification

The ASUS qualification laptop is admitted as a **controlled non-pristine
physical qualification host**. It must not be represented as a pristine or
clean-machine environment.

The presence of Node.js, npm, Python, .NET or Visual Studio Build Tools does
not fail Stage 1 solely because those tools are installed. Oracle must not
invoke or depend on them during qualification. A separate clean Windows
qualification remains mandatory before production certification.

## Supplied files

Copy these three files together:

| Filename | Bytes | SHA-256 |
| --- | ---: | --- |
| `Oracle.Stage1EvidenceKit.zip` | 136,577,218 | `3bafa02a39bafa3d9425c1d325c3cc03e911f97445fc52e8782c24d752f8c2a6` |
| `Oracle.Stage1EvidenceKit.transfer-source.json` | 465 | `dd86a5707cb01227da8b6d928a236fdca45c64b58979d50f9dd51176c86a0955` |
| `Oracle.Stage1EvidenceKit.zip.sha256.txt` | 95 | `621a859b457f8fe236c875acff5b99f0e761a6111fe90f9006e0cc9f3b18b624` |

The ZIP contains a standalone Electron `39.8.10` runtime. The laptop does not
need Node.js, npm, Git, Docker, a compiler, a development server or Oracle
source.

## Founder laptop instructions

### Part 1 — Transfer and identify the laptop

1. Keep the laptop plugged into power and connect it to the same private
   network as the development PC.
2. Transfer all three supplied files using the approved method, preferably a
   USB drive.
3. Place them together in a new folder such as
   `Desktop\Oracle Stage 1 Transfer`.
4. Right-click `Oracle.Stage1EvidenceKit.zip` and select **Extract All**.
5. Open the extracted `Oracle.Stage1EvidenceKit` folder.
6. Double-click `Identify-OracleStage1Laptop.cmd`.
7. A small window will show the laptop's IPv4 address and create:
   - `Oracle.Stage1LaptopAddress.json`;
   - `Oracle.Stage1LaptopAddress.json.sha256.txt`.
8. Transfer those two small files back to the development PC and tell Codex
   they are ready.
9. Do not run the main evidence kit until Codex confirms that the temporary
   isolated Auth route is active and provides the development-PC IPv4 address.

### Part 2 — Run the evidence kit

1. When Codex confirms the route is ready, double-click
   `Start-OracleStage1EvidenceKit.cmd`.
2. Approve the Windows administrator prompt. It is required only to enumerate
   all installed Appx packages and System Restore points.
3. If Windows SmartScreen appears for the locally packaged GPU probe, select
   **More info**, verify the filename is `OracleStage1GpuProbe.exe`, then select
   **Run anyway**.
4. When asked for the transfer method, enter a short description such as
   `USB drive`.
5. When asked for the development-PC IPv4 address, enter the exact address
   supplied by Codex.
6. Wait for the window to report the result and the return SHA-256.
7. Transfer these files back to the development PC:
   - `Oracle.Stage1EvidenceReturn.zip`;
   - `Oracle.Stage1EvidenceReturn.zip.sha256.txt`.
8. Tell Codex the return files have been transferred. Codex will immediately
   remove the temporary firewall rules and disposable service topology.

### Part 3 — Remove the kit

1. Double-click `Confirm-OracleStage1Removal.cmd`.
2. It removes the extracted kit and GPU probe, then creates:
   - `Oracle.Stage1Cleanup.json`;
   - `Oracle.Stage1Cleanup.json.sha256.txt`.
3. Transfer those two cleanup files back to the development PC.
4. Delete the remaining source ZIP, transfer-source JSON, hash file, cleanup
   scripts and cleanup evidence from the laptop.
5. Confirm to Codex that the remaining transfer files were deleted.

The kit installs no software, certificate, service, driver, package, Node
runtime or Oracle component. The embedded Electron runtime is removed with the
extracted folder.

## Development-PC actions

Codex performs these actions after receiving
`Oracle.Stage1LaptopAddress.json`:

1. Verify the address-file hash and identify the active laptop IPv4 address.
2. Recreate the minimal disposable topology:
   - PostgreSQL;
   - GoTrue;
   - Kong;
   - Mailpit.
3. Require email confirmation and apply the canonical migration chain through
   Migration 014.
4. Determine the development PC's private IPv4 address.
5. Open an Administrator PowerShell session.
6. Run:

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass `
     -File scripts\sprint-30-5\stage-1-kit\Configure-OracleStage1IsolatedRoute.ps1 `
     -Action Start `
     -QualificationLaptopIPv4 <LAPTOP_IPV4>
   ```

7. Verify a non-allowlisted Docker-bridge source cannot reach Auth:

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass `
     -File scripts\sprint-30-5\stage-1-kit\Configure-OracleStage1IsolatedRoute.ps1 `
     -Action VerifyNegative
   ```

8. Give the development-PC IPv4 address to the Founder.
9. Wait only for the laptop collection to finish.
10. Whether the laptop run passes or fails, remove the temporary rules:

    ```powershell
    powershell.exe -NoProfile -ExecutionPolicy Bypass `
      -File scripts\sprint-30-5\stage-1-kit\Configure-OracleStage1IsolatedRoute.ps1 `
      -Action Stop
    ```

11. Stop Supabase with data-volume deletion.
12. Verify zero matching containers, volumes, networks and firewall rules.
13. Remove the disposable Supabase configuration directory.

PostgreSQL port `54322` and Mailpit port `54324` remain blocked from the
laptop. Only Auth port `54321` is temporarily allowlisted to the exact laptop
IPv4 address.

## Expected returned evidence

`Oracle.Stage1EvidenceReturn.zip` must contain:

- `windows-baseline.json`;
- `windows-baseline.json.sha256.txt`;
- `electron-gpu-admission.json`;
- `electron-gpu-admission.json.sha256.txt`;
- `laptop-route-admission.json`;
- `laptop-route-admission.json.sha256.txt`; and
- `artifact-transfer.json`.

Cleanup additionally returns:

- `Oracle.Stage1Cleanup.json`;
- `Oracle.Stage1Cleanup.json.sha256.txt`.

The development PC produces:

- `firewall-start.json`;
- `non-allowlisted-route.json`;
- `firewall-stop.json`; and
- corresponding SHA-256 files.

## Stage 1 pass criteria

Codex will recommend Stage 1 acceptance only when:

- the archive hash matches the supplied source hash;
- every internal kit-manifest file hash matches;
- the laptop matches the Founder-authorised ASUS model and hardware profile;
- Windows version, build, display, scaling, drivers and software inventory are
  recorded;
- Oracle is absent;
- Node.js, npm, Git, Docker, compilers and other development tools are
  inventoried;
- the evidence kit and Oracle qualification path do not invoke or depend on
  ambient Node.js, npm, Python, .NET or Visual Studio Build Tools;
- the host is represented as controlled and non-pristine;
- separate clean Windows qualification remains outstanding;
- the documented restore point is enumerated;
- Electron is exactly `39.8.10`;
- Chromium version is recorded;
- the RTX 3070 Laptop GPU is detected;
- the active renderer uses a hardware GPU;
- hardware acceleration, WebGL and a GPU process are present;
- no active SwiftShader, llvmpipe, Microsoft Basic Render or other software
  fallback is detected;
- Auth health is reachable from the laptop;
- PostgreSQL and Mailpit are unreachable from the laptop;
- the non-allowlisted source cannot reach Auth;
- all temporary firewall rules are removed;
- source and destination artifact hashes match;
- returned evidence hashes verify;
- the extracted kit and GPU probe are removed;
- no production resource or data was used; and
- Stage 2 remains unstarted.

Detection of an inactive Microsoft Basic Render device is recorded but does
not fail admission when the active renderer and critical GPU features are
hardware accelerated.

## Rollback

If any collection step fails:

- retain the generated failure evidence;
- do not rerun against altered settings without review;
- remove the temporary firewall rules;
- stop and delete the disposable topology;
- run the cleanup script;
- return the failure and cleanup evidence; and
- keep Stage 1 incomplete.

The broader MSIX, certificate, Operator journey, Companion, long-duration soak
and repeated clean-state protocols remain deferred to later stages.
