# PL-03 Discover by city (places)

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, the first block, 'Discover by city' (`tabPlaces`).
- **Now:** The Places tab shows a rail of city cards. Picking one narrows the place list to that city.

## Inventory

| Item | Design | Ours |
|---|---|---|
| City cards rail | Yes | Rail of city cards (`DiscoverByCity`) |
| Card | CityCard banner | `CityCard` banner, the same one Discover uses |

## Done when

- [x] City rail on Places, each city linking to its places

## Built

- `DiscoverByCity` in `app/(places)/places/components/` renders a `CardRail` titled 'Discover by city' with the design's subtitle. It reads the city categories the way Discover does (`usePlaceCategories` with `group: 'cities'`, most places first, ten at most) and hides when none load.
- A card narrows the place list through `SelectedCategoryContext`, the same filter the header search uses. Picking the selected city again clears it. Nothing changes the reader's location.
- `DiscoverByCity.test.tsx` covers the heading, the ordering, non-city categories, picking and clearing a city, the pressed state, the hidden empty state, and the loading heading.

## Notes

**Placement:** the rail sits between the promoted rail (PL-02) and the place grid. The design's HTML puts cities first in the Places view, but the brief also places them under 'Explore further' (module 7). Confirm the position at approval.

**Link versus filter:** the brief says 'each city linking to its places'. This builds it as an in-page filter, not a route, because `/places` has no city URL parameter. A `/places?city=` link would need the page to read that parameter first. Confirm at approval.
