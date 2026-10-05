# PL-04 Nearby places

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcNearTitle` ('Nearby {noun}'), `pcNearSub`, sorted by distance.
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail sorted by distance | yes | no |
| Subtitle | 'Sorted by distance from you' or 'from the city centre' | none |

## Done when

- [ ] Rail sorted by distance from the reader, when location is shared
- [ ] No 'city centre' claim unless the origin is known (brief 11.6)

## Notes

Distances need coordinates and a known origin (brief 11.6). Without them the rail is hidden or unordered.
