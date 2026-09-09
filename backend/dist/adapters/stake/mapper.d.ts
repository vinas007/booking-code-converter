import type { Event, Market, MarketType, Selection, Sport, League } from "@booking-code-converter/shared";
import type { StakeSport, StakeCategory, StakeTournament, StakeFixture, StakeFixtureWithOdds, StakeMarket } from "./types.js";
export declare function mapStakeSport(raw: StakeSport): Sport;
export declare function mapStakeCategory(raw: StakeCategory, sportId: string): League;
export declare function mapStakeTournament(raw: StakeTournament, sportId: string): League;
export declare function mapStakeFixtureToEvent(raw: StakeFixture): Event;
export declare function mapStakeMarket(raw: StakeMarket, eventId: string): Market;
export interface MappedSelectionResult {
    selections: Selection[];
    warnings: string[];
}
export declare function mapStakeMarketSelections(rawMarket: StakeMarket, marketType: MarketType, marketId: string, homeTeamName?: string, awayTeamName?: string): MappedSelectionResult;
export interface MappedFixtureResult {
    event: Event;
    markets: Market[];
    selections: Selection[];
    warnings: string[];
}
export declare function mapStakeFixtureWithOdds(raw: StakeFixtureWithOdds): MappedFixtureResult;
//# sourceMappingURL=mapper.d.ts.map