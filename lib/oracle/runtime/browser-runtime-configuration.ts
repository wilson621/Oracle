"use client";

import {
  ORACLE_RUNTIME_SUPABASE_ANON_KEY_META,
  ORACLE_RUNTIME_SUPABASE_URL_META,
  validatePublicRuntimeConfiguration,
} from "./public-runtime-configuration";

export function getBrowserPublicRuntimeConfiguration() {
  if (typeof document === "undefined") {
    // Client components render once on the server (no DOM exists yet) before
    // Next.js hands off to the browser. Nothing produced during that pass is
    // ever used to make a real call, so return a harmless placeholder instead
    // of throwing. The browser re-runs this immediately on mount and reads
    // the real values from the <meta> tags the server actually rendered.
    return validatePublicRuntimeConfiguration(
      "http://127.0.0.1",
      "ssr-placeholder-unused-00000000000000"
    );
  }
  return validatePublicRuntimeConfiguration(
    readUniqueMeta(ORACLE_RUNTIME_SUPABASE_URL_META),
    readUniqueMeta(ORACLE_RUNTIME_SUPABASE_ANON_KEY_META)
  );
}

type BrowserDocument = Readonly<{
  querySelectorAll: (
    selector: string
  ) => ReadonlyArray<Readonly<{ content: string }>>;
}>;

function readUniqueMeta(name: string): string {
  const browser = globalThis as unknown as Readonly<{
    document?: BrowserDocument;
  }>;
  const elements = browser.document?.querySelectorAll(
    `meta[name="${name}"]`
  );
  if (!elements || elements.length !== 1) {
    throw new Error("Oracle public runtime configuration is unavailable.");
  }
  return elements[0].content;
}
