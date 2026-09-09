import { DEFAULT_LINE_TOLERANCE } from "./types.js";
const LINE_MARKET_TYPES = new Set([
    "overUnder",
    "totalGoals",
    "handicap",
]);
export function matchMarkets(source, target, config) {
    const lineTolerance = config?.lineTolerance ?? DEFAULT_LINE_TOLERANCE;
    const reasons = [];
    if (!source.type || !target.type) {
        reasons.push("missing market type");
        return { matched: false, confidence: 0, reasons };
    }
    if (source.type === "other" || target.type === "other") {
        reasons.push("unknown market type");
        return { matched: false, confidence: 0, reasons };
    }
    if (source.type !== target.type) {
        reasons.push(`market types differ: ${source.type} vs ${target.type}`);
        return { matched: false, confidence: 0, reasons };
    }
    reasons.push("market types match");
    if (LINE_MARKET_TYPES.has(source.type)) {
        const sourceLine = source.line;
        const targetLine = target.line;
        if (sourceLine == null && targetLine == null) {
            reasons.push("line absent on both markets");
        }
        else if (sourceLine == null || targetLine == null) {
            reasons.push("line present on only one market");
            return { matched: false, confidence: 0, reasons };
        }
        else {
            const diff = Math.abs(sourceLine - targetLine);
            if (diff <= lineTolerance) {
                reasons.push("lines match");
            }
            else {
                reasons.push(`lines differ: ${sourceLine} vs ${targetLine}`);
                return { matched: false, confidence: 0, reasons };
            }
        }
    }
    else {
        reasons.push("line not required for this market type");
    }
    return { matched: true, confidence: 1, reasons };
}
//# sourceMappingURL=market-matcher.js.map