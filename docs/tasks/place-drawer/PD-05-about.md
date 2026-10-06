# PD-05 About

- **Status:** awaiting approval
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.aboutClamp`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the about text and blocks (lines 53 to 68)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceAboutSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Description is 15px, line-height 1.6, #1F2937 | Differs | Built: 17px, leading-relaxed, text-ink. |
| Clamped to 3 lines, with a Show more or Show less toggle | Differs | Built: DescriptionShowMore clamps by character count (240), not lines. |
| Toggle is a 44px row with an arrow icon, text green 15px weight 500 | Differs | Built: the shared component's toggle. Check its look. |
| Structured about blocks: headings, sub-headings, paragraphs and bullets | Missing | The API sends one description string. Needs the API to send blocks, or the design shows plain text. |
| Section has no border above it | Differs | Built: border-t on the facts grid. |

## Done when

- [ ] Description uses the design's type size and line height
- [ ] Clamp is by lines, with the design's toggle
- [ ] Structured blocks are either built from API data or recorded as not possible

## Notes

Structured about blocks need a decision: the API has no field for them. The design has them, so either the field is added or the design falls back to plain text.
