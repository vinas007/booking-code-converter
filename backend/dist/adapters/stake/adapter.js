import { UnsupportedOperationError } from "@booking-code-converter/shared";
import { StakeApiError } from "./types.js";
import { StakeHttpClient } from "./client.js";
import { mapStakeFixtureToEvent, mapStakeFixtureWithOdds, } from "./mapper.js";
const STAKE_CAPABILITIES = {
    canResolveBookingCode: "unverified",
    canLoadSelections: "unverified",
    canFindEvents: "verified",
    canFindMarkets: "verified",
    canValidateSelections: "unverified",
    canCreateBookingCode: "unverified",
};
export class StakeAdapter {
    bookmakerId = "stake";
    client;
    constructor(config) {
        this.client = new StakeHttpClient(config);
    }
    getCapabilities() {
        return STAKE_CAPABILITIES;
    }
    async resolveBookingCode() {
        throw new UnsupportedOperationError("resolveBookingCode", "stake");
    }
    async loadSelections() {
        throw new UnsupportedOperationError("loadSelections", "stake");
    }
    async findEvents() {
        const data = await this.client.getSports();
        const fixtures = data.fixture ?? [];
        const events = fixtures.map(mapStakeFixtureToEvent);
        return { data: events };
    }
    async findMarkets(input) {
        const allMarkets = [];
        const allWarnings = [];
        for (const event of input.events) {
            const fixtureSlug = event.sourceId ?? event.id;
            try {
                const data = await this.client.getFixtureOdds(fixtureSlug);
                const fixtures = data.fixture ?? [];
                for (const fixture of fixtures) {
                    const result = mapStakeFixtureWithOdds(fixture);
                    allMarkets.push(...result.markets);
                    allWarnings.push(...result.warnings);
                }
            }
            catch (err) {
                if (err instanceof StakeApiError && err.code === "not_found") {
                    allWarnings.push(`Fixture "${fixtureSlug}" not found on Stake API`);
                    continue;
                }
                throw err;
            }
        }
        return { data: allMarkets, warnings: allWarnings.length > 0 ? allWarnings : undefined };
    }
    async validateSelections() {
        throw new UnsupportedOperationError("validateSelections", "stake");
    }
    async createBookingCode() {
        throw new UnsupportedOperationError("createBookingCode", "stake");
    }
}
//# sourceMappingURL=adapter.js.map