export const INTEGRATION_STATUS_LABELS = {
    unverified: "Unverified — we have not investigated this yet",
    researching: "Researching — investigation is in progress",
    verified: "Verified — integration has been confirmed working",
    partially_supported: "Partially Supported — some operations work, others do not",
    unsupported: "Unsupported — this bookmaker does not support this operation",
};
export function isOperationAllowed(status) {
    return status === "verified" || status === "partially_supported";
}
//# sourceMappingURL=integration-status.js.map