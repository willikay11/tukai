# EL-08 Guided tours

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the `exHasTours` block, heading 'Guided tours', subtitle `exToursSub` ('N tours led by local guides in {city}').
- **Now:** Not on /experiences. Built on Discover.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Tours rail | yes | yes, on Discover only |
| Subtitle | 'N tours ... in {city}' | 'near you' or total (API limit) |

## Done when

- [ ] Rail of guide_booking experiences on /experiences
- [ ] Subtitle follows EL-00 and the API limit

## Notes

Same count and city limit as the Discover version.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.
