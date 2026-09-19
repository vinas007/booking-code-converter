import { describe, expect, it } from "vitest";
import { mapSportyBetOutcomeToEvent } from "../backend/src/adapters/sportybet/event.js";

describe("SportyBet event mapping", () => {
  it("maps booking outcome data to a normalized event", () => {
    const result = mapSportyBetOutcomeToEvent({
      eventId: "event-123",
      sport: "football",
      tournament: "premier-league",
      homeTeamName: "Arsenal FC",
      awayTeamName: "Chelsea FC",
      estimateStartTime: Date.parse("2026-09-20T15:00:00Z"),
    });

    expect(result).toEqual({
      eventId: "event-123",
      sportId: "football",
      leagueId: "premier-league",
      homeTeam: "Arsenal FC",
      awayTeam: "Chelsea FC",
      startTime: "2026-09-20T15:00:00.000Z",
    });
  });

  it("uses unknown when sport or tournament is missing", () => {
    const result = mapSportyBetOutcomeToEvent({
      eventId: "event-456",
      homeTeamName: "Arsenal",
      awayTeamName: "Chelsea",
      estimateStartTime: Date.parse("2026-09-20T15:00:00Z"),
    });

    expect(result.sportId).toBe("unknown");
    expect(result.leagueId).toBe("unknown");
  });

  it("rejects an outcome without team information", () => {
    expect(() =>
      mapSportyBetOutcomeToEvent({
        eventId: "event-789",
        homeTeamName: "Arsenal",
        estimateStartTime: Date.parse("2026-09-20T15:00:00Z"),
      }),
    ).toThrow("missing team information");
  });

  it("rejects an outcome without a start time", () => {
    expect(() =>
      mapSportyBetOutcomeToEvent({
        eventId: "event-789",
        homeTeamName: "Arsenal",
        awayTeamName: "Chelsea",
      }),
    ).toThrow("missing start time");
  });
});
