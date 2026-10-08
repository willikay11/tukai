# ED-01 Drawer header

- **Status:** done
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.isExp`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the sticky header (shared panel header, not inside the excerpt) and the in-body title (line 73 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Sticky header: back, headTitle, share, save, close | Check | Not in the excerpt, same gap as PD-01 on the place drawer. Read the prototype's shared header before building. |
| In-body title, 26px, weight 700, #1F2937, letter-spacing -.5px | Differs | Built: the only title is in the sticky header, truncated. The design repeats it, larger, at the top of About. |
| Share and save discs | Built | Matches the place drawer's header pattern. |

## Done when

- [x] Header checked against the prototype's shared block
- [x] Decide whether the title is repeated in the body, as the design has it, or stays header-only

## Notes

Same header gap as PD-01 on the place drawer: add it to the excerpt before building.

Decided: repeated, matching the design. The sticky header keeps its
truncated copy for the close/share/save row; the body now repeats the full
title (`text-[26px] font-bold`, `text-brand-ink`) above the basics, directly
below the gallery. Built in `app/shared/components/Experiences/ExperienceDrawer/index.tsx`.
