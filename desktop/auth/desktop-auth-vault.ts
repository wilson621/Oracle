import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { safeStorage } from "electron";
import {
  DESKTOP_AUTH_CONTRACT,
  type DesktopStoredAuthState,
  type DesktopTrustedDeviceMetadata,
} from "./desktop-auth-contract.js";

export class DesktopAuthVault {
  constructor(private readonly vaultPath: string) {}

  async load(): Promise<DesktopStoredAuthState | null> {
    try {
      const encoded = await readFile(this.vaultPath, "utf8");
      const value: unknown = JSON.parse(encoded);
      return requireStoredState(value);
    } catch (error) {
      if (isMissingFile(error)) return null;
      throw error;
    }
  }

  async store(input: {
    refreshToken: string;
    trustedDevice: DesktopTrustedDeviceMetadata;
    accountId: string;
    operatorId: string | null;
  }): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("OS-protected credential storage is unavailable.");
    }
    if (!input.refreshToken) {
      throw new Error("Desktop refresh token is required.");
    }

    const state: DesktopStoredAuthState = Object.freeze({
      contract: DESKTOP_AUTH_CONTRACT,
      encryptedRefreshToken: safeStorage
        .encryptString(input.refreshToken)
        .toString("base64"),
      trustedDevice: Object.freeze({ ...input.trustedDevice }),
      identifiers: Object.freeze({
        accountId: input.accountId,
        operatorId: input.operatorId,
      }),
    });

    await mkdir(dirname(this.vaultPath), { recursive: true });
    const temporaryPath = `${this.vaultPath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(state), {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    await rename(temporaryPath, this.vaultPath);
  }

  decryptRefreshToken(state: DesktopStoredAuthState): string {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("OS-protected credential storage is unavailable.");
    }
    return safeStorage.decryptString(
      Buffer.from(state.encryptedRefreshToken, "base64")
    );
  }

  async clear(): Promise<void> {
    const cleared: DesktopStoredAuthState = Object.freeze({
      contract: DESKTOP_AUTH_CONTRACT,
      encryptedRefreshToken: "",
      trustedDevice: Object.freeze({
        deviceId: "cleared",
        deviceName: "cleared",
        registeredAt: new Date(0).toISOString(),
        lastRefreshAt: null,
      }),
      identifiers: Object.freeze({
        accountId: "cleared",
        operatorId: null,
      }),
    });
    await mkdir(dirname(this.vaultPath), { recursive: true });
    await writeFile(this.vaultPath, JSON.stringify(cleared), {
      encoding: "utf8",
      mode: 0o600,
    });
  }
}

function requireStoredState(value: unknown): DesktopStoredAuthState | null {
  if (!isRecord(value) || !isRecord(value.contract)) {
    throw new Error("Desktop credential vault is invalid.");
  }
  if (
    value.contract.name !== DESKTOP_AUTH_CONTRACT.name ||
    value.contract.version !== DESKTOP_AUTH_CONTRACT.version
  ) {
    throw new Error("Desktop credential vault contract is unsupported.");
  }
  if (value.encryptedRefreshToken === "") return null;
  if (
    typeof value.encryptedRefreshToken !== "string" ||
    !isRecord(value.trustedDevice) ||
    !isRecord(value.identifiers)
  ) {
    throw new Error("Desktop credential vault is invalid.");
  }

  return value as DesktopStoredAuthState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
