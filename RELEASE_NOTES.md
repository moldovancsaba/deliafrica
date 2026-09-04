# Release Notes — v0.5.0

## ✅ New Features
- Added direct, persistent basket actions to every purchasable product on all six category landing pages
- Expanded the homepage story and value proposition into substantive, buyer-focused sections with clear product-selection guidance
- Added five category-specific editorial hero environments with relevant food and serving props
- Added six dedicated category collection pages with readable `/categories/...` URLs, useful background, selection guidance and structured data
- Enabled real add-to-basket actions directly on purchasable product pages
- Complete deli.africa storefront MVP
- Editorial homepage based on the provided brand board
- Product categories, product detail view and curated catalogue
- Working cart, quantity controls and checkout flow
- Order validation API with MongoDB/Mongoose persistence when configured
- General system dashboard with MongoDB status, user surface status, runtime, API latency and service health
- Socket.io-ready realtime endpoint and dependencies
- Responsive desktop/tablet/mobile layouts
- Readable, statically generated product routes for every catalogue item
- Rich Hungarian product guides covering origin context, flavour, uses, serving, storage and FAQ
- Product, FAQ and breadcrumb JSON-LD plus dedicated page metadata and canonical URLs
- “Többet akarok tudni” modal action linking directly to each product page
- DoneIsBetter OAuth/OIDC sign-in with Authorization Code, PKCE, state and nonce protection
- SSO-identified buyer records and permission-aware checkout
- Admin-only dashboard access for approved SSO users with the `admin` app role
- Visible v0.3.0 release identifier across storefront, product pages and admin dashboard
- Exactly 13 catalogue products using the supplied product-pack photography
- Six-card visual category selector aligned to the deli.africa brand board
- Three distinct hero products, randomly refreshed every eight seconds
- Commercially reusable Pexels food photography on product guides, with source credits

## ✅ Fixed Bugs
- Kept every modal packshot inside its coloured product bay with aspect-ratio-safe scaling and consistent editorial padding
- Replaced the homepage hero's hard vertical seam and soft colour boundary with one intentional, crisp editorial diagonal
- Assigned package-specific hero proportions so bottles, grinders, tins, jars, boxes and bags keep believable relative sizes
- Recognised Vercel's integration-prefixed `deli_MONGODB_URI` as well as the standard `MONGODB_URI`, so the live dashboard can use the attached database
- Changed the random hero from unrelated products to one coherent category per page load
- Normalised hero scale by package type so bottles, tins, boxes and bags read in believable proportion
- Rewrote ambiguous biltong serving suggestions with concrete foods and usage instructions
- Centred and enlarged product imagery in modals and dedicated product heroes
- Paired card logos with contrast-safe variants for every category background
- Connected product breadcrumbs to real category destinations
- Kept the random hero trio stable for the full page visit instead of rotating while customers read
- Centred category-selector product images on both axes
- Hid dashboard navigation from shoppers; it appears only for approved SSO administrators
- No known application crashes in the initial release
- Checkout sanitises catalogue pricing server-side instead of trusting client totals
- MongoDB connection failures fall back safely instead of crashing the storefront
- Replaced the text-built header mark with the supplied deli.africa logo asset
- Corrected card logo positioning with a consistent true bottom-right inset
- Checkout no longer trusts client-submitted buyer identity
- Removed the obsolete “Demo webshop MVP” production label
- Rebuilt the logo geometry so the circular type path and badge background are concentric
- Reworked customer-facing copy around taste, occasions and practical buying guidance
- Replaced generic editorial-photo captions with a specific first-taste recommendation for every product
- Extended the category colour system into desktop and mobile product modals
- Restaged the hero as an oversized, overlapping editorial composition at −10°, 0° and +10°
- Added transparent-background cutouts for the verified hero rotation set
- Normalised transparent image bounds and aligned all hero products to one baseline

## ✅ Known Issues
- Prices are still awaiting confirmation for nine of the 13 products; these are visibly marked and cannot be ordered
- Payment processing is intentionally not implemented in this MVP
- Persistent Socket.io connections depend on Vercel websocket runtime behaviour; the endpoint is prepared but the current shop does not require live events to complete a purchase
- Orders are non-persistent until `MONGODB_URI` or `deli_MONGODB_URI` is configured in Vercel
- SSO login requires the OAuth client ID and secret to be configured in Vercel

## ✅ Future Roadmap
- CMS-managed inventory and confirmed pricing for the complete catalogue
- Payment integration
- Delivery calculation and transactional e-mail
- Admin order management
- Inventory and stock events over Socket.io
- Customer accounts and saved favourites
- Verified manufacturer specifications for every item
