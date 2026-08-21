import { AuthClientContainer } from "@/modules/auth/ui/auth-client-container";
import { AuthStory } from "@/modules/auth/ui/auth-story";

export function ClubhouseEntry() {
  return (
    <AuthClientContainer>
      <AuthStory />
    </AuthClientContainer>
  );
}
