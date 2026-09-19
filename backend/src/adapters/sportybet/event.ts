export interface SportyBetBookingOutcome {
  eventId: string;
  sport?: string;
  tournament?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  estimateStartTime?: number;
  selectedOutcome?: string;
  marketDesc?: string;
  odds?: string;
}

export interface SportyBetEvent {
  eventId: string;
  sportId: string;
  leagueId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
}

export function mapSportyBetOutcomeToEvent(
  raw: SportyBetBookingOutcome,
): SportyBetEvent {
  if (!raw.eventId) {
    throw new Error("SportyBet outcome is missing eventId.");
  }

  if (!raw.homeTeamName || !raw.awayTeamName) {
    throw new Error(
      `SportyBet outcome for ${raw.eventId} is missing team information.`,
    );
  }

  if (!raw.estimateStartTime) {
    throw new Error(
      `SportyBet outcome for ${raw.eventId} is missing start time.`,
    );
  }

  return {
    eventId: raw.eventId,
    sportId: raw.sport || "unknown",
    leagueId: raw.tournament || "unknown",
    homeTeam: raw.homeTeamName,
    awayTeam: raw.awayTeamName,
    startTime: new Date(raw.estimateStartTime).toISOString(),
  };
}
