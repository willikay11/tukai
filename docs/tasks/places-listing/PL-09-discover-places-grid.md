# PL-09 Discover places: all places in a grid

- **Status:** awaiting approval
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

- [ ] Heading and count per PL-00
- [ ] Card per PL-11
- [ ] Paging matches the design

## Notes

Most of this exists. The changes are the heading, the count line and the card. **PL-00 applied:** the count reads 'N places' only.
