"use client";

import { StudioExperience } from "./studio/studio-experience";

type FantasyDashboardProps = Readonly<{
  managerName?: string;
}>;

export function FantasyDashboard({ managerName = "Marcus Khan" }: FantasyDashboardProps) {
  return <StudioExperience managerName={managerName} />;
}
