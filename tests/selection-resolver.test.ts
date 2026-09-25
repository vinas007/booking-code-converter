import { describe, expect, it } from "vitest";
import type { Selection } from "@booking-code-converter/shared";
import { resolveSelections } from "../backend/src/matching/selection-resolver.js";

function makeSelection(
  overrides: Partial<Selection> = {},
): Selection {
  return {
    id: "selection-1",
    marketId: "market-1",
    outcome: "HOME",
    displayName: "Home",
    odds: 2,
    ...overrides,
  };
}

describe("Selection resolver", () => {
  it("resolves matching selections", () => {
    const source = makeSelection();
    const target = makeSelection({
      id: "stake-selection-1",
    });

    const result = resolveSelections([source], [target]);

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(true);
    expect(result[0].target).toEqual(target);
    expect(result[0].confidence).toBe(1);
  });

  it("returns unmatched selections", () => {
    const source = makeSelection({
      outcome: "HOME",
    });

    const target = makeSelection({
      outcome: "AWAY",
    });

    const result = resolveSelections([source], [target]);

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(false);
    expect(result[0].target).toBeUndefined();
  });

  it("resolves multiple selections", () => {
    const sources = [
      makeSelection({
        id: "source-home",
        outcome: "HOME",
      }),
      makeSelection({
        id: "source-away",
        outcome: "AWAY",
      }),
    ];

    const targets = [
      makeSelection({
        id: "target-away",
        outcome: "AWAY",
      }),
      makeSelection({
        id: "target-home",
        outcome: "HOME",
      }),
    ];

    const result = resolveSelections(sources, targets);

    expect(result).toHaveLength(2);
    expect(result[0].target?.id).toBe("target-home");
    expect(result[1].target?.id).toBe("target-away");
  });

  it("returns an empty array when there are no source selections", () => {
    const result = resolveSelections([], [makeSelection()]);

    expect(result).toEqual([]);
  });

  it("only matches selections inside the mapped target market", () => {
    const source = makeSelection({
      id: "source-home",
      marketId: "source-1x2",
      outcome: "HOME",
    });

    const wrongTarget = makeSelection({
      id: "wrong-home",
      marketId: "target-over-under",
      outcome: "HOME",
    });

    const correctTarget = makeSelection({
      id: "correct-home",
      marketId: "target-1x2",
      outcome: "HOME",
    });

    const result = resolveSelections(
      [source],
      [wrongTarget, correctTarget],
      [
        {
          sourceMarketId: "source-1x2",
          targetMarketId: "target-1x2",
        },
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(true);
    expect(result[0].target?.id).toBe("correct-home");
  });

  it("does not match when the target selection belongs to the wrong market", () => {
    const source = makeSelection({
      marketId: "source-1x2",
      outcome: "HOME",
    });

    const target = makeSelection({
      marketId: "target-over-under",
      outcome: "HOME",
    });

    const result = resolveSelections(
      [source],
      [target],
      [
        {
          sourceMarketId: "source-1x2",
          targetMarketId: "target-1x2",
        },
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(false);
    expect(result[0].target).toBeUndefined();
  });

  it("does not match when there is no market mapping", () => {
    const source = makeSelection({
      marketId: "source-1x2",
      outcome: "HOME",
    });

    const target = makeSelection({
      marketId: "target-1x2",
      outcome: "HOME",
    });

    const result = resolveSelections(
      [source],
      [target],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(true);
  });

  it("returns unmatched when a source market has no mapping", () => {
    const source = makeSelection({
      marketId: "source-unknown",
      outcome: "HOME",
    });

    const target = makeSelection({
      marketId: "target-1x2",
      outcome: "HOME",
    });

    const result = resolveSelections(
      [source],
      [target],
      [
        {
          sourceMarketId: "source-1x2",
          targetMarketId: "target-1x2",
        },
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0].matched).toBe(false);
    expect(result[0].target).toBeUndefined();
    expect(result[0].reasons).toContain(
      "No target market mapping found for source selection",
    );
  });
});
