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

- [ ] Heading and pill sizes match
- [ ] Pills scroll sideways on a phone
- [ ] Pill colours checked against the prototype's view model

## Notes

The built network colours are a deliberate exception in the code comment. Keep them unless the owner says otherwise.
