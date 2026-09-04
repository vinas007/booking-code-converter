# Booking Code Converter

A multi-bookmaker sports booking-code conversion application. Users enter a booking code from one bookmaker and receive an equivalent booking code for another bookmaker.

## Current Status

**Bookmaker integrations and actual conversion logic are NOT implemented yet.** This repository contains the project foundation and a technical integration spike — types, interfaces, directory structure, a health-check endpoint, a conversion endpoint placeholder, and a basic frontend form.

## Project Structure

```text
.
├── frontend/                  # React + Vite + TypeScript (UI)
│   ├── src/
│   │   ├── App.tsx           # Main converter form
│   │   ├── main.tsx          # React entry point
│   │   └── styles.css        # Minimal styling
│   ├── index.html
│   ├── vite.config.ts        # Dev server + API proxy
│   └── tsconfig.json
├── backend/                   # Express + TypeScript (API)
│   ├── src/
│   │   ├── adapters/         # Bookmaker adapter registry + per-bookmaker adapters
│   │   │   ├── sportybet/    # SportyBet adapter (structural placeholder)
│   │   │   └── stake/        # Stake adapter (structural placeholder)
│   │   ├── conversion/       # Conversion service interface (placeholder)
│   │   ├── matching/         # Event matching service interface (placeholder)
│   │   ├── normalization/    # Data normalization interface (placeholder)
│   │   ├── routes/           # Express route handlers
│   │   │   ├── health.ts     # GET /api/health
│   │   │   └── conversions.ts# POST /api/conversions (not implemented)
│   │   ├── config/           # App configuration
│   │   └── index.ts          # Server entry point
│   └── tsconfig.json
├── shared/                    # Shared TypeScript types & interfaces
│   ├── src/
│   │   ├── bookmaker.ts      # BookmakerId enum + labels
│   │   ├── betting-model.ts  # Sport, League, Event, Team, Market, Selection, etc.
│   │   ├── adapter.ts        # BookmakerAdapter interface + UnsupportedOperationError
│   │   ├── capabilities.ts   # BookingCodeCapabilities + capability helpers
│   │   ├── integration-status.ts # IntegrationStatus type + labels + helpers
│   │   ├── conversion.ts     # Conversion service/registry interfaces
│   │   └── index.ts          # Barrel export
│   └── tsconfig.json
├── docs/                      # Documentation
│   ├── bookmaker-integration-research.md  # SportyBet & Stake research
│   └── integration-research-checklist.md  # Per-bookmaker verification checklist
├── tests/                     # Test suite (Vitest)
│   ├── integration-status.test.ts
│   ├── capabilities.test.ts
│   ├── adapter-contract.test.ts
│   └── adapters.test.ts
├── .env.example               # Environment variable template (no real secrets)
├── tsconfig.base.json         # Shared TypeScript compiler options
├── vitest.config.ts           # Test configuration
└── package.json               # Root workspace config
```

## Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite 5, TypeScript        |
| Backend     | Express 4, Node.js, TypeScript      |
| Shared      | TypeScript (compiled library)       |
| Testing     | Vitest 5                            |
| Build       | npm workspaces, tsc                 |
| Dev Server  | Vite (frontend), tsx (backend)      |

## Supported Bookmakers (planned)

- Bet9ja
- BetKing
- SportyBet
- Betano
- Stake
- BetBonanza
- BetPawa
- Football.com

These exist as typed identifiers only. No integrations are active.

## API Endpoints

| Method | Path              | Status           | Description                                    |
|--------|-------------------|------------------|------------------------------------------------|
| GET    | `/api/health`     | Working          | Returns API status, timestamp, and bookmaker list |
| POST   | `/api/conversions`| Not implemented  | Returns 501 with "conversion not implemented" message |

## npm Scripts

| Script             | Description                                    |
|--------------------|------------------------------------------------|
| `npm run dev`      | Starts both backend and frontend concurrently  |
| `npm run dev:backend`  | Starts backend only (tsx watch)            |
| `npm run dev:frontend` | Starts frontend only (Vite)               |
| `npm run build`    | Builds shared, backend, and frontend           |
| `npm run typecheck`| Type-checks all workspaces                      |
| `npm test`         | Runs the test suite (Vitest)                    |
| `npm run test:watch`| Runs tests in watch mode                       |

## Integration Research Approach

### Why we research before implementing

Bookmaker APIs vary widely in availability, documentation quality, and terms of service. Some bookmakers provide official developer APIs; others only offer browser-based features with no programmatic equivalent. We investigate each bookmaker's capabilities before writing any integration code to ensure we only build on verified, officially supported access methods.

See `docs/bookmaker-integration-research.md` for the current research status of SportyBet and Stake, and `docs/integration-research-checklist.md` for the per-bookmaker verification checklist.

### Why bookmaker adapters are capability-based

Not every bookmaker supports every operation. A bookmaker might allow loading a booking code and retrieving selections, but not provide an officially supported way to create a booking code programmatically. The `BookmakerAdapter` interface uses a `BookingCodeCapabilities` structure so each adapter can declare which operations it supports and at what level (`verified`, `partially_supported`, `unsupported`, `unverified`, or `researching`). This prevents the system from attempting operations a bookmaker cannot handle.

### Why we do not assume automated booking-code creation

Creating a booking code programmatically requires a bookmaker to expose an API for encoding selections into a shareable code. Many bookmakers only support this through their browser UI. We do not assume this capability exists until we have verified it through official documentation or legitimate API testing. Adapters that cannot create booking codes will report `canCreateBookingCode: "unsupported"` or `"unverified"`.

### Why the betting model stays bookmaker-independent

The shared betting model (`Sport`, `League`, `Event`, `Team`, `Market`, `Selection`, etc.) uses generic, bookmaker-neutral terminology. This allows the conversion pipeline to work with a single canonical representation regardless of which bookmaker provided the data. Each adapter is responsible for translating between its bookmaker-specific format and the canonical model, keeping the core system clean and extensible.

## Current Limitations

1. No bookmaker integrations — adapters are structural placeholders with all capabilities unverified
2. No conversion logic — the POST endpoint returns 501
3. No matching engine — event/market matching is not built
4. No normalization layer — only the interface exists
5. No authentication or user accounts
6. No database or persistent storage
7. The frontend Convert button shows a placeholder message only
8. SportyBet and Stake integration research is incomplete — all items are UNVERIFIED

## Planned Development Stages

1. **Foundation** — types, interfaces, structure, health check, UI shell
2. **Integration spike** — capability types, adapter structure, research docs (this stage)
3. **Normalization layer** — normalize bookmaker-specific data into a common model
4. **Adapter implementations** — build per-bookmaker adapters after research verification
5. **Matching engine** — match events and markets across bookmakers
6. **Conversion pipeline** — wire adapters + matching + normalization into the POST endpoint
7. **Frontend integration** — connect the UI to the real conversion API
8. **Testing** — unit and integration tests for adapters, matching, and conversion
9. **Hardening** — rate limiting, error handling, logging, security review
