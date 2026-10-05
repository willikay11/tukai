# PL-09 Discover places: all places in a grid

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** PL-00, PL-01
- **Design:** `docs/design/screens/places-listing.html`, `pcDiscoverTitle` ('Discover {noun}'), `pcDiscoverSub` ('N places in and around {city}'), the grid.
- **Now:** ListPlaces: paged grid of places, 12 a page, with category filter.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Grid of all places | yes | yes (ListPlaces) |
| Heading | 'Discover {noun}' | none |
| Count line | 'N places in and around {city}' | none |
| Card | PlaceCard per the design | SinglePlace |
| Paging | pcAll | 12 a page, infinite scroll |

## Done when

- [ ] Heading and count per PL-00
- [ ] Card per PL-11
- [ ] Paging matches the design (count of places, page size to confirm)

## Notes

Most of this exists. The changes are the heading, the count line and the card.
