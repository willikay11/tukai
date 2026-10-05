# D-04 Community rows open a community drawer

- **Status:** todo
- **Type:** interaction
- **Depends on:** D-10 for stacking
- **Design:** grep `open('comm'` (five places) and `detail.kind` (the `comm` branch).
- **Now:** `app/(experiences)/components/CommunityRow/index.tsx` links to `communityPath`.

## Done when

- [ ] A click opens a community drawer
- [ ] The card keeps its href
- [ ] Tests and build pass

## Notes

Depends on whether D-03 is decided as a drawer. Keep the two consistent.
