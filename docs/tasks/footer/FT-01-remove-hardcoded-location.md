# FT-01 Remove the hardcoded location

- **Status:** approved
- **Type:** build
- **Depends on:** FT-00
- **Design:** not in the new design. The brief forbids fabricated location (11.6).
- **Now:** `app/shared/components/Share/share/footer.tsx` shows 'Parkwood Villas, Syokimau' for every reader.

## Inventory

| Item | Brief | App |
|---|---|---|
| Location line | Explicit selector, no fallback claim (11.6) | Hardcoded |

## Done when

- [ ] The hardcoded address is gone
- [ ] The footer shows the reader's selected city, or nothing
- [ ] Tests pass

## Notes

A footer that names a fixed place is wrong for every reader who is not there. This is the one fix that does not wait for a design.

**FT-00 applied:** approved to build. Remove the hardcoded location.
