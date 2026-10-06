# MO-03 Moment card

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, the card (`m.isCard`): photo, a 'Yours' badge (`m.isNew`), caption with See more and See less (`capToggle`, `capOpen`), byline.
- **Now:** Built, with See more and See less. The masonry tile is the shared MomentCard, the card Discover uses.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Photo | Yes | Yes (3:4, as on Discover) |
| 'Yours' badge on the reader's own moments | Yes | Yes |
| Caption, with See more and See less | Yes | Yes, clamped to two lines |
| Byline | Yes | Yes |

## Done when

- [x] Badge shown only on the reader's own moment
- [x] Caption clamps and toggles, with See more and See less
- [x] Byline matches the design

## Notes

Verify the masonry tile against the design before changing it. Shared with the Discover card (MomentCard), so keep the two in step.

**Built:**

- The moment card is `MomentCard`, moved from `app/(experiences)/components/MomentCard/` to `app/shared/components/Moments/` so the shared masonry does not import from a feature. Discover's rail uses the same card.
- `MomentsMasonry` takes `tile="card" | "photo"`. The default is `photo`, the bare photo tile the other masonries use. `MomentsView` passes `tile="card"`, so only /moments shows the card.
- The card takes a `className` so the masonry can set its column width. With the card tile, the selected ring sits on the column item.

**Built since:**

- The card's root is now an `article`. Only the photo is the button that opens the moment, as in the design. The caption and its toggle sit outside it, so See more and See less are buttons of their own and do not open the moment.
- Behaviour change on Discover's rail too: tapping the caption or byline no longer opens the moment. Only the photo does.
- "See less": an open caption is shown in full, with See less inline after it. The caption is measured only while it is closed, so an open caption keeps its See less.

**Not done:** nothing in the design's card is outstanding.
