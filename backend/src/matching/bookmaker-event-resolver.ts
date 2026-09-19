import type { Event } from "@booking-code-converter/shared";
import { resolveEvent } from "./event-resolver.js";

export interface BookmakerEventResolution {
  source: Event;
  target?: Event;
  matched: boolean;
  confidence: number;
  reasons: string[];
}

export function resolveBookmakerEvent(
  source: Event,
  targets: Event[],
): BookmakerEventResolution {
  const result = resolveEvent(source, targets);

  return {
    source,
    target: result.event,
    matched: result.matched,
    confidence: result.confidence,
    reasons: result.reasons,
  };
}

export function resolveBookmakerEvents(
  sources: Event[],
  targets: Event[],
): BookmakerEventResolution[] {
  return sources.map((source) => resolveBookmakerEvent(source, targets));
}
