# ED-08 Host, going and host community

- **Status:** awaiting approval
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.onOrg`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the host block (lines 268 to 297 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Host or guide row: avatar, verified badge, role label, Message button | Differs | Built: a plain text line, no avatar, no message action. |
| Host community row, with Join when the reader can | Missing | Not built. |
| Going: avatars of other guests, with a plus-N tile | Missing | Not built. |

## Done when

- [ ] Host row shows the avatar, verified badge and a way to message the host
- [ ] Host community and Going show when the design has data for them

## Notes

Messaging the host needs the existing conversation flow; check `SendMessage` before building.
