# HS-02 Happening soon data rule

- **Status:** decided
- **Type:** decision
- **Depends on:** HS-01
- **Design:** `docs/design/screens/discover-guest-brief.md`, section 11.2 (module 2), 11.5 (low supply), 11.2 (no empty headings).
- **Now:** Fixed 14-day window in code and copy. The brief sets no window.

## Done when

- [ ] Code follows the decision below
- [ ] Copy follows the decision below

## Decision

Decided from the brief:

- **Upcoming, not a fixed window.** The brief says "relevant upcoming
  activities". It gives no 14-day window, so the window goes. Ordered soonest
  first. The "next 14 days" subtitle goes with it.
- **Today and This weekend only when the When filter is set.** The brief says
  to use them "only when the filter matches". That filter is DS-02.
- **Hide the section when empty.** The brief says not to render empty section
  headings, and to show fewer good modules instead.
- **Limit repeats.** The brief says to limit an Experience's repeat appearances
  across the first modules. That is DS-03.

Nine cards is kept from the prototype. The brief does not set a count.
