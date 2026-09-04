export type IntegrationStatus = "unverified" | "researching" | "verified" | "partially_supported" | "unsupported";
export declare const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string>;
export declare function isOperationAllowed(status: IntegrationStatus): boolean;
//# sourceMappingURL=integration-status.d.ts.map