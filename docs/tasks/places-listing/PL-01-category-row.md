# PL-01 Category row with arrows

- **Status:** built, pending owner review (group choice below)
- **Type:** build
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, the Places category rail (`data-cat-rail`, 'Place categories').
- **Now:** The filter exists inside ListPlaces. No row with arrows.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Chips | Seven hardcoded | Filter, source to confirm (PL-00: API categories) |
| Arrows when overflowing | Yes | n/a |
| Selected state | Yes | To read |

## Done when

- [x] Chips follow PL-00
- [x] Selection filters the rails and grid below
- [x] Arrows show only when the row overflows

## Notes

**PL-00 applied:** the chips come from the API's categories, with the brief's relevant groups first and the full list under Filters.

**Open question, as EL-01:** confirm which category set the API serves for places.

**Built:**

- The places row is `CategoryChipRow`, moved from the experiences feature to `app/shared/components/Filters/` (it is now used on two pages). The places filter in `components/ui/pageFilters.tsx` renders it in place of `ScrollFilters`.
- Chips: All first, then every non-city place category. Interest-group categories lead, then the rest by places count. The chip set is read from the same `usePlaceCategories` query as before.
- The selection stays in `SelectedCategoryContext` (which ListPlaces reads) and in the `?category=` URL param.

**Choices made in the build (owner to confirm):**

- Default is All, not the top category by places count as before. The design's row starts with All.
- The full list is shown in the row, scrolled with the arrows. The 'Filters' entry point from PL-00 is not built, since nothing in the design or the inventory names one.
- Chip icons from the design are not shown, to match EL-01.
- `ScrollFilters` has no remaining callers. It is left in place for the owner to delete or keep.
- The 'interests' group is the 'relevant' group used for ordering. The staging API was not checked from here.
