# MO-03 Moment card

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, the card (`m.isCard`): photo, a 'Yours' badge (`m.isNew`), caption with See more and See less (`capToggle`, `capOpen`), byline.
- **Now:** Built. The masonry tile is the shared MomentCard, the card Discover uses.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Photo | Yes | Yes (3:4, as on Discover) |
| 'Yours' badge on the reader's own moments | Yes | Yes |
| Caption, with See more and See less | Yes | See more only, clamped to two lines |
| Byline | Yes | Yes |

## Done when

- [x] Badge shown only on the reader's own moment
- [ ] Caption clamps and toggles, with See more and See less (See more only so far; see below)
- [x] Byline matches the design

## Notes

Verify the masonry tile against the design before changing it. Shared with the Discover card (MomentCard), so keep the two in step.

**Built:**

- The moment card is `MomentCard`, moved from `app/(experiences)/components/MomentCard/` to `app/shared/components/Moments/` so the shared masonry does not import from a feature. Discover's rail uses the same card.
- `MomentsMasonry` takes `tile="card" | "photo"`. The default is `photo`, the bare photo tile the other masonries use. `MomentsView` passes `tile="card"`, so only /moments shows the card.
- The card takes a `className` so the masonry can set its column width. With the card tile, the selected ring sits on the column item.

**Not done:** "See less". `MomentCard` clamps the caption and shows See more, but does not expand it. The design's expanded state is not built.
