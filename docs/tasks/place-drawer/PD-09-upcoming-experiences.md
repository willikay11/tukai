# PD-09 Upcoming experiences

- **Status:** built, awaiting review
- **Type:** cleanup
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasUp`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the Upcoming block (lines 171 to 221)
- **Now:** `app/shared/components/Places/PlaceDrawer/UpcomingExperiences.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading 19px bold, sub line Upcoming experiences at X | Differs | Built: 22px heading. |
| Week arrows 44px, disabled at the current week | Differs | Built: 32px, disabled at the current week. |
| Next arrow stops at 12 weeks ahead | Missing | Built: no limit. |
| Week label: Month YYYY, or Mon to Mon YYYY across months | Differs | Built: a month label, min width 150px. |
| Day pills 44px tall, 14.5px, border, weekday and bold day, one dot per experience | Differs | Built: py-2.5, 15px, one dot in a single colour. |
| Results as a grid, min 160px columns, 1:1 image, save button top right, flag pill | Differs | Built: ExperienceCard in a wrap layout. No save or flag on the drawer's cards. |
| Card text: host 10px green, title 14px, when 12.5px, price 13px bold | Differs | Built: ExperienceCard's own type. |
| Empty: Nothing on at X on Mon 5 Jul. Try another day. | Differs | Built: Nothing on at X that day. |

## Done when

- [x] Week controls match the design's size, disabled states and 12-week limit
- [x] Day pills are 44px tall with a dot per experience (capped at three, see Notes)
- [x] Results use the design's card, and the empty copy names the day

## Notes

Built in `UpcomingExperiences.tsx` and `week-strip.ts`.

- Save and flag were already on the drawer's cards. `ExperienceCard` carries the
  bookmark and the flag, so the inventory's "No save or flag" line is out of
  date. Only the layout changed: the cards now fill a `minmax(160px, 1fr)` grid
  rather than the fixed 184px rail width.
- The card's price is still semibold, not bold. It is shared with the rail, so
  changing its weight is a separate call.
- Dots are capped at three per pill. The design says one per experience, but
  fifty would push the pill past its 44px height. The count is in the cards
  below. Change `MAX_DAY_DOTS` if the owner wants every dot.
- The next arrow stops at twelve weeks after the current week (`MAX_WEEKS_AHEAD`).
- Week label: "October 2026" inside a month, "Sep to Oct 2026" across two, and
  "Dec 2026 to Jan 2027" across a year end. Month abbreviations are fixed,
  because en-GB writes September as "Sept".
- Moving a week selects its first day, or today in the current week, so the
  selection never sits off the strip.
