import { StakeApiError as StakeApiErrorClass } from "./types.js";
export class StakeHttpClient {
    apiKey;
    baseUrl;
    timeoutMs;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl ?? "https://odds-data.stake.com";
        this.timeoutMs = config.timeoutMs ?? 10000;
    }
    hasApiKey() {
        return typeof this.apiKey === "string" && this.apiKey.length > 0;
    }
    async get(path) {
        if (!this.hasApiKey()) {
            throw new StakeApiErrorClass("missing_api_key", "Stake API key is not configured. Set STAKE_ODDS_API_KEY to use Stake Sports Data API.");
        }
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        let response;
        try {
            response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-api-key": this.apiKey,
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            });
        }
        catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                throw new StakeApiErrorClass("network_error", `Request timed out after ${this.timeoutMs}ms`);
            }
            throw new StakeApiErrorClass("network_error", `Network error contacting Stake API: ${err instanceof Error ? err.message : String(err)}`);
        }
        finally {
            clearTimeout(timeout);
        }
        if (response.status === 401) {
            throw new StakeApiErrorClass("unauthorized", "Stake API returned 401 Unauthorized. Check your API key.", 401);
        }
        if (response.status === 403) {
            throw new StakeApiErrorClass("forbidden", "Stake API returned 403 Forbidden. Your API key may lack required permissions.", 403);
        }
        if (response.status === 404) {
            throw new StakeApiErrorClass("not_found", `Stake API returned 404 for ${path}.`, 404);
        }
        if (response.status === 429) {
            throw new StakeApiErrorClass("rate_limited", "Stake API returned 429 Rate Limited. Too many requests.", 429);
        }
        if (response.status >= 500) {
            throw new StakeApiErrorClass("upstream_error", `Stake API returned ${response.status} upstream error.`, response.status);
        }
        let body;
        try {
            body = await response.json();
        }
        catch {
            throw new StakeApiErrorClass("malformed_response", "Stake API returned a non-JSON response.");
        }
        if (body === null || body === undefined || typeof body !== "object") {
            throw new StakeApiErrorClass("malformed_response", "Stake API returned an unexpected response shape.");
        }
        return body;
    }
    async getSports() {
        return this.get("/api/sports");
    }
    async getSportCategories(sportSlug) {
        return this.get(`/api/sports/${sportSlug}/categories`);
    }
    async getCategoryTournaments(sportSlug, categorySlug) {
        return this.get(`/api/sports/${sportSlug}/categories/${categorySlug}/tournaments`);
    }
    async getTournamentFixtures(sportSlug, categorySlug, tournamentSlug) {
        return this.get(`/api/sports/${sportSlug}/categories/${categorySlug}/tournaments/${tournamentSlug}/fixtures`);
    }
    async getFixtureOdds(fixtureSlug) {
        return this.get(`/api/fixtures/${fixtureSlug}/odds`);
    }
}
//# sourceMappingURL=client.js.map