import { describe, expect, it } from "vitest";
import { SportyBetAdapter } from "../backend/src/adapters/sportybet/adapter.js";
import { StakeAdapter } from "../backend/src/adapters/stake/adapter.js";

describe("Adapter contract", () => {
  it("SportyBet exposes the expected capability metadata", () => {
    const adapter = new SportyBetAdapter({});
    const capabilities = adapter.getCapabilities();

    expect(adapter.bookmakerId).toBe("sportybet");
    expect(capabilities.canResolveBookingCode).toBe("verified");
    expect(capabilities.canLoadSelections).toBe("verified");
    expect(capabilities.canFindEvents).toBe("unverified");
    expect(capabilities.canFindMarkets).toBe("unverified");
    expect(capabilities.canValidateSelections).toBe("unverified");
    expect(capabilities.canCreateBookingCode).toBe("unverified");
  });

  it("Stake exposes the expected capability metadata", () => {
    const adapter = new StakeAdapter({ apiKey: "test-key" });
    const capabilities = adapter.getCapabilities();

    expect(adapter.bookmakerId).toBe("stake");
    expect(capabilities.canFindEvents).toBe("verified");
    expect(capabilities.canFindMarkets).toBe("verified");
    expect(capabilities.canResolveBookingCode).toBe("unverified");
    expect(capabilities.canLoadSelections).toBe("unverified");
    expect(capabilities.canValidateSelections).toBe("unverified");
    expect(capabilities.canCreateBookingCode).toBe("unverified");
  });
});