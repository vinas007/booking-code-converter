export { matchEvents, normalizeTeamName } from "./event-matcher.js";
export { resolveEvent } from "./event-resolver.js";

export {
  resolveBookmakerEvent,
  resolveBookmakerEvents,
} from "./bookmaker-event-resolver.js";

export { matchMarkets } from "./market-matcher.js";

export {
  resolveMarket,
  resolveMarkets,
} from "./market-resolver.js";

export {
  matchSelections,
  resolveSelection,
} from "./selection-matcher.js";

export {
  resolveSelections,
} from "./selection-resolver.js";

export type {
  EventMatchResult,
  EventMatcherConfig,
  MarketMatchResult,
  MarketMatcherConfig,
  Event,
  Market,
} from "./types.js";

export type {
  EventResolutionResult,
} from "./event-resolver.js";

export type {
  BookmakerEventResolution,
} from "./bookmaker-event-resolver.js";

export type {
  EventMarketMapping,
  MarketResolutionResult,
} from "./market-resolver.js";

export type {
  SelectionMatchResult,
} from "./selection-matcher.js";

export type {
  SelectionResolutionResult,
} from "./selection-resolver.js";

export {
  DEFAULT_START_TIME_TOLERANCE_MS,
  DEFAULT_LINE_TOLERANCE,
} from "./types.js";