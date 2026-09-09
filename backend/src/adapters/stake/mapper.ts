import type {
  Event,
  Market,
  MarketType,
  Selection,
  SelectionOutcome,
  Sport,
  League,
  Team,
} from "@booking-code-converter/shared";
import type {
  StakeSport,
  StakeCategory,
  StakeTournament,
  StakeFixture,
  StakeFixtureWithOdds,
  StakeMarket,
  StakeOutcome,
} from "./types.js";

// ─── Sport / Category / Tournament mapping ─────────────────

export function mapStakeSport(raw: StakeSport): Sport {
  return {
    id: raw.slug,
    name: raw.slug,
  };
}

export function mapStakeCategory(raw: StakeCategory, sportId: string): League {
  return {
    id: raw.slug,
    name: raw.slug,
    sportId,
  };
}

export function mapStakeTournament(raw: StakeTournament, sportId: string): League {
  return {
    id: raw.slug,
    name: raw.slug,
    sportId,
  };
}

// ─── Fixture → Event mapping ───────────────────────────────

export function mapStakeFixtureToEvent(raw: StakeFixture): Event {
  const competitors = raw.competitors ?? [];
  const home = competitors[0];
  const away = competitors[1];

  const homeTeam: Team = { id: home?.name ?? "unknown-home", name: home?.name ?? "Unknown" };
  const awayTeam: Team = { id: away?.name ?? "unknown-away", name: away?.name ?? "Unknown" };

  return {
    id: raw.slug,
    sportId: raw.tournamentId,
    leagueId: raw.tournamentId,
    homeTeam,
    awayTeam,
    startTime: new Date(raw.startTime).toISOString(),
    sourceId: raw.id,
  };
}

// ─── Market mapping ────────────────────────────────────────

const MARKET_NAME_TO_TYPE: Record<string, MarketType> = {
  "1x2": "1x2",
  "double_chance": "doubleChance",
  "over_under": "overUnder",
  "btts": "bothTeamsToScore",
  "handicap": "handicap",
  "correct_score": "correctScore",
  "ht_ft": "halftimeFulltime",
  "draw_no_bet": "drawNoBet",
  "total_goals": "totalGoals",
  "anytime_goalscorer": "anytimeGoalscorer",
};

export function mapStakeMarket(raw: StakeMarket, eventId: string): Market {
  const templateName = raw.template_name?.toLowerCase().trim() ?? "";
  const marketName = raw.market_name?.toLowerCase().trim() ?? "";

  const canonicalType = MARKET_NAME_TO_TYPE[templateName] ?? MARKET_NAME_TO_TYPE[marketName] ?? "other";

  const line = extractLineFromSpecifiers(raw.specifiers);

  return {
    id: raw.market_id,
    eventId,
    type: canonicalType,
    line,
    description: raw.market_name,
    sourceId: raw.market_id,
    rawMarketName: raw.market_name,
  };
}

function extractLineFromSpecifiers(specifiers: string | null | undefined): number | undefined {
  if (!specifiers) return undefined;
  const match = specifiers.match(/[-+]?\d+(?:\.\d+)?/);
  if (match) {
    const value = parseFloat(match[0]);
    return isNaN(value) ? undefined : value;
  }
  return undefined;
}

// ─── Selection mapping ─────────────────────────────────────

const MATCH_RESULT_OUTCOMES: Record<string, SelectionOutcome> = {
  "1": "HOME",
  "home": "HOME",
  "x": "DRAW",
  "draw": "DRAW",
  "2": "AWAY",
  "away": "AWAY",
};

const DOUBLE_CHANCE_OUTCOMES: Record<string, SelectionOutcome> = {
  "1x": "HOME_OR_DRAW",
  "home_or_draw": "HOME_OR_DRAW",
  "x2": "DRAW_OR_AWAY",
  "draw_or_away": "DRAW_OR_AWAY",
  "12": "HOME_OR_AWAY",
  "home_or_away": "HOME_OR_AWAY",
};

const BTTS_OUTCOMES: Record<string, SelectionOutcome> = {
  "yes": "YES",
  "no": "NO",
};

const OVER_UNDER_OUTCOMES: Record<string, SelectionOutcome> = {
  "over": "OVER",
  "under": "UNDER",
};

function normalizeOutcomeName(name: string): string {
  return name.toLowerCase().trim();
}

function mapStakeOutcome(
  rawOutcome: StakeOutcome,
  marketType: MarketType,
  homeTeamName?: string,
  awayTeamName?: string,
): { outcome: SelectionOutcome; displayName: string } {
  const rawName = rawOutcome.name ?? "";
  const normalized = normalizeOutcomeName(rawName);

  switch (marketType) {
    case "1x2": {
      if (MATCH_RESULT_OUTCOMES[normalized]) {
        return { outcome: MATCH_RESULT_OUTCOMES[normalized], displayName: rawName };
      }
      if (homeTeamName && normalized === normalizeOutcomeName(homeTeamName)) {
        return { outcome: "HOME", displayName: rawName };
      }
      if (awayTeamName && normalized === normalizeOutcomeName(awayTeamName)) {
        return { outcome: "AWAY", displayName: rawName };
      }
      return { outcome: "UNKNOWN", displayName: rawName };
    }

    case "doubleChance": {
      if (DOUBLE_CHANCE_OUTCOMES[normalized]) {
        return { outcome: DOUBLE_CHANCE_OUTCOMES[normalized], displayName: rawName };
      }
      return { outcome: "UNKNOWN", displayName: rawName };
    }

    case "bothTeamsToScore": {
      if (BTTS_OUTCOMES[normalized]) {
        return { outcome: BTTS_OUTCOMES[normalized], displayName: rawName };
      }
      return { outcome: "UNKNOWN", displayName: rawName };
    }

    case "overUnder":
    case "totalGoals": {
      if (OVER_UNDER_OUTCOMES[normalized]) {
        return { outcome: OVER_UNDER_OUTCOMES[normalized], displayName: rawName };
      }
      return { outcome: "UNKNOWN", displayName: rawName };
    }

    case "handicap": {
      if (homeTeamName && normalized === normalizeOutcomeName(homeTeamName)) {
        return { outcome: "HANDICAP_HOME", displayName: rawName };
      }
      if (awayTeamName && normalized === normalizeOutcomeName(awayTeamName)) {
        return { outcome: "HANDICAP_AWAY", displayName: rawName };
      }
      if (normalized === "1" || normalized === "home") {
        return { outcome: "HANDICAP_HOME", displayName: rawName };
      }
      if (normalized === "2" || normalized === "away") {
        return { outcome: "HANDICAP_AWAY", displayName: rawName };
      }
      return { outcome: "UNKNOWN", displayName: rawName };
    }

    default:
      return { outcome: "UNKNOWN", displayName: rawName };
  }
}

export interface MappedSelectionResult {
  selections: Selection[];
  warnings: string[];
}

export function mapStakeMarketSelections(
  rawMarket: StakeMarket,
  marketType: MarketType,
  marketId: string,
  homeTeamName?: string,
  awayTeamName?: string,
): MappedSelectionResult {
  const selections: Selection[] = [];
  const warnings: string[] = [];
  const line = extractLineFromSpecifiers(rawMarket.specifiers);
  const rawOutcomes = rawMarket.outcomes ?? [];

  for (const rawOutcome of rawOutcomes) {
    if (!rawOutcome.name) {
      warnings.push(`Skipped outcome without name in market "${rawMarket.market_name}"`);
      continue;
    }

    const { outcome, displayName } = mapStakeOutcome(
      rawOutcome,
      marketType,
      homeTeamName,
      awayTeamName,
    );

    const selection: Selection = {
      id: `${marketId}:${rawOutcome.name}`,
      marketId,
      outcome,
      displayName,
      odds: rawOutcome.odds,
      line,
      rawSelectionName: rawOutcome.name,
    };

    if (outcome === "UNKNOWN") {
      warnings.push(
        `Outcome "${rawOutcome.name}" in market "${rawMarket.market_name}" could not be mapped to a canonical outcome — preserved as UNKNOWN`,
      );
    }

    selections.push(selection);
  }

  return { selections, warnings };
}

// ─── Fixture with odds → Event + Markets ───────────────────

export interface MappedFixtureResult {
  event: Event;
  markets: Market[];
  selections: Selection[];
  warnings: string[];
}

export function mapStakeFixtureWithOdds(raw: StakeFixtureWithOdds): MappedFixtureResult {
  const event = mapStakeFixtureToEvent(raw);
  const warnings: string[] = [];
  const markets: Market[] = [];
  const selections: Selection[] = [];

  const homeTeamName = event.homeTeam.name;
  const awayTeamName = event.awayTeam.name;

  const rawMarkets = raw.markets ?? [];
  for (const rawMarket of rawMarkets) {
    if (!rawMarket.market_id) {
      warnings.push(`Skipped market without market_id in fixture ${raw.slug}`);
      continue;
    }
    if (!rawMarket.market_name) {
      warnings.push(`Skipped market without market_name in fixture ${raw.slug}`);
      continue;
    }
    const mapped = mapStakeMarket(rawMarket, event.id);
    if (mapped.type === "other") {
      warnings.push(`Market "${rawMarket.market_name}" (template: "${rawMarket.template_name}") could not be mapped to a canonical market type — preserved as "other"`);
    }
    markets.push(mapped);

    const selectionResult = mapStakeMarketSelections(
      rawMarket,
      mapped.type,
      mapped.id,
      homeTeamName,
      awayTeamName,
    );
    selections.push(...selectionResult.selections);
    warnings.push(...selectionResult.warnings);
  }

  return { event, markets, selections, warnings };
}
