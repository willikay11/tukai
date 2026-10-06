# PD-06 Facts grid

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.details`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the details grid (lines 127 to 138)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceFactsGrid.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Grid: auto-fill, min 260px columns, gap 20px 24px | Differs | Built: sm:2 columns, gap-x-8 gap-y-6. |
| Icon 22px, #1F2937, twotone | Differs | Built: 24px, brand-ink. |
| Label 15px, weight 600, #1F2937 | Differs | Built: 17px, bold, brand-ink. |
| Value 14.5px, #5B6B66 | Differs | Built: 15px, ink-muted. |
| Website and email values are links, 44px tall, underlined on hover | Missing | Built: values are plain text. |
| Copy button 44px, on the phone value | Differs | Built: 18px icon, no 44px hit area. |

## Done when

- [ ] Grid, label and value type match the design
- [ ] Website and email values are links
- [ ] Copy button has a 44px hit area

## Notes

Website and email as links needs `properties` to carry a link type. Check the API before building.
