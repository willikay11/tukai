# ED-02 Section pills

- **Status:** deferred
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.secs`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the pills (same markup as the place drawer's, line 2 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/`, not built

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Pills: About, My tickets (when the reader holds one), Prices, Location, Host or Guide, Moments | Missing | The drawer has no section pills or anchors at all. Everything is one unbroken scroll. |
| Pill sizing and colour | Missing | Same values as PD-02 on the place drawer: 44px, 14.5px, active bg #A7F3D0. |

## Done when

- [ ] Drawer has a section nav once ED-04 through ED-09 give it something to point to
- [ ] Pills and the anchor pattern reuse PlaceDrawerTabs rather than a second implementation

## Notes

Build after the sections below exist. A tab strip over one scroll of basics is not worth it on its own.

Confirmed deferred (2026-10-08): ED-01, ED-03 and ED-04 shipped without it.
The drawer still has only one real section (About); ED-05 stayed a decision
not to build ticket holding here at all. Not enough sections to justify the
nav yet. Revisit once ED-07/ED-09 (location, moments) land, if the drawer
ever grows that far.
