import { describe, expect, it } from "vitest";
import { getSelectionEventId } from "../backend/src/matching/selection-event.js";
import type { Selection } from "@booking-code-converter/shared";

describe("Selection event helper", () => {
  it("extracts the event ID from a SportyBet selection", () => {
    const selection: Selection = {
      id: "event-1:market-1:outcome-1",
      marketId: "market-1",
      outcome: "UNKNOWN",
      displayName: "outcome-1",
      odds: 0,
      sourceId: "outcome-1",
    };

    expect(getSelectionEventId(selection)).toBe("event-1");
  });

  it("returns undefined when the selection has no event ID", () => {
    const selection: Selection = {
      id: "",
      marketId: "market-1",
      outcome: "UNKNOWN",
      displayName: "outcome-1",
      odds: 0,
      sourceId: "outcome-1",
    };

    expect(getSelectionEventId(selection)).toBeUndefined();
  });
});
