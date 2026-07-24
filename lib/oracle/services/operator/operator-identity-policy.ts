import {
  OPERATOR_COMMISSIONING_POLICY_CONTRACT,
  type OperatorCommissioningPolicy,
} from "./operator-provisioning-types";

export const INITIAL_RESERVED_CALLSIGNS = Object.freeze([
  "Oracle",
  "Admin",
  "Administrator",
  "System",
  "Support",
  "Moderator",
  "Developer",
  "Founder",
] as const);

export const ORACLE_OPERATOR_IDENTITY_POLICY = Object.freeze({
  identityIsPermanent: true,
  callsignChangeTokenMaximum: 3,
  callsignTokenRestorationMonths: 6,
  callsignQuarantineMonths: 12,
  displayNameIsUnique: false,
  displayNameIsMutable: true,
  initialUnicodeMode: "ascii-only" as const,
});

export const ORACLE_COMMISSIONING_POLICY: OperatorCommissioningPolicy =
  Object.freeze({
    contract: Object.freeze({
      ...OPERATOR_COMMISSIONING_POLICY_CONTRACT,
    }),
    id: "oracle.founder.callsign",
    policyVersion: "2026-07-24",
    callsign: Object.freeze({
      unicodeNormalization: "NFKC",
      caseNormalization: "preserve",
      minimumLength: 3,
      maximumLength: 32,
      allowedPattern: "^[A-Za-z0-9](?:[A-Za-z0-9 _-]*[A-Za-z0-9])?$",
      reserved: INITIAL_RESERVED_CALLSIGNS,
      reservedComparison: "case-insensitive",
      uniqueness: "global",
    }),
  });
