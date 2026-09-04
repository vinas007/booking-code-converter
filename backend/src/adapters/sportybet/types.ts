export interface SportyBetAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export const SPORTYBET_DEFAULT_CONFIG: SportyBetAdapterConfig = {
  apiKey: undefined,
  baseUrl: undefined,
  timeoutMs: 10000,
};
