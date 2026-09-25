import type { Selection } from "@booking-code-converter/shared";
import { resolveSelection } from "./selection-matcher.js";

export interface SelectionResolutionResult {
  source: Selection;
  target?: Selection;
  matched: boolean;
  confidence: number;
  reasons: string[];
}

export interface SelectionMarketMapping {
  sourceMarketId: string;
  targetMarketId: string;
}

export function resolveSelectionInMarket(
  source: Selection,
  targets: Selection[],
  marketMapping?: SelectionMarketMapping,
): SelectionResolutionResult {
  if (marketMapping) {
    if (source.marketId !== marketMapping.sourceMarketId) {
      return {
        source,
        matched: false,
        confidence: 0,
        reasons: ["source selection does not belong to the mapped market"],
      };
    }

    const marketTargets = targets.filter(
      (target) => target.marketId === marketMapping.targetMarketId,
    );

    if (marketTargets.length === 0) {
      return {
        source,
        matched: false,
        confidence: 0,
        reasons: ["No target selections found in the mapped market"],
      };
    }

    const result = resolveSelection(source, marketTargets);

    return {
      source,
      target: result.selection,
      matched: result.matched,
      confidence: result.confidence,
      reasons: result.reasons,
    };
  }

  const result = resolveSelection(source, targets);

  return {
    source,
    target: result.selection,
    matched: result.matched,
    confidence: result.confidence,
    reasons: result.reasons,
  };
}

export function resolveSelections(
  sources: Selection[],
  targets: Selection[],
  marketMappings: SelectionMarketMapping[] = [],
): SelectionResolutionResult[] {
  return sources.map((source) => {
    if (marketMappings.length > 0) {
      const mapping = marketMappings.find(
        (item) => item.sourceMarketId === source.marketId,
      );

      if (!mapping) {
        return {
          source,
          matched: false,
          confidence: 0,
          reasons: ["No target market mapping found for source selection"],
        };
      }

      return resolveSelectionInMarket(source, targets, mapping);
    }

    return resolveSelectionInMarket(source, targets);
  });
}
