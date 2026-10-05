# D-17 Guided tours subtitle: per-city count

- **Status:** blocked
- **Type:** blocked
- **Depends on:** none
- **Design:** grep `exToursSub`: '{n} tours led by local guides in {city}'.
- **Now:** `app/(experiences)/components/DiscoverPageContent.tsx` (`toursSubtitle`): says 'near you' with a total, or names no number.

## Done when

- [ ] The subtitle shows a per-city count

## Notes

Blocked on the API. The experiences list has no city filter and no per-city count. Needs `city` on `GET /experiences/`, or a count field.
