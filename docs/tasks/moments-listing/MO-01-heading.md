# MO-01 Heading

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/moments-listing.html`, the `h2` 'Moments' at the top of the tab.
- **Now:** `h1` 'Moments' on /moments (MomentsView.tsx).

## Inventory

| Item | Design | Ours |
|---|---|---|
| Heading | 'Moments' | 'Moments' (h1) |
| Subtitle | None | None |

## Done when

- [x] Heading matches the design's wording
- [x] Heading level matches the page structure

## Notes

Small, but it is the first thing on the page, so it is set first.

- The subtitle "Real photos and stories from the Tukai community" was in the code but not in the design. It is removed, which matches the inventory.
- Heading level stays `h1`. /moments is its own route with no other page title, so the heading is the page title. The design's `h2` sits under the prototype's own page title, which this route does not have.
- Styling follows `SectionHeader` (`text-[22px] font-bold leading-tight tracking-[-0.3px] text-brand-ink`), the design's 22px, 700 weight, `#013334` values. Google Sans is not set, as on `SectionHeader`.
