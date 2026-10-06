# PL-09 Discover places: all places in a grid

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** PL-00, PL-01
- **Design:** `docs/design/screens/places-listing.html`, `pcDiscoverTitle` ('Discover {noun}'), `pcDiscoverSub`, the grid.
- **Now:** ListPlaces: a paged grid of places, 12 a page, with a category filter.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Grid of all places | Yes | Yes (ListPlaces) |
| Heading | 'Discover {noun}' | None |
| Count line | 'N places' (PL-00: no city) | None |
| Card | PlaceCard per the design | SinglePlace |
| Paging | Paged | 12 a page, infinite scroll |

## Done when

- [x] Heading and count per PL-00
- [x] Card per PL-11 (uses the rails' `PlaceCard`; PL-11 itself is not yet approved)
- [ ] Paging matches the design

## Notes

Most of this exists. The changes are the heading, the count line and the card. **PL-00 applied:** the count reads 'N places' only.

**Built:**

- Heading 'Discover places' and the count line 'N places' (singular for one) sit above the grid, through the shared `SectionHeader`. The count is the places query's `count`, so it follows the category filter. It is hidden until the first page has loaded.
- The heading also shows over the empty state, so the no-data line sits under it.

**Left open:**

- **Card:** the grid uses `PlaceCard`, the card the place rails use, so tiles match the rails above. It fills its grid cell rather than the rail's 184px. PL-11 (still awaiting approval) may change that card; the grid follows it.
- **Paging:** the design's grid has no pager control, and the inventory says 'Paged'. The 12-a-page infinite scroll is kept, since nothing in the design shows what replaces it. Owner to confirm.
- **Subtitle:** `pcDiscoverSub` copy is not in the design file, so the count line takes the subtitle's place.
- **Grid columns:** the design uses auto-fill at 168px minimum. The existing fixed breakpoints are kept.
