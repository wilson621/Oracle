import type { User } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import { ORACLE_AUTH_POLICY } from "./auth-policy";

const IDLE_COOKIE = "oracle.web.last-activity";
const IDLE_SECONDS = ORACLE_AUTH_POLICY.webIdleTimeoutDays * 24 * 60 * 60;

export async function applyWebIdlePolicy(
  request: NextRequest,
  response: NextResponse,
  user: User,
  signOut: () => Promise<unknown>,
  now = new Date()
): Promise<"active" | "expired"> {
  const secret =
    process.env.ORACLE_WEB_SESSION_SECRET ??
    process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("Oracle web session integrity configuration is unavailable.");
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);
  const cookie = request.cookies.get(IDLE_COOKIE)?.value;
  const lastSignInSeconds = user.last_sign_in_at
    ? Math.floor(new Date(user.last_sign_in_at).getTime() / 1000)
    : 0;
  const cookieActivity = cookie
    ? await verifyActivity(cookie, secret)
    : null;
  const lastActivity = cookieActivity ?? lastSignInSeconds;

  if (
    !Number.isFinite(lastActivity) ||
    lastActivity <= 0 ||
    nowSeconds - lastActivity > IDLE_SECONDS
  ) {
    await signOut();
    response.cookies.delete(IDLE_COOKIE);
    return "expired";
  }

  response.cookies.set({
    name: IDLE_COOKIE,
    value: await signActivity(nowSeconds, secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: IDLE_SECONDS,
  });
  return "active";
}

async function signActivity(seconds: number, secret: string): Promise<string> {
  const payload = String(seconds);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret, ["sign"]),
    new TextEncoder().encode(payload)
  );
  return `${payload}.${toHex(signature)}`;
}

async function verifyActivity(
  value: string,
  secret: string
): Promise<number | null> {
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra || !/^[0-9]+$/u.test(payload)) {
    return null;
  }
  const valid = await crypto.subtle.verify(
    "HMAC",
    await importKey(secret, ["verify"]),
    fromHex(signature),
    new TextEncoder().encode(payload)
  );
  return valid ? Number(payload) : null;
}

function importKey(secret: string, usages: KeyUsage[]) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

function toHex(value: ArrayBuffer): string {
  return [...new Uint8Array(value)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[0-9a-f]{64}$/iu.test(value)) {
    return new Uint8Array();
  }
  return Uint8Array.from(
    value.match(/.{2}/gu) ?? [],
    (pair) => Number.parseInt(pair, 16)
  );
}
