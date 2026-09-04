import type { BookmakerAdapter } from "@booking-code-converter/shared";
import type { SportyBetAdapterConfig } from "./types.js";
export declare class SportyBetAdapter implements BookmakerAdapter {
    private readonly config;
    readonly bookmakerId: "sportybet";
    constructor(config: SportyBetAdapterConfig);
    getCapabilities(): {
        canResolveBookingCode: "unverified";
        canLoadSelections: "unverified";
        canFindEvents: "unverified";
        canFindMarkets: "unverified";
        canValidateSelections: "unverified";
        canCreateBookingCode: "unverified";
    };
    resolveBookingCode(): Promise<never>;
    loadSelections(): Promise<never>;
    findEvents(): Promise<never>;
    findMarkets(): Promise<never>;
    validateSelections(): Promise<never>;
    createBookingCode(): Promise<never>;
}
//# sourceMappingURL=adapter.d.ts.map