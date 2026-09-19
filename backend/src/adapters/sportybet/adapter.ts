import type {
  BookmakerAdapter,
  BookingCodeCapabilities,
  AdapterOperationResult,
  BookingCode,
  Selection,
  Event,
  Market,
} from "@booking-code-converter/shared";
import type { SportyBetAdapterConfig } from "./types.js";
import { SportyBetClient } from "./client.js";
import { mapSportyBetOutcomeToEvent } from "./event.js";

const SPORTYBET_CAPABILITIES: BookingCodeCapabilities = {
  canResolveBookingCode: "verified",
  canLoadSelections: "verified",
  canFindEvents: "unverified",
  canFindMarkets: "unverified",
  canValidateSelections: "unverified",
  canCreateBookingCode: "unverified",
};

export class SportyBetAdapter implements BookmakerAdapter {
  readonly bookmakerId = "sportybet" as const;

  private readonly client: SportyBetClient;
  private readonly bookings = new Map<string, Awaited<ReturnType<SportyBetClient["getBooking"]>>>();

  constructor(config: SportyBetAdapterConfig) {
    this.client = new SportyBetClient({
      baseUrl: config.baseUrl,
      region: "ng",
      timeoutMs: config.timeoutMs,
    });
  }

  getCapabilities(): BookingCodeCapabilities {
    return SPORTYBET_CAPABILITIES;
  }

  async resolveBookingCode(
    input: { code: string },
  ): Promise<AdapterOperationResult<BookingCode>> {
    const booking = await this.client.getBooking(input.code);
    this.bookings.set(booking.shareCode, booking);

    return {
      data: {
        bookmaker: "sportybet",
        code: booking.shareCode,
      },
    };
  }

  async loadSelections(
    input: { code: string },
  ): Promise<AdapterOperationResult<Selection[]>> {
    const booking = await this.client.getBooking(input.code);
    this.bookings.set(booking.shareCode, booking);

    const selections: Selection[] = booking.selections.map((selection) => ({
      id: `${selection.eventId}:${selection.marketId}:${selection.outcomeId}`,
      marketId: selection.marketId,
      outcome: "UNKNOWN",
      displayName: selection.outcomeId,
      odds: 0,
      sourceId: selection.outcomeId,
      rawSelectionName: selection.outcomeId,
    }));

    return {
      data: selections,
      warnings:
        booking.outcomes && booking.outcomes.length > 0
          ? undefined
          : ["SportyBet booking returned no event outcome information."],
    };
  }

  async findEvents(
    input: { selections: Selection[] },
  ): Promise<AdapterOperationResult<Event[]>> {
    if (input.selections.length === 0) {
      return {
        data: [],
        warnings: ["No SportyBet selections supplied."],
      };
    }

    const eventIds = new Set(
      input.selections
        .map((selection) => selection.id.split(":")[0])
        .filter(Boolean),
    );

    let booking:
      | Awaited<ReturnType<SportyBetClient["getBooking"]>>
      | undefined;

    for (const cachedBooking of this.bookings.values()) {
      const hasEvent = cachedBooking.selections.some((selection) =>
        eventIds.has(selection.eventId),
      );

      if (hasEvent) {
        booking = cachedBooking;
        break;
      }
    }

    if (!booking) {
      return {
        data: [],
        warnings: ["SportyBet booking data is not available for these selections."],
      };
    }

    const events: Event[] = [];
    const warnings: string[] = [];

    for (const eventId of eventIds) {
      const rawOutcome = booking.outcomes?.find(
        (outcome) =>
          typeof outcome === "object" &&
          outcome !== null &&
          "eventId" in outcome &&
          String((outcome as { eventId?: unknown }).eventId) === eventId,
      );

      if (!rawOutcome) {
        warnings.push(`No SportyBet event information found for ${eventId}`);
        continue;
      }

      try {
        const mapped = mapSportyBetOutcomeToEvent(rawOutcome);

        events.push({
          id: mapped.eventId,
          sportId: mapped.sportId,
          leagueId: mapped.leagueId,
          homeTeam: {
            id: `${mapped.eventId}:home`,
            name: mapped.homeTeam,
          },
          awayTeam: {
            id: `${mapped.eventId}:away`,
            name: mapped.awayTeam,
          },
          startTime: mapped.startTime,
          sourceId: mapped.eventId,
        });
      } catch (error) {
        warnings.push(
          error instanceof Error
            ? error.message
            : `Failed to map SportyBet event ${eventId}`,
        );
      }
    }

    return {
      data: events,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async findMarkets(
    input: { events: Event[]; selections: Selection[] },
  ): Promise<AdapterOperationResult<Market[]>> {
    throw new Error("SportyBet market matching is not implemented yet.");
  }

  async validateSelections(
    input: {
      selections: Selection[];
      events: Event[];
      markets: Market[];
    },
  ): Promise<AdapterOperationResult<boolean>> {
    throw new Error("SportyBet selection validation is not implemented yet.");
  }

  async createBookingCode(
    input: { selections: Selection[] },
  ): Promise<AdapterOperationResult<BookingCode>> {
    throw new Error(
      "SportyBet booking creation will be connected after selection mapping is implemented.",
    );
  }
}
