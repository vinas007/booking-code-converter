import { describe, it, expect } from "vitest";
import type { Event } from "@booking-code-converter/shared";
import {
  DEFAULT_START_TIME_TOLERANCE_MS,
  matchEvents,
  normalizeTeamName,
} from "../backend/src/matching/index.js";

const BASE_EVENT: Event = {
  id: "event-1",
  sportId: "football",
  leagueId: "premier-league",
  homeTeam: { id: "home-1", name: "Arsenal" },
  awayTeam: { id: "away-1", name: "Chelsea" },
  startTime: "2026-09-20T15:00:00.000Z",
};

function event(overrides: Partial<Event> = {}): Event {
  return {
    ...BASE_EVENT,
    ...overrides,
    homeTeam: "homeTeam" in overrides ? overrides.homeTeam! : BASE_EVENT.homeTeam,
    awayTeam: "awayTeam" in overrides ? overrides.awayTeam! : BASE_EVENT.awayTeam,
  };
}

describe("normalizeTeamName", () => {
  it("removes common club suffixes", () => {
    expect(normalizeTeamName("Arsenal FC")).toBe("arsenal");
    expect(normalizeTeamName("Arsenal")).toBe("arsenal");
  });

  it("normalizes capitalization, whitespace, and common punctuation", () => {
    expect(normalizeTeamName("  Arsenal-FC  ")).toBe("arsenal");
    expect(normalizeTeamName("Paris-Saint Germain")).toBe("paris saint germain");
    expect(normalizeTeamName("Paris Saint Germain")).toBe("paris saint germain");
  });
});

describe("matchEvents", () => {
  it("matches exact events with full confidence and reasons", () => {
    const result = matchEvents(BASE_EVENT, event());

    expect(result.matched).toBe(true);
    expect(result.confidence).toBe(1);
    expect(result.reasons).toEqual([
      "home teams match",
      "away teams match",
      "start times within tolerance",
      "sport matches",
      "league matches",
    ]);
  });

  it("matches capitalization, whitespace, and punctuation differences", () => {
    const result = matchEvents(BASE_EVENT, event({
      homeTeam: { id: "h2", name: " arsenal fc " },
      awayTeam: { id: "a2", name: "CHELSEA" },
    }));

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("home teams match");
    expect(result.reasons).toContain("away teams match");
  });

  it("matches a small start-time difference within the configured tolerance", () => {
    const result = matchEvents(BASE_EVENT, event({
      startTime: "2026-09-20T16:30:00.000Z",
    }));

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("start times within tolerance");
  });

  it("rejects a start-time difference outside the tolerance", () => {
    const result = matchEvents(BASE_EVENT, event({
      startTime: "2026-09-20T18:01:00.000Z",
    }));

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("away teams match");
    expect(result.reasons.some((reason) => reason.includes("exceeds 120 minute tolerance"))).toBe(true);
  });

  it("rejects a different home team", () => {
    const result = matchEvents(BASE_EVENT, event({
      homeTeam: { id: "h2", name: "Liverpool" },
    }));

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("home teams do not match");
  });

  it("rejects a different away team", () => {
    const result = matchEvents(BASE_EVENT, event({
      awayTeam: { id: "a2", name: "Manchester City" },
    }));

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("away teams do not match");
  });

  it("does not automatically match reversed home and away teams", () => {
    const result = matchEvents(BASE_EVENT, event({
      homeTeam: { id: "h2", name: "Chelsea" },
      awayTeam: { id: "a2", name: "Arsenal" },
    }));

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("home teams do not match");
  });

  it("rejects the same teams in different sports", () => {
    const result = matchEvents(BASE_EVENT, event({ sportId: "basketball" }));

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("sport differs");
  });

  it("matches when the optional league is missing", () => {
    const result = matchEvents(
      event({ leagueId: "" }),
      event({ leagueId: "premier-league" }),
    );

    expect(result.matched).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.reasons).toContain("missing league");
  });

  it("rejects a known different league", () => {
    const result = matchEvents(BASE_EVENT, event({ leagueId: "fa-cup" }));

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("league differs");
  });

  it("does not claim a match when the home team is missing", () => {
    const result = matchEvents(
      event({ homeTeam: undefined as unknown as Event["homeTeam"] }),
      BASE_EVENT,
    );

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("missing home team");
  });

  it("does not claim a match when the away team is missing", () => {
    const result = matchEvents(
      BASE_EVENT,
      event({ awayTeam: undefined as unknown as Event["awayTeam"] }),
    );

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain("missing away team");
  });

  it("supports a custom start-time tolerance", () => {
    const result = matchEvents(
      BASE_EVENT,
      event({ startTime: "2026-09-20T15:45:00.000Z" }),
      { startTimeToleranceMs: 30 * 60 * 1000 },
    );

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it("uses the documented two-hour default tolerance", () => {
    expect(DEFAULT_START_TIME_TOLERANCE_MS).toBe(2 * 60 * 60 * 1000);
  });

  it("produces deterministic results", () => {
    const first = matchEvents(BASE_EVENT, event({ leagueId: "" }));
    const second = matchEvents(BASE_EVENT, event({ leagueId: "" }));

    expect(second).toEqual(first);
  });
});
