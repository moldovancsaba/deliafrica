# customer.direct — multi-shop commerce implementation plan

Version: 1.1 · 9 September 2026 · Planning deliverable; implementation has not started.

Canonical engineering issue standard: https://github.com/sovereignsquad/general-design-system/issues/81. Latest user instruction takes precedence: ALL UI/UX/frontend uses GDS exclusively, including basic branding, storefront, administration and advanced customization. No separate visual system or unrestricted custom CSS is permitted.

## 1. Approved scope

Build customer.direct from the existing deli.africa commerce application as a shared platform for independently owned shops. Initial capacity target: 3–5 shops in 2026. Preserve the existing shop administration functionality and migrate deli.africa as the first shop.

- Superadmins create empty shops, record ownership, and assign/revoke shop administrators.
- Administrators have full functional access within assigned shops. Multiple assigned shops produce a shop selector; one assigned shop opens directly. Customers have no administrative privileges.
- Platform superadmin status does not automatically grant access to shop customers and orders. Business-data access requires an explicit, recorded shop access grant.
- Each shop has its own products, stock, orders, customer relationships, content, database, integrations, merchant information, domains, and appearance.
- Support an owner-supplied MongoDB database or a separately provisioned database on the platform's existing infrastructure. No shared business database by default.
- Shared DoneIsBetter customer identity across shops; separate merchant relationships and permissions.
- Basic branding, supported GDS themes, and shop-admin customization through approved GDS token/extension contracts, with preview and rollback.
- Internationalization, accessibility, and multiple currencies are first-release requirements. Shop administrators configure supported/default storefront languages and currencies.
- Launch the multi-shop platform first, with discount.direct contracts prepared. Shared benefits follow when its redemption capabilities are ready.
- Benefits are campaign-specific, funded by an identified issuer, and redeemable only at explicitly participating shops. A universal cash-like balance is out of scope.
- New shops are empty; copying/cloning shops is out of scope.

## 2. Architecture and deployment

Use one shared Next.js frontend/backend codebase deployed on Vercel, versioned in GitHub, with MongoDB/Mongoose for persistence. Preserve Socket.io dependencies, but do not make launch depend on persistent socket connectivity; any realtime implementation needs a separately verified Vercel-compatible transport design. Existing supported HTTP flows remain authoritative.

Proposed addresses, subject to domain ownership and DNS verification:
- customer.direct: platform public entry point.
- admin.customer.direct: central administration.
- <shop-slug>.shops.customer.direct: temporary shop address.
- Each shop's verified custom domain: independent public storefront.

Domain choice is configuration, not evidence that these domains are owned or connected. Reserve system subdomains and reject unknown hosts. Domain mappings are unique; verified ownership and certificate readiness are required before activation. Domain removal/suspension invalidates routing caches. Select one canonical domain per shop and redirect aliases; temporary public addresses redirect after custom-domain activation where appropriate. Draft previews require authorization and are not indexed.

One release updates the shared application. Use shop-level feature flags and staged activation for risky changes. Avoid per-shop repository forks or separate theme builds. Do not merge discount.direct's independent application or database into the commerce application.

## 3. Data boundaries

Central platform database:
- Organization: merchant ownership reference, display name, status; an organization can own multiple shops.
- Shop: stable immutable ID, slug, organization ID, lifecycle state, primary domain, configuration version, database reference.
- ShopDomain: normalized hostname, shop ID, verification/certificate state, canonical flag.
- PlatformIdentity: stable identity mapped by trusted issuer plus subject; do not merge accounts by email alone.
- PlatformRole: explicitly assigned superadmin role; an existing shop/SSO admin is not implicitly a superadmin.
- ShopMembership: identity ID, shop ID, admin role, active/revoked status, grant actor/time.
- ShopAccessGrant: explicit superadmin business-data scope, reason, expiry, actor, revocation state.
- ShopConnection: encrypted connection configuration, credential version, connection/migration readiness, last successful test.
- AuditEvent: actor, shop/context, action, result, timestamp, redacted change metadata.
- Integration contracts/configuration pointers needed to connect discount.direct without exposing merchant secrets.

Per-shop database:
- Product, category, inventory, order/payment/invoice/delivery records, customer relationship and shop preferences.
- Localized content, price lists, merchandising, shop settings, integration credentials, theme revisions, assets and operational outbox events.
- Use stable shop IDs in exported events, external references, assets, and callbacks even where physical database separation exists.

Resolve the platform registry first, then open the selected shop database. Bind Mongoose models to that connection; replace the current global default connection/model assumptions. Bound connection pools and idle lifetime. Key connection caches by shop and credential version. Validate database identity, connectivity and schema before activation. Reject accidentally assigning the same business database to unrelated shops. An unavailable database must fail closed for that shop; never use another shop's database or demo catalogue.

Database replacement is a controlled reconfiguration operation: test candidate connection, check schema/data compatibility, show impact, explicitly activate, invalidate old connections, record audit. It is not an automatic data migration. Platform registry and encryption recovery procedures require their own backups.

## 4. Authorization and administration

Superadmin navigation: Shops, Ownership, Administrator access, Domains, Platform health, Audit, and explicit shop-access grants. Initial superadmin bootstrap occurs through an operator-controlled procedure; shop administrators cannot grant it.

Shop navigation preserves the existing dashboard areas: overview, customers/users, products, orders, integrations, content, legal/company information, appearance and system health. Add Languages & currencies and domain/readiness surfaces as appropriate.

Use explicit shop context in central dashboard URLs, for example /shops/<shopId>/products. Each request rechecks active membership or valid access grant on the server. The selector is navigation, never authorization. Keep context per URL/tab; switching in one tab must not silently redirect a write in another. Warn about unsaved changes, clear shop-specific client caches, abort obsolete requests, and show the active shop name/domain prominently. Revoked memberships and expired grants immediately stop subsequent authorized requests.

Customers can access only their own shop orders and benefits. Shop admins can see only customer relationships and purchases within their shop; global identity does not expose other merchants' activity. Superadmins see redacted operational health by default. Privileged business-data access is explicitly entered with a reason, recorded, time-bounded, visible to the merchant in audit history, and revocable. Initial operating policy: named superadmins explicitly activate an audited grant with a reason for at most 60 minutes; expiry is checked per request. The merchant can inspect and revoke access.

## 5. Integrations and secret management

Each shop's Integrations page contains database configuration, payment, invoicing, delivery, Google Analytics, and a later discount.direct connection. Use provider-specific supported fields rather than arbitrary environment-variable editing.

- Write-only secret inputs; existing values are masked and never returned in plaintext.
- Encrypt secrets server-side with a dedicated platform-managed encryption key and key version; do not reuse SSO secrets as the long-term encryption root.
- Keep platform database, encryption, Vercel management, SSO platform and GitHub package credentials out of shop-admin control.
- Record changes and credential rotation without logging values. Public settings return an explicit allowlist only.
- Validate permitted connection schemes/destinations and bound connection tests; do not allow arbitrary server fetches through integration tests.
- Distinguish unconfigured, configured, connection-verified, operational, and failed states. A populated API key is not proof of a working checkout.
- Authenticate provider callbacks, resolve the owning shop from trusted mapping, and process retries idempotently.
- Preview uses separate databases and test merchant credentials. Production credentials are not copied into previews.

GITHUB_TOKEN remains a platform build-time secret for GDS package access, never NEXT_PUBLIC or a shop field. Verify the exact registry, package permissions, compatible pinned versions, and Vercel Preview/Production installation without printing tokens.

## 6. Appearance and media

Basic mode: reusable shop layout with token-based colours, logo variants, font selection, images, content and supported layout options.

GDS mode: registry of supported, pinned presets using documented GDS theme APIs. Verify the installed package exports before declaring the exact selector inventory. GDS's required supporting UI dependencies are included under the user's explicit GDS authorization. Preserve existing deli.africa appearance during migration; adoption must not silently redesign it.

Advanced GDS customization mode: shop-admin editing of allowed GDS tokens and supported extension contracts, draft preview, validation, version history, publish and rollback. The latest GDS-only instruction supersedes unrestricted custom CSS. Reject arbitrary styles, scripts, imports, unapproved external resources and changes that bypass GDS primitives. Apply branding only within supported storefront boundaries, never administration/authentication or hosted provider interfaces. Include contrast, keyboard focus, reduced motion and layout checks before publishing. Emergency reset restores the last good GDS revision. New semantic page structures require approved GDS compositions.

Assets: tenant-scoped upload/assignment, validated type and size, public/private separation, alt text per language, shop namespace and authorized deletion. Initial implementation uses tenant-scoped MongoDB GridFS within the approved stack, with bounded raster uploads and streaming; persist no uploaded media on ephemeral Vercel filesystem. Font licensing/source and supported writing systems must be checked. Product photos never leak between shops.

## 7. Internationalization from the foundation

Shop admin configures enabled storefront locales, default locale, and translated product/category/editorial/legal content. Customer-facing system strings use message dictionaries from the first component; no new hard-coded Hungarian-only labels. Admin UI uses the same translation architecture with a per-user language preference separate from shop defaults.

- Use BCP 47 locale identifiers and Intl formatting for numbers, money, dates and pluralization.
- Support right-to-left layout at the component/token level and verify with an RTL test locale before release.
- Store invariant IDs separately from translated names and readable localized slugs.
- Use locale-aware routes and canonical/hreflang/sitemap metadata, with a documented default-locale redirect strategy that preserves existing deli.africa URLs.
- Default locale fallback may cover optional editorial text; missing mandatory checkout/legal translations block activation of that locale.
- Store timestamps in UTC, configure the shop timezone, and apply it to scheduling and reporting.
- Locale selection must not change shop identity, reset baskets, or silently change order currency.
- The architecture supports adding translation packs; enabling a language requires complete reviewed system messages and required merchant content. Do not claim every language is translated automatically.

## 8. Multiple currencies from the foundation

Shop admin selects a base/accounting currency, enabled selling currencies, and a default selling currency from the intersection supported by the shop's configured payment/invoicing flow. Persist ISO currency codes and use each currency's minor-unit rules; do not assume every currency has two decimals.

First-release recommendation: explicit per-currency product price lists, with no external live exchange-rate service. This supports genuine checkout in several currencies without introducing unapproved exchange-rate infrastructure. A product/currency combination missing a valid price is not purchasable in that currency. Promotions, shipping, tax and invoice support must be validated for every enabled currency.

- One basket/order has one currency. Switching currency reprices all lines on the server and asks the customer to review the revised total.
- Store monetary amounts as exact integer minor units with bounds/rounding rules; server-side prices are authoritative.
- Snapshot currency, unit prices, discounts, tax, shipping, totals and relevant rules on order creation. Later settings changes do not rewrite historical orders.
- Refunds use original transaction currency and supported provider semantics.
- Show financial reporting by currency; never add unlike currencies into an unlabeled total.
- Changing base currency after sales requires an explicit accounting transition, not retrospective conversion.
- Launch policy should define tax-inclusive/exclusive pricing per merchant/market; multilingual and multicurrency capability is not a promise that every country/provider combination is supported.

## 9. Accessibility from the foundation

Engineering acceptance target: WCAG 2.2 AA, with automated checks supplemented by keyboard and screen-reader testing. This target is not a claim of certification.

Cover storefront, central admin, selectors, forms, modal/basket/checkout, previews, theme states and validation: semantic landmarks/headings, programmatic labels, meaningful alt text, visible focus, focus management and restoration, error summaries, status announcements, colour contrast, zoom/reflow, reduced motion and usable touch targets. Disabled/loading/empty/error/success states are part of each feature's acceptance criteria. Run phone/tablet/desktop and RTL checks. Assess third-party payment/delivery surfaces and record limitations rather than claiming control over their accessibility.

## 10. Shared identity and discount.direct

Reuse trusted DoneIsBetter issuer/subject identity. Each custom domain establishes its own secure session through SSO; unrelated domains cannot share one browser cookie. Use registered callbacks or a verified central broker with short-lived, single-use, audience-bound codes. Validate state, nonce, PKCE, return destination and domain ownership. Revocation remains server enforced.

discount.direct currently provides SSO, seller memberships/relationships and seller catalogue foundations; offers/redemption are not assumed operational. Define versioned contracts now:
- Shop maps to an explicit discount.direct seller ID; platform customer maps through trusted issuer/subject.
- Shop remains commerce source of truth for prices, stock and orders. Product/purchase synchronization has stable event IDs, versions, retries and reconciliation.
- Share only data required for an authorized relationship/benefit, with shop-specific preference/consent enforcement.
- Commerce records durable pending events alongside relevant changes; retry delivery through an outbox rather than assuming synchronous service availability.

Later benefits phase: campaign issuer, participating shops, eligible products/customers, currency-specific benefit values, limits, validity and funding agreement. Benefit lifecycle includes eligibility, quote, reservation, payment-linked redemption, expiry, cancellation release and refund adjustment. discount.direct is authoritative for atomic cross-shop reservations/redemptions; separate merchant databases cannot provide a shared transaction. Idempotency, reconciliation and compensating actions are required. Decide refund policy and merchant settlement for each campaign before activation. Fail benefit application clearly on service outage; ordinary undiscounted checkout may proceed only with the customer's explicit revised-total acceptance.

## 11. Empty shop onboarding and lifecycle

Draft -> configuration required -> ready for review -> live -> suspended -> archived.

Superadmin creates shop and ownership record, assigns administrators and temporary address. Shop admin connects/provisions its isolated database, chooses language/currency, configures branding/content/integrations, adds products, and completes readiness. No deli.africa products, merchant details or secrets are seeded into a new shop.

Launch gates: verified database and schema; required content and accessibility checks; valid default locale and currency; configured merchant/legal details; end-to-end validated enabled purchase flow; verified domain/certificate; no unresolved isolation failures. Catalogue-only operation can be a deliberate mode with checkout visibly disabled. The final launch transition is superadmin-controlled for the first release. Domain DNS changes outside platform-managed DNS require the domain owner's action.

Suspension stops new storefront purchases without losing orders or audit history. Define continued processing of in-flight payments/refunds. Archive preserves retention/export needs and removes public routing; deletion is a separate controlled process, not part of ordinary suspension. Merchant export/backup/restore procedures include only that merchant's data.

## 12. Delivery work packages and dependencies

P0 — Baseline and contracts
Inventory current routes/models/integrations and hard-coded deli references; verify current commerce capabilities rather than trusting roadmap labels. Decide repository transition and platform deployment naming, asset storage, supported initial translation packs/provider currencies, and access-grant operating policy. Capture backups, rollback baseline and test fixtures. Deliver architecture decisions and prioritized issues.

P1 — Tenant-aware data foundation (after P0)
Implement registry, ownership, shop connection/model factories, domain resolver, scoped caches and lifecycle. Validate two isolated databases with identical product IDs/slugs and intentional connection failure. No unknown host/default-shop fallback.

P2 — Identity, superadmin and existing dashboard scope (after P1)
Implement memberships, explicit access grants, revocation, superadmin UI and per-tab shop selector. Convert every admin endpoint and object lookup. Pass cross-shop read/write/export/callback denial tests before any multi-owner production activation.

P3 — Internationalization, money and accessibility foundation (after P1; apply while building P2 onward)
Introduce dictionaries, locale route/content contracts, RTL-ready shell, accessible shared controls, currency price lists, exact money helpers and order snapshots. Verify locale switching, pluralization, zero/three-decimal currency cases, rounding, mixed-currency rejection and immutable historical orders. These are dependencies of new public/shop UI, not a late retrofit.

P4 — Shop integrations and commerce (after P2/P3)
Move database/integration management into scoped settings, add encryption/versioning and safe tests. Complete missing payment/invoice/delivery functionality needed for advertised commerce parity. Verify duplicate callbacks, concurrent stock claims, failed payment, invoice retry and refund currency. Document provider/market limitations.

P5 — Appearance, media and onboarding (after P3/P4)
Deliver basic branding, approved GDS presets, GDS customization publication/rollback, localized assets, domain readiness and empty shop setup. Pass accessibility checks across all supported modes and prove an empty second shop can launch without code changes.

P6 — Shared customer identity and discount.direct contracts (after P2/P3)
Validate login across two distinct domains, tenant-specific customer histories and revocation. Define shop/seller identity mapping, outbox and mock contract tests. Ship integration readiness honestly without claiming vouchers work.

P7 — Migration and first platform production release (after P1–P6)
Migrate deli.africa first while preserving business data, readable URLs, brand, admin membership and integrations. Run a second isolated pilot shop, then activate the remaining shops incrementally. Verify domain/SEO/cache isolation, provider flows, a11y, internationalization, currency and recovery. Deliver release/rollback evidence.

P8 — Cross-shop campaign benefits (later; depends on discount.direct redemption readiness)
Implement participating-shop campaigns, customer benefit view, quote/reserve/redeem/release/refund integration and merchant settlement reporting. Gate launch on competing redemption, expiry, retries, partial outage and reconciliation tests. No universal balance.

## 13. Migration and rollback

Prefer additive schema changes and a feature-gated transition. Take and verify backups before writes. Establish deli.africa's immutable shop/ownership IDs and assign its existing business database explicitly. Map existing administrators to deli-only memberships; do not promote them to platform superadmin. Preserve order/product IDs and SEO URLs. Replace hard-coded branding/configuration paths through scoped accessors.

Dry-run migration on isolated restored data; compare counts, order totals per currency and representative records. During cutover use a controlled write window or explicit synchronization strategy; never run two conflicting writers. Validate checkout callbacks during domain transitions. Rollback must pair compatible application code with database/configuration versions and restore routing. Rehearse before adding unrelated merchants.

## 14. Required verification and definition of done

- Unit/contract: money, locale fallback, domain normalization, membership/grant checks, secret serialization, event idempotency.
- Integration: distinct shop databases, credential rotation, unknown host rejection, cache isolation, preview isolation, outbox retries and provider callback ownership.
- End-to-end: superadmin creates empty shop; admin configures language/currency/theme; authorized selector switch; customer shops and checks out; other shop data remains inaccessible; access revocation takes effect.
- Security regression: request/body/URL shop manipulation, cross-tab stale writes, cross-shop object IDs, unapproved SSO admin elevation, domain takeover, unapproved styling/resource injection, secret leakage and cross-shop analytics.
- a11y/i18n/currency: keyboard/screen reader, mobile/reflow, contrast and focus per theme, multiple translated locales plus RTL fixture, enabled currency purchase/refund and reporting.
- Operations: failed shop DB, central registry outage, payment retry, interrupted migration and backup restore. Health reports only measured active-user information; no invented zero/healthy states.

Each implementation package: documented scope and release notes (New Features, Fixed Bugs, Known Issues, Future Roadmap), meaningful tests/build checks, versioned GitHub commit, Vercel Production READY for the intended commit, verified relevant user flow, and rollback instructions. Planning-only changes do not imply a deployed application release.

## 15. Remaining implementation-time inputs

These do not change the approved product direction: verify customer.direct domain ownership/DNS and platform repository destination; identify initial superadmin and merchant identities; confirm initial translation packs and provider-supported selling currencies; establish production encryption/backup ownership; verify GDS package/version access; validate the planned MongoDB GridFS asset limits; confirm domain callback support with DoneIsBetter; and select the second pilot shop. No credentials belong in this document.

## References reviewed

- Local deli.africa database connection, models, authentication, integrations, admin audit and roadmap.
- Local discountdirect README, architecture, authentication, catalogue and implementation plan; early-stage release 0.5.0.
- GDS theme governance: https://github.com/sovereignsquad/general-design-system/blob/main/THEME_GOVERNANCE.md
- GDS foundation: https://github.com/sovereignsquad/general-design-system/blob/main/FOUNDATION.md
- Vercel multi-tenant platform model: https://vercel.com/changelog/introducing-vercel-for-platforms
- Vercel domain management: https://vercel.com/docs/domains/working-with-domains

## Executable backlog

The authoritative implementation work is decomposed into individual repository issues on the customer.direct engineering project. See [the execution ledger](docs/customer-direct/README.md) for issue links, native prerequisites, milestones and readiness rules. The ledger supersedes phase-level sequencing where a smaller independently executable slice is identified.
