import type { Selection } from "@booking-code-converter/shared";
import { resolveSelection } from "./selection-matcher.js";

export interface SelectionResolutionResult {
  source: Selection;
  target?: Selection;
  matched: boolean;
  confidence: number;
  reasons: string[];
}

export function resolveSelections(
  sources: Selection[],
  targets: Selection[],
): SelectionResolutionResult[] {
  return sources.map((source) => {
    const result = resolveSelection(source, targets);

    return {
      source,
      target: result.selection,
      matched: result.matched,
      confidence: result.confidence,
      reasons: result.reasons,
    };
  });
}
