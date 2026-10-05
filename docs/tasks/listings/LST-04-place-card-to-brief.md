# LST-04 Place card, to brief section 13.1

- **Status:** todo
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/discover-guest-brief.md`, section 13.1 (place cards).
- **Now:** `app/(experiences)/components/PlaceCard/`. Its fact line falls back to 'No reviews yet'.

## Done when

- [ ] The fact line never says 'No reviews yet' on a card; the rating is omitted until real reviews exist
- [ ] The fact prefers a current or upcoming activity, then verified hours or an attribute, then category
- [ ] Category is shown on the card

## Notes

'No reviews yet' belongs on the detail page, per the brief. A fact from upcoming activities needs the place's experiences, which the card does not fetch yet.
