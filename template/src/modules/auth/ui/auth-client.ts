import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/shared/frontend";
import type { AuthClient, AuthResult, AuthUser } from "../ports";

const PREVIEW_USER_KEY = "clubhouse.preview-user";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `preview-${Date.now()}`;
}

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

function createPreviewClient(): AuthClient {
  const readUser = () => {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(PREVIEW_USER_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as AuthUser;
    } catch {
      window.localStorage.removeItem(PREVIEW_USER_KEY);
      return null;
    }
  };

  const saveUser = (user: AuthUser) => {
    window.localStorage.setItem(PREVIEW_USER_KEY, JSON.stringify(user));
  };

  return {
    mode: "preview",
    async getSession() {
      return readUser();
    },
    async signIn(input) {
      const user: AuthUser = {
        id: readUser()?.id ?? createId(),
        email: input.email.trim(),
        displayName: getDisplayName(input.email),
      };
      saveUser(user);
      return {
        user,
        message: "Preview session ready. Connect Supabase when you want real accounts.",
      };
    },
    async signUp(input) {
      const user: AuthUser = {
        id: readUser()?.id ?? createId(),
        email: input.email.trim(),
        displayName: input.displayName.trim(),
      };
      saveUser(user);
      return {
        user,
        message: "Preview account created locally for this browser.",
      };
    },
    async signOut() {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(PREVIEW_USER_KEY);
      }
    },
  };
}

function createSupabaseClient(): AuthClient {
  const supabase = createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL as string,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );

  return {
    mode: "supabase",
    async getSession() {
      const { data } = await supabase.auth.getSession();
      return data.session?.user ? toAuthUser(data.session.user) : null;
    },
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
        message:
          data.user && !data.session ? "Check your email to confirm your account." : undefined,
        error: error?.message,
      };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };
}

export function createAuthClient(): AuthClient {
  if (clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createSupabaseClient();
  }
  return createPreviewClient();
}
