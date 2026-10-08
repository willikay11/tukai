# ED-06 Ticket prices

- **Status:** built
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasOcc`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the ticket prices block (lines 178 to 200 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/ExperienceTicketsSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Date picker for experiences with more than one occurrence | Not built | There is no reserve route or query-param convention for a given occurrence/ticket to deep-link into; adding one is bigger than this task and overlaps `BookingPanel`'s own date handling. |
| A pill per ticket type with its price, tapping it opens booking | Built | One pill per ticket in `experience.tickets`, priced with the shared `getTicketBuyerPrice`. |
| Tapping a ticket type starts booking | Built, per decision 2 | Every pill is a plain `Link` to the experience page - the same destination the footer already uses - rather than a second ticket picker inside the drawer. |

## Done when

- [x] Owner decides whether ticket selection moves into the drawer - INVENTORY's recorded decision (2026-10-08): it does not; the drawer opens the existing flow instead.
- [x] If built, tapping a ticket type opens the existing booking flow rather than a new one

## Notes

`TicketModal` and `BookingPanel` already build this UI on the experience page. Ticket selection itself is local React state inside `BookingPanel`, with no URL/query-param hook to deep-link into - so a pill can only send the reader to the page as a whole, not to a given ticket type pre-selected.
