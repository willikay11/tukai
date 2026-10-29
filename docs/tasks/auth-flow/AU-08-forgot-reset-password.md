# AU-08 Forgot/reset password

- **Status:** awaiting approval
- **Type:** decision
- **Depends on:** AU-00 (approved — row 5: keep the real flow, restyle it), AU-03
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, the "Forgot password?" bullet under "## 2. Email form" ("the toast reads 'We sent a link to reset your password to {email}.'"); logic: the `onForgot` line in `emailVals()`. There is no further design for a reset screen — the handoff's own Open item 4 says so
- **Now:** `app/(auth)/auth/forgot-password/page.tsx` (real page: email → `POST /auth/forgot-password/api` → shows a "verification code sent" success state) and `app/(auth)/auth/reset-password/page.tsx` (real page: 4-digit OTP via `OtpInput` → new password + confirm → `POST /auth/reset-password/api`)

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| "Enter your email first..." error when the field is empty/invalid | missing | current page requires navigating to it first; there's no inline field to check against before that |
| Toast: "We sent a link to reset your password to {email}." | built, different | real flow's "link" is actually a 4-digit code typed into a second screen, not a clickable link — the design's copy doesn't match what the product actually does |
| Reset screens | not designed | the handoff says so explicitly (Open item 4) |

## Done when

- [x] Owner confirms AU-00 row 5's recommendation (keep the real OTP+password flow, restyle it) rather than building the design's simpler, undeliverable-as-drawn "email a link" version
- [ ] Owner picks: moves into the dialog (further step/sub-view) or stays as standalone pages linked from the dialog — still open, see Notes
- [ ] If moved into the dialog: "Forgot password?" in AU-03's sign-in form opens this flow inside the dialog, rather than navigating to `/auth/forgot-password`
- [ ] Restyled request/code/new-password screens match the dialog's visual language (fields, buttons, error rows) established in AU-03/AU-04, even though no pixel spec exists for them
- [ ] Real email-format validation (already correct on the existing page) replaces the design's broken "rejects emails containing 's'" check (AU-00 row 16)

## Notes

Whether to *keep* the real flow is settled (AU-00 row 5). What's still open
is *where it lives*: fully inside the dialog (consistent with the rest of
the rebuild, more work now) or left as the standalone pages it already is,
just linked from AU-03's "Forgot password?" (simpler, ships sooner, slightly
breaks the "it's all one dialog" promise). Ask before AU-08 starts.
