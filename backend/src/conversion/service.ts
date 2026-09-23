import type {
  AdapterOperationResult,
  BookmakerAdapter,
  ConversionRequest,
  ConversionResult,
  Event,
  Selection,
} from "@booking-code-converter/shared";
import { UnsupportedOperationError } from "@booking-code-converter/shared";
import type { AdapterRegistry } from "../adapters/registry.js";
import { resolveBookmakerEvents } from "../matching/bookmaker-event-resolver.js";
import { resolveSelections } from "../matching/selection-resolver.js";

interface SelectionCapableAdapter extends BookmakerAdapter {
  findSelections(
    events: Event[],
  ): Promise<AdapterOperationResult<Selection[]>>;
}

function hasSelectionLookup(
  adapter: BookmakerAdapter,
): adapter is SelectionCapableAdapter {
  return typeof (adapter as Partial<SelectionCapableAdapter>).findSelections ===
    "function";
}

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

      const sourceSelections = await sourceAdapter.loadSelections({
        code: resolved.data.code,
      });

      const sourceEvents = await sourceAdapter.findEvents({
        selections: sourceSelections.data,
      });

      if (sourceEvents.data.length === 0) {
        return {
          source: request.source,
          target: { bookmaker: request.target },
          selections: sourceSelections.data,
          events: [],
          markets: [],
          status: "failed",
          message: "No source events could be resolved from the booking.",
        };
      }

      const targetEvents = await targetAdapter.findEvents({
        selections: sourceSelections.data,
      });

      if (targetEvents.data.length === 0) {
        return {
          source: request.source,
          target: { bookmaker: request.target },
          selections: sourceSelections.data,
          events: [],
          markets: [],
          status: "failed",
          message: "No target bookmaker events were found.",
        };
      }

      const eventResolutions = resolveBookmakerEvents(
        sourceEvents.data,
        targetEvents.data,
      );

      const matchedEvents = eventResolutions
        .filter((resolution) => resolution.matched && resolution.target)
        .map((resolution) => resolution.target!);

      if (matchedEvents.length !== sourceEvents.data.length) {
        const unmatchedCount =
          sourceEvents.data.length - matchedEvents.length;

        return {
          source: request.source,
          target: { bookmaker: request.target },
          selections: sourceSelections.data,
          events: matchedEvents,
          markets: [],
          status: "failed",
          message: `${unmatchedCount} source event(s) could not be matched on the target bookmaker.`,
        };
      }

      const markets = await targetAdapter.findMarkets({
        events: matchedEvents,
        selections: sourceSelections.data,
      });

      if (hasSelectionLookup(targetAdapter)) {
        const targetSelections = await targetAdapter.findSelections(
          matchedEvents,
        );

        const selectionResolutions = resolveSelections(
          sourceSelections.data,
          targetSelections.data,
        );

        const matchedSelections = selectionResolutions
          .filter((resolution) => resolution.matched && resolution.target)
          .map((resolution) => resolution.target!);

        if (matchedSelections.length !== sourceSelections.data.length) {
          const unmatchedCount =
            sourceSelections.data.length - matchedSelections.length;

          return {
            source: request.source,
            target: { bookmaker: request.target },
            selections: matchedSelections,
            events: matchedEvents,
            markets: markets.data,
            status: "failed",
            message: `${unmatchedCount} source selection(s) could not be matched on the target bookmaker.`,
          };
        }

        const valid = await targetAdapter.validateSelections({
          selections: matchedSelections,
          events: matchedEvents,
          markets: markets.data,
        });

        if (!valid.data) {
          return {
            source: request.source,
            target: { bookmaker: request.target },
            selections: matchedSelections,
            events: matchedEvents,
            markets: markets.data,
            status: "failed",
            message:
              "Selections could not be validated on the target bookmaker.",
          };
        }

        const created = await targetAdapter.createBookingCode({
          selections: matchedSelections,
        });

        return {
          source: request.source,
          target: {
            bookmaker: request.target,
            code: created.data.code,
          },
          selections: matchedSelections,
          events: matchedEvents,
          markets: markets.data,
          status: "success",
          message: "Booking code converted successfully.",
        };
      }

      const valid = await targetAdapter.validateSelections({
        selections: sourceSelections.data,
        events: matchedEvents,
        markets: markets.data,
      });

      if (!valid.data) {
        return {
          source: request.source,
          target: { bookmaker: request.target },
          selections: sourceSelections.data,
          events: matchedEvents,
          markets: markets.data,
          status: "failed",
          message: "Selections could not be validated on the target bookmaker.",
        };
      }

      const created = await targetAdapter.createBookingCode({
        selections: sourceSelections.data,
      });

      return {
        source: request.source,
        target: {
          bookmaker: request.target,
          code: created.data.code,
        },
        selections: sourceSelections.data,
        events: matchedEvents,
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