import { AuthEntry, AuthStory } from "@/modules/auth";
import { submitAuthFormAction } from "./auth/actions";

export function ClubhouseEntry() {
  return (
    <AuthEntry authAction={submitAuthFormAction}>
      <AuthStory />
    </AuthEntry>
  );
}
