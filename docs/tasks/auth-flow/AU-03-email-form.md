# AU-03 Email form (register and sign-in variants)

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** AU-00 (approved), AU-01
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## 2. Email form" (fields table, geometry table, field states, password extras, rules); markup: the `au.isForm` branch, specifically `au.isEmail`; logic: `emailVals()` (the `isEmail`/`isForm` half), `sendCode()`
- **Now:** `app/shared/components/Auth/EmailSignInForm.tsx` (sign-in only: email + password via `react-hook-form`, calls `signIn('credentials', ...)` directly, has its own "Forgot Password?" link, no name fields, no photo panel, no password rule hint) and `app/(auth)/auth/sign-up-free/page.tsx` (register only: first/last name, email with debounced `userExists` check, password + confirm password — a field the design doesn't have — stores to redux and navigates to `/auth/interests`, does not call `signIn` or any send-code endpoint itself)

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Split layout: form column + photo panel (≥720px), panel copy per mode | missing | Neither existing form has a photo panel |
| Logo, title, subtitle per mode | partially — `sign-up-free` has plain title text; `EmailSignInForm` has none | |
| Name row (register only, two fields side by side) | built, different shape | `sign-up-free` has first/last name; the design's grid (`auto-fit, minmax(140px,1fr)`) is a reasonable match, re-verify at the exact geometry table's breakpoints |
| Email field (icon, states, inline format error on submit only) | partially | `sign-up-free`'s email also does a live debounced "already exists" check via `useUserExists` — the design has no such check. Decide whether to keep it (Notes) |
| Password field + show/hide toggle + rule hint (register only) | partially — both forms have a password input, neither has a show/hide eye or the "at least 8 characters, including a number" rule hint | |
| Confirm password field | n/a in design | `sign-up-free` has one; the design does not. See AU-00-adjacent note below — not listed there since it's additive, not a conflict, but flag for the owner: drop it, or keep it as a field the design doesn't show? |
| Forgot password? (sign-in only) | built, different shape | `EmailSignInForm` links to `/auth/forgot-password` (a page); design opens a toast inline, no navigation (see AU-08) |
| Submit button states (enabled/disabled/busy, "Send code"/"Sending code" vs "Sign in"/"Signing in") | partially — `sign-up-free`'s button never changes label; `EmailSignInForm`'s does via `isLoading` | **Register label needs to change from the handoff's "Send code"** — per AU-00 row 3, no code is sent at this step under the real account-creation order (the account, and its code, aren't created until interests are submitted). Use "Continue" (busy: "Continuing") or similar instead; propose exact copy during build |
| Back (returns to Welcome, keeps all fields) | missing | Neither page is inside a dialog with a Welcome step to go back to |
| Legal line | partially | `sign-up-free` has one inline, not positioned per the handoff |

## Done when

- [ ] One component renders both register and sign-in modes, switching on `authView`, matching the handoff's per-mode table (panel copy, title, subtitle, fields, button label)
- [ ] Register mode: first name, last name, email, password (no confirm-password field unless the owner asks to keep it — see Notes)
- [ ] Sign-in mode: email, password, Forgot password?
- [ ] Password rule hint and show/hide toggle built for both modes (hide toggle in both; rule hint register-only, per the handoff)
- [ ] Email format validated on submit only, not while typing; typing clears a prior error
- [ ] Register submit does not send a code (AU-00 row 3: the account and its code don't exist yet) — it stores the payload and proceeds to Interests, as the current `sign-up-free` page does
- [ ] Sign-in submit calls the real `signIn('credentials', ...)`, matching `EmailSignInForm`'s existing error handling (including the pending-verification case it currently special-cases)
- [ ] Back returns to Welcome without losing any typed field

## Notes

Built in `app/shared/components/Auth/AuthDialog/EmailFormScreen.tsx`, reusing
the shared `Input` primitive (icon slot, focus ring) rather than hand-rolled
fields - a deliberate consistency choice over matching the handoff's exact
12px radius (`Input` uses 14px).

**Debounced email-exists check and the confirm-password field:** both
dropped, not kept behind a flag. The design has neither; keeping them would
have meant inventing copy and placement for an error state and a field the
design doesn't show. Flagging here per the task's own note, since removing
behaviour is worth a second look even when it matches the design.

**Button copy:** register's submit reads "Continue", not "Send code" -
nothing is sent at this step (AU-00 row 3), so the handoff's label would have
been misleading. Confirm this reads right; "Continue" was a judgement call,
not a design value.
