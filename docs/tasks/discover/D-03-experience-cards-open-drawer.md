# D-03 Experience cards open an experience drawer

- **Status:** done
- **Type:** interaction
- **Depends on:** D-10 for stacking
- **Design:** grep `open('exp'` (five cards) and `detail.kind` (the `exp` branch).
- **Now:** `app/(experiences)/components/ExperienceCard/index.tsx` opens the drawer on a plain click and keeps its link. Used by Happening soon and Guided tours.

## Done when

- [x] A click opens an experience drawer over Discover
- [x] The card keeps its href, so a new tab still works
- [x] Bookmark still opens the list picker, not the drawer

## Notes

The design opens a panel for every experience. The drawer is a summary (photo, who runs it, when, where, price, description) with a "View experience" footer to the full page, where booking stays. The experience page is not removed. The place drawer (`app/shared/components/Places/PlaceDrawer/`) is the model.

Built: `context/ExperienceDrawerContext.tsx` (provider in `app/layout.tsx`), `app/shared/components/Experiences/ExperienceDrawer/`. Cards inside the place drawer (`UpcomingExperiences`) pass `opensDrawer={false}` and keep their link, because a drawer opened from there would stack on the place drawer. Remove that flag under D-10.

Checked with unit tests only. Not yet checked by hand in a browser.
