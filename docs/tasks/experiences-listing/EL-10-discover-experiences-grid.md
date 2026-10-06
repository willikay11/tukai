# EL-10 Discover experiences: all experiences in a grid

- **Status:** built, sort control blocked (see notes)
- **Type:** build
- **Depends on:** EL-00, EL-01
- **Design:** `docs/design/screens/experiences-listing.html`, the 'Discover experiences' block (`exDiscoverSub`: 'N in and around {city}'), the grid, and the sort control ('Sort by').
- **Now:** No grid on /experiences. Only rails.

## Inventory

| Item | Design | Ours |
|---|---|---|
| All-experiences grid | yes | no |
| Count line | 'N in and around {city}' | n/a (EL-00) |
| Sort control | yes (aria 'Sort by') | no |
| Paging | yes (pager, 9 per page for All) | no |

## Done when

- [x] Grid of all published experiences, filtered by the chips (EL-01)
- [ ] Sort control with the design's options
- [x] Paging

## Notes

The sort options are read at approval.

**Blocked: sort control.** The design copy in the repo (`docs/design/screens/experiences-listing.html`) has no 'Sort by' control, and the experiences list endpoint has no `ordering` parameter (`lat`/`long` orders by distance only). The options cannot be read from anything here. Needed from the owner: the option labels, and the API param each one sends. Until then the grid shows the API's default order.

**Built:**

- `DiscoverGrid` (`app/(experiences)/experiences/components/DiscoverGrid/`), placed after Guided tours. Nine per page, the same card as the rails, and a Previous / Next pager that scrolls back to the heading.
- Request is `status: 'published'`, `page_size: 9`, plus the EL-01 category filter. The page resets to 1 when the category changes.
- Not scoped to the location. The count is the whole published total, so the subtitle is 'N experiences' with no city (EL-00).
- Hidden when it loaded empty. EL-12 owns the empty copy.

**Open points:**

- The design's pager markup is not in the repo copy. The pager is ours: Previous / Next with 'Page N of M'.
- The chip row still sits above the rails, not above this grid as the design has it. The rails and the grid share the filter, so moving it would change where the rails' filter is set. Left in place for review.
- The inventory names a city in the subtitle ('N in and around {city}'). Dropped per EL-00.

**EL-00 decision applied:** the subtitle names no city, for now. Use the segment's own count or wording only.
