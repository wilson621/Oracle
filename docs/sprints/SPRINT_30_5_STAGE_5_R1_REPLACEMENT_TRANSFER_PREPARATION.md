# Sprint 30.5 Stage 5 R1 Replacement Transfer Preparation

**Status:** Replacement-authority overlay complete; transfer pending
**Overlay commit:** `506321c625585f52c6eda74eae6a9b4660771ef4`
**Overlay tree:** `ceee847212ae58be671792c419c4cd6be8ec152c`
**Authority/attempt counts:** Zero / zero
**Last Reviewed:** 4 August 2026

The Founder-authorised replacement-transfer overlay binds corrected engineering
commit `39f67217f7c609f331b21b0a72731a697b084c78` and accepted correction
closure `a051fb2509314bff979acfb0fe61c5aad8829350`.

The execution contract records two possible transfer histories: the preserved
immutable failed transfer and exactly one fresh replacement. Only the
replacement can be admitted. Maximum admissible transfers remains one; maximum
authorities and attempts remain one each; retry remains prohibited.

Transfer preparation must first rehash the failed transfer's manifest, custody
and independent-verification records and prove it is the only existing transfer
directory. The replacement manifest, custody and independent verification must
bind the failed identity and hashes, the accepted correction, a fresh identity,
and the clean pushed execution HEAD. Laptop admission explicitly rejects the
failed identity.

No transfer, authority, attempt, qualification evidence or product change was
created by this overlay. Stage 6 remains unauthorised.
