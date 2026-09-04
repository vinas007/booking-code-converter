import { describe, it, expect } from "vitest";
import { SportyBetAdapter } from "../backend/src/adapters/sportybet/index.js";
import { StakeAdapter } from "../backend/src/adapters/stake/index.js";
import { isCapabilityAvailable, UnsupportedOperationError } from "@booking-code-converter/shared";

describe("SportyBetAdapter (unverified structural placeholder)", () => {
  const adapter = new SportyBetAdapter({});

  it("reports bookmakerId as sportybet", () => {
    expect(adapter.bookmakerId).toBe("sportybet");
  });

  it("reports all capabilities as unverified", () => {
    const caps = adapter.getCapabilities();
    expect(caps.canResolveBookingCode).toBe("unverified");
    expect(caps.canLoadSelections).toBe("unverified");
    expect(caps.canFindEvents).toBe("unverified");
    expect(caps.canFindMarkets).toBe("unverified");
    expect(caps.canValidateSelections).toBe("unverified");
    expect(caps.canCreateBookingCode).toBe("unverified");
  });

  it("throws when resolveBookingCode is called (not implemented)", async () => {
    await expect(
      adapter.resolveBookingCode({ code: "TEST" }),
    ).rejects.toThrow(/UNVERIFIED/);
  });

  it("throws when loadSelections is called (not implemented)", async () => {
    await expect(
      adapter.loadSelections({ code: "TEST" }),
    ).rejects.toThrow(/UNVERIFIED/);
  });

  it("throws when findEvents is called (not implemented)", async () => {
    await expect(
      adapter.findEvents({ selections: [] }),
    ).rejects.toThrow(/UNVERIFIED/);
  });

  it("throws when findMarkets is called (not implemented)", async () => {
    await expect(
      adapter.findMarkets({ events: [], selections: [] }),
    ).rejects.toThrow(/UNVERIFIED/);
  });

  it("throws when validateSelections is called (not implemented)", async () => {
    await expect(
      adapter.validateSelections({ selections: [], events: [], markets: [] }),
    ).rejects.toThrow(/UNVERIFIED/);
  });

  it("throws when createBookingCode is called (not implemented)", async () => {
    await expect(
      adapter.createBookingCode({ selections: [] }),
    ).rejects.toThrow(/UNVERIFIED/);
  });

  it("does not report any capability as available", () => {
    const caps = adapter.getCapabilities();
    expect(isCapabilityAvailable(caps.canResolveBookingCode)).toBe(false);
    expect(isCapabilityAvailable(caps.canLoadSelections)).toBe(false);
    expect(isCapabilityAvailable(caps.canFindEvents)).toBe(false);
    expect(isCapabilityAvailable(caps.canFindMarkets)).toBe(false);
    expect(isCapabilityAvailable(caps.canValidateSelections)).toBe(false);
    expect(isCapabilityAvailable(caps.canCreateBookingCode)).toBe(false);
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
      adapter.validateSelections({ selections: [], events: [], markets: [] }),
    ).rejects.toThrow(UnsupportedOperationError);
  });

  it("throws UnsupportedOperationError for createBookingCode", async () => {
    await expect(
      adapter.createBookingCode({ selections: [] }),
    ).rejects.toThrow(UnsupportedOperationError);
  });
});
