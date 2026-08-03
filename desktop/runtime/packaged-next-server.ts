import {
  utilityProcess,
  type UtilityProcess,
} from "electron";
import {
  createServer,
  connect,
} from "node:net";
import { join } from "node:path";
import type {
  InstalledRuntimeEnvironment,
} from "./installed-runtime-configuration.js";

const LOOPBACK_HOST = "127.0.0.1";
const STARTUP_TIMEOUT_MS = 15_000;

export class OraclePackagedNextServer {
  private process: UtilityProcess | null = null;

  async start(
    resourcesPath: string,
    environment: InstalledRuntimeEnvironment
  ): Promise<string> {
    if (this.process) {
      throw new Error("Packaged Next.js server is already running.");
    }

    const port = await reserveLoopbackPort();
    const serverPath = join(resourcesPath, "app", "next", "server.js");
    const child = utilityProcess.fork(serverPath, [], {
      serviceName: "Oracle Packaged Renderer",
      env: {
        ...environment,
        NODE_ENV: "production",
        HOSTNAME: LOOPBACK_HOST,
        PORT: String(port),
      },
      stdio: "pipe",
    });
    this.process = child;

    child.stdout?.on("data", () => {
      // Runtime output may contain provider data and is never retained.
    });
    child.stderr?.on("data", () => {
      // Runtime output may contain provider data and is never retained.
    });

    try {
      await waitForLoopback(port, STARTUP_TIMEOUT_MS);
    } catch (error) {
      child.kill();
      this.process = null;
      throw error;
    }
    return `http://${LOOPBACK_HOST}:${port}/companion`;
  }

  stop(): void {
    this.process?.kill();
    this.process = null;
  }
}

async function reserveLoopbackPort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, LOOPBACK_HOST, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a loopback port."));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitForLoopback(
  port: number,
  timeoutMs: number
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canConnect(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Packaged Next.js server did not become ready.");
}

async function canConnect(port: number): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = connect({ host: LOOPBACK_HOST, port });
    socket.setTimeout(250);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}
