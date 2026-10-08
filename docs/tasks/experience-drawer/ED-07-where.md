# ED-07 Location and meeting point

- **Status:** built
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.locLink`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the location and meeting point cards (lines 201 to 214 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/ExperienceLocationSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Location card: 72px venue image, name linking to the place, Get directions | Built | 48px image (from `experience.place.photos`), name opens the place drawer via `PlaceLink`, and a `Get directions` pill via `OpenInMapsLink`. Falls back to a plain address line with no image/link when the experience has no tied `place`. |
| Meeting point and time card, same layout, separate from the location | Built | Shows as its own card when `meetingPoint` or `meetingTime` is present. |

## Done when

- [x] Location becomes a card with an image and a link, matching the place drawer's directions pattern
- [x] Meeting point and time shows when the experience has one, separate from the venue

## Notes

The location card links to the place drawer when the experience is tied to one, via `PlaceLink` (the same pattern the place cards elsewhere use). Directions use the shared `OpenInMapsLink`/`mapsHref` helpers rather than the raw `maps.google.com/?q=` link the experience page's own `LocationMeetingSection` still uses - worth folding that page component onto the same helper later, outside this task's scope.
