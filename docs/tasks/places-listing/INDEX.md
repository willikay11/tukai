# Places listing, by segment

The design's Places listing, broken into segments. Nothing is built until the owner approves its task.

Source: `docs/design/screens/places-listing.html`.

| ID | Segment | Type | Status | Depends on |
|---|---|---|---|---|
| PL-00 | Decide the rules every Places segment shares | decision | decided | none |
| PL-01 | Category row with arrows | build | built, pending owner review | PL-00 |
| PL-02 | Promoted places | build | built, pending owner review | PL-00 |
| PL-03 | Discover by city (places) | build | built, pending owner review | PL-00 |
| PL-04 | Nearby places | build | built, pending owner review | PL-00 |
| PL-05 | Places with experiences | build | awaiting approval | PL-00 |
| PL-06 | Popular places | decision | awaiting approval | PL-00 |
| PL-07 | Communities on the Places tab | decision | awaiting approval | PL-00 |
| PL-08 | Places by city | decision | awaiting approval | PL-03 |
| PL-09 | Discover places: all places in a grid | build | awaiting approval | PL-00, PL-01 |
| PL-10 | Empty state | build | awaiting approval | PL-00 |
| PL-11 | Place card, to the brief | build | awaiting approval | none |

Run in order: PL-00 first. PL-11 (the card) is built before the rails.
