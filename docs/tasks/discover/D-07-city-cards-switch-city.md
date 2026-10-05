# D-07 City cards switch the city for the whole page

- **Status:** todo
- **Type:** interaction
- **Depends on:** none
- **Design:** grep `onCityChange` and `Showing ` (the `say` call on city click).
- **Now:** `app/(experiences)/components/DiscoverPageContent.tsx` (Discover by city) links each card to `cityExperiencesHref`. `context/LocationContext.tsx` already has `setCity`.

## Done when

- [ ] Clicking a city sets it as the page's city
- [ ] Every rail on Discover follows the new city
- [ ] The see-all city page is still reachable from elsewhere
- [ ] Tests and build pass

## Notes

The design's subtitle says it outright: 'Switch the city and everything above follows'.
