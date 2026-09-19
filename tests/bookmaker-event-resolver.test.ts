import { describe, expect, it } from "vitest";
import type { Event } from "@booking-code-converter/shared";
import {
  resolveBookmakerEvent,
  resolveBookmakerEvents,
} from "../backend/src/matching/bookmaker-event-resolver.js";

const source: Event = {
  id: "sporty-1",
  sportId: "football",
  leagueId: "sporty-premier-league",
  homeTeam: { id: "1", name: "Arsenal FC" },
  awayTeam: { id: "2", name: "Chelsea FC" },
  startTime: "2026-09-20T15:00:00Z",
};

const target: Event = {
  id: "stake-1",
  sportId: "stake-football-id",
  leagueId: "stake-premier-league-id",
  homeTeam: { id: "10", name: "Arsenal" },
  awayTeam: { id: "20", name: "Chelsea" },
  startTime: "2026-09-20T15:03:00Z",
};

describe("Bookmaker event resolver", () => {
  it("matches events even when bookmaker IDs differ", () => {
    const result = resolveBookmakerEvent(source, [target]);

    expect(result.matched).toBe(true);
    expect(result.target).toEqual(target);
    expect(result.confidence).toBe(1);
  });

  it("rejects events with different teams", () => {
    const differentTarget = {
      ...target,
      homeTeam: { id: "30", name: "Liverpool" },
    };

    const result = resolveBookmakerEvent(source, [differentTarget]);

    expect(result.matched).toBe(false);
    expect(result.target).toBeUndefined();
  });

  it("rejects events with a large start-time difference", () => {
    const differentTime = {
      ...target,
      startTime: "2026-09-20T18:00:00Z",
    };

    const result = resolveBookmakerEvent(source, [differentTime]);

    expect(result.matched).toBe(false);
  });

  it("resolves multiple source events", () => {
    const secondSource = {
      ...source,
      id: "sporty-2",
      homeTeam: { id: "3", name: "Liverpool" },
      awayTeam: { id: "4", name: "Everton" },
    };

    const secondTarget = {
      ...target,
      id: "stake-2",
      homeTeam: { id: "30", name: "Liverpool FC" },
      awayTeam: { id: "40", name: "Everton FC" },
    };

    const results = resolveBookmakerEvents(
      [source, secondSource],
      [target, secondTarget],
    );

    expect(results).toHaveLength(2);
    expect(results[0].matched).toBe(true);
    expect(results[0].target?.id).toBe("stake-1");
    expect(results[1].matched).toBe(true);
    expect(results[1].target?.id).toBe("stake-2");
  });
});
