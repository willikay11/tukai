# PL-06 Popular places

- **Status:** awaiting approval
- **Type:** decision
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcPopTitle` ('Popular {noun}'), `pcPopSub` ('Ranked by reviews from people who have been').
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail ranked by reviews | yes | no |
| Sort | by reviews | the API's `sort_by=popular` is listed in services/place.ts, but a Discover comment says it was verified to be ignored |

## Done when

- [ ] Check whether `sort_by=popular` changes the order, before building
- [ ] Decision on the rail if it does not

## Notes

The two sources disagree. Verify first, then decide. Do not show a 'popular' order the API does not sort by.
