# PD-12 Moments

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.onCompose`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the Moments block (lines 222 to 241)
- **Now:** `app/shared/components/Moments/ContextMoments.tsx`, `MomentsMasonry`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Share moment button 50px tall, padding 0 24px 0 20px, 14.5px, weight 600 | Differs | Built: h-12, px-6, 15px bold. |
| Share icon: duotone dashboard-circle-add, 19px | Differs | Built: no icon. |
| Grid: three columns, 4px gap, square cells with 12px radius | Differs | Built: masonry or two columns, gap-3, rounded-2xl. |
| Album badge top right: 24px tall, copy icon, count | Check | Check the built moment card for a badge. |
| Empty: No moments from X yet. Yours could be the first. | Built | Matches the emptyMessage. |

## Done when

- [ ] Share moment button matches the design's size, weight and icon
- [ ] Moments grid is three columns with square cells, and the album badge shows

## Notes

The grid in the design is a fixed three-column layout. Confirm that MomentsMasonry can take that layout, or keep it separate for the drawer.
