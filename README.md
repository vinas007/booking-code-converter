# Booking Code Converter

A multi-bookmaker sports booking-code conversion application. Users enter a booking code from one bookmaker and receive an equivalent booking code for another bookmaker.

## Current Status

**Bookmaker integrations and actual conversion logic are NOT implemented yet.** This repository contains the project foundation only — types, interfaces, directory structure, a health-check endpoint, a conversion endpoint placeholder, and a basic frontend form.

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
│   │   ├── adapters/         # Bookmaker adapter registry (placeholder)
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
│   │   ├── adapter.ts        # BookmakerAdapter interface
│   │   ├── conversion.ts     # Conversion service/registry interfaces
│   │   └── index.ts          # Barrel export
│   └── tsconfig.json
├── tests/                     # Test directory (placeholder for future tests)
├── .env.example               # Environment variable template (no real secrets)
├── tsconfig.base.json         # Shared TypeScript compiler options
└── package.json               # Root workspace config
```

## Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite 5, TypeScript        |
| Backend     | Express 4, Node.js, TypeScript      |
| Shared      | TypeScript (compiled library)       |
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
| `npm test`         | Runs tests in all workspaces (none yet)        |

## Current Limitations

1. No bookmaker integrations — adapters are interface-only
2. No conversion logic — the POST endpoint returns 501
3. No matching engine — event/market matching is not built
4. No normalization layer — only the interface exists
5. No authentication or user accounts
6. No database or persistent storage
7. No tests written yet
8. The frontend Convert button shows a placeholder message only

## Planned Development Stages

1. **Foundation** (this stage) — types, interfaces, structure, health check, UI shell
2. **Normalization layer** — normalize bookmaker-specific data into a common model
3. **Adapter implementations** — build per-bookmaker adapters (decode/encode codes)
4. **Matching engine** — match events and markets across bookmakers
5. **Conversion pipeline** — wire adapters + matching + normalization into the POST endpoint
6. **Frontend integration** — connect the UI to the real conversion API
7. **Testing** — unit and integration tests for adapters, matching, and conversion
8. **Hardening** — rate limiting, error handling, logging, security review
