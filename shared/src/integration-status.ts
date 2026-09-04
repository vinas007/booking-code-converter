export type IntegrationStatus =
  | "unverified"
  | "researching"
  | "verified"
  | "partially_supported"
  | "unsupported";

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  unverified: "Unverified — we have not investigated this yet",
  researching: "Researching — investigation is in progress",
  verified: "Verified — integration has been confirmed working",
  partially_supported: "Partially Supported — some operations work, others do not",
  unsupported: "Unsupported — this bookmaker does not support this operation",
};

export function isOperationAllowed(
  status: IntegrationStatus,
): boolean {
  return status === "verified" || status === "partially_supported";
}
