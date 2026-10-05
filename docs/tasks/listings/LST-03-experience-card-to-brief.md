# LST-03 Experience card, to brief section 14.1

- **Status:** todo
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/discover-guest-brief.md`, section 14.1 (cards).
- **Now:** `app/(experiences)/components/ExperienceCard/index.tsx`: square 1:1 photo. Badges: Free, Recurring, Sold out.

## Done when

- [ ] Photo is 4:3, not square
- [ ] Key facts stay outside the image: date or next occurrence, locality, host, price with its unit, Save
- [ ] Badges limited to Free, Recurring, Sold out, Cancelled, with Cancelled added
- [ ] Tests and build pass

## Notes

The brief says 4:3. Our square ratio came from the prototype. This is a deliberate change of the card, so the grid's row heights need checking on every rail that uses it.
