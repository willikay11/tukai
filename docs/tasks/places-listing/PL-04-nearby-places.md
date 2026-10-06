# PL-04 Nearby restaurants

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** PL-00, PL-01 (the nearby title follows the selected category)
- **Design:** `docs/design/screens/places-listing.html`, the nearby block: title `'Nearby ' + pcNoun`, subtitle `pcNearSub`, cards from `pcNear`.
- **Now:** Not on /places. Nearby restaurants is on Discover as a rail (`NearbyRestaurants`, 184px cards). The design is a grid.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Title | 'Nearby {noun}', so 'Nearby restaurants' by default | Not on /places |
| Layout | Grid of cards, auto-fill, 280px minimum, 12px and 16px gaps | Rail of 184px square cards |
| Card | Horizontal: 72px square image, then name, category line, distance, open/closed pill | Square photo with the name and fact below |
| Count | Eight, nearest first (`pcNear.slice(0, 8)`) | Ten, unordered |
| Subtitle | 'Sorted by distance from you', or 'Sorted by distance from the city centre' when location is off | None |
| Open/closed pill | Yes, from hours | Not built. Hours are not on the list serializer (see the note on the place card) |

## Done when

- [ ] Title reads 'Nearby {category noun}', with 'restaurants' as the default
- [ ] Cards are laid out in a grid, not a rail, at 280px minimum
- [ ] Each card is horizontal: 72px image, name, category, distance
- [ ] Eight cards, nearest first, when location is shared
- [ ] Subtitle reads 'Sorted by distance from you' when location is shared, with no city name
- [ ] The section is hidden when location is not shared (see the decision below)
- [ ] Open/closed pill left out, as its data is not on the list

## Decisions

1. **Location off.** The design sorts from the city centre. The brief (11.6) allows a distance only with a known origin. Recommended: hide the section when location is off, rather than show an unordered list under a claim it cannot back.
2. **Open/closed pill.** Left out. Hours are not on the place list serializer. It can only come from the detail page, as PlaceOpenStatus does.

## Notes

**PL-00 applied:** no city in the subtitle.

The nearby title follows the category selected in PL-01, so the grid depends on
the category row.
