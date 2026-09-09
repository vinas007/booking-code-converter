import type { Event, Market } from "@booking-code-converter/shared";
export interface EventMatchResult {
    matched: boolean;
    confidence: number;
    reasons: string[];
}
export interface EventMatcherConfig {
    startTimeToleranceMs: number;
}
export declare const DEFAULT_START_TIME_TOLERANCE_MS: number;
export interface MarketMatchResult {
    matched: boolean;
    confidence: number;
    reasons: string[];
}
export interface MarketMatcherConfig {
    lineTolerance: number;
}
export declare const DEFAULT_LINE_TOLERANCE = 1e-9;
export type { Event, Market };
//# sourceMappingURL=types.d.ts.map