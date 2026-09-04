# Bookmaker Integration Research

This document tracks what we currently know and what remains unverified for each bookmaker integration candidate. Every item is labeled with its verification status. No assumptions are presented as facts.

---

## SportyBet

### What we know

- **Booking-code loading exists**: SportyBet provides a "Use Booking Code" or similar feature in their betslip UI that allows users to load a booking code and populate their betslip.
- **Users can create a booking code from their betslip**: When a user builds a betslip on SportyBet, they can generate a booking code to share with others.

### What remains unverified

All of the following are **UNVERIFIED**:

- [UNVERIFIED] Official public developer API exists
- [UNVERIFIED] Programmatic booking-code resolution (API endpoint for decoding a code without a browser session)
- [UNVERIFIED] Programmatic booking-code creation (API endpoint for generating a code from selections without a browser session)
- [UNVERIFIED] Event/market API access (whether fixture, market, and odds data is available via a documented API)
- [UNVERIFIED] Selection format (how SportyBet represents selections internally and in booking codes)
- [UNVERIFIED] Rate limits (whether API access is rate-limited and what those limits are)
- [UNVERIFIED] Terms of service (whether programmatic access is permitted under SportyBet's terms)
- [UNVERIFIED] Authentication method (what credentials or tokens are required, if any)

### Restrictions

- We will NOT bypass Cloudflare, bot protection, authentication, rate limits, or any other security controls.
- We will NOT scrape private or authenticated endpoints.
- We will NOT reverse-engineer SportyBet's proprietary systems.
- We will NOT automate actions prohibited by SportyBet's terms of service.
- Any integration must use only officially supported and documented access methods.

---

## Stake

### What we know

- **Official Sports Data API exists**: Stake has a documented Sports Data API at `https://docs-odds-data.stake.com/` that provides access to sports, fixtures, and odds data.
- **Sports/fixture/odds data is available through documented API endpoints**: The API exposes endpoints for retrieving sports, categories, tournaments, fixtures, and fixture/odds data.
- **API authentication uses an API key**: Access to the Stake Sports Data API requires an API key passed via the `x-api-key` HTTP header.
- **Sportsbook has a "Use Bet Code" flow**: Stake's sportsbook UI includes a feature for users to load a bet code into their betslip.

### VERIFIED capabilities (implemented via official Sports Data API)

The following have been verified against the documented Sports Data API and implemented in the Stake adapter:

- [VERIFIED] Sports discovery — retrieve list of available sports
- [VERIFIED] Category discovery — retrieve sport categories (leagues/regions within a sport)
- [VERIFIED] Tournament discovery — retrieve tournaments within a category
- [VERIFIED] Fixture discovery — retrieve fixtures for a tournament
- [VERIFIED] Fixture/odds retrieval — retrieve markets and odds for a specific fixture

### UNVERIFIED capabilities (not yet implemented)

The following remain **UNVERIFIED** and are not implemented:

- [UNVERIFIED] Booking-code resolution (whether a bet code can be decoded via the API without a browser session)
- [UNVERIFIED] Booking-code-to-selection retrieval (whether selections can be extracted from a bet code programmatically)
- [UNVERIFIED] Booking-code creation (whether a bet code can be generated from selections via the API)
- [UNVERIFIED] Recreation of a target betslip (whether the full betslip can be reconstructed on the target bookmaker)
- [UNVERIFIED] Whether the Sports Data API covers the exact same events/markets available in the bet code flow
- [UNVERIFIED] Rate limits (what limits apply to the Sports Data API)
- [UNVERIFIED] Terms of service (whether using the Sports Data API for booking-code conversion is permitted under Stake's terms)

### Implementation details

The Stake adapter implements `findEvents()` and `findMarkets()` using the official Sports Data API:

- **findEvents**: Calls the sports endpoint to retrieve fixtures and maps them to canonical `Event` objects. Stake fixture IDs are preserved under `sourceId` rather than leaking into canonical business fields.
- **findMarkets**: Calls the fixture/odds endpoint for each event to retrieve markets and odds. Markets are mapped to canonical `Market` objects. Unfamiliar markets are preserved as `type: "other"` with their raw name in `rawMarketName` rather than guessing a wrong canonical type.

### Restrictions

- We will NOT bypass Cloudflare, bot protection, authentication, rate limits, or any other security controls.
- We will NOT scrape private or authenticated endpoints.
- We will NOT reverse-engineer Stake's proprietary systems.
- We will NOT automate actions prohibited by Stake's terms of service.
- Any integration must use only officially supported and documented access methods.

---

## General Notes

- The existence of a UI feature (e.g., "Use Booking Code") does not imply the existence of a programmatic API for the same operation.
- We will not assume any bookmaker supports automated booking-code creation until we have verified it through official documentation.
- All capability statuses in the codebase default to `unverified` until manually updated after verification.
- The Stake Sports Data API integration is for event/market discovery only. It is NOT a booking-code conversion implementation.
