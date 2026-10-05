# PL-04 Nearby places

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcNearTitle` ('Nearby {noun}'), `pcNearSub`, sorted by distance.
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail sorted by distance | Yes | Rail sorted by distance (`NearbyPlaces`) |
| Subtitle | 'Sorted by distance from you' or 'from the city centre' | 'Sorted by distance from you' |

## Done when

- [x] Rail sorted by distance, when location is shared
- [x] No 'city centre' claim unless the origin is known

## Notes

**PL-00 applied:** no city in the subtitle. Distances need coordinates and a known origin (brief 11.6); without them the rail is hidden or unordered.

**Built:**

- `NearbyPlaces` in `app/(places)/places/components/` renders a `CardRail` titled 'Nearby places' over `PlaceCard`s, placed between Discover by city (PL-03) and the place grid.
- `useNearbyPlaces` in `app/shared/hooks/usePlaces.tsx` sends the reader's `lat`/`long` to the places list, which the API orders by distance from them. The query runs only once both are known.
- The rail is sorted again on the client by distance from the reader's coordinates, so its order does not rest on the API alone. A place without coordinates sorts last.
- The rail is hidden until the reader has a location and is using it (`isUsingLocation`), and when it loads empty. Stepping off location hides it without losing the coordinates.
- `NearbyPlaces.test.tsx` covers the heading and subtitle, nearest-first ordering, places without coordinates, the query being gated on an origin, the hidden states, and the loading heading.

**Open, for the owner:**

- The design shows a 'Use my location' button in the rail header while location is off, and a rail that is still shown. This build hides the rail instead, as PL-04 allows ('hidden or unordered'). Building the button would mean showing the rail without an origin, so it is left for the owner to decide.
- The design's cards show a distance line. `PlaceCard` does not take one yet; that belongs with PL-11 (the place card).
- The rail ignores the category and city filters, so it always shows the nearest places overall. Confirm this at approval.
- The rail requests 10 places from the API. A place beyond the nearest 10 will not show.
