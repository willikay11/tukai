# D-02 Remove "Happening Tomorrow" from Discover

- **Status:** done
- **Type:** cleanup
- **Depends on:** none
- **Design:** grep `Happening tomorrow`. It sits under the Experiences tab only.
- **Now:** `app/(experiences)/components/DiscoverPageContent.tsx`: the Happening Tomorrow ExperienceRow and its query.

## Done when

- [x] Discover renders no Happening Tomorrow row
- [x] Experiences still shows it
- [x] Tests and build pass

## Notes

Same as D-01, done together.
