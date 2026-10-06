# PL-08 Places by city

- **Status:** built, pending owner review
- **Type:** decision
- **Depends on:** PL-03
- **Design:** `docs/design/screens/places-listing.html`, `pcCitySecs`: one section per city, titled from `cs.title`.
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Per-city place rails | Yes | Yes (`PlacesByCity`) |

## Done when

- [x] Decide whether it duplicates PL-03 or replaces it

## Decision

**Neither.** PL-08 is a separate segment from PL-03, and PL-03 stays.

- PL-03 (Discover by city) is a rail of city cards. Picking a card filters the grid below. It shows cities, not places.
- PL-08 is a rail of places per city. It shows places, not cities, and does not filter anything.

The design shows both, so keeping both matches it. Placement follows the design: the city place rails sit after Popular places and before the place grid.

## Built

- `PlacesByCity` in `app/(places)/places/components/` reads the city categories the way PL-03 does (`usePlaceCategories` with `group: 'cities'`, the cache is shared). It takes the three busiest cities and renders one `CityPlacesRail` for each.
- `CityPlacesRail` renders a `CardRail` titled 'Places in {city}' over `PlaceCard`s. It is hidden when the city loaded empty, and shows its heading while loading. It uses the new `usePlacesInCity` hook in `app/shared/hooks/usePlaces.tsx`, which sends the city as the `category` filter, the same filter the grid uses.
- `PlacesByCity.test.tsx` and `CityPlacesRail.test.tsx` cover the heading, the busiest-first order, non-city categories being ignored, the rail count cap, the hidden empty state, and the loading heading.

## Notes

**Open, for the owner:**

- The design's section copy (`cs.title`, `cs.sub`) is computed by the prototype's script, which is not in the repo. The heading is 'Places in {city}', chosen here. The subtitle is left out. Confirm both at approval.
- Three cities, one request each. The design does not say how many city sections show. Confirm the count.
- The rails are not paged past the first 10 places per city, and have no 'See all' link.
- The design's arrows are the rail's own paging arrows, which `CardRail` provides.
- The rails ignore the category and city filters, so they show each city's places whatever the grid is filtering on. Confirm this at approval.
