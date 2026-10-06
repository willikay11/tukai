# PD-10 My reservations

- **Status:** built, awaiting review
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasMine`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the My reservations block (lines 70 to 99)
- **Now:** `app/shared/components/Places/PlaceDrawer/MyReservations.tsx`

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

- [x] Owner decides whether this section is built now (built on the owner's instruction)
- [x] If built, it shows only when the reader has a booking at this place
- [ ] Edit and cancel use the existing reservation flows (cancel only, see Notes)

## Notes

Built in `MyReservations.tsx` and `my-reservations.ts`.

- Not blocked. The API filters bookings by place: the request is
  `/v1/places/{id}/reservation-profile/{profileId}/booking-requests/`, read by
  `usePlaceBookingRequests`. It returns the signed-in reader's own requests.
- Only live bookings show: requested, accepted or pending, starting from now,
  soonest first. Declined, cancelled and expired ones are left out.
- Edit is left out. There is no change endpoint: the reservation card's own note
  says a change means cancelling and requesting again. A button that sent the
  reader to the reserve page would leave the old booking standing. Cancel
  confirms first, then uses `useCancelPlaceBookingRequest`.
- The drawer's profile request now runs for every reader, not only managers.
  Bookings hang off the profile, and the profile list is public.
- Only the drawer's profile is read, so a place's second profile (a cinema,
  say) has its bookings left out of this section.
- The section has no pill yet. That belongs to PD-02.
