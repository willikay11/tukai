# MO-05 Empty state

- **Status:** built, pending owner review
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, `mFeedEmpty`.
- **Now:** Built. A plain paragraph under the heading, 'No moments yet. Yours could be the first.'

## Inventory

| Item | Design | Ours |
|---|---|---|
| Empty message | 'No moments yet. Yours could be the first.' (`mEmptyLine`, no search query) | 'No moments yet. Yours could be the first.' |
| Layout | Paragraph under the heading, no illustration | Paragraph under the heading (was NoData with illustration) |

## Done when

- [x] Copy follows the design, with no unbacked claim

## Notes

The design's `mEmptyLine` has a second branch, 'No moments match “{query}”.', for a search query. The Moments tab has no search (PENDING.md: no filters), so only the first branch applies.
