# Discover page tasks

Built against the design's Discover (All) tab, and the click behaviour in the
prototype. Each task has its own file. Reference a task by ID.

| ID | Task | Type | Status | Depends on |
|---|---|---|---|---|
| D-01 | Remove "Happening Today" from Discover | cleanup | done | none |
| D-02 | Remove "Happening Tomorrow" from Discover | cleanup | todo | none |
| D-03 | Experience cards open an experience drawer | interaction | decision | D-10 for stacking |
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
