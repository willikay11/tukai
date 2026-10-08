# ED-04 About

- **Status:** done
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.aboutClamp`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the about block (lines 92 to 101 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| 15px text, 3-line clamp, Show more or Show less | Differs | Built: DescriptionShowMore clamps by character count. |
| Structured about blocks: headings and bullets | Missing | Same gap as PD-05 on the place drawer. The API sends one description string. |
| Run-by, when and city lines sit above the description | Built | Matches, though the type sizes were not checked against the design's basics row. |

## Done when

- [x] Clamp and toggle match the design, or the shared component's difference is recorded
- [x] Structured blocks are either built from API data or recorded as not possible

## Notes

Same decision as PD-05: structured blocks need the API, or the design falls back to plain text.

Built in `app/shared/components/Experiences/ExperienceDrawer/index.tsx`: a
local `AboutClamp` replaces `DescriptionShowMore` for this drawer. It clamps
with CSS `line-clamp-3` against the plain-text description rather than
slicing to a character count, so it always reads as 3 full lines rather than
cutting mid-sentence; the 240-character threshold that decides whether to
show the toggle at all is kept from the existing convention. Text colour
matches the design's `#1F2937` (`text-brand-ink`), not
`DescriptionShowMore`'s `text-gray-700`.

Structured About blocks (headings, bullets) are not built: the API sends one
description string, same gap as PD-05. Recorded as not possible without an
API change, rather than faking structure by parsing the plain string.
