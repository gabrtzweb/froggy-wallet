# Froggy Wallet

Personal finance dashboard with Open Finance integration using Pluggy API.

## Setup

1. Install dependencies:

    `npm install`

1. Create your local environment file...

    `.env.local`

1. In .env.local, place your real Pluggy credentials:

    ```bash
    PLUGGY_CLIENT_ID=your_real_client_id
    PLUGGY_CLIENT_SECRET=your_real_client_secret
    PLUGGY_DASHBOARD_ITEM_IDS=your_item_id_1,your_item_id_2
    ```

Important:

- Keep credentials server-side only.
- Never expose PLUGGY_CLIENT_ID or PLUGGY_CLIENT_SECRET in browser/client code.
- Do not commit .env.local to git.

## Run

`npm run dev`

Open <http://localhost:3000>

## API Endpoints

GET /api/accounts?itemId=YOUR_ITEM_ID

Returns the list of accounts for a specific Pluggy item.

GET /api/transactions?accountId=YOUR_ACCOUNT_ID

Returns the list of transactions for a specific account.

These endpoints are designed for the personal-project flow where item IDs are created once in Pluggy Dashboard and stored in .env.local.

Reminder: keep real credentials only in process.env (.env.local for local dev):

- PLUGGY_CLIENT_ID
- PLUGGY_CLIENT_SECRET

## Client Data Fetching Standard

Use SWR for all client-side API data in current and future pages (overview, settings, flow, planning, assets, and new routes).

Rules:

- Use `useCachedApi` from `app/lib/use-cached-api.ts` for API requests.
- Use stable endpoint keys (example: `/api/overview?locale=...`).
- Show loading UI only when `isInitialLoading` is true.
- Keep showing cached data while SWR revalidates in the background.
- Surface `errorMessage` but avoid clearing existing UI when cached data exists.

Global defaults are configured once in `app/providers.tsx` through `SWRConfig`.
