# ED-06 Ticket prices

- **Status:** decision
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasOcc`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the ticket prices block (lines 178 to 200 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Date picker for experiences with more than one occurrence | Missing | Not built. |
| A pill per ticket type with its price, tapping it opens booking | Missing | Built shows one summary price line, not a picker. |
| Tapping a ticket type starts booking | Missing | Built sends the reader to the full page for all of booking. |

## Done when

- [ ] Owner decides whether ticket selection moves into the drawer
- [ ] If built, tapping a ticket type opens the existing booking flow rather than a new one

## Notes

`TicketModal` and `BookingPanel` already build this UI on the experience page. The question is whether it is worth a second entry point in the drawer, given the drawer's own footer already links to that page.
