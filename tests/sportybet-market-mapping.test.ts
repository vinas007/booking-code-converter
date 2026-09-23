import { describe, expect, it } from "vitest";
import { mapSportyBetMarket } from "../backend/src/adapters/sportybet/market.js";

describe("SportyBet market mapping", () => {
  it("maps a 1X2 market", () => {
    const result = mapSportyBetMarket({
      eventId: "event-1",
      marketId: "market-1",
      marketType: "1x2",
      marketDescription: "Match Result",
    });

    expect(result.type).toBe("1x2");
    expect(result.eventId).toBe("event-1");
    expect(result.id).toBe("market-1");
  });

  it("maps an over/under market with a line", () => {
    const result = mapSportyBetMarket({
      eventId: "event-1",
      marketId: "market-2",
      marketType: "overUnder",
      line: 2.5,
      marketDescription: "Total Goals",
    });

    expect(result.type).toBe("overUnder");
    expect(result.line).toBe(2.5);
  });

  it("preserves the SportyBet market description", () => {
    const result = mapSportyBetMarket({
      eventId: "event-1",
      marketId: "market-3",
      marketType: "bothTeamsToScore",
      marketDescription: "Both Teams To Score",
    });

    expect(result.description).toBe("Both Teams To Score");
    expect(result.rawMarketName).toBe("Both Teams To Score");
  });
});
