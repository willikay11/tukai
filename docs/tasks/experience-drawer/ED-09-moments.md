# ED-09 Moments

- **Status:** built
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.onCompose`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the moments block (lines 298 to 314 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`, wiring `ContextMoments`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Share moment button and grid, same pattern as the place drawer's | Built | Wires `ContextMoments` the same way `PlaceDrawer` does, passing `experienceId`/`title` plus the experience's `place` and `hostCommunity` so a moment posted here also surfaces there. |
| Past-experience note above the button, when it has already happened | Built | Shown above the section when `experience.endDate` is in the past. Sits above the whole section rather than literally above the button, since `ContextMoments` owns its own heading and button internally. |

## Done when

- [x] Moments section reuses ContextMoments, the same decision as PD-12
- [x] Past-experience note shows once the experience's end date has passed

## Notes

Pure wiring, as expected: confirmed `ContextMoments` already accepts `experienceId` and `title` the same way it accepts a place's. `ExperienceMoments` (`app/(experiences)/experiences/components/BookingPanel/ExperienceMoments.tsx`) does the same wiring for the booking panel's tab but without a `title`, so the drawer calls `ContextMoments` directly instead of reusing that wrapper.
