# Froggy Wallet

Personal finance dashboard with Open Finance integration using Pluggy API.

## Current Features

- Home page with a marketing-style dashboard preview and navigation into the app.
- Overview page with bank accounts, credit cards, investments, and balance evolution.
- Settings page with profile editing, connection summaries, and quick access to connection API data.
- User information page that reads Pluggy data for profile details, including full name, document ID, birth date, e-mail, phone, and address when available.
- Connections endpoint for inspecting configured items, accounts, investments, and identity payload.

## Setup

1. Install dependencies:

    `npm install`

1. Start the app:

    `npm run dev`

1. Open Settings and add your Pluggy credentials through the BYOK modal:

    - Client ID
    - Client Secret
    - Item IDs

Important:

- Credentials are stored locally in your browser for this prototype flow.
- Import/Export in Data Actions uses this same local JSON payload.
- Treat exported credential files as sensitive.

## Run

`npm run dev`

Open <http://localhost:3000>

## API Endpoints

GET /api?endpoint=accounts&itemId=YOUR_ITEM_ID

Returns the list of accounts for a specific Pluggy item.

GET /api?endpoint=transactions&accountId=YOUR_ACCOUNT_ID

Returns the list of transactions for a specific account.

GET /api?endpoint=connections

Returns configured connection snapshots (item, accounts, investments, and identity).

These endpoints are designed for the personal-project flow where item IDs are created once in Pluggy Dashboard and stored in .env.local.
These endpoints use the BYOK credentials and item IDs saved through Settings.

## Security Notes

- The API routes under /api are public HTTP endpoints. Do not expose this app to untrusted users without adding authentication or another access control layer.
- The user information and connections endpoints can return personal data from the connected item, so treat their responses as sensitive.
- Do not move Pluggy credentials to any NEXT_PUBLIC_ variable.
- If you add more sensitive runtime files later, extend .gitignore instead of committing them.

Any deployment exposed to the internet should add authentication or an equivalent access-control layer for routes that return Pluggy data.

## Client Data Fetching Standard

Use SWR for all client-side API data in current and future pages (overview, settings, flow, planning, assets, and new routes).

Rules:

- Use `useCachedApi` from `app/lib/use-cached-api.ts` for API requests.
- Use stable endpoint keys (example: `/api?endpoint=overview&locale=...`).
- Show loading UI only when `isInitialLoading` is true.
- Keep showing cached data while SWR revalidates in the background.
- Surface `errorMessage` but avoid clearing existing UI when cached data exists.

Global defaults are configured once in `app/providers.tsx` through `SWRConfig`.

## Roadmap

- Flow page: add transaction analytics, recent activity, and cash flow summaries.
- Assets page: add holdings, categories, and asset breakdowns.
- Planning page: add goals, budgets, and forward-looking financial planning.
- Multiple accounts: add suport for more than one user.
