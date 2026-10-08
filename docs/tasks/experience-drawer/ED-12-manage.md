# ED-12 Manage-experience screen

- **Status:** decision
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hostMode`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the manage-experience screen (lines 322 to 420 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx` (not built)

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Date, visibility, experience type, categories | Missing | Not built in the drawer. |
| Location and meeting point, repeated in edit form | Missing | Not built in the drawer. |
| Host community, co-hosts, help, delete | Missing | Not built in the drawer. |

## Done when

- [ ] Owner decides whether this screen is built at all
- [ ] If built, it does not duplicate the create and edit experience flow

## Notes

This screen is the experience's settings; `app/(experiences)/experiences/create/` already edits most of these fields, per CLAUDE.md's active feature work. Recommend this stays there rather than becoming a second editor inside the drawer. Needs the owner's call before any task is written for it.
