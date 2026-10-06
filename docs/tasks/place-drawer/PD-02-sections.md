# PD-02 Section pills

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.secs`
- **Excerpt:** `docs/design/screens/place-panel.html`, section `<nav aria-label="Sections">`, line 8
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceDrawerTabs.tsx`, `tabs.ts`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Sticky strip, padding 12px 24px | Differs | Built: px-6 py-3 at top 76px. Confirm the offset against the built header. |
| Pill height 44px, padding 0 18px 0 12px, 14.5px, weight 500 | Differs | Built: py-2.5, text-[15px]. Set 44px tall and 14.5px. |
| Icon 21px | Differs | Built: 18px. |
| Active pill bg #A7F3D0, text #066349 | Differs | Built: bg-green-200, which is Tailwind's #BBF7D0, not #A7F3D0. Use the design's hex as a token. |
| Inactive pill bg #F3F4F6, text #1F2937 | Differs | Built: bg-surface, text-gray-900. |
| Tab set: About, My reservations (when the reader has one), Experiences (when there are some), Moments, Reviews (N) | Differs | Built: no My reservations tab, and Experiences always shows. Depends on PD-10 and the conditions in the design. |
| Active icon is solid, the rest twotone | Built | Matches. |

## Done when

- [ ] Pills match the design's height, padding, type size and both colour states
- [ ] Icon size is 21px
- [ ] Tab set follows the design's conditions, including My reservations once PD-10 is built

## Notes

The active colour is a hex in the design (#A7F3D0). It is not a token in `tailwind.config.ts`. Decide whether to add one.
