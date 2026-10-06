# PD-11 Community

- **Status:** built, awaiting review
- **Type:** decision
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.hasComms`
- **Excerpt:** `docs/design/screens/place-panel.html`, section the Community block (lines 151 to 170)
- **Now:** `app/shared/components/Places/PlaceDrawer/PlaceCommunity.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Heading 19px, bold | Missing | Not built. |
| Row: 72px image, name with arrow, hosted line 14px | Missing | Not built. |
| Join button, lime, 44px, only when the reader can join | Missing | Not built. |

## Done when

- [x] Owner decides which communities are listed (owning community only, see Notes)
- [x] If built, rows link to the community and Join shows only when allowed

## Notes

Built in `PlaceCommunity.tsx`.

- Owner only. The ownership record names one community, and the API has no
  query for the communities that hold a place, so a list of several would need
  a new endpoint. Revisit if the API gains one.
- The hosted line reads "Hosted by {owner}", or "{n} members" when no owner is
  in the response.
- Join shows unless the reader is a member, or has a request waiting on a
  private community. A signed-out reader sees Join and is sent to sign in first.
- Join reuses `useJoinCommunity`, so the community's detail query refreshes and
  the button drops away once the reader is in.
