# Experiences listing, by segment

The design's Experiences listing, broken into segments. Each segment is a task
with its own inventory. Nothing is built until the owner approves its task.

Source: `docs/design/screens/experiences-listing.html`.

| ID | Segment | Type | Status | Depends on |
|---|---|---|---|---|
| EL-00 | Decide the rules every segment shares | decision | awaiting approval | none |
| EL-01 | Category row with arrows | build | built, pending review | EL-00 |
| EL-02 | Featured experiences | build | done | none |
| EL-03 | Happening near you | build | built, pending review | EL-00 |
| EL-04 | Happening today | build | built, pending owner review | EL-00 |
| EL-05 | Happening tomorrow | build | built, pending owner review | EL-00 |
| EL-06 | Discover itineraries | build | built, pending owner review | EL-00 |
| EL-07 | Communities | build | built, pending owner review | EL-00, D-14 |
| EL-08 | Guided tours | build | awaiting approval | EL-00 |
| EL-09 | Experiences by city | build | awaiting approval | EL-00 |
| EL-10 | Discover experiences: all experiences in a grid | build | awaiting approval | EL-00, EL-01 |
| EL-11 | Remove the 'Experiences in {city}' curated row | cleanup | awaiting approval | none |
| EL-12 | Empty states | build | awaiting approval | EL-00 |
| EL-13 | Account tabs on /experiences | decision | awaiting approval | EL-00 |

Run in order: EL-00 first, since the others depend on its decisions.
