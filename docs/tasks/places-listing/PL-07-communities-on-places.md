# PL-07 Communities on the Places tab

- **Status:** decided
- **Type:** decision
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcCommTitle`, a section of communities.
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours | Decision |
|---|---|---|---|
| Communities section (rail of community cards, 'Join to hear about outings first. Joining never books anything.') | Yes | No | Not on /places. Communities stays on its own destination |

## Done when

- [x] Read the section's markup at approval
- [x] Decide whether it belongs on Places or only on Communities

## Notes

**Decision:** communities belong only on Communities. The Places tab has no communities rail.

**Why:**

- The brief gives Communities its own destination (10). `docs/design/CONVENTIONS.md` lists five destinations: Discover, Bucket Lists, Communities, Plans, You.
- Our app already has the destination: `app/(communities)/communities/` and the Communities entry in `BottomNavigation`. A user can reach it from any tab, including /places, so no cross-link is needed.
- The design's section is a community rail with join copy. Joining a community sits with the Communities destination, not with place discovery. This matches the PL-00 rule of keeping each segment to its own purpose.

**Built:** nothing. The rail is not built, and no link is added to /places.

**Open, for the owner:**

- If you want a visible link from /places to Communities, add it as a separate build item. The design markup has no link to copy, so its look needs a decision first.
