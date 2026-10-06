# MO-09 Open a single moment in a drawer

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** MO-00 (decided), MO-03 (the card the reader clicks)
- **Design:** `docs/design/screens/moments-listing.html` for the card. The moment's own panel is the `pn.isMoment` block of `Tukai Web.dc.html`. Its markup is not yet in the repo, see Notes.
- **Now:** A click routes to `/moments?momentId=...` (MomentCard and MomentsMasonry). The moment page renders `MomentDetail`, with comments in `MomentComments`.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Click on a moment opens a drawer | Yes (`pn.isMoment`) | Routes to the moment page |
| Author and date | Yes (`pn.mo.author`, `pn.mo.date`) | In MomentDetail |
| Caption | Yes (`pn.mo.caption`) | In MomentDetail |
| Photos | To read at approval | In MomentDetail |
| Likes and comments | To read at approval (`pa.label`) | In MomentDetail and MomentComments |
| Close control | Yes (to read) | Back navigation |
| Deep link to a moment | Not stated | `/moments?momentId=...`, which must keep working |

## Done when

- [ ] A click on a moment in Discover, the Moments listing, and a place or experience's moments opens it in a drawer
- [ ] The drawer closes with its close control and with Escape
- [ ] The URL `/moments?momentId=...` still opens the moment as a page
- [ ] Likes and comments work inside the drawer
- [ ] On a phone the drawer is full screen (`mobile="full"`), as the place drawer is
- [ ] Tests and build pass

## Notes

**Supersedes MO-07**, which deferred this with the other drawers. The owner has
asked for it now.

**Reuse:** build the drawer around `MomentDetail` and `MomentComments`. Do not
write a second copy of the moment content. The drawer is the shell; the moment
page keeps its own route.

**Blocked on the design excerpt.** The `pn.isMoment` markup is in the design
file, which this session can no longer read from Downloads. Extract that block
into `docs/design/screens/moment-panel.html`, or paste it, before the inventory
is final.
