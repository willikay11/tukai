# PL-06 Popular places

- **Status:** decided
- **Type:** decision
- **Depends on:** PL-00
- **Design:** `docs/design/screens/places-listing.html`, `pcPopTitle` ('Popular {noun}'), `pcPopSub` ('Ranked by reviews from people who have been').
- **Now:** Not on /places.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Rail ranked by reviews | Yes | No |
| Sort | By reviews | `sort_by=popular` this works

## Done when

- [x] Check whether `sort_by=popular` changes the order (owner confirmed it works)
- [x] Decide the rail if it does not (it does, so the rail is built)

## Notes

The two sources disagree. Verify first, then decide. Do not show a 'popular' order the API does not sort by.

**Verification so far (not yet settled):**

- The 'Discover comment' that says the API ignores `sort_by` is not in the tree or its git history (`git log -S` finds only the commit that added `sort_by`, 438b41d6). Nothing in the code says the API ignores it.
- The API spec (`services/api.json`, `sort_by`) says 'popular' sorts by highest average rating, with unrated places last.
- Discover's 'Most popular' toggle sends `sort_by=popular` (`services/search.ts`, `services/place.ts`).
- A live check was not possible from here. `GET /v1/places/` returns an nginx 403 to non-browser requests, with and without `sort_by=popular`. To settle it, compare the order of the same query with and without `sort_by=popular` from a browser, or from a session that the API accepts.

**Recommendation:** if the live order is by rating, build the rail as a `CardRail` from `fetchPlaces` with `sortBy: 'popular'`, titled 'Popular places'. If it is not, drop the rail. Do not sort the fetched page on the client, since that would show a rating order over the first page only.

**Built:**

- `usePopularPlaces` in `app/shared/hooks/usePlaces.tsx` sends `sort_by=popular` and takes the API's order as it comes. It is not re-sorted on the client.
- `PopularPlaces` in `app/(places)/places/components/` renders a `CardRail` titled 'Popular places' over `PlaceCard`s. It is hidden when nothing comes back.
- Placed on /places after 'Places with experiences' and before the grid, the order the design gives.
- `PopularPlaces.test.tsx` covers the heading, the API order, the hidden empty state and the loading heading.

**Open, for the owner:**

- The design's subtitle is 'Ranked by reviews from people who have been', which is cut off in the design file. This build uses 'Ranked by reviews'. Confirm the full copy.
- The rail requests 10 places, so only the top 10 by rating show. It has no 'See all' link.
- The rail ignores the category and city filters, so it always shows the top places overall. Confirm this at approval.

