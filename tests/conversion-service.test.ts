import { describe, expect, it } from "vitest";
import type {
  BookmakerAdapter,
  BookingCode,
  ConversionRequest,
  Event,
  Market,
  Selection,
} from "@booking-code-converter/shared";
import { ConversionServiceImpl } from "../backend/src/conversion/service.js";

function createEvent(
  id: string,
  home: string,
  away: string,
  startTime: string,
): Event {
  return {
    id,
    sportId: "football",
    leagueId: "league",
    homeTeam: { id: `${id}-home`, name: home },
    awayTeam: { id: `${id}-away`, name: away },
    startTime,
  };
}

function createAdapter(
  bookmakerId: "sportybet" | "stake",
  events: Event[] = [],
): BookmakerAdapter {
  return {
    bookmakerId,
    getCapabilities: () => ({
      canResolveBookingCode: "verified",
      canLoadSelections: "verified",
      canFindEvents: "verified",
      canFindMarkets: "verified",
      canValidateSelections: "verified",
      canCreateBookingCode: "verified",
    }),
    resolveBookingCode: async (): Promise<{ data: BookingCode }> => ({
      data: { bookmaker: bookmakerId, code: "resolved-code" },
    }),
    loadSelections: async (): Promise<{ data: Selection[] }> => ({
      data: [
        {
          id: "sporty-event:market:outcome",
          marketId: "market",
          outcome: "HOME",
          displayName: "Home",
          odds: 2,
          sourceId: "outcome",
        },
      ],
    }),
    findEvents: async (): Promise<{ data: Event[] }> => ({
      data: events,
    }),
    findMarkets: async (): Promise<{ data: Market[] }> => ({
      data: [],
    }),
    validateSelections: async (): Promise<{ data: boolean }> => ({
      data: true,
    }),
    createBookingCode: async (): Promise<{ data: BookingCode }> => ({
      data: { bookmaker: bookmakerId, code: "new-code" },
    }),
  };
}

class TestRegistry {
  private readonly adapters: Map<string, BookmakerAdapter>;

  constructor(adapters: BookmakerAdapter[]) {
    this.adapters = new Map(
      adapters.map((adapter) => [adapter.bookmakerId, adapter]),
    );
  }

  get(bookmakerId: "sportybet" | "stake"): BookmakerAdapter | undefined {
    return this.adapters.get(bookmakerId);
  }
}

describe("ConversionServiceImpl", () => {
  it("returns a failed result when the source adapter is missing", async () => {
    const stake = createAdapter("stake");
    const registry = new TestRegistry([stake]);

    const service = new ConversionServiceImpl(registry as any);

    const request: ConversionRequest = {
      source: { bookmaker: "sportybet", code: "ABC123" },
      target: "stake",
    };

    const result = await service.convert(request);

    expect(result.status).toBe("failed");
    expect(result.message).toContain("No adapter is registered");
  });

  it("returns a failed result when the target adapter is missing", async () => {
    const sportybet = createAdapter("sportybet");
    const registry = new TestRegistry([sportybet]);

    const service = new ConversionServiceImpl(registry as any);

    const request: ConversionRequest = {
      source: { bookmaker: "sportybet", code: "ABC123" },
      target: "stake",
    };

    const result = await service.convert(request);

    expect(result.status).toBe("failed");
    expect(result.message).toContain("No adapter is registered");
  });

  it("runs the conversion pipeline successfully with working adapters", async () => {
    const sourceEvent = createEvent(
      "sporty-event",
      "Arsenal FC",
      "Chelsea FC",
      "2026-09-20T15:00:00Z",
    );

    const targetEvent = createEvent(
      "stake-event",
      "Arsenal",
      "Chelsea",
      "2026-09-20T15:03:00Z",
    );

    const sportybet = createAdapter("sportybet", [sourceEvent]);
    const stake = createAdapter("stake", [targetEvent]);

    const registry = new TestRegistry([sportybet, stake]);
    const service = new ConversionServiceImpl(registry as any);

    const request: ConversionRequest = {
      source: { bookmaker: "sportybet", code: "ABC123" },
      target: "stake",
    };

    const result = await service.convert(request);

    expect(result.status).toBe("success");
    expect(result.target.code).toBe("new-code");
  });

  it("returns failed when target validation fails", async () => {
    const sourceEvent = createEvent(
      "sporty-event",
      "Arsenal FC",
      "Chelsea FC",
      "2026-09-20T15:00:00Z",
    );

    const targetEvent = createEvent(
      "stake-event",
      "Arsenal",
      "Chelsea",
      "2026-09-20T15:03:00Z",
    );

    const sportybet = createAdapter("sportybet", [sourceEvent]);
    const stake = createAdapter("stake", [targetEvent]);

    stake.validateSelections = async () => ({
      data: false,
    });

    const registry = new TestRegistry([sportybet, stake]);
    const service = new ConversionServiceImpl(registry as any);

    const request: ConversionRequest = {
      source: { bookmaker: "sportybet", code: "ABC123" },
      target: "stake",
    };

    const result = await service.convert(request);

    expect(result.status).toBe("failed");
    expect(result.message).toContain("could not be validated");
  });
});