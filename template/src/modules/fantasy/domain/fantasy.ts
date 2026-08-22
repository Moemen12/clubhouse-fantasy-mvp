export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export type FormationRows = readonly (readonly PlayerPosition[])[];

export type FormationConfig = Readonly<{
  id: string;
  label: string;
  rows: FormationRows;
}>;

const positionOrder: readonly PlayerPosition[] = ["GK", "DEF", "MID", "FWD"];

const formationPresets = {
  classic: {
    id: "classic",
    label: "Classic 1–2–1–1",
    rows: [["FWD"], ["MID"], ["DEF", "DEF"], ["GK"]],
  },
} as const satisfies Record<string, FormationConfig>;

export const FORMATION_PRESETS = formationPresets;
export const ACTIVE_FORMATION = FORMATION_PRESETS.classic;
export const POSITION_ORDER = positionOrder;
export const BUDGET_LIMIT = 50;

function countPositions(positions: readonly PlayerPosition[]): Record<PlayerPosition, number> {
  const counts: Record<PlayerPosition, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  positions.forEach((position) => {
    counts[position] += 1;
  });
  return counts;
}

function getFormationRequirements(formation: FormationConfig) {
  return countPositions(formation.rows.flat());
}

export const REQUIRED_FORMATION = getFormationRequirements(ACTIVE_FORMATION);
export const SQUAD_LIMIT = Object.values(REQUIRED_FORMATION).reduce(
  (total, count) => total + count,
  0,
);

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
  formationId: string;
  counts: Record<PlayerPosition, number>;
  required: Record<PlayerPosition, number>;
  missing: PlayerPosition[];
  excess: PlayerPosition[];
  isValid: boolean;
};

export function getFormationSlotCount(formation: FormationConfig = ACTIVE_FORMATION): number {
  return formation.rows.flat().length;
}

export function getFormationStatus(
  team: TeamState,
  players: Player[],
  formation: FormationConfig = ACTIVE_FORMATION,
): FormationStatus {
  const required = getFormationRequirements(formation);
  const counts = countPositions(
    team.selectedPlayerIds.flatMap((playerId) => {
      const position = getPlayer(playerId, players)?.position;
      return position ? [position] : [];
    }),
  );

  const missing = POSITION_ORDER.flatMap((position) =>
    Array.from({ length: Math.max(0, required[position] - counts[position]) }, () => position),
  );
  const excess = POSITION_ORDER.flatMap((position) =>
    Array.from({ length: Math.max(0, counts[position] - required[position]) }, () => position),
  );

  return {
    formationId: formation.id,
    counts,
    required,
    missing,
    excess,
    isValid: missing.length === 0 && excess.length === 0,
  };
}

export function isTeamComplete(
  team: TeamState,
  players: Player[],
  formation: FormationConfig = ACTIVE_FORMATION,
): boolean {
  if (team.selectedPlayerIds.length !== getFormationSlotCount(formation) || !team.captainId) {
    return false;
  }

  return getFormationStatus(team, players, formation).isValid;
}

function formatPositionCounts(counts: Record<PlayerPosition, number>): string {
  return POSITION_ORDER.filter((position) => counts[position] > 0)
    .map((position) => {
      const amount = counts[position];
      const label = positionNames[position];
      return `${amount} ${amount === 1 ? label : `${label}s`}`;
    })
    .join(", ");
}

export function getFormationMessage(status: FormationStatus): string {
  if (status.isValid) return `Formation is locked: ${formatPositionCounts(status.required)}.`;

  const missingCounts = countPositions(status.missing);
  const excessCounts = countPositions(status.excess);
  const missingText = formatPositionCounts(missingCounts);
  const excessText = formatPositionCounts(excessCounts);

  if (missingText && excessText) return `Need ${missingText}; remove ${excessText}.`;
  if (missingText) return `Need ${missingText} to complete the formation.`;
  return `Remove ${excessText} to complete the formation.`;
}

export function getValidationMessage(
  team: TeamState,
  players: Player[],
  formation: FormationConfig = ACTIVE_FORMATION,
): string | null {
  const cost = getSquadCost(team, players);
  const squadLimit = getFormationSlotCount(formation);

  if (cost > BUDGET_LIMIT) {
    return `Trim ${cost - BUDGET_LIMIT} credits from your squad.`;
  }

  if (team.selectedPlayerIds.length === 0) {
    return "Start by adding a goalkeeper to your squad.";
  }

  if (team.selectedPlayerIds.length < squadLimit) {
    return `Add ${squadLimit - team.selectedPlayerIds.length} more players to complete your squad.`;
  }

  const status = getFormationStatus(team, players, formation);
  if (!status.isValid) return getFormationMessage(status);
  if (!team.captainId) return "Choose a captain before submitting your team.";

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
