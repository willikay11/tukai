# PD-07 Socials

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.socials`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the socials block (lines 140 to 150)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceSocialPills.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading 19px, weight 700, #1F2937 | Differs | Built: 22px, brand-ink, in the About section. |
| Pills 44px, padding 0 18px 0 14px, 14.5px, weight 500, icon 19px | Differs | Built: py-2.5, 15px semibold, icon 18px. |
| Pills scroll sideways, 24px bleed | Differs | Built: wraps onto more rows. |
| Pill colours come from the view model (`so.bg`, `so.fg`) | Check | Built: hardcoded per network. The design's values are not in the excerpt. Read them from the prototype before changing anything. |

## Done when

- [x] Heading and pill sizes match
- [x] Pills scroll sideways on a phone (single `flex-nowrap` row, `overflow-x-auto`, 24px bleed; not yet checked in a browser)
- [x] Pill colours checked against the prototype's view model

## Colour check

The prototype's `SOC` view model (`Tukai Web.dc.html`, grep `const SOC`) gives
different values from the built palette. Built values are kept, as the code
comment asks.

| Network | Prototype bg / fg | Built bg / fg |
|---|---|---|
| Website | #DBEAFE / #1D4ED8 | #E8EEFF / #2F5BD7 |
| Instagram | #F1E4F4 / #86399E | #F6E9F8 / #A33AB0 |
| Facebook | #DCEBFE / #1259C3 | #E4EEFB / #1A66C9 |
| TikTok | #FFDCE7 / #B80F45 | #FCE7EC / #D62B4E |
| YouTube | #FFE1E1 / #B91C1C | #FDE8E8 / #C62828 |
| X | #E0F2FE / #0369A1 | surface / brand-ink |
| WhatsApp | not in the place panel | #E4F6E8 / #128C4A |

## Notes

The built network colours are a deliberate exception in the code comment. Keep them unless the owner says otherwise.
