# ED-07 Location and meeting point

- **Status:** done
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
| Location card: 72px venue image, name as a link, "View on Google Maps" directly beneath it with a pin icon | Differs | The owner's screenshot (2026-10-08) shows the maps link as a quiet text line under the venue name, inside the same card, with no separate button. Built: a lime "Get directions" pill sits to the right of the thumbnail instead, outside the name/address column. |
| Meeting point and time card, same layout | Built | Shown as its own card, labelled "Meeting point and time" with a time next to the name, matching the screenshot. |

## Done when

- [x] "View on Google Maps" (or the app's equivalent copy) sits under the venue name as a quiet link with a pin icon, inside the card, not a separate pill
- [x] The same change applies to the meeting-point card
- [x] Still opens maps the same way (`OpenInMapsLink`/`mapsHref`); this is a layout change, not a new link target

## Notes

Reopened 2026-10-08 against the owner's screenshot. ED-07 was marked built
because the card, the image and the link all exist; what the screenshot
corrects is where the maps link sits and how it reads: inline under the
name, not a separate lime button off to the side. `OpenInMapsLink` already
takes its label as children, so this is a layout change inside
`ExperienceLocationSection.tsx`, not a new helper.

**Built 2026-10-08.** The location card's maps link moved under the venue
name as a quiet text line with a pin icon, as its own anchor rather than
nested inside the name's (two anchors stacked is valid HTML, one inside the
other is not). The meeting-point card never had a maps link of its own to
begin with - `Experience` carries `meetingPoint`/`meetingTime` as free text,
no coordinates distinct from the venue's - so "the same change" there is
that it already has nothing to move.
