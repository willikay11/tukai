# PD-06 Who sees the reservation button, and what it says

- **Status:** decision
- **Type:** decision
- **Depends on:** none
- **Design:** Tukai Web.dc.html, grep `rsBtn`: label is 'Reservation settings' once set up, otherwise 'Set up reservations'.
- **Now:** Built only for managers, as a banner with a 'Reservation settings' button (`PlaceManagerBanner`). The design puts a button at the top of the panel for the place's owner.

## Done when

- [ ] Decision on who sees the button: managers only, or everyone
- [ ] Labels match the design's two states
- [ ] Placement matches the design (banner or floating button)

## Notes

The design's `hasFab` suggests a floating button, not a banner. Confirm the placement.
