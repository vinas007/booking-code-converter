import type {
  ConversionRequest,
  ConversionResult,
} from "@booking-code-converter/shared";
import { UnsupportedOperationError } from "@booking-code-converter/shared";
import type { AdapterRegistry } from "../adapters/registry.js";

export class ConversionServiceImpl {
  constructor(private readonly registry: AdapterRegistry) {}

  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const sourceAdapter = this.registry.get(request.source.bookmaker);
    const targetAdapter = this.registry.get(request.target);

    if (!sourceAdapter) {
      return {
        source: request.source,
        target: { bookmaker: request.target },
        selections: [],
        events: [],
        markets: [],
        status: "failed",
        message: `No adapter is registered for ${request.source.bookmaker}.`,
      };
    }

    if (!targetAdapter) {
      return {
        source: request.source,
        target: { bookmaker: request.target },
        selections: [],
        events: [],
        markets: [],
        status: "failed",
        message: `No adapter is registered for ${request.target}.`,
      };
    }

    try {
      const resolved = await sourceAdapter.resolveBookingCode({
        code: request.source.code,
      });

      const selections = await sourceAdapter.loadSelections({
        code: resolved.data.code,
      });

      const events = await targetAdapter.findEvents({
        selections: selections.data,
      });

      const markets = await targetAdapter.findMarkets({
        events: events.data,
        selections: selections.data,
      });

      const valid = await targetAdapter.validateSelections({
        selections: selections.data,
        events: events.data,
        markets: markets.data,
      });

      if (!valid.data) {
        return {
          source: request.source,
          target: { bookmaker: request.target },
          selections: selections.data,
          events: events.data,
          markets: markets.data,
          status: "failed",
          message: "Selections could not be validated on the target bookmaker.",
        };
      }

      const created = await targetAdapter.createBookingCode({
        selections: selections.data,
      });

      return {
        source: request.source,
        target: {
          bookmaker: request.target,
          code: created.data.code,
        },
        selections: selections.data,
        events: events.data,
        markets: markets.data,
        status: "success",
        message: "Booking code converted successfully.",
      };
    } catch (error) {
      if (error instanceof UnsupportedOperationError) {
        return {
          source: request.source,
          target: { bookmaker: request.target },
          selections: [],
          events: [],
          markets: [],
          status: "failed",
          message: error.message,
        };
      }

      return {
        source: request.source,
        target: { bookmaker: request.target },
        selections: [],
        events: [],
        markets: [],
        status: "failed",
        message: error instanceof Error ? error.message : "Conversion failed.",
      };
    }
  }
}