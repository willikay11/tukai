# MO-04 Album card: a fanned stack for multi-photo moments

- **Status:** awaiting approval
- **Type:** build
- **Depends on:** MO-03
- **Design:** `docs/design/screens/moments-listing.html`, the album (`m.isAlbum`), fanned stack (`hasFanC`, `hasFanB`, `hasFanMore`).
- **Now:** Single-photo tiles only.

## Inventory

| Item | Design | Ours |
|---|---|---|
| Album of several photos, fanned | Yes | No |
| '+N' for more photos | Yes | No |

## Done when

- [ ] Album shows up to three photos, fanned
- [ ] '+N' shows the rest
- [ ] Reuses FannedPhotos

## Notes

FannedPhotos already exists (Discover's See all card uses it). Reuse it.
