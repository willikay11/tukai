# Experience drawer: design against build

- **Status:** awaiting approval
- **Design:** `Tukai Web.dc.html` (the previous prototype), the experience view behind `pn.isExp`
- **Excerpt:** [experience-panel.html](../../design/screens/experience-panel.html)
- **Built:** `app/shared/components/Experiences/ExperienceDrawer/index.tsx`

## Decisions (recorded 2026-10-08)

1. The drawer stays a summary that sends the reader to the full page. It does
   not grow into the design's full ticket-holding, booking and host-dashboard
   surfaces.
2. Follows from (1): nothing below gets its own copy of ticket holding,
   booking or editing. Where the drawer needs one of those, it opens the
   app's existing flow (a push to the page, as the footer already does)
   rather than duplicating it.
3. Follows from (1): a host's own experience does not get the design's full
   dashboard in the drawer. That stays Control center's job; ED-13 is not
   built.

This settles ED-05 (ticket holding stays out of the drawer; see its file) and
defers ED-02 (no section pills until more of the sections below exist). ED-12
and ED-13 stay out of scope under decision 3.

## Decision needed first, and it is a bigger one than the place drawer's

The built drawer is deliberately thin. Its own code comment says why:

> Booking stays on the experience's own page, so the footer sends the reader
> there rather than duplicating the booking flow.

The design does the opposite. The prototype's experience panel carries
almost everything the experience page itself has: ticket holding with QR
codes, a ticket-price picker, a location and meeting-point card, a host
profile with messaging, a guest list, moments, a cancellation policy, and, for
a host looking at their own experience, a full dashboard of sales, discount
codes, guest check-in and analytics, plus a separate settings screen for
editing the experience.

Building the design as drawn means reversing that decision and duplicating
work the app already has elsewhere: ticket holding is the Reserved tab and
the booking confirmation page, booking is `BookingPanel` and `TicketModal`,
editing is the create and edit experience flow, and the host dashboard
overlaps Control center and `HostingCard`.

Before any of these tasks are built, the owner needs to say:

1. Does the drawer stay a summary that sends the reader to the full page, or
   does it grow into something closer to the design?
2. If it grows, do ticket holding, booking and editing get their own copies
   inside the drawer, or does the drawer open the app's existing flows for
   them (a modal, a push to the page, and so on)?
3. Does a host's own experience get the design's full dashboard, or a banner
   like the place drawer's `PlaceManagerBanner`, pointing to Control center?

The tasks below are written as if the answer to (1) is "grow it", since that
is what comparing against the design means. Where the better answer looks
like "no, keep sending the reader elsewhere", the task says so.

## The verdict

Where the place drawer had the right bones with the wrong sizes, the
experience drawer does not yet have the bones. It has a header, one photo,
a few summary lines and a button to the full page. Almost every section in
the design is missing, not differing.

## Section by section

| Section | Design | Built | Task |
|---|---|---|---|
| Header | Sticky header plus a repeated, larger title in the body | Done - title now repeats in the body | ED-01 |
| Section pills | About, My tickets, Prices, Location, Host, Moments | Deferred - not enough sections yet to justify a nav | ED-02 |
| Gallery | Scrolling photo strip | Done - reuses PlacePhotoStrip | ED-03 |
| About | 3-line clamp, structured blocks | Done for the clamp; structured blocks recorded as not possible without an API change | ED-04 |
| My tickets | QR stack or list, download, share, check-in status | Decided: stays out of the drawer; "View experience" already sends the reader to where ticket status lives | ED-05 |
| Ticket prices | Date picker, a priced pill per ticket type | Missing; one summary price line | ED-06 |
| Location and meeting point | Two cards, each with an image | A text line with a pin icon | ED-07 |
| Host, going, host community | Avatar, verified badge, message, guest avatars | A text line | ED-08 |
| Moments | Share moment button, three-column grid | Missing | ED-09 |
| Cancellation policy, report | Heading and line, a report action | Missing | ED-10 |
| Footer | Not yet read from the prototype | View experience, full width | ED-11 |
| Manage-experience screen | Date, visibility, type, categories, location, co-hosts, delete | Missing; overlaps the create and edit flow | ED-12, decision |
| Host dashboard tabs | Sales, Created tickets, Guests, Moments, Analytics | Missing; overlaps Control center | ED-13, decision |

## Gaps in the excerpt

- The shared sticky header (back, title, share, save, close) is not in the
  excerpt, the same gap PD-01 recorded for the place drawer (ED-01).
- The footer is not in the excerpt (ED-11). Read it from the prototype's
  shared footer block before deciding whether it needs to change at all.

## Order if the owner says grow it

1. Answer the three questions above. ED-12 and ED-13 cannot be scoped before
   that.
2. ED-02 through ED-04, the pills and the top of the panel, once there is
   more than one section to point a pill at.
3. ED-07 and ED-09, location and moments: mostly wiring onto components the
   place drawer already has.
4. ED-05 and ED-06, ticket holding and prices, only once it is decided
   whether they get their own copy in the drawer or open the existing flows.
5. ED-12 and ED-13 last, and only if the owner wants the drawer to carry a
   host's own management of the experience at all.
