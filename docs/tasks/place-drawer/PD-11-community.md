# PD-11 Community

- **Status:** decision
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasComms`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the Community block (lines 151 to 170)
- **Now:** `app/shared/components/Places/PlaceDrawer/` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading 19px, bold | Missing | Not built. |
| Row: 72px image, name with arrow, hosted line 14px | Missing | Not built. |
| Join button, lime, 44px, only when the reader can join | Missing | Not built. |

## Done when

- [ ] Owner decides which communities are listed
- [ ] If built, rows link to the community and Join shows only when allowed

## Notes

Decision needed: the design lists every community that holds the place. `usePlaceManager` gives only the owning community. Decide whether to list all of them, or the owner only.
