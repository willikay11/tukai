# ED-11 Footer

- **Status:** done
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasFab`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the footer, shared across panel kinds, not in the excerpt
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Design's footer for an experience | Read | Read from the prototype directly (`Tukai Web.dc.html`, `pn.hasFloat`/`pn.hasHostBar`/`pn.canPlan`, around lines 10412-10416 of the exp branch). A guest's footer (`hasFloat`) is a price/date note plus one primary button that opens booking (`flLabel`: "Buy more tickets" / "RSVP" / "Make reservation" / "Join the waiting list"), plus a "Plan this" pill (`canPlan`). The host's own experience gets a different footer (`hasHostBar`, two actions) instead. |
| View experience, full width, lime | Built, now alongside Plan this | The primary button already covered the design's booking action, by sending the reader to where booking actually happens (decisions 1-2, [INVENTORY.md](INVENTORY.md)) instead of duplicating it. The price/date note is already shown higher in the drawer body, not repeated in the footer. |
| Plan this pill | Built | Not booking, and not covered by any of the three INVENTORY decisions, so it is in scope on its own. Added using the same `PlanThisDrawer` the place drawer's footer and the full experience page already use - no new planning logic. |
| Host footer (`hasHostBar`) | Not built | Out of scope: INVENTORY decision 3 keeps the drawer from branching on whether the reader is the experience's host at all (see ED-13). |

## Done when

- [x] The design's experience footer is read from the prototype and added to the excerpt
- [x] Footer decision made against that, not guessed

## Notes

Decided 2026-10-08: booking stays out of the footer, per ED-05/ED-06 and INVENTORY decisions 1-2 - "View experience" still covers it. Plan this was not covered by any existing decision and does not duplicate booking, ticket holding or editing, so it was added to the footer in `ExperienceDrawerFooter.tsx`, next to "View experience", matching `PlaceDrawerFooter`'s pattern.
