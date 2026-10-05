# PL-11 Place card, to the brief

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/places-listing.html`, the place card in each rail (`PlaceCard` markup in the Places rails).
- **Now:** PlaceCard. Its fact line falls back to 'No reviews yet'.

## Inventory

| Item | Brief 13.1 | Ours |
|---|---|---|
| Photo, name, locality, category, Save | yes | yes, category only as a fallback |
| One useful fact: activity, then hours or attribute | yes | rating, then category |
| No 'No reviews yet' on cards | yes | no |

## Done when

- [x] The fact line never says 'No reviews yet'
- [ ] The fact prefers a current or upcoming activity, then hours or an attribute, then category
- [x] Category is shown on the card

## Notes

Shared by every Places rail. Build once, before the rails.
