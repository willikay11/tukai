# PL-02 Promoted places

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `showPromoted` on the Places tab (`pcPromo`).
- **Now:** The Places tab shows a rail of promoted places, in the place of the hero.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail of promoted places | Yes | Rail of featured places (`PromotedPlaces`) |
| Heading | 'Promoted places' | 'Promoted places', as on Discover |

## Done when

- [x] Rail uses the place list's featured flag
- [x] Hero removed (PL-00)

## Notes

**PL-00 applied:** the hero is removed and this rail takes its place. Read as hero removal, rail still built. Confirm at approval.

**Built:**

- `PromotedPlaces` in `app/(places)/places/components/` renders a `CardRail` of `PlaceCard`s from `useFeaturedPlaces`, the same query and card Discover uses for its Promoted places rail. It is hidden when nothing is featured.
- `FeaturedPlaceSection` is deleted. Nothing else used it.
- `PromotedPlaces.test.tsx` covers the rail, the hidden empty state, and the loading heading.

**Open, for the owner:**

- `showPromoted` and `pcPromo` are not in `docs/design/screens/places-listing.html`, so the rail's position on the page follows the hero's position (above the grid). The prototype (`Tukai Web.dc.html`) would confirm the order.
- Featured places are filtered from the first 50 places, since there is no `featured` query param. A featured place beyond the first 50 will not show.
