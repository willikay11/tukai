# LST-01 Experiences directory, to the new listing design

- **Status:** blocked
- **Type:** build
- **Depends on:** none
- **Design:** Brief section 7.3 (route `/experiences`), 14.1 (cards) and 14.3 (primary action by type). Visual layout: the artboards in `Tukai Redesign.dc.html`, which are not readable as text.
- **Now:** `/experiences` renders the prototype's listing (`app/(experiences)/experiences/ExperiencesPageContent.tsx`), with discovery rows, city links and a category row.

## Done when

- [ ] Layout matches the Experiences artboard, once its markup is provided
- [ ] Category state is shown and kept in the URL
- [ ] Duration is presented in units the brief asks for (DS-04)
- [ ] Save controls on every card

## Notes

Blocked on the artboard markup. The brief describes behaviour and the card; the screen itself is only in the artboards. Provide the Experiences listing markup or a re-export, then this is buildable.
