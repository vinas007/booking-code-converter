import { describe, expect, it } from "vitest";
import { mapSportyBetSelection } from "../backend/src/adapters/sportybet/selection.js";

describe("SportyBet selection mapping", () => {
  it("maps a home win selection", () => {
    const result = mapSportyBetSelection({
      eventId: "event-1",
      marketId: "market-1",
      outcomeId: "1",
      marketDesc: "Match Result",
      odds: "2.50",
    });

    expect(result.marketType).toBe("1x2");
    expect(result.outcome).toBe("HOME");
    expect(result.odds).toBe(2.5);
  });

  it("maps a draw selection", () => {
    const result = mapSportyBetSelection({
      eventId: "event-1",
      marketId: "market-1",
      outcomeId: "X",
      marketDesc: "Match Result",
      odds: "3.20",
    });

    expect(result.outcome).toBe("DRAW");
  });

  it("maps an over selection and line", () => {
    const result = mapSportyBetSelection({
      eventId: "event-1",
      marketId: "market-2",
      outcomeId: "Over",
      specifier: "2.5",
      marketDesc: "Total Goals",
      odds: "1.80",
    });

    expect(result.marketType).toBe("overUnder");
    expect(result.outcome).toBe("OVER");
    expect(result.line).toBe(2.5);
  });

  it("maps both teams to score", () => {
    const result = mapSportyBetSelection({
      eventId: "event-1",
      marketId: "market-3",
      outcomeId: "Yes",
      marketDesc: "Both Teams To Score",
      odds: "1.70",
    });

    expect(result.marketType).toBe("bothTeamsToScore");
    expect(result.outcome).toBe("YES");
  });

  it("keeps unknown outcomes as UNKNOWN", () => {
    const result = mapSportyBetSelection({
      eventId: "event-1",
      marketId: "market-4",
      outcomeId: "something-new",
      marketDesc: "Something New",
      odds: "2.00",
    });

    expect(result.marketType).toBe("other");
    expect(result.outcome).toBe("UNKNOWN");
  });
});
