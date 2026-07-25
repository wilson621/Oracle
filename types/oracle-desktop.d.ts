import type { OracleDesktopBridge } from "@/desktop/contracts";
import type { OracleDesktopReleaseBridge } from "@/desktop/release/desktop-release-contract";

declare global {
  interface Window {
    oracleDesktop?: OracleDesktopBridge;
    oracleDesktopRelease?: OracleDesktopReleaseBridge;
  }
}

export {};
