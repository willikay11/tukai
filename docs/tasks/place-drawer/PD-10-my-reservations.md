# PD-10 My reservations

- **Status:** decision
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasMine`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the My reservations block (lines 70 to 99)
- **Now:** `app/shared/components/Places/PlaceDrawer/` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading 19px, sub line Your upcoming experiences and reservations at X | Missing | Not built. |
| Bordered panel, radius 18, #F9FAFB, with the reader's booking as a card | Missing | Not built. |
| Booking card: 64px image, title, party and time, dashed blue date tile | Missing | Not built. |
| Edit reservation and Cancel reservation actions, 44px each | Missing | Not built. |
| Dot pager when there is more than one booking | Missing | Not built. |

## Done when

- [ ] Owner decides whether this section is built now
- [ ] If built, it shows only when the reader has a booking at this place
- [ ] Edit and cancel use the existing reservation flows

## Notes

Decision needed: the API must return the reader's bookings filtered by place. Check the reservations service for a place filter. If there is none, this is blocked, not missing.
