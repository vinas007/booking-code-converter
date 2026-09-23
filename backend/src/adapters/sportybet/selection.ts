import type {
  MarketType,
  SelectionOutcome,
} from "@booking-code-converter/shared";

export interface SportyBetSelectionInput {
  eventId: string;
  marketId: string;
  specifier?: string;
  outcomeId: string;
  marketDesc?: string;
  selectedOutcome?: string;
  odds?: string;
}

export interface SportyBetSelectionMapping {
  marketType: MarketType;
  outcome: SelectionOutcome;
  displayName: string;
  odds: number;
  line?: number;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function parseOdds(value?: string): number {
  const odds = Number(value);

  return Number.isFinite(odds) ? odds : 0;
}

function parseLine(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return undefined;
  }

  const line = Number(match[0]);

  return Number.isFinite(line) ? line : undefined;
}

function mapOutcome(value: string): SelectionOutcome {
  const outcome = normalize(value);

  if (outcome === "1" || outcome === "home") {
    return "HOME";
  }

  if (outcome === "x" || outcome === "draw") {
    return "DRAW";
  }

  if (outcome === "2" || outcome === "away") {
    return "AWAY";
  }

  if (outcome.includes("home") && outcome.includes("draw")) {
    return "HOME_OR_DRAW";
  }

  if (outcome.includes("draw") && outcome.includes("away")) {
    return "DRAW_OR_AWAY";
  }

  if (outcome.includes("home") && outcome.includes("away")) {
    return "HOME_OR_AWAY";
  }

  if (outcome === "over" || outcome.startsWith("over ")) {
    return "OVER";
  }

  if (outcome === "under" || outcome.startsWith("under ")) {
    return "UNDER";
  }

  if (outcome === "yes") {
    return "YES";
  }

  if (outcome === "no") {
    return "NO";
  }

  return "UNKNOWN";
}

function mapMarketType(value: string): MarketType {
  const market = normalize(value);

  if (
    market.includes("1x2") ||
    market.includes("match result") ||
    market.includes("full time result")
  ) {
    return "1x2";
  }

  if (market.includes("double chance")) {
    return "doubleChance";
  }

  if (
    market.includes("over") ||
    market.includes("under") ||
    market.includes("total goals")
  ) {
    return "overUnder";
  }

  if (
    market.includes("both teams to score") ||
    market.includes("btts")
  ) {
    return "bothTeamsToScore";
  }

  if (market.includes("handicap")) {
    return "handicap";
  }

  if (market.includes("correct score")) {
    return "correctScore";
  }

  if (market.includes("draw no bet")) {
    return "drawNoBet";
  }

  return "other";
}

export function mapSportyBetSelection(
  input: SportyBetSelectionInput,
): SportyBetSelectionMapping {
  const marketDescription = input.marketDesc || "";
  const selectedOutcome = input.selectedOutcome || input.outcomeId;

  return {
    marketType: mapMarketType(marketDescription),
    outcome: mapOutcome(selectedOutcome),
    displayName: selectedOutcome,
    odds: parseOdds(input.odds),
    line: parseLine(input.specifier),
  };
}
