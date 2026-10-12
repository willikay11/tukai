# ED-11 Footer

- **Status:** decision
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasFab`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the footer, shared across panel kinds, not in the excerpt
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`, `ExperienceDrawerFooter.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Price and date, as text, to the left of the buttons | Missing | The owner's screenshot (2026-10-08) shows "From KES 2,700 / person" and "Tomorrow, 6:00 PM to 9:00 PM" stacked on the left of the footer. Built: no text in the footer at all, just the two buttons. |
| Primary button: "Make reservation", a ticket icon, lime | Differs | Built: "View experience", no icon, lime, linking to the bare experience page. The app already has this exact label and copy pattern elsewhere: `BookingPanel`'s own tab reads "Make Reservation", and a `/reserve` route already exists (`experiencePath(experience) + '/reserve'`). |
| Plan this pill | Built | Matches. |
| Host's own footer (`hasHostBar`) | Not built | Unchanged, still out of scope under INVENTORY decision 3. |

## Done when

- [ ] Owner confirms: does the primary button read "Make reservation" and go straight to `/reserve`, or stay "View experience" with different copy added around it
- [ ] If confirmed, the footer shows the price and date as text, reusing the same helpers the drawer body already calls (`experiencePriceLine`, `formatCardDateTime`)
- [ ] Primary button copy and destination match whatever the owner confirms, consistently with `BookingPanel`'s own "Make Reservation" wording elsewhere in the app

## Notes

Reopened 2026-10-08 against the owner's screenshot, which asked for the
drawer's look and functionality to match it. This does not reverse
decision 2 (ticket selection itself stays on the page, not in the drawer):
it corrects the footer's copy and destination to the more specific place the
app already sends a reader to book, `/reserve`, rather than the bare
experience page, and matches the wording the rest of the app already uses
("Make Reservation" in `BookingPanel`, in the unused `ExperienceActions`
component, and in the place drawer's own `ReservationPanel`). The original
prototype's footer label is dynamic (`flLabel`: "Buy more tickets" for a
reader who already holds one, "RSVP" for a free experience, "Make
reservation" otherwise, "Join the waiting list" when sold out), worth
deciding now whether the drawer matches that, or keeps one fixed label.
