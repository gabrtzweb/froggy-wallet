# Froggy Wallet

Personal finance dashboard with Open Finance integration using Pluggy API.

## Setup

1. Install dependencies:

 npm install

1. Create your local environment file from the template:

 copy .env.example .env.local

1. In .env.local, replace the placeholders with your real Pluggy credentials:

 PLUGGY_CLIENT_ID=your_real_client_id
 PLUGGY_CLIENT_SECRET=your_real_client_secret
 PLUGGY_DASHBOARD_ITEM_IDS=your_item_id_1,your_item_id_2

Important:

- Keep credentials server-side only.
- Never expose PLUGGY_CLIENT_ID or PLUGGY_CLIENT_SECRET in browser/client code.
- Do not commit .env.local to git.

## Run

npm run dev

Open <http://localhost:3000>

## API Endpoint

POST /api/connect-token

Request body example:

{
  "clientUserId": "user-123"
}

Response example:

{
  "accessToken": "..."
}

This endpoint creates a Pluggy Connect Token on the server so your frontend can open Pluggy Connect securely.
