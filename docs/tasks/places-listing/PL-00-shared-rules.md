# PL-00 Decide the rules every Places segment shares

- **Status:** awaiting approval
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/screens/places-listing.html`, all segments.
- **Now:** Places tab: a hero banner (FeaturedPlaceSection) over a paged grid (ListPlaces). The design: rails.

## Inventory

| Rule | Design | Ours | Decision needed |
|---|---|---|---|
| City in subtitles | 'in {city}' in pcExpSub, pcDiscoverSub, pcEmptyLine | none | Same rule as EL-00: no city, for now |
| Category chips | seven hardcoded: All, Studio, Gallery, Garden, Cafe, Museum, Nature | category filter in ListPlaces | Hardcoded, or the API categories (brief 13.1 asks for relevant groups, with the full list under Filters) |
| Hero banner | none on the Places tab | FeaturedPlaceSection | Replace with the Promoted places rail, as on Discover, or keep the hero |

## Done when

- [ ] Each rule has a recorded decision
- [ ] Segments below are updated to match

## Notes

Decide these first. Same pattern as EL-00.
