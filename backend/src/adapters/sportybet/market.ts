import type {
  Market,
  MarketType,
} from "@booking-code-converter/shared";

export interface SportyBetMarketInput {
  eventId: string;
  marketId: string;
  marketType: MarketType;
  line?: number;
  marketDescription?: string;
}

export function mapSportyBetMarket(
  input: SportyBetMarketInput,
): Market {
  return {
    id: input.marketId,
    eventId: input.eventId,
    type: input.marketType,
    line: input.line,
    description: input.marketDescription,
    sourceId: input.marketId,
    rawMarketName: input.marketDescription,
  };
}
