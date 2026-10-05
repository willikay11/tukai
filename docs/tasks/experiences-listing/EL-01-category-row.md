# EL-01 Category row with arrows

- **Status:** built, pending owner review (group choice below)
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

- [x] Chips render, selected state matches the design
- [x] Selection filters the listing rails below
- [x] Arrows show only when the row overflows

## Notes

Depends on the chip-list decision in EL-00.

**EL-00 decision applied:** the chips come from the API's category list, not
a hardcoded set.

**Open question before building:** the API has no experience-category endpoint.
The experience filters in the app already read the place-category list
(`usePlaceCategories`, used by the search filters). Confirm which group of
that list is the experience category set. The brief's nine discovery
interests (brief 13.1) also still need mapping onto those categories.

**Built with a stand-in:** the chips read place categories in the `interests`
group (`CATEGORY_CHIP_GROUP` in `ExperiencesPageContent.tsx`). The `cities`
group is not used for chips. The owner still needs to confirm this group, and
that its ids are accepted by the experiences `category` filter. The staging API
could not be reached from the build environment, so neither was checked.

**Other choices made in the build:**

- The chip row sits at the top of the All view, above the rails, to match the
  done-when line "filters the listing rails below". The design places it above
  the Discover grid instead, which EL-10 may need to move.
- The category filter applies to Featured, Happening near you, Today, Tomorrow
  and the curated city row. "Experiences by City" is not filtered, since it lists
  places' cities, not experiences.
- The selection is local state, not the URL, because `?category=` already
  names the tab.
- Chip icons from the design are not shown, since the inventory does not list them.
