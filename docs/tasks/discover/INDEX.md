# Discover page tasks

Built against the design's Discover (All) tab, and the click behaviour in the
prototype. Each task has its own file. Reference a task by ID.

| ID | Task | Type | Status | Depends on |
|---|---|---|---|---|
| D-01 | Remove "Happening Today" from Discover | cleanup | done | none |
| D-02 | Remove "Happening Tomorrow" from Discover | cleanup | done | none |
| D-03 | Experience cards open an experience drawer | interaction | done | D-10 for stacking |
| D-04 | Community rows open a community drawer | interaction | todo | D-10 for stacking |
| D-05 | Bucket list rows open a list drawer | interaction | todo | D-10 for stacking |
| D-06 | Moment cards open the moment in the drawer | interaction | todo | none |
| D-07 | City cards switch the city for the whole page | interaction | todo | none |
| D-08 | Cities that are not live say "coming soon" | interaction | blocked | D-07 |
| D-09 | "Exploring {city}" banner when away from home | content | decision | D-07 |
| D-10 | Open a card from inside a drawer, with back to return | interaction | todo | D-03, D-04, D-05 |
| D-11 | Verify place cards open the place drawer everywhere | qa | verify | none |
| D-12 | Verify the basket on every card opens the list picker | qa | verify | none |
| D-13 | Confirm each See all goes where the design sends it | decision | decision | none |
| D-14 | Decide the community row layout | decision | decision | none |
| D-15 | Show the private lock badge on community rows | decision | decision | D-14 |
| D-16 | Show the upcoming-experience count on community rows | blocked | blocked | D-14 |
| D-17 | Guided tours subtitle: per-city count | blocked | blocked | none |
| D-18 | "Closed - Opens 10 AM" pill on place cards | blocked | blocked | none |
| D-19 | Check Discover at phone width | qa | todo | none |

## Suggested order

1. Cleanup: D-01, D-02
2. Decide: D-03 (drives D-04, D-05, D-10), D-06, D-09, D-13, D-14
3. Interactions: D-07, then D-04 and D-05, then D-10
4. Verify: D-11, D-12, D-19
5. Blocked on the API, to raise with the backend: D-08, D-16, D-17, D-18

## Happening soon

Inventory: [INVENTORY-happening-soon.md](INVENTORY-happening-soon.md).
Run in this order:

| ID | Task | Status | Depends on |
|---|---|---|---|
| HS-01 | Review the Happening soon inventory | decision | none |
| HS-02 | Happening soon data rule (decided from the brief) | decided | HS-01 |
| HS-03 | What the subtitle can say (decided from the brief) | decided | HS-01 |
| D-03 | Experience cards open the summary drawer | todo | none |
| D-12 | Verify the basket on cards | verify | none |
| D-13 | Confirm the See all targets | decision | none |
| HS-04 | Build the agreed changes | todo | HS-01, HS-02, HS-03 |
| D-19 | Check the rail at phone width | todo | none |

## Discover, against the redesign brief

The brief is the source of truth. See `docs/design/README.md`.

| ID | Task | Status | Depends on |
|---|---|---|---|
| DS-01 | Discover module order, against the brief | decision | none |
| DS-02 | Quick filters: When, Budget, Interests, Filters | todo | DS-01 |
| DS-03 | Limit an experience's repeats across modules | todo | HS-02 |
| DS-04 | Multi-day experiences and durations on cards | todo | none |
| HS-05 | API: filter experiences by city | blocked | HS-03 |

## Deferred: drawers

The owner has decided not to build drawers for Discover, Experiences or Places
for now. The listing pages are built instead (see `docs/tasks/listings/`). These
tasks stay on file, unbuilt:

| ID | Task | Status |
|---|---|---|
| D-03 | Experience cards open an experience drawer | deferred |
| D-04 | Community rows open a community drawer | deferred |
| D-05 | Bucket list rows open a list drawer | deferred |
| D-06 | Moment cards open the moment in the drawer | deferred |
| D-10 | Stacked drawers | deferred |

The place drawer already built stays as it is. Its content tasks (`docs/tasks/place-drawer/`) are deferred with it.

