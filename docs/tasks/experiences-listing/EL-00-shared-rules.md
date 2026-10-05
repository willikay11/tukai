# EL-00 Decide the rules every segment shares

- **Status:** awaiting approval
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/screens/experiences-listing.html`, all segments. Subtitles say 'in {city}' in seven places (`exNearSub`, `exTodaySub`, `exTmrwSub`, `exCommSub`, `exToursSub`, `exFeatSub`, `exDiscoverSub`).
- **Now:** Subtitles name the city. Category list is in the view logic, not the API.

## Inventory

| Rule | Design | Ours | Decision needed |
|---|---|---|---|
| City in subtitles | 'in {city}' | 'Within 25 km of {city}' or the city | Name only what results are scoped to (brief 11.5, 11.6; HS-03 rule). The API cannot filter by city (HS-05) |
| Category chips | All, Arts, Food, Outdoors, Learning, hardcoded | none | Hardcoded list, or the API's experience categories |
| Account tabs | none in the listing | Saved, Reserved, Hosting | Keep on /experiences, or move to You and Plans (brief 7.2) |

## Done when

- [ ] Each rule above has a recorded decision
- [ ] Segments below are updated to match

## Notes

Decide these first. Several segment tasks depend on them.
