# ED-11 Footer

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasFab`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the footer, shared across panel kinds, not in the excerpt
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Design's footer for an experience | Check | Not extracted. The place drawer's footer (PD-16) was read from the prototype directly; the experience one has not been. |
| View experience, full width, lime | Built | What is built now, which may be a deliberate simplification rather than a gap. |

## Done when

- [ ] The design's experience footer is read from the prototype and added to the excerpt
- [ ] Footer decision made against that, not guessed

## Notes

Do this once ED-05 and ED-06 are decided: if ticket holding and booking stay on the full page, a single View experience button may already be the right footer, and this task closes with no change.
