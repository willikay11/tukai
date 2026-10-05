# PL-05 Places with experiences

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcExpTitle`, `pcExpSub` ('Coming up in {city}, each run by a community').
- **Now:** Only on Discover.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail of places with upcoming experiences | Yes | Discover only |
| Subtitle | Names the city | Per PL-00 |

## Done when

- [x] Rail on Places, subtitle per PL-00

## Notes

**PL-00 applied:** no city in the subtitle. Same data as the Discover version (`has_experiences`).

## Built

- `PlacesWithExperiences` in `app/(places)/places/components/` renders a `CardRail` titled 'Places with experiences' over `PlaceCard`s. It sits between Nearby places (PL-04) and the place grid.
- It reuses `usePlacesWithExperiences` from `app/shared/hooks/usePlaces.tsx`, the hook Discover uses, so both show the same places.
- The subtitle is the Discover copy, 'Each one shows what is happening inside'. The design's 'Coming up in {city}' is dropped per PL-00.
- The rail hides when it loads empty, and shows its heading while loading.
- `PlacesWithExperiences.test.tsx` covers the heading and subtitle, the places, the hidden empty state, and the loading heading.

## Open, for the owner

- The design's cards are experiences (title, host, time, price), with paging arrows. This build follows the inventory and shows place cards in a rail, as Discover does. Confirm at approval.
- The rail requests 10 places, the hook's default. Discover requests 30 for its grid.
- Position: between Nearby places and the place grid, following the design's block order.
