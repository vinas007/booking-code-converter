export interface StakeAdapterConfig {
    apiKey?: string;
    baseUrl?: string;
    timeoutMs?: number;
}
export declare const STAKE_DEFAULT_CONFIG: StakeAdapterConfig;
export interface StakeSport {
    id: string;
    slug: string;
    type: string;
    extId: string;
    provider: string;
    enabled: boolean;
    cashoutEnabled: boolean;
    rank: number;
    liveRank: number | null;
    cashoutDelay: number;
}
export interface StakeCategory {
    id: string;
    slug: string;
    extId: string;
    provider: string;
    enabled: boolean;
    cashoutEnabled: boolean;
    sportId: string;
    rank: number;
    cashoutDelay: number;
}
export interface StakeTournament {
    id: string;
    slug: string;
    extId: string;
    provider: string;
    enabled: boolean;
    cashoutEnabled: boolean;
    categoryId: string;
    sportId: string;
    categoryRank: number;
    sportRank: number;
    rank: number;
    cashoutDelay: number;
}
export interface StakeCompetitor {
    name: string;
    position?: string;
}
export interface StakeFixture {
    id: string;
    slug: string;
    name: string;
    type: string;
    extId: string;
    provider: string;
    enabled: boolean;
    cashoutEnabled: boolean;
    blacklisted: boolean;
    status: string;
    startTime: number;
    updatedAt: number;
    tournamentId: string;
    tournament?: string;
    category?: string;
    competitors: StakeCompetitor[];
}
export interface StakeOutcome {
    name: string;
    odds: number;
    active: boolean;
}
export interface StakeMarket {
    group: string;
    status: string;
    outcomes: StakeOutcome[];
    market_id: string;
    specifiers: string | null;
    market_name: string;
    template_name: string;
}
export interface StakeFixtureWithOdds extends StakeFixture {
    markets?: StakeMarket[];
    teams?: {
        home: string;
        away: string;
    };
    total_markets?: number;
}
export interface StakeSportsResponse {
    sport: StakeSport;
    category?: StakeCategory[];
    tournament?: StakeTournament[];
    fixture?: StakeFixture[];
    outright?: StakeFixture[];
}
export interface StakeCategoryResponse {
    sport: StakeSport;
    category: StakeCategory[];
    tournament?: StakeTournament[];
    fixture?: StakeFixture[];
}
export interface StakeTournamentResponse {
    sport: StakeSport;
    tournament: StakeTournament[];
    fixture?: StakeFixture[];
    outright?: StakeFixture[];
}
export interface StakeFixtureResponse {
    sport: StakeSport;
    fixture: StakeFixtureWithOdds[];
}
export type StakeErrorCode = "missing_api_key" | "unauthorized" | "forbidden" | "not_found" | "rate_limited" | "upstream_error" | "network_error" | "malformed_response";
export declare class StakeApiError extends Error {
    readonly code: StakeErrorCode;
    readonly statusCode?: number | undefined;
    constructor(code: StakeErrorCode, message: string, statusCode?: number | undefined);
}
//# sourceMappingURL=types.d.ts.map