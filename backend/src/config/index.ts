export function getConfig() {
  return {
    port: Number(process.env.PORT) || 3001,
    isProduction: process.env.NODE_ENV === "production",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    logLevel: process.env.LOG_LEVEL || "info",
    adapterTimeoutMs: Number(process.env.ADAPTER_TIMEOUT_MS) || 10000,
    rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 60,
    maxCodeLength: Number(process.env.MAX_CODE_LENGTH) || 500,
    minCodeLength: Number(process.env.MIN_CODE_LENGTH) || 3,
    bookmakerApiKeys: {
      bet9ja: process.env.BET9JA_API_KEY,
      betking: process.env.BETKING_API_KEY,
      sportybet: process.env.SPORTYBET_API_KEY,
      betano: process.env.BETANO_API_KEY,
      stake: process.env.STAKE_API_KEY,
      betbonanza: process.env.BETBONANZA_API_KEY,
      betpawa: process.env.BETPAWA_API_KEY,
      footballcom: process.env.FOOTBALLCOM_API_KEY,
    },
    stakeOddsApi: {
      apiKey: process.env.STAKE_ODDS_API_KEY,
      baseUrl: process.env.STAKE_ODDS_API_BASE_URL || "https://odds-data.stake.com",
    },
  };
}

export type AppConfig = ReturnType<typeof getConfig>;
