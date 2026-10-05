# LST-05 Search results at `/search`, keeping `/?q=` working

- **Status:** todo
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/discover-guest-brief.md`, section 7.3 (route `/search?q=...&type=...`), and section 7.3's note on preserving legacy URLs.
- **Now:** Search results are shown on `/` through `?q=` (`app/(experiences)/components/SearchResults/`).

## Done when

- [ ] Results are served at `/search?q=...&type=...`
- [ ] `/?q=...` redirects to it, so existing links still work
- [ ] Back returns to where the reader came from

## Notes

The brief asks for legacy URLs to redirect when the structure changes.
