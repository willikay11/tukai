# PD-08 Happening now

- **Status:** awaiting approval
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasToday`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the Happening now block (lines 100 to 124)
- **Now:** `app/shared/components/Places/PlaceDrawer/UpcomingExperiences.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading button 19px, bold, with arrow, sub line Ongoing experiences at X | Missing | Not built. |
| Snap row of cards, width min(340px, 80%), 16px radius, #F9FAFB, border #ECEEF1 | Missing | Not built. |
| Card: 56px image, title 15.5px, price and host line | Missing | Not built. |
| Dot pager under the row when there is more than one | Missing | Not built. |
| Section only shows when something is on now | Missing | Not built. |

## Done when

- [ ] Happening now shows experiences on at the place right now, using the same request as Upcoming
- [ ] Section is hidden when nothing is on
- [ ] Card, row and pager match the design

## Notes

Ongoing means start time passed and end time not yet. Check the experience fields for both before building.
