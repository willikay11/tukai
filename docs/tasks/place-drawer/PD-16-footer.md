# PD-16 Footer

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasFab`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the footer (`pn.hasFab`, prototype around line 6614, not in the excerpt)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceDrawerFooter.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Container padding 12px 24px, top border #EDF0EE | Differs | Built: px-6, pt-4, border-line. |
| Buttons 48px tall, padding 0 24px, 15px, weight 600 | Differs | Built: h-12 and 15px bold. |
| Add review: gradient, twotone star 20px | Differs | Built: StarIcon 16px. Check the variant. |
| Get directions: lime, navigation icon 20px | Differs | Built: lime with the same icon. Check the size and weight. |
| Plan this: icon only and 48px square on a narrow sheet, labelled otherwise | Differs | Built: always labelled. |
| Gap 10px between buttons | Differs | Built: gap-3 (12px). |

## Done when

- [ ] Footer buttons match the design's height, padding, weight and icon sizes
- [ ] Plan this drops its label where the design does

## Notes

The footer is not in the excerpt. Add its markup to `docs/design/screens/place-panel.html` before building. The prototype's footer is the `pn.hasFab` block.
