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
| 11 | Card click opens the experience summary drawer | missing | D-03. Decided: summary drawer with a View experience footer |
| 12 | See all card with three fanned photos | differs | The design sets the Experiences tab in-app. We link to `/experiences`. See D-13 |
| 13 | Pool: the first nine experiences, in fixture order | differs | We filter to 14 days, sort by start, and show nine. See HS-02 |
| 14 | Empty state | differs | The design has no empty copy. We hide the section. See HS-02 |

## Summary

Built: 9 of 14. Missing: 1 (item 11, D-03). Differs: 4 (items 2, 7, 12, 13), plus
item 14 which is a gap in the design itself.
