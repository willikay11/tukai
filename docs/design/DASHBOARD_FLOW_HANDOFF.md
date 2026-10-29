# Handoff: Dashboard

## Overview
The Dashboard is where a signed-in person runs everything they earn from or manage on Tukai: money, hosting plan, bookings, places, hosted experiences and communities.

It opens from **Dashboard** in the account menu, which needs an account. Opening it always starts on the Overview tab, with both date rails on their default dates. While it's open, **You** stays highlighted in the main navigation.

**Layout**
- **Sticky tab bar:** Overview, My reservations, Places, My experiences (hosting), Communities.
- **Left column:** the Dashboard card (balance and Withdraw), then the Hosting plan card.
- **Right, column A:** My reservations, then My places (with Your claims and Connect a place).
- **Right, column B:** My experiences (hosting), then My communities.

Overview shows all four sections. Each other tab shows only its own section, at full width.

Out of scope, because each has its own design or handoff:
- Withdraw (`design_handoff_withdraw`).
- The Plans panel behind Choose a plan and Change plan.
- Pages and panels that cards open: experience, place, community and claim pages, the reservation requests panel, reservation settings, Boost, the payment panel, and the review and moment composers.
- Create experience and the new community flow.

## About the design
This is a **design reference** from the HTML prototype (`Tukai Web.dc.html`), not production code. Recreate it in Tukai's codebase with its existing framework and components. The exact markup and logic are at the end of this file. Amounts, counts and names are sample data.

## Fidelity
**High fidelity.** Build it pixel-perfect. All values are CSS pixels at 1x, and every font is Google Sans. Every icon is Hugeicons, twotone unless marked bulk. Every control is a native `<button>`, and none is shorter than 44px.

## Page frame
The content container is shared with every destination: `max-width: 1360px; margin: 0 auto; padding: 0 24px`, under the sticky top bar.

```css
/* Body */
padding-top: 18px; display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start;

/* Left column: <aside aria-label="Account balance"> */
flex: 1 1 340px; max-width: 380px; min-width: 0; display: flex; flex-direction: column; gap: 8px;

/* Right side: a grid of two column stacks */
flex: 999 1 560px; min-width: 0;
display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 28px; align-items: start;
/* each column stack */ display: flex; flex-direction: column; gap: 28px; min-width: 0;
```
On tabs other than Overview, only one column stack is rendered. `auto-fit` collapses the empty track, so that stack spans the full width.

**Geometry**

| Viewport | Left column | Right side | Overview columns | Inner grids, one section tab |
|---|---|---|---|---|
| 1440 | 340.4 | 943.6 | 2 × 457.8 | 2 × 465.8 (Communities 2 × 463.8) |
| 1280 | 340.3 | 891.7 | 2 × 431.85 | 2 × 439.85 |
| 1024 | 340.05 | 607.95 | 1 × 607.95 | 1 × 607.95 |
| 768 (stacked) | 380 | 720 | 2 × 346 | 1 × 720 (Communities 2 × 352) |
| 390 (stacked) | 342 | 342 | 1 × 342 | 1 × 342 |

- **Stacking:** the left column sits beside the right side from a 976px viewport. Below that it stacks on top, at `min(100%, 380px)`.
- **Inner grids:** the card grids inside the sections use `repeat(auto-fill, minmax(min(100%, 360px), 1fr))`. My communities uses a 320px minimum. Inside an Overview column (457.8px), every inner grid has one track.

## 1. Tab bar
```css
/* Bar */
position: sticky; top: var(--top-bar-height); z-index: 20; margin: 18px -24px 0; padding: 10px 24px; background: #FFFFFF;

/* Rail: role="tablist" aria-label="Dashboard sections" */
display: flex; justify-content: safe center; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 0 48px;
mask-image: linear-gradient(to right, transparent, #000 48px, #000 calc(100% - 48px), transparent);

/* Tab: role="tab", aria-selected */
position: relative; flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; height: 44px;
padding: 0 16px 0 13px; border: 0; border-radius: 999px; font-size: 14.5px; white-space: nowrap;
/* selected */   font-weight: 600; background: #DCEAE3; color: #066349;   /* tabStyle "Lime": #B0E800 and #013334 */
/* unselected */ font-weight: 500; background: #F3F4F2; color: #1F2937;
/* hover, unselected */ background: #E8F1ED;
/* icon */       20px; bulk when selected, twotone otherwise

/* New requests dot: Places tab only, aria-hidden */
position: absolute; top: 6px; right: 8px; width: 9px; height: 9px; border-radius: 999px; background: #E02D3C;
pointer-events: none; animation: tkPulse 1.6s ease-out infinite;
```
| Tab | Icon | Shows |
|---|---|---|
| Overview | `hgi-dashboard-circle` | All four sections |
| My reservations | `hgi-calendar-03` | My reservations |
| Places | `hgi-store-verified-01` | My places |
| My experiences (hosting) | `hgi-ticket-01` | My experiences (hosting) |
| Communities | `hgi-user-multiple` | My communities |

- **Places dot:** shows while places you run have new reservation requests. The tab's aria-label then reads "Places, {n} new reservation request(s)".
- **Changing tab:** if the bar is stuck, the page jumps so the new content starts just under the bar. This is the same rule as the profile tabs.

## 2. Dashboard card (left column)
```css
/* Shell */
background: #F9FAFB; border: 0.5px solid #E5E7EB; border-radius: 12px; padding: 6px;
display: flex; flex-direction: column; gap: 6px;

/* Card */
background: #FFFFFF; border: 0.5px solid #F3F4F2; border-radius: 12px; box-shadow: 0 0 4px 0 rgba(0,0,0,.12); overflow: hidden;

/* Top block */
display: flex; flex-direction: column; gap: 16px; padding: 18px;
/* h1 */ margin: 0; font-size: 21px; font-weight: 700; line-height: 1.25; letter-spacing: -.35px; color: #013334;   /* "Dashboard" */

/* Balance row */
display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px;
/* label line */ display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #5B6B66;
/* "Only you" */ display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 999px;
                 background: #F3F4F2; font-size: 11.5px; font-weight: 600; color: #5B6B66; white-space: nowrap;   /* hgi-lock 12px */
/* total */      margin-top: 4px; font-size: 28px; font-weight: 700; line-height: 1.15; letter-spacing: -.6px; color: #013334;

/* Withdraw */
display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 18px 0 22px; border: 0; border-radius: 999px;
background: #B0E800; color: #013334; font-size: 16px; font-weight: 600; white-space: nowrap;
/* hover */ filter: brightness(.96);
/* icon, after the label */ hgi-arrow-down-02, 19px

/* Balance rows: the 1px gaps draw the dividers */
display: flex; flex-direction: column; gap: 1px; background: #EDF0EE; border-top: 1px solid #EDF0EE;
/* row   */ display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; padding: 10px 18px; background: #FFFFFF;
/* label */ font-size: 13.5px; color: #5B6B66;
/* value */ font-size: 14.5px; font-weight: 700; color: #1F2937; white-space: nowrap;
```
| Element | Sample |
|---|---|
| Total | "KES 34,839.80" (Available + Pending) |
| Available | "KES 28,400.00" |
| Pending | "KES 6,439.80" |
| Tickets on sale | "KES 81,000.00" (fixed sample, not part of the total) |

- **Withdraw:** opens the Withdraw panel.
- **Money format:** "KES " followed by en-US grouping and always two decimals.

## 3. Hosting plan card (left column)
Shown when the person is signed in and owns at least one community, or already has a plan.

```css
/* Shell: same as the Dashboard card */
/* Card */
background: #FFFFFF; border: 0.5px solid #F3F4F2; border-radius: 12px; box-shadow: 0 0 4px 0 rgba(0,0,0,.12);
padding: 18px; display: flex; flex-direction: column; gap: 14px;

/* Label */      font-size: 13.5px; color: #5B6B66;   /* "Hosting plan" */
/* Name row */   display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px;
/* plan name */  font-size: 21px; font-weight: 700; line-height: 1.25; letter-spacing: -.35px; color: #013334;
/* price */      font-size: 14.5px; font-weight: 600; color: #1F2937; white-space: nowrap;
/* Status row */ display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px;
/* status pill */ display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px;
                  font-size: 13px; font-weight: 600; white-space: nowrap;   /* icon 14px */
/* fee */        display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #066349;   /* hgi-ticket-01 15px */
/* note */       margin: 0; font-size: 13.5px; line-height: 1.5; color: #5B6B66; text-wrap: pretty;
/* Buttons */    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
```
**With a plan**

| Plan | Price | Fee | Status pill |
|---|---|---|---|
| Basic | "Free" | "8% per paid ticket" | `#E8F1ED` and `#066349`, `hgi-checkmark-circle-02`, "Always free" |
| Premium | "$15 / month" | "4% per paid ticket" | `#E8F1ED` and `#066349`, `hgi-calendar-03`, "Renews {Ddd D Mon}" |
| Business | "$49 / month" | "4% per paid ticket" | Same as Premium |
| Any paid plan, cancelled | | | `#FFF6E5` and `#7A4A00`, `hgi-clock-01`, "Ends {Ddd D Mon}" |

**Note text**
- **Paid plans:** "Covers every community you own." If the person owns a verified business, it adds "Verified businesses pay 8% per paid ticket."
- **Basic:** "Free for {verified businesses}." If they also own unverified communities, it continues "{others} need(s) Premium or Business to host."
- **Names:** one community is shown by name, two as "A and B", and three or more as "{n} communities".

| Button | Shown | Style | Result |
|---|---|---|---|
| Change plan | Always | 44px, padding 0 18, `#E8F1ED`, `#066349`, 14.5px 600, hover `#DCEAE3` | Opens the Plans panel to change plan |
| Cancel plan | Paid plan, active | 44px, padding 0 10, transparent, `#E02D3C`, 14.5px 500, underline on hover | Confirmation (below) |
| Keep my plan | Plan cancelled | 44px, padding 0 18, `#B0E800`, `#013334`, 14.5px 600, hover `#A3D900` | Reactivates. Toast: "Your {plan} plan renews on {Ddd D Mon}." |

**Cancel confirmation** (shared confirm dialog, danger style)
- **Title:** "Cancel your {plan} plan?"
- **Body:** "You keep {plan} until {day}." followed by "After that you move to Basic, which is free for your verified businesses." With no verified business, the second sentence is "After that your communities need a plan again to host."
- **Buttons:** "Cancel plan" (danger) and "Keep plan".
- **Toast:** "Plan cancelled. You keep {plan} until {day}, then move to Basic." With no verified business it ends "… until {day}."

**Without a plan**
- **Title:** "No plan yet", in the plan name style.
- **Text:** 14px, line height 1.5, `#3C4A45`. "Your communities need Premium or Business to host. Communities that own a claimed place host free on Basic."
- **Choose a plan:** `align-self: flex-start`, 44px tall, padding 0 18, `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)`, white, 14.5px 600, hover `filter: brightness(1.06)`. Opens the Plans panel.

## Shared section parts
```css
/* Section */
display: flex; flex-direction: column; gap: 12px; min-width: 0;
/* h2 */       margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -.2px; color: #013334;
/* subtitle */ margin: 4px 0 0; font-size: 13.5px; color: #5B6B66; text-wrap: pretty;

/* Panel shell: wraps the date rails and place cards */
background: #F9FAFB; border: 0.5px solid #E5E7EB; border-radius: 14px; padding: 6px;
display: flex; flex-direction: column; gap: 6px; min-width: 0;

/* Item card: bookings, places, hosted experiences */
background: #FFFFFF; border-radius: 12px; box-shadow: 0 1px 3px rgba(1,51,52,.07); display: flex; flex-direction: column; min-width: 0;
/* main button */ display: flex; align-items: center; gap: 14px; width: 100%; min-height: 84px; padding: 12px 14px;
                  border: 0; border-radius: 12px; background: transparent; text-align: left;
/* hover */       background: #FAFBFA;
/* image */       width: 60px; height: 60px; border-radius: 12px; object-fit: cover; background: #E8F1ED;   /* alt "" */
/* text column */ flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 6px;   /* 5px on place cards */
/* title */       font-size: 16px; font-weight: 600; line-height: 1.3; color: #1F2937; one line, ellipsis
/* time line */   display: flex; align-items: center; gap: 7px; font-size: 14.5px; color: #5B6B66;   /* hgi-clock-01 17px, text ellipsis */

/* Date badge: right side of booking and hosting cards */
flex: 0 0 auto; width: 50px; height: 58px; border-radius: 10px; display: flex; flex-direction: column;
align-items: center; justify-content: center; line-height: 1.15; color: #1F2937;
background: linear-gradient(180deg,#EEF4FD 0%,#DDE8FA 100%);
/* month */ font-size: 14px;   /* day */ font-size: 17px; font-weight: 700;

/* Date rail */
display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 0 2px;
/* day button: aria-pressed */ flex: 0 0 auto; height: 48px; padding: 0; border: 0; background: transparent;
/* hover */                    filter: brightness(.97);
/* day pill */ display: inline-flex; align-items: center; gap: 5px; height: 42px; padding: 0 17px; border-radius: 999px;
               border: 1px solid <border>; background: <bg>; font-size: 15px; white-space: nowrap;
               /* month, then the day number at 700 */

/* Stat chip: place and hosting cards */
display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 18px; border: 0; border-radius: 999px;
background: #FFFFFF; box-shadow: 0 1px 3px rgba(1,51,52,.07); font-size: 14.5px; color: #5B6B66; white-space: nowrap;
/* hover */ color: #013334;
/* value, after the label */ font-weight: 700; color: #1F2937;
/* alert dot, role="img" aria-label="New" */ width: 8px; height: 8px; border-radius: 999px; background: #E02D3C;
/* row */ display: flex; flex-wrap: wrap; gap: 8px;

/* Big action button: Connect a place, hosting CTA */
align-self: flex-start; display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 52px;
padding: 0 28px 0 22px; border: 0; border-radius: 999px; background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%);
color: #FFFFFF; font-size: 15.5px; font-weight: 600; white-space: nowrap;
/* hover */ filter: brightness(1.06);
/* icon */  20px
```
**Day pill colours**

| State | Background | Border | Month | Number |
|---|---|---|---|---|
| Upcoming | `#FFFFFF` | `#E1E6E3` | `#5B6B66` | `#1F2937` |
| Upcoming, selected | `#A8F3D0` | `#A8F3D0` | `#065941` | `#065941` |
| Past | `#EEF0EE` | `#E6EAE7` | `#A3ADA9` | `#A3ADA9` |
| Past, selected | `#DDE3DF` | `#DDE3DF` | `#3C4A45` | `#1F2937` |

**Date rail behaviour**
- **Dates:** only dates that have something are shown, oldest first.
- **Default:** the first date that's today or later. If there's none, the latest past date.
- **Centring:** the selected pill is centred in the rail. It jumps there on load and scrolls smoothly when a day is picked. The scroll position is the pill's offset minus (rail width - pill width) / 2, never below 0.

## 4. My reservations (column A)
- **Title:** "My reservations". **Subtitle:** "Your experiences & reservations".
- **Panel:** wrapped in a grid `repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 8px 12px`. Inside it are the date rail, then a column of item cards with an 8px gap.
- **Date rail aria-label:** "{Weekday} {D} {Mon}, {n} booking(s)", plus ", past" for past dates.
- **Selected day:** shows every item on that date.

**Item types**

| Type | Comes from | Time line | Opens |
|---|---|---|---|
| Ticket | Experiences the person booked | "{Weekday}, HH:MM - HH:MM" | The experience page, scrolled to their tickets |
| Attended | Past experiences they went to | "{Weekday}, {time}" | The past booking |
| Place booking | Their own bookings at places | "{Weekday}, {time}, {party}", for example "Saturday, 7:30 PM, 4 guests" | The place page, on their bookings |

For a place booking, the title is "Table for {n}" at restaurants and "Visit for {n}" elsewhere.

**Attended row**
- **Container:** under the main button. `display: flex; flex-wrap: wrap; align-items: center; gap: 0 20px; margin: 0 14px 0 88px; border-top: 1px solid #EEF1EF`. The 88px left margin lines it up with the text (14 + 60 + 14).
- **Buttons:** 44px tall, padding 0, transparent, 14px 600 `#066349`, 16px icon.
  - "Share a moment" (`hgi-camera-01`) opens the moment composer.
  - "Leave a review" (`hgi-star`) opens the review composer.
- **Once reviewed:** "Leave a review" is replaced by "You rated {n}". It's plain text: 14px `#5B6B66`, gap 5, with a bulk `hgi-star` at 15px in `#066349`.

**Place booking row**
- **Container:** `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 16px; margin: 0 14px 0 88px; padding: 6px 0 4px; border-top: 1px solid #EEF1EF`.
- **Status pill:** min-height 28, padding 0 10, radius 999, 13px 600, 15px icon.
- **Actions:** `display: flex; flex-wrap: wrap; gap: 4px 20px`. Each button is 44px tall, radius 999, 14px 600 with a 16px icon. Hover `filter: brightness(.96)`, active `transform: scale(.98)`.
  - **Pay:** `#B0E800` with `#013334` text and padding 0 18 0 14.
  - **Others:** transparent with padding 0. Text is `#066349`, or `#E02D3C` for Cancel.

| Status | Pill | Colours | Icon | Actions |
|---|---|---|---|---|
| Request sent | Waiting for an answer | `#FFF6E5`, `#7A4A00` | `hgi-hourglass` | Change request, Cancel request |
| Accepted | Accepted, not paid yet | `#FFF6E5`, `#7A4A00` | `hgi-wallet-02` | Pay KES {amount}, Cancel booking |
| Confirmed | Confirmed | `#E8F1ED`, `#066349` | `hgi-checkmark-circle-02` | Cancel booking |
| Visited | Visited | `#E8F1ED`, `#066349` | `hgi-checkmark-circle-02` | none |
| No-show | Missed | `#F3F4F2`, `#3F4B47` | `hgi-clock-01` | none |
| Declined | Declined | `#FEF3F2`, `#B42318` | `hgi-cancel-circle` | Book another time |
| Expired | Expired | `#F3F4F2`, `#3F4B47` | `hgi-clock-01` | Book another time |
| Not paid in time | Released | `#F3F4F2`, `#3F4B47` | `hgi-clock-01` | Book another time |

- **Which bookings show:** today and later. Declined, expired and released ones stay for 2 days after their date. Cancelled bookings never show.
- **Icons:** Change request `hgi-edit-04`, Cancel `hgi-delete-01`, Book another time `hgi-calendar-add-01`, Pay `hgi-wallet-02`.

**Empty**
- **Card:** white, radius 12, the item shadow, padding 10 16. `display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px`.
- **Text:** "No bookings yet." 14px `#5B6B66`.
- **Find experiences:** a 44px text button, padding 0 4, 14px 600 `#066349`. Goes to Discover on the Experiences tab.

## 5. My places (column A)
- **Title:** "My places".
- **Subtitle:** "These are the places you own" when there are places, otherwise "Earn and manage reservations by adding your place or business."
- **Which places:** claimed by a community the person owns.

**Place card**
- **Grid:** `repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 8px 12px; align-items: start`.
- **Card:** a panel shell holding an item card, then a row of stat chips.
- **Main button:** shows the place name, then the locality (14.5px `#5B6B66`), then `hgi-arrow-up-right-01` at 20px in `#066349` on the right. It opens the place page.

| Stat chip | When | Result |
|---|---|---|
| "Set up reservations" | Reservations aren't set up | Opens the place and its reservation settings |
| "Reservation requests {n}" | Reservations are set up. Red dot when n > 0 | Opens the requests list at the earliest request date, or today |
| "Boost this place" | Not boosted | Opens the place and Boost |
| "Boosted until {Ddd D Mon}" | Boosted | Opens the place and Boost |

**Your claims:** shown while any claim isn't approved, or was approved in the last 7 days.
- **Block:** `display: flex; flex-direction: column; gap: 12px; margin-top: 12px`, with h2 "Your claims" and the same grid.
- **Claim button:** `display: flex; align-items: center; gap: 14px; min-height: 72px; padding: 10px 14px 10px 10px; border-radius: 12px; background: #F3F4F2`. Hover `#EDEFEC`. It opens the claim.
  - Image: 52 × 52, radius 12. Without one: a `#E8F1ED` square with `hgi-store-verified-01` at 22px in `#066349`.
  - Name: 15px 600 `#1F2937`, ellipsis. Sub: "For {community}", 13.5px `#5B6B66`.
  - Status pill: 30px tall, padding 0 12, radius 999, 13px 600.

| Claim status | Pill | Colours |
|---|---|---|
| In review | Under review | `#FFF6E5`, `#7A4A00` |
| More documents needed | Needs more documents | `#FFF6E5`, `#7A4A00` |
| Rejected | Not approved | `#FEF3F2`, `#B42318` |
| Approved (7 days) | Approved | `#E8F1ED`, `#066349` |

**Connect a place:** big action button with `hgi-store-verified-01`. It's always shown and opens the claim flow.

## 6. My experiences (hosting) (column B)
- **Title:** "My experiences (hosting)".
- **Subtitle:** "These are the active experiences created/co-hosted by you".
- **Panel:** a panel shell holding the date rail, then a grid `repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 16px 12px`.
- **Each experience:** a column (gap 8) with an item card, then a row of stat chips.

**Rail and items**
- **Rail:** one pill per date that has hosted experiences. The aria-label reads "{Weekday} {D} {Mon}, {n} experience(s)", plus ", past" for past dates.
- **Items:** the selected date's experiences, then any experiences with no date yet.
- **Time line:** "{Weekday} {D} {Mon}, HH:MM - HH:MM", or "Time to be set". Undated experiences have no date badge.

| Stat chip | Value | Result |
|---|---|---|
| Tickets created | count | Opens the experience on its tickets tab |
| Sold | count | Opens the experience on its sales tab |
| Total sales | "KES 99,000" or "Free" | Opens the experience on its sales tab |

**Empty:** a box with padding 12 16, radius 12, `#F3F4F2`, 14px, line height 1.45, `#5B6B66`.
- If they own a community: "You aren’t hosting anything right now."
- If not: "Hosting needs a community you own."

**Hosting button:** a big action button, always shown.

| Situation | Label | Icon | Result |
|---|---|---|---|
| No community owned | Create a community | `hgi-user-add-02` | Starts a new community |
| Saved draft | Continue your draft | `hgi-edit-04` | Opens Create experience on the draft |
| Otherwise | Create an experience | `hgi-add-circle` | Opens Create experience |

## 7. My communities (column B)
**Title:** the h2 contains a button, aria-label "See all my communities".
- Style: `display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0`, 17px 700 `#013334`, with `hgi-arrow-right-01` at 22px. Hover `#066349`.
- It opens the Communities destination, on "mine" if the person owns one, otherwise "following".

**List:** communities the person owns, then communities they joined.
- Grid: `repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 8px 16px; margin-top: -8px`.

```css
/* Community row button: opens the community */
display: flex; align-items: center; gap: 14px; min-height: 80px; padding: 8px; border: 0; border-radius: 12px; background: transparent;
/* hover */ background: #F3F4F2;
/* image */ width: 64px; height: 64px; border-radius: 12px; object-fit: cover; background: #E8F1ED;
/* text column */ flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px;
/* name row */ display: flex; align-items: center; gap: 8px;
/* name */ font-size: 16px; font-weight: 600; line-height: 1.3; color: #1F2937; one line, ellipsis
/* briefcase, verified businesses: role="img" aria-label="Verified business" */ hgi-briefcase-01, 19px, #066349
/* arrow */ hgi-arrow-up-right-01, 20px, #066349
/* line */ font-size: 14.5px; color: #5B6B66;
```
- **Line:** "You run this, {n} past experiences hosted", or "{n} past experiences hosted" for communities they joined.
- **Empty:** "You aren’t in a community yet. Joining is instant." 14px `#5B6B66`.

## State
| State | Values |
|---|---|
| `dashTab` | overview, res, places, host, comms. Reset to overview when opened |
| `ccDay` | selected booking date, as days from today. null means the default |
| `ccHDay` | selected hosting date. null means the default |

The page also reads: wallet balances, plan (`subNow`), owned and joined communities, verified businesses, booked experiences, past attended experiences, the person's own place bookings, owned places with reservation settings, requests and boosts, claims, hosted experiences with ticket stats, and any saved experience draft.

## Accessibility
- **Tabs:** a `tablist` of `tab` buttons with `aria-selected`. Add `aria-controls`, a `tabpanel` and arrow-key navigation in the build; the prototype has none of these.
- **Labels:** each section is a `<section>` with an aria-label, and the left column is an `<aside>`.
- **Date rails:** day buttons use `aria-pressed` and a full date label.
- **Status dots:** the red alert dots are `role="img"` labelled "New". The pulsing tab dot is `aria-hidden`, and its meaning is in the tab's aria-label.
- **Focus:** the prototype has no custom focus style. Use the codebase's standard visible focus ring.

## Tokens used
| Value | Where |
|---|---|
| `#F9FAFB`, `0.5px solid #E5E7EB` | Panel shells |
| `0 0 4px 0 rgba(0,0,0,.12)` | Dashboard and plan cards |
| `0 1px 3px rgba(1,51,52,.07)` | Item cards, stat chips, empty card |
| `#EDF0EE` | Balance dividers |
| `#EEF1EF` | Action row dividers in item cards |
| `#FAFBFA` | Item hover |
| `linear-gradient(180deg,#EEF4FD 0%,#DDE8FA 100%)` | Date badge |
| `#DCEAE3` | Selected tab, Change plan hover |
| `#A8F3D0`, `#065941` | Selected upcoming day |
| `#B0E800`, `#A3D900` | Withdraw, Pay, Keep my plan |
| `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)` | Choose a plan, Connect a place, hosting button |
| `#E8F1ED`, `#066349` | Active status pills, Change plan, links, icons |
| `#FFF6E5`, `#7A4A00` | Waiting and cancelled pills |
| `#FEF3F2`, `#B42318` | Declined, Not approved |
| `#E02D3C` | Alert dots, Cancel plan, cancel actions |
| `#013334` | Titles, totals |
| `#1F2937` | Item titles, values |
| `#3C4A45`, `#3F4B47` | No plan text, grey pills |
| `#5B6B66` | Secondary text |
| 12px | Cards, images |
| 14px | Panel shells |
| 10px | Date badge |
| 999px | Pills, chips, buttons |

| Text | Size | Weight | Extra |
|---|---|---|---|
| Total | 28 | 700 | line height 1.15, letter-spacing -0.6px |
| "Dashboard", plan name | 21 | 700 | line height 1.25, letter-spacing -0.35px |
| Section titles | 17 | 700 | letter-spacing -0.2px |
| Date badge day | 17 | 700 | |
| Withdraw | 16 | 600 | |
| Item titles | 16 | 600 | line height 1.3 |
| Big buttons | 15.5 | 600 | |
| Day pills | 15 | 400, number 700 | |
| Claim names | 15 | 600 | |
| Time lines, locality, stat chips, community lines | 14.5 | 400 | |
| Balance values, plan price | 14.5 | 600 to 700 | |
| Plan buttons | 14.5 | 500 to 600 | |
| Row actions, empty text, date badge month | 14 | 400 to 600 | |
| Subtitles, labels, plan note | 13.5 | 400 | |
| Status pills, fee | 13 | 600 | |
| "Only you" | 11.5 | 600 | |

## Keyframes
```css
@keyframes tkPulse{0%{box-shadow:0 0 0 0 rgba(224,45,60,.65)}75%,100%{box-shadow:0 0 0 6px rgba(224,45,60,0)}}
```

## Open items
1. **Pasted Figma data:** the My reservations subtitle contains two empty `<span>`s holding about 52 KB of pasted Figma clipboard data. Its text also sits in a `white-space: pre-wrap` span with a trailing line break. The extracted markup below has them removed; remove them from the prototype too.
2. **Bookings, not reservations:** the project rule is that guests make bookings and places receive reservations. "My reservations" and "Your experiences & reservations" describe the person's own bookings, so the tab, section title and subtitle should say bookings. The subtitle also uses "&".
3. **Missing full stops:** "These are the places you own" and "These are the active experiences created/co-hosted by you" have none, and the second uses a slash.
4. **Balances:** "Tickets on sale" is a fixed sample value and isn't in the total. The profile's Account balance shows Paid out instead. Confirm which balances belong on the Dashboard.
5. **Briefcase colour:** on community rows the briefcase is `#066349`, but the rule says light grey `#8A9793` next to names on cards, with a "Verified business" tooltip. The tooltip is also missing.
6. **One section tabs:** on the My reservations tab, the single panel only fills the first 465.8px track, leaving the right half empty.
7. **Sample numbers:** "past experiences hosted" counts are generated from the community id, and the ticket stats are fixed per sample experience.
8. **Borders:** panel shells and cards have 0.5px borders, but Tukai cards have no borders. Confirm before building.
9. **No sign-in reason:** opening the Dashboard signed out shows Create account without a reason pill. "dash" has no entry in the reasons list.
10. **Reduced motion:** the Places dot pulses forever. Stop the pulse under `prefers-reduced-motion`.
11. **Tour guides:** people with no community see "Create a community", but guided tours run by a tour guide don't need one. Decide what a tour guide sees here.

## Exact markup
Verbatim from `Tukai Web.dc.html` (the `showDash` block), with the pasted Figma data removed:
- `{{ }}` holes are filled by the logic below.
- `style-hover` and `style-active` hold those states.
- `<sc-if>` renders its children only when its value is true.
- `<sc-for>` repeats its child once per item.

```html
    <sc-if value="{{ showDash }}">
<div data-dash-tabs="1" style="position:sticky;top:{{ topBarH }};z-index:20;margin:18px -24px 0;padding:10px 24px;background:#FFFFFF;">
    <div role="tablist" aria-label="Dashboard sections" data-pf-rail="1" style="display:flex;justify-content:safe center;gap:8px;overflow-x:auto;scrollbar-width:none;padding:0 48px;-webkit-mask-image:linear-gradient(to right,transparent,#000 48px,#000 calc(100% - 48px),transparent);mask-image:linear-gradient(to right,transparent,#000 48px,#000 calc(100% - 48px),transparent);">
      <sc-for list="{{ dash.tabs }}" as="t" hint-placeholder-count="5">
        <sc-if value="{{ t.on }}"><button type="button" role="tab" aria-selected="true" onClick="{{ t.onClick }}" aria-label="{{ t.aria }}" style="position:relative;flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 13px;border:none;border-radius:999px;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;background:{{ t.onBg }};color:{{ t.onFg }};"><i class="{{ t.iconOn }}" style="font-size:20px;flex:0 0 auto;color:{{ t.onFg }};" aria-hidden="true"></i>{{ t.label }}<sc-if value="{{ t.hasDot }}">{{ t.dotEl }}</sc-if></button></sc-if>
        <sc-if value="{{ t.off }}"><button type="button" role="tab" aria-selected="false" onClick="{{ t.onClick }}" aria-label="{{ t.aria }}" style="position:relative;flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 13px;border:none;border-radius:999px;font-family:'Google Sans';font-size:14.5px;font-weight:500;cursor:pointer;white-space:nowrap;background:#F3F4F2;color:#1F2937;" style-hover="background:#E8F1ED;"><i class="{{ t.iconOff }}" style="font-size:20px;flex:0 0 auto;color:#1F2937;" aria-hidden="true"></i>{{ t.label }}<sc-if value="{{ t.hasDot }}">{{ t.dotEl }}</sc-if></button></sc-if>
      </sc-for>
    </div>
</div>
      <div data-dash="1" data-screen-label="Dashboard" style="padding-top:18px;display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start;">

        <aside aria-label="Account balance" style="flex:1 1 340px;max-width:380px;min-width:0;display:flex;flex-direction:column;gap:8px;">
          <div style="background:#F9FAFB;border:0.5px solid #E5E7EB;border-radius:12px;padding:6px;display:flex;flex-direction:column;gap:6px;">
            <div style="background:#FFFFFF;border:0.5px solid #F3F4F2;border-radius:12px;box-shadow:0 0 4px 0 rgba(0,0,0,.12);overflow:hidden;">
              <div style="display:flex;flex-direction:column;gap:16px;padding:18px;">
                <h1 style="margin:0;font-family:'Google Sans';font-size:21px;font-weight:700;color:#013334;letter-spacing:-.35px;line-height:1.25;">Dashboard</h1>
                <div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;">
                  <div style="min-width:0;">
                    <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:#5B6B66;">Account balance<span style="display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;background:#F3F4F2;font-size:11.5px;font-weight:600;color:#5B6B66;white-space:nowrap;"><i class="hgi-twotone hgi-lock" style="font-size:12px;" aria-hidden="true"></i>Only you</span></div>
                    <div style="margin-top:4px;font-size:28px;font-weight:700;color:#013334;letter-spacing:-.6px;line-height:1.15;">{{ dash.total }}</div>
                  </div>
                  <button type="button" onClick="{{ dash.onWithdraw }}" style="display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 18px 0 22px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(0.96);">Withdraw<i class="hgi-twotone hgi-arrow-down-02" style="font-size:19px;" aria-hidden="true"></i></button>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:1px;background:#EDF0EE;border-top:1px solid #EDF0EE;">
                <sc-for list="{{ dash.balances }}" as="b" hint-placeholder-count="3">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:52px;padding:10px 18px;background:#FFFFFF;">
                    <span style="font-size:13.5px;color:#5B6B66;">{{ b.label }}</span>
                    <span style="font-size:14.5px;font-weight:700;color:#1F2937;white-space:nowrap;">{{ b.value }}</span>
                  </div>
                </sc-for>
              </div>
            </div>
          </div>
          <sc-if value="{{ dash.planShow }}">
            <div style="background:#F9FAFB;border:0.5px solid #E5E7EB;border-radius:12px;padding:6px;display:flex;flex-direction:column;gap:6px;">
              <div style="background:#FFFFFF;border:0.5px solid #F3F4F2;border-radius:12px;box-shadow:0 0 4px 0 rgba(0,0,0,.12);padding:18px;display:flex;flex-direction:column;gap:14px;">
                <sc-if value="{{ dash.planHas }}" hint-placeholder-val="{{ true }}">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <span style="font-size:13.5px;color:#5B6B66;">Hosting plan</span>
                    <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 12px;">
                      <span style="font-size:21px;font-weight:700;color:#013334;letter-spacing:-.35px;line-height:1.25;">{{ dash.planName }}</span>
                      <span style="font-size:14.5px;font-weight:600;color:#1F2937;white-space:nowrap;">{{ dash.planPrice }}</span>
                    </div>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;">
                    <sc-if value="{{ dash.planActive }}" hint-placeholder-val="{{ true }}"><span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;background:#E8F1ED;color:#066349;font-size:13px;font-weight:600;white-space:nowrap;"><i class="hgi-twotone {{ dash.planStIcon }}" style="font-size:14px;flex:0 0 auto;" aria-hidden="true"></i>{{ dash.planStatus }}</span></sc-if>
                    <sc-if value="{{ dash.planCancelled }}"><span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;background:#FFF6E5;color:#7A4A00;font-size:13px;font-weight:600;white-space:nowrap;"><i class="hgi-twotone hgi-clock-01" style="font-size:14px;flex:0 0 auto;" aria-hidden="true"></i>{{ dash.planStatus }}</span></sc-if>
                    <span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#066349;"><i class="hgi-twotone hgi-ticket-01" style="font-size:15px;flex:0 0 auto;" aria-hidden="true"></i>{{ dash.planFee }}</span>
                  </div>
                  <sc-if value="{{ dash.hasPlanNote }}"><p style="margin:0;font-size:13.5px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">{{ dash.planNote }}</p></sc-if>
                  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
                    <button type="button" onClick="{{ dash.onPlanChange }}" style="height:44px;padding:0 18px;border:none;border-radius:999px;background:#E8F1ED;color:#066349;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="background:#DCEAE3;">Change plan</button>
                    <sc-if value="{{ dash.planCanCancel }}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{ dash.onPlanCancel }}" style="height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;color:#E02D3C;font-family:'Google Sans';font-size:14.5px;font-weight:500;cursor:pointer;white-space:nowrap;" style-hover="text-decoration:underline;">Cancel plan</button></sc-if>
                    <sc-if value="{{ dash.planCancelled }}"><button type="button" onClick="{{ dash.onPlanKeep }}" style="height:44px;padding:0 18px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="background:#A3D900;">Keep my plan</button></sc-if>
                  </div>
                </sc-if>
                <sc-if value="{{ dash.planNone }}">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <span style="font-size:13.5px;color:#5B6B66;">Hosting plan</span>
                    <span style="font-size:21px;font-weight:700;color:#013334;letter-spacing:-.35px;line-height:1.25;">No plan yet</span>
                  </div>
                  <p style="margin:0;font-size:14px;line-height:1.5;color:#3C4A45;text-wrap:pretty;">{{ dash.noneLine }}</p>
                  <button type="button" onClick="{{ dash.onPlanPick }}" style="align-self:flex-start;height:44px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(1.06);">Choose a plan</button>
                </sc-if>
              </div>
            </div>
          </sc-if>
        </aside>

        <div style="flex:999 1 560px;min-width:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:28px;align-items:start;">
          <sc-if value="{{ dash.colA }}" hint-placeholder-val="{{ true }}">
            <div style="display:flex;flex-direction:column;gap:28px;min-width:0;">
              <sc-if value="{{ dash.showRes }}" hint-placeholder-val="{{ true }}">
                <section aria-label="My reservations" style="display:flex;flex-direction:column;gap:12px;min-width:0;">
                <div><h2 style="margin:0;font-family:'Google Sans';font-size:17px;font-weight:700;color:#013334;letter-spacing:-.2px;">My reservations</h2><p style="margin:4px 0 0;font-size:13.5px;color:#5B6B66;text-wrap:pretty;"><span style="white-space: pre-wrap;">Your experiences &amp; reservations
</span></p></div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:8px 12px;min-width:0;"><div style="background:#F9FAFB;border:0.5px solid #E5E7EB;border-radius:14px;padding:6px;display:flex;flex-direction:column;gap:6px;min-width:0;">
                <div data-cal-rail="1" data-pf-rail="1" ref="{{ dash.railRef }}" style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:0 2px;">
                <sc-for list="{{ dash.dates }}" as="d" hint-placeholder-count="6">
                <button type="button" onClick="{{ d.onClick }}" aria-pressed="{{ d.pressed }}" aria-label="{{ d.aria }}" style="flex:0 0 auto;display:flex;align-items:center;height:48px;padding:0;border:none;background:transparent;cursor:pointer;font-family:'Google Sans';" style-hover="filter:brightness(0.97);">
                <span style="display:inline-flex;align-items:center;gap:5px;height:42px;padding:0 17px;border-radius:999px;border:1px solid {{ d.bc }};background:{{ d.bg }};font-size:15px;white-space:nowrap;">
                <span style="color:{{ d.monFg }};">{{ d.mon }}</span>
                <span style="font-weight:700;color:{{ d.fg }};">{{ d.num }}</span>
                </span>
                </button>
                </sc-for>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;min-width:0;"><sc-for list="{{ dash.items }}" as="c" hint-placeholder-count="2">
                <div style="background:#FFFFFF;border-radius:12px;box-shadow:0 1px 3px rgba(1,51,52,.07);display:flex;flex-direction:column;min-width:0;">
                <button type="button" onClick="{{ c.onOpen }}" style="display:flex;align-items:center;gap:14px;width:100%;min-height:84px;padding:12px 14px;border:none;border-radius:12px;background:transparent;cursor:pointer;text-align:left;font-family:'Google Sans';min-width:0;" style-hover="background:#FAFBFA;">
                <img loading="lazy" src="{{ c.img }}" alt="" style="width:60px;height:60px;border-radius:12px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
                <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px;"><span style="font-size:16px;font-weight:600;color:#1F2937;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">{{ c.title }}</span><span style="display:flex;align-items:center;gap:7px;font-size:14.5px;color:#5B6B66;min-width:0;"><i class="hgi-twotone hgi-clock-01" style="font-size:17px;flex:0 0 auto;" aria-hidden="true"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.when }}</span></span></span>
                <span style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;width:50px;height:58px;border-radius:10px;background:linear-gradient(180deg,#EEF4FD 0%,#DDE8FA 100%);color:#1F2937;line-height:1.15;"><span style="font-size:14px;">{{ c.bMon }}</span><span style="font-size:17px;font-weight:700;">{{ c.bDay }}</span></span>
                </button>
                <sc-if value="{{ c.isPast }}">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0 20px;margin:0 14px 0 88px;border-top:1px solid #EEF1EF;">
                <button type="button" onClick="{{ c.onShare }}" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0;border:none;background:transparent;cursor:pointer;font-family:'Google Sans';font-size:14px;white-space:nowrap;font-weight:600;color:#066349;"><i class="hgi-twotone hgi-camera-01" style="font-size:16px;" aria-hidden="true"></i>Share a moment</button>
                <sc-if value="{{ c.canReview }}"><button type="button" onClick="{{ c.onReview }}" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0;border:none;background:transparent;cursor:pointer;font-family:'Google Sans';font-size:14px;white-space:nowrap;font-weight:600;color:#066349;"><i class="hgi-twotone hgi-star" style="font-size:16px;" aria-hidden="true"></i>Leave a review</button></sc-if>
                <sc-if value="{{ c.reviewed }}"><span style="display:inline-flex;align-items:center;gap:5px;height:44px;font-size:14px;color:#5B6B66;white-space:nowrap;"><i class="hgi-bulk hgi-star" style="font-size:15px;color:#066349;" aria-hidden="true"></i>You rated {{ c.rating }}</span></sc-if>
                </div>
                </sc-if>
                <sc-if value="{{ c.isRsv }}">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 16px;margin:0 14px 0 88px;padding:6px 0 4px;border-top:1px solid #EEF1EF;">
                <span style="flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;border-radius:999px;background:{{ c.stBg }};color:{{ c.stFg }};font-size:13px;font-weight:600;"><i class="hgi-twotone {{ c.stIcon }}" style="font-size:15px;flex:0 0 auto;" aria-hidden="true"></i>{{ c.stLabel }}</span>
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 20px;">
                <sc-for list="{{ c.acts }}" as="a" hint-placeholder-count="1"><button type="button" onClick="{{ a.onClick }}" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:{{ a.pad }};border:none;border-radius:999px;background:{{ a.bg }};cursor:pointer;font-family:'Google Sans';font-size:14px;font-weight:600;color:{{ a.fg }};white-space:nowrap;" style-hover="filter:brightness(0.96);" style-active="transform:scale(0.98);"><i class="hgi-twotone {{ a.icon }}" style="font-size:16px;flex:0 0 auto;" aria-hidden="true"></i>{{ a.label }}</button></sc-for>
                </div>
                </div>
                </sc-if>
                </div>
                </sc-for></div>
                <sc-if value="{{ dash.noItems }}">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;background:#FFFFFF;border-radius:12px;box-shadow:0 1px 3px rgba(1,51,52,.07);"><span style="font-size:14px;color:#5B6B66;">No bookings yet.</span><button type="button" onClick="{{ dash.onFindExps }}" style="height:44px;padding:0 4px;border:none;background:transparent;font-family:'Google Sans';font-size:14px;font-weight:600;color:#066349;cursor:pointer;white-space:nowrap;flex:0 0 auto;">Find experiences</button></div>
                </sc-if>
                </div>
                </div>
                </section>
              </sc-if>
              <sc-if value="{{ dash.showPlaces }}" hint-placeholder-val="{{ true }}">
                <section aria-label="My places" style="display:flex;flex-direction:column;gap:12px;min-width:0;">
                <div><h2 style="margin:0;font-family:'Google Sans';font-size:17px;font-weight:700;color:#013334;letter-spacing:-.2px;">My places</h2><sc-if value="{{ dash.hasPlaces }}"><p style="margin:4px 0 0;font-size:13.5px;color:#5B6B66;text-wrap:pretty;">These are the places you own</p></sc-if><sc-if value="{{ dash.noPlaces }}"><p style="margin:4px 0 0;font-size:13.5px;color:#5B6B66;text-wrap:pretty;">Earn and manage reservations by adding your place or business.</p></sc-if></div>
                <sc-if value="{{ dash.hasPlaces }}">
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:8px 12px;align-items:start;min-width:0;"><sc-for list="{{ dash.places }}" as="p" hint-placeholder-count="1">
                <div style="background:#F9FAFB;border:0.5px solid #E5E7EB;border-radius:14px;padding:6px;display:flex;flex-direction:column;gap:6px;min-width:0;">
                <div style="background:#FFFFFF;border-radius:12px;box-shadow:0 1px 3px rgba(1,51,52,.07);display:flex;flex-direction:column;min-width:0;">
                <button type="button" onClick="{{ p.onOpen }}" style="display:flex;align-items:center;gap:14px;width:100%;min-height:84px;padding:12px 14px;border:none;border-radius:12px;background:transparent;cursor:pointer;text-align:left;font-family:'Google Sans';min-width:0;" style-hover="background:#FAFBFA;">
                <img loading="lazy" src="{{ p.img }}" alt="" style="width:60px;height:60px;border-radius:12px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
                <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:5px;"><span style="font-size:16px;font-weight:600;color:#1F2937;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">{{ p.name }}</span><span style="font-size:14.5px;color:#5B6B66;">{{ p.locality }}</span></span>
                <i class="hgi-twotone hgi-arrow-up-right-01" style="font-size:20px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>
                </button>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <sc-for list="{{ p.stats }}" as="s" hint-placeholder-count="3">
                <button type="button" onClick="{{ s.onClick }}" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border:none;border-radius:999px;background:#FFFFFF;box-shadow:0 1px 3px rgba(1,51,52,.07);cursor:pointer;font-family:'Google Sans';font-size:14.5px;color:#5B6B66;white-space:nowrap;" style-hover="color:#013334;">{{ s.label }}<span style="font-weight:700;color:#1F2937;">{{ s.n }}</span><sc-if value="{{ s.alert }}"><span role="img" aria-label="New" style="width:8px;height:8px;border-radius:999px;background:#E02D3C;flex:0 0 auto;"></span></sc-if></button>
                </sc-for>
                </div>
                </div>
                </sc-for></div>
                </sc-if>
                <sc-if value="{{ dash.hasClaims }}">
                <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
                <h2 style="margin:0;font-family:'Google Sans';font-size:17px;font-weight:700;color:#013334;letter-spacing:-.2px;">Your claims</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:8px 12px;align-items:start;min-width:0;"><sc-for list="{{ dash.claims }}" as="c" hint-placeholder-count="2">
                <button type="button" onClick="{{ c.onOpen }}" style="display:flex;align-items:center;gap:14px;width:100%;min-height:72px;padding:10px 14px 10px 10px;border:none;border-radius:12px;background:#F3F4F2;cursor:pointer;text-align:left;font-family:'Google Sans';min-width:0;" style-hover="background:#EDEFEC;">
                <sc-if value="{{ c.hasImg }}"><img loading="lazy" src="{{ c.img }}" alt="" style="width:52px;height:52px;border-radius:12px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;"></sc-if>
                <sc-if value="{{ c.noImg }}"><span aria-hidden="true" style="width:52px;height:52px;border-radius:12px;background:#E8F1ED;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#066349;"><i class="hgi-twotone hgi-store-verified-01" style="font-size:22px;"></i></span></sc-if>
                <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px;"><span style="font-size:15px;font-weight:600;color:#1F2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.name }}</span><span style="font-size:13.5px;color:#5B6B66;">{{ c.sub }}</span></span>
                <span style="flex:0 0 auto;display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:999px;background:{{ c.stBg }};color:{{ c.stFg }};font-size:13px;font-weight:600;white-space:nowrap;">{{ c.stLabel }}</span>
                </button>
                </sc-for></div>
                </div>
                </sc-if>
                <button type="button" onClick="{{ dash.onCreatePlace }}" style="align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 28px 0 22px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:15.5px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(1.06);"><i class="hgi-twotone hgi-store-verified-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Connect a place</button>
                </section>
              </sc-if>
            </div>
          </sc-if>
          <sc-if value="{{ dash.colB }}" hint-placeholder-val="{{ true }}">
            <div style="display:flex;flex-direction:column;gap:28px;min-width:0;">
              <sc-if value="{{ dash.showHost }}" hint-placeholder-val="{{ true }}">
                <section aria-label="My experiences (hosting)" style="display:flex;flex-direction:column;gap:12px;min-width:0;">
                <div><h2 style="margin:0;font-family:'Google Sans';font-size:17px;font-weight:700;color:#013334;letter-spacing:-.2px;">My experiences (hosting)</h2><p style="margin:4px 0 0;font-size:13.5px;color:#5B6B66;text-wrap:pretty;">These are the active experiences created/co-hosted by you</p></div>
                <sc-if value="{{ dash.hasHosting }}">
                <div style="background:#F9FAFB;border:0.5px solid #E5E7EB;border-radius:14px;padding:6px;display:flex;flex-direction:column;gap:6px;min-width:0;">
                <sc-if value="{{ dash.hasHostRail }}" hint-placeholder-val="{{ true }}">
                <div data-cal-rail="1" data-pf-rail="1" ref="{{ dash.hostRailRef }}" style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:0 2px;">
                <sc-for list="{{ dash.hostDates }}" as="d" hint-placeholder-count="4">
                <button type="button" onClick="{{ d.onClick }}" aria-pressed="{{ d.pressed }}" aria-label="{{ d.aria }}" style="flex:0 0 auto;display:flex;align-items:center;height:48px;padding:0;border:none;background:transparent;cursor:pointer;font-family:'Google Sans';" style-hover="filter:brightness(0.97);">
                <span style="display:inline-flex;align-items:center;gap:5px;height:42px;padding:0 17px;border-radius:999px;border:1px solid {{ d.bc }};background:{{ d.bg }};font-size:15px;white-space:nowrap;">
                <span style="color:{{ d.monFg }};">{{ d.mon }}</span>
                <span style="font-weight:700;color:{{ d.fg }};">{{ d.num }}</span>
                </span>
                </button>
                </sc-for>
                </div>
                </sc-if>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:16px 12px;align-items:start;min-width:0;">
                <sc-for list="{{ dash.hostItems }}" as="h" hint-placeholder-count="1">
                <div style="display:flex;flex-direction:column;gap:8px;min-width:0;">
                <div style="background:#FFFFFF;border-radius:12px;box-shadow:0 1px 3px rgba(1,51,52,.07);display:flex;flex-direction:column;min-width:0;">
                <button type="button" onClick="{{ h.onOpen }}" style="display:flex;align-items:center;gap:14px;width:100%;min-height:84px;padding:12px 14px;border:none;border-radius:12px;background:transparent;cursor:pointer;text-align:left;font-family:'Google Sans';min-width:0;" style-hover="background:#FAFBFA;">
                <img loading="lazy" src="{{ h.img }}" alt="" style="width:60px;height:60px;border-radius:12px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
                <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px;"><span style="font-size:16px;font-weight:600;color:#1F2937;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">{{ h.title }}</span><span style="display:flex;align-items:center;gap:7px;font-size:14.5px;color:#5B6B66;min-width:0;"><i class="hgi-twotone hgi-clock-01" style="font-size:17px;flex:0 0 auto;" aria-hidden="true"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ h.when }}</span></span></span>
                <sc-if value="{{ h.bDay }}"><span style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;width:50px;height:58px;border-radius:10px;background:linear-gradient(180deg,#EEF4FD 0%,#DDE8FA 100%);color:#1F2937;line-height:1.15;"><span style="font-size:14px;">{{ h.bMon }}</span><span style="font-size:17px;font-weight:700;">{{ h.bDay }}</span></span></sc-if>
                </button>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <sc-for list="{{ h.stats }}" as="s" hint-placeholder-count="3">
                <button type="button" onClick="{{ s.onClick }}" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border:none;border-radius:999px;background:#FFFFFF;box-shadow:0 1px 3px rgba(1,51,52,.07);cursor:pointer;font-family:'Google Sans';font-size:14.5px;color:#5B6B66;white-space:nowrap;" style-hover="color:#013334;">{{ s.label }}<span style="font-weight:700;color:#1F2937;">{{ s.n }}</span><sc-if value="{{ s.alert }}"><span role="img" aria-label="New" style="width:8px;height:8px;border-radius:999px;background:#E02D3C;flex:0 0 auto;"></span></sc-if></button>
                </sc-for>
                </div>
                </div>
                </sc-for>
                </div>
                </div>
                </sc-if>
                <sc-if value="{{ dash.noHosting }}">
                <div style="padding:12px 16px;background:#F3F4F2;border-radius:12px;font-size:14px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">{{ dash.noHostLine }}</div>
                </sc-if>
                <button type="button" onClick="{{ dash.onHost }}" style="align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 28px 0 22px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:15.5px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(1.06);"><i class="hgi-twotone {{ dash.hostIcon }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ dash.hostCta }}</button>
                </section>
              </sc-if>
              <sc-if value="{{ dash.showComms }}" hint-placeholder-val="{{ true }}">
                <section aria-label="My communities" style="display:flex;flex-direction:column;gap:12px;min-width:0;">
                <h2 style="margin:0;"><button type="button" onClick="{{ dash.onAllComms }}" aria-label="See all my communities" style="display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0;border:none;background:transparent;cursor:pointer;font-family:'Google Sans';font-size:17px;font-weight:700;color:#013334;letter-spacing:-.2px;" style-hover="color:#066349;">My communities<i class="hgi-twotone hgi-arrow-right-01" style="font-size:22px;" aria-hidden="true"></i></button></h2>
                <sc-if value="{{ dash.hasComms }}">
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:8px 16px;margin-top:-8px;">
                <sc-for list="{{ dash.comms }}" as="c" hint-placeholder-count="2">
                <button type="button" onClick="{{ c.onOpen }}" style="display:flex;align-items:center;gap:14px;min-height:80px;padding:8px;border:none;border-radius:12px;background:transparent;cursor:pointer;text-align:left;font-family:'Google Sans';min-width:0;" style-hover="background:#F3F4F2;">
                <img loading="lazy" src="{{ c.img }}" alt="" style="width:64px;height:64px;border-radius:12px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
                <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px;"><span style="display:flex;align-items:center;gap:8px;min-width:0;"><span style="font-size:16px;font-weight:600;color:#1F2937;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">{{ c.name }}</span><sc-if value="{{ c.isBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:19px;flex:0 0 auto;color:#066349;"></i></sc-if><i class="hgi-twotone hgi-arrow-up-right-01" style="font-size:20px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i></span><span style="font-size:14.5px;color:#5B6B66;">{{ c.line }}</span></span>
                </button>
                </sc-for>
                </div>
                </sc-if>
                <sc-if value="{{ dash.noComms }}">
                <p style="margin:0;font-size:14px;color:#5B6B66;">You aren’t in a community yet. Joining is instant.</p>
                </sc-if>
                </section>
              </sc-if>
            </div>
          </sc-if>
        </div>
      </div>
    </sc-if>
```

## Exact logic
```js
// Account menu entry
{ label: 'Dashboard', icon: 'hgi-dashboard-circle-add', onClick: () => { this.setState({ dashTab: 'overview', ccDay: null, ccHDay: null }); go('dash'); } }


dashVals() {
  const S = this.state, tab = ['overview', 'res', 'places', 'host', 'comms'].indexOf(S.dashTab) >= 0 ? S.dashTab : 'overview', lime = this.props.tabStyle === 'Lime';
  const TABS = [['overview', 'Overview', 'hgi-dashboard-circle'], ['res', 'My reservations', 'hgi-calendar-03'], ['places', 'Places', 'hgi-store-verified-01'], ['host', 'My experiences (hosting)', 'hgi-ticket-01'], ['comms', 'Communities', 'hgi-user-multiple']];
  const show = (k) => tab === 'overview' || tab === k, fx = this.fx(), own = {}; this.ownedComms().forEach(c => { own[c.id] = true; });
  // New reservation requests at places you run put a pulsing dot on Places.
  const nReq = fx.places.concat(fx.extraPlaces || []).filter((p, i, a) => p.claimedBy && own[p.claimedBy] && (S.rsets || {})[p.id] && a.findIndex(x => x.id === p.id) === i).reduce((n, p) => n + this.rqAll(p.id).filter(r => r.st === 'request').length, 0);
  return Object.assign(this.controlVals(), {
    tabs: TABS.map(([id, label, ic]) => ({ label, aria: id === 'places' && nReq ? label + ', ' + nReq + (nReq === 1 ? ' new reservation request' : ' new reservation requests') : label, hasDot: id === 'places' && nReq > 0,
      dotEl: id === 'places' && nReq ? React.createElement('span', { key: 'dd' + nReq, 'data-blink': '1', 'aria-hidden': 'true', style: { position: 'absolute', top: 6, right: 8, width: 9, height: 9, borderRadius: 999, background: '#E02D3C', pointerEvents: 'none', animation: 'tkPulse 1.6s ease-out infinite' } }) : null,
      on: tab === id, off: tab !== id, onBg: lime ? '#B0E800' : '#DCEAE3', onFg: lime ? '#013334' : '#066349', iconOn: 'hgi-bulk ' + ic, iconOff: 'hgi-twotone ' + ic, onClick: () => this.setState({ dashTab: id }, () => this.stickTabTop('[data-dash-tabs]')) })),
    showRes: show('res'), showPlaces: show('places'), showHost: show('host'), showComms: show('comms'),
    colA: show('res') || show('places'), colB: show('host') || show('comms')
  });
}
controlVals() {
  const S = this.state, fx = this.fx();
  const DAYF = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const T0 = new Date(); T0.setHours(0, 0, 0, 0);
  const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const offOf = (d) => Math.round((d - T0) / 864e5);
  const times = (w) => (/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/.exec(w || '') || [])[1] || '';
  const allExps = fx.experiences.concat(S.published || []), byId = (id) => allExps.find(e => e.id === id) || null;
  const leave = (next) => { this.setState(Object.assign({ detail: null, ccOpen: false }, next)); if (typeof window !== 'undefined') window.scrollTo(0, 0); };
  const badge = (d) => d instanceof Date ? { bMon: MON[d.getMonth()], bDay: String(d.getDate()) } : { bMon: '', bDay: '' };
  const sayC = (m) => { this.setState({ ccOpen: false }); this.say(m); };
  const hn = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return h; };

  const res = [];
  fx.plans.forEach(p => { const e = byId(p.expId); if (e && e.date instanceof Date) res.push(Object.assign({ date: e.date, img: e.img, title: e.title, when: DAYF[e.date.getDay()] + (times(e.when) ? ', ' + times(e.when) : ''), onOpen: () => { this.ccGo('exp', e.id); setTimeout(() => this.jumpTo('mine'), 160); } }, badge(e.date))); });
  this.pfPast().forEach(p0 => { const p = Object.assign({}, p0, (S.xrvDone || {})[p0.title] || {}), d = addD(T0, p.d); res.push(Object.assign({ date: d, img: p.img, title: p.title, when: DAYF[d.getDay()] + ', ' + p.time, isPast: true, canReview: !p.rating, reviewed: !!p.rating, rating: p.rating,
    onOpen: () => this.ccGo('ptk', p.title), onShare: () => this.pastMoment(p), onReview: () => this.openXrv(p.title, 0) }, badge(d))); });
  // Your own bookings at places, as a guest. Opening one lands on My reservations in that place.
  Object.keys(S.rq || {}).forEach(pid => { const pl = this.rqPlace(pid); this.rsvMine(pl).forEach((v, i) => { const d = new Date(v.iso + 'T00:00:00'); res.push(Object.assign({ date: d, img: pl.img, title: pl.name, when: DAYF[d.getDay()] + ', ' + v.time + ', ' + v.party, isRsv: true, stLabel: v.stLabel, stBg: v.stBg, stFg: v.stFg, stIcon: v.stIcon,
    acts: v.acts.map(a => Object.assign({}, a, { onClick: () => { if (a.panel) this.open('place', pid); a.onClick(); } })),
    onOpen: () => { this.ccGo('place', pid); this.setState({ mineIdx: i }); setTimeout(() => this.jumpTo('mine'), 160); } }, badge(d))); }); });
  res.sort((a, b) => a.date - b.date);
  const byDay = {}; res.forEach(r => { const k = offOf(r.date); (byDay[k] = byDay[k] || []).push(r); });
  const keys = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const up = keys.find(k => k >= 0), def = up != null ? up : (keys.length ? keys[keys.length - 1] : 0);
  const sel = S.ccDay != null && byDay[S.ccDay] ? S.ccDay : def;
  const centre = (btn) => { const r = btn && btn.closest && btn.closest('[data-cal-rail]'); if (r) r.scrollTo({ left: Math.max(0, btn.offsetLeft - r.offsetLeft - (r.clientWidth - btn.offsetWidth) / 2), behavior: 'smooth' }); };
  this._ccRailRef = this._ccRailRef || ((el) => { if (el) requestAnimationFrame(() => { const btn = el.querySelector('[aria-pressed="true"]'); if (btn) el.scrollLeft = Math.max(0, btn.offsetLeft - el.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2); }); });
  const dates = keys.map(k => {
    const d = addD(T0, k), on = k === sel, past = k < 0, n = byDay[k].length;
    return { mon: MON[d.getMonth()], num: String(d.getDate()), pressed: on ? 'true' : 'false', aria: DAYF[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ', ' + n + (n === 1 ? ' booking' : ' bookings') + (past ? ', past' : ''),
      bg: on ? (past ? '#DDE3DF' : '#A8F3D0') : past ? '#EEF0EE' : '#FFFFFF', bc: on ? (past ? '#DDE3DF' : '#A8F3D0') : past ? '#E6EAE7' : '#E1E6E3',
      monFg: on ? (past ? '#3C4A45' : '#065941') : past ? '#A3ADA9' : '#5B6B66', fg: on ? (past ? '#1F2937' : '#065941') : past ? '#A3ADA9' : '#1F2937',
      onClick: (ev) => { const btn = ev && ev.currentTarget; this.setState({ ccDay: k }); centre(btn); } };
  });
  const items = byDay[sel] || [];

  const owned = this.ownedComms(), ownedIds = {}; owned.forEach(c => { ownedIds[c.id] = true; });
  const places = fx.places.concat(fx.extraPlaces || []).filter((p, i, a) => p.claimedBy && ownedIds[p.claimedBy] && a.findIndex(x => x.id === p.id) === i)
    .map(p => ({ img: p.img, name: p.name, locality: p.locality, onOpen: () => this.ccGo('place', p.id), stats: [this.rqStat(p), this.boostStat(p)] }));

  const hoGo = (id, tab) => () => { this.ccGo('exp', id); this.setState({ hoTab: tab }); };
  const hosting = this.hostedExps().map(e => {
    const d = e.date instanceof Date ? e.date : null, HS = { h1: [40, 22, 99000], h2: [30, 18, 14400], h3: [20, 9, 0], h4: [24, 6, 22800] }[e.id] || [0, 0, 0], created = HS[0], sold = HS[1], free = e.price === 'Free', salesTxt = free ? 'Free' : 'KES ' + HS[2].toLocaleString('en-US');
    return Object.assign({ date: d, img: e.img, title: e.title, when: (d ? DAYF[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ', ' : '') + (times(e.when) || 'Time to be set'), onOpen: () => this.ccGo('exp', e.id),
      sold: String(sold), created: String(created), pct: created ? Math.round(sold / created * 100) + '%' : '0%', sales: salesTxt, aria: sold + ' of ' + created + ' tickets sold', stats: [
      { label: 'Tickets created', n: String(created), onClick: hoGo(e.id, 'created') },
      { label: 'Sold', n: String(sold), onClick: hoGo(e.id, 'sales') },
      { label: 'Total sales', n: salesTxt, onClick: hoGo(e.id, 'sales') }
    ] }, badge(d));
  });
  // Hosting rail: one pill per date. A date with more than one experience lists them all.
  const hKey = (h) => h.date instanceof Date ? offOf(h.date) : null, hBy = {};
  hosting.forEach(h => { const k = hKey(h); if (k != null) (hBy[k] = hBy[k] || []).push(h); });
  const hKeys = Object.keys(hBy).map(Number).sort((a, b) => a - b), hUp = hKeys.find(k => k >= 0), hDef = hUp != null ? hUp : (hKeys.length ? hKeys[hKeys.length - 1] : null);
  const hSel = S.ccHDay != null && hBy[S.ccHDay] ? S.ccHDay : hDef;
  this._ccHRailRef = this._ccHRailRef || ((el) => { if (el) requestAnimationFrame(() => { const btn = el.querySelector('[aria-pressed="true"]'); if (btn) el.scrollLeft = Math.max(0, btn.offsetLeft - el.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2); }); });
  const hostDates = hKeys.map(k => {
    const d = addD(T0, k), on = k === hSel, past = k < 0, n = hBy[k].length;
    return { mon: MON[d.getMonth()], num: String(d.getDate()), pressed: on ? 'true' : 'false', aria: DAYF[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ', ' + n + (n === 1 ? ' experience' : ' experiences') + (past ? ', past' : ''),
      bg: on ? (past ? '#DDE3DF' : '#A8F3D0') : past ? '#EEF0EE' : '#FFFFFF', bc: on ? (past ? '#DDE3DF' : '#A8F3D0') : past ? '#E6EAE7' : '#E1E6E3',
      monFg: on ? (past ? '#3C4A45' : '#065941') : past ? '#A3ADA9' : '#5B6B66', fg: on ? (past ? '#1F2937' : '#065941') : past ? '#A3ADA9' : '#1F2937',
      onClick: (ev) => { const btn = ev && ev.currentTarget; this.setState({ ccHDay: k }); centre(btn); } };
  });
  const hostItems = (hSel != null ? hBy[hSel] : []).concat(hosting.filter(h => hKey(h) == null));

  const seen = {}, comms = fx.communities.concat(S.ownComms || []).filter(c => { if (seen[c.id]) return false; seen[c.id] = true; return ownedIds[c.id] || (S.comm || {})[c.id]; })
    .map(c => ({ img: c.img, name: c.name, isBiz: this.isBiz(c.id), line: (ownedIds[c.id] ? 'You run this, ' : '') + (20 + hn(c.id) % 70) + ' past experiences hosted', onOpen: () => this.ccGo('comm', c.id) }));

  const W = this.wallet(), draft = !!(S.cx && S.cx.saved);
  return {
    total: W.totalTxt, balances: [{ label: 'Available', value: W.availTxt }, { label: 'Pending', value: W.pendTxt }, { label: 'Tickets on sale', value: 'KES 81,000.00' }],
    ...this.subDashVm(),
    onWithdraw: () => this.openWd(),
    dates, items, noItems: !items.length, railRef: this._ccRailRef, onFindExps: () => leave({ route: 'discover', tab: 'experiences' }),
    hasClaims: this.clList().some(c => c.status !== 'approved' || Date.now() - (c.doneAt || c.at) < 7 * 864e5),
    places, hasPlaces: places.length > 0, noPlaces: !places.length,
    onCreatePlace: () => this.openClaim(null),
    claims: this.clList().filter(c => c.status !== 'approved' || Date.now() - (c.doneAt || c.at) < 7 * 864e5).map(c => { const st = { review: ['Under review', '#FFF6E5', '#7A4A00'], more: ['Needs more documents', '#FFF6E5', '#7A4A00'], rejected: ['Not approved', '#FEF3F2', '#B42318'], approved: ['Approved', '#E8F1ED', '#066349'] }[c.status] || ['Claim', '#F3F4F2', '#1F2937'], pl = this.clPlaces(c); return { name: this.clNames(c), sub: 'For ' + this.clComm(c).name, img: (pl[0] || {}).img || '', hasImg: !!(pl[0] || {}).img, noImg: !(pl[0] || {}).img, stLabel: st[0], stBg: st[1], stFg: st[2], onOpen: () => this.ccGo('clv', c.id) }; }),
    hosting, hasHosting: hosting.length > 0, noHosting: !hosting.length, hostDates, hasHostRail: hKeys.length > 0, hostItems, hostRailRef: this._ccHRailRef,
    noHostLine: owned.length ? 'You aren’t hosting anything right now.' : 'Hosting needs a community you own.', hostCta: !owned.length ? 'Create a community' : draft ? 'Continue your draft' : 'Create an experience', hostIcon: !owned.length ? 'hgi-user-add-02' : draft ? 'hgi-edit-04' : 'hgi-add-circle',
    onHost: () => (owned.length ? this.startHosting() : this.startCommunity()),
    comms, hasComms: comms.length > 0, noComms: !comms.length, onAllComms: () => leave({ route: 'communities', commTab: this.ownedComms().length ? 'mine' : 'following' })
  };
}
subDashVm() {
  const now = this.subNow(), p = now ? this.subPlans().find(x => x.id === now.plan) : null;
  const biz = this.bizOwned(), others = this.ownedComms().filter(c => !this.isBiz(c.id)), nm = (a) => a.length === 1 ? a[0].name : a.length === 2 ? a[0].name + ' and ' + a[1].name : a.length + ' communities';
  if (!p) { const any = this.state.auth === 'in' && this.ownedComms().length > 0; return { planShow: any, planHas: false, planNone: any, planActive: false, planCancelled: false, noneLine: 'Your communities need Premium or Business to host. Communities that own a claimed place host free on Basic.', onPlanPick: () => this.subStart(null) }; }
  const off = now.status === 'cancelled', day = this.subDay(now.renews);
  return { planShow: true, planHas: true, planNone: false, hasPlanNote: true, planNote: p.amount ? 'Covers every community you own.' + (biz.length ? ' Verified businesses pay 8% per paid ticket.' : '') : 'Free for ' + nm(biz) + (others.length ? '. ' + nm(others) + (others.length === 1 ? ' needs' : ' need') + ' Premium or Business to host.' : '.'), planName: p.name, planPrice: p.amount ? '$' + p.amount + ' / month' : 'Free', planFee: p.fee, planStatus: off ? 'Ends ' + day : p.amount ? 'Renews ' + day : 'Always free', planStIcon: p.amount ? 'hgi-calendar-03' : 'hgi-checkmark-circle-02', planActive: !off, planCanCancel: !off && p.amount > 0, planCancelled: off,
    onPlanChange: () => this.subStart(null, 'change'),
    onPlanCancel: () => this.setState({ ok: { title: 'Cancel your ' + p.name + ' plan?', body: 'You keep ' + p.name + ' until ' + day + '. ' + (biz.length ? 'After that you move to Basic, which is free for your verified businesses.' : 'After that your communities need a plan again to host.'), yes: 'Cancel plan', no: 'Keep plan', danger: true,
      act: () => { this.subPut(Object.assign({}, now, { status: 'cancelled' })); this.say('Plan cancelled. You keep ' + p.name + ' until ' + day + (biz.length ? ', then move to Basic.' : '.')); } } }),
    onPlanKeep: () => { this.subPut(Object.assign({}, now, { status: 'active' })); this.say('Your ' + p.name + ' plan renews on ' + day + '.'); } };
}
subPlans() {
  return [
    { id: 'basic', name: 'Basic', tagline: 'Free for verified businesses, the communities that own a claimed place.', amount: 0, fee: '8% per paid ticket', feats: ['Verified businesses only', 'Up to 3 live experiences', 'Paid & free ticketing', 'Withdraw to Tukai Wallet'] },
    { id: 'premium', name: 'Premium', tagline: 'Grow your experience business with advanced tools & visibility.', amount: 15, fee: '4% per paid ticket', hot: true, feats: ['Unlimited live experiences', 'Recurring experiences', 'Discount codes & coupons', 'Featured creator badge'] },
    { id: 'business', name: 'Business', tagline: 'For operators managing teams & high-volume bookings.', amount: 49, fee: '4% per paid ticket', feats: ['Everything in Premium', '10+ team members', 'Dedicated account support', 'Customer list & export'] }
  ];
}
subDay(ms) { const d = new Date(ms); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ' ' + d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; }

rqStat(p) {
  const go = (f) => () => { this.setState({ ccOpen: false }); this.open('place', p.id); f(); };
  if (!(this.state.rsets || {})[p.id]) return { label: 'Set up reservations', n: '', alert: false, onClick: go(() => this.openRset(p.id)) };
  const reqs = this.rqAll(p.id).filter(r => r.st === 'request'), t = this.rqIso(this.rqDate(0));
  return { label: 'Reservation requests', n: String(reqs.length), alert: reqs.length > 0, onClick: go(() => this.openRq(p.id, 'request', reqs.length ? reqs.map(r => r.iso).sort()[0] : t)) };
}
boostStat(p) {
  const b = this.boostOf(p.id), go = () => { this.setState({ ccOpen: false }); this.open('place', p.id); this.openBoost(p.id); };
  return b ? { label: 'Boosted until', n: this.subDay(b.end), alert: false, onClick: go } : { label: 'Boost this place', n: '', alert: false, onClick: go };
}
rsvMine(p) {
  const pid = p.id, cfg = this.rqCfg(pid), rest = this.rsIsRest(p), kes = (v) => 'KES ' + (+v || 0).toLocaleString('en-US');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], t0 = this.rqIso(this.rqDate(0)), back = this.rqIso(this.rqDate(-2)), ENDED = ['declined', 'expired', 'unpaid'];
  return this.rqAll(pid).filter(r => r.mine && r.st !== 'cancelled' && (r.iso >= t0 || (ENDED.indexOf(r.st) >= 0 && r.iso >= back)))
    .sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : a.time < b.time ? -1 : 1)).map(r => {
      const w = this.rqWhen(r, cfg), tm = this.rqTerms(r, cfg), d = new Date(r.iso + 'T00:00:00');
      const ST = {
        request: ['Waiting for an answer', '#FFF6E5', '#7A4A00', 'hgi-hourglass', p.name + ' has until ' + this.rqAt(w.expAt) + ' to answer, or the request expires.'],
        accepted: ['Accepted, not paid yet', '#FFF6E5', '#7A4A00', 'hgi-wallet-02', 'Pay ' + kes(r.amount) + ' by ' + this.rqAt(w.payDue) + ' to confirm, or the booking is released.'],
        confirmed: ['Confirmed', '#E8F1ED', '#066349', 'hgi-checkmark-circle-02', r.paidAt ? kes(r.amount) + ' paid with M-Pesa.' + (tm.type === 'deposit' ? ' It comes off your final bill.' : '') : 'Free booking. ' + p.name + ' expects you.'],
        admitted: ['Visited', '#E8F1ED', '#066349', 'hgi-checkmark-circle-02', ''],
        noshow: ['Missed', '#F3F4F2', '#3F4B47', 'hgi-clock-01', ''],
        declined: ['Declined', '#FEF3F2', '#B42318', 'hgi-cancel-circle', r.declNote ? p.name + ' said: \u201c' + r.declNote + '\u201d' : p.name + ' couldn\u2019t take this booking. Nothing was charged.'],
        expired: ['Expired', '#F3F4F2', '#3F4B47', 'hgi-clock-01', p.name + ' didn\u2019t answer in time, so the request expired. Nothing was charged.'],
        unpaid: ['Released', '#F3F4F2', '#3F4B47', 'hgi-clock-01', 'The time to pay ran out, so the booking was released. Nothing was charged.']
      }[r.st] || ['Booking', '#F3F4F2', '#1F2937', 'hgi-calendar-03', ''];
      const acts = [];
      if (r.st === 'accepted') acts.push(['Pay ' + kes(r.amount), 'hgi-wallet-02', 'pay', () => this.push('rsvpay', pid + '~' + r.id)]);
      if (r.st === 'request') acts.push(['Change request', 'hgi-edit-04', '', () => this.openRsv(pid, r.id)]);
      if (['request', 'accepted', 'confirmed'].indexOf(r.st) >= 0) acts.push([r.st === 'request' ? 'Cancel request' : 'Cancel booking', 'hgi-delete-01', 'red', () => this.rsvCancel(pid, r)]);
      if (ENDED.indexOf(r.st) >= 0) acts.push(['Book another time', 'hgi-calendar-add-01', '', () => this.openRsv(pid)]);
      return { iso: r.iso, img: p.img, title: (rest ? 'Table for ' : 'Visit for ') + r.party, party: r.party + (r.party === 1 ? ' guest' : ' guests'), time: this.rsT12(r.time), mon: MON[d.getMonth()], day: String(d.getDate()),
        onOpen: () => { if (r.st === 'accepted') this.push('rsvpay', pid + '~' + r.id); else if (r.st === 'request') this.openRsv(pid, r.id); },
        hasSt: true, stLabel: ST[0], stBg: ST[1], stFg: ST[2], stIcon: ST[3], hasLine: !!ST[4], line: ST[4],
        acts: acts.map(([label, icon, k, onClick]) => ({ label, icon, onClick, panel: k !== 'red', bg: k === 'pay' ? '#B0E800' : 'transparent', fg: k === 'pay' ? '#013334' : k === 'red' ? '#E02D3C' : '#066349', pad: k === 'pay' ? '0 18px 0 14px' : '0' })) };
    });
}
wallet() {
  const out = (this.state.wdOut || []).reduce((a, w) => a + w.n, 0), avail = Math.max(0, Math.round((28400 - out) * 100) / 100), pend = 6439.8;
  const money = (n) => 'KES ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return { avail, money, availTxt: money(avail), pendTxt: money(pend), totalTxt: money(avail + pend), paidTxt: money(78238.14 + out) };
}
stickTabTop(sel) {
  if (typeof document === 'undefined') return;
  const bar = document.querySelector(sel), body = bar && bar.nextElementSibling; if (!body) return;
  const topH = parseFloat(this.state.topH) || 0, r = bar.getBoundingClientRect();
  if (r.top > topH + 1) return;
  const y = body.getBoundingClientRect().top + window.scrollY - topH - r.height;
  if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y) });
}
```
