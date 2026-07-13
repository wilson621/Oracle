import type { OracleDesktopBridge } from "@/desktop/contracts";

declare global {
  interface Window {
    oracleDesktop?: OracleDesktopBridge;
  }
}

export {};