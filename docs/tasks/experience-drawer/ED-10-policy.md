# ED-10 Cancellation and report

- **Status:** blocked
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
| Cancellation policy heading and line | Blocked, not missing | Checked `types/experience.ts` and `services/experience.ts`: no cancellation-policy field exists anywhere on `Experience`, and nothing in the service layer fetches one. There is nothing to render. |
| Report this experience action | Blocked, not missing | Checked the whole repo for a report flow - hook, mutation, service endpoint, modal. None exists. The experience page itself (`ViewExperiencePageContent.tsx`) already has a "Report this experience" button with no `onClick`; it has always been inert. |

## Done when

- [ ] Cancellation policy shows when the API sends one - blocked until the API sends one
- [ ] Report action opens the existing report flow, if there is one - blocked until a report flow exists anywhere in the app

## Notes

Both halves of this task are blocked on backend/product work outside the frontend's reach, confirmed by reading the current `Experience` type, the experience service file, and a repo-wide search for report-related code. Nothing was built here to avoid rendering a fake policy or wiring a button to nothing, same as it was before. Revisit once either the cancellation-policy field or a real report flow exists.
