# D-18 "Closed - Opens 10 AM" pill on place cards

- **Status:** blocked
- **Type:** blocked
- **Depends on:** none
- **Design:** grep `pillText` in the place view model.
- **Now:** Built on the place detail page only (`PlaceOpenStatus`). Cards have no hours.

## Done when

- [ ] The pill shows on the Places with experiences cards

## Notes

Blocked on the API. Hours are not on the place list serializer. They would need two requests per card, so this stays on the detail page unless the list adds hours.
