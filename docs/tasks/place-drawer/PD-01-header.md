# PD-01 Drawer header

- **Status:** awaiting approval
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.headTitle`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the header (`pn.headTitle`, prototype line 4297, not in the excerpt)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceDrawerHeader.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Height 68px, padding 0 16px, bottom border #EDF0EE | Differs | Built: padding 16px 24px, height from content. Set a fixed 68px and 16px sides. |
| Title 24px, weight 700, #1F2937, letter-spacing -0.4px | Differs | Built: 26px, brand-ink (#013334). Use 24px and #1F2937. |
| Back button 44px, bg #F3F4F6, icon #066349 | Differs | Built: bg-surface, icon inherits. Match the design's back button. |
| Share, save and close controls | Check | Not in the excerpt. Read the design's header actions in `Tukai Web.dc.html` before building. |

## Done when

- [x] Header matches the design's height, padding, title size and colour
- [x] Back button matches the design's fill and icon colour
- [x] Share, save and close controls checked against the prototype, and any difference written here

## Built

- Header: `h-[68px]`, `px-4`, `gap-2`, bottom border `border-surface-muted` (#EDF0EE), now on the header itself
- Title: `text-2xl` (24px), `font-bold`, `tracking-[-0.4px]`, `text-gray-800` (Tailwind's gray-800 is #1F2937), `px-1.5`
- Back: grey disc, `text-brand` icon, hover `bg-surface-brand` (#E8F1ED)
- Share and save discs hover to `bg-surface-brand`, as the prototype does
- Drawer: tabs sticky offset `top-[76px]` to `top-[68px]`, and `TAB_OFFSET` 148 to 140, so the scroll spy still lines up

Tests: `app/shared/components/Places/PlaceDrawer` passes (75 tests). Lint and typecheck are clean for the changed files.

## Differences left in place

- **Disc fill:** the design is #F3F4F6, the token `bg-surface` is #F3F4F2. Two units off, token kept.
- **Close icon:** the design is #FE4A49. The token `text-danger` is #E02D3C, which `tailwind.config.ts` says to keep to. Token kept. Needs a decision if the owner wants the lighter red.
- **Save when saved:** the design gives a lime disc with an ink basket. The built `Bookmark` is shared with cards and only colours the icon, so the disc stays grey and the icon goes lime. Changing it means changing `Bookmark`, so it is left for its own task.
- **Save and share icons:** the built basket is 21px, the design's is 20px. `Bookmark` sets its own size.

## Notes

The design's header actions are outside the excerpt. Add them to the excerpt before this task is built.
