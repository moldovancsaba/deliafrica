# Preserved Storefront Accessibility Evidence

Related GitHub issue: moldovancsaba/deliafrica#39.

Date: 2026-09-14.

## Current Decision

The deli.africa customer-facing UX/UI remains in this repository. This delivery adds repeatable evidence around the preserved storefront instead of replacing it with a customer.direct GDS storefront.

No public URL or DNS change is included. `deli.doneisbetter.com` remains the active managed host, and `deli.africa` remains outside this cutover until the owner explicitly authorizes a URL change.

## What Changed

- Added `pnpm test:i18n` for preserved deli copy boundaries.
- Added `pnpm test:a11y` for the preserved storefront browser matrix.
- Added a local Playwright configuration that starts the deli storefront with customer.direct managed mode disabled.
- The accessibility report writes `test-results/deli-preserved-a11y-report.json`.
- The i18n report writes `test-results/deli-i18n-release-report.json`.
- Checkout API error copy now uses `role="alert"` so failed synthetic checkout validation is announced.
- Category action links and the cookie accept button keep the deli visual treatment while meeting automated contrast checks.

## Configuration Names

The local browser matrix uses:

- `CUSTOMER_DIRECT_MANAGED=0`

Production managed mode still uses:

- `CUSTOMER_DIRECT_MANAGED`
- `CUSTOMER_DIRECT_STOREFRONT_ORIGIN`
- `CUSTOMER_DIRECT_STOREFRONT_HOST`
- `CUSTOMER_DIRECT_REQUIRED`
- `CUSTOMER_DIRECT_LOCALE`
- `CUSTOMER_DIRECT_CURRENCY`

Do not put secret values in documentation or issue comments.

## How To Run

Run from `deli.africa`:

```sh
pnpm test:i18n
pnpm test:a11y
```

The broader local verification remains:

```sh
pnpm test
pnpm check
pnpm build
```

## How To Verify

Observed local results on 2026-09-14:

- `pnpm test:i18n`: 2 tests passed.
- `pnpm test:a11y`: 2 browser tests passed.
- `test-results/deli-preserved-a11y-report.json`: 8 evidence entries, all passed.
- `test-results/deli-i18n-release-report.json`: preserved Hungarian copy contract and RTL boundary passed.

Covered preserved-storefront flows:

- Cookie consent dialog and dismissal.
- Basket drawer after adding a product.
- Checkout modal labels and submit action.
- Synthetic checkout validation error announced as an alert.
- Mobile reflow at 390px wide.
- 200 percent root text reflow.

## Known Limitations

- These are automated Axe and Playwright checks, not a blanket accessibility certification.
- Manual screen-reader and device checks remain required before a larger public rollout.
- The test uses synthetic catalogue and checkout responses; it does not create production orders.
- Hosted payment, delivery or identity provider widgets remain outside the preserved storefront DOM and must be evaluated separately when live provider checkout is enabled.

## Rollback Plan

- Revert the test additions and the small semantic/contrast changes if they introduce a storefront regression.
- No data restore is required.
- No DNS rollback is required because this delivery does not change public URLs.
