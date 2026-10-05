# Inventory: place view, against the design

Source: `docs/design/screens/place-panel.html` (the `pn.isPlace` block of
`Tukai Web.dc.html`). Built against: `app/shared/components/Places/PlaceDrawer/`.

For review before any code. Nothing here is built from this list yet.

| # | Design item | Built? | Notes |
|---|---|---|---|
| 1 | Section tabs: About, Experiences, Moments, Reviews (n) | built | `PlaceDrawerTabs`. Owner variant differs, see PD-08 |
| 2 | Owner banner: place title, opening hours line, settings button | built | `PlaceManagerBanner`. Shown to managers only, see PD-06 |
| 3 | Photo gallery with scroll-left and scroll-right arrows | built | `PlacePhotoStrip`. Photos sized at an assumed width, see notes in the component |
| 4 | Location pill: city and distance, opens maps | built | `PlaceAboutSection` |
| 5 | Rating and review count | built | `PlaceAboutSection` |
| 6 | About text, with headings (h4) and list items (li) | differs | We render one paragraph. The design's about blocks carry headings and lists. Decide whether the API description holds them |
| 7 | Show more / Show less | built | Verify the label flips, PD-07 |
| 8 | My reservations: heading, party, time, date, edit and cancel | missing | PD-01 |
| 9 | Happening now: heading, ongoing experiences, empty state | missing | PD-02 |
| 10 | Details: phone link with copy, plain values | built | `PlaceFactsGrid` |
| 11 | Socials | built | `PlaceSocialPills` |
| 12 | Community: name, hosted line, Join | missing | PD-03 |
| 13 | Upcoming experiences: week arrows, day pills with dots, list, empty line | built | `UpcomingExperiences`. Verify the dots against the design |
| 14 | Moments: heading, Share a moment, album count, empty line | built, minus count | Count is PD-05 |
| 15 | Tour guides: heading, guide rows, a button per guide | missing | PD-04, blocked on the API |
| 16 | Claim: heading, reservation line, Start claim | built | `ClaimPlacePrompt`. Verify the copy and the button |
| 17 | Reviews: rating, review rows with photos, like, comment, more menu, empty line | built | Existing `Reviews` component. Verify the more menu and photos |
| 18 | Footer: Add review, then Get directions or Make reservation, then Plan this | differs | We always show Get directions. The design shows Make reservation to the owner of a restaurant, see PD-08 |

## Summary

Built: 11 of 18. Missing: 4 (items 8, 9, 12, 15). Differs: 3 (items 6, 18, and
the owner variant in item 1).
