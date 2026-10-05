# HANDOVER: deli.africa

Date: 2026-10-05. Owner: moldovancsaba. Board: https://github.com/users/moldovancsaba/projects/70. Repo: https://github.com/moldovancsaba/deliafrica. Production: https://deli.doneisbetter.com (HTTP 200 on 2026-10-05).

## What this is

The public webshop for deli.africa, a South African pantry catalogue (13 products, of which 4 have a price in the local seed; Hungarian storefront copy; HUF). Buyers browse, fill a basket and check out; admins manage products, orders and content from `/dashboard` behind DoneIsBetter SSO. Since `e8e908d` the storefront can run in managed mode, where Customer Direct holds the catalogue, orders and admin and this app only renders the storefront. It is NOT the Customer Direct platform (that is the `moldovancsaba/customer-direct` repository), and it has no payment, parcel or invoicing integration yet.

## State today

- Version 0.13.0 (`package.json`, `lib/version.js`, top of `RELEASE_NOTES.md`). Next.js 15.5, React 19, Mongoose 8, Node 24.x, pnpm 11.19.0.
- Deploy: Vercel project, `vercel.json` only sets the Next.js framework. A push to `main` deploys to production (README). The latest GitHub Production deployment (2026-10-05 10:31 UTC) is `e8e908d`, which equals `origin/main`.
- CI: `.github/workflows/check.yml` runs `pnpm check`, then `pnpm test:integration` against a throwaway MongoDB replica. `main` is protected: required check `checks`, branch up to date, no force pushes; admins are not enforced and no PR review is required (GitHub API, 2026-10-05).
- Production runs in managed mode: `https://deli.doneisbetter.com/dashboard` answers 307 to `https://customerdirect.vercel.app/?shop=deli_africa` (checked 2026-10-05).
- Last meaningful change: `e8e908d` (2026-10-05) added the `CUSTOMER_DIRECT_MANAGED` switch, admin guard (`lib/managed-admin.js`), media proxy and host header. It has no release-notes entry and no version bump. Before it: `e3b4ee9` (2026-09-14) a11y/i18n evidence; `c44b389` (2026-09-09) v0.13.0 platform foundations.
- Works: `node --test tests/*.test.mjs` passed 23 of 23 on 2026-10-05. Not run for this handover: build, `pnpm test:a11y`, `pnpm test:integration` (need install, browsers, a replica set). Known broken: nothing verified.
- Not built: Packeta, Barion and Billingo checkout flows. Code only stores provider credentials and reports readiness. `roadmap.md` and `ADMIN_AUDIT.md` date from early September 2026 and lag the code (profile and admin order pages now exist). `lib/platform/*.mjs` are tested foundation modules, not wired into routes.

## Run, test, deploy

Required variable names live in `.env.example`; copy it to `.env.local`. Without `MONGODB_URI` the app still runs and does not persist orders.

```
pnpm install --frozen-lockfile
pnpm dev                 # next dev
pnpm test                # unit tests, no database
pnpm test:i18n
pnpm test:a11y           # Playwright on :3122, starts next dev with CUSTOMER_DIRECT_MANAGED=0
pnpm check               # gate: tests + scripts/baseline-check.mjs + next build
pnpm test:integration    # needs CUSTOMER_DIRECT_TEST_DB / CUSTOMER_DIRECT_TEST_MONGODB_URI
```

Deploy by pushing `main` (owner or reviewer pushes). After changing production environment variables, trigger a new production deployment so the runtime picks them up (README).

## In flight

- Board 70 is empty (0 items on 2026-10-05). The 39 open issues of this repository are not on it yet and need triage.
- Open: 39 issues, 0 PRs. All 39 carry the label `customer.direct`, were created on 2026-09-09 and are mostly `execution:blocked` or `execution:later`. Most relevant: [#37](https://github.com/moldovancsaba/deliafrica/issues/37) deli tenant conversion, [#29](https://github.com/moldovancsaba/deliafrica/issues/29) storefront surfaces, [#31](https://github.com/moldovancsaba/deliafrica/issues/31) domains (each `execution:partial`, updated 2026-09-12).
- Issues about the managed-mode work may live in `moldovancsaba/customer-direct` (8 open, #13 to #20, on its board 62). The platform side is documented in its [handover.md](https://github.com/moldovancsaba/customer-direct/blob/main/handover.md); do not copy it here.

## Traps and decisions

- Folder `deli.africa`, GitHub repo `deliafrica`, Vercel alias `deliafrica.vercel.app` (the GitHub homepage field; it answered 200 on 2026-10-05). Customer Direct's handover calls its own folder `customer-direct` while the local folder is `customer.direct`.
- Managed mode turns on if `CUSTOMER_DIRECT_MANAGED` is truthy OR both `CUSTOMER_DIRECT_STOREFRONT_ORIGIN` and `..._HOST` are set, even with `CUSTOMER_DIRECT_MANAGED=0` (`lib/customer-direct-store.js`, confirmed by running `customerDirectConfig`). With `MANAGED=1` but no origin and host, the admin is disabled while data stays local. Leave all three empty for standalone work.
- Only `deli.doneisbetter.com` is the managed host. `deli.africa` is outside the cutover until the owner authorizes a change (`docs/customer-direct/39-preserved-storefront-a11y.md`); it answered 302 to `/password` on 2026-10-05 and is not served by this app as far as verified.
- The original deli UX/UI is preserved on purpose; a GDS redesign was reverted in `c5938a1`.
- `docs/customer-direct/baseline/inventory.json` is read by `pnpm check`; removing a legacy route or model fails the gate.
- `RELEASE_NOTES.md` plus `RELEASE_NOTES_<version>.md` are the changelog; there is no `CHANGELOG.md` by design.
- Customer Direct's deli import script reads this folder's local `.env.production.local` (its handover.md, 2026-09-25); do not delete or rename that file without checking.
- Test databases must be named `customer_direct_test_*`; there is no fallback to the app database (`scripts/test-environment.mjs`).
- The README told people to run `npm`; the repo uses pnpm (fixed in this baseline).

## First hour for the next agent

1. Read `AGENTS.md`, this file, then the managed-mode section of `README.md` and Customer Direct's handover.
2. `git status`, `git log -5`, `git config user.email` (must be moldovancsaba@gmail.com).
3. `pnpm install --frozen-lockfile`, then `pnpm test` (expect 23 passing) and `pnpm check` before changing code.
4. Confirm your `.env.local` matches the mode you want (see the managed-mode trap above).
5. Smoke production: `curl -sI https://deli.doneisbetter.com/dashboard` should show 307 to Customer Direct.
6. Triage the 39 open issues onto board 70 (close or move the ones now owned by `customer-direct`).
7. If you ship a change: add a `RELEASE_NOTES.md` entry and keep `package.json` and `lib/version.js` in step.

## Where things live

- Docs map: [docs/INDEX.md](docs/INDEX.md). Agent rules: [AGENTS.md](AGENTS.md) (identical copy in `CLAUDE.md`).
- Root docs: [README.md](README.md), [RELEASE_NOTES.md](RELEASE_NOTES.md) and `RELEASE_NOTES_<version>.md`, [roadmap.md](roadmap.md), [ADMIN_AUDIT.md](ADMIN_AUDIT.md), [CUSTOMER_DIRECT_IMPLEMENTATION_PLAN.md](CUSTOMER_DIRECT_IMPLEMENTATION_PLAN.md) (historical), [IMAGE_CREDITS.md](IMAGE_CREDITS.md).
- `app/`: storefront pages, `app/api/*` endpoints, `app/dashboard/*` admin, `app/auth/*` and `app/profile`.
- `lib/`: `customer-direct-store.js`, `managed-admin.js`, `catalog-store.js`, `site-settings.js`, `auth.js`, `db.js`, `platform/` (foundations). `models/`: Mongoose models.
- `scripts/`: check, baseline, integration and test-replica tooling. `tests/`: unit, `integration/`, `browser/`.
