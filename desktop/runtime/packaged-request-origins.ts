export function createPackagedRequestOrigins(
  rendererOrigin: string,
  providerOrigin?: string
): ReadonlySet<string> {
  const renderer = requireOrigin(rendererOrigin, true);
  const origins = new Set<string>([renderer]);

  if (providerOrigin) {
    const provider = requireOrigin(providerOrigin, false);
    origins.add(provider);
    const websocket = new URL(provider);
    websocket.protocol = websocket.protocol === "https:" ? "wss:" : "ws:";
    origins.add(websocket.origin);
  }

  return origins;
}

export function isAllowedPackagedRequestUrl(
  requestUrl: string,
  allowedOrigins: ReadonlySet<string>
): boolean {
  try {
    return allowedOrigins.has(new URL(requestUrl).origin);
  } catch {
    return false;
  }
}

function requireOrigin(value: string, renderer: boolean): string {
  const url = new URL(value);
  const secure = url.protocol === "https:";
  const loopback =
    url.protocol === "http:" && url.hostname === "127.0.0.1";
  if (
    (!secure && !loopback) ||
    url.origin !== value ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (!renderer && !secure && !loopback)
  ) {
    throw new Error(
      renderer
        ? "Packaged renderer origin is invalid."
        : "Packaged provider origin is invalid."
    );
  }
  return url.origin;
}
