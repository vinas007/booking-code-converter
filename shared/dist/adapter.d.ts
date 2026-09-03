import type { BookingCode, Event, Market, Selection } from "./betting-model.js";
export interface BookmakerAdapter {
    readonly bookmakerId: string;
    decodeBookingCode(code: string): Promise<BookingCode>;
    getSelections(code: string): Promise<Selection[]>;
    findEvents(selections: Selection[]): Promise<Event[]>;
    findMarkets(events: Event[], selections: Selection[]): Promise<Market[]>;
    createBookingCode(selections: Selection[]): Promise<BookingCode>;
}
//# sourceMappingURL=adapter.d.ts.map