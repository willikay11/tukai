# D-16 Show the upcoming-experience count on community rows

- **Status:** blocked
- **Type:** blocked
- **Depends on:** D-14
- **Design:** grep `hasMeta2`. The design shows an icon and a count per row.
- **Now:** Not built. The communities list serializer has no count field.

## Done when

- [ ] The count shows, read from the API

## Notes

Blocked on the API. Counting from a page of experiences would undercount, so do not fake it. Needs a field on the communities list.
