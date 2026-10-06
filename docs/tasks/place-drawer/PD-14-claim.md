# PD-14 Claim

- **Status:** awaiting approval
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.canClaim`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the claim block (lines 258 to 293)
- **Now:** `app/(places)/places/[placeId]/components/ClaimPlacePrompt.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading from claimTitle, 19px bold, then a 14px sub line | Differs | Built: h2 Claim {name}, text-xl, gray-900. |
| Three feature items: Take reservations, Manage it from Control center, Own it as a community | Differs | Built: items differ in title and wording. Check the built items. |
| Feature icons 22px twotone: calendar, chart, user-multiple | Differs | Built: 36px discs with a different icon set. |
| Info box: bg #F3F4F2, radius 12, padding 12px 14px, 14px text | Differs | Built: bg-surface, p-5, 15px text. |
| Start claim button 44px, lime, shadow rgba(176,232,0,.4), store icon | Differs | Built: h-12, no shadow, no icon. |
| Shown only for an unclaimed place | Built | Matches: `isUnclaimed`. |

## Done when

- [ ] Copy, heading and feature items match the design
- [ ] Button matches the design's height, shadow and icon
- [ ] Shown only when the place is unclaimed

## Notes

The claim prompt is also used on the place page. Changes here would change that page too. Decide whether the drawer gets its own copy.
