# PL-11 Place card, to the brief

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/places-listing.html`, the place card in each Places rail (`PlaceCard`).
- **Now:** PlaceCard. Its fact line falls back to 'No reviews yet'.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Photo, name, locality, category, Save | Yes | Yes. Category only as a fallback |
| One useful fact: an activity, then hours or an attribute | Yes | Rating, then category |
| No 'No reviews yet' on cards | Yes | No |

## Done when

- [ ] The fact line never says 'No reviews yet'
- [ ] The fact prefers a current or upcoming activity, then hours or an attribute, then category
- [ ] Category is shown on the card

## Notes

Shared by every Places rail. Build once, before the rails.
