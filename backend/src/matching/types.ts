import type { Event, Market } from "@booking-code-converter/shared";

export interface EventMatchResult {
  matched: boolean;
  confidence: number;
  reasons: string[];
}

export interface EventMatcherConfig {
  startTimeToleranceMs: number;
}

export const DEFAULT_START_TIME_TOLERANCE_MS = 2 * 60 * 60 * 1000;

export interface MarketMatchResult {
  matched: boolean;
  confidence: number;
  reasons: string[];
}

export interface MarketMatcherConfig {
  lineTolerance: number;
}

export const DEFAULT_LINE_TOLERANCE = 1e-9;

export type { Event, Market };
