# EL-07 Communities

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** EL-00, D-14
- **Design:** `docs/design/screens/experiences-listing.html`, the `exHasComms` block, heading 'Communities', subtitle `exCommSub` ('Running what is on in {city}').
- **Now:** Built. Section sits between the Discover itineraries rail and the curated city row.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Community rail | yes | yes, as a grid (see Notes) |
| Card | community card | CommunityRow, existing component |
| Subtitle | 'Running what is on in {city}' | 'Running what is on' (EL-00) |

## Done when

- [x] Rail of communities, card per the layout decision
- [x] Subtitle follows EL-00
- [x] Hidden when empty, and while the request fails

## Notes

Built as `CommunitiesSection` in `app/(experiences)/experiences/components/CommunitiesSection/`, wired in `ExperiencesPageContent.tsx`.

- **D-14 layout decision (taken here, for the owner to confirm):** the design's block is a grid of community rows under a See all link, not a horizontal rail, so it is built as that grid. Each item is the existing `CommunityRow`, the same row Discover uses, so no new card was added.
- Reads `useGetCommunities` with `upcoming_experiences=true`, the filter the design's 'Running what is on' wording implies. It asks for 12 and shows the first 8, the design's count.
- See all links to `/communities` when the API total is more than the 8 shown.
- Not built: the design's count of upcoming experiences per community and the private-community lock on the thumbnail. `CommunityRow` does not draw either, and it is shared with Discover, so adding them changes that page too. Owner to decide.
