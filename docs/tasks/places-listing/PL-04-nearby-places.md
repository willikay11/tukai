# PL-04 Nearby places

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcNearTitle` ('Nearby {noun}'), `pcNearSub`, sorted by distance.
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail sorted by distance | Yes | No |
| Subtitle | 'Sorted by distance from you' or 'from the city centre' | None |

## Done when

- [ ] Rail sorted by distance, when location is shared
- [ ] No 'city centre' claim unless the origin is known

## Notes

**PL-00 applied:** no city in the subtitle. Distances need coordinates and a known origin (brief 11.6); without them the rail is hidden or unordered.
