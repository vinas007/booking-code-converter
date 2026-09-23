import { describe, expect, it } from "vitest";
import type { Selection } from "@booking-code-converter/shared";
import {
  matchSelections,
  resolveSelection,
} from "../backend/src/matching/selection-matcher.js";

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

describe("Selection matcher", () => {
  it("matches the same outcome", () => {
    const source = makeSelection();
    const target = makeSelection({
      id: "stake-selection-1",
    });

    const result = matchSelections(source, target);

    expect(result.matched).toBe(true);
    expect(result.selection).toEqual(target);
    expect(result.confidence).toBe(1);
  });

  it("rejects different outcomes", () => {
    const source = makeSelection({
      outcome: "HOME",
    });

    const target = makeSelection({
      outcome: "AWAY",
    });

    const result = matchSelections(source, target);

    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it("matches selections with the same line", () => {
    const source = makeSelection({
      outcome: "OVER",
      line: 2.5,
    });

    const target = makeSelection({
      outcome: "OVER",
      line: 2.5,
    });

    const result = matchSelections(source, target);

    expect(result.matched).toBe(true);
  });

  it("rejects selections with different lines", () => {
    const source = makeSelection({
      outcome: "OVER",
      line: 2.5,
    });

    const target = makeSelection({
      outcome: "OVER",
      line: 3.5,
    });

    const result = matchSelections(source, target);

    expect(result.matched).toBe(false);
  });

  it("rejects unknown outcomes", () => {
    const source = makeSelection({
      outcome: "UNKNOWN",
    });

    const target = makeSelection({
      outcome: "HOME",
    });

    const result = matchSelections(source, target);

    expect(result.matched).toBe(false);
  });

  it("resolves the best matching selection", () => {
    const source = makeSelection();

    const weakerTarget = makeSelection({
      id: "target-1",
      marketId: "different-market",
    });

    const strongerTarget = makeSelection({
      id: "target-2",
      marketId: "market-1",
    });

    const result = resolveSelection(source, [
      weakerTarget,
      strongerTarget,
    ]);

    expect(result.matched).toBe(true);
    expect(result.selection?.id).toBe("target-2");
    expect(result.confidence).toBe(1);
  });

  it("returns no match when no target matches", () => {
    const source = makeSelection({
      outcome: "DRAW",
    });

    const target = makeSelection({
      outcome: "AWAY",
    });

    const result = resolveSelection(source, [target]);

    expect(result.matched).toBe(false);
    expect(result.selection).toBeUndefined();
  });
});

