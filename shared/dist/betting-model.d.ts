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
}
export type MarketType = "1x2" | "doubleChance" | "overUnder" | "bothTeamsToScore" | "handicap" | "correctScore" | "halftimeFulltime" | "drawNoBet" | "totalGoals" | "anytimeGoalscorer" | "other";
export type MarketId = string;
export interface Market {
    id: MarketId;
    eventId: EventId;
    type: MarketType;
    line?: number;
    description?: string;
}
export type SelectionId = string;
export interface Selection {
    id: SelectionId;
    marketId: MarketId;
    outcome: string;
    odds: number;
    line?: number;
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