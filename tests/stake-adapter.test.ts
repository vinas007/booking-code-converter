import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StakeAdapter } from "../backend/src/adapters/stake/index.js";
import { StakeHttpClient } from "../backend/src/adapters/stake/client.js";
import {
  mapStakeFixtureToEvent,
  mapStakeFixtureWithOdds,
  mapStakeMarket,
} from "../backend/src/adapters/stake/mapper.js";
import { StakeApiError } from "../backend/src/adapters/stake/types.js";
import type {
  StakeSportsResponse,
  StakeFixtureResponse,
  StakeFixtureWithOdds,
  StakeFixture,
  StakeMarket,
} from "../backend/src/adapters/stake/types.js";

// ─── Helpers ────────────────────────────────────────────────

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

function makeMarket(overrides: Partial<StakeMarket> = {}): StakeMarket {
  return {
    group: "winner",
    status: "active",
    outcomes: [
      { name: "Team A", odds: 1.5, active: true },
      { name: "Draw", odds: 3.2, active: true },
      { name: "Team B", odds: 2.8, active: true },
    ],
    market_id: "market-uuid-1",
    specifiers: null,
    market_name: "1x2",
    template_name: "1x2",
    ...overrides,
  };
}

function mockFetchResponse(body: unknown, status = 200): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    status,
    json: async () => body,
  }));
}

function mockFetchError(error: Error): void {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
}

// ─── StakeHttpClient tests ───────────────────────────────────

describe("StakeHttpClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws StakeApiError with missing_api_key when no key is configured", async () => {
    const client = new StakeHttpClient({ apiKey: undefined });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      name: "StakeApiError",
      code: "missing_api_key",
    });
  });

  it("throws StakeApiError with missing_api_key when key is empty string", async () => {
    const client = new StakeHttpClient({ apiKey: "" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "missing_api_key",
    });
  });

  it("throws unauthorized on 401", async () => {
    mockFetchResponse({ error: "Unauthorized" }, 401);
    const client = new StakeHttpClient({ apiKey: "bad-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "unauthorized",
      statusCode: 401,
    });
  });

  it("throws forbidden on 403", async () => {
    mockFetchResponse({ error: "Forbidden" }, 403);
    const client = new StakeHttpClient({ apiKey: "bad-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "forbidden",
      statusCode: 403,
    });
  });

  it("throws not_found on 404", async () => {
    mockFetchResponse({ error: "Not Found" }, 404);
    const client = new StakeHttpClient({ apiKey: "good-key" });
    await expect(client.get("/api/fixtures/unknown/odds")).rejects.toMatchObject({
      code: "not_found",
      statusCode: 404,
    });
  });

  it("throws rate_limited on 429", async () => {
    mockFetchResponse({ error: "Rate Limited" }, 429);
    const client = new StakeHttpClient({ apiKey: "good-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "rate_limited",
      statusCode: 429,
    });
  });

  it("throws upstream_error on 500", async () => {
    mockFetchResponse({ error: "Internal Server Error" }, 500);
    const client = new StakeHttpClient({ apiKey: "good-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "upstream_error",
      statusCode: 500,
    });
  });

  it("throws malformed_response on non-JSON body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 200,
      json: async () => { throw new SyntaxError("Unexpected token"); },
    }));
    const client = new StakeHttpClient({ apiKey: "good-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "malformed_response",
    });
  });

  it("throws malformed_response on null body", async () => {
    mockFetchResponse(null);
    const client = new StakeHttpClient({ apiKey: "good-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "malformed_response",
    });
  });

  it("throws network_error on fetch failure", async () => {
    mockFetchError(new TypeError("fetch failed"));
    const client = new StakeHttpClient({ apiKey: "good-key" });
    await expect(client.get("/api/sports")).rejects.toMatchObject({
      code: "network_error",
    });
  });

  it("sends x-api-key header on successful request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ sport: { id: "1", slug: "soccer" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new StakeHttpClient({ apiKey: "my-key" });
    await client.get("/api/sports");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["x-api-key"]).toBe("my-key");
  });
});

// ─── Mapper tests ────────────────────────────────────────────

describe("mapStakeFixtureToEvent", () => {
  it("maps a fixture to a canonical Event", () => {
    const fixture = makeFixture();
    const event = mapStakeFixtureToEvent(fixture);

    expect(event.id).toBe("team-a-team-b");
    expect(event.sourceId).toBe("fixture-uuid-1");
    expect(event.homeTeam.name).toBe("Team A");
    expect(event.awayTeam.name).toBe("Team B");
    expect(event.startTime).toBe(new Date(1700000000000).toISOString());
  });

  it("handles missing competitors gracefully", () => {
    const fixture = makeFixture({ competitors: [] });
    const event = mapStakeFixtureToEvent(fixture);

    expect(event.homeTeam.name).toBe("Unknown");
    expect(event.awayTeam.name).toBe("Unknown");
  });

  it("preserves Stake fixture ID under sourceId, not in canonical id", () => {
    const fixture = makeFixture();
    const event = mapStakeFixtureToEvent(fixture);

    expect(event.sourceId).toBe("fixture-uuid-1");
    expect(event.id).toBe("team-a-team-b");
    expect(event.id).not.toBe(fixture.id);
  });
});

describe("mapStakeMarket", () => {
  it("maps a 1x2 market to canonical type 1x2", () => {
    const market = makeMarket({ market_name: "1x2", template_name: "1x2" });
    const mapped = mapStakeMarket(market, "event-1");

    expect(mapped.type).toBe("1x2");
    expect(mapped.eventId).toBe("event-1");
    expect(mapped.sourceId).toBe("market-uuid-1");
    expect(mapped.rawMarketName).toBe("1x2");
  });

  it("maps a handicap market with line from specifiers", () => {
    const market = makeMarket({
      market_name: "Handicap",
      template_name: "handicap",
      specifiers: "h=-1.5",
    });
    const mapped = mapStakeMarket(market, "event-1");

    expect(mapped.type).toBe("handicap");
    expect(mapped.line).toBe(-1.5);
  });

  it("maps over_under market", () => {
    const market = makeMarket({
      market_name: "Over/Under",
      template_name: "over_under",
      specifiers: "total=2.5",
    });
    const mapped = mapStakeMarket(market, "event-1");

    expect(mapped.type).toBe("overUnder");
    expect(mapped.line).toBe(2.5);
  });

  it("preserves unmapped markets as type 'other' with rawMarketName", () => {
    const market = makeMarket({
      market_name: "Corners 1x2",
      template_name: "corners_1x2",
    });
    const mapped = mapStakeMarket(market, "event-1");

    expect(mapped.type).toBe("other");
    expect(mapped.rawMarketName).toBe("Corners 1x2");
  });
});

describe("mapStakeFixtureWithOdds", () => {
  it("maps a fixture with markets and returns warnings for unmapped markets", () => {
    const fixture: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({ market_name: "1x2", template_name: "1x2" }),
        makeMarket({
          market_id: "market-uuid-2",
          market_name: "Corners 1x2",
          template_name: "corners_1x2",
        }),
      ],
    };

    const result = mapStakeFixtureWithOdds(fixture);

    expect(result.markets).toHaveLength(2);
    expect(result.markets[0].type).toBe("1x2");
    expect(result.markets[1].type).toBe("other");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("Corners 1x2");
  });

  it("skips markets without market_id and adds a warning", () => {
    const fixture: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({ market_id: "" }),
      ],
    };

    const result = mapStakeFixtureWithOdds(fixture);

    expect(result.markets).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("market_id");
  });

  it("skips markets without market_name and adds a warning", () => {
    const fixture: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({ market_name: "" }),
      ],
    };

    const result = mapStakeFixtureWithOdds(fixture);

    expect(result.markets).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("market_name");
  });

  it("handles fixture with no markets array", () => {
    const fixture: StakeFixtureWithOdds = {
      ...makeFixture(),
    };

    const result = mapStakeFixtureWithOdds(fixture);

    expect(result.markets).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

// ─── StakeAdapter integration tests (mocked HTTP) ───────────

describe("StakeAdapter.findEvents (mocked)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns mapped events from a successful API response", async () => {
    const apiResponse: StakeSportsResponse = {
      sport: {
        id: "sport-1",
        slug: "soccer",
        type: "sport",
        extId: "od:sport:1",
        provider: "oddin",
        enabled: true,
        cashoutEnabled: true,
        rank: 1,
        liveRank: null,
        cashoutDelay: 5,
      },
      fixture: [
        makeFixture({ slug: "liverpool-chelsea", name: "Liverpool - Chelsea", competitors: [{ name: "Liverpool" }, { name: "Chelsea" }] }),
        makeFixture({ slug: "arsenal-tottenham", name: "Arsenal - Tottenham", competitors: [{ name: "Arsenal" }, { name: "Tottenham" }] }),
      ],
    };

    mockFetchResponse(apiResponse);
    const adapter = new StakeAdapter({ apiKey: "test-key" });
    const result = await adapter.findEvents({ selections: [] });

    expect(result.data).toHaveLength(2);
    expect(result.data[0].homeTeam.name).toBe("Liverpool");
    expect(result.data[0].awayTeam.name).toBe("Chelsea");
    expect(result.data[0].sourceId).toBe("fixture-uuid-1");
    expect(result.data[1].homeTeam.name).toBe("Arsenal");
  });

  it("returns empty events array when API returns no fixtures", async () => {
    const apiResponse: StakeSportsResponse = {
      sport: {
        id: "sport-1",
        slug: "soccer",
        type: "sport",
        extId: "od:sport:1",
        provider: "oddin",
        enabled: true,
        cashoutEnabled: true,
        rank: 1,
        liveRank: null,
        cashoutDelay: 5,
      },
    };

    mockFetchResponse(apiResponse);
    const adapter = new StakeAdapter({ apiKey: "test-key" });
    const result = await adapter.findEvents({ selections: [] });

    expect(result.data).toHaveLength(0);
  });

  it("throws StakeApiError missing_api_key when no key configured", async () => {
    const adapter = new StakeAdapter({ apiKey: undefined });
    await expect(
      adapter.findEvents({ selections: [] }),
    ).rejects.toMatchObject({ code: "missing_api_key" });
  });

  it("throws StakeApiError unauthorized on 401", async () => {
    mockFetchResponse({ error: "Unauthorized" }, 401);
    const adapter = new StakeAdapter({ apiKey: "bad-key" });

    await expect(
      adapter.findEvents({ selections: [] }),
    ).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("throws StakeApiError malformed_response on bad data", async () => {
    mockFetchResponse("not-an-object");
    const adapter = new StakeAdapter({ apiKey: "good-key" });

    await expect(
      adapter.findEvents({ selections: [] }),
    ).rejects.toMatchObject({ code: "malformed_response" });
  });
});

describe("StakeAdapter.findMarkets (mocked)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns mapped markets from a successful fixture/odds response", async () => {
    const fixtureWithOdds: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({ market_name: "1x2", template_name: "1x2" }),
        makeMarket({
          market_id: "market-uuid-2",
          market_name: "Over/Under",
          template_name: "over_under",
          specifiers: "total=2.5",
        }),
      ],
      total_markets: 2,
    };

    const apiResponse: StakeFixtureResponse = {
      sport: {
        id: "sport-1",
        slug: "soccer",
        type: "sport",
        extId: "od:sport:1",
        provider: "oddin",
        enabled: true,
        cashoutEnabled: true,
        rank: 1,
        liveRank: null,
        cashoutDelay: 5,
      },
      fixture: [fixtureWithOdds],
    };

    mockFetchResponse(apiResponse);
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    const events = [
      {
        id: "team-a-team-b",
        sportId: "tournament-uuid-1",
        leagueId: "tournament-uuid-1",
        homeTeam: { id: "Team A", name: "Team A" },
        awayTeam: { id: "Team B", name: "Team B" },
        startTime: new Date(1700000000000).toISOString(),
        sourceId: "fixture-uuid-1",
      },
    ];

    const result = await adapter.findMarkets({ events, selections: [] });

    expect(result.data).toHaveLength(2);
    expect(result.data[0].type).toBe("1x2");
    expect(result.data[1].type).toBe("overUnder");
    expect(result.data[1].line).toBe(2.5);
  });

  it("includes warnings for unmapped markets", async () => {
    const fixtureWithOdds: StakeFixtureWithOdds = {
      ...makeFixture(),
      markets: [
        makeMarket({ market_name: "Corners 1x2", template_name: "corners_1x2" }),
      ],
    };

    const apiResponse: StakeFixtureResponse = {
      sport: {
        id: "sport-1",
        slug: "soccer",
        type: "sport",
        extId: "od:sport:1",
        provider: "oddin",
        enabled: true,
        cashoutEnabled: true,
        rank: 1,
        liveRank: null,
        cashoutDelay: 5,
      },
      fixture: [fixtureWithOdds],
    };

    mockFetchResponse(apiResponse);
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    const result = await adapter.findMarkets({
      events: [{
        id: "team-a-team-b",
        sportId: "t1",
        leagueId: "t1",
        homeTeam: { id: "a", name: "A" },
        awayTeam: { id: "b", name: "B" },
        startTime: "2023-01-01T00:00:00.000Z",
        sourceId: "fixture-uuid-1",
      }],
      selections: [],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].type).toBe("other");
    expect(result.warnings).toBeDefined;
    expect(result.warnings!.length).toBeGreaterThan(0);
  });

  it("skips fixtures that return 404 and adds a warning", async () => {
    mockFetchResponse({ error: "Not Found" }, 404);
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    const result = await adapter.findMarkets({
      events: [{
        id: "missing-fixture",
        sportId: "t1",
        leagueId: "t1",
        homeTeam: { id: "a", name: "A" },
        awayTeam: { id: "b", name: "B" },
        startTime: "2023-01-01T00:00:00.000Z",
        sourceId: "missing-fixture-id",
      }],
      selections: [],
    });

    expect(result.data).toHaveLength(0);
    expect(result.warnings).toBeDefined;
    expect(result.warnings!.some((w) => w.includes("not found"))).toBe(true);
  });

  it("throws on rate limiting (429)", async () => {
    mockFetchResponse({ error: "Rate Limited" }, 429);
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    await expect(
      adapter.findMarkets({
        events: [{
          id: "team-a-team-b",
          sportId: "t1",
          leagueId: "t1",
          homeTeam: { id: "a", name: "A" },
          awayTeam: { id: "b", name: "B" },
          startTime: "2023-01-01T00:00:00.000Z",
          sourceId: "fixture-uuid-1",
        }],
        selections: [],
      }),
    ).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("throws on upstream error (500)", async () => {
    mockFetchResponse({ error: "Internal Server Error" }, 500);
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    await expect(
      adapter.findMarkets({
        events: [{
          id: "team-a-team-b",
          sportId: "t1",
          leagueId: "t1",
          homeTeam: { id: "a", name: "A" },
          awayTeam: { id: "b", name: "B" },
          startTime: "2023-01-01T00:00:00.000Z",
          sourceId: "fixture-uuid-1",
        }],
        selections: [],
      }),
    ).rejects.toMatchObject({ code: "upstream_error" });
  });

  it("throws on network error", async () => {
    mockFetchError(new TypeError("fetch failed"));
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    await expect(
      adapter.findMarkets({
        events: [{
          id: "team-a-team-b",
          sportId: "t1",
          leagueId: "t1",
          homeTeam: { id: "a", name: "A" },
          awayTeam: { id: "b", name: "B" },
          startTime: "2023-01-01T00:00:00.000Z",
          sourceId: "fixture-uuid-1",
        }],
        selections: [],
      }),
    ).rejects.toMatchObject({ code: "network_error" });
  });

  it("throws missing_api_key when no key configured", async () => {
    const adapter = new StakeAdapter({ apiKey: undefined });

    await expect(
      adapter.findMarkets({
        events: [{
          id: "team-a-team-b",
          sportId: "t1",
          leagueId: "t1",
          homeTeam: { id: "a", name: "A" },
          awayTeam: { id: "b", name: "B" },
          startTime: "2023-01-01T00:00:00.000Z",
          sourceId: "fixture-uuid-1",
        }],
        selections: [],
      }),
    ).rejects.toMatchObject({ code: "missing_api_key" });
  });

  it("throws on malformed response", async () => {
    mockFetchResponse("invalid");
    const adapter = new StakeAdapter({ apiKey: "test-key" });

    await expect(
      adapter.findMarkets({
        events: [{
          id: "team-a-team-b",
          sportId: "t1",
          leagueId: "t1",
          homeTeam: { id: "a", name: "A" },
          awayTeam: { id: "b", name: "B" },
          startTime: "2023-01-01T00:00:00.000Z",
          sourceId: "fixture-uuid-1",
        }],
        selections: [],
      }),
    ).rejects.toMatchObject({ code: "malformed_response" });
  });
});
