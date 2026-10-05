# D-03 Experience cards open an experience drawer

- **Status:** decision
- **Type:** interaction
- **Depends on:** D-10 for stacking
- **Design:** grep `open('exp'` (five cards) and `detail.kind` (the `exp` branch).
- **Now:** `app/(experiences)/components/ExperienceCard/index.tsx` links to the experience page. Used by Happening soon and Guided tours.

## Done when

- [ ] A click opens an experience drawer over Discover
- [ ] The card keeps its href, so a new tab still works
- [ ] Bookmark still opens the list picker, not the drawer

## Notes

The design opens a panel for every experience. There is no experience drawer yet, so this is the largest task on the page. The drawer replaces the experience page. The place drawer (`app/shared/components/Places/PlaceDrawer/`) is the model.
