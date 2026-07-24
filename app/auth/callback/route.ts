import { NextResponse, type NextRequest } from "next/server";
import {
  ORACLE_AUTH_ROUTES,
  safeRelativeReturnPath,
} from "@/lib/oracle/services/auth/auth-policy";
import { exchangeAuthCode } from "@/lib/oracle/services/auth/server-auth-service";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRelativeReturnPath(
    request.nextUrl.searchParams.get("next"),
    ORACLE_AUTH_ROUTES.onboarding
  );

  if (!code) {
    return NextResponse.redirect(
      new URL(`${ORACLE_AUTH_ROUTES.signIn}?error=invalid_callback`, request.url)
    );
  }

  const { error } = await exchangeAuthCode(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`${ORACLE_AUTH_ROUTES.signIn}?error=callback_failed`, request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
