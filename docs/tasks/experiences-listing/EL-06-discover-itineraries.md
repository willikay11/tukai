# EL-06 Discover itineraries

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the `itHas` block, heading 'Discover itineraries', subtitle `itSub` ('Several places in one plan...').
- **Now:** Built. Rail sits between 'Happening tomorrow' and the curated city row, as in the design.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Itinerary rail | yes | yes |
| Itinerary card | its own card (12KB block) | rebuilt from the block |

## Done when

- [x] Rail of published itineraries
- [x] Card rebuilt to the design, not reinstated from memory
- [x] Hidden when empty

## Notes

Built from the `itHas` block: `ItineraryCard` in `app/(experiences)/components/ItineraryCard/`, rail in `ExperiencesPageContent.tsx`.

- Rail reads `experience_type=itinerary` and `status=published`, 8 per page. It is hidden while empty and when the request fails. A See all card follows when the API total is 10 or more, linking to the existing `see-all?type=itineraries`.
- Card: square photo, save control top-right, up to three non-cover photos fanned bottom-right as stops. Body reads host, title, `from KES n` (or `Free`), then the date range.
- Card width is 184px, the same as the Happening rows. The block does not state `itinCardW`, so this is an assumption.
- Subtitle is 'Several places in one plan'. The rest of `itSub` is not in the repo, so check the end of the copy against the prototype.
- Not built: the design's inline expand (`itAll` grid with See less) and the title arrow. Both point at the see-all page instead. The owner should decide whether the expand is wanted.
