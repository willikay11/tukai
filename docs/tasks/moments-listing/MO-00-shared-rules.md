# MO-00 Decide the rules the Moments listing shares

- **Status:** awaiting approval
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, all segments.
- **Now:** /moments: a masonry grid with infinite scroll, no feed mix, no albums, no breaks.

## Inventory

| Rule | Design | Ours | Decision needed |
|---|---|---|---|
| Feed mix | Tweak: Every third (default), Every other, Newest first | Newest first only | Which modes to build, and the default |
| Filters | None on the Moments tab (Pending.md: everyone sees all) | None | Confirm none |
| Breaks show places with an open/closed pill | Yes, from hours | Not on /moments | Leave the pill out (hours are not on the list); see MO-02 |

## Done when

- [ ] Feed mix decided, with its default
- [ ] Filters confirmed as none
- [ ] Open/closed pill rule recorded

## Notes

The Feed mix is a prototype tweak. Its default is recorded in docs/design/PENDING.md as Every third, unchanged.
