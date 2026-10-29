# AU-06 Signed-in toast

- **Status:** built, pending owner review
- **Type:** content
- **Depends on:** AU-01
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## 5. Signed in" (toast style, copy table); markup: "### Toast"; logic: `finishAuth()`
- **Now:** `app/shared/hooks/useToast.ts` (the app's existing toast system, used throughout, e.g. `toast({ description: 'Welcome Back!', variant: 'success' })` in `AuthDialogContext.tsx` today)

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Pill-style toast (dark `#013334` background, centred bottom, 4.2s) | missing | The app's existing `useToast` renders a different visual style (check its default variant styling before assuming a new one-off toast is needed) |
| Copy: "Signed in with Google/Apple/your email. Welcome back, {name}." | missing | Current dialog's toast says a generic "Welcome Back!" regardless of method or name |
| Copy: "Welcome to Tukai, {first name}. Your interests are saved to your profile." (email sign-up only shows the name) | missing | |

## Done when

- [ ] Sign-in toast names the real method used and the real first name (fixing the handoff's own hardcoded "Wanjiku", per AU-00 row 15)
- [ ] New-account toast matches the handoff's copy, omitting the name for social sign-ups per the handoff's own rule
- [ ] Toast style matches the handoff's pill (or: confirm with the owner that the app's existing toast style is used instead, if a one-off style isn't worth adding — flag this choice rather than assuming)

## Notes

Built as `finishToast()` in `context/AuthDialogContext.tsx`. Uses the app's
existing `toast()` system and its default pill styling rather than a new
one-off style matching the handoff's exact dark pill - this wasn't one of the
four decisions asked about, so flagging it now: confirm whether the existing
toast style is fine or whether a dedicated style is worth adding.

The real first name comes from `getSession()` called right after a
credentials sign-in resolves (the session hook itself hasn't re-rendered yet
at that point), which is what fixes the handoff's hardcoded "Wanjiku" (AU-00
row 15).
