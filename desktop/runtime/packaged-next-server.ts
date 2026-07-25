import {
  utilityProcess,
  type UtilityProcess,
} from "electron";
import {
  createServer as createHttpServer,
  type Server as HttpServer,
} from "node:http";
import {
  createServer,
  connect,
} from "node:net";
import { join } from "node:path";

const LOOPBACK_HOST = "127.0.0.1";
const STARTUP_TIMEOUT_MS = 15_000;

export class OraclePackagedNextServer {
  private process:
    UtilityProcess | null = null;
  private fallbackServer:
    HttpServer | null = null;

  async start(
    resourcesPath: string
  ): Promise<string> {
    if (
      this.process ||
      this.fallbackServer
    ) {
      throw new Error(
        "Packaged Next.js server is already running."
      );
    }

    const port =
      await reserveLoopbackPort();
    if (!hasConfiguredPublicRuntime()) {
      this.fallbackServer =
        await startUnavailableServer(port);
      return `http://${LOOPBACK_HOST}:${port}/companion`;
    }

    const serverPath = join(
      resourcesPath,
      "app",
      "next",
      "server.js"
    );

    const child = utilityProcess.fork(
      serverPath,
      [],
      {
        serviceName:
          "Oracle Packaged Renderer",
        env: {
          ...publicRuntimeEnvironment(),
          NODE_ENV: "production",
          HOSTNAME: LOOPBACK_HOST,
          PORT: String(port),
        },
        stdio: "pipe",
      }
    );

    this.process = child;

    child.stdout?.on("data", () => {
      // Renderer-server output is never retained.
    });
    child.stderr?.on("data", () => {
      // Renderer-server output is never retained.
    });

    try {
      await waitForLoopback(
        port,
        STARTUP_TIMEOUT_MS
      );
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
    this.fallbackServer?.close();
    this.fallbackServer = null;
  }
}

function hasConfiguredPublicRuntime(): boolean {
  return Boolean(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL &&
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function startUnavailableServer(
  port: number
): Promise<HttpServer> {
  const server =
    createHttpServer(
      (_request, response) => {
        response.writeHead(200, {
          "Content-Type":
            "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
          "X-Content-Type-Options":
            "nosniff",
          "Referrer-Policy":
            "no-referrer",
        });
        response.end(
          [
            "<!doctype html>",
            '<html lang="en">',
            "<head>",
            '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width,initial-scale=1">',
            "<title>Oracle local certification build</title>",
            "<style>body{margin:0;background:#090b10;color:#eef2ff;font:16px system-ui;display:grid;min-height:100vh;place-items:center}main{max-width:38rem;padding:2rem}p{color:#aeb8cc;line-height:1.6}.status{color:#f4c76b}</style>",
            "</head>",
            "<body><main>",
            "<h1>Oracle local certification build</h1>",
            '<p class="status">Service configuration unavailable.</p>',
            "<p>This locally packaged build proves Windows packaging and distribution mechanics only. It is not production trusted, published, deployed, externally distributed, or operationally certified.</p>",
            "</main></body></html>",
          ].join("")
        );
      }
    );

  await new Promise<void>(
    (resolve, reject) => {
      server.once("error", reject);
      server.listen(
        port,
        LOOPBACK_HOST,
        () => resolve()
      );
    }
  );
  return server;
}

function publicRuntimeEnvironment():
  Record<string, string> {
  const allowed = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const environment:
    Record<string, string> = {};

  for (const name of allowed) {
    const value = process.env[name];
    if (value) {
      environment[name] = value;
    }
  }

  return environment;
}

async function reserveLoopbackPort():
  Promise<number> {
  return await new Promise(
    (resolve, reject) => {
      const server = createServer();
      server.unref();
      server.on("error", reject);
      server.listen(
        0,
        LOOPBACK_HOST,
        () => {
          const address =
            server.address();
          if (
            !address ||
            typeof address === "string"
          ) {
            server.close();
            reject(
              new Error(
                "Could not allocate a loopback port."
              )
            );
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
        }
      );
    }
  );
}

async function waitForLoopback(
  port: number,
  timeoutMs: number
): Promise<void> {
  const deadline =
    Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await canConnect(port)) return;
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  throw new Error(
    "Packaged Next.js server did not become ready."
  );
}

async function canConnect(
  port: number
): Promise<boolean> {
  return await new Promise(
    (resolve) => {
      const socket = connect({
        host: LOOPBACK_HOST,
        port,
      });
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
    }
  );
}
