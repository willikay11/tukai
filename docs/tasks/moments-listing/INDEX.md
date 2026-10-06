# Moments listing, by segment

The design's Moments listing, broken into segments. Nothing is built until the owner approves its task.

Source: `docs/design/screens/moments-listing.html`.

| ID | Segment | Type | Status | Depends on |
|---|---|---|---|---|
| MO-00 | Decide the rules the Moments listing shares | decision | decided | none |
| MO-01 | Heading | build | awaiting approval | none |
| MO-02 | Feed mix and break rails | decision | built, pending owner review | MO-00 |
| MO-03 | Moment card | build | built, pending owner review | none |
| MO-04 | Album card | build | awaiting approval | MO-03 |
| MO-05 | Empty state | build | built, pending owner review | none |
| MO-06 | Paging: View more, not infinite scroll | decision | built, pending owner review | none |
| MO-07 | Open a moment | build | built, pending owner review | none |
| MO-08 | Place cards inside the break rails | blocked | blocked | MO-02 |

Run in order: MO-00 first.
| MO-09 | Open a single moment in a drawer | build | awaiting approval | MO-00, MO-03 |
