# EL-03 Happening near you

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the `exHasNear` block, heading 'Happening near you', subtitle `nearSub`, and the 'All N' toggle (`nearAll`).
- **Now:** 'Happening Near You' row, subtitle 'Within 25 km of {city}', first ten.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Heading case | sentence case | Title Case |
| Subtitle | 'In {city}' | 'Within 25 km of {city}' |
| 'All N' toggle | yes | no |
| Card | flags and host per exVm | ExperienceCard |

## Done when

- [x] Heading is sentence case
- [x] Subtitle follows EL-00
- [x] The 'All N' toggle expands the row

## Notes

The design's card and sort are read at approval, not from this file.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.

**Built with these choices:**

- The subtitle is 'Within 25 km', from `NEAR_ME_RADIUS_KM`. The API decides the radius itself, so the copy is the only thing the app sets.
- The toggle is in the header, not a card at the end of the rail. Collapsed it reads 'All N', where N is the API total. Expanded it reads 'See less' and the rail becomes a grid. The design's rail card says 'See all'; the inventory's 'All N' was followed here.
- The full list is only fetched once the toggle is pressed, with `page_size` set to the API total. Nothing extra is read on load.
- The 'See all' link to `/experiences/see-all?type=near-me` is gone from this row, since the toggle takes its place. The see-all page itself is kept.
- The card is unchanged (`SingleExperience`, not `ExperienceCard`). The inventory's flags-and-host card is not in the done-when, so it was left for the card review.
