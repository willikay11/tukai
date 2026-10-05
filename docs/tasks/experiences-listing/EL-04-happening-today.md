# EL-04 Happening today

- **Status:** awaiting approval
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

- [ ] Heading is sentence case
- [ ] Subtitle shows the count, with the city only if EL-00 allows it

## Notes

Also removed from Discover (D-01), so it lives here only.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.
