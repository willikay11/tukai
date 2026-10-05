# EL-05 Happening tomorrow

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the `exHasTmrw` block, same pattern as EL-04.
- **Now:** 'Happening Tomorrow in {city}' row.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Heading case | sentence case | Title Case |
| Heading includes city | 'Happening tomorrow' | 'in {city}' |
| Subtitle | '{n} in {city}' | the date only |

## Done when

- [ ] Matches EL-04 for case and subtitle
- [ ] Heading drops the city, unless EL-00 allows it

## Notes

Also removed from Discover (D-02).

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.
