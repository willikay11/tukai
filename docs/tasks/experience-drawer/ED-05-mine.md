# ED-05 My tickets

- **Status:** decided - no change
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasTix`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the ticket-holder block (lines 24 to 177 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Ticket stack with QR, quantity, type, checked-in count | Missing | Not built. The drawer shows nothing about tickets the reader already holds. |
| Share and download a ticket | Missing | Not built. |
| List view for several ticket types, each with its own QR and status | Missing | Not built. |
| Stack or list toggle, and a dot pager | Missing | Not built. |

## Done when

- [x] Owner decides whether ticket holding moves into the drawer
- [x] If built, it reuses whatever QR and ticket-status code the booking confirmation page already has

## Notes

This is most of the complexity in the design's experience view, and it already exists elsewhere. The booking confirmation page and the Reserved tab (`app/(experiences)/experiences/components/ReservedTab/`) already show a reader's tickets. Decide whether the drawer gets its own copy of that, or keeps sending the reader to the full page, which is what the code comment at the top of `index.tsx` already says on purpose.

Decided (2026-10-08, see [INVENTORY.md](INVENTORY.md)): ticket holding stays
out of the drawer. No QR stack, no stack/list toggle, no download/share
controls here.

No code change was needed to satisfy this: the drawer's footer already sends
the reader to the experience's own page via "View experience"
(`app/shared/components/Experiences/ExperienceDrawer/index.tsx`), and that
page is where a held ticket's status lives. A separate "My tickets" entry
point was considered and dropped - the API gives the drawer no field to know
whether the current reader holds a ticket for *this* experience, so a link
shown unconditionally, or gated on a guess, would either mislead non-holders
or need a new per-experience endpoint call, which is exactly the kind of new
surface this decision rules out.
