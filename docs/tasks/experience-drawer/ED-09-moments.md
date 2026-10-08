# ED-09 Moments

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.onCompose`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the moments block (lines 298 to 314 of the excerpt)
- **Now:** `app/shared/components/Moments/ContextMoments.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Share moment button and grid, same pattern as the place drawer's | Missing | Not built in the experience drawer. `ContextMoments` exists and takes an experience context already, per PD-12's notes on the place drawer. |
| Past-experience note above the button, when it has already happened | Missing | Not built. |

## Done when

- [ ] Moments section reuses ContextMoments, the same decision as PD-12
- [ ] Past-experience note shows once the experience's end date has passed

## Notes

Wiring, mostly: confirm `ContextMoments` takes an experience id and title the way it takes a place's.
