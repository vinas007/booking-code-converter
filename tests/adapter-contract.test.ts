import { describe, it, expect } from "vitest";
import {
  UnsupportedOperationError,
  type BookmakerAdapter,
  type AdapterOperationResult,
  type BookmakerAdapterMetadata,
  UNVERIFIED_CAPABILITIES,
} from "@booking-code-converter/shared";

describe("UnsupportedOperationError", () => {
  it("includes the operation name and bookmakerId in the message", () => {
    const error = new UnsupportedOperationError("createBookingCode", "stake");
    expect(error.operation).toBe("createBookingCode");
    expect(error.bookmakerId).toBe("stake");
    expect(error.message).toContain("createBookingCode");
    expect(error.message).toContain("stake");
    expect(error.name).toBe("UnsupportedOperationError");
  });
});

describe("BookmakerAdapter interface contract", () => {
  it("can be implemented with all capabilities reporting unverified", () => {
    const adapter: BookmakerAdapter = {
      bookmakerId: "sportybet",
      getCapabilities: () => UNVERIFIED_CAPABILITIES,
      resolveBookingCode: async () => {
        throw new UnsupportedOperationError("resolveBookingCode", "sportybet");
      },
      loadSelections: async () => {
        throw new UnsupportedOperationError("loadSelections", "sportybet");
      },
      findEvents: async () => {
        throw new UnsupportedOperationError("findEvents", "sportybet");
      },
      findMarkets: async () => {
        throw new UnsupportedOperationError("findMarkets", "sportybet");
      },
      validateSelections: async () => {
        throw new UnsupportedOperationError("validateSelections", "sportybet");
      },
      createBookingCode: async () => {
        throw new UnsupportedOperationError("createBookingCode", "sportybet");
      },
    };

    expect(adapter.bookmakerId).toBe("sportybet");
    expect(adapter.getCapabilities().canCreateBookingCode).toBe("unverified");
  });

  it("can represent a bookmaker that supports loading but not creating codes", async () => {
    const adapter: BookmakerAdapter = {
      bookmakerId: "stake",
      getCapabilities: () => ({
        canResolveBookingCode: "verified",
        canLoadSelections: "verified",
        canFindEvents: "verified",
        canFindMarkets: "verified",
        canValidateSelections: "partially_supported",
        canCreateBookingCode: "unsupported",
      }),
      resolveBookingCode: async () => ({
        data: { bookmaker: "stake", code: "ABC123" },
      }),
      loadSelections: async () => ({ data: [] }),
      findEvents: async () => ({ data: [] }),
      findMarkets: async () => ({ data: [] }),
      validateSelections: async () => ({ data: true }),
      createBookingCode: async () => {
        throw new UnsupportedOperationError("createBookingCode", "stake");
      },
    };

    const caps = adapter.getCapabilities();
    expect(caps.canResolveBookingCode).toBe("verified");
    expect(caps.canCreateBookingCode).toBe("unsupported");

    await expect(
      adapter.createBookingCode({ selections: [] }),
    ).rejects.toThrow(UnsupportedOperationError);
  });

  it("AdapterOperationResult can carry warnings alongside data", () => {
    const result: AdapterOperationResult<string> = {
      data: "OK",
      warnings: ["Some selections could not be matched"],
    };

    expect(result.data).toBe("OK");
    expect(result.warnings).toHaveLength(1);
  });

  it("BookmakerAdapterMetadata combines status and capabilities", () => {
    const meta: BookmakerAdapterMetadata = {
      bookmakerId: "sportybet",
      integrationStatus: "researching",
      capabilities: UNVERIFIED_CAPABILITIES,
    };

    expect(meta.bookmakerId).toBe("sportybet");
    expect(meta.integrationStatus).toBe("researching");
    expect(meta.capabilities.canResolveBookingCode).toBe("unverified");
  });
});
