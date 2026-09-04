export class UnsupportedOperationError extends Error {
    operation;
    bookmakerId;
    constructor(operation, bookmakerId) {
        super(`Operation "${operation}" is not supported by adapter for "${bookmakerId}".`);
        this.operation = operation;
        this.bookmakerId = bookmakerId;
        this.name = "UnsupportedOperationError";
    }
}
//# sourceMappingURL=adapter.js.map