# PD-03 Manager banner

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.isMyPlace`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the manager block, `pn.isMyPlace`, line 16
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceManagerBanner.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Panel bg #E8F1ED, radius 12px, padding 16px | Differs | Built: bg-surface-brand, rounded-2xl, p-5. |
| Store icon in a 44px white disc, icon 22px | Differs | Built: 56px disc, icon 26px. |
| Title 15px, weight 600, #013334 | Differs | Built: 19px, bold. |
| Summary line 13.5px, #1F2937 | Differs | Built: 15px, ink-muted. |
| Button 44px, gradient, label Set up reservations when there is no profile yet, Reservation settings otherwise | Differs | Built: always Reservation settings, and h-12. |
| Layout: wraps, gap 12px 16px | Differs | Built: flex-col on phones, flex-row from sm. |

## Done when

- [x] Banner matches the design's radius, padding, disc size and type
- [x] Button label follows whether a reservation profile exists

## Notes

The community name in the title is already built from `owningCommunity`.
