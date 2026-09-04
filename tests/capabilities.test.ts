import { describe, it, expect } from "vitest";
import {
  UNVERIFIED_CAPABILITIES,
  isCapabilityAvailable,
  isCapabilityUnsupported,
  CAPABILITY_KEYS,
  CAPABILITY_LABELS,
  type BookingCodeCapabilities,
} from "@booking-code-converter/shared";

describe("BookingCodeCapabilities", () => {
  it("UNVERIFIED_CAPABILITIES sets all capabilities to unverified", () => {
    const caps: BookingCodeCapabilities = UNVERIFIED_CAPABILITIES;

    expect(caps.canResolveBookingCode).toBe("unverified");
    expect(caps.canLoadSelections).toBe("unverified");
    expect(caps.canFindEvents).toBe("unverified");
    expect(caps.canFindMarkets).toBe("unverified");
    expect(caps.canValidateSelections).toBe("unverified");
    expect(caps.canCreateBookingCode).toBe("unverified");
  });

  it("isCapabilityAvailable returns true only for verified and partially_supported", () => {
    expect(isCapabilityAvailable("verified")).toBe(true);
    expect(isCapabilityAvailable("partially_supported")).toBe(true);
    expect(isCapabilityAvailable("unverified")).toBe(false);
    expect(isCapabilityAvailable("researching")).toBe(false);
    expect(isCapabilityAvailable("unsupported")).toBe(false);
  });

  it("isCapabilityUnsupported returns true only for unsupported", () => {
    expect(isCapabilityUnsupported("unsupported")).toBe(true);
    expect(isCapabilityUnsupported("verified")).toBe(false);
    expect(isCapabilityUnsupported("partially_supported")).toBe(false);
    expect(isCapabilityUnsupported("unverified")).toBe(false);
    expect(isCapabilityUnsupported("researching")).toBe(false);
  });

  it("CAPABILITY_KEYS covers all six capabilities", () => {
    expect(CAPABILITY_KEYS).toHaveLength(6);
    expect(CAPABILITY_KEYS).toContain("canResolveBookingCode");
    expect(CAPABILITY_KEYS).toContain("canLoadSelections");
    expect(CAPABILITY_KEYS).toContain("canFindEvents");
    expect(CAPABILITY_KEYS).toContain("canFindMarkets");
    expect(CAPABILITY_KEYS).toContain("canValidateSelections");
    expect(CAPABILITY_KEYS).toContain("canCreateBookingCode");
  });

  it("CAPABILITY_LABELS has a label for every key", () => {
    for (const key of CAPABILITY_KEYS) {
      expect(CAPABILITY_LABELS[key]).toBeDefined();
      expect(typeof CAPABILITY_LABELS[key]).toBe("string");
      expect(CAPABILITY_LABELS[key].length).toBeGreaterThan(0);
    }
  });
});
