import type { Event } from "@booking-code-converter/shared";
import { matchEvents } from "./event-matcher.js";

export interface EventResolutionResult {
  matched: boolean;
  event?: Event;
  confidence: number;
  reasons: string[];
}

export function resolveEvent(
  source: Event,
  targets: Event[],
): EventResolutionResult {
  let bestMatch: Event | undefined;
  let bestConfidence = 0;
  let bestReasons: string[] = [];

  for (const target of targets) {
    const result = matchEvents(source, target);

    if (result.matched && result.confidence > bestConfidence) {
      bestMatch = target;
      bestConfidence = result.confidence;
      bestReasons = result.reasons;
    }
  }

  if (!bestMatch) {
    return {
      matched: false,
      confidence: 0,
      reasons: ["No matching event found"],
    };
  }

  return {
    matched: true,
    event: bestMatch,
    confidence: bestConfidence,
    reasons: bestReasons,
  };
}
