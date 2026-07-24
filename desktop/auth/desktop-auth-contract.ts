export const DESKTOP_AUTH_CONTRACT = Object.freeze({
  name: "oracle.desktop-auth-state" as const,
  version: 1 as const,
});

export type DesktopTrustedDeviceMetadata = Readonly<{
  deviceId: string;
  deviceName: string;
  registeredAt: string;
  lastRefreshAt: string | null;
}>;

export type DesktopSecureIdentifiers = Readonly<{
  accountId: string;
  operatorId: string | null;
}>;

export type DesktopStoredAuthState = Readonly<{
  contract: typeof DESKTOP_AUTH_CONTRACT;
  encryptedRefreshToken: string;
  trustedDevice: DesktopTrustedDeviceMetadata;
  identifiers: DesktopSecureIdentifiers;
}>;

export type DesktopAuthProjection =
  | Readonly<{
      status: "signed-out" | "reauthentication-required";
      reason:
        | null
        | "password-changed"
        | "credentials-revoked"
        | "refresh-token-expired"
        | "account-disabled"
        | "explicit-sign-out";
    }>
  | Readonly<{
      status: "authenticated";
      accountId: string;
      operatorId: string | null;
      deviceId: string;
      expiresAt: string;
    }>;

export type DesktopRefreshResult =
  | Readonly<{
      status: "authenticated";
      accountId: string;
      operatorId: string | null;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>
  | Readonly<{
      status: "reauthentication-required";
      reason:
        | "password-changed"
        | "credentials-revoked"
        | "refresh-token-expired"
        | "account-disabled";
    }>;

export interface DesktopRefreshProvider {
  refresh(refreshToken: string): Promise<DesktopRefreshResult>;
  revoke(accessToken: string | null): Promise<void>;
}
