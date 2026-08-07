# Sprint 30.5 Stage 4 R5 Application-ID Failure and Correction

## Preserved non-transfer rehearsal failure

The independently verified non-transfer engineering rehearsal bundle
`engineering-rehearsal-stage4-r5-20260806T223122780Z-b00f9571` remains
unchanged. Its manifest SHA-256 is
`e2261da4af91cb650530e63570c84d598b147e565dc56b7c0c063aeef88b965d`.
It is non-qualification, non-authority, non-evidence and non-transfer state.

The split-host rehearsal passed provider admission, isolated private-link
admission, package trust, package installation and runtime-configuration
creation. Direct AppX activation then failed with `HRESULT 0x80270254`, PID
zero and no secondary API error. Windows identifies that HRESULT as
`E_APPLICATION_NOT_REGISTERED`.

Founder-QA-01 removed the package, trust, runtime configuration and private-link
state with zero residue. The preserved installed result SHA-256 is
`ad4f37e6d49a1e4a3db6dc0f2c73cbd194d5916d21cb8a8b07f0416ac9c3dc5b`.
The returned failure record SHA-256 is
`77278d3270df5b51f3864487145d567ea256a383add168c73c6443821463819a`.
Main-PC provider teardown passed with zero residue at SHA-256
`fc9e8eec25d88e5db6e0cfe9cd160879bcceed8fd9eaedb00c5ee7fd84e07c8d`,
and its private-link state was restored and removed. No authority or attempt
was created.

## Root cause

The R5 execution overlay declared package application ID
`Oracle.Platform.LocalCertification`. The immutable accepted R8 MSIX manifest
declares exactly one application with:

- `Id="Oracle"`;
- `Executable="Oracle.exe"`; and
- `EntryPoint="Windows.FullTrustApplication"`.

R5 therefore constructed the nonexistent AppUserModelId
`Oracle.Platform.LocalCertification_2hnkknkjbzac2!Oracle.Platform.LocalCertification`.
Accepted Stage 3 R13 evidence proves the same R8 package successfully activated
as `Oracle.Platform.LocalCertification_2hnkknkjbzac2!Oracle` with HRESULT zero
and a nonzero process ID.

## Batched correction and prevention

The execution overlay now binds `package.appId` to the exact immutable manifest
value `Oracle`. The shared execution-contract validator rejects every rehearsal
bundle, governed transfer, verification or provider path whose app ID differs.

A new non-qualification regression opens the exact hash-bound R8 MSIX, parses
`AppxManifest.xml`, requires exactly one application, and verifies its ID,
executable and entry point. It then constructs the full AUMID and requires exact
parity with the accepted successful R13 activation record. This closes the
previous gap where activation behavior was mocked without binding the mock to
the immutable package manifest.

The correction changes no product artifact, accepted R8/R13 evidence, provider
topology, journey requirement, authority boundary or retry rule. No governed
transfer, authority, attempt or qualification state is created by this work.
