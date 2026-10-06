# PD-08 Happening now

- **Status:** built, awaiting review
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

- [x] Happening now shows experiences on at the place right now, using the same request as Upcoming
- [x] Section is hidden when nothing is on
- [ ] Card, row and pager match the design (layout and type match; colours use the nearest tokens, see Notes)

## Notes

Ongoing means start time passed and end time not yet. Check the experience fields for both before building.

Built as: `HappeningNow.tsx`, `HappeningNowCard.tsx`, `happening-now.ts` (in `PlaceDrawer/`), reading the drawer's existing experiences request.

- Recurring experiences are never shown as on now. Their `startDate` and `endDate` describe the whole series, so they cannot say whether today's run is on. Showing them needs the occurrence times (slot templates), which is a follow-up.
- The heading is not a button yet. The excerpt does not say where the arrow leads.
- The card border (#ECEEF1) and background (#F9FAFB) have no exact token, so they use `border-line-soft` and `bg-surface`.
