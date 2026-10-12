# ED-06 Ticket prices

- **Status:** done
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
| Date picker for experiences with more than one occurrence | Not built | Still correct: no route or query-param convention exists to deep-link into a given occurrence. Unchanged by the owner's screenshots, which show a single-occurrence experience. |
| Each ticket as its own card: bold label, price, a quiet note line, an arrow-up-right icon top right | Differs | The owner's screenshot (2026-10-08) shows three cards, "Adults / KES 4,500 / Per person", "Kids under 12 / KES 2,700 / With a paying adult", "Buy now, pay later / KES 1,350 today / Rest due a week before", each a rounded rectangle with the label bold and black, the price and note beneath it in two different weights, and a small arrow icon in the corner. Built: one pill per ticket with just the price (bold) and the ticket name (quiet), inline on one line, no note line and no icon. |
| Tapping a ticket type opens booking | Built, per decision 2 | Still the right call: every card is a plain `Link` to the experience page, the same place the footer sends the reader. The screenshot does not show what tapping a card does, so this is unchanged. |

## Done when

- [x] Each ticket renders as a card (label, price, note, corner icon), not a single-line pill
- [x] A ticket with no note (most of them, today) still reads correctly with the note line absent
- [x] Tapping a card still opens the existing booking flow, unchanged from what is built

## Notes

Reopened 2026-10-08 against the owner's screenshots: the functional call in
decision 2 (open the existing flow rather than a picker) still stands, this
is a shape-only correction.

Checked `types/ticket.ts`: `Ticket` carries no note, description, minimum-age
or deposit field, nothing that would produce "With a paying adult" or "Rest
due a week before". "Per person" is the one note that could be derived (it is
already implied by `getTicketBuyerPrice`'s per-unit price), but the other two
read as real ticket-level business rules (a child ticket tied to an adult
one, a deposit plan), not something to fake from existing fields. Build the
card shape and the price now; leave the note line empty, or build it only for
"Per person", until the API carries the rest.

**Built 2026-10-08.** `ExperienceTicketsSection` now renders a rounded card
per ticket type (bold label, price, corner arrow icon), with a `ticketNote`
helper that always returns `undefined` today - deliberately, rather than
guessing at "Per person" or the other two business rules the API does not
carry. The note line renders only when that helper returns something, so it
is a one-line change once that data exists.
