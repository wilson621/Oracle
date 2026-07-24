"use client";

import { createClient } from "@/lib/supabase-client";

export function createBrowserAuthService() {
  const auth = createClient().auth;

  return Object.freeze({
    signUp: auth.signUp.bind(auth),
    signInWithPassword: auth.signInWithPassword.bind(auth),
    sendMagicLink: auth.signInWithOtp.bind(auth),
    signInWithPasskey: auth.signInWithPasskey.bind(auth),
    registerPasskey: auth.registerPasskey.bind(auth),
    signOutLocal: () => auth.signOut({ scope: "local" }),
    signOutAll: () => auth.signOut({ scope: "global" }),
  });
}
