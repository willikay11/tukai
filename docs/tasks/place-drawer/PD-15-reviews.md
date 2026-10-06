# PD-15 Reviews

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasReviews`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the reviews block (lines 294 to 333)
- **Now:** `app/(places)/places/components/reviews`, `PlaceReviewsSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading button 19px with arrow, plus rating and N reviews on the right | Differs | Built: SectionShell title Reviews with a Rating component. |
| Review row: 48px avatar, 15.5px author, meta with star and date | Differs | Built: shared Reviews component. Check its markup. |
| More button 44px top right | Check | Check the shared component. |
| Body 15px, line-height 1.55 | Check | Check the shared component. |
| Photo strip, 150px squares, 12px radius | Check | Check the shared component. |
| Like and comment buttons with counts, 44px | Check | Check the shared component. |
| Rows full bleed with a border above each | Check | Check the shared component. |
| Empty: No reviews yet. If you have been, yours would be the first. | Check | Check the shared component's empty state. |

## Done when

- [ ] Review rows match the design, or the shared component is changed for both places
- [ ] Empty state uses the design's copy

## Notes

The shared Reviews component is used on the place page too. Changing its layout changes that page. Decide whether the drawer gets its own row.
