import { AuthClientContainer, AuthStory } from "@/modules/auth";
import type { AuthFormAction } from "@/modules/auth/contracts";

type ClubhouseEntryProps = Readonly<{
  authAction: AuthFormAction;
}>;

export function ClubhouseEntry({ authAction }: ClubhouseEntryProps) {
  return (
    <AuthClientContainer authAction={authAction}>
      <AuthStory />
    </AuthClientContainer>
  );
}
