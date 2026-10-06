# MO-02 Feed mix and break rails

- **Status:** built, pending owner review
- **Type:** decision
- **Depends on:** MO-00
- **Design:** `docs/design/screens/moments-listing.html`, the feed's `mFeed` items and `m.isBreak` rails, each with a title and arrows (`m.nav.show`).
- **Now:** Built. The feed is split into runs with a break rail after each run.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Break rails, titled, interleaved into the feed | Yes | No |
| Rail arrows | Yes | n/a |
| Rail cards: places with an open/closed pill | Yes | Blocked: hours are not on the list |
| Mix: every third, every other, or newest first | Tweak, default every third | Newest first |

## Done when

- [x] Mix mode and default decided (MO-00)
- [x] Breaks built, if the mix decision keeps them
- [x] Pill left out, as its data is not on the list

## Notes

The breaks are where the place cards sit. Their pill is blocked on hours, as on the Places listing.

**MO-00 applied:** build all three Feed mix modes. Default is Every third.

**Built:**

- `feed-mix.ts` holds the three modes and `splitIntoRuns`. Every third is the default, with runs of three. Every other uses runs of two. Newest first is one run, so no rails.
- `MomentsView` renders one `MomentsMasonry` per run, with a `MomentsBreakRail` between runs. Rails never follow the last run, so the feed does not end on a rail, and earlier rails stay put as pages load.
- `MomentsBreakRail` is a `CardRail` titled with an interest category. Run 1 uses the first interest category, run 2 the second, and so on. A category with no places leaves its slot empty.
- Rail cards are `NearbyPlaceCard`, the same card as Nearby on /places, without the pill.
- With location in use, each rail sorts nearest first and shows distance. Without it, the API order stands.
- `MomentsMasonry` takes `startIndex`, so the eager-load count still covers the first screenful across runs.
- `MomentsView` takes a `feedMix` prop and defaults to Every third. The design's Feed mix is a prototype tweak, so no visible control is added. Owner to confirm whether one is wanted.

**Choices made in the build (owner to confirm):**

- **Rail title is the category name as the API gives it**, for example 'Cafe'. No 'Nearby {noun}' wording, as the plural is not on the list (see PL-04).
- **Rail places come from the category, not from a nearby query.** Each rail takes up to 12 places, as `usePlaces` returns them.
- **Rails stop when the interest categories run out.** A feed with more runs than categories has its later runs joined without a rail.
- **`NearbyPlaceCard` is imported from /places.** It is now used by two features, so it belongs in `app/shared/components/` under CLAUDE.md. Moving it is a separate structure change.

**Not verified in a browser.** The tests cover the helper and the rail. The page layout with rails between masonries has not been checked at 2, 3 and 5 columns.
