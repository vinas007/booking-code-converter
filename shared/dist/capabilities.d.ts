import type { IntegrationStatus } from "./integration-status.js";
export type CapabilityStatus = IntegrationStatus;
export interface BookingCodeCapabilities {
    canResolveBookingCode: CapabilityStatus;
    canLoadSelections: CapabilityStatus;
    canFindEvents: CapabilityStatus;
    canFindMarkets: CapabilityStatus;
    canValidateSelections: CapabilityStatus;
    canCreateBookingCode: CapabilityStatus;
}
export declare const UNVERIFIED_CAPABILITIES: BookingCodeCapabilities;
export declare function isCapabilityAvailable(status: CapabilityStatus): boolean;
export declare function isCapabilityUnsupported(status: CapabilityStatus): boolean;
export type CapabilityKey = keyof BookingCodeCapabilities;
export declare const CAPABILITY_KEYS: CapabilityKey[];
export declare const CAPABILITY_LABELS: Record<CapabilityKey, string>;
//# sourceMappingURL=capabilities.d.ts.map