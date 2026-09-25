import { describe, expect, it } from "vitest";
import type { Market } from "@booking-code-converter/shared";
import {
  resolveMarket,
  resolveMarkets,
} from "../backend/src/matching/market-resolver.js";

function makeMarket(
  overrides: Partial<Market> = {},
): Market {
  return {
    id: "market-1",
    eventId: "event-1",
    type: "1x2",
    ...overrides,
  };
}

describe("Market resolver", () => {
  it("resolves matching markets", () => {
    const source = makeMarket();
    const target = makeMarket({
      id: "stake-market-1",
      eventId: "stake-event-1",
    });

    const result = resolveMarket(source, [target]);

    expect(result.matched).toBe(true);
    expect(result.target).toEqual(target);
    expect(result.confidence).toBe(1);
  });

  it("does not match different market types", () => {
    const source = makeMarket({
      type: "1x2",
    });

    const target = makeMarket({
      id: "stake-market-1",
      type: "doubleChance",
    });

    const result = resolveMarket(source, [target]);

    expect(result.matched).toBe(false);
    expect(result.target).toBeUndefined();
  });

  it("matches markets with the same line", () => {
    const source = makeMarket({
      type: "overUnder",
      line: 2.5,
    });

    const target = makeMarket({
      id: "stake-market-1",
      type: "overUnder",
      line: 2.5,
    });

    const result = resolveMarket(source, [target]);

    expect(result.matched).toBe(true);
    expect(result.target).toEqual(target);
  });

  it("does not match markets with different lines", () => {
    const source = makeMarket({
      type: "overUnder",
      line: 2.5,
    });

    const target = makeMarket({
      id: "stake-market-1",
      type: "overUnder",
      line: 3.5,
    });

    const result = resolveMarket(source, [target]);

    expect(result.matched).toBe(false);
  });

  it("respects event mappings", () => {
    const source = makeMarket({
      eventId: "sporty-event",
    });

    const correctTarget = makeMarket({
      id: "correct-target-market",
      eventId: "stake-event",
    });

    const wrongTarget = makeMarket({
      id: "wrong-target-market",
      eventId: "other-event",
    });

    const result = resolveMarket(
      source,
      [wrongTarget, correctTarget],
      {
        sourceEventId: "sporty-event",
        targetEventId: "stake-event",
      },
    );

    expect(result.matched).toBe(true);
    expect(result.target?.id).toBe("correct-target-market");
  });

  it("resolves multiple markets", () => {
    const sources = [
      makeMarket({
        id: "source-1",
        eventId: "source-event",
        type: "1x2",
      }),
      makeMarket({
        id: "source-2",
        eventId: "source-event",
        type: "overUnder",
        line: 2.5,
      }),
    ];

    const targets = [
      makeMarket({
        id: "target-2",
        eventId: "target-event",
        type: "overUnder",
        line: 2.5,
      }),
      makeMarket({
        id: "target-1",
        eventId: "target-event",
        type: "1x2",
      }),
    ];

    const result = resolveMarkets(
      sources,
      targets,
      [
        {
          sourceEventId: "source-event",
          targetEventId: "target-event",
        },
      ],
    );

    expect(result).toHaveLength(2);
    expect(result[0].target?.id).toBe("target-1");
    expect(result[1].target?.id).toBe("target-2");
  });

  it("returns unmatched when no target market exists", () => {
    const source = makeMarket();

    const result = resolveMarkets([source], []);

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(false);
    expect(result[0].target).toBeUndefined();
  });
});
