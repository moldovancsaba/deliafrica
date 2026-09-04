# Release Notes — v0.1.0

## ✅ New Features
- Complete deli.africa storefront MVP
- Editorial homepage based on the provided brand board
- Product categories, product detail view and curated catalogue
- Working cart, quantity controls and checkout flow
- Order validation API with MongoDB/Mongoose persistence when configured
- General system dashboard with MongoDB status, user surface status, runtime, API latency and service health
- Socket.io-ready realtime endpoint and dependencies
- Responsive desktop/tablet/mobile layouts

## ✅ Fixed Bugs
- No known application crashes in the initial release
- Checkout sanitises catalogue pricing server-side instead of trusting client totals
- MongoDB connection failures fall back safely instead of crashing the storefront

## ✅ Known Issues
- Product visuals are stylised placeholders, not final licensed product photography
- Payment processing is intentionally not implemented in this MVP
- Persistent Socket.io connections depend on Vercel websocket runtime behaviour; the endpoint is prepared but the current shop does not require live events to complete a purchase
- Orders are non-persistent until `MONGODB_URI` is configured in Vercel

## ✅ Future Roadmap
- Real product photography and CMS-managed inventory
- Payment integration
- Delivery calculation and transactional e-mail
- Admin order management
- Inventory and stock events over Socket.io
- Customer accounts and saved favourites
