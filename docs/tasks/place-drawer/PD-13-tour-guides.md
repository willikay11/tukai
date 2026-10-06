# PD-13 Tour guides

- **Status:** blocked
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.guides`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the Tour guides block (lines 242 to 256)
- **Now:** `app/shared/components/Places/PlaceDrawer/` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading button 19px with arrow | Missing | Not built. |
| Row of cards: 48px round avatar, name with verified badge, sub line | Missing | Not built. |
| Follow or Following button, 44px, pressed state | Missing | Not built. |

## Done when

- [ ] API provides the tour guides who lead experiences at the place
- [ ] Card and follow behaviour match the design

## Notes

Blocked on the API. No endpoint lists the guides who lead experiences at a place. Record it with the API team.
