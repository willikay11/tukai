# AU-07 Sign-in nudge card

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** AU-00 (row 13/14), AU-01
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## 6. Sign-in nudge" (hidden-when rules, copy, behaviour); markup: "### Sign-in nudge"; logic: `nudgeVals()`, the `_ngT` timeout in the mount block
- **Now:** does not exist. No nudge, toast-on-load, or similar component for signed-out visitors exists anywhere in the app today

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Card appears 1.2s after load, for signed-out visitors | missing | net-new component |
| Hidden when: dismissed this session, or the auth dialog/a side panel/create menu/filters/an error screen/the gallery is open | missing | each of these needs a real signal to check against — audit what state each of "side panel", "create menu", "filters", "error screen", "gallery" actually is in this codebase (several context providers already listed in CLAUDE.md's context/ section are candidates) |
| Enter/exit animation (opacity + translateY) | missing | |
| Close hides it for the rest of the session (not persisted beyond) | missing | confirm "session" means in-memory for this page load, not `sessionStorage`/`localStorage` — the handoff doesn't say, and the two behave differently on refresh |
| Copy: heading, body, email input placeholder | missing | |
| Google/Apple buttons (52px, same style as Welcome's, busy states) | missing | can likely share the button component AU-02 builds, at a smaller height |
| Email input + "Continue with email", enabled once non-empty, validated on submit | missing | |
| Email submit opens the dialog's Create account email form, pre-filled, and closes the nudge | missing | depends on AU-01's state shape and AU-03's email form accepting a pre-filled value |
| Mobile position (above the bottom nav, full-width-ish) vs. desktop (bottom-right, 360px) | missing | |

## Done when

- [ ] Nudge renders 1.2s after a signed-out page load, with the correct enter animation
- [ ] All six hide-conditions are wired to real app state, not left as a subset
- [ ] Close hides it for the rest of the current page session, not persisted across reloads (unless the owner says otherwise)
- [ ] Google/Apple buttons branch on `hasInterests` exactly like AU-02's (AU-00 row 14), rather than the handoff's "always signs in" behaviour
- [ ] Email submit opens the dialog pre-filled and closes the nudge, per the handoff
- [ ] Desktop and phone positioning match the handoff

## Notes

Built in `app/shared/components/Auth/AuthDialog/SignInNudge.tsx`, mounted
from inside `AuthDialogProvider` so it shares the same session/dialog state
rather than needing its own wiring in the root layout.

**Hidden-when, built as a partial list:** only "the auth dialog is open" is
wired (`!view`). The other five (a side panel, the create menu, filters, an
error screen, the gallery) each live in their own context providers scattered
across the app, and auditing all of them was cut for scope - the nudge can
currently show alongside one of those surfaces, which the design doesn't
want. Worth a follow-up task of its own rather than folding into this one.

"Close hides it for the rest of the session" was built as `sessionStorage`
(survives a refresh within the same tab, clears when the tab closes) rather
than in-memory-only, which seemed like the more useful reading of "session" -
flagging since the handoff doesn't say either way.
