# PD-04 Tour guides section

- **Status:** blocked
- **Type:** blocked
- **Depends on:** none
- **Design:** Tukai Web.dc.html, grep `Tour guides`: `{{ g.name }}`, `{{ g.sub }}`, `{{ g.label }}`.
- **Now:** Not built. `GET /guides/` returns profiles without name, photo or experience count.

## Done when

- [ ] Guide name, photo and experience count shown per guide

## Notes

Blocked on the API. The guides list needs the user's name and picture on each profile.
