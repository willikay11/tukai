# D-01 Remove "Happening Today" from Discover

- **Status:** todo
- **Type:** cleanup
- **Depends on:** none
- **Design:** grep `Happening today`. It sits under the Experiences tab only.
- **Now:** `app/(experiences)/components/DiscoverPageContent.tsx`: the Happening Today ExperienceRow and its query. The Experiences page already renders it (`app/(experiences)/experiences/ExperiencesPageContent.tsx`).

## Done when

- [ ] Discover renders no Happening Today row
- [ ] Experiences still shows it
- [ ] The query and imports it used are removed if nothing else reads them
- [ ] Tests and build pass

## Notes

Confirm the Experiences page version matches the design before removing the Discover one.
