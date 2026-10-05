# Tukai project conventions

## Copy
- Never use em dashes (—) or en dashes (–) anywhere in designs, copy, or code. Use a hyphen, comma, or a full stop instead. This includes time and date ranges (`6:00 AM - 4:00 PM`).
- Sentence case everywhere: headers, tabs, labels, pills and action buttons ("Create new bucket list", not "Create New Bucket List"). Capitalise only the first word and proper nouns (Tukai, TukAI, Google Maps, people, places, communities).

## Brand
| | |
|---|---|
| Deep teal | `#013334` (headers, hero panels) |
| Brand green | `#066349` (links, secondary actions) |
| Primary button | `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)`, white text, `border-radius:10px` |
| Lime accent | `#B0E800` (with `#013334` text) |
| Tukai red | `#E02D3C` (liked hearts, destructive actions) |
| Brand soft | `#E8F1ED` (selected, joined, highlighted states) |
| Ink / body | `#1F2937` |
| Secondary ink | `#5B6B66` (metadata) |
| Border | `#DDE3DF` |
| Surface grey | `#F3F4F2` |
| Typeface | Google Sans (variable, optical sizing on, GRAD 0) via Google Fonts: `https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap` |

- Icons: inline stroke SVG, 1.9 stroke weight, `currentColor` or a palette colour.
- Cards have no borders. Separate content with spacing, imagery and surface colour instead of outlines.
- Radius: cards 12px, sheets and modals 18px. Buttons are fully rounded (`999px`), like chips and badges.
- Interactive targets are never below 44px.
- Styling is inline throughout. No stylesheets, no CSS classes.
- Layout is fluid (auto-fit grids, wrapping flex), not breakpoint-based. Avoid viewport units inside device frames.

## Redesign (2026)
- Five destinations: Discover, Bucket Lists, Communities, Plans, You.
- Bucket Lists have exactly two modes, Public and Private. Private is invitation-only; a forwarded link grants nothing.
- Joining a list or a community never books, pays, or joins anything else. Personal progress is private, even on a public list.
- Joining a community is instant. There is no request or approval step.
- A Moment must be attached to a Community, Place, or Experience, and can be attached to several at once. List them experience, community, place, separated by a small blue dot (`#2F74D0`).
- Hosting requires an owned Community; membership in someone else's is not publishing rights. Exception: Guided Tours are organised by a tour guide, with no Community.

## Product rules
- Experience cards show the organising community, not a rating. Only past experiences carry ratings.
- Exception: Guided Tour cards show the tour guide's name instead of a community. The detail says "Guide" instead of "Host" and has no Host community section.
- Reservation supports one-time and recurring experiences. Multi-day experiences can be ticketed as one setup for the whole period or per day.
- A creator can only have one saved experience draft at a time.
- Reservations need a claimed place. A place is claimed by a Community the claimer runs, with proof of ownership (a licence, certificate of incorporation or similar). Claims are reviewed before they go live.
- Unclaimed places show the "Claim {place}" card and no reservation button.
