export const ORACLE_AUTH_POLICY = Object.freeze({
  canonicalMethod: "email-password" as const,
  emailVerificationRequired: true,
  rememberMeDefault: true,
  webIdleTimeoutDays: 30,
  recentAuthenticationMinutes: 15,
  optionalMethodsAfterVerification: Object.freeze([
    "passkey",
    "magic-link",
  ] as const),
  futureMethods: Object.freeze(["oauth"] as const),
});

export class RecentAuthenticationRequiredError extends Error {
  readonly code = "RECENT_AUTHENTICATION_REQUIRED";

  constructor() {
    super("Recent authentication is required for this account operation.");
    this.name = "RecentAuthenticationRequiredError";
  }
}

export function requireRecentAuthentication(
  lastSignInAt: string | null | undefined,
  now = new Date()
): void {
  const signedInAt = lastSignInAt ? new Date(lastSignInAt) : null;
  const maximumAge =
    ORACLE_AUTH_POLICY.recentAuthenticationMinutes * 60 * 1000;
  if (
    !signedInAt ||
    Number.isNaN(signedInAt.getTime()) ||
    now.getTime() - signedInAt.getTime() > maximumAge
  ) {
    throw new RecentAuthenticationRequiredError();
  }
}

export const ORACLE_AUTH_ROUTES = Object.freeze({
  signIn: "/auth",
  verifyEmail: "/auth/verify-email",
  callback: "/auth/callback",
  onboarding: "/onboarding",
  authenticatedHome: "/oracle",
});

export function safeRelativeReturnPath(
  value: string | null,
  fallback: string = ORACLE_AUTH_ROUTES.authenticatedHome
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    containsControlCharacter(value)
  ) {
    return fallback;
  }

  return value;
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      codePoint !== undefined &&
      (codePoint <= 0x1f || codePoint === 0x7f)
    );
  });
}
