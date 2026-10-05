# EL-03 Happening near you

- **Status:** awaiting approval
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

- [ ] Heading is sentence case
- [ ] Subtitle follows EL-00
- [ ] The 'All N' toggle expands the row

## Notes

The design's card and sort are read at approval, not from this file.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.
