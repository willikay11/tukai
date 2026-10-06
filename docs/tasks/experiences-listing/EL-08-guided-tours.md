# EL-08 Guided tours

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the `exHasTours` block, heading 'Guided tours', subtitle `exToursSub` ('N tours led by local guides in {city}').
- **Now:** Not on /experiences. Built on Discover.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Tours rail | yes (grid with header arrows) | yes, on Discover and /experiences |
| Subtitle | 'N tours ... in {city}' | 'N tours led by local guides near you' with a location, 'N tours led by local guides' without (API total) |
| See all | none | none on /experiences (no tours see-all page exists) |

## Done when

- [x] Rail of guide_booking experiences on /experiences
- [x] Subtitle follows EL-00 and the API limit

## Notes

Same count (10) and query as the Discover version.

**Deviation:** the design draws a grid with header arrows; the rail is a `CardRail`, as Discover's is and as the done-when asks.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.

**Category chips:** the tours rail follows the chips like the other experience rails do, so it narrows with them.
