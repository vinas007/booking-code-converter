import { describe, it, expect } from "vitest";
import type { Market } from "@booking-code-converter/shared";
import { matchMarkets, DEFAULT_LINE_TOLERANCE } from "../backend/src/matching/index.js";

function market(overrides: Partial<Market> = {}): Market {
  return {
    id: "market-1",
    eventId: "event-1",
    type: "1x2",
    ...overrides,
  };
}

describe("matchMarkets — identical canonical types", () => {
  it("matches two identical 1x2 markets", () => {
    const result = matchMarkets(market({ type: "1x2" }), market({ type: "1x2" }));

    expect(result.matched).toBe(true);
    expect(result.confidence).toBe(1);
    expect(result.reasons).toContain("market types match");
    expect(result.reasons).toContain("line not required for this market type");
  });

  it("matches two identical bothTeamsToScore markets", () => {
    const result = matchMarkets(
      market({ type: "bothTeamsToScore" }),
      market({ type: "bothTeamsToScore" }),
    );

    expect(result.matched).toBe(true);
    expect(result.confidence).toBe(1);
  });

  it("matches two identical doubleChance markets", () => {
    const result = matchMarkets(
      market({ type: "doubleChance" }),
      market({ type: "doubleChance" }),
    );

    expect(result.matched).toBe(true);
  });
});

describe("matchMarkets — different market types", () => {
  it("rejects 1x2 vs bothTeamsToScore", () => {
    const result = matchMarkets(
      market({ type: "1x2" }),
      market({ type: "bothTeamsToScore" }),
    );

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons.some((r) => r.includes("market types differ"))).toBe(true);
  });

  it("rejects overUnder vs totalGoals", () => {
    const result = matchMarkets(
      market({ type: "overUnder", line: 2.5 }),
      market({ type: "totalGoals", line: 2.5 }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons.some((r) => r.includes("market types differ"))).toBe(true);
  });
});

describe("matchMarkets — total goals with lines", () => {
  it("matches same totalGoals market and same line", () => {
    const result = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 2.5 }),
    );

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("lines match");
  });

  it("rejects same totalGoals market but different line", () => {
    const result = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 3.5 }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons.some((r) => r.includes("lines differ"))).toBe(true);
  });
});

describe("matchMarkets — over/under with lines", () => {
  it("matches same overUnder market and same line", () => {
    const result = matchMarkets(
      market({ type: "overUnder", line: 1.5 }),
      market({ type: "overUnder", line: 1.5 }),
    );

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("lines match");
  });

  it("rejects same overUnder market but different line", () => {
    const result = matchMarkets(
      market({ type: "overUnder", line: 1.5 }),
      market({ type: "overUnder", line: 2.5 }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons.some((r) => r.includes("lines differ"))).toBe(true);
  });
});

describe("matchMarkets — handicap with lines", () => {
  it("matches same handicap market and same line", () => {
    const result = matchMarkets(
      market({ type: "handicap", line: -1.5 }),
      market({ type: "handicap", line: -1.5 }),
    );

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("lines match");
  });

  it("rejects handicap with different line", () => {
    const result = matchMarkets(
      market({ type: "handicap", line: -1.5 }),
      market({ type: "handicap", line: 1.5 }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons.some((r) => r.includes("lines differ"))).toBe(true);
  });
});

describe("matchMarkets — markets without lines", () => {
  it("matches 1x2 markets when line is undefined on both", () => {
    const result = matchMarkets(
      market({ type: "1x2", line: undefined }),
      market({ type: "1x2", line: undefined }),
    );

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("line not required for this market type");
  });

  it("does not require a line for doubleChance", () => {
    const result = matchMarkets(
      market({ type: "doubleChance" }),
      market({ type: "doubleChance" }),
    );

    expect(result.matched).toBe(true);
  });
});

describe("matchMarkets — line present on only one market", () => {
  it("rejects when source has a line but target does not", () => {
    const result = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: undefined }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("line present on only one market");
  });

  it("rejects when target has a line but source does not", () => {
    const result = matchMarkets(
      market({ type: "handicap", line: undefined }),
      market({ type: "handicap", line: -1 }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("line present on only one market");
  });
});

describe("matchMarkets — unknown / other markets", () => {
  it("rejects when source market type is 'other'", () => {
    const result = matchMarkets(
      market({ type: "other" }),
      market({ type: "1x2" }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("unknown market type");
  });

  it("rejects when target market type is 'other'", () => {
    const result = matchMarkets(
      market({ type: "1x2" }),
      market({ type: "other" }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("unknown market type");
  });

  it("rejects when both market types are 'other'", () => {
    const result = matchMarkets(
      market({ type: "other" }),
      market({ type: "other" }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("unknown market type");
  });
});

describe("matchMarkets — missing market type", () => {
  it("rejects when source has no market type", () => {
    const result = matchMarkets(
      market({ type: "" as never }),
      market({ type: "1x2" }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("missing market type");
  });

  it("rejects when target has no market type", () => {
    const result = matchMarkets(
      market({ type: "1x2" }),
      market({ type: "" as never }),
    );

    expect(result.matched).toBe(false);
    expect(result.reasons).toContain("missing market type");
  });
});

describe("matchMarkets — floating-point line comparison", () => {
  it("matches lines that are equal within floating-point tolerance", () => {
    const result = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 2.5 + DEFAULT_LINE_TOLERANCE / 2 }),
    );

    expect(result.matched).toBe(true);
    expect(result.reasons).toContain("lines match");
  });

  it("rejects lines outside floating-point tolerance", () => {
    const result = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 2.5 + 0.0001 }),
    );

    expect(result.matched).toBe(false);
  });

  it("supports a custom line tolerance", () => {
    const result = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 2.6 }),
      { lineTolerance: 0.2 },
    );

    expect(result.matched).toBe(true);
  });
});

describe("matchMarkets — confidence and reasons", () => {
  it("returns confidence 1 for a full match", () => {
    const result = matchMarkets(
      market({ type: "1x2" }),
      market({ type: "1x2" }),
    );

    expect(result.confidence).toBe(1);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns confidence 0 for a non-match", () => {
    const result = matchMarkets(
      market({ type: "1x2" }),
      market({ type: "bothTeamsToScore" }),
    );

    expect(result.confidence).toBe(0);
  });

  it("produces deterministic results", () => {
    const a = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 2.5 }),
    );
    const b = matchMarkets(
      market({ type: "totalGoals", line: 2.5 }),
      market({ type: "totalGoals", line: 2.5 }),
    );

    expect(b).toEqual(a);
  });
});
