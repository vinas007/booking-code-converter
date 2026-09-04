import type { StakeAdapterConfig, StakeApiError } from "./types.js";
export declare class StakeHttpClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    constructor(config: StakeAdapterConfig);
    hasApiKey(): boolean;
    get<T>(path: string): Promise<T>;
    getSports(): Promise<unknown>;
    getSportCategories(sportSlug: string): Promise<unknown>;
    getCategoryTournaments(sportSlug: string, categorySlug: string): Promise<unknown>;
    getTournamentFixtures(sportSlug: string, categorySlug: string, tournamentSlug: string): Promise<unknown>;
    getFixtureOdds(fixtureSlug: string): Promise<unknown>;
}
export type { StakeApiError };
//# sourceMappingURL=client.d.ts.map