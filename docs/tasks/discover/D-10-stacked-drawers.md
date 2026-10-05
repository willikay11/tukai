# D-10 Open a card from inside a drawer, with back to return

- **Status:** todo
- **Type:** interaction
- **Depends on:** D-03, D-04, D-05
- **Design:** grep `pstack` (the stack that `push()` appends to).
- **Now:** `app/shared/components/Places/PlaceDrawer/index.tsx` holds a single view state. Nothing stacks.

## Done when

- [ ] A drawer can open another, and back returns to the first
- [ ] Closing returns to Discover
- [ ] Tests and build pass

## Notes

Only needed once a second drawer type exists. Blocked on D-03 to D-05 being built.
