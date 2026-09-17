import { describe, expect, it } from "vitest";
import { resolveEvent } from "../backend/src/matching/event-resolver.js";
import type { Event } from "@booking-code-converter/shared";

const source: Event = {
  id: "sporty-1",
  sourceId: "sporty-1",
  sportId: "football",
  leagueId: "premier-league",
  homeTeam: { id: "1", name: "Arsenal FC" },
  awayTeam: { id: "2", name: "Chelsea FC" },
  startTime: "2026-09-20T15:00:00Z",
};

const target: Event = {
  id: "stake-1",
  sourceId: "stake-1",
  sportId: "football",
  leagueId: "premier-league",
  homeTeam: { id: "10", name: "Arsenal" },
  awayTeam: { id: "20", name: "Chelsea" },
  startTime: "2026-09-20T15:01:00Z",
};

describe("Event resolver", () => {
  it("finds a matching target event", () => {
    const result = resolveEvent(source, [target]);

    expect(result.matched).toBe(true);
    expect(result.event).toEqual(target);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("returns no match when teams are different", () => {
    const differentTarget = {
      ...target,
      homeTeam: { id: "30", name: "Liverpool" },
    };

    const result = resolveEvent(source, [differentTarget]);

    expect(result.matched).toBe(false);
    expect(result.event).toBeUndefined();
  });
});
