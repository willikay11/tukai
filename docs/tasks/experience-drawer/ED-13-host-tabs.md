# ED-13 Host dashboard tabs

- **Status:** decision
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hoTabSales`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the host's own tabs (lines 10 to 69 of the excerpt): Sales, Created (tickets and discounts), Guests, Moments, Analytics, About
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Sales: ticket sales total, withdraw, stats, buyer search and list with QR check-in | Missing | Not built in the drawer. |
| Created: ticket types and discount codes, each with stats and a redemptions link | Missing | Not built in the drawer. |
| Guests: an invited-guests tab | Missing | Not built in the drawer. |
| Analytics: key metrics | Missing | Not built in the drawer. |
| About, in host mode: the same guest-facing content as ED-04 through ED-10 | Missing | Not built in the drawer. |

## Done when

- [ ] Owner decides whether a host's own experience opens into this dashboard, or something smaller
- [ ] If something smaller, it follows the place drawer's pattern: a manager banner on About, linking out, rather than a full tab set

## Notes

This is the largest section in the design and the furthest from anything built. `app/(experiences)/experiences/components/HostingCard/` and the Control center route group already carry some of this (sales, guests). Recommend the drawer gets a banner like PlaceManagerBanner's, pointing a host to Control center, rather than cloning Sales, Created, Guests and Analytics into the drawer. Needs the owner's call before any task is written for it.
