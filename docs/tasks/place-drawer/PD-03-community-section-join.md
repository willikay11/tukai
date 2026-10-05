# PD-03 Community section with host name and Join

- **Status:** decision
- **Type:** decision
- **Depends on:** none
- **Design:** Tukai Web.dc.html, grep `hostedLine` and the 'Community' heading in the place panel: community name, 'N past experiences hosted', Join.
- **Now:** Not built. An earlier placeholder section ('No community is linked') was removed from the drawer.

## Done when

- [ ] Decision on the 'N past experiences hosted' line recorded
- [ ] Community name and Join built
- [ ] Join changes to Joined once pressed, as the design shows

## Notes

The design's count comes from generated sample data (`hsh(c.id) % 70`). The API has no such count, so the line needs a real source or should be left out.
