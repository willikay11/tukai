# EL-05 Happening tomorrow

- **Status:** built, pending owner review
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

- [x] Matches EL-04 for case and subtitle
- [x] Heading drops the city, unless EL-00 allows it

## Notes

Also removed from Discover (D-02).

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.

**Built with these choices:**

- The heading is sentence case and drops the city: 'Happening tomorrow 6th Oct, 2026'. The date sits after the heading, as in EL-04.
- The subtitle is the API count, as '{n} experiences' ('1 experience' for one). No city.
- The pool is unchanged: the tomorrow query already matches tomorrow's date.
- The row is still `ExperienceRow`. The See all link still carries `city` for its query, and the See all page title ('Happening Tomorrow in {city}', `see-all/config.ts`) is not part of this segment and was left as it is.
