# PL-01 Category row with arrows

- **Status:** awaiting approval
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

- [ ] Chips follow PL-00
- [ ] Selection filters the rails and grid below
- [ ] Arrows show only when the row overflows

## Notes

**PL-00 applied:** the chips come from the API's categories, with the brief's relevant groups first and the full list under Filters.

**Open question, as EL-01:** confirm which category set the API serves for places.
