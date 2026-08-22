export const SQUAD_LIMIT = 5;
export const BUDGET_LIMIT = 50;

export const REQUIRED_FORMATION: Record<PlayerPosition, number> = {
  GK: 1,
  DEF: 2,
  MID: 1,
  FWD: 1,
};

export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export type Player = {
  id: string;
  name: string;
  club: string;
  position: PlayerPosition;
  price: number;
  form: number;
  color: string;
  initials: string;
  performance: {
    minutes: number;
    goals: number;
    assists: number;
    bonus: number;
  };
};

export type TeamState = {
  selectedPlayerIds: string[];
  captainId: string | null;
};

export type PlayerScore = {
  playerId: string;
  basePoints: number;
  captainMultiplier: number;
  finalPoints: number;
  reasons: string[];
};

export type TeamScore = {
  totalPoints: number;
  playerScores: PlayerScore[];
};

export function getSquadCost(team: TeamState, players: Player[]): number {
  return team.selectedPlayerIds.reduce((total, playerId) => {
    const player = players.find((candidate) => candidate.id === playerId);
    return total + (player?.price ?? 0);
  }, 0);
}

export function getPlayer(playerId: string, players: Player[]): Player | undefined {
  return players.find((player) => player.id === playerId);
}

const positionNames: Record<PlayerPosition, string> = {
  GK: "keeper",
  DEF: "defender",
  MID: "midfielder",
  FWD: "forward",
};

export type FormationStatus = {
  counts: Record<PlayerPosition, number>;
  missing: PlayerPosition[];
  excess: PlayerPosition[];
  isValid: boolean;
};

export function getFormationStatus(team: TeamState, players: Player[]): FormationStatus {
  const counts: Record<PlayerPosition, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  team.selectedPlayerIds.forEach((playerId) => {
    const position = getPlayer(playerId, players)?.position;
    if (position) counts[position] += 1;
  });

  const positions = Object.keys(REQUIRED_FORMATION) as PlayerPosition[];
  const missing = positions.flatMap((position) =>
    Array.from(
      { length: Math.max(0, REQUIRED_FORMATION[position] - counts[position]) },
      () => position,
    ),
  );
  const excess = positions.flatMap((position) =>
    Array.from(
      { length: Math.max(0, counts[position] - REQUIRED_FORMATION[position]) },
      () => position,
    ),
  );

  return { counts, missing, excess, isValid: missing.length === 0 && excess.length === 0 };
}

export function isTeamComplete(team: TeamState, players: Player[]): boolean {
  if (team.selectedPlayerIds.length !== SQUAD_LIMIT || !team.captainId) {
    return false;
  }

  return getFormationStatus(team, players).isValid;
}

export function getFormationMessage(status: FormationStatus): string {
  if (status.isValid) return "Formation is locked: 1 keeper, 2 defenders, 1 midfielder, 1 forward.";

  const missingLabels = status.missing.map((position) => positionNames[position]);
  const excessLabels = status.excess.map((position) => positionNames[position]);

  if (missingLabels.length > 0 && excessLabels.length > 0) {
    return `Need ${missingLabels.join(", ")}; remove one ${excessLabels[0]}.`;
  }
  if (missingLabels.length > 0)
    return `Need ${missingLabels.join(", ")} to complete the formation.`;
  return `Remove an extra ${excessLabels[0]} to complete the formation.`;
}

export function getValidationMessage(team: TeamState, players: Player[]): string | null {
  const cost = getSquadCost(team, players);

  if (cost > BUDGET_LIMIT) {
    return `Trim ${cost - BUDGET_LIMIT} credits from your squad.`;
  }

  if (team.selectedPlayerIds.length === 0) {
    return "Start by adding a goalkeeper to your squad.";
  }

  if (team.selectedPlayerIds.length < SQUAD_LIMIT) {
    return `Add ${SQUAD_LIMIT - team.selectedPlayerIds.length} more players to complete your squad.`;
  }

  const formation = getFormationStatus(team, players);
  if (!formation.isValid) {
    return getFormationMessage(formation);
  }

  if (!team.captainId) {
    return "Choose a captain before submitting your team.";
  }

  return null;
}

export function calculateTeamScore(team: TeamState, players: Player[]): TeamScore {
  const playerScores = team.selectedPlayerIds.flatMap((playerId) => {
    const player = getPlayer(playerId, players);
    if (!player) return [];

    const { minutes, goals, assists, bonus } = player.performance;
    const basePoints = Math.floor(minutes / 45) + goals * 5 + assists * 3 + bonus;
    const captainMultiplier = player.id === team.captainId ? 2 : 1;

    return [
      {
        playerId: player.id,
        basePoints,
        captainMultiplier,
        finalPoints: basePoints * captainMultiplier,
        reasons: [
          `${Math.floor(minutes / 45)} for match time`,
          `${goals * 5} for ${goals === 1 ? "a goal" : `${goals} goals`}`,
          `${assists * 3} for ${assists === 1 ? "an assist" : `${assists} assists`}`,
          `${bonus} form bonus`,
        ],
      },
    ];
  });

  return {
    totalPoints: playerScores.reduce((total, score) => total + score.finalPoints, 0),
    playerScores,
  };
}
