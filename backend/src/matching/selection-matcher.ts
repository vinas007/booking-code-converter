import type {
  Selection,
  SelectionOutcome,
} from "@booking-code-converter/shared";

export interface SelectionMatchResult {
  matched: boolean;
  selection?: Selection;
  confidence: number;
  reasons: string[];
}

export function matchSelections(
  source: Selection,
  target: Selection,
): SelectionMatchResult {
  const reasons: string[] = [];

  if (source.outcome === "UNKNOWN" || target.outcome === "UNKNOWN") {
    return {
      matched: false,
      confidence: 0,
      reasons: ["unknown selection outcome"],
    };
  }

  if (source.outcome !== target.outcome) {
    return {
      matched: false,
      confidence: 0,
      reasons: [
        `selection outcomes differ: ${source.outcome} vs ${target.outcome}`,
      ],
    };
  }

  reasons.push("selection outcomes match");

  if (source.line !== undefined || target.line !== undefined) {
    if (source.line === undefined || target.line === undefined) {
      return {
        matched: false,
        confidence: 0,
        reasons: ["line present on only one selection"],
      };
    }

    if (source.line !== target.line) {
      return {
        matched: false,
        confidence: 0,
        reasons: [`selection lines differ: ${source.line} vs ${target.line}`],
      };
    }

    reasons.push("selection lines match");
  }

  if (source.marketId !== target.marketId) {
    reasons.push("market IDs differ");
  } else {
    reasons.push("market IDs match");
  }

  const confidence =
    source.marketId === target.marketId ? 1 : 0.95;

  return {
    matched: true,
    selection: target,
    confidence,
    reasons,
  };
}

export function resolveSelection(
  source: Selection,
  targets: Selection[],
): SelectionMatchResult {
  let bestMatch: SelectionMatchResult | undefined;

  for (const target of targets) {
    const result = matchSelections(source, target);

    if (
      result.matched &&
      (!bestMatch || result.confidence > bestMatch.confidence)
    ) {
      bestMatch = result;
    }
  }

  return (
    bestMatch ?? {
      matched: false,
      confidence: 0,
      reasons: ["No matching selection found"],
    }
  );
}
