# MO-02 Feed mix and break rails

- **Status:** awaiting approval
- **Type:** decision
- **Depends on:** MO-00
- **Design:** `docs/design/screens/moments-listing.html`, the feed's `mFeed` items and `m.isBreak` rails, each with a title and arrows (`m.nav.show`).
- **Now:** No breaks. One masonry of moments.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Break rails, titled, interleaved into the feed | Yes | No |
| Rail arrows | Yes | n/a |
| Rail cards: places with an open/closed pill | Yes | Blocked: hours are not on the list |
| Mix: every third, every other, or newest first | Tweak, default every third | Newest first |

## Done when

- [ ] Mix mode and default decided (MO-00)
- [ ] Breaks built, if the mix decision keeps them
- [ ] Pill left out, as its data is not on the list

## Notes

The breaks are where the place cards sit. Their pill is blocked on hours, as on the Places listing.

**MO-00 applied:** build all three Feed mix modes. Default is Every third.
