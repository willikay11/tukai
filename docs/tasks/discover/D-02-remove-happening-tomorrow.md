# D-02 Remove "Happening Tomorrow" from Discover

- **Status:** todo
- **Type:** cleanup
- **Depends on:** none
- **Design:** grep `Happening tomorrow`. It sits under the Experiences tab only.
- **Now:** `app/(experiences)/components/DiscoverPageContent.tsx`: the Happening Tomorrow ExperienceRow and its query.

## Done when

- [ ] Discover renders no Happening Tomorrow row
- [ ] Experiences still shows it
- [ ] Tests and build pass

## Notes

Same as D-01, done together.
