import type { Event } from "@booking-code-converter/shared";
import { normalizeTeamName } from "./event-matcher.js";

export interface BookmakerEventResolution {
  source: Event;
  target?: Event;
  matched: boolean;
  confidence: number;
  reasons: string[];
}

function eventsMatch(source: Event, target: Event): BookmakerEventResolution {
  const reasons: string[] = [];

  const sourceHome = normalizeTeamName(source.homeTeam?.name ?? "");
  const targetHome = normalizeTeamName(target.homeTeam?.name ?? "");

  const sourceAway = normalizeTeamName(source.awayTeam?.name ?? "");
  const targetAway = normalizeTeamName(target.awayTeam?.name ?? "");

  if (!sourceHome || !targetHome || sourceHome !== targetHome) {
    reasons.push("home teams do not match");
    return { source, target, matched: false, confidence: 0, reasons };
  }

  reasons.push("home teams match");

  if (!sourceAway || !targetAway || sourceAway !== targetAway) {
    reasons.push("away teams do not match");
    return { source, target, matched: false, confidence: 0, reasons };
  }

  reasons.push("away teams match");

  const sourceTime = new Date(source.startTime).getTime();
  const targetTime = new Date(target.startTime).getTime();

  if (!Number.isFinite(sourceTime) || !Number.isFinite(targetTime)) {
    reasons.push("invalid start time");
    return { source, target, matched: false, confidence: 0, reasons };
  }

  const differenceMinutes =
    Math.abs(sourceTime - targetTime) / 60000;

  if (differenceMinutes > 120) {
    reasons.push(
      `start times differ by ${Math.round(differenceMinutes)} minutes`,
    );
    return { source, target, matched: false, confidence: 0, reasons };
  }

  reasons.push("start times within tolerance");

  let confidence = 0.9;

  if (differenceMinutes <= 5) {
    confidence = 1;
  } else if (differenceMinutes <= 30) {
    confidence = 0.98;
  } else if (differenceMinutes <= 60) {
    confidence = 0.95;
  }

  return {
    source,
    target,
    matched: true,
    confidence,
    reasons,
  };
}

export function resolveBookmakerEvent(
  source: Event,
  targets: Event[],
): BookmakerEventResolution {
  let bestMatch: BookmakerEventResolution | undefined;

  for (const target of targets) {
    const result = eventsMatch(source, target);

    if (
      result.matched &&
      (!bestMatch || result.confidence > bestMatch.confidence)
    ) {
      bestMatch = result;
    }
  }

  return (
    bestMatch ?? {
      source,
      matched: false,
      confidence: 0,
      reasons: ["No matching bookmaker event found"],
    }
  );
}

export function resolveBookmakerEvents(
  sources: Event[],
  targets: Event[],
): BookmakerEventResolution[] {
  return sources.map((source) =>
    resolveBookmakerEvent(source, targets),
  );
}