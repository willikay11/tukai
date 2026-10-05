# D-06 Moment cards open the moment in the drawer

- **Status:** todo
- **Type:** interaction
- **Depends on:** none
- **Design:** grep `onOpen: () => this.setState({ moment:`. `docs/design/PENDING.md` also says moments open in the drawer.
- **Now:** `app/(experiences)/components/MomentCard/index.tsx` calls `router.push('/moments?momentId=...')`.

## Done when

- [ ] A click opens the moment in a drawer on Discover
- [ ] The Moments page is unchanged
- [ ] Tests and build pass

## Notes

PENDING.md says the moment viewer was removed in favour of the drawer, so this is the consistent choice even before D-03 is decided.
