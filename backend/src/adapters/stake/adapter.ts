import type {
  BookmakerAdapter,
  BookingCodeCapabilities,
  AdapterOperationResult,
  Event,
  Market,
  BookingCode,
  Selection,
} from "@booking-code-converter/shared";
import { UnsupportedOperationError } from "@booking-code-converter/shared";
import type { StakeAdapterConfig } from "./types.js";
import { StakeApiError } from "./types.js";
import { StakeHttpClient } from "./client.js";
import {
  mapStakeFixtureToEvent,
  mapStakeFixtureWithOdds,
  type MappedFixtureResult,
} from "./mapper.js";
import type {
  StakeSportsResponse,
  StakeCategoryResponse,
  StakeTournamentResponse,
  StakeFixtureResponse,
  StakeFixtureWithOdds,
  StakeFixture,
} from "./types.js";

const STAKE_CAPABILITIES: BookingCodeCapabilities = {
  canResolveBookingCode: "unverified",
  canLoadSelections: "unverified",
  canFindEvents: "verified",
  canFindMarkets: "verified",
  canValidateSelections: "unverified",
  canCreateBookingCode: "unverified",
};

export class StakeAdapter implements BookmakerAdapter {
  readonly bookmakerId = "stake" as const;
  private readonly client: StakeHttpClient;

  constructor(config: StakeAdapterConfig) {
    this.client = new StakeHttpClient(config);
  }

  getCapabilities(): BookingCodeCapabilities {
    return STAKE_CAPABILITIES;
  }

  async resolveBookingCode(): Promise<AdapterOperationResult<BookingCode>> {
    throw new UnsupportedOperationError("resolveBookingCode", "stake");
  }

  async loadSelections(): Promise<AdapterOperationResult<Selection[]>> {
    throw new UnsupportedOperationError("loadSelections", "stake");
  }

  async findEvents(): Promise<AdapterOperationResult<Event[]>> {
    const data = await this.client.getSports() as StakeSportsResponse;
    const fixtures = data.fixture ?? [];
    const events = fixtures.map(mapStakeFixtureToEvent);
    return { data: events };
  }

  async findMarkets(input: { events: Event[] }): Promise<AdapterOperationResult<Market[]>> {
    const allMarkets: Market[] = [];
    const allWarnings: string[] = [];

    for (const event of input.events) {
      const fixtureSlug = event.sourceId ?? event.id;
      try {
        const data = await this.client.getFixtureOdds(fixtureSlug) as StakeFixtureResponse;
        const fixtures = data.fixture ?? [];

        for (const fixture of fixtures) {
          const result: MappedFixtureResult = mapStakeFixtureWithOdds(fixture);
          allMarkets.push(...result.markets);
          allWarnings.push(...result.warnings);
        }
      } catch (err) {
        if (err instanceof StakeApiError && err.code === "not_found") {
          allWarnings.push(`Fixture "${fixtureSlug}" not found on Stake API`);
          continue;
        }
        throw err;
      }
    }

    return { data: allMarkets, warnings: allWarnings.length > 0 ? allWarnings : undefined };
  }

  async validateSelections(): Promise<AdapterOperationResult<boolean>> {
    throw new UnsupportedOperationError("validateSelections", "stake");
  }

  async createBookingCode(): Promise<AdapterOperationResult<BookingCode>> {
    throw new UnsupportedOperationError("createBookingCode", "stake");
  }
}
