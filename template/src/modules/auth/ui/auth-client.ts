import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/shared/frontend";
import type { AuthClient, AuthResult, AuthUser } from "../ports";

function getDisplayName(email: string, metadata?: Record<string, unknown> | null) {
  const metadataName = metadata?.display_name;
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }
  return email.split("@")[0]?.replace(/[._-]/g, " ") || "Manager";
}

function toAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): AuthUser | null {
  if (!user.email) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    displayName: getDisplayName(user.email, user.user_metadata),
  };
}

function createSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey, NEXT_PUBLIC_SUPABASE_URL: url } =
    clientEnv;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient(url, publishableKey, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

const authClient: AuthClient = {
  async signIn(input): Promise<AuthResult> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    return {
      user: data.user ? toAuthUser(data.user) : null,
      error: error?.message,
    };
  },

  async signUp(input): Promise<AuthResult> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { display_name: input.displayName },
      },
    });

    return {
      user: data.session?.user ? toAuthUser(data.session.user) : null,
      error:
        error?.message ??
        (data.session
          ? undefined
          : "Supabase returned no session. Disable Confirm email in Supabase Auth settings for direct sign-in."),
    };
  },

  async signOut() {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
  },
};

export function createAuthClient(): AuthClient {
  return authClient;
}
