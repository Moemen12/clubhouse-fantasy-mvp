"use client";

import { StudioExperience } from "./studio/studio-experience";

type FantasyDashboardProps = Readonly<{
  managerName?: string;
  logoutAction: () => Promise<never>;
}>;

export function FantasyDashboard({
  managerName = "Marcus Khan",
  logoutAction,
}: FantasyDashboardProps) {
  return <StudioExperience logoutAction={logoutAction} managerName={managerName} />;
}
