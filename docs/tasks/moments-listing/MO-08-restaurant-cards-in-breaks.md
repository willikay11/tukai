# MO-08 Place cards inside the break rails

- **Status:** blocked
- **Type:** blocked
- **Depends on:** MO-02
- **Design:** `docs/design/screens/moments-listing.html`, the cards in each break (`n.isShut`, `n.isSoon`).
- **Now:** Not on /moments.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Place card with open/closed pill | Yes | Blocked: hours are not on the list |

## Done when

- [ ] Blocked until the list serializer carries hours

## Notes

Same blocker as the Places listing (PL-04, D-18). The card is built without the pill, or not at all, once MO-02 is decided.

**MO-00 applied:** the pill is wanted (go with the design). It is still blocked: the place list does not return hours. Options at approval:

1. The list endpoint returns hours (the API change that removes the block).
2. One reservation-profile request per card, for the restaurant and cinema places only (costly on a rail of eight).
3. Show the pill on the place detail page only, and leave the break cards without it.
