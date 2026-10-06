# PD-04 Photos, directions and rating

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.galCanPrev`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the photo row, the directions row and the rating (lines 26 to 52)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlacePhotoStrip.tsx`, `PlaceAboutSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Photo row 240px tall, 12px radius, 8px gap, 24px bleed | Built | Matches. |
| Arrows 44px white with shadow rgba(1,51,52,.25), 14px in from the edge | Differs | Built: 8px in, shadow rgba(1,51,52,.18). |
| Directions pill 44px, bg #EEF1EF, 1px border #E3E7E5, text 14.5px | Differs | Built: no border, bg-surface, py-2.5, text 15px. |
| Directions pill ends with an arrow-up-right icon | Missing | Built: no trailing icon. |
| Distance shown after a blue dot #60A5FA | Differs | Built: a text dot in the dot token, not the design's blue. |
| Rating shows a bulk star, bold number, blue dot and N reviews | Differs | Built: twotone star, and the rating is a span, not a control. |
| Tapping the rating jumps to Reviews | Missing | Built: no jump. |
| No reviews yet shown when there are none | Differs | Built: row is hidden when averageRating is 0. |

## Done when

- [ ] Arrows and directions pill match the design's size, border and colour
- [ ] The rating is a control that jumps to Reviews
- [ ] The rating row shows No reviews yet when there are none

## Notes

The directions pill and the rating share a row in the design. Keep that layout.
