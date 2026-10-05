# PL-00 Decide the rules every Places segment shares

- **Status:** decided
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/screens/places-listing.html`, all segments.
- **Now:** Places tab: a hero banner (FeaturedPlaceSection) over a paged grid (ListPlaces). The design: rails.

## Inventory

| Rule | Design | Ours | Decision |
|---|---|---|---|
| City in subtitles | 'in {city}' in pcExpSub, pcDiscoverSub, pcEmptyLine | none | No city, for now (same as EL-00) |
| Category chips | Seven hardcoded: All, Studio, Gallery, Garden, Cafe, Museum, Nature | Category filter in ListPlaces | API categories, relevant groups first, full list under Filters (brief 13.1) |
| Hero banner | None on the Places tab | FeaturedPlaceSection | Removed. The Promoted places rail (PL-02) takes its place |

## Done when

- [x] Each rule has a recorded decision
- [x] Segments below are updated to match

## Notes

Read 'Hero banner - remove' as removing the hero only. The rail is still built. Confirm at approval.
