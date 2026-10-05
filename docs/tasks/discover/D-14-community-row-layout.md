# D-14 Decide the community row layout

- **Status:** decision
- **Type:** decision
- **Depends on:** none
- **Design:** `docs/design/HANDOFF.md`, section 'Community cards'. Grep `Communities organising things` in the prototype.
- **Now:** `app/(experiences)/components/CommunityRow/index.tsx`: a 72px tile beside stacked text, built from your screenshot.

## Done when

- [ ] You confirm the layout
- [ ] If it changes, the card is rebuilt to match
- [ ] Tests and build pass

## Notes

HANDOFF.md says one community card everywhere: square 1:1 image on a 168px grid, teal overlay, avatars bottom-left. Your screenshot shows a row. The screenshot is newer, so the row stays unless you say otherwise. See the conflict note in `docs/design/README.md`.
