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
import {
  mapSportyBetOutcomeToEvent,
  type SportyBetBookingOutcome,
} from "./event.js";
import {
  mapSportyBetSelection,
  type SportyBetSelectionInput,
} from "./selection.js";
import { mapSportyBetMarket } from "./market.js";

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
  private readonly bookings = new Map<
    string,
    Awaited<ReturnType<SportyBetClient["getBooking"]>>
  >();

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

    const outcomes = Array.isArray(booking.outcomes)
      ? booking.outcomes
      : [];

    const selections: Selection[] = [];
    const warnings: string[] = [];

    for (const selection of booking.selections) {
      const outcome = outcomes.find(
        (item): item is SportyBetBookingOutcome =>
          typeof item === "object" &&
          item !== null &&
          "eventId" in item &&
          String((item as { eventId?: unknown }).eventId) ===
            selection.eventId,
      );

      const inputData: SportyBetSelectionInput = {
        eventId: selection.eventId,
        marketId: selection.marketId,
        specifier: selection.specifier,
        outcomeId: selection.outcomeId,
        marketDesc: outcome?.marketDesc,
        selectedOutcome: outcome?.selectedOutcome,
        odds: outcome?.odds,
      };

      const mapped = mapSportyBetSelection(inputData);

      selections.push({
        id: `${selection.eventId}:${selection.marketId}:${selection.outcomeId}`,
        marketId: selection.marketId,
        outcome: mapped.outcome,
        displayName: mapped.displayName,
        odds: mapped.odds,
        line: mapped.line,
        sourceId: selection.outcomeId,
        rawSelectionName: selection.outcomeId,
      });

      if (mapped.outcome === "UNKNOWN") {
        warnings.push(
          `SportyBet outcome "${selection.outcomeId}" could not be mapped.`,
        );
      }

      if (mapped.marketType === "other") {
        warnings.push(
          `SportyBet market "${outcome?.marketDesc || selection.marketId}" could not be mapped.`,
        );
      }
    }

    return {
      data: selections,
      warnings: warnings.length > 0 ? warnings : undefined,
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
        warnings: [
          "SportyBet booking data is not available for these selections.",
        ],
      };
    }

    const events: Event[] = [];
    const warnings: string[] = [];

    for (const eventId of eventIds) {
      const rawOutcome = booking.outcomes?.find(
        (outcome): outcome is SportyBetBookingOutcome =>
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
    const markets: Market[] = [];
    const warnings: string[] = [];

    for (const selection of input.selections) {
      const eventId = selection.id.split(":")[0];

      if (!eventId) {
        warnings.push(
          `Could not determine event for SportyBet selection ${selection.id}.`,
        );
        continue;
      }

      const marketType = this.getMarketType(selection, eventId);

      if (marketType === "other") {
        warnings.push(
          `SportyBet market "${selection.marketId}" could not be mapped.`,
        );
        continue;
      }

      markets.push(
        mapSportyBetMarket({
          eventId,
          marketId: selection.marketId,
          marketType,
          line: selection.line,
          marketDescription: selection.rawSelectionName,
        }),
      );
    }

    return {
      data: this.removeDuplicateMarkets(markets),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async validateSelections(
    input: {
      selections: Selection[];
      events: Event[];
      markets: Market[];
    },
  ): Promise<AdapterOperationResult<boolean>> {
    throw new Error(
      "SportyBet selection validation is not implemented yet.",
    );
  }

  async createBookingCode(
    input: { selections: Selection[] },
  ): Promise<AdapterOperationResult<BookingCode>> {
    throw new Error(
      "SportyBet booking creation is not implemented yet.",
    );
  }

  private getMarketType(
    selection: Selection,
    eventId: string,
  ) {
    const booking = this.findBookingForEvent(eventId);

    const rawSelection = booking?.selections.find(
      (item) =>
        item.eventId === eventId &&
        item.marketId === selection.marketId,
      );

    const outcome = booking?.outcomes?.find(
      (item): item is SportyBetBookingOutcome =>
        typeof item === "object" &&
        item !== null &&
        "eventId" in item &&
        String((item as { eventId?: unknown }).eventId) === eventId,
    );

    return mapSportyBetSelection({
      eventId,
      marketId: selection.marketId,
      specifier: rawSelection?.specifier,
      outcomeId: rawSelection?.outcomeId || selection.rawSelectionName || "",
      marketDesc: outcome?.marketDesc,
      selectedOutcome: outcome?.selectedOutcome,
      odds: outcome?.odds,
    }).marketType;
  }

  private findBookingForEvent(eventId: string) {
    for (const booking of this.bookings.values()) {
      if (booking.selections.some((selection) => selection.eventId === eventId)) {
        return booking;
      }
    }

    return undefined;
  }

  private removeDuplicateMarkets(markets: Market[]): Market[] {
    const unique = new Map<string, Market>();

    for (const market of markets) {
      const key = `${market.eventId}:${market.id}:${market.type}:${market.line ?? ""}`;

      if (!unique.has(key)) {
        unique.set(key, market);
      }
    }

    return [...unique.values()];
  }
}