# Experience drawer: design against build

- **Status:** awaiting approval
- **Design:** `Tukai Web.dc.html` (the previous prototype), the experience view behind `pn.isExp`
- **Excerpt:** [experience-panel.html](../../design/screens/experience-panel.html)
- **Built:** `app/shared/components/Experiences/ExperienceDrawer/`

## 2026-10-08: reopened against the owner's screenshots

The owner supplied three screenshots of the design's experience panel (About,
Prices and Moments tabs) and said the build does not look like them. Six of
the thirteen tasks below are reopened as a result: ED-02 (the section pills,
now un-deferred), ED-06 (ticket cards), ED-07 (the maps link's placement),
ED-08 (host community's Join button, and a second look at Going), ED-10 (the
cancellation line), and ED-11 (the footer, which is the biggest change, see
its file). Each reopened task says what in the screenshot contradicts it.

This followed a lot of real building since the decisions below were
recorded, on the same day: ED-01, ED-03, ED-04, ED-07 and ED-09 shipped, and
ED-06, ED-08 and ED-11 shipped in a different shape than the screenshots
show. The three decisions still mostly hold: nothing here brings QR ticket
holding, an in-drawer ticket picker, or the host's own dashboard into the
drawer, but "the drawer stays a summary" undersold how much of the design
ended up built anyway. The verdict below is rewritten to match.

## Decisions (recorded 2026-10-08, status after the screenshots)

1. The drawer stays a summary that sends the reader to the full page for
   ticket holding and booking. Still holds, though "summary" now covers five
   built sections, not one.
2. Nothing gets its own copy of ticket holding, booking or editing; the
   drawer opens the app's existing flow instead. Still holds. ED-11 narrows
   *which* existing flow ("Make reservation" / `/reserve`, not a generic
   link to the experience page).
3. A host's own experience does not get the design's full dashboard in the
   drawer. Still holds; ED-12 and ED-13 are untouched by the screenshots,
   which are all of the guest view.

## Section by section

| Section | Design | Built | Task |
|---|---|---|---|
| Header | Sticky header (date/time) plus the full title repeated in the body | Done, confirmed by the screenshot | ED-01 |
| Section pills | About, My tickets, Prices, Location, Host, Moments | Done 2026-10-08: five pills (About, Prices, Location, Host, Moments) on `PlaceDrawerTabs`/`useScrollSpy` | ED-02 |
| Gallery | Scrolling photo strip | Done, confirmed by the screenshot | ED-03 |
| About | 3-line clamp, structured blocks | Done for the clamp, confirmed by the screenshot; structured blocks still recorded as not possible without an API change | ED-04 |
| My tickets | QR stack or list, download, share, check-in status | Decided: stays out of the drawer | ED-05 |
| Ticket prices | A card per ticket: label, price, note, arrow icon | Done 2026-10-08: card per ticket (label, price, arrow icon); note line left empty, no API data for it yet | ED-06 |
| Location and meeting point | Two cards, the maps link inline under the name | Done 2026-10-08: maps link moved inline under the venue name, as its own anchor rather than the lime button | ED-07 |
| Host, going, host community | Avatar, message, guest avatars, a Join button | Done 2026-10-08: Join built on `PlaceCommunity`'s pattern; Going stays blocked, confirmed against `fetchTicketPurchases` | ED-08 |
| Moments | Share moment button, three-column grid | Done, confirmed by the screenshot (grid shape not pixel-checked) | ED-09 |
| Cancellation policy, report | A computed-looking cancellation line, a report action | Reopened for cancellation: the screenshot's deadline matches the experience's own start time, suggesting no API change is needed; report stays blocked | ED-10 |
| Footer | Price and date as text, a "Make reservation" button, Plan this | Reopened, the biggest gap: built as two buttons with no price/date text and the wrong primary label/destination | ED-11 |
| Manage-experience screen | Date, visibility, type, categories, location, co-hosts, delete | Decided: not built, untouched by the screenshots | ED-12 |
| Host dashboard tabs | Sales, Created tickets, Guests, Moments, Analytics | Decided: not built, untouched by the screenshots | ED-13 |

## Order

1. ED-11 (footer) first, since it is what a reader sees without doing anything,
   and the copy/destination question there is worth settling before the
   smaller shape fixes.
2. ED-02 (section pills), now that enough sections exist to justify it.
3. ED-06, ED-07, ED-08, the shape and copy corrections inside sections that
   are already built.
4. ED-10, once the owner confirms whether the cancellation line is a
   computed rule or needs real policy data.
5. ED-12 and ED-13 stay last, and only if the owner reopens decision 3.
