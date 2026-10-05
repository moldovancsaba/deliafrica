# AGENTS.md: deli.africa

> `AGENTS.md` is the canonical agent-instructions file. `CLAUDE.md` is an identical copy for Claude Code: edit `AGENTS.md`, then run `cp AGENTS.md CLAUDE.md`.

## What this repo is

The deli.africa webshop: a Next.js 15 (App Router, plain JavaScript) storefront with an SSO-protected admin dashboard, MongoDB/Mongoose persistence and DoneIsBetter SSO login. The local folder is `deli.africa`; the GitHub repository is `moldovancsaba/deliafrica`. Production host: `deli.doneisbetter.com` on Vercel.

Since commit `e8e908d` the storefront can run in managed mode (`CUSTOMER_DIRECT_MANAGED`), where catalogue, orders and admin come from Customer Direct, a separate repository (`moldovancsaba/customer-direct`). This repository is not the Customer Direct platform.

Read `HANDOVER.md` first (current state, traps), then `README.md`. The documentation map is `docs/INDEX.md`.

## Commands

Node 24.x and pnpm 11.19.0 (`package.json` `engines` and `packageManager`). CI installs with a frozen lockfile.

```
pnpm install --frozen-lockfile
pnpm dev                 # next dev
pnpm test                # node --test tests/*.test.mjs (no database needed)
pnpm test:i18n           # preserved-copy checks
pnpm test:a11y           # Playwright + axe on port 3122
pnpm check               # the gate: unit tests, baseline check, next build
pnpm test:integration    # needs CUSTOMER_DIRECT_TEST_DB and CUSTOMER_DIRECT_TEST_MONGODB_URI (isolated replica on port 27119)
pnpm build               # next build
```

There is no lint script and no docs link checker. A change is ready when `pnpm check` passes; CI also runs `pnpm test:integration`.

## Branch and push model

- `main` is production: a push to `main` deploys to Vercel production (README).
- `main` is protected on GitHub: required status check `checks` (workflow "Delivery checks"), branch must be up to date, force pushes disabled.
- Work is committed directly on `main` (the history has no pull-request flow); run `pnpm check`, the gate, before pushing.
- Commit messages describe the change only.

## Commit identity and attribution

- Commit as `moldovancsaba <moldovancsaba@gmail.com>`. Run `git config user.email` first; if it differs, set it locally with `git config user.email moldovancsaba@gmail.com && git config user.name moldovancsaba`.
- No AI attribution anywhere: no `Co-Authored-By`, no "generated with/by", no model or provider names in commit messages, files, comments or docs.

## One repository, one board

This repository has exactly one GitHub project board: https://github.com/users/moldovancsaba/projects/70. Track work as issues and items on that board; never create a second board. Standard Status columns, in order: IDEABANK (SOMEDAY), Roadmap (LATER), Backlog (SOONER), Todo (NEXT), In Progress (NOW), Review (ALMOST), Done, Declined (NEVER).

Issues about the Customer Direct work may live in `moldovancsaba/customer-direct` (its board is project 62), not here.

## Do not

- Never commit secrets. `.env.example` holds names with empty or fake values only; real values stay in ignored `.env*.local` files and Vercel settings. Do not paste secret values into docs or issue comments.
- Do not change public URLs or DNS. `deli.doneisbetter.com` is the active managed host; `deli.africa` stays outside the cutover until the owner explicitly authorizes a change (`docs/customer-direct/39-preserved-storefront-a11y.md`).
- Do not replace the preserved deli storefront UX/UI with a GDS redesign here; that was reverted in `c5938a1` (`docs/customer-direct/39-preserved-storefront-a11y.md`).
- Do not point tests at a live database. Integration tests accept only a `customer_direct_test_*` database and never fall back to the application database (`docs/customer-direct/02.md`).
- Do not move or delete routes, models or `docs/customer-direct/baseline/inventory.json`; `pnpm check` reads the inventory and fails on missing legacy routes or models.
- Do not create `CHANGELOG.md`. `RELEASE_NOTES.md` (newest first) and `RELEASE_NOTES_<version>.md` are the changelog.
- The version lives in two places, `package.json` and `lib/version.js` (`APP_VERSION`, reported by `/api/health`); keep them equal.
- After changing production environment variables, trigger a new production deployment (README).

## Managed mode in one paragraph

`lib/customer-direct-store.js` decides it: managed mode is on when `CUSTOMER_DIRECT_MANAGED` is truthy OR when both `CUSTOMER_DIRECT_STOREFRONT_ORIGIN` and `CUSTOMER_DIRECT_STOREFRONT_HOST` are set, even with `CUSTOMER_DIRECT_MANAGED=0`. When on, `/dashboard` redirects to Customer Direct and the admin APIs answer 410 through `lib/managed-admin.js`. Details live in the README and in Customer Direct's `handover.md`; do not copy them here.

## Where the docs are

- `HANDOVER.md`: state, run/test/deploy, traps, first hour.
- `README.md`: stack, features, environment, managed mode.
- `docs/INDEX.md`: every document under `docs/`.
- `.env.example`: every environment variable the code reads.
- `RELEASE_NOTES*.md`: changelog.
