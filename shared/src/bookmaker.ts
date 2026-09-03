export const BOOKMAKERS = [
  "bet9ja",
  "betking",
  "sportybet",
  "betano",
  "stake",
  "betbonanza",
  "betpawa",
  "footballcom",
] as const;

export type BookmakerId = (typeof BOOKMAKERS)[number];

export const BOOKMAKER_LABELS: Record<BookmakerId, string> = {
  bet9ja: "Bet9ja",
  betking: "BetKing",
  sportybet: "SportyBet",
  betano: "Betano",
  stake: "Stake",
  betbonanza: "BetBonanza",
  betpawa: "BetPawa",
  footballcom: "Football.com",
};
