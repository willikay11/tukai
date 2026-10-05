# PD-08 Owner variant of the place view

- **Status:** decision
- **Type:** decision
- **Depends on:** PD-06
- **Design:** `docs/design/screens/place-panel.html`. Footer uses `pn.fab2Label`
  (`Make reservation` for an owner of a restaurant). Tabs use `secs`, which
  becomes `hostSecs` for the viewer's own place.
- **Now:** The owner sees the manager banner and the normal tabs and footer.

## Done when

- [ ] Decision recorded: does the owner of a place get the host tabs (About,
      Sales, Tickets created, Invited guests, Moments, Analytics)?
- [ ] Decision recorded: is "Make reservation" the middle button for a
      restaurant owner?
- [ ] If yes to either, the inventory is updated and the change built

## Notes

The host tabs are the experience host's set, applied to a place panel in the
prototype. That may be a prototype shortcut rather than a product decision,
so ask before building it.
