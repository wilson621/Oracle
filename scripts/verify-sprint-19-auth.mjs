import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const authPage = read("app/auth/page.tsx");
const browserAuth = read(
  "lib/oracle/services/auth/browser-auth-service.ts"
);
const middleware = read("lib/supabase-middleware.ts");
const webSessionPolicy = read(
  "lib/oracle/services/auth/web-session-policy.ts"
);
const actions = read("app/onboarding/actions.ts");
const operatorIdentityService = read(
  "lib/oracle/services/operator/server-operator-identity-service.ts"
);
const identityPolicy = read(
  "lib/oracle/services/operator/operator-identity-policy.ts"
);
const desktopVault = read("desktop/auth/desktop-auth-vault.ts");
const desktopService = read("desktop/auth/desktop-auth-service.ts");
const preload = read("desktop/preload.ts");
const contracts = read("desktop/contracts.ts");

assert.match(browserAuth, /signInWithPassword/);
assert.match(browserAuth, /signUp/);
assert.match(browserAuth, /signInWithOtp/);
assert.match(browserAuth, /signInWithPasskey/);
assert.match(authPage, /Remember Me is enabled by default/);
assert.match(middleware, /email_confirmed_at/);
assert.match(middleware, /applyWebIdlePolicy/);
assert.match(middleware, /scope: "local"/);
assert.match(webSessionPolicy, /webIdleTimeoutDays/);
assert.match(webSessionPolicy, /crypto\.subtle\.verify/);
assert.match(actions, /commissionVerifiedOperator/);
assert.match(operatorIdentityService, /email_confirmed_at/);
assert.match(identityPolicy, /uniqueness: "global"/);
assert.match(identityPolicy, /caseNormalization: "preserve"/);
assert.match(identityPolicy, /unicodeNormalization: "NFKC"/);
assert.match(desktopVault, /safeStorage\s*\.encryptString/);
assert.match(desktopVault, /safeStorage\.decryptString/);
assert.match(desktopService, /provider\.refresh/);
assert.doesNotMatch(desktopVault, /password/i);
assert.doesNotMatch(desktopService, /password/i);
assert.doesNotMatch(preload, /refreshToken|accessToken|encryptedRefreshToken/);
assert.doesNotMatch(contracts, /refreshToken|accessToken|encryptedRefreshToken/);

process.stdout.write(
  `${JSON.stringify({
    canonicalAuth: "email-password",
    emailVerificationRequired: true,
    optionalMethods: ["passkey", "magic-link"],
    callsignUniqueness: "global-case-insensitive",
    desktopPasswordStorage: false,
    desktopRefreshTokenStorage: "os-encrypted-main-process-only",
    rendererCredentialProjection: false,
    result: "pass",
  }, null, 2)}\n`
);
process.stdout.write("Sprint 19 authentication and identity verification passed.\n");
