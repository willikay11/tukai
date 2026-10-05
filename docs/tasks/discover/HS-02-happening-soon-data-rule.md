# HS-02 Decide the Happening soon data rule

- **Status:** decision
- **Type:** decision
- **Depends on:** HS-01
- **Design:** Pool and window: the design's `expPool` has no date filter. Copy says 'next 14 days'.
- **Now:** We filter to 14 days, sort by start time, show nine, and hide the section when empty.

## Done when

- [ ] Decision recorded on the window: 14 days (ours, matching the copy) or the design's unfiltered pool
- [ ] Decision recorded on ordering: soonest first, or fixture order
- [ ] Decision recorded on the empty state: hide the section, or show an empty rail

## Notes

The design's copy and its data disagree. Our window is the one the copy promises, so it is the likely answer, but it is still the owner's call.
