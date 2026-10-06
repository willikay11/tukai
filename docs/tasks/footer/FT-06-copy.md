# FT-06 Footer copy follows the house style

- **Status:** done
- **Type:** build
- **Depends on:** FT-00
- **Design:** `docs/design/CONVENTIONS.md`: sentence case, and no em or en dashes.
- **Now:** 'All Rights Reserved' is Title Case. The company name is 'Tukai, Inc.' (confirm).

## Inventory

| Item | Rule | App |
|---|---|---|
| Copyright line | Sentence case | 'All Rights Reserved' |
| Legal entity | Confirm | 'Tukai, Inc.' |

## Done when

- [x] Copyright line in sentence case
- [x] Entity name confirmed

## Notes

Small. Combine with FT-04 if the owner is confirming the details anyway.

**Built:** the copyright line in `app/shared/components/Global/Footer.tsx` already reads "© {year} Tukai, Inc. All rights reserved." in sentence case, so no code change was needed. The "Now" note above was out of date. The owner confirmed the entity name as 'Tukai, Inc.', which is the value already in the code, so the footer is unchanged.

**FT-00 applied:** approved to build. Fix the copyright line's copy, and confirm the entity name.
