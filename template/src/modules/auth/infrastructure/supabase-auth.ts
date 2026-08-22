import { createSupabaseServerClient } from "@/shared/backend";
import type { SupabaseCookieStore } from "@/shared/backend";
import type { AuthClient, AuthResult, AuthUser } from "../ports";

function getDisplayName(email: string, metadata?: Record<string, unknown> | null): string {
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

export function createServerAuthClient(cookieStore: SupabaseCookieStore): AuthClient {
  const supabase = createSupabaseServerClient(cookieStore);

  return {
    async signIn(input): Promise<AuthResult> {
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
      await supabase.auth.signOut();
    },
  };
}
