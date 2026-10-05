# HS-05 API: filter experiences by city

- **Status:** blocked
- **Type:** blocked
- **Depends on:** HS-03
- **Design:** `docs/design/screens/discover-guest-brief.md`, section 11.6 (explicit city selector).
- **Now:** `GET /experiences/` takes lat and long, not a city.

## Done when

- [ ] Experiences can be filtered by city on the API
- [ ] Discover rails use the selected city, and HS-03 subtitle can name it

## Decision

Blocked on the API. Raise with the backend.
