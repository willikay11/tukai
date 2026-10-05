# EL-10 Discover experiences: all experiences in a grid

- **Status:** awaiting approval
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

- [ ] Grid of all published experiences, filtered by the chips (EL-01)
- [ ] Sort control with the design's options
- [ ] Paging

## Notes

The sort options are read at approval.
