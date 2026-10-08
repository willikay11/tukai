# ED-10 Cancellation and report

- **Status:** awaiting approval
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.cancelLine`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the cancellation policy and report row (lines 315 to 320 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Cancellation policy heading and line | Missing | Not built. |
| Report this experience action | Missing | Not built. |

## Done when

- [ ] Cancellation policy shows when the API sends one
- [ ] Report action opens the existing report flow, if there is one

## Notes

Check whether the API sends a cancellation policy field before building; if not this is blocked, not missing.
