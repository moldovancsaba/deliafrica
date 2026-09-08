# deli.africa v0.12.0 — Editable Storefront Content

## ✅ New Features
- MongoDB is now the canonical production catalogue source for the webshop, checkout, product pages and category pages.
- Product CRUD now covers complete storefront/PDP content: descriptions, background, flavour, audience, packaging, storage, pairings, serving ideas, FAQ, editorial media and captions.
- Added product SEO and AI-search fields: SEO title, meta description, AI/GPT summary, Open Graph title and description.
- Added a public no-cache catalogue endpoint for the storefront.
- Added a central structured storefront-copy model. All fields are automatically available in the existing Content admin editor through `uiCopy`.
- Category titles, descriptions, editorial context, tips and visual labels are editable.
- Customer profile copy, placeholders, metadata and order-status labels are editable.
- Customer-facing API success/error messages are editable.
- Site, product, category and legal metadata now derive from editable content.
- Added a versioned one-time content migration so existing MongoDB products receive the full PDP content model without overwriting non-empty administrator data.

## ✅ Fixed Bugs
- Removed the remaining baked-in customer-facing copy from homepage interactions, product pages, category pages, profile, mobile menu, auth error screen, cookie consent, footer social accessibility labels and legal page metadata.
- Checkout no longer reads prices/product availability from the static seed catalogue; it validates against the MongoDB catalogue.
- Product pages no longer depend on static product content after MongoDB has been seeded.
- Raw backend values such as `paid` and `delivered` are no longer shown directly to customers on profile order history.
- Product image/fallback labels no longer contain baked-in marketing text.
- Existing MongoDB products with previously empty PDP fields are migrated from the original seed exactly once; subsequent administrator edits, including intentionally clearing a field, are preserved.

## ✅ Known Issues
- `lib/products.js` remains intentionally as initial seed/development fallback data. In normal Production operation with MongoDB connected, it is not the canonical catalogue.
- The current Content admin uses a generic structured field editor. The data architecture is complete, but a future visual page-preview editor could improve editorial workflows further.
- Category structure (category IDs and presentation tone/image mapping) remains application structure; all customer-visible category wording is editable.

## ✅ Future Roadmap
- Add visual preview and publish workflow for content editing.
- Add category CRUD if the taxonomy itself needs to become merchant-managed.
- Add content revision history and rollback.
- Add validation hints for SEO title/description lengths and structured product-content completeness.
