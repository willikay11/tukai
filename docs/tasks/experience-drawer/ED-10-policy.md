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
| Cancellation policy heading and line | Reopen, likely not blocked | The owner's screenshot (2026-10-08) reads "Free cancellation until 6:00 PM on Thu 8 Oct. After that, tickets can be transferred but not refunded." That deadline is the experience's own start time (the same drawer's header reads "Tomorrow, 6:00 PM to 9:00 PM"). This line is very likely computed from `experience.startDate` alone, not a stored policy field, which would make it buildable now, with no API change. |
| Report this experience action | Blocked, not missing | Unchanged: no report flow exists anywhere in the app, confirmed by the earlier search. The experience page's own "Report this experience" button has never had an `onClick`. |

## Done when

- [ ] Confirm with the owner whether the cancellation line is meant to be a fixed, computed rule ("free until the start time, transfer-only after") or real per-experience policy data
- [ ] If computed, build it from `experience.startDate` with no API change
- [ ] Report stays a visible but inert control, matching the experience page's own current state, or gets left out of the drawer until a real flow exists, owner's call

## Notes

Reopened 2026-10-08 against the owner's screenshot. The earlier "blocked"
call was a careful one: `types/experience.ts` really does carry no
cancellation-policy field, but the specific deadline in the screenshot
lining up exactly with the experience's own start time suggests the design
never needed a stored field for this: it is a standard rule, stated in
different words depending on how long before the start time it is. Confirm
the wording and the rule with the owner before building it as copy.

Report is unchanged: still nothing to wire it to. Building the row without a
working action matches what the experience page already does, so it is a
real option, not a half-measure unique to the drawer.
