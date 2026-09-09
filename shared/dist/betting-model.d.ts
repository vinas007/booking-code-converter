import type { BookmakerId } from "./bookmaker.js";
export type SportId = string;
export interface Sport {
    id: SportId;
    name: string;
}
export type LeagueId = string;
export interface League {
    id: LeagueId;
    name: string;
    sportId: SportId;
    country?: string;
}
export type TeamId = string;
export interface Team {
    id: TeamId;
    name: string;
}
export type EventId = string;
export interface Event {
    id: EventId;
    sportId: SportId;
    leagueId: LeagueId;
    homeTeam: Team;
    awayTeam: Team;
    startTime: string;
    sourceId?: string;
}
export type MarketType = "1x2" | "doubleChance" | "overUnder" | "bothTeamsToScore" | "handicap" | "correctScore" | "halftimeFulltime" | "drawNoBet" | "totalGoals" | "anytimeGoalscorer" | "other";
export type MarketId = string;
export interface Market {
    id: MarketId;
    eventId: EventId;
    type: MarketType;
    line?: number;
    description?: string;
    sourceId?: string;
    rawMarketName?: string;
}
export type SelectionId = string;
export type SelectionOutcome = "HOME" | "DRAW" | "AWAY" | "HOME_OR_DRAW" | "DRAW_OR_AWAY" | "HOME_OR_AWAY" | "OVER" | "UNDER" | "YES" | "NO" | "HANDICAP_HOME" | "HANDICAP_AWAY" | "UNKNOWN";
export interface Selection {
    id: SelectionId;
    marketId: MarketId;
    outcome: SelectionOutcome;
    displayName: string;
    odds: number;
    line?: number;
    sourceId?: string;
    rawSelectionName?: string;
}
export interface BookingCode {
    bookmaker: BookmakerId;
    code: string;
}
export interface SourceIdentifier {
    bookmaker: BookmakerId;
    code: string;
}
export interface TargetIdentifier {
    bookmaker: BookmakerId;
    code?: string;
}
export interface ConversionRequest {
    source: SourceIdentifier;
    target: BookmakerId;
}
export interface ConversionResult {
    source: SourceIdentifier;
    target: TargetIdentifier;
    selections: Selection[];
    events: Event[];
    markets: Market[];
    status: "pending" | "success" | "failed";
    message?: string;
}
//# sourceMappingURL=betting-model.d.ts.map