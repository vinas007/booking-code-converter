export class SportyBetAdapter {
    config;
    bookmakerId = "sportybet";
    constructor(config) {
        this.config = config;
    }
    getCapabilities() {
        return {
            canResolveBookingCode: "unverified",
            canLoadSelections: "unverified",
            canFindEvents: "unverified",
            canFindMarkets: "unverified",
            canValidateSelections: "unverified",
            canCreateBookingCode: "unverified",
        };
    }
    async resolveBookingCode() {
        throw new Error("SportyBetAdapter.resolveBookingCode: UNVERIFIED — not implemented");
    }
    async loadSelections() {
        throw new Error("SportyBetAdapter.loadSelections: UNVERIFIED — not implemented");
    }
    async findEvents() {
        throw new Error("SportyBetAdapter.findEvents: UNVERIFIED — not implemented");
    }
    async findMarkets() {
        throw new Error("SportyBetAdapter.findMarkets: UNVERIFIED — not implemented");
    }
    async validateSelections() {
        throw new Error("SportyBetAdapter.validateSelections: UNVERIFIED — not implemented");
    }
    async createBookingCode() {
        throw new Error("SportyBetAdapter.createBookingCode: UNVERIFIED — not implemented");
    }
}
//# sourceMappingURL=adapter.js.map