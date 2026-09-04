import type { BookmakerId } from "./bookmaker.js";
import type { BookingCode, Event, Market, Selection } from "./betting-model.js";
import type { IntegrationStatus } from "./integration-status.js";
import type { BookingCodeCapabilities } from "./capabilities.js";

export class UnsupportedOperationError extends Error {
  constructor(
    public readonly operation: string,
    public readonly bookmakerId: BookmakerId,
  ) {
    super(`Operation "${operation}" is not supported by adapter for "${bookmakerId}".`);
    this.name = "UnsupportedOperationError";
  }
}

export interface AdapterOperationResult<T> {
  data: T;
  warnings?: string[];
}

export interface ResolveBookingCodeInput {
  code: string;
}

export interface LoadSelectionsInput {
  code: string;
}

export interface FindEventsInput {
  selections: Selection[];
}

export interface FindMarketsInput {
  events: Event[];
  selections: Selection[];
}

export interface ValidateSelectionsInput {
  selections: Selection[];
  events: Event[];
  markets: Market[];
}

export interface CreateBookingCodeInput {
  selections: Selection[];
}

export interface BookmakerAdapter {
  readonly bookmakerId: BookmakerId;

  getCapabilities(): BookingCodeCapabilities;

  resolveBookingCode(
    input: ResolveBookingCodeInput,
  ): Promise<AdapterOperationResult<BookingCode>>;

  loadSelections(
    input: LoadSelectionsInput,
  ): Promise<AdapterOperationResult<Selection[]>>;

  findEvents(
    input: FindEventsInput,
  ): Promise<AdapterOperationResult<Event[]>>;

  findMarkets(
    input: FindMarketsInput,
  ): Promise<AdapterOperationResult<Market[]>>;

  validateSelections(
    input: ValidateSelectionsInput,
  ): Promise<AdapterOperationResult<boolean>>;

  createBookingCode(
    input: CreateBookingCodeInput,
  ): Promise<AdapterOperationResult<BookingCode>>;
}

export interface BookmakerAdapterMetadata {
  bookmakerId: BookmakerId;
  integrationStatus: IntegrationStatus;
  capabilities: BookingCodeCapabilities;
}
