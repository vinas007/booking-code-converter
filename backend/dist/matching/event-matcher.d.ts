import type { Event } from "@booking-code-converter/shared";
import type { EventMatchResult, EventMatcherConfig } from "./types.js";
export declare function normalizeTeamName(name: string): string;
export declare function matchEvents(source: Event, target: Event, config?: Partial<EventMatcherConfig>): EventMatchResult;
//# sourceMappingURL=event-matcher.d.ts.map