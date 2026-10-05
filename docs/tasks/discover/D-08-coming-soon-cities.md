# D-08 Cities that are not live say "coming soon"

- **Status:** blocked
- **Type:** interaction
- **Depends on:** D-07
- **Design:** grep `coming soon` and the `c.live` check in the city `onClick`.
- **Now:** No live flag exists. `services/api.json` has no city-status field.

## Done when

- [ ] Non-live cities show a coming-soon state and do not switch the city
- [ ] Live cities behave as D-07

## Notes

Blocked on the API. Either the API adds a live flag, or the list of live cities is hard-coded. Decide which.
