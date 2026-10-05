# deli.africa

A production-oriented Next.js webshop MVP inspired by the deli.africa visual identity: bold editorial typography, South African pantry categories, product discovery, cart, checkout and a general system dashboard.

Current state, traps and next steps: [HANDOVER.md](HANDOVER.md). Agents also read [AGENTS.md](AGENTS.md).

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

`.env.example` lists every variable the code reads, with what each is for.

After adding or changing production environment variables, trigger a new production deployment so the runtime receives the updated values.

## Local

Requires Node 24.x and pnpm 11.19.0 (`engines` and `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev
```

Release verification for the preserved deli storefront:

```bash
pnpm test
pnpm test:i18n
pnpm test:a11y
pnpm check
pnpm build
```

## Production

The repository is linked to Vercel and `main` is the production branch. A push to `main` triggers production deployment.

## customer.direct platform planning

This section is the planning record. The platform itself is built in the separate repository [moldovancsaba/customer-direct](https://github.com/moldovancsaba/customer-direct); this repository keeps the deli storefront.

The multi-shop platform backlog is managed on the [customer.direct project board](https://github.com/users/moldovancsaba/projects/62). See the [implementation plan](CUSTOMER_DIRECT_IMPLEMENTATION_PLAN.md) and [engineering execution ledger](docs/customer-direct/README.md). All planned frontend work uses GDS exclusively, with accessibility, localization and multicurrency support from the foundation.

Foundation verification: `pnpm check`; isolated database verification: `pnpm test:integration`. See [baseline handover](docs/customer-direct/01.md), [check workflow](docs/customer-direct/02.md), and [money contract](docs/customer-direct/16.md).

## customer.direct managed mode

The public deli storefront can keep its current UX/UI while reading managed catalogue, stock, settings and checkout data from customer.direct. Managed mode is off by default. It turns on when `CUSTOMER_DIRECT_MANAGED` is `1`, `true`, `yes` or `on`, and also whenever both `CUSTOMER_DIRECT_STOREFRONT_ORIGIN` and `CUSTOMER_DIRECT_STOREFRONT_HOST` are set, even if `CUSTOMER_DIRECT_MANAGED=0`. Configure these Vercel variables only after the deli shop exists, is imported, has a verified canonical host and passes the customer.direct release gate:

- `CUSTOMER_DIRECT_MANAGED=1`
- `CUSTOMER_DIRECT_STOREFRONT_ORIGIN=https://customerdirect.vercel.app`
- `CUSTOMER_DIRECT_STOREFRONT_HOST=<the public deli host routed in customer.direct>`
- `CUSTOMER_DIRECT_REQUIRED=1` after cutover, when local fallback should no longer be used.

Optional: `CUSTOMER_DIRECT_SHOP_PATH` (default `deli_africa`), `CUSTOMER_DIRECT_LOCALE` (default `hu`), `CUSTOMER_DIRECT_CURRENCY` (default `HUF`).

When managed mode is on, the deli admin is managed in Customer Direct: `/dashboard` redirects to `<origin>/?shop=<shop path>`, the admin APIs (`/api/admin/*` and the product and site settings updates) answer HTTP 410 with the management URL, orders are submitted to Customer Direct as a quote and an order, and managed images are served through `/api/customer-direct/media/[id]`. See Customer Direct's [handover](https://github.com/moldovancsaba/customer-direct/blob/main/handover.md) and [deli managed bridge](https://github.com/moldovancsaba/customer-direct/blob/main/docs/customer-direct/37-deli-managed-bridge.md). GitHub issues about this work may live in that repository.

The adapter preserves existing deli routes, styling, product imagery and copy, and stores customer.direct product IDs invisibly for quote/order submission.

Preserved-storefront accessibility and i18n evidence is recorded in [issue #39 handover](docs/customer-direct/39-preserved-storefront-a11y.md).
