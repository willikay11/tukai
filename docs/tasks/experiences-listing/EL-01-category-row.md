# EL-01 Category row with arrows

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, the category rail (`showCats`, `railCats`, `cats`).
- **Now:** No category row on /experiences.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Chips: All, Arts, Food, Outdoors, Learning | yes | no |
| Arrows when it overflows | yes | n/a |
| Selected chip state | yes | n/a |

## Done when

- [ ] Chips render, selected state matches the design
- [ ] Selection filters the listing rails below
- [ ] Arrows show only when the row overflows

## Notes

Depends on the chip-list decision in EL-00.

**EL-00 decision applied:** the chips come from the API's category list, not
a hardcoded set.

**Open question before building:** the API has no experience-category endpoint.
The experience filters in the app already read the place-category list
(`usePlaceCategories`, used by the search filters). Confirm which group of
that list is the experience category set. The brief's nine discovery
interests (brief 13.1) also still need mapping onto those categories.
