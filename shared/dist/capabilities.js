export const UNVERIFIED_CAPABILITIES = {
    canResolveBookingCode: "unverified",
    canLoadSelections: "unverified",
    canFindEvents: "unverified",
    canFindMarkets: "unverified",
    canValidateSelections: "unverified",
    canCreateBookingCode: "unverified",
};
export function isCapabilityAvailable(status) {
    return status === "verified" || status === "partially_supported";
}
export function isCapabilityUnsupported(status) {
    return status === "unsupported";
}
export const CAPABILITY_KEYS = [
    "canResolveBookingCode",
    "canLoadSelections",
    "canFindEvents",
    "canFindMarkets",
    "canValidateSelections",
    "canCreateBookingCode",
];
export const CAPABILITY_LABELS = {
    canResolveBookingCode: "Resolve booking code",
    canLoadSelections: "Load selections",
    canFindEvents: "Find events",
    canFindMarkets: "Find markets",
    canValidateSelections: "Validate selections",
    canCreateBookingCode: "Create booking code",
};
//# sourceMappingURL=capabilities.js.map