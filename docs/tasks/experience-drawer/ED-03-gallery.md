# ED-03 Photo gallery

- **Status:** done
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.galCanPrev`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the gallery row (same pattern as the place drawer's, line 70 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Horizontal scrolling photo row, 240px tall, each photo its own width, arrows at the edges | Differs | Built: one fixed 4:3 hero image, no strip, no arrows. |
| Photo count beyond the cover | Missing | Built only ever shows `coverPhotoUrl`. |

## Done when

- [x] Gallery reuses PlacePhotoStrip rather than a new component
- [x] Falls back to the single cover image when there is only one photo

## Notes

PlacePhotoStrip already exists and takes a plain array of URLs. This is mostly wiring, not new UI.

Built in `app/shared/components/Experiences/ExperienceDrawer/index.tsx`: a
`galleryPhotos` helper filters to `mediaType === 'photo'`, sorts the cover
first (same ordering as `Experiences/Single`), and hands the URL array to
`PlacePhotoStrip`. One photo renders as a single 240px-tall tile with both
arrows suppressed - no separate fallback path needed, since the strip
already does this for any length.
