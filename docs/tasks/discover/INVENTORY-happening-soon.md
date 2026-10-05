# Inventory: Happening soon, against the design

Source: `docs/design/screens/discover-happening-soon.html`. Built against:
`app/(experiences)/components/DiscoverPageContent.tsx` (section),
`app/(experiences)/components/ExperienceCard/` (card).

For review before any code.

| # | Design item | Built? | Notes |
|---|---|---|---|
| 1 | Heading: "Happening soon" | built | |
| 2 | Subtitle: "In {city}, next 14 days" | differs | The API cannot filter by city, so the rail is location-ordered. See HS-03 |
| 3 | Back and next arrows, disabled at each end | built | `CardRail`. Hidden where nothing overflows, a rule the design does not state |
| 4 | Card: cover photo, square | built | `ExperienceCard`, 184px |
| 5 | Card: save (basket) opens the list picker | built | Verify, D-12 |
| 6 | Card: flag pill (Free, Recurring, Sold out) | built | Icons match the design's mapping |
| 7 | Card: host line (organising community) | built | Falls back to the host's name where there is no community, a case the design does not show |
| 8 | Card: title | built | |
| 9 | Card: when (day, time range) | built | `formatCardDateTime` |
| 10 | Card: price line ("Free" or "KES x/person") | built | |
| 11 | Card click opens the experience summary drawer | built | `ExperienceCard` calls `openExperience` on a plain click and keeps its href for modifier clicks. D-03 is done. Check the drawer's View experience footer under D-03 |
| 12 | See all card with three fanned photos | differs | The design sets the Experiences tab in-app. We link to `/experiences`. See D-13 |
| 13 | Pool: the first nine experiences, in fixture order | differs | We filter to 14 days, sort by start, and show nine. See HS-02 |
| 14 | Empty state | differs | The design has no empty copy. We hide the section. See HS-02 |

## Summary

Built: 10 of 14 (item 11 corrected from missing; D-03 is done). Missing: 0.
Differs: 4 (items 2, 7, 12, 13), plus item 14.

Open for the owner, not yet decided: the design also has a grid variant
(`showExpGrid`) beside the rail (`showExpRail`), and the arrows sit behind a
`tabAll` guard. Neither is an item above. Item 14 also needs rechecking: the
design does hide the section, via `showExpSection`, so it is not a gap in the design.
