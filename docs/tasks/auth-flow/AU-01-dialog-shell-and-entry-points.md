# AU-01 Dialog shell, state machine and entry points

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** AU-00 (approved — the five pages are retired in favour of this dialog; old URLs should redirect in rather than stay as standalone UIs)
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "Dialog frame" and "Top bar buttons (signed out)" sections; markup under "### Top bar buttons" and the outer `<div role="dialog">` wrapper in "### Sign-in dialog"; logic: `onSignIn`, `onRegister`, `onEditInterests`, `needAuth`, `closeAuth`, the `keydown` handler, and the `authView`/`authStep`/`authBusy` state table
- **Now:** `context/AuthDialogContext.tsx` + `app/shared/components/Auth/AuthDialogContent.tsx` (a single fixed-460px shadcn `Dialog` showing one `AuthCard`, opened via `openSignInWithCallback(callback)`); `app/shared/components/Global/AuthActions.tsx` (top bar `Sign in`/`Create account` are `<Link>`s to `/auth/sign-in` and `/auth/sign-up`, not dialog triggers)

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Overlay/scrim (`role="dialog"`, `aria-modal`, padding 24px desktop / 0 phone) | missing | Current dialog uses shadcn's generic `Dialog`/`DialogContent`, fixed 460px, no per-screen sizing |
| Card sizing per screen (Welcome/Interests 960×640, Email/Code 960×720, mobile full-screen) | missing | — |
| `aria-label` per screen (register/signin/interests) | missing | — |
| Close button (top right, every card) | partially — shadcn `DialogContent` has a default close | Needs the handoff's exact placement/colour (`#F3F4F2` bg, `#E02D3C` icon → `surface`/`danger` tokens) and to be suppressed nowhere it shouldn't be |
| Back button (email form + code screens only) | missing | — |
| Escape closes, except on sign-up's interests step | missing | No keydown handler exists for this dialog |
| Click on scrim closes, same interests exception | missing | shadcn `Dialog` closes on outside-click by default; needs the interests exception added |
| Focus trap + return focus to trigger on close | missing | The prototype itself doesn't trap focus either, but the handoff asks the build to (Accessibility section) |
| State machine: `authView` (null/register/signin/expired/interests), `authStep` (null/email/code), `authBusy` (null/google/apple) | missing | Needs a home — see Notes |
| `onSignIn`/`onRegister`: top bar opens the dialog in the right view | missing | Top bar currently navigates to pages |
| `needAuth(why, then)` equivalent: opens Create account with a reason pill, runs `then` after sign-in, drops it if the dialog is closed first | partially — `openSignInWithCallback(callback)` exists and does resume an action, but has no reason-pill parameter and always opens the old 460px card, never Create account specifically | `AuthActions.tsx`'s `handleCreateExperience` is the one real caller today |
| `onEditInterests`: opens the dialog straight to interests in edit mode | missing | Today, editing interests is a separate page/route — check where "Profile, My interests, Edit" currently points before replacing it |
| Session-expired trigger | missing | No code anywhere currently reads `session.error` (see AU-00 row 19) |

## Done when

- [ ] A single dialog component owns `authView`/`authStep`/`authBusy` (and the email/code/interests sub-state AU-03–AU-05 need), replacing `AuthDialogContext`'s dialog
- [ ] Top bar `Sign in` and `Create account` (`AuthActions.tsx`) open the dialog instead of navigating, matching the entry-points table in the handoff's Overview section
- [ ] A `needAuth(why, then)`-shaped function replaces `openSignInWithCallback`, used by every "action that needs an account" (`handleCreateExperience` today, plus whichever other actions in the reason table actually exist in this app — audit against the handoff's reason list, dropping `plans` per AU-00 row 9)
- [ ] Reason pill renders on Create account when opened via `needAuth`, using the handoff's copy table
- [ ] Close (scrim/Escape/button) works everywhere except the sign-up interests step, where none of the three close it
- [ ] Focus moves into the dialog on open (to the field the per-screen task specifies) and returns to the trigger on close
- [ ] Session-expired variant has a real trigger, per AU-00 row 19
- [ ] Card sizing matches the table in "Dialog frame" at desktop and phone widths
- [ ] `/auth/sign-in`, `/auth/sign-up`, `/auth/sign-up-free`, `/auth/otp-confirmation`, `/auth/interests` redirect into the dialog at the equivalent step, rather than rendering their own page content (AU-00 decision 1)

## Notes

Built in `context/AuthDialogContext.tsx` (the state machine, `needAuth`, every
network call) and `app/shared/components/Auth/AuthDialog/` (the shell and the
three cards it switches between). The five pages are now thin client
components that call the matching context method on mount and redirect to
`/`. `openSignInWithCallback` is kept as a deprecated alias for `needAuth(undefined, then)`
so nothing not yet migrated breaks, but every real call site in the app was
moved onto `needAuth` with a reason key (19 call sites across bookmarks,
bucket lists, joining communities, reservations, moments and reviews).

**Where it departs from the handoff, and why:**
- Built directly on Radix's dialog primitives rather than the generic
  `DialogContent` (see the shell's own doc comment) - needed per-screen sizing
  and per-screen Close/Back, which that shared component doesn't support.
- Google/Apple sign-in is a full-page redirect to the provider and back, not
  an in-memory transition like the prototype's `authGo()`. The "new vs
  returning" branch (AU-00 decisions 13/14) runs from a `sessionStorage` flag
  set right before leaving and consumed once the session lands - see the
  effect's own comment for why a plain "no interests yet" check isn't safe
  (it would re-trap a returning account with no interests in an unclosable
  dialog on every visit).
- `needAuth`'s pending callback only survives for the credentials (email)
  path, which never navigates away. For Google/Apple it cannot survive the
  OAuth round trip in memory; `callbackUrl` returns the reader to the exact
  page they were on instead, which is the closest honest substitute.
- Session-expired's trigger (AU-00 row 19) is a `useEffect` watching
  `session.error === 'RefreshAccessTokenError'`, the one place that error was
  already set but never read.
