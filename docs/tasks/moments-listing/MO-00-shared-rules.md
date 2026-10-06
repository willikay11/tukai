# MO-00 Decide the rules the Moments listing shares

- **Status:** decided
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, all segments.
- **Now:** /moments: a masonry grid with infinite scroll, no feed mix, no albums, no breaks.

## Inventory

| Rule | Design | Ours | Decision |
|---|---|---|---|
| Feed mix | Tweak: Every third (default), Every other, Newest first | Newest first only | Go with the design: all three modes, default Every third |
| Filters | None on the Moments tab (Pending.md: everyone sees all) | None | Go with the design: none |
| Breaks show places with an open/closed pill | Yes, from hours | Not on /moments | Go with the design: show the pill. Its data is not on the list (see MO-08) |

## Done when

- [x] Feed mix decided, with its default
- [x] Filters confirmed as none
- [x] Open/closed pill rule recorded

## Notes

The Feed mix is a prototype tweak. Its default is recorded in docs/design/PENDING.md as Every third, unchanged.

**Consequence of the pill decision:** the pill needs open or closed status for each place in a break. The list endpoint does not return hours, so the decision cannot be built as it stands. MO-08 stays blocked until one of the options there is chosen.
