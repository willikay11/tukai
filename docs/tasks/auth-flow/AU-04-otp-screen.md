# AU-04 Check your email (OTP)

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** AU-00 (approved — row 3: this screen is reached only after Interests submits and the account/code are created; row 4: countdown stays 120s), AU-03, AU-05
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## 3. Check your email (OTP)" (box geometry, below-the-boxes table); markup: the `au.isCode` branch; logic: `emailVals()` (the `isCode` half: `box()`, `otpTimer()`), `verifyCode()`
- **Now:** `app/(auth)/auth/otp-confirmation/page.tsx` — a full page using `OtpInput` from `app/shared/components/Forms`, a 120s countdown (not 30s), reads the email from session/redux/query string, posts to `/auth/otp-confirmation/api` (`POST` to verify, `PUT` to resend), then signs in with the redux-stored password on success

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Two groups of three digit boxes over one invisible real input | missing | `OtpInput` is a different component; check its internals before assuming it needs to be replaced outright — it may already be box-over-real-input, just styled differently |
| Box states: default / next-box focus ring / error (all boxes red) | unknown, needs checking against `OtpInput`'s existing implementation | |
| Auto-verify on the 6th digit | likely already true if `OtpInput` is used elsewhere the same way — confirm | |
| Error row: "That code isn't right..." | missing | Current page uses a toast (`OTP Failure` / `res.message`) instead of an inline `role="alert"` row |
| Verify button (disabled until 6 digits, busy "Verifying") | partially — current page has a "Verify Account" button, always enabled, loading state via `isSubmitting` | |
| Help line: "Didn't get it? Check your spam folder." | missing | |
| Resend (countdown vs. ready states, exact copy "Resend code in 0:27") | built, different copy/format (`mm:ss` vs the handoff's `0:ss`) | Countdown value stays 120s per AU-00 row 4 — adjust the handoff's display format to show minutes, e.g. "Resend code in 1:45" |
| "Use a different email" (back to email form, keeps fields) | missing | Current page has no way back; it's a standalone route |
| Toast on resend: "We sent a new code to {email}." | built, different copy ("OTP sent successfully" / "A six digit code was sent to {email}") | |

## Done when

- [ ] Digit-box UI matches the handoff (geometry, states, single real input for autofill)
- [ ] Resend countdown stays 120s (AU-00 row 4), with the handoff's visual style but a `mm:ss`-capable copy line
- [ ] Verify and Resend call the real `/auth/otp-confirmation/api` routes (`POST`/`PUT`), not the prototype's mocked `setTimeout`
- [ ] A wrong code shows the inline error row, not a toast, and clears the code per the handoff
- [ ] "Use a different email" and Back both return to **Interests** (not the email form — see Notes), with the email/password/name fields and chosen interests all intact
- [ ] On success (code verified), signs in with the stored credentials and completes, matching `otp-confirmation/page.tsx`'s existing `signIn('credentials', ...)` step — this screen is the last one in the flow, not a midpoint

## Notes

**Step order, finalised:** per AU-00 row 3, this screen comes *after*
Interests, not before it as the handoff draws it. The real order is:
email form (name/email/password, no account yet) → Interests (submits,
creates the account with interests attached, backend auto-sends the code) →
this OTP screen (verifies, then signs in).

**Built resolution of the two-hop question:** rather than a two-hop back
through Interests, the register path simply has no Back or "Use a different
email" on this screen at all - the account already exists by this point, so
there is no sane destination for either (see `EmailOrCodeCard.tsx`'s
`codeCanGoBack`). The sign-in path (pending-verification) keeps Back, since
nothing new was created there and it can safely return to the email form.
"Use a different email" as a separate link was dropped even for sign-in,
since Back already covers the one case where it matters - confirm that's an
acceptable simplification.

**Not built on the existing `OtpInput`:** the shared `app/shared/components/Forms/form/otpInput.tsx`
uses one real `<input>` per box, which doesn't support paste-to-fill or
autofill the way the design's single-overlay-input does. A new,
dialog-specific input was built instead (`OtpScreen.tsx`) rather than
changing the shared component and risking the other places it's used.
