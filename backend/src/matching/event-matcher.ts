import type { Event } from "@booking-code-converter/shared";
import type { EventMatchResult, EventMatcherConfig } from "./types.js";
import { DEFAULT_START_TIME_TOLERANCE_MS } from "./types.js";

// ─── Team name normalization ───────────────────────────────

const TEAM_SUFFIX_RE = /\s+(?:fc|afc|cf|sc|ac|as)\.?$/;
const PUNCTUATION_RE = /[.\-_'",/]/g;

export function normalizeTeamName(name: string): string {
  let normalized = name.toLowerCase().trim();
  normalized = normalized.replace(PUNCTUATION_RE, " ");
  normalized = normalized.replace(/\s+/g, " ").trim();
  normalized = normalized.replace(TEAM_SUFFIX_RE, "").trim();
  return normalized;
}

// ─── Event matching ─────────────────────────────────────────

export function matchEvents(
  source: Event,
  target: Event,
  config?: Partial<EventMatcherConfig>,
): EventMatchResult {
  const toleranceMs = config?.startTimeToleranceMs ?? DEFAULT_START_TIME_TOLERANCE_MS;
  const reasons: string[] = [];
  let score = 0;
  const maxScore = 100;

  // ── Home team comparison ──
  const sourceHome = source.homeTeam?.name;
  const targetHome = target.homeTeam?.name;

  if (!sourceHome || !targetHome) {
    reasons.push("missing home team");
  } else {
    const normSourceHome = normalizeTeamName(sourceHome);
    const normTargetHome = normalizeTeamName(targetHome);
    if (normSourceHome === normTargetHome && normSourceHome.length > 0) {
      reasons.push("home teams match");
      score += 30;
    } else {
      reasons.push("home teams do not match");
      return { matched: false, confidence: 0, reasons };
    }
  }

  // ── Away team comparison ──
  const sourceAway = source.awayTeam?.name;
  const targetAway = target.awayTeam?.name;

  if (!sourceAway || !targetAway) {
    reasons.push("missing away team");
  } else {
    const normSourceAway = normalizeTeamName(sourceAway);
    const normTargetAway = normalizeTeamName(targetAway);
    if (normSourceAway === normTargetAway && normSourceAway.length > 0) {
      reasons.push("away teams match");
      score += 30;
    } else {
      reasons.push("away teams do not match");
      return { matched: false, confidence: 0, reasons };
    }
  }

  // ── Start time comparison ──
  if (!source.startTime || !target.startTime) {
    reasons.push("missing start time");
  } else {
    const sourceTime = new Date(source.startTime).getTime();
    const targetTime = new Date(target.startTime).getTime();

    if (isNaN(sourceTime) || isNaN(targetTime)) {
      reasons.push("invalid start time");
    } else {
      const diffMs = Math.abs(sourceTime - targetTime);
      if (diffMs <= toleranceMs) {
        reasons.push("start times within tolerance");
        score += 25;
      } else {
        reasons.push(`start times differ by ${Math.round(diffMs / 60000)} minutes (exceeds ${Math.round(toleranceMs / 60000)} minute tolerance)`);
        return { matched: false, confidence: 0, reasons };
      }
    }
  }

  // ── Sport comparison ──
  if (!source.sportId || !target.sportId) {
    reasons.push("missing sport");
  } else {
    if (source.sportId === target.sportId) {
      reasons.push("sport matches");
      score += 10;
    } else {
      reasons.push("sport differs");
      return { matched: false, confidence: 0, reasons };
    }
  }

  // ── League comparison ──
  if (!source.leagueId || !target.leagueId) {
    reasons.push("missing league");
  } else {
    if (source.leagueId === target.leagueId) {
      reasons.push("league matches");
      score += 5;
    } else {
      reasons.push("league differs");
      return { matched: false, confidence: 0, reasons };
    }
  }

  // If home or away team was missing, we can't confidently match
  const hasMissingTeam = (!sourceHome || !targetHome || !sourceAway || !targetAway);
  if (hasMissingTeam) {
    return { matched: false, confidence: 0, reasons };
  }

  // Match if core signals (teams + time) all pass
  const corePassed = reasons.includes("home teams match")
    && reasons.includes("away teams match")
    && (reasons.includes("start times within tolerance") || reasons.includes("missing start time"));

  const matched = corePassed && !reasons.includes("sport differs");
  const confidence = matched ? score / maxScore : 0;

  return { matched, confidence, reasons };
}
