# MO-07 Open a moment

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, the card's click target (`m.onOpen`).
- **Now:** Moments open in a drawer on the listing and on the Discover, community, place and experience pages.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Open a moment | In a drawer or viewer | Listing: drawer, on every width (no side pane). Discover, community, place and experience pages: drawer over the page |

## Done when

- [x] Drawers lifted by the owner
- [x] Cards on Discover, community, place and experience pages open the moment in a drawer over the page
- [x] The /moments listing opens moments in the drawer, and /moments?momentId=... still deep-links to a moment

## Notes

Built after the owner lifted the deferral. The shared drawer is `MomentDrawer` in `app/shared/components/Moments/`. `MomentDetail`, `MomentComments` and `FlagReasonPicker` moved there from the moments route, since the drawer uses them from several features.
