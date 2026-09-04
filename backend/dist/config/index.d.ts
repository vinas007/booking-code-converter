export declare function getConfig(): {
    port: number;
    isProduction: boolean;
    corsOrigin: string;
    logLevel: string;
    adapterTimeoutMs: number;
    rateLimitPerMinute: number;
    maxCodeLength: number;
    minCodeLength: number;
    bookmakerApiKeys: {
        bet9ja: string | undefined;
        betking: string | undefined;
        sportybet: string | undefined;
        betano: string | undefined;
        stake: string | undefined;
        betbonanza: string | undefined;
        betpawa: string | undefined;
        footballcom: string | undefined;
    };
    stakeOddsApi: {
        apiKey: string | undefined;
        baseUrl: string;
    };
};
export type AppConfig = ReturnType<typeof getConfig>;
//# sourceMappingURL=index.d.ts.map