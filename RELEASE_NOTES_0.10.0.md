# Release Notes — v0.10.0

## ✅ New Features
- Added persistent registered-user records in MongoDB for deli.africa SSO users.
- Added a dedicated `/dashboard/users` administration page.
- Added registered user counts and admin counts to the General Dashboard overview.
- Added searchable user listing with name, e-mail, SSO user ID, role, login/activity timestamps and order history summary.
- Added admin-role assignment and revocation from the dashboard.
- Added local app-level role overrides while preserving the original SSO role for audit visibility.
- Added automatic backfill of users identifiable from existing orders so historical buyers can appear before their next login.

## ✅ Fixed Bugs
- Admin role changes now take effect on subsequent requests without requiring the SSO provider role to be changed.
- Protected the currently signed-in administrator from accidentally revoking their own admin access in the dashboard.

## ✅ Known Issues
- The user list contains users known to the deli.africa application: users who have signed in to deli.africa or can be reconstructed from existing deli.africa orders. It is not a directory of every account registered globally in the external SSO service.
- Local admin overrides are application-specific and do not modify the user's global DoneIsBetter SSO role.

## ✅ Future Roadmap
- User detail pages with addresses, consent history and full order timeline.
- Account suspension / reactivation controls.
- Audit log for every administrator permission change.
- Optional synchronisation with a provider-side app-user directory if the SSO exposes an authorised application-user listing API.
