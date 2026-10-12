# ED-02 Section pills

- **Status:** done
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
| Pills: About, My tickets (when the reader holds one), Prices, Location, Host or Guide, Moments | Missing | The screenshots the owner supplied (2026-10-08) show five live pills (About, Prices, Location, Host, Moments) tracking the scroll, the same anchor-tab pattern `PlaceDrawerTabs` already uses. |
| Pill sizing and colour | Missing | Same values as PD-02 on the place drawer: 44px, 14.5px, active bg a mint green with a darker green label and a filled icon; inactive pills light grey with an outlined icon. The screenshots confirm this, so there is no need to re-derive it from the markup. |

## Done when

- [x] Drawer has a section nav, reusing `PlaceDrawerTabs`'/`useScrollSpy`'s pattern rather than a second implementation
- [x] Pills read: About, Prices, Location, Host, Moments, with no My tickets pill until ED-05 is revisited
- [x] Each pill scrolls to and tracks its section as the reader moves through the drawer

## Notes

Un-deferred 2026-10-08. The earlier call to wait ("not enough sections to
justify a nav yet") no longer holds: ED-04, ED-06, ED-07, ED-08 and ED-09 are
all built, which is five of the six sections the design's pills point to.
The owner's screenshots show this nav as a core piece of the drawer, not a
finishing touch, so it is back in scope.

Build on the place drawer's exact pattern: `PLACE_SECTIONS`/`PLACE_SECTION_IDS`
in `tabs.ts`, `useScrollSpy`, and `PlaceDrawerTabs` rendering the pills
against `activeId`/`onSelect`. An experience-side `tabs.ts` names the same
five ids (`experience-about`, `experience-tickets`, `experience-where`,
`experience-host`, `experience-moments`), and each section in
`ExperienceDrawer/index.tsx` gets a matching `id` and `scroll-mt` the way the
place drawer's sections already do.

**Built 2026-10-08.** `ExperienceDrawer/tabs.ts` adds `EXPERIENCE_SECTIONS`/
`experienceDrawerTabs`, directly reusing `PlaceDrawerTabs` (imported across
from the place drawer, the same way the drawer already reuses
`PlacePhotoStrip`) and `useScrollSpy`. The header and the pill row are pinned
together as one sticky block rather than independently like the place
drawer's, since nothing here ever swaps the header's title out. Prices and
Host are left out of the pill row when the experience has no tickets or no
host/host-community, so no pill ever points at an empty section.
