# GDS Coral bloom migration — 0.14.0

All public, account, legal, and admin routes use the canonical GDS 6.7.0 components. The root provider selects the package-owned `coral` preset (Coral bloom), light scheme, and Inter font lane. Theme state persists across navigation through the GDS runtime. There are no application-owned CSS files, inline style declarations, color palettes, fonts, or radius/spacing constants in the rendered UI.

The dashboard uses GDS AppShell; the storefront uses GDS layouts, responsive SimpleGrid, product cards, media fallbacks, buttons, labelled fields, and quantity steppers. Cart drawers and dialogs have the GDS overlay manager, keyboard dismissal, focus management, and accessible labels. Consent retains the existing analytics opt-in behavior. Product deletion and administrator changes use confirmation dialogs. Checkout reports network/timeout failures without discarding the basket or retrying an order automatically.

## Installation and delivery

GDS is installed from GitHub Packages, never vendored. `scripts/install-dependencies.mjs` creates a temporary restricted-permission user configuration, reads `GITHUB_TOKEN` from the environment, and deletes the temporary configuration afterward. Local use: `node --env-file=.env.local scripts/install-dependencies.mjs`. Vercel uses the same installer. GitHub Actions uses the encrypted `GDS_PACKAGES_TOKEN` secret. No credential is embedded in source or build output.

GDS's Mantine peer dependencies are pinned to supported 8.3.0: the automatically selected 9.6.0 requires a React API that Next.js 15's bundled runtime does not expose. Consumers import UI exclusively from GDS, never directly from Mantine. The `app/components/gds.js` file is a transparent client export boundary for server-rendered routes, with no local components or token definitions; the package umbrella otherwise evaluates a client theme function in the server context.

## Validation

CI runs the GDS ESLint configuration, manifest validation, standard GDS compliance checks, existing unit/baseline/build checks, synthetic browser/accessibility checks, and isolated MongoDB integration tests. Browser tests use a synthetic identity signed only with a disposable local test secret and explicitly empty production database environment variables. They never authenticate to or mutate a live shop.

Browser coverage includes all nine admin sections, category/product/legal/profile/error pages, desktop/mobile overflow checks, Coral preset continuity, consent dismissal, cart keyboard dismissal, and checkout failure preservation. Axe checks target WCAG A/AA and WCAG 2.1 AA; these are automated checks, not a claim of complete assistive-technology certification.

## Upstream verification limitation

GDS 6.7.0's optional strict scanner uses case-insensitive raw-tag matching (`Button`, `Select`, `Textarea`, and `Table` are therefore classified as raw HTML despite being upstream GDS exports). It also treats transparent client-boundary imports as locally implemented primitives. Strict mode is not enabled; the standard compliance and GDS design-value lint gates are enabled. This is an explicit scanner limitation, not an exception permitting local design values. Retest strict mode after the upstream scanner distinguishes JSX identifiers/import provenance. The application does not patch or duplicate the upstream checker.

## Recovery and remaining platform work

This release changes presentation and build authentication, without a database migration. Roll back to the preceding verified Vercel deployment if a regression is found; reverting the release commit restores the previous presentation. Existing payment, invoice, and delivery capabilities keep their previous operational readiness. Customer.direct multi-shop isolation and rollout remain separate, unfinished delivery work. Image content remains shop-owned; theme styling is exclusively GDS-owned.

The responsive grid uses GDS-exported SimpleGrid because GDS 6.7.0 layout primitives emit inline single-column styles that override their responsive rules. MediaWithFallback disables its optional shimmer because server-rendered cached images can finish loading before hydration attaches the load handler. Image fallback behavior remains package-owned. Neither workaround introduces local CSS or component implementations.
