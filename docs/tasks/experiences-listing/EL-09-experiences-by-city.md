# EL-09 Experiences by city

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the 'Experiences by city' block, which sits in the tab's outer block, not a direct child.
- **Now:** 'Experiences by City' with 'Browse by destination', cities as CityCard.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Heading case | sentence case | Title Case |
| Subtitle | not read yet | 'Browse by destination' |
| City cards | CityCard | CityCard |

## Done when

- [x] Heading is sentence case
- [x] Subtitle and cards match the design at approval

## Notes

Read the subtitle and card markup at approval.

**Built from the design:** heading 'Experiences by city', subtitle 'Switch the city and this page follows', header arrows paging the rail, 65px cards with the name centred and no count. A card is a toggle: picking it calls `setCity`, and the pressed card is the reader's city.

**Deviations and open points:**
- The see-all card is gone. The design has none, and the header arrows page every city. The `/experiences/see-all?type=cities` page still exists and is still linked from Discover.
- The subtitle promises the page follows the city, but the rails query by coordinates (`lat`/`long`), not city. Changing the city updates the header and the 'Happening tomorrow' see-all link, not the rails. Mapping a city to coordinates is needed before the other rails follow it.
- The pressed style (`ring-2 ring-primary`) is ours. The design's markup gives `aria-pressed` but no visible selected state.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.
