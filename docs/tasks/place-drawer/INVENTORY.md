# Place drawer: design against build

- **Status:** awaiting approval
- **Design:** `Tukai Web.dc.html` (the previous prototype, per `docs/design/README.md`), the place view behind `pn.isPlace`
- **Excerpt:** [place-panel.html](../../design/screens/place-panel.html)
- **Built:** `app/shared/components/Places/PlaceDrawer/`

## Decision needed first

The place drawer was deferred in the earlier Discover, Experiences and Places
work. Only the moment drawer (MO-09) was kept. These tasks do not build
anything. They record the gap so the owner can choose which sections to bring
forward.

Two questions for the owner:

1. Is the place drawer in scope now, or does it stay deferred?
2. Where a section needs API data the app does not have (PD-05 structured
   about, PD-10 my reservations, PD-11 community list, PD-13 tour guides),
   should the section wait, or ship without that data?

## The verdict

The drawer has the right bones. The sections are in the right order, the
tabs track the scroll, the photo row, facts, socials, upcoming week and reviews
are present, and the footer's three actions exist.

Three things are off:

- **Four sections are missing:** Happening now, My reservations, Community
  and Tour guides. Happening now can be built from data the drawer already
  loads. The other three need API decisions.
- **Almost every size, weight and colour differs.** Headings are 22px to 26px
  where the design is 19px to 24px. Pills and buttons are 40px or 48px where
  the design is 44px or 50px. Some greens are Tailwind defaults, not the
  design's hex (the active pill is `green-200`, which is #BBF7D0, not
  #A7F3D0). Nothing here is wrong in kind, but it reads as a different panel.
- **Shared components are reused where the design wants its own layout.**
  Reviews and the claim prompt are also on the place page, so changing them
  here changes that page too. PD-14 and PD-15 need a decision on that.

## Section by section

| Section | Design | Built | Task |
|---|---|---|---|
| Header | 68px, 24px title, back, share, save, close | Close to the design; size, padding and colour differ | PD-01 |
| Section pills | 44px, icons 21px, My reservations when there is one | about 42px, icons 18px, no My reservations | PD-02 |
| Manager banner | Compact, 44px button, label depends on setup | Larger, always "Reservation settings" | PD-03 |
| Photos, directions, rating | 240px photos, bordered directions pill, rating jumps to Reviews | Photos match; pill and rating differ; rating is not a control | PD-04 |
| About | 15px, 3-line clamp, structured blocks | 17px, character clamp, no blocks | PD-05 |
| Facts | 2 columns, links for web and email, 44px copy | Sizes differ, no links | PD-06 |
| Socials | Heading 19px, scrolling row | Heading 22px, wraps | PD-07 |
| Happening now | Missing | Missing | PD-08 |
| Upcoming experiences | 12-week limit, 44px pills, save and flag on cards | Week and pills differ; ExperienceCard in a wrap | PD-09 |
| My reservations | Missing | Missing; needs a place filter on bookings | PD-10 |
| Community | Missing | Missing; needs a decision on which communities | PD-11 |
| Moments | 3-column square grid, 50px Share moment | Button differs; grid differs | PD-12 |
| Tour guides | Missing | Missing; blocked on the API | PD-13 |
| Claim | Three features, lime button with shadow | Copy, icons and button differ | PD-14 |
| Reviews | Own row layout, like and comment | Shared component; layout differs | PD-15 |
| Footer | 48px buttons, Plan this icon only on narrow | Buttons differ; Plan this always labelled | PD-16 |

## Gaps in the excerpt

- The header's share, save and close controls are not in the excerpt (PD-01).
- The footer is not in the excerpt (PD-16). Its markup is the `pn.hasFab`
  block in the prototype.
- Socials colours come from a view model the excerpt does not carry (PD-07).

Add these to `docs/design/screens/place-panel.html` before building the tasks
that need them. The excerpt file says not to hand-edit it, so re-extract.

## Order if the owner says go

1. PD-16 and PD-01, the parts a reader sees every time (footer, header).
2. PD-02 and PD-04, the navigation and the top of the place.
3. PD-08, Happening now, which uses data already loaded.
4. The rest, once the decisions in PD-10, PD-11 and PD-13 are made.
