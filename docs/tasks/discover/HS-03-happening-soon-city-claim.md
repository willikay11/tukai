# HS-03 What the Happening soon subtitle can say

- **Status:** decided
- **Type:** decision
- **Depends on:** HS-01
- **Design:** `docs/design/screens/discover-guest-brief.md`, section 11.5 ('Never call broad fallback results nearby') and 11.6 (location rules).
- **Now:** Subtitle 'In {city}, next 14 days', printed over a rail that is not filtered by city.

## Done when

- [ ] The subtitle names only what the results are scoped to
- [ ] Until the API can filter by city, the city name is not printed
- [ ] Blocked follow-up HS-05 is opened for the API city filter

## Decision

Decided from the brief:

- The brief forbids calling broad results nearby (section 11.5). The rail is
  ordered by location, not filtered by city, so "In Nairobi" over it is a
  claim the results do not support.
- Section 11.6 requires an explicit city selector and distances only with a
  known origin. So the subtitle says "Near you" only once the reader has shared
  their location, and says nothing otherwise.
- A real city scope needs the API to filter by city. That is HS-05, blocked.
