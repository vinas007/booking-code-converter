import type { BookmakerAdapter, BookingCodeCapabilities, AdapterOperationResult, Event, Market, BookingCode, Selection } from "@booking-code-converter/shared";
import type { StakeAdapterConfig } from "./types.js";
export declare class StakeAdapter implements BookmakerAdapter {
    readonly bookmakerId: "stake";
    private readonly client;
    constructor(config: StakeAdapterConfig);
    getCapabilities(): BookingCodeCapabilities;
    resolveBookingCode(): Promise<AdapterOperationResult<BookingCode>>;
    loadSelections(): Promise<AdapterOperationResult<Selection[]>>;
    findEvents(): Promise<AdapterOperationResult<Event[]>>;
    findMarkets(input: {
        events: Event[];
    }): Promise<AdapterOperationResult<Market[]>>;
    validateSelections(): Promise<AdapterOperationResult<boolean>>;
    createBookingCode(): Promise<AdapterOperationResult<BookingCode>>;
}
//# sourceMappingURL=adapter.d.ts.map