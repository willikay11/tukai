# AU-08 Forgot/reset password

- **Status:** built, pending owner review
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
- [x] Owner picks where it lives: moved fully into the dialog (2026-10-29 — "extrapolate it from the new design"), not left as standalone pages
- [x] "Forgot password?" in AU-03's sign-in form opens this flow inside the dialog, rather than navigating to `/auth/forgot-password`
- [x] Request/code/new-password screens match the dialog's visual language (fields, buttons, error rows) established in AU-03/AU-04 - no pixel spec exists for them, so this is extrapolated, not matched against a drawn screen
- [x] Real email-format validation (already correct on the existing page) replaces the design's broken "rejects emails containing 's'" check (AU-00 row 16)

## Built

`app/shared/components/Auth/AuthDialog/ForgotEmailScreen.tsx`,
`ForgotCodeScreen.tsx` and `ForgotNewPasswordScreen.tsx`, swapped into the
existing white split card (`EmailOrCodeCard.tsx`, now routed by `view ===
'forgot'` as well as `step`) rather than a new frame - it's the same shell.
The 4-digit code box reuses a new `DigitCodeInput` component, extracted from
AU-04's 6-digit one (`groups={[4]}` vs `groups={[3, 3]}`) rather than
duplicating the box/overlay-input markup.

State lives in `AuthDialogContext.tsx` as its own `forgotStep` axis
(`'email' | 'code' | 'password' | null`), independent of the register/sign-in
`step`, since it's a different flow reachable mid-way through sign-in rather
than a sub-step of it. Calls the same two real routes the old pages used
(`POST /auth/forgot-password/api`, `POST /auth/reset-password/api`) -
nothing changed on the backend side.

**Extrapolated, not drawn - judgement calls made along the way:**
- Photo panel copy ("Let's get you back in" / "A quick code to your email,
  then you're set with a new password.") is new; the design never reached
  this screen.
- "Forgot password?" pre-fills the new flow's email field from whatever was
  already typed on the sign-in form, since that's almost always the account
  meant.
- The code step has no separate "verify" call (the real check only happens
  at the final password submit, matching the old pages' own behaviour) - 4
  digits just advances to the password step, both automatically and via a
  "Continue" button for discoverability.
- A password rule hint and a confirm-password field were added, matching the
  register flow's conventions - the old reset-password page had neither (its
  "passwords match" check was a dead, commented-out regex).
- On success, lands on Sign in with the email pre-filled rather than a
  separate "Password reset complete" screen - one less click, and consistent
  with how the rest of the dialog carries straight into what comes next.
- Both old pages (`/auth/forgot-password`, `/auth/reset-password`) now
  redirect into the dialog, the same way the original five did (AU-00
  decision 1).
