import { describe, it, expect } from "vitest";
import {
  mapStakeMarketSelections,
  mapStakeFixtureWithOdds,
} from "../backend/src/adapters/stake/mapper.js";
import type {
  StakeMarket,
  StakeOutcome,
  StakeFixtureWithOdds,
  StakeFixture,
} from "../backend/src/adapters/stake/types.js";

// ─── Helpers ────────────────────────────────────────────────

function makeOutcome(overrides: Partial<StakeOutcome> = {}): StakeOutcome {
  return {
    name: "Home",
    odds: 1.5,
    active: true,
    ...overrides,
  };
}

function makeMarket(overrides: Partial<StakeMarket> = {}): StakeMarket {
  return {
    group: "winner",
    status: "active",
    outcomes: [
      makeOutcome({ name: "Team A", odds: 1.5 }),
      makeOutcome({ name: "Draw", odds: 3.2 }),
      makeOutcome({ name: "Team B", odds: 2.8 }),
    ],
    market_id: "market-uuid-1",
    specifiers: null,
    market_name: "1x2",
    template_name: "1x2",
    ...overrides,
  };
}

function makeFixture(overrides: Partial<StakeFixture> = {}): StakeFixture {
  return {
    id: "fixture-uuid-1",
    slug: "team-a-team-b",
    name: "Team A - Team B",
    type: "match",
    extId: "od:match:123",
    provider: "oddin",
    enabled: true,
    cashoutEnabled: true,
    blacklisted: false,
    status: "active",
    startTime: 1700000000000,
    updatedAt: 1699900000000,
    tournamentId: "tournament-uuid-1",
    tournament: "Premier League",
    category: "England",
    competitors: [
      { name: "Team A" },
      { name: "Team B" },
    ],
    ...overrides,
  };
}

// ─── Match Result (1x2) selection mapping ───────────────────

describe("mapStakeMarketSelections — Match Result (1x2)", () => {
  it("maps HOME outcome by team name match", () => {
    const market = makeMarket({
      outcomes: [
        makeOutcome({ name: "Team A", odds: 1.5 }),
        makeOutcome({ name: "Draw", odds: 3.2 }),
        makeOutcome({ name: "Team B", odds: 2.8 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections).toHaveLength(3);
    expect(result.selections[0].outcome).toBe("HOME");
    expect(result.selections[0].displayName).toBe("Team A");
    expect(result.selections[0].odds).toBe(1.5);
  });

  it("maps DRAW outcome", () => {
    const market = makeMarket({
      outcomes: [makeOutcome({ name: "Draw", odds: 3.2 })],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].outcome).toBe("DRAW");
  });

  it("maps AWAY outcome by team name match", () => {
    const market = makeMarket({
      outcomes: [makeOutcome({ name: "Team B", odds: 2.8 })],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].outcome).toBe("AWAY");
  });

  it("maps HOME/DRAW/AWAY by shorthand codes 1/X/2", () => {
    const market = makeMarket({
      outcomes: [
        makeOutcome({ name: "1", odds: 1.5 }),
        makeOutcome({ name: "X", odds: 3.2 }),
        makeOutcome({ name: "2", odds: 2.8 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].outcome).toBe("HOME");
    expect(result.selections[1].outcome).toBe("DRAW");
    expect(result.selections[2].outcome).toBe("AWAY");
  });

  it("preserves odds on all selections", () => {
    const market = makeMarket({
      outcomes: [
        makeOutcome({ name: "Team A", odds: 1.91 }),
        makeOutcome({ name: "Draw", odds: 3.5 }),
        makeOutcome({ name: "Team B", odds: 4.2 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].odds).toBe(1.91);
    expect(result.selections[1].odds).toBe(3.5);
    expect(result.selections[2].odds).toBe(4.2);
  });
});

// ─── Over/Under selection mapping ───────────────────────────

describe("mapStakeMarketSelections — Over/Under", () => {
  it("maps OVER and UNDER outcomes with line from specifiers", () => {
    const market = makeMarket({
      market_name: "Over/Under",
      template_name: "over_under",
      specifiers: "total=2.5",
      outcomes: [
        makeOutcome({ name: "Over", odds: 1.85 }),
        makeOutcome({ name: "Under", odds: 1.95 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "overUnder", "market-1");

    expect(result.selections).toHaveLength(2);
    expect(result.selections[0].outcome).toBe("OVER");
    expect(result.selections[0].line).toBe(2.5);
    expect(result.selections[0].odds).toBe(1.85);
    expect(result.selections[1].outcome).toBe("UNDER");
    expect(result.selections[1].line).toBe(2.5);
    expect(result.selections[1].odds).toBe(1.95);
  });

  it("maps over/under for totalGoals market type", () => {
    const market = makeMarket({
      market_name: "Total Goals",
      template_name: "total_goals",
      specifiers: "total=3",
      outcomes: [
        makeOutcome({ name: "Over", odds: 1.7 }),
        makeOutcome({ name: "Under", odds: 2.1 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "totalGoals", "market-1");

    expect(result.selections[0].outcome).toBe("OVER");
    expect(result.selections[0].line).toBe(3);
    expect(result.selections[1].outcome).toBe("UNDER");
  });
});

// ─── Both Teams To Score selection mapping ───────────────────

describe("mapStakeMarketSelections — Both Teams To Score", () => {
  it("maps YES and NO outcomes", () => {
    const market = makeMarket({
      market_name: "BTTS",
      template_name: "btts",
      outcomes: [
        makeOutcome({ name: "Yes", odds: 1.75 }),
        makeOutcome({ name: "No", odds: 2.05 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "bothTeamsToScore", "market-1");

    expect(result.selections).toHaveLength(2);
    expect(result.selections[0].outcome).toBe("YES");
    expect(result.selections[0].odds).toBe(1.75);
    expect(result.selections[1].outcome).toBe("NO");
    expect(result.selections[1].odds).toBe(2.05);
  });
});

// ─── Handicap selection mapping ─────────────────────────────

describe("mapStakeMarketSelections — Handicap", () => {
  it("maps handicap HOME and AWAY by team name with line", () => {
    const market = makeMarket({
      market_name: "Handicap",
      template_name: "handicap",
      specifiers: "h=-1.5",
      outcomes: [
        makeOutcome({ name: "Team A", odds: 2.0 }),
        makeOutcome({ name: "Team B", odds: 1.8 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "handicap", "market-1", "Team A", "Team B");

    expect(result.selections).toHaveLength(2);
    expect(result.selections[0].outcome).toBe("HANDICAP_HOME");
    expect(result.selections[0].line).toBe(-1.5);
    expect(result.selections[0].odds).toBe(2.0);
    expect(result.selections[1].outcome).toBe("HANDICAP_AWAY");
    expect(result.selections[1].line).toBe(-1.5);
  });

  it("maps handicap by shorthand 1/2", () => {
    const market = makeMarket({
      market_name: "Handicap",
      template_name: "handicap",
      specifiers: "h=0",
      outcomes: [
        makeOutcome({ name: "1", odds: 1.9 }),
        makeOutcome({ name: "2", odds: 1.9 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "handicap", "market-1");

    expect(result.selections[0].outcome).toBe("HANDICAP_HOME");
    expect(result.selections[1].outcome).toBe("HANDICAP_AWAY");
  });
});

// ─── Double Chance selection mapping ─────────────────────────

describe("mapStakeMarketSelections — Double Chance", () => {
  it("maps HOME_OR_DRAW, DRAW_OR_AWAY, HOME_OR_AWAY", () => {
    const market = makeMarket({
      market_name: "Double Chance",
      template_name: "double_chance",
      outcomes: [
        makeOutcome({ name: "1X", odds: 1.3 }),
        makeOutcome({ name: "X2", odds: 1.5 }),
        makeOutcome({ name: "12", odds: 1.2 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "doubleChance", "market-1");

    expect(result.selections).toHaveLength(3);
    expect(result.selections[0].outcome).toBe("HOME_OR_DRAW");
    expect(result.selections[1].outcome).toBe("DRAW_OR_AWAY");
    expect(result.selections[2].outcome).toBe("HOME_OR_AWAY");
  });
});

// ─── Unknown / unmapped selection handling ──────────────────

describe("mapStakeMarketSelections — unknown/unmapped outcomes", () => {
  it("preserves unknown outcome as UNKNOWN with rawSelectionName and warns", () => {
    const market = makeMarket({
      market_name: "Corners 1x2",
      template_name: "corners_1x2",
      outcomes: [
        makeOutcome({ name: "Over 8.5", odds: 1.9 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "other", "market-1");

    expect(result.selections).toHaveLength(1);
    expect(result.selections[0].outcome).toBe("UNKNOWN");
    expect(result.selections[0].rawSelectionName).toBe("Over 8.5");
    expect(result.selections[0].displayName).toBe("Over 8.5");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("Over 8.5");
  });

  it("produces UNKNOWN for unrecognised outcome in a known market type", () => {
    const market = makeMarket({
      market_name: "1x2",
      template_name: "1x2",
      outcomes: [
        makeOutcome({ name: "Something Weird", odds: 5.0 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].outcome).toBe("UNKNOWN");
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ─── Missing selection fields ───────────────────────────────

describe("mapStakeMarketSelections — missing fields", () => {
  it("skips outcomes without a name and warns", () => {
    const market = makeMarket({
      outcomes: [
        makeOutcome({ name: "", odds: 1.5 }),
        makeOutcome({ name: "Team A", odds: 2.0 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections).toHaveLength(1);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("name");
  });

  it("handles empty outcomes array", () => {
    const market = makeMarket({ outcomes: [] });

    const result = mapStakeMarketSelections(market, "1x2", "market-1");

    expect(result.selections).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("handles missing outcomes array", () => {
    const market = makeMarket({ outcomes: undefined as unknown as StakeOutcome[] });

    const result = mapStakeMarketSelections(market, "1x2", "market-1");

    expect(result.selections).toHaveLength(0);
  });
});

// ─── Source ID preservation ─────────────────────────────────

describe("mapStakeMarketSelections — source ID and identifier preservation", () => {
  it("builds selection id from marketId and outcome name", () => {
    const market = makeMarket({
      market_id: "market-abc",
      outcomes: [makeOutcome({ name: "Team A", odds: 1.5 })],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-abc", "Team A", "Team B");

    expect(result.selections[0].id).toBe("market-abc:Team A");
    expect(result.selections[0].marketId).toBe("market-abc");
  });

  it("preserves rawSelectionName for traceability", () => {
    const market = makeMarket({
      outcomes: [makeOutcome({ name: "Team A", odds: 1.5 })],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].rawSelectionName).toBe("Team A");
  });
});

// ─── Odds preservation ───────────────────────────────────────

describe("mapStakeMarketSelections — odds preservation", () => {
  it("preserves decimal odds values exactly", () => {
    const market = makeMarket({
      outcomes: [
        makeOutcome({ name: "Team A", odds: 2.55 }),
        makeOutcome({ name: "Draw", odds: 3.33 }),
        makeOutcome({ name: "Team B", odds: 1.01 }),
      ],
    });

    const result = mapStakeMarketSelections(market, "1x2", "market-1", "Team A", "Team B");

    expect(result.selections[0].odds).toBe(2.55);
    expect(result.selections[1].odds).toBe(3.33);
    expect(result.selections[2].odds).toBe(1.01);
  });
});

// ─── Fixture-level selection mapping ────────────────────────

describe("mapStakeFixtureWithOdds — selections in fixture result", () => {
  it("produces selections alongside markets for a fixture with 1x2 and over/under", () => {
    const fixture: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({
          market_id: "mkt-1x2",
          market_name: "1x2",
          template_name: "1x2",
          outcomes: [
            makeOutcome({ name: "Team A", odds: 1.5 }),
            makeOutcome({ name: "Draw", odds: 3.2 }),
            makeOutcome({ name: "Team B", odds: 2.8 }),
          ],
        }),
        makeMarket({
          market_id: "mkt-ou",
          market_name: "Over/Under",
          template_name: "over_under",
          specifiers: "total=2.5",
          outcomes: [
            makeOutcome({ name: "Over", odds: 1.85 }),
            makeOutcome({ name: "Under", odds: 1.95 }),
          ],
        }),
      ],
    };

    const result = mapStakeFixtureWithOdds(fixture);

    expect(result.markets).toHaveLength(2);
    expect(result.selections).toHaveLength(5);
    expect(result.selections[0].outcome).toBe("HOME");
    expect(result.selections[0].marketId).toBe("mkt-1x2");
    expect(result.selections[3].outcome).toBe("OVER");
    expect(result.selections[3].marketId).toBe("mkt-ou");
    expect(result.selections[3].line).toBe(2.5);
  });

  it("produces warnings for unmapped outcomes in fixture context", () => {
    const fixture: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({
          market_id: "mkt-corners",
          market_name: "Corners 1x2",
          template_name: "corners_1x2",
          outcomes: [
            makeOutcome({ name: "Over 8.5", odds: 1.9 }),
          ],
        }),
      ],
    };

    const result = mapStakeFixtureWithOdds(fixture);

    expect(result.selections).toHaveLength(1);
    expect(result.selections[0].outcome).toBe("UNKNOWN");
    expect(result.warnings.some((w) => w.includes("Over 8.5"))).toBe(true);
    expect(result.warnings.some((w) => w.includes("Corners 1x2"))).toBe(true);
  });
});
