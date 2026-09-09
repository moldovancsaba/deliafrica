# deli.africa

A production-oriented Next.js webshop MVP inspired by the deli.africa visual identity: bold editorial typography, South African pantry categories, product discovery, cart, checkout and a general system dashboard.

## Stack

- Next.js (frontend + backend)
- Socket.io / Socket.io Client (realtime-ready transport)
- MongoDB + Mongoose (order persistence with `MONGODB_URI` or Vercel's integration-prefixed `deli_MONGODB_URI`)
- Vercel (production hosting)
- GitHub (version control)

## Features

- Responsive storefront with category filtering
- Product detail modal
- Client-side cart with quantity management
- Checkout and server-validated order API
- MongoDB persistence with graceful demo fallback when no DB is configured
- General Dashboard: MongoDB state, user surface state, runtime, latency and service health
- `/api/health`, `/api/orders`, `/api/socket-io`
- DoneIsBetter OAuth/OIDC buyer identity with PKCE
- SSO permission-aware admin protection for `/dashboard`

## Environment

Copy `.env.example` to `.env.local` and configure `MONGODB_URI` (the app also accepts Vercel's `deli_MONGODB_URI`), `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, and `APP_URL`. The client secret must remain server-only and must never be committed. Register both production callbacks with the SSO client:

- `https://deli.doneisbetter.com/auth/callback`
- `https://deli.doneisbetter.com/api/oauth/callback`

After adding or changing production environment variables, trigger a new production deployment so the runtime receives the updated values.

## Local

```bash
npm install
npm run dev
```

## Production

The repository is linked to Vercel and `main` is the production branch. A push to `main` triggers production deployment.

## customer.direct platform planning

The multi-shop platform backlog is managed on the [customer.direct project board](https://github.com/users/moldovancsaba/projects/62). See the [implementation plan](CUSTOMER_DIRECT_IMPLEMENTATION_PLAN.md) and [engineering execution ledger](docs/customer-direct/README.md). All planned frontend work uses GDS exclusively, with accessibility, localization and multicurrency support from the foundation.
