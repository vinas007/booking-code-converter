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
    };
  }

  async findEvents(
    input: { selections: Selection[] },
  ): Promise<AdapterOperationResult<Event[]>> {
    throw new Error("SportyBet event matching is not implemented yet.");
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