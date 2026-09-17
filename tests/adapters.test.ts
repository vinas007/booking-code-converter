import { afterEach, describe, it, expect, vi } from "vitest";

import { SportyBetAdapter } from "../backend/src/adapters/sportybet/index.js";
import { StakeAdapter } from "../backend/src/adapters/stake/index.js";
import { UnsupportedOperationError } from "@booking-code-converter/shared";

describe("SportyBetAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reports bookmakerId as sportybet", () => {
    const adapter = new SportyBetAdapter({});
    expect(adapter.bookmakerId).toBe("sportybet");
  });

  it("reports verified booking-code capabilities", () => {
    const adapter = new SportyBetAdapter({});
    const caps = adapter.getCapabilities();

    expect(caps.canResolveBookingCode).toBe("verified");
    expect(caps.canLoadSelections).toBe("verified");
    expect(caps.canFindEvents).toBe("unverified");
    expect(caps.canFindMarkets).toBe("unverified");
    expect(caps.canValidateSelections).toBe("unverified");
    expect(caps.canCreateBookingCode).toBe("unverified");
  });

  it("resolves a SportyBet booking code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            bizCode: 10000,
            data: {
              shareCode: "ABC123",
              selections: [
                {
                  eventId: "event-1",
                  marketId: "market-1",
                  outcomeId: "outcome-1",
                },
              ],
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    const adapter = new SportyBetAdapter({});
    const result = await adapter.resolveBookingCode({
      code: "ABC123",
    });

    expect(result.data).toEqual({
      bookmaker: "sportybet",
      code: "ABC123",
    });
  });

  it("loads SportyBet selections", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            bizCode: 10000,
            data: {
              shareCode: "ABC123",
              selections: [
                {
                  eventId: "event-1",
                  marketId: "market-1",
                  outcomeId: "outcome-1",
                },
              ],
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    const adapter = new SportyBetAdapter({});
    const result = await adapter.loadSelections({
      code: "ABC123",
    });

    expect(result.data).toHaveLength(1);

    expect(result.data[0]).toMatchObject({
      marketId: "market-1",
      outcome: "UNKNOWN",
      displayName: "outcome-1",
      odds: 0,
      sourceId: "outcome-1",
    });
  });

  it("keeps event matching unimplemented", async () => {
    const adapter = new SportyBetAdapter({});

    await expect(
      adapter.findEvents({ selections: [] }),
    ).rejects.toThrow("not implemented");
  });

  it("keeps market matching unimplemented", async () => {
    const adapter = new SportyBetAdapter({});

    await expect(
      adapter.findMarkets({
        events: [],
        selections: [],
      }),
    ).rejects.toThrow("not implemented");
  });

  it("keeps selection validation unimplemented", async () => {
    const adapter = new SportyBetAdapter({});

    await expect(
      adapter.validateSelections({
        selections: [],
        events: [],
        markets: [],
      }),
    ).rejects.toThrow("not implemented");
  });

  it("keeps booking creation unimplemented", async () => {
    const adapter = new SportyBetAdapter({});

    await expect(
      adapter.createBookingCode({
        selections: [],
      }),
    ).rejects.toThrow("will be connected");
  });
});

describe("StakeAdapter (capability metadata)", () => {
  const adapter = new StakeAdapter({ apiKey: "test-key" });

  it("reports bookmakerId as stake", () => {
    expect(adapter.bookmakerId).toBe("stake");
  });

  it("reports findEvents and findMarkets as verified", () => {
    const caps = adapter.getCapabilities();

    expect(caps.canFindEvents).toBe("verified");
    expect(caps.canFindMarkets).toBe("verified");
  });

  it("keeps booking-code operations as unverified", () => {
    const caps = adapter.getCapabilities();

    expect(caps.canResolveBookingCode).toBe("unverified");
    expect(caps.canLoadSelections).toBe("unverified");
    expect(caps.canValidateSelections).toBe("unverified");
    expect(caps.canCreateBookingCode).toBe("unverified");
  });

  it("throws UnsupportedOperationError for resolveBookingCode", async () => {
    await expect(
      adapter.resolveBookingCode({ code: "TEST" }),
    ).rejects.toThrow(UnsupportedOperationError);
  });

  it("throws UnsupportedOperationError for loadSelections", async () => {
    await expect(
      adapter.loadSelections({ code: "TEST" }),
    ).rejects.toThrow(UnsupportedOperationError);
  });

  it("throws UnsupportedOperationError for validateSelections", async () => {
    await expect(
      adapter.validateSelections({
        selections: [],
        events: [],
        markets: [],
      }),
    ).rejects.toThrow(UnsupportedOperationError);
  });

  it("throws UnsupportedOperationError for createBookingCode", async () => {
    await expect(
      adapter.createBookingCode({ selections: [] }),
    ).rejects.toThrow(UnsupportedOperationError);
  });
});