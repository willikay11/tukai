# D-05 Bucket list rows open a list drawer

- **Status:** todo
- **Type:** interaction
- **Depends on:** D-10 for stacking
- **Design:** grep `open('list'` (four places) and `detail.kind` (the `list` branch).
- **Now:** `app/(experiences)/components/BucketListRow/index.tsx` links to `/bucket-lists/<id>`.

## Done when

- [ ] A click opens a list drawer
- [ ] The card keeps its href
- [ ] Tests and build pass

## Notes

Same decision as D-03 and D-04.
