# HS-03 Decide what the subtitle can honestly say

- **Status:** decision
- **Type:** decision
- **Depends on:** HS-01
- **Design:** Subtitle 'In {city}, next 14 days' (`expSub`).
- **Now:** We print the home city, but the rail is ordered by location, not by city.

## Done when

- [ ] Decision recorded: say the city and filter by it (needs an API city filter), or say 'near you' (as Guided tours does)
- [ ] If 'near you', the subtitle changes and the inventory is updated

## Notes

The experiences list takes lat and long, not a city. Same limit as D-17.
