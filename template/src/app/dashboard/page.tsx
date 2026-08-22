import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/auth/actions";
import { FantasyDashboard } from "@/modules/fantasy/ui";
import { createSupabaseServerClient } from "@/shared/backend";
import { ROUTES } from "@/shared/kernel";

function getManagerName(email: string, metadata: Record<string, unknown> | null) {
  const metadataName = metadata?.display_name;
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }
  return email.split("@")[0]?.replace(/[._-]/g, " ") || "Manager";
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Server Components cannot always write cookies. Proxy owns refresh persistence.
      }
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) {
    redirect(ROUTES.AUTH.ROOT);
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    redirect(ROUTES.AUTH.ROOT);
  }

  return (
    <FantasyDashboard
      logoutAction={signOutAction}
      managerName={getManagerName(userData.user.email, userData.user.user_metadata)}
    />
  );
}
