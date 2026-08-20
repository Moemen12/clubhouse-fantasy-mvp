export const SQUAD_LIMIT = 5;
export const BUDGET_LIMIT = 50;

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

export function isTeamComplete(team: TeamState, players: Player[]): boolean {
  if (team.selectedPlayerIds.length !== SQUAD_LIMIT || !team.captainId) {
    return false;
  }

  const positions = team.selectedPlayerIds.map(
    (playerId) => getPlayer(playerId, players)?.position,
  );

  return (
    positions.filter((position) => position === "GK").length === 1 &&
    positions.filter((position) => position === "DEF").length === 2 &&
    positions.filter((position) => position === "MID").length === 1 &&
    positions.filter((position) => position === "FWD").length === 1
  );
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

  if (!isTeamComplete(team, players)) {
    return "Your squad needs 1 goalkeeper, 2 defenders, 1 midfielder, and 1 striker.";
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
