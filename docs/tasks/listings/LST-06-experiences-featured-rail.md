# LST-06 Featured experiences on /experiences, to the design

- **Status:** done
- **Type:** build
- **Depends on:** none
- **Design:** `docs/design/screens/experiences-featured.html` (the `exHasFeat`
  block of `Tukai Web.dc.html`, Experiences tab).
- **Now:** a single hero banner, showing the first result of the default list,
  with a note that there is no featured endpoint.

## Inventory

| Design item | Built? | Notes |
|---|---|---|
| Heading: Featured experiences | built | |
| Subtitle: "Handpicked from what is coming up in {city}" | differs | The city is dropped. The results are not filtered by city (brief 11.5 and 11.6). Subtitle reads "Handpicked from what is coming up" |
| Paged rail with arrows | built | `CardRail`. The design pages five at a time. We scroll the rail, so the page size is not reproduced |
| Cards: the same card as the other rails | built | `ExperienceCard` |
| Hidden when nothing is featured | built | Same rule as HS-02 |
| Featured from the editors' flag | built | The list serializer has `featured`. Filtered on the client, as Promoted places is |
| Hero banner | removed | The design has no hero in this block |

## Done when

- [x] Rail shows experiences the editors featured, in API order
- [x] Hidden when none are featured
- [x] Matches the design heading and cards
- [x] Tests and build pass

## Notes

The API has no `featured` query param, so the rail reads one page of 50 and
filters it. A featured experience beyond that page does not appear. Same limit
as Promoted places.
