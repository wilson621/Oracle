ORACLE SPRINT 30.5 STAGE 3 REPLACEMENT-HOST ADMISSION

DESIGNATED HOST

Device name: Founder-QA-01
Manufacturer: MEDION
Model: ERAZER P6605 MD61596

SCOPE

This kit collects read-only host-admission evidence only.

It does not:

- install or run Oracle;
- contain or transfer the Stage 2 MSIX or any Stage 2 artifact;
- import or inspect the Stage 2 public certificate;
- change firewall or network configuration;
- erase, reinstall or otherwise modify Windows; or
- begin Stage 3.

EXECUTION

1. Place this folder on Founder-QA-01.
2. Confirm Windows reports the device name as Founder-QA-01.
3. Right-click Windows PowerShell and select "Run as administrator".
4. Approve the Windows UAC prompt.
5. In PowerShell, type:

   Set-ExecutionPolicy -Scope Process Bypass

6. If the official Microsoft Windows ISO used for the clean installation is
   still available, type the collector path and the ISO path:

   & "D:\stage-3-host-admission\Collect-OracleStage3HostAdmission.ps1" -InstallationMediaPath "D:\Windows11.iso"

   If no official ISO is available, omit -InstallationMediaPath. The collector
   will still record the host evidence but must report the installation-media
   requirement as failed rather than infer it:

   & "D:\stage-3-host-admission\Collect-OracleStage3HostAdmission.ps1"

7. Answer each Y/N Founder confirmation truthfully. If the laptop has not yet
   received the clean installation, answer the clean-install questions N.
8. Leave the window open until it reports the evidence filename and result.

RETURN ONLY

- evidence-output\Oracle.Stage3HostAdmission.json
- evidence-output\Oracle.Stage3HostAdmission.json.sha256.txt

Do not place the Stage 2 package or certificate on the laptop.
Do not run Stage 3.
