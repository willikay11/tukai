# ED-08 Host, going and host community

- **Status:** partially built
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.onOrg`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the host block (lines 268 to 297 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/ExperienceHostSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Host or guide row: avatar, verified badge, role label, Message button | Built | Ports `ExperienceOrganiser`'s pattern into the drawer: avatar, badge, `experienceHostedCount`, and `SendMessage`, hidden on the host's own experience. |
| Host community row, with Join when the reader can | Differs | The row (photo, title, "Host community") is built; Join is not - no Join component exists anywhere in the app to reuse, and building one is outside this task. |
| Going: avatars of other guests, with a plus-N tile | Blocked, not missing | `Experience.guests` carries only `{ id, email, dateCreated, status }` - an invite list, not a roster with pictures. There is nothing to render avatars of until the API sends guest user objects. |

## Done when

- [x] Host row shows the avatar, verified badge and a way to message the host
- [x] Host community and Going show when the design has data for them - Going stays blocked on API data; see notes.

## Notes

Messaging the host reuses the existing `SendMessage` dialog, the same way `ExperienceOrganiser` does on the experience page itself.

The badge shown is unconditional UI today, not data-driven: `User` has no `verified`/`isVerified` field, matching what `ExperienceOrganiser` already does. If that changes, this section should gate on it too.
