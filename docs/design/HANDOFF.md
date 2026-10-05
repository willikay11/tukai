# Tukai Web — project handoff

Snapshot for moving this project to another account. Everything below lives in this
project folder; download the whole project as a zip and re-upload it on the new account.

## What this project is

A high-fidelity prototype of **Tukai** — a web app for discovering and booking local
experiences, places and community events, plus the creator-side tooling for running them.
Built as Design Components (`.dc.html`), each of which opens directly in a browser.

## Brand basics

| | |
|---|---|
| Deep teal | `#013334` (headers, hero panels) |
| Brand green | `#066349` (primary actions, links) |
| Lime accent | `#B0E800` |
| Ink / body | `#1F2937` |
| Surface grey | `#F3F4F2` |
| Typeface | Satoshi Variable — `assets/Satoshi-Variable.ttf` |

Styling is inline throughout (no stylesheets, no CSS classes).

## Files

### Main deliverables
| File | What it is |
|---|---|
| `Tukai Web App.dc.html` | **The primary artifact.** Full desktop web app, ~23 screens behind an internal router. |
| `Tukai Web App (standalone).html` | Self-contained single-file export of the above — works offline, no project needed. |
| `Tukai Web App-print.dc.html` | Print/PDF copy of the app. |
| `Communities Mobile.dc.html` | Mobile communities experience. Has tweakable props (e.g. `city`, default "Nairobi"). |
| `Communities Mobile 1a.dc.html` | Variant of the above. |
| `Recurring Experience Reservation.dc.html` | Reservation flow for recurring experiences. |
| `Reservation Screen Options.dc.html` | Side-by-side design options for the reservation screen. |
| `TukaiExperienceCard.dc.html` | Reusable experience-card component. |
| `Canvas.dc.html` | Exploration canvas (pan/zoom board of options). |

### Supporting
- `archive/` — three earlier versions of the web app (v1, v2, v3). Kept for reference.
- `nextjs-export/` — two Discover sections extracted as real Next.js 16 Server Components
  (`HappeningToday`, `DiscoverByCity`), with install instructions in its own README.
  This is the closest thing here to production-ready code.
- `assets/` — logo (png + svg), Satoshi font, basket icons.
- `refs/` — ~100 source screenshots and reference images from the original designs,
  plus `Tukai_Pricing_Model.pdf`.
- `screenshots/` — captures of prototype states used during review.
- `support.js`, `ios-frame.jsx` — runtime + device frame; leave in place, don't edit.

## Screens in `Tukai Web App.dc.html`

**Consumer:** Explore · Search · Experiences · Experience Detail · Places · Place Detail ·
City Detail · Community · Community Detail · Moments · Itinerary · Make Reservation ·
TukAI (chat assistant) · Pricing · Auth / Onboarding · 404

**Creator:** Creator Studio (dashboard) · Create Experience (wizard) · Manage Experience ·
Create Community · My Places · Add a Place · Manage Place

Screens are `<sc-if>` route blocks, each tagged with `data-screen-label` — search that
attribute to jump to any screen in the source.

## Product rules worth preserving

- Experience cards show the **organising community**, not a rating — only *past*
  experiences carry ratings.
- Reservation supports both one-time and recurring experiences; multi-day experiences can
  be ticketed as one setup for the whole period **or** per day.

## Picking this up on the new account

1. Download the project as a zip (all files, folders intact).
2. Create a project on the new account and upload the zip contents at the root — keep the
   folder structure, especially `assets/`, `uploads/` and `support.js` next to the
   `.dc.html` files, or images and fonts will break.
3. Open `Tukai Web App.dc.html` first — it's the centre of gravity.
4. If you only need to show someone the prototype and nothing else, send
   `Tukai Web App (standalone).html` — it runs on its own in any browser.


## Session notes (Sept 2026)

### Form fields
- All 42+ fields across the app share the seating capacity field style: 56px tall, thin grey border, 12px radius, 16px padding, soft green focus ring. Covers experience creation, bucket lists, community, wallet, reviews, messages and itineraries.
- Phone fields in experience creation match reservation settings.
- Search bars keep their separate rounded grey style (not unified yet).

### Experience creation
- The step bar slides left as you progress: current step sits at the left edge, earlier steps partly visible behind it.
- Fixed: the step bar read the previous step value and lagged one step behind.

### Rich text (Rich Text Field.dc.html)
- Formatting toolbar is a light grey rounded bar inside the field. Round buttons; active state is white with a green icon. Used by description, "What's included" and "What's not included".

### Time picker (Time Field.dc.html)
- Hours shown next to closing times. Applied to opening hours across the app.

### Community cards (one style everywhere)
- Used on Experiences, Places, Discover ("Communities organising things") and the Communities page.
- Same size as place and experience cards: grid repeat(auto-fill,minmax(168px,1fr)), gap 26px 16px, square 1:1 image, 12px radius, no border.
- Image carries a teal gradient overlay (rgba(1,51,52,0) 45% to .9 at 100%) with member avatars and the "+N" count bottom-left.
- Title sits below the image: 14px, 600, #013334, two-line clamp.
- The Communities page cards no longer show locality, purpose, next experience or a join button. Joining happens from the community detail page.
- The Communities page's previous richer card was replaced; the small list rows at the top of some screens are unchanged.

### Child components (keep these files)
- Tukai Web imports three sibling files: Date Field.dc.html, Time Field.dc.html and Rich Text Field.dc.html. If one is missing, its fields render as grey placeholder boxes.
- Time Field: value is "HH:MM" (24h), shown as 12h ("5:00 PM"). With ref-time (start or opening time) the list starts after it, wraps past midnight and shows the duration ("8 hrs 30 mins"). 15 minute steps.
- Rich Text Field: outputs a small HTML subset (b, i, u, ul, ol, li, div, br) read by rtParse. Toolbar: grey rounded pill inside the field; active buttons are white with a green icon. Paste is plain text.

### Carousel arrows
- Clickable arrows: brand soft background #E8F1ED, brand green icon #066349, hover #D5E7DE. Disabled arrows stay white with a #DDE3DF border at 35% opacity and ignore pointer events. Driven by navOf() and arw() (backBg/backBc/backFg/backPe and next*). The "See all" style go-arrows use the clickable look.

### Icons
- Search icon is Hugeicons stroke search-01 (class "hgi-stroke hgi-search-01"), matching the header search button. Do not use the twotone search icons: their handle sits on the 40% layer and they read as a plain circle.

### Communities page (profile menu > Communities)
- Renamed the profile menu item from "My communities" to "Communities". Built from the user's mobile mocks (uploads/Communities_*.jpg, Hosted By You).
- Three pill tabs (same look as the header tabs): Discover, Following, My communities. State: commTab, commMore, commType, commInv, commInvOpen. View model: commsPageVals() -> cp.
- Discover: Communities near you (city, 6 then Show more), View by type (activity chips from pcDefs, 6 then "Show more running communities"), Your friends joined, Discover by city (city cards grid).
- Following: Community invites banner (pale lime, expands to Join or Decline, joining is instant), Happening in your communities, Following list, Moments mosaic.
- My communities: Happening in your communities, Created or hosted by you with a lime Create community button, Moments. With no owned community (hostSetup "New host") it shows the "No communities... yet!" empty state.
- Community row: 104px image (lime lock badge when private), name, one-line purpose, member avatars and +N, activity icons, calendar icon with upcoming experience count.
- Private communities live in fx.privComms (pc1, pc2 invite you, pc3 you follow). They are resolvable by id but never listed publicly.
- Default memberships now: c3, c4, k1, k10, k19, pc3.

### About page (Oct 2026)
- Rebuilt on the 7-column card grid (repeat(auto-fill,minmax(168px,1fr)), 16px gaps). Text blocks span 4 columns and nothing bleeds past the 24px gutter. The community-name marquee is gone.
- Hero: text in columns 1-4, photos in 5-7 (one 2x2 photo with the "Saturday, 3 of us going" pill, two singles). At 6 columns only the large photo shows, at 5 only the singles, at 4 or fewer none (edHeroCols).
- Communities and moments rows use real fixtures and always fill whole rows (edCardCols, measured in measureMRecent). Private communities and their moments are left out.

### Pricing page (Oct 2026)
- Same hero and statement as About (data-ed-hero, edHeroCols). Below that, only the app's own patterns: section headers, pill tabs with icons, borderless cards on the card grid.
- Plans: three 2-column cards (columns 1-6 at seven columns). The popular plan uses brand soft with the only primary button. The fee note is the app's grey info note.
- Creators are standard 1-column cards (plan, quote, name). Add-ons are six 1-column tiles with an icon and price. The marquee, facts strip, numbered rows and teal panel are gone; marquee() and tkMarq were removed.
