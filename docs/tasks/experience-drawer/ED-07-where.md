# ED-07 Location and meeting point

- **Status:** awaiting approval
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.locLink`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the location and meeting point cards (lines 201 to 214 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Location card: 72px venue image, name linking to the place, Get directions | Differs | Built: a plain city line with a pin icon, no image, no link to the place. |
| Meeting point and time card, same layout, separate from the location | Missing | Not built. |

## Done when

- [ ] Location becomes a card with an image and a link, matching the place drawer's directions pattern
- [ ] Meeting point and time shows when the experience has one, separate from the venue

## Notes

The location card links to the place drawer when the experience is tied to one, the same pattern PlaceLink already uses elsewhere.
