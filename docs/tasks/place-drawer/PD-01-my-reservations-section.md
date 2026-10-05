# PD-01 Show the reader's own reservations at this place

- **Status:** todo
- **Type:** content
- **Depends on:** none
- **Design:** Tukai Web.dc.html, grep `My reservations`. The block sits in the place panel with `{{ pn.mineCur.title }}`, party, time, Edit and Cancel.
- **Now:** Not built. `usePlaceBookingRequests` and `cancelPlaceBookingRequest` already exist (`app/shared/hooks/usePlaces.tsx`).

## Done when

- [ ] Signed-in readers with a booking here see it in the drawer
- [ ] Edit and Cancel match the design's labels
- [ ] Signed-out readers see nothing of it
- [ ] Tests and build pass

## Notes

Buildable from existing hooks. Edit has no endpoint of its own in the API spec: confirm what Edit does before building it.
