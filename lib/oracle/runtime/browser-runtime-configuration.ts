"use client";

import {
  ORACLE_RUNTIME_SUPABASE_ANON_KEY_META,
  ORACLE_RUNTIME_SUPABASE_URL_META,
  validatePublicRuntimeConfiguration,
} from "./public-runtime-configuration";

export function getBrowserPublicRuntimeConfiguration() {
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
