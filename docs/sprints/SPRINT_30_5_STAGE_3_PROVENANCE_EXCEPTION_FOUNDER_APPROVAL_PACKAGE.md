# Sprint 30.5 Stage 3 Provenance Exception — Founder Approval Package

**Status:** Eligible for Founder approval — no admission granted

**Host:** `Founder-QA-01`

**Manufacturer/model:** `MEDION ERAZER P6605 MD61596`

**Stage 3:** Not started and not authorised

**Qualification Register:** Unchanged

**Programme status:** Unchanged

## Decision requested

Approve the host-specific, installation-specific retained-media provenance
exception identified as:

`sprint-30-5-stage-3-founder-qa-01-retained-media-provenance`

If approved, the exception will permit the current Windows installation on
the bound host to receive the separately recorded admission state:

`admitted-with-founder-provenance-exception`

Approval of this package does not itself:

- rewrite or pass `installationMediaEvidencePresent`;
- grant host admission in repository programme records;
- amend the Qualification Register;
- amend programme status;
- authorise certificate trust or artifact transfer;
- authorise package installation; or
- authorise Stage 3 execution.

Those actions remain sequential. After Founder approval, the approved
exception and admission state must first be recorded. Stage 3 requires a
separate Founder authorisation.

## Exception scope

The exception applies only to:

- device name `Founder-QA-01`;
- manufacturer/model `MEDION ERAZER P6605 MD61596`;
- the current Windows installation bound to host-admission SHA-256
  `6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e`;
- baseline/recovery document SHA-256
  `6674b900fccadcc8f6d476dda6a787f859aad948dc78033dbfb7793ac90e8d44`;
  and
- compensating-control evidence SHA-256
  `9455f45f61b96eaabb33f009b9c8fb1aca2d8f99d1744bb9857453db24855eda`.

It is non-transferable and does not apply to another host or Windows
installation.

## Assertion and unavailable evidence

The Founder assertion is that Windows was clean-installed using Microsoft's
official Media Creation Tool USB workflow, but the original USB or ISO hash
was not retained.

`installationMediaEvidencePresent` remains `false`.

The admission evidence continues to report installation-media evidence as its
sole failed check. It has not been inferred, rewritten or represented as
passed.

## Residual risk

Oracle cannot cryptographically prove the identity of the original
installation media. It instead proves the observed freshness, integrity and
uncontaminated state of the resulting Windows installation.

The exception is invalidated by:

- Windows reinstall or reset;
- system-disk replacement;
- system-image restoration;
- Secure Boot change;
- TPM change;
- contamination;
- unexplained software; or
- failed integrity controls.

## Evaluation result

The repository evaluator produced:

- state: `eligible-for-founder-approval`;
- maximum state: `eligible-for-founder-approval`;
- failed checks: none;
- admission granted: `false`;
- Stage 3 authority granted: `false`; and
- Founder approval required: `true`.

All evaluator checks passed:

- host-admission hash, contract and collector revision;
- exact device, manufacturer and model;
- baseline/recovery document binding;
- installation-media evidence remains false;
- installation-media evidence is the sole admission failure;
- all mandatory technical admission checks;
- all Founder confirmations;
- compensating-control contract and host/baseline bindings;
- compensating controls preserve the missing-media result;
- overall compensating-control result;
- all individual compensating checks;
- DISM, SFC and Defender controls;
- evidence-only authority boundary;
- no host-admission authority;
- no Stage 3 authority; and
- the bounded maximum downstream state.

## Compensating controls

The corrected collector rerun passed:

- `DISM.exe /Online /Cleanup-Image /CheckHealth`;
- `sfc.exe /verifyonly`;
- Microsoft Defender Quick Scan;
- Defender health and threat-evidence completeness;
- zero active threats;
- zero new detections; and
- exact host-admission and baseline bindings.

The SFC assessment was derived deterministically from its raw hash-bound
evidence by parser version 2. It found exactly one complete success marker and
no failure marker.

## Canonical evidence hashes

| Evidence | SHA-256 |
| --- | --- |
| Host admission | `6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e` |
| Baseline and recovery document | `6674b900fccadcc8f6d476dda6a787f859aad948dc78033dbfb7793ac90e8d44` |
| Compensating controls | `9455f45f61b96eaabb33f009b9c8fb1aca2d8f99d1744bb9857453db24855eda` |
| DISM raw evidence | `89ab92f8cc1c9ba5950fca89abc8430d8ab1b0f8294f158cf5a6a65354b9820b` |
| SFC raw evidence | `cb7397e8481be25461a4b1c5382b6747f35ab37cb4aabf32d03cb84706747e1b` |
| Defender before | `7c3fdc5f40d17311cd06a8d9e604bf189a4b42d4add8a95104e2fb57fd85d449` |
| Defender after | `609e177a2e7daf8bf1ce814e4f856b15441334613966cbfc21ad61945003404a` |
| Defender threats | `163e6d5d6f9a0b21ea8acd5be92a0750dcc1cb886b85b98dee46d7e91c097fd0` |
| Corrected compensating-control collector | `d071a9c86a77c41b50315fadb3d6f24297d0e7dcad0bb8933ab2adc56b7f79ac` |
| Repository evaluator | `2383e27293212a10b05adcaf4f8ee40bd0b7f49c73d1989fce015288dab6f1bb` |
| Exception candidate | `651ea63adeff8c677e26fcc4b72e013e7047a35e3421ae705b0de7eb5a5bf2df` |

All returned evidence sidecars match their corresponding files. The frozen
repository copies are byte-for-byte equal to the returned files.

## Recommendation

Approve the narrowly bounded provenance exception.

The evidence establishes that all mandatory technical admission controls and
the required compensating integrity controls pass. The sole unavailable item
is retained installation-media provenance, which remains explicitly failed
and is governed by the stated residual risk and invalidation rules.

This recommendation does not treat the host as having been admitted yet and
does not recommend or request Stage 3 execution authority in this decision.

## Proposed Founder decision

> I have reviewed the Sprint 30.5 Stage 3 Provenance Exception Founder
> Approval Package and its hash-bound evidence.
>
> I approve the host-specific retained-media provenance exception
> `sprint-30-5-stage-3-founder-qa-01-retained-media-provenance` for the current
> Windows installation on `Founder-QA-01`, manufacturer/model
> `MEDION ERAZER P6605 MD61596`, bound to host-admission SHA-256
> `6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e`.
>
> I acknowledge that `installationMediaEvidencePresent` remains `false` and
> that Oracle cannot cryptographically prove the identity of the original
> installation media. I accept the documented residual risk and invalidation
> conditions.
>
> I authorise the repository to record this exception and the host state
> `admitted-with-founder-provenance-exception` in the Qualification Register
> and directly related Stage 3 admission documentation.
>
> This approval does not authorise Stage 3 execution, certificate trust,
> artifact transfer, package installation, production activity, deployment,
> signing, publication, distribution, remote push, Gate C, Gate 7, Beta or
> Sprint 31.
>
> After the admission record is reconciled, stop and present the final Stage 3
> execution-authority request separately.
