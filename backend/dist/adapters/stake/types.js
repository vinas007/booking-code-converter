export const STAKE_DEFAULT_CONFIG = {
    apiKey: undefined,
    baseUrl: "https://odds-data.stake.com",
    timeoutMs: 10000,
};
export class StakeApiError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "StakeApiError";
    }
}
//# sourceMappingURL=types.js.map