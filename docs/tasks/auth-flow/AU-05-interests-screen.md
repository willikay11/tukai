# AU-05 Select your interests (onboard and edit)

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** AU-00 (approved — row 3: this screen now comes right after the email form and is what actually creates the account), AU-01, AU-03
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## 4. Select your interests" (mode table, chip list with 24 entries); markup: the `au.isInts` branch; logic: `intDefs()`, `otherIcon()`, the `v === 'interests'` half of `authVals()`
- **Now:** `app/(auth)/auth/interests/page.tsx` — a real, working page: fetches categories from `/auth/interests/api` (`GET`), renders them with the existing `CategoryPill` component, toggles selection, submits with `POST` (new account, using the redux-stored sign-up payload) or `PUT` (editing a signed-in account's interests), then routes to `/auth/otp-confirmation` or `/`

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Photo + shade background, logo, title/subtitle per mode | missing | Current page is a plain light page, not the dark photo card |
| Chip row: 24 interests, two-column reading order, off/on/active states, `aria-pressed` | partially — `CategoryPill` already toggles and has selected styling; verify its colours against the handoff's off (`rgba(255,255,255,.14)`/white) and on (`#B0E800`/`#013334`) states, which assume a dark background `CategoryPill` wasn't built for | |
| Chip icons matching place-category icons at stroke width 1.2 | likely already correct in spirit — the categories themselves come from the real API (`getInterestCategories`), which other tasks (e.g. experiences-listing's EL-01) already treat as the same place-category list. Confirm the specific 24 ids in the handoff's table map onto what the API actually returns | |
| Count line ("Pick as many as you like" / "{n} selected"), `aria-live="polite"` | missing | |
| Submit button states + label ("Submit" onboard, "Save interests" edit) | partially — current button always says "Submit" | |
| Edit mode: starts pre-filled with saved interests, Close/scrim/Escape all work, success toast "Interests saved to your profile." | partially — page has no close (it's a route, not a dialog step), toast copy differs ("Interests saved" / "Your next adventure awaits!") | |
| Onboard mode: starts empty, no way to close | partially — matches today's behaviour by virtue of being a page with nowhere else to go, but needs the dialog's explicit close-is-unavailable handling once this becomes a dialog step (AU-01) | |

## Done when

- [ ] Chip list renders from the real `getInterestCategories` API data, not a hardcoded list, keeping the pattern already used for experience categories elsewhere in the app
- [ ] Onboard and edit modes both work inside the dialog (AU-01), with edit reachable from wherever "Profile, My interests, Edit" currently links (audit this before changing it — see AU-01's inventory)
- [ ] Count line and submit button states match the handoff
- [ ] Toast copy matches the handoff ("Interests saved to your profile.") for edit mode
- [ ] Submit calls the real API: `POST /auth/interests/api` for a new account (creating it with the typed name/email/password plus the chosen interests — this is also what triggers the backend to send the verification code), `PUT` for an already-signed-in account editing its interests
- [ ] On new-account submit, proceeds to AU-04's OTP screen (not signed-in directly — the account exists but is unverified until the code is entered)
- [ ] No skip path (AU-00 row 8: decided)

## Notes

Built in `app/shared/components/Auth/AuthDialog/InterestsCard.tsx`, pulling
categories from `useGetInterestCategories()` (already used elsewhere for the
same data) rather than the old page's own `/auth/interests/api` GET.

**Not built as a `CategoryPill` variant:** `CategoryPill` was built for light
backgrounds and has its own fixed on/off palette; threading a dark/blurred
variant through it (and its test) for one screen felt like more risk than a
small local `InterestChip` in the same file. Flagging in case the owner would
rather it live on the shared component for reuse elsewhere later.

Submit's destination depends on how the reader got here: `POST` (and account
creation) for a brand-new email account, `PUT` for anyone who already has a
session - a Google/Apple sign-up that needed interests, or an edit from the
profile. See AU-01's notes on the `hasInterests` check for how that's decided.
