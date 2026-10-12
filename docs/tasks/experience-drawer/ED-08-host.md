# ED-08 Host, going and host community

- **Status:** done
- **Type:** content
- **Depends on:** the owner's approval of [INVENTORY.md](INVENTORY.md)
- **Design:** `Tukai Web.dc.html`, grep `pn.onOrg`
- **Excerpt:** `docs/design/screens/experience-panel.html`, section the host block (lines 268 to 297 of the excerpt)
- **Now:** `app/shared/components/Experiences/ExperienceDrawer/ExperienceHostSection.tsx`

## Inventory

Filled in before any code. Every section and control in the design excerpt,
with its status against what is built. Reviewed by the owner first.

| Design item | Built? | Notes |
|---|---|---|
| Host or guide row: avatar, verified badge, role label, Message button | Built | Matches the owner's screenshot (2026-10-08): avatar, "Host: Otieno" with a verified badge, "45 past experiences organised", a dark green Message host pill. |
| Host community row, with Join when the reader can | Differs | The row (photo, title, "34 past experiences hosted") is built and matches the screenshot. Join is still not built. |
| Going: avatars of other guests, named, with a plus-N tile | Reopen, not confirmed blocked | The owner's screenshot shows "Going" with named avatars (Otieno, Amina, Kevo, +18), populated, not a placeholder. This was recorded blocked on `Experience.guests` carrying no picture or name. Re-check: the screenshot's three named guests are the same names used elsewhere as hosts/reviewers in this environment's seed data, so this may be a different, already-available roster (confirmed attendees / ticket holders / reviewers) rather than the raw invite list. Needs a real check against the API before staying blocked. |

## Done when

- [x] Host community's Join button is built, reusing `PlaceCommunity`'s pattern (`useJoinCommunity`, `canJoin`, the sign-in gate, the toast) rather than a new one
- [x] Going is built from a real roster if one exists, or the block stays recorded as blocked with the specific endpoint checked and found missing
- [x] Host row, host-community row and (if built) Going all match the screenshot's spacing and type

## Notes

Reopened 2026-10-08 against the owner's screenshots, in two different ways:

**Join is not actually blocked.** The place drawer already has this exact
component: `app/shared/components/Places/PlaceDrawer/PlaceCommunity.tsx`
fetches the community, works out whether the reader can join
(`useJoinCommunity`, a `canJoin` helper keyed on invite status), gates on
sign-in, and shows a toast on success. `ExperienceHostSection`'s host
community row can very likely call the same hook the same way, rather than
being told to wait on a component that does not exist; it does.

**Going needs a real check, not a re-assertion of the old answer.** The
earlier note is specific and was clearly checked (`Experience.guests` is an
invite list: id, email, status, no picture), but the screenshot shows three
named, pictured guests, which is either real data from somewhere else
(ticket purchasers, confirmed attendees, reviewers) or the prototype's own
mock data standing in for a roster the API does not yet expose. Check
`services/experience.ts` and the ticket-purchase endpoints for anything that
returns buyer identities before concluding this is still blocked.

**Built 2026-10-08.**

Join: `ExperienceHostSection` now fetches the host community via
`useCommunityDetail` and offers Join through `useJoinCommunity`, the same
`canJoin` invite-status rule, sign-in gate and success toast `PlaceCommunity`
uses - its own copy of the pattern rather than the `PlaceCommunity` component
itself, since the host-community row's layout (one line: photo, title,
"X past experiences hosted") is not that component's.

Going: checked `services/experience.ts`'s `fetchTicketPurchases`
(`/v1/experiences/purchases/`, `experiences_purchases_list`) against its own
comment, which says it is used for "a host's Sales tab" - i.e. it scopes to
purchases the caller can see: their own, or every purchase on the experience
when the caller is the host. A guest reading the drawer is neither, so the
endpoint hands back nothing resembling a public roster of other attendees.
Combined with `Experience.guests` carrying no picture or name, there is no
endpoint today that gives a non-host reader anyone else's name or picture.
Going stays out of the drawer.
