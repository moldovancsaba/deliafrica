# deli.africa

A production-oriented Next.js webshop MVP inspired by the deli.africa visual identity: bold editorial typography, South African pantry categories, product discovery, cart, checkout and a general system dashboard.

## Stack

- Next.js (frontend + backend)
- Socket.io / Socket.io Client (realtime-ready transport)
- MongoDB + Mongoose (order persistence when `MONGODB_URI` is configured)
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

## Environment

Set `MONGODB_URI` in Vercel to enable persistent orders.

## Local

```bash
npm install
npm run dev
```

## Production

The repository is linked to Vercel and `main` is the production branch. A push to `main` triggers production deployment.
