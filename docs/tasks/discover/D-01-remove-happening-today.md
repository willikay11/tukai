# D-01 Remove "Happening Today" from Discover

- **Status:** done
- **Type:** cleanup
- **Depends on:** none
- **Design:** grep `Happening today`. It sits under the Experiences tab only.
- **Now:** `app/(experiences)/components/DiscoverPageContent.tsx`: the Happening Today ExperienceRow and its query. The Experiences page already renders it (`app/(experiences)/experiences/ExperiencesPageContent.tsx`).

## Done when

- [x] Discover renders no Happening Today row
- [x] Experiences still shows it
- [x] The query and imports it used are removed if nothing else reads them
- [x] Tests and build pass

## Notes

Confirm the Experiences page version matches the design before removing the Discover one.
