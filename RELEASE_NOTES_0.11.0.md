# Release Notes — v0.11.0

## ✅ New Features
- Added authenticated customer profile page at `/profile` for every deli.africa user.
- Added editable saved shipping details: recipient, phone, country, postal code, city, address lines and delivery note.
- Added editable saved invoice details: billing name, company name, tax number, country, postal code, city and address lines.
- Added one-click copy from saved shipping address to billing address.
- Added customer-facing order history with totals, payment/delivery states and tracking link when available.
- Added MongoDB persistence for profile delivery and billing details.
- Checkout now pre-fills customer name, phone and shipping address from the saved profile.
- New orders automatically copy saved billing data into the order record for invoicing workflows.
- Logged-in customer name in the storefront header now opens the profile instead of logging the user out directly; logout remains available inside the profile.

## ✅ Fixed Bugs
- Reduced repeated address entry for returning customers by reusing saved profile data.
- Billing identity is now retained with the order even when checkout only requests shipping details.

## ✅ Known Issues
- The current checkout form still presents shipping/contact fields only; saved invoice data is applied server-side to the order and will be surfaced directly in the future full Barion/Billingo checkout UI.
- Name and e-mail are controlled by SSO and therefore read-only in the deli.africa profile.

## ✅ Future Roadmap
- Multiple saved shipping addresses with default selection.
- Separate personal/company invoice profiles.
- Address selection directly in checkout.
- User-controlled profile deletion/export workflow for GDPR self-service.
