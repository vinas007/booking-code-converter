export { matchEvents, normalizeTeamName } from "./event-matcher.js";
export { resolveEvent } from "./event-resolver.js";
export {
  resolveBookmakerEvent,
  resolveBookmakerEvents,
} from "./bookmaker-event-resolver.js";

export { matchMarkets } from "./market-matcher.js";

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

export {
  DEFAULT_START_TIME_TOLERANCE_MS,
  DEFAULT_LINE_TOLERANCE,
} from "./types.js";