# D-09 "Exploring {city}" banner when away from home

- **Status:** decision
- **Type:** content
- **Depends on:** D-07
- **Design:** grep `Exploring {{ cityAwayName }}`.
- **Now:** Not built. `context/LocationContext.tsx` has no home-city field.

## Done when

- [ ] A banner shows when the page city differs from home
- [ ] It has a Change city button that returns home
- [ ] Tests and build pass

## Notes

Decision needed: what counts as home city? Options: the city the user signed up in, the city from their location at first visit, or a value they choose once.
