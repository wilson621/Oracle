# Sprint 30.5 Stage 2 Requalification R8 Implementation

Status: COMPLETE - QUALIFICATION-READY PREPARATION ONLY
Date: 6 August 2026

## Engineering freeze

The engineering workstation validates the exact corrected source, builds Electron and native helpers, creates package version `0.1.6.0`, generates a bounded local-test certificate, signs the executable set, MSIX and detached release manifest, verifies the release, destroys all private signing material and removes exact certificate-store state before publishing a create-only freeze record.

Accepted freeze:

- preparation ID: `candidate-r8-20260806T120629088Z-f79fe50d`
- build harness commit: `06b2ec412515640fd49e66c175637b84546146d6`
- package SHA-256: `97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490`
- public certificate SHA-256: `78eb64dc769a87cbe82620a8d7bb6da655bdc2d38fe87f58b5c90f3c672492b2`
- freeze SHA-256: `f8c7ec7d020ba717efb9f036350c189221debe53a58a45374aa5c252af695361`
- exact release inventory: 10 files
- private signing material: destroyed
- certificate-store residue: zero

## Clean-host runtime

The transferred runtime surface is four files: the R8 contract, `Oracle.Stage2R8CleanHostCore.ps1`, `Invoke-OracleStage2R8FounderHandoff.ps1`, and `Invoke-OracleStage2R8Qualification.ps1`. It has no development-tool dependency. The core verifies transfer custody and exact payload parity, rejects repository/tooling or non-zero Oracle state, verifies signatures and identity, and guarantees exact trust removal.

The package canary scan uses a bounded 1 MiB streaming window with overlap equal to the longest admitted encoding minus one byte. It detects UTF-8, UTF-16LE and chunk-boundary values without loading every unpacked file or executing a byte-by-byte PowerShell nested loop.

## Authority controls

The accepted freeze did not itself create execution authority. The later execution overlay binds one exact Founder grant and transfer identity. `prepare-transfer.mjs` rejects every other identity, while the clean-host qualification script rejects mismatched grant, contract, transfer, custody or independent-verification records before authority creation.


## Post-transfer admission correction

The first immutable execution transfer independently verified but failed clean-host admission before handoff because Node and Windows PowerShell produced different case-orderings for the same exact inventory. The repository correction compares exact paths through ordinal dictionaries and sets rather than array indexes. Permuted order passes; case, hash and duplicate-path adversarial fixtures fail. The failed transfer remains unchanged, and replacement execution is not authorised.


## Corrected replacement binding

The accepted correction baseline is bound to one fresh replacement transfer and grant. The new manifest, custody and independent-verification records must carry the immutable predecessor transfer ID. Historical transfer admission remains schema-compatible, while every replacement record requires exact predecessor-lineage parity.


## Replacement transfer seal

The one corrected replacement transfer was built from committed baseline e9c0cb0e4da8955935cbb090b332617849e4d125, independently verified, admitted by its embedded PowerShell core and copied create-only to the governed USB namespace. The USB copy passed full 18-file hash parity. Source transfer creation is closed; qualification state remains absent pending physical clean-host handoff.
