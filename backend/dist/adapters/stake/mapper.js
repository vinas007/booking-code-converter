// ─── Sport / Category / Tournament mapping ─────────────────
export function mapStakeSport(raw) {
    return {
        id: raw.slug,
        name: raw.slug,
    };
}
export function mapStakeCategory(raw, sportId) {
    return {
        id: raw.slug,
        name: raw.slug,
        sportId,
    };
}
export function mapStakeTournament(raw, sportId) {
    return {
        id: raw.slug,
        name: raw.slug,
        sportId,
    };
}
// ─── Fixture → Event mapping ───────────────────────────────
export function mapStakeFixtureToEvent(raw) {
    const competitors = raw.competitors ?? [];
    const home = competitors[0];
    const away = competitors[1];
    const homeTeam = { id: home?.name ?? "unknown-home", name: home?.name ?? "Unknown" };
    const awayTeam = { id: away?.name ?? "unknown-away", name: away?.name ?? "Unknown" };
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
const MARKET_NAME_TO_TYPE = {
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
export function mapStakeMarket(raw, eventId) {
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
function extractLineFromSpecifiers(specifiers) {
    if (!specifiers)
        return undefined;
    const match = specifiers.match(/[-+]?\d+(?:\.\d+)?/);
    if (match) {
        const value = parseFloat(match[0]);
        return isNaN(value) ? undefined : value;
    }
    return undefined;
}
export function mapStakeFixtureWithOdds(raw) {
    const event = mapStakeFixtureToEvent(raw);
    const warnings = [];
    const markets = [];
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
    }
    return { event, markets, warnings };
}
//# sourceMappingURL=mapper.js.map