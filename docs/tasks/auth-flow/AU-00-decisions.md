# AU-00 Decisions: handoff vs. the real app

- **Status:** approved
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, whole file (it is already scoped to this feature, so it doubles as the excerpt)
- **Now:** five separate pages under `app/(auth)/auth/`, plus a second, smaller dialog in `context/AuthDialogContext.tsx`

## Why this task exists

The handoff is a design reference built against a mocked prototype
(`setTimeout` instead of real requests, no real account state). The real app
already has working endpoints behind several of these screens, and in a few
places their shape doesn't match what the prototype assumes. Those
mismatches have to be resolved before AU-01 onward can be built, or the
build will silently pick one and the owner won't know a choice was made.

The handoff's own "Open items" (1–15, bottom of the doc) are included below
alongside the ones found while reading the current code.

## Inventory

| # | Conflict | What the design assumes | What the real app has | Recommendation | Decision needed |
|---|---|---|---|---|---|
| 1 | Where auth lives | One dialog, reused everywhere | Five pages (`/auth/sign-in`, `/auth/sign-up`, `/auth/sign-up-free`, `/auth/otp-confirmation`, `/auth/interests`) plus a separate 460px dialog (`AuthDialogContent`/`AuthCard`) used by `openSignInWithCallback` | Build the dialog per the handoff; retire the AuthDialogContext dialog in its favour | **Decided: retire the five pages.** Old URLs redirect into the dialog rather than staying as standalone UIs |
| 2 | `/auth/sign-up` vs `/auth/sign-up-free` | N/A | Top bar "Create account" links to `/auth/sign-up`, which renders `AuthCard` — the **sign-in** form (email+password, no name fields). The real registration form (first/last name, password, confirm password, debounced email-exists check) lives at `/auth/sign-up-free`, which nothing in the top bar links to | Both are replaced by the dialog's Email form (AU-03) in register mode | confirmed, folded into decision 1 |
| 3 | Order: code before or after interests | Email/password → **code** → interests | Interests page submits first (creating the account via `POST /auth/interests/api` with the name/email/password payload from redux), *then* redirects to `/auth/otp-confirmation` | **Resolved by reading the API routes**, not a style choice: `POST /auth/interests/api` is what calls the real `POST /v1/accounts/users/` — the account (name, email, password, interests) is created in one shot, and the backend sends the verification code as a side effect of that creation. The frontend never has an account to attach a code to before that. The handoff's "send code, then interests" order cannot be built as drawn | **Decided: keep the current order** — name/email/password → interests → account created → code auto-sent → verify. Knock-on effect: AU-03's email-form submit can't be labelled "Send code" under this order, since nothing is sent yet (see AU-03 notes) |
| 4 | OTP resend countdown | 30s | 120s (`INITIAL_COUNT` in `otp-confirmation/page.tsx`) | — | **Decided: keep 120s** |
| 5 | Forgot/reset password | "Forgot password?" sends a reset-link toast, no further screens designed | A real, working three-step flow: request → 4-digit OTP → new password (`/auth/forgot-password`, `/auth/reset-password`, backed by real API routes) | Keep the real flow; restyle it into the dialog's visual language in AU-08 rather than building the simpler thing the handoff describes, which does not fit a backend that requires OTP verification before a password reset | **Decided: keep the real flow, restyle it** |
| 6 | Error red (handoff's own Open item 12) | Field/code errors `#B42318`; Close button `#E02D3C` | Both already exist as separate Tailwind tokens from an earlier pass: `danger-deep` (`#B42318`) and `danger` (`#E02D3C`), used exactly this way elsewhere (the claim status screen's "Not approved" text vs. general danger). No merge needed — use `danger-deep` for field/code errors, `danger`/`danger-surface` for the Close button, matching both the handoff and the existing convention | none, already resolved |
| 7 | Interests card size (handoff's own Open item 11) | Markup wires the interests card to `au.cardW`/`au.cardH` (960 × `min(640px, ...)`, same as Welcome). The logic also defines unused `intsW`/`intsH` (600 × 760) that nothing reads | Build at 960 × 640 (`cardW`/`cardH`) | none, already resolved — `intsW`/`intsH` are dead values in the prototype |
| 8 | Skip on interests (handoff's own Open item 8) | Sign-up cannot skip, but a `canSkip`/`onSkip` path still exists in the logic with its own toast | The current real interests page also has no skip | Drop skip entirely, matching both | **Decided: no skip, at least one interest required** |
| 9 | "Plans" reason pill (handoff's own Open item 10) | "Your plans live in your account." | No `/plans` route exists in this app (see CLAUDE.md's route table) | Drop this reason from the pill map | none, already resolved — drop it |
| 10 | Password kept on close (handoff's own Open item 14) | Typed password stays in memory after closing | N/A (not yet built) | Clear `authPw`/`pwShow` on close, per the handoff's own flag | none, adopt |
| 11 | Reduced motion (handoff's own Open item 13) | Rotating phrase ignores `prefers-reduced-motion` | N/A | Show the current phrase without the letter-in/word-out animation under `prefers-reduced-motion: reduce` | none, adopt |
| 12 | Google/Apple branding (handoff's own Open item 15) | `#4285F4`/`#3B78E7` Google, `#000`/`#1A1A1A` Apple, specific logo marks | The current `SocialAuthButtons.tsx` already uses the **wrong** Google blue (`#5B7BF5`, not Google's `#4285F4`) and a plain icon import rather than the multicolour G in a white circle the handoff specifies | Fix to match the handoff's colours/marks, then check both buttons against Google's and Apple's sign-in button guidelines before launch, as the handoff itself flags | confirm fix, schedule the brand-guideline check |
| 13 | No account check on social sign-in (handoff's own Open item 1) | Google/Apple on Create account always goes to interests; on Sign in always signs in | The real NextAuth config already resolves this: `session.user.hasInterests` is set in the `jwt` callback for every provider, including Google and Apple | Branch on `hasInterests` (new account or one with none picked yet → interests; otherwise → signed in) regardless of which welcome screen (Create account vs. Sign in) was used | none, already resolved by existing session data |
| 14 | Nudge skips interests (handoff's own Open item 2) | Google/Apple from the nudge always signs in, never offers interests, even for a new account | N/A (nudge doesn't exist yet) | Same `hasInterests` branch as #13 applies to the nudge's Google/Apple buttons too | none, same fix as #13 |
| 15 | Toast says a fixed name (handoff's own Open item 3) | Always "Wanjiku" | N/A | Use `session.user.name`'s first token, or the typed first name for email sign-up, per the handoff's own instruction | none, adopt |
| 16 | Forgot-password validity check (handoff's own Open item 4) | Prototype's check is broken, rejects any email containing "s" | Real `/auth/forgot-password` page uses a correct regex already | Use the real page's existing check, not the prototype's broken one, when AU-08 restyles it | none, adopt |
| 17 | No "Sign in" link from Create account (handoff's own Open item 7) | Sign in has "Create an account"; Create account has nothing back | N/A | Add a matching "Already have an account? Sign in" link to the Create account welcome screen | none, adopt |
| 18 | Interests copy nits (handoff's own Open item 9) | Missing full stops, a stray line break, "Click to select" says "Click" on touch | N/A | Fix the copy when building AU-05: "What are some of your favourite experiences? Tap or click to select." or similar; add the missing full stops on the legal line and the code subtitle elsewhere | confirm wording, otherwise adopt |
| 19 | Session-expired entry point | A welcome variant exists for it | Nothing in the app currently sets or watches `session.error === 'RefreshAccessTokenError'` (checked: no matches anywhere in `app/`), so there is no real trigger for this screen today | AU-01 needs to wire a listener (e.g. in whatever already calls `useSession()` near the root) that opens `authView: 'expired'` when `session.error` appears, or this screen stays permanently unreachable | confirm where this listener should live |

## Done when

- [x] Each row above has a recorded decision
- [x] AU-01 through AU-08 are updated to match

## Notes

Rows 6, 7, 9, 10, 11, 15, 16, 17 are pre-resolved by what already exists in
the codebase or by the handoff's own text, and are adopted as recommended.
Row 12 (Google/Apple branding) and row 18 (interests copy nits) are small
fixes adopted by default during the relevant build task (AU-02, AU-05) —
flag there if either needs a second look. Row 19 (session-expired trigger)
is an implementation detail for AU-01 to resolve during build, not a product
decision.

Rows 1, 3, 4, 5 and 8 were open product/scope decisions and are now settled
above (2026-10-29): retire the five pages, keep the 120s OTP countdown, keep
the real reset-password flow restyled, no skip on interests. Row 3's
resolution came from reading the real API routes rather than from a product
preference — the backend's shape rules out the handoff's drawn order.
