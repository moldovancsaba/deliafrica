# Release Notes — v0.9.0

## ✅ New Features
- Split the administration into dedicated subpages for overview, products, orders, integrations, content, legal/company data, storefront settings and system health.
- Added full MongoDB-backed product administration primitives: create, read, update and delete, with SKU, barcode, price, VAT, availability, descriptive content, inventory quantities, product dimensions, parcel dimensions and parcel weight.
- Added expanded order lifecycle fields for bought/order state, payment, invoicing, fulfilment, ready-to-deliver, handover, tracking, delivery, refund/return and status history.
- Added admin order workflow editing with payment transaction ID, invoice number/URL, Packeta point, parcel ID, tracking number/URL and internal notes.
- Added Packeta, Barion and Billingo credential administration. Secret values are encrypted before MongoDB persistence and are never returned to the browser in readable form.
- Added a centralized editable UI-copy model. Homepage navigation, story, value proposition, shop labels, editorial cards, modal actions, cart and checkout copy are now driven by editable variables.
- Added a dedicated legal/company administration page for company details, contacts, social profiles, cookie consent copy and legal documents.
- Added a complete branded footer with company details, contact information, legal links and social links.
- Added default editable legal pages for GTC / ÁSZF, T&C, Cookies, Fogyasztóvédelmi nyilatkozat and GDPR / Adatkezelési tájékoztató.
- Added cookie-consent UI with necessary-only and accept-all choices.
- Vercel Analytics is now activated only after optional analytics consent.
- Added public readable legal routes under `/legal/...`.

## ✅ Fixed Bugs
- Replaced the previous monolithic admin screen with navigable sections so operational settings are not mixed together.
- Removed the misleading provider-readiness dead end: provider credentials now have a real admin configuration surface.
- Replaced the limited dimensions-only product settings concept with a complete product-management data model.
- Replaced the previous single generic order status with independent commercial, payment, invoice, fulfilment and delivery status tracking.
- Replaced the minimal legacy storefront footer with a complete ecommerce/legal footer aligned with the deli.africa visual system.
- Removed duplicated legacy footers from customer-facing pages; the global branded footer is used consistently.
- Removed hard-coded homepage UI strings where editable copy variables now exist.

## ✅ Known Issues
- Packeta, Barion and Billingo API execution flows are not yet fully connected to their live provider APIs; this release provides secure credential storage, readiness state and the commerce data model required for those integrations.
- Some catalogue products still have unconfirmed prices and remain non-purchasable until completed in Product Administration.
- Legal defaults are operational templates. Company registration number, tax number, formal jurisdiction and any locally mandatory authority details must be entered once the final legal entity data is available and should be reviewed by qualified counsel before commercial launch.
- Existing catalogue data is still seeded from the original static catalogue until all product records are migrated and maintained exclusively from MongoDB.

## ✅ Future Roadmap
- Complete Packeta pickup-point selection, parcel creation, label/tracking synchronization and delivery webhooks.
- Complete Barion payment creation, callback/webhook validation, paid/refund state synchronization and reconciliation.
- Complete Billingo invoice creation, invoice download/linking, storno handling and invoice-status synchronization.
- Make MongoDB the sole source of truth for storefront catalogue rendering and stock validation.
- Add inventory reservation/release events tied to checkout, payment failure, cancellation and fulfilment.
- Add customer order-history/profile pages and transactional notifications.
- Add image upload/replacement directly from Product Administration.
- Add legal document version history and publish timestamps.
