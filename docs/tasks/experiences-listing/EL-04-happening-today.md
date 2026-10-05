# EL-04 Happening today

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the `exHasToday` block, heading 'Happening today' with the date, subtitle `exTodaySub`.
- **Now:** 'Happening Today' row with the date.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Heading case | sentence case | Title Case |
| Subtitle | '{n} in {city}' | the date only |
| Pool | today only (`dayOff === 0`) | today's date query |

## Done when

- [x] Heading is sentence case
- [x] Subtitle shows the count, with the city only if EL-00 allows it

## Notes

Also removed from Discover (D-01), so it lives here only.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.

**Built with these choices:**

- The subtitle is the API count, as '{n} experiences' ('1 experience' for one). No city.
- The date stays, now after the heading ('Happening today 5th Oct, 2026'), since the design keeps it beside the heading. `ExperienceRow` takes a plain string title, so the design's muted date span is not reproduced. Doing that means widening `SectionHeader` and `ExperienceRow` to take a node.
- The pool is unchanged: the today query already matches `dayOff === 0`.
- The row is still `ExperienceRow`, so the rail, See all link and card are as before. The `See all` page title ('Happening Today', `see-all/config.ts`) is not part of this segment and was left as it is.
