# PL-04 Nearby places

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** PL-00, PL-01 (the nearby title follows the selected category)
- **Design:** `docs/design/screens/places-listing.html`, the nearby block: title `'Nearby ' + pcNoun`, subtitle `pcNearSub`, cards from `pcNear`.
- **Now:** `NearbyPlaces` on /places: a grid of the eight places nearest the reader, titled 'Nearby {noun}' after the selected category.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Title | 'Nearby {noun}', so 'Nearby restaurants' by default | 'Nearby {noun}', from the selected category |
| Layout | Grid of cards, auto-fill, 280px minimum, 12px and 16px gaps | Grid, same |
| Card | Horizontal: 72px square image, then name, category line, distance, open/closed pill | `NearbyPlaceCard`: horizontal, without the pill |
| Count | Eight, nearest first (`pcNear.slice(0, 8)`) | Eight, nearest first |
| Subtitle | 'Sorted by distance from you', or 'Sorted by distance from the city centre' when location is off | 'Sorted by distance from you' (hidden when location is off) |
| Open/closed pill | Yes, from hours | Left out (decision 2) |

## Done when

- [x] Title reads 'Nearby {category noun}', with 'restaurants' as the default
- [x] Cards are laid out in a grid, not a rail, at 280px minimum
- [x] Each card is horizontal: 72px image, name, category, distance
- [x] Eight cards, nearest first, when location is shared
- [x] Subtitle reads 'Sorted by distance from you' when location is shared, with no city name
- [x] The section is hidden when location is not shared (see the decision below)
- [x] Open/closed pill left out, as its data is not on the list

## Decisions

1. **Location off.** The design sorts from the city centre. The brief (11.6) allows a distance only with a known origin. Recommended: hide the section when location is off, rather than show an unordered list under a claim it cannot back.
2. **Open/closed pill.** Left out. Hours are not on the place list serializer. It can only come from the detail page, as PlaceOpenStatus does.

## Notes

**PL-00 applied:** no city in the subtitle.

The nearby title follows the category selected in PL-01, so the grid depends on
the category row.

**Built:**

- `NearbyPlaces` in `app/(places)/places/components/` is a grid under the title `Nearby {noun}`. It uses the 280px minimum, with 16px and 12px gaps.
- The noun is the selected category's name, lowercased. With no category selected (All), it is 'restaurants'.
- The places are of the selected category too, through a new `categoryId` argument on `useNearbyPlaces`. Otherwise the title would name one category over places of another.
- The places are sorted by distance from the reader, and the nearest eight are shown. A place with no coordinates is shown without a distance line.
- `NearbyPlaceCard` is the horizontal card: a 72px photo, the name, the kind, and the distance in Kms. It opens in the drawer like the other place cards.
- Hidden when location is off, as decided, and when nothing is nearby.
- `NearbyPlaces.test.tsx` covers the title and noun, the category filter, sorting, the eight-card cut, the hidden states and the loading state. `NearbyPlaceCard.test.tsx` covers the card.

**Choices made in the build (owner to confirm):**

- **All selected shows 'Nearby restaurants' over every category.** This follows the default in the brief. But with All, the places are not filtered, so the list can hold places that are not restaurants. The fix is either to filter to restaurants, or to use a neutral noun such as 'places' when All is selected.
- **The noun is the category name lowercased, with no plural.** API names such as 'Cafe' give 'Nearby cafe'. The design's copy needs plural names, or a pluraliser.
- **Distance is whole kilometres**, as on the experience cards (`haversineKm`). A place under half a kilometre away shows '0 Kms'.
- The loading state is eight pulsing tiles under the heading.
