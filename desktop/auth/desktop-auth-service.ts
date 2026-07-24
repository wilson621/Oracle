import {
  type DesktopAuthProjection,
  type DesktopRefreshProvider,
  type DesktopTrustedDeviceMetadata,
} from "./desktop-auth-contract.js";
import { DesktopAuthVault } from "./desktop-auth-vault.js";

export class DesktopAuthService {
  private accessToken: string | null = null;
  private projection: DesktopAuthProjection = Object.freeze({
    status: "signed-out",
    reason: null,
  });

  constructor(
    private readonly vault: DesktopAuthVault,
    private readonly provider: DesktopRefreshProvider,
    private readonly now = () => new Date()
  ) {}

  getProjection(): DesktopAuthProjection {
    return structuredClone(this.projection);
  }

  async restore(): Promise<DesktopAuthProjection> {
    const stored = await this.vault.load();
    if (!stored) return this.getProjection();

    const refreshToken = this.vault.decryptRefreshToken(stored);
    return this.applyRefresh(
      await this.provider.refresh(refreshToken),
      stored.trustedDevice
    );
  }

  async acceptAuthenticatedSession(input: {
    accountId: string;
    operatorId: string | null;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    trustedDevice: DesktopTrustedDeviceMetadata;
  }): Promise<DesktopAuthProjection> {
    await this.vault.store(input);
    this.accessToken = input.accessToken;
    this.projection = Object.freeze({
      status: "authenticated",
      accountId: input.accountId,
      operatorId: input.operatorId,
      deviceId: input.trustedDevice.deviceId,
      expiresAt: input.expiresAt,
    });
    return this.getProjection();
  }

  async refresh(): Promise<DesktopAuthProjection> {
    const stored = await this.vault.load();
    if (!stored) return this.getProjection();
    return this.applyRefresh(
      await this.provider.refresh(this.vault.decryptRefreshToken(stored)),
      stored.trustedDevice
    );
  }

  async signOut(): Promise<DesktopAuthProjection> {
    await this.provider.revoke(this.accessToken);
    this.accessToken = null;
    await this.vault.clear();
    this.projection = Object.freeze({
      status: "reauthentication-required",
      reason: "explicit-sign-out",
    });
    return this.getProjection();
  }

  private async applyRefresh(
    result: Awaited<ReturnType<DesktopRefreshProvider["refresh"]>>,
    device: DesktopTrustedDeviceMetadata
  ): Promise<DesktopAuthProjection> {
    if (result.status === "reauthentication-required") {
      this.accessToken = null;
      await this.vault.clear();
      this.projection = Object.freeze(result);
      return this.getProjection();
    }

    const refreshedDevice = Object.freeze({
      ...device,
      lastRefreshAt: this.now().toISOString(),
    });
    await this.vault.store({
      refreshToken: result.refreshToken,
      trustedDevice: refreshedDevice,
      accountId: result.accountId,
      operatorId: result.operatorId,
    });
    this.accessToken = result.accessToken;
    this.projection = Object.freeze({
      status: "authenticated",
      accountId: result.accountId,
      operatorId: result.operatorId,
      deviceId: device.deviceId,
      expiresAt: result.expiresAt,
    });
    return this.getProjection();
  }
}
