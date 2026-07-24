import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ORACLE_AUTH_ROUTES,
  safeRelativeReturnPath,
} from "@/lib/oracle/services/auth/auth-policy";
import { applyWebIdlePolicy } from "@/lib/oracle/services/auth/web-session-policy";

const PUBLIC_PATHS = [
  "/auth",
] as const;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  let currentUser = data.user;
  if (currentUser?.email_confirmed_at) {
    const idleState = await applyWebIdlePolicy(
      request,
      response,
      currentUser,
      () => supabase.auth.signOut({ scope: "local" })
    );
    if (idleState === "expired") currentUser = null;
  }
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (currentUser && !currentUser.email_confirmed_at && !isPublic) {
    const destination = request.nextUrl.clone();
    destination.pathname = ORACLE_AUTH_ROUTES.verifyEmail;
    destination.search = "";
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    response = redirect;
  } else if (!currentUser && !isPublic) {
    const destination = request.nextUrl.clone();
    destination.pathname = ORACLE_AUTH_ROUTES.signIn;
    destination.search = "";
    destination.searchParams.set(
      "next",
      safeRelativeReturnPath(`${pathname}${request.nextUrl.search}`)
    );
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    response = redirect;
  } else if (
    currentUser?.email_confirmed_at &&
    pathname === ORACLE_AUTH_ROUTES.signIn
  ) {
    const destination = request.nextUrl.clone();
    destination.pathname = safeRelativeReturnPath(
      request.nextUrl.searchParams.get("next")
    );
    destination.search = "";
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    response = redirect;
  }

  return response;
}
