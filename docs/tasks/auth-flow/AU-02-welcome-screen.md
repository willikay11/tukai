# AU-02 Welcome screen (Create account / Sign in / Session expired)

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** AU-00, AU-01
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## 1. Welcome" (copy, layout, rotating phrase, actions table); markup: the `au.isWelcome` branch with `hint-placeholder-val="{{ true }}"` (the welcome/interests shared wrapper) down to the Google/Apple/email buttons and the "New to Tukai?" / "Not now" rows; logic: `authGo`, `wordEl`, the `WORDS` array, and the welcome-only fields in `authVals()`
- **Now:** `app/shared/components/Auth/SocialAuthButtons.tsx` (Google/Apple buttons, no busy state, wrong Google blue — see AU-00 row 12), `app/shared/components/Auth/AuthCard.tsx` (a flat list: social buttons, divider, "Sign in with email" toggle — no photo, no headline, no rotating phrase, no reason pill, no three variants)

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Photo background + gradient shade (desktop/phone variants) | missing | — |
| Logo (white, 40px) | missing | `AuthCard` has no logo |
| Headline: "Plan & discover" + rotating phrase (Create account/Sign in), "Your session expired" (expired) | missing | — |
| Rotating phrase animation (letters in, word out, 3s interval, no layout jump) | missing | — |
| Subtitle per variant (none / sign-in copy / expired copy) | missing | — |
| Reason pill (Create account only, when opened via `needAuth`) | missing | depends on AU-01's `needAuth` |
| Continue with Google (brand blue, multicolour G in white circle, busy state "Connecting to Google") | partially — button exists, wrong colour, no busy state, no specific icon mark | |
| Continue with Apple (black, white Apple mark, busy state) | partially — button exists, no busy state | |
| Continue with email | partially — exists as a text toggle in `AuthCard`, not styled as a third equal button with a mail icon | |
| "New to Tukai? Create an account" (Sign in only) | missing | |
| "Not now" (Session expired only) | missing | No Session expired variant exists at all |
| Legal line with Terms/Privacy links, pinned to the bottom via a spacer | partially — `AuthTerms.tsx` exists but is plain, not styled or positioned per the handoff |

## Done when

- [ ] All three variants (register/signin/expired) render from the one component, switching on `authView`
- [ ] Rotating phrase runs only on register/signin, respects `prefers-reduced-motion` (AU-00 row 11)
- [ ] Google/Apple buttons show the correct brand colours and marks (AU-00 row 12), with working busy states that block taps on the other method while one is in flight
- [ ] Reason pill renders when `authWhy` is set
- [ ] Sign in's "Create an account" and the new "Already have an account? Sign in" link (AU-00 row 17) both switch `authView` without closing the dialog
- [ ] Session expired's "Not now" closes the dialog, leaving the person signed out
- [ ] Legal line sits at the bottom via the flex spacer, not the natural end of a stack

## Notes

Built in `app/shared/components/Auth/AuthDialog/WelcomeCard.tsx`, with the
Google/Apple marks as inline SVG in `SocialGlyphs.tsx` (fixing AU-00 row 12 -
the old `SocialAuthButtons.tsx` used a non-brand blue) and the phrase
animation in `RotatingPhrase.tsx`. The photo is the existing local
`/images/hill-descent.webp` rather than the handoff's Unsplash placeholder -
no need to add an external image host for what was always a stand-in photo.

The "new vs returning" branch for Google/Apple (AU-00 row 13) does not happen
here inline, since OAuth is a full-page redirect - see AU-01's notes for
where it actually runs. "Already have an account? Sign in" (AU-00 row 17) was
added to Create account to close the one-way link the handoff left open.
`prefers-reduced-motion` is handled by the existing global CSS rule that
collapses all `animate-*` classes, not a separate JS check (AU-00 row 11).
