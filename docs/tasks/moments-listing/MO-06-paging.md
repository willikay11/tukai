# MO-06 Paging: View more, not infinite scroll

- **Status:** built, pending owner review
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, the 'View more' button (`mFeedMore`).
- **Now:** Infinite scroll, which loads more as the reader reaches the end.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Load more | 'View more' button | Infinite scroll |

## Done when

- [x] Decision: button, or keep infinite scroll
- [x] Built to the decision

## Notes

The design uses a button. Infinite scroll is kinder on mobile but is not what the design shows. Decide at approval.

**Decision:** button, as the design shows. The feed loads the next page when the reader taps Show more, which appears under the last run only while there is a next page.

**Copy:** the design's label is "Show more", not "View more", so the button uses the design's label.
