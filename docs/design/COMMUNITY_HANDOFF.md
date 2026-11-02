# Handoff: Communities

## Overview
Communities is one of Tukai's four destinations. It has three tabs:
- **Discover:** communities to join near you, ones your friends joined, communities by type, and other cities.
- **Following:** communities you joined, any invites to private communities, and what's happening in them.
- **My communities:** communities you own, what's happening in them, or an empty state that leads to Create community.

Tapping any community, here or anywhere else in the app, opens the **community drawer** in the side panel. It shows the community's photos, about, contact details, socials, members, upcoming experiences, moments, admin, places and reviews, with Join community (or Message host) and Share moment in its action bar.

Covered here: the page, its community card, and the community drawer.

Out of scope, with where they're specified:
- The top bar, navigation and page container (`design_handoff_top_bar`, `design_handoff_experiences_page` Layout).
- The experience card and the city card (`design_handoff_experiences_page`, Components).
- The panel frame, the section tab style and the action bar (`design_handoff_tickets_created`: Panel frame, 1. Host tab row, 6. Action bar).
- The moment composer row and the 7-tile mosaic (`design_handoff_moments`).
- Create community, the share sheet, the photo viewer, the moment viewer, sign-up, and the experience and place drawers that open on top.
- The prototype also has an older full-page community view (`showComm`). The drawer replaces it, and it isn't covered.

## About the design
This is a **design reference** from the HTML prototype (`Tukai Web.dc.html`), not production code. Recreate it in Tukai's codebase with its existing framework, components and panel. The exact markup and logic are at the end of this file.

## Fidelity
**High fidelity.** Build it pixel-perfect. All values are CSS pixels at 1x, and every font is Google Sans. Icons are Hugeicons, twotone unless marked bulk. Every control is a native `<button>` or `<a>`, 44px or taller, unless noted. Names, counts, photos and contact details are sample data.

## Product rules
- **Joining is instant.** There's no request or approval step, and joining never books, pays for or joins anything else.
- **Private communities are invitation-only.** They never show on Discover, and they're marked with a lime lock.
- **Verified business:** a community that owns a claimed place gets the briefcase mark after its name. It's light grey (`#8A9793`) on cards and green (`#066349`) in the drawer header, with a "Verified business" tooltip.
- **Moments** shown for a community are the ones attached to it, to its experiences, or (on the page) to places it owns.
- **Bucket lists belong to people**, so communities have none.

## Page layout
```css
/* Page, inside the shared container */ padding-top: 30px; padding-bottom: 56px;
/* h1 */ margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -.6px; color: #013334;   "Communities"

/* Tabs: <div role="tablist" aria-label="Communities"> */ display: flex; gap: 8px; margin-top: 20px; overflow-x: auto; scrollbar-width: none;
/* tab: <button role="tab" aria-selected> */
display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; height: 44px; padding: 0 18px 0 14px;
border: 0; border-radius: 999px; font-size: 14.5px; white-space: nowrap; transition: background-color .15s;
/* icon, before the label */ 20px, bulk when selected, twotone otherwise

/* Section */ display: flex; flex-direction: column; min-width: 0; margin-top: 32px;   /* 28px for the first section of a tab */
/* h2 */ margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.3px; color: #013334;
/* subtitle */ margin: 5px 0 0; font-size: 13.5px; color: #5B6B66;
```
| Tab | Icon |
|---|---|
| Discover | `hgi-compass` |
| Following | `hgi-user-02` |
| My communities | `hgi-user-group` |

The selected pill depends on the `tabStyle` prop:

| | Selected background | Selected text and icon | Selected weight | Unselected |
|---|---|---|---|---|
| Soft green (default) | `#DCEAE3` | `#066349` | 600 | `#F3F4F2`, `#1F2937`, 500 |
| Lime | `#B0E800` | `#1F2937` | 600 | `#F3F4F2`, `#1F2937`, 600 |

The type chips on Discover use the same pills.

## Community card
```css
/* Grid */ display: grid; grid-template-columns: repeat(auto-fill, minmax(max(190px, (100% - 60px) / 4), 1fr));
           gap: 24px 20px; margin-top: 20px; align-items: start;

/* Card: <button aria-label> */ display: flex; gap: 10px; align-items: flex-start; width: 100%; min-width: 0;
                                padding: 0; border: 0; background: transparent; text-align: left;
/* photo */ position: relative; flex: 0 0 auto; width: 62px; height: 62px; border-radius: 12px; overflow: hidden; background: #F3F4F2;
            img: cover, alt ""
/* private lock */ position: absolute; left: 5px; bottom: 5px; width: 22px; height: 22px; border-radius: 6px; background: #B0E800;
                   hgi-twotone hgi-square-lock-02 13px #013334

/* text */ flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;
/* name */ display: block; font-size: 14px; font-weight: 600; line-height: 1.3; color: #013334; text-wrap: pretty;
/* business mark */ hgi-twotone hgi-briefcase-01, 15px, #8A9793, margin-left: 4px; vertical-align: -2px; role="img" aria-label="Verified business"

/* faces row */ display: flex; align-items: center; gap: 8px; min-width: 0;
/* faces */ display: flex; padding-left: 7px;
/* face */  width: 21px; height: 21px; border-radius: 999px; border: 2px solid #FFFFFF; margin-left: -7px; background: #E8F1ED; object-fit: cover;
/* extra */ font-size: 12.5px; font-weight: 600; color: #5B6B66;   "+29"

/* meta row */ display: flex; align-items: center; flex-wrap: nowrap; gap: 8px; min-width: 0;
/* interests */ display: flex; align-items: center; gap: 4px; overflow: hidden;   up to 4 icons, 15px, #5B6B66
/* dot, aria-hidden */ width: 4px; height: 4px; border-radius: 999px; background: #2F74D0;   only with both interests and a count
/* count */ display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #5B6B66;   hgi-calendar-03 15px, then the number
```
- **Columns:** up to four. At a 1312px content width each card is 313px. At 600px there are two, and on a 390px phone one.
- **Faces:** three member faces, then "+{members - 3}". Communities with fewer than 3 members show that many and no extra.
- **Interests:** the community's interest icons, from the interest list in the Data section.
- **Count:** upcoming experiences the community runs.
- **States:** none. No hover, focus or pressed style (Open items 2).

The parts shown differ by section:

| Section | Faces row | Meta row |
|---|---|---|
| Communities near you, View by type | Yes | No |
| Your friends joined | No | Yes |
| Following, Created or hosted by you | Yes | Yes |

**Accessible name:** built from parts, each ending in a full stop: the name, "Private community." (private only), "Verified business." (verified only), "Amina, Kevo joined." (Your friends joined only), "{n} members.", the interest names, and "{n} upcoming experiences." For example: "Nairobi Foodies Club. Amina, Njeri joined. 1,240 members. Restaurants, Nyama Choma (Braai), Date spots. 2 upcoming experiences."

**Show more**
```css
align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; margin-top: 12px;
padding: 0; border: 0; background: transparent; color: #066349; font-size: 14.5px; font-weight: 600;   hover underline
/* icon, after the label */ 16px, hgi-arrow-down-01, hgi-arrow-up-01 when open
```
- **Label:** "Show more" or "Show less". View by type says "Show more {type communities}", for example "Show more running communities".
- **Use:** `aria-expanded`. It shows every card in the section, and Show less goes back to the first few.

## Discover tab
**1. Communities near you**
- **Subtitle:** "In {city}", for example "In Nairobi".
- **Cards:** public communities in the current city that you neither own nor joined, most members first. 12, then Show more.
- **Empty:** "No communities in {city} yet. Pick another city below." (`margin: 16px 0 0; font-size: 14.5px; color: #3C4A45`).

**2. Your friends joined** (only when there are any)
- **Cards:** public communities you neither own nor joined where at least two friends are members, most friends first, then most members. 4, then Show more.

**3. View by type** (only when there are any)
- **Chips:** a `group` labelled "Community types", in a row with `gap: 8px; margin-top: 16px; overflow-x: auto; padding-bottom: 2px`. One chip per interest that has communities, as toggle buttons with `aria-pressed`. The first is selected by default.
- **Chip order:** Running, Camping, Cycling, Backpacking, Hiking, Walking, Bird watching, Water sports, Rock climbing, Restaurants, Kids, Sports activity, Gym, Scenic driving/road trip, Night life, Movies, Fishing, Horse riding, Shopping, Spa & wellness, Parks & museums, Safari, Nyama Choma (Braai), Date spots, Sunset, Landmarks, Overlanding, Worship.
- **Cards:** public communities of that type you don't own, in any city, most members first. 6, then Show more. Picking a chip closes Show more.

**4. Discover by city**
- **Header:** a row with `align-items: flex-end; justify-content: space-between; gap: 16px`. The h2 "Discover by city" and the subtitle "Switch the city and this page follows" on the left, and two arrows on the right (`gap: 8px`).
- **Rail:** the city cards from `design_handoff_experiences_page`, in a row with `gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 18px 2px 12px`. Each card is 184px wide by default, measured like the Discover rails.
- **Tap a city:** makes it the current city for the whole app, and toasts "Showing {city}."

```css
/* Rail arrow: <button aria-label="Previous cities" | "Next cities"> */
position: relative; width: 24px; height: 24px; border-radius: 999px; border: 1px solid <border>; background: <bg>;
transition: opacity .15s, background-color .15s;
/* hit area */ ::before { content: ''; position: absolute; inset: -10px; }   /* 44px */
/* icon */ hgi-arrow-left-01 or hgi-arrow-right-01, 14px, <icon>
/* hover */ background: #D5E7DE;   /* active */ transform: scale(.96);
```
| Arrow | Background | Border | Icon | Other |
|---|---|---|---|---|
| Can scroll | `#E8F1ED` | `#E8F1ED` | `#066349` | |
| At the end | `#FFFFFF` | `#DDE3DF` | `#013334` | `opacity: .35`, `pointer-events: none`, `disabled` |

The arrows scroll by as many whole cards as fit.

## Following tab
**1. Community invites** (only with pending invites)
```css
/* Card */ margin-top: 28px; border-radius: 18px; background: #F6FCE0; overflow: hidden;
/* Toggle: <button aria-expanded> */ display: flex; align-items: center; gap: 18px; width: 100%; min-height: 88px; padding: 16px 20px;
                                    border: 0; background: transparent; text-align: left;   hover background #F0F9D4
/* thumbs, aria-hidden */ position: relative; flex: 0 0 auto; width: 72px; height: 60px;
/* thumb */ position: absolute; width: 48px; height: 48px; border-radius: 12px; object-fit: cover; border: 2px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(1,51,52,.18);
            /* first */ left: 0; top: 10px; transform: rotate(-8deg);   /* second */ left: 22px; top: 0; transform: rotate(7deg);
/* text */ flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px;
/* title */ font-size: 16.5px; font-weight: 600; color: #013334;
/* line */  font-size: 14px; line-height: 1.45; color: #3C4A45; text-wrap: pretty;
/* chevron */ hgi-twotone hgi-arrow-down-01, 20px, #013334; transform: rotate(180deg) when open; transition: transform .2s;

/* List, when open */ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr)); gap: 8px; padding: 0 12px 12px;
/* invite */ display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-width: 0; padding: 12px; border-radius: 12px; background: #FFFFFF;
/* photo */ width: 56px; height: 56px; border-radius: 10px; object-fit: cover;
/* open: <button> */ flex: 1 1 160px; min-width: 0; min-height: 44px; display: flex; flex-direction: column; justify-content: center; gap: 3px;
                     padding: 0; border: 0; background: transparent; text-align: left;
/* name */ font-size: 15px; font-weight: 600; color: #013334;
/* line */ font-size: 13px; color: #5B6B66;
/* buttons */ display: flex; gap: 8px; flex: 0 0 auto; margin-left: auto;
/* Decline */ height: 44px; padding: 0 16px; border: 1px solid #DDE3DF; border-radius: 999px; background: #FFFFFF;
              font-size: 14px; font-weight: 600; color: #1F2937;   hover #F3F4F2
/* Join */ height: 44px; padding: 0 20px; border: 0; border-radius: 999px; background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%);
           font-size: 14px; font-weight: 600; color: #FFFFFF;   active scale(.98)
```
- **Title:** "Community invites ({n})"
- **Line:** "{inviter} invited you to join {community}." With more than one: "You have been invited to join {n} private communities."
- **Thumbs:** the first two invites' photos.
- **Invite line:** "Invited by {inviter}, {members}", for example "Invited by Amina, 48 members".
- **Labels:** Join reads "Join {community}" and Decline reads "Decline the invite to {community}".
- **Starts:** closed.

**2. Not following anything** (when you follow none)
```css
margin-top: 28px; max-width: 560px; padding: 28px; border-radius: 18px; background: #F3F4F2;
display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
/* h2 */ margin: 0; font-size: 20px; font-weight: 700; color: #013334;
/* p */  margin: 0; font-size: 14.5px; line-height: 1.55; color: #3C4A45; text-wrap: pretty;
/* button */ margin-top: 6px; height: 44px; padding: 0 20px; border: 0; border-radius: 999px;
             background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 600;
```
- **Title:** "You are not following any communities yet"
- **Text:** "Join one and its experiences and moments show up here. Joining never books or pays for anything."
- **Button:** "Discover communities" switches to the Discover tab.
- **With invites:** the invites card shows above it.

**3. Following**
- **Cards:** every community you joined but don't own, public or private, most members first. 8, then Show more.

**4. Happening in your communities**
- **Cards:** up to 7 experiences from the communities you follow, soonest first. Experience cards from `design_handoff_experiences_page`.
- **Grid:** `repeat(auto-fill, minmax(168px, 1fr))`, gap `26px 16px`, `margin-top: 18px`.

**5. Moments**
- **Tiles:** up to 10 moments attached to the communities you follow, their experiences, or places they own. Earlier-session guest moments count too.

```css
/* Grid */ display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); grid-auto-rows: 170px;
           grid-auto-flow: dense; gap: 6px; margin-top: 18px;
/* tile: <button aria-label> */ position: relative; min-width: 0; padding: 0; border: 0; border-radius: 12px; overflow: hidden; background: #F3F4F2;
/* photo */ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease;   hover scale(1.04)
/* album badge */ as in design_handoff_moments
```
- **Spans**, columns × rows, in order: 1×1, 2×1, 1×2, 2×2, 1×1, 1×1, 1×1, 2×1, 1×1, 1×1.
- **Columns:** they vary with the width, and the dense flow fills gaps, so tiles can change order.
- **Label:** "Moment by {author}, {attached to}. {caption}", or "{n} photos by {author}, {attached to}. {caption}" for albums.

## My communities tab
**With communities you own**
1. **Created or hosted by you:** every community you own. All cards show, with no Show more. 28px under the tabs.
2. **Happening in your communities:** as on Following, for your communities.
3. **Moments:** as on Following, for your communities.

**Empty**
```css
/* Wrapper */ display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 520px; margin: 64px auto 0;
/* photos, aria-hidden */ position: relative; width: 200px; height: 136px;
/* left */   position: absolute; left: 16px; top: 20px; width: 80px; height: 104px; border-radius: 12px; border: 3px solid #FFFFFF;
             box-shadow: 0 6px 18px rgba(1,51,52,.16); transform: rotate(-10deg); object-fit: cover;
/* right */  as left, with right: 16px and rotate(10deg)
/* centre */ position: absolute; left: 50%; top: 0; width: 100px; height: 128px; margin-left: -50px; border-radius: 14px;
             border: 3px solid #FFFFFF; box-shadow: 0 10px 26px rgba(1,51,52,.2); object-fit: cover;
/* h2 */ margin: 24px 0 0; font-size: 22px; font-weight: 700; letter-spacing: -.3px; color: #013334;
/* text */ margin: 10px 0 0; font-size: 15px; line-height: 1.55; color: #1F2937; text-wrap: pretty;
/* terms */ margin: 18px 0 0; font-size: 14px; line-height: 1.6; color: #5B6B66; text-wrap: pretty;
/* terms links: <button> */ display: inline; padding: 0; border: 0; background: transparent; font: inherit; color: #066349; font-weight: 600;
                            text-decoration: underline; text-underline-offset: 2px;   ::before { inset: -12px -2px } for a 44px target
/* Create community */ margin-top: 26px; width: 100%; max-width: 420px; height: 52px; display: inline-flex; align-items: center;
                       justify-content: center; gap: 8px; border: 0; border-radius: 999px; background: #B0E800; color: #013334;
                       font-size: 16px; font-weight: 600;   hgi-twotone hgi-user-group 20px before the label
/* hover */ filter: brightness(.96);   /* active */ transform: scale(.98);
```
- **Title:** "No communities... yet!"
- **Text:** "Think of a community as your website, business, social media page, or even a WhatsApp group. It helps you organise your activities and keeps members connected throughout different experiences."
- **Terms:** "By creating a community, you agree to our **terms of use** and **privacy policy**." Both links toast for now.
- **Create community:** opens the new community flow in the panel.

## Community drawer
The shared panel: a 640px drawer from the right, or a bottom sheet below 720px (`design_handoff_tickets_created`, Panel frame). There's no scrim, and the page stays usable beside it.

### Header
- **Left of the title:** Back, when the drawer is stacked on another panel (for example from an experience's host community).
- **Title:** the community name (24px, 700, one line with an ellipsis).
- **Right of the title:** Share and Close. Share opens the share sheet. There's no Save.
- **After the title:** the business mark, then the private lock, each with a tooltip.

```css
/* Business mark: <span tabindex="0" role="img" aria-label="Verified business"> */
position: relative; flex: 0 0 auto; width: 30px; height: 30px; margin-left: -6px; border-radius: 8px;
display: flex; align-items: center; justify-content: center; outline: none;
/* icon */ hgi-twotone hgi-briefcase-01, 24px, #066349
/* focus */ box-shadow: 0 0 0 3px #E8F1ED;
/* hover area */ ::before { inset: -7px }
/* tooltip: role="tooltip", on hover or focus */
position: absolute; z-index: 5; top: calc(100% + 10px); left: 50%; transform: translateX(-50%); padding: 7px 12px; border-radius: 10px;
background: #F3F4F2; color: #1F2937; font-size: 13px; font-weight: 600; white-space: nowrap; box-shadow: 0 4px 14px rgba(1,51,52,.12);

/* Private lock: <span tabindex="0" role="img" aria-label="Private community"> */
the same box with background: #B0E800 and no negative margin;   hgi-twotone hgi-square-lock-02 17px #013334
/* tooltip */ as above, with background: #013334; color: #FFFFFF; box-shadow: 0 6px 18px rgba(1,51,52,.2);
```
Tooltips read "Verified business" and "Private community".

### Body
The panel body wrapper (`padding: 20px 24px 36px; display: flex; flex-direction: column; gap: 28px`) holds these blocks in order. Full-bleed dividers (`height: 1px; margin: 0 -24px; background: #E5E7EB`) sit between most of them.

| Block | Shown | Space above |
|---|---|---|
| 1. Section tabs | Always | Sticky at the top |
| 2. Photos | Always | 16px under the tabs |
| 3. City and business chips | Always | 16px |
| 4. About | Always | 14px |
| Divider | | |
| 5. Contact details | Always | 28px |
| Divider | | |
| 6. Socials, then a divider | With socials | 28px |
| 7. Members | Always | 28px |
| Divider | | |
| 8. Upcoming experiences, then a divider | With upcoming experiences | 28px |
| 9. Moments, then a divider after the mosaic | Always | 28px |
| 10. Admin | Always | 20px |
| 11. Places, then a divider | With places | 28px |
| 12. Reviews | Always | 28px |
| 13. Leave community | Members who don't own it | 20px |

### 1. Section tabs
- **Style:** the host tab row from `design_handoff_tickets_created` (section 1): sticky, 44px pills, `#A7F3D0` and `#066349` with a bulk icon for the current one, `aria-current`.
- **Tabs:** About (`hgi-information-circle`), Members (`hgi-user-multiple`), Experiences (`hgi-calendar-03`, with upcoming experiences only), Places (`hgi-location-01`, with places only), Moments (`hgi-dashboard-circle`), Reviews ({n}) (`hgi-star`), for example "Reviews (42)".
- **Tap:** scrolls the body smoothly so that section sits 78px from the top. About scrolls to the very top.
- **Scrolling:** marks the last section whose top is within 84px of the body's top as current. At the bottom of the body, the last section is current. For 700ms after a tap the tabs don't follow the scroll, so the tapped tab stays current.

### 2. Photos
```css
/* Row wrapper */ position: relative; margin: 0 -24px;
/* row */ display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 0 24px; scroll-snap-type: x proximity; scroll-padding: 0 24px;
/* photo: <button aria-label> */ flex: 0 0 auto; height: 240px; padding: 0; border: 0; border-radius: 12px; overflow: hidden;
                                 background: #F3F4F2; cursor: zoom-in; scroll-snap-align: start;   img cover, alt ""
/* arrow */ position: absolute; top: 50%; z-index: 2; transform: translateY(-50%); width: 44px; height: 44px; border: 0; border-radius: 999px;
            background: rgba(255,255,255,.95); color: #013334; box-shadow: 0 4px 14px rgba(1,51,52,.25);   icon 20px
/* left */ left: 14px; hgi-arrow-left-01; aria-label "Scroll photos left"   /* right */ right: 14px; hgi-arrow-right-01; aria-label "Scroll photos right"
/* hover */ background: #FFFFFF;   /* active */ transform: translateY(-50%) scale(.94);
```
- **Photos:** up to 8. The cover first, then moment photos, then experience photos.
- **Widths:** in order, 158, 240, 408, 240, 240, 180, 348 and 240px.
- **Tap:** opens the photo viewer at that photo, labelled "Open photo {i} of {n} of {community}".
- **Arrows:** the left one shows once the row is scrolled more than 8px. The right one shows until the row is within 8px of its end. Each scrolls by 70% of the row width.

### 3. City and business chips
```css
/* Row */ display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
/* City */ display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px 0 12px; border: 1px solid #E3E7E5;
           border-radius: 999px; background: #EEF1EF; font-size: 14.5px; color: #3F4B47; white-space: nowrap;
           hgi-twotone hgi-building-03 19px #066349
/* Verified business: <button> */ the same size, border: 0; background: #E8F1ED; color: #013334;   hover #DCEAE3
           hgi-twotone hgi-briefcase-01 19px #066349, "Verified business", a 5px #60A5FA dot, then "1 place" or "{n} places"
```
- **City:** "{city}, Kenya", the last part of the community's locality, for example "Nairobi, Kenya". It isn't interactive.
- **Verified business:** verified businesses only. It reads "Verified business, owns {n} places. Show places" and jumps to Places.

### 4. About
```css
/* p */ margin: 0; font-size: 15px; line-height: 1.6; color: #1F2937; text-wrap: pretty;
        display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;   /* no clamp when open */
/* Show more: <button aria-expanded> */ align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 44px;
                                       margin: -4px 0 -10px; padding: 0; border: 0; background: transparent;
                                       font-size: 15px; font-weight: 500; color: #066349;   hover underline; icon 17px after the label
```
- **Text:** the community's about, or its purpose when it has none.
- **Show more:** only when the text is longer than 180 characters. "Show more" (`hgi-arrow-down-01`) or "Show less" (`hgi-arrow-up-01`).

### 5. Contact details
```css
/* Grid */ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 20px 24px;
/* item */ display: flex; align-items: flex-start; gap: 16px; min-width: 0;
/* icon */ 22px, #1F2937, margin-top: 1px
/* label */ font-size: 15px; font-weight: 600; color: #1F2937;
/* value row */ display: flex; align-items: center; gap: 4px; margin: -12px 0;
/* link */ display: inline-flex; align-items: center; min-height: 44px; font-size: 14.5px; color: #5B6B66; text-decoration: none;
           hover color #066349, underline
/* copy */ width: 44px; height: 44px; border: 0; border-radius: 999px; background: transparent; color: #066349;   icon 18px; hover #E8F1ED
```
| Item | Icon | Value | Link |
|---|---|---|---|
| Phone number | `hgi-call-02` | "+254 7xx xxx xxx" | `tel:` |
| Email | `hgi-at` | "{name}@gmail.com" | `mailto:` |

- **Copy:** only on the phone number. It copies the number without spaces and toasts "Phone number copied."
- **After copying:** the icon turns from `hgi-copy-01` into `hgi-tick-02` for 2s, and the label changes from "Copy phone number" to "Phone number copied".

### 6. Socials
```css
/* Block */ display: flex; flex-direction: column; gap: 14px;
/* h3 */ margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.2px; color: #1F2937;   "Socials"
/* row */ display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin: 0 -24px; padding: 0 24px;
/* pill */ display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; height: 44px; padding: 0 18px 0 14px; border: 0;
           border-radius: 999px; font-size: 14.5px; font-weight: 500; white-space: nowrap;   icon 19px before the label; hover brightness(.96)
```
| Social | Icon | Background | Text |
|---|---|---|---|
| WhatsApp | `hgi-whatsapp` | `#DCFCE7` | `#15803D` |
| Website | `hgi-globe-02` | `#DBEAFE` | `#1D4ED8` |
| Instagram | `hgi-instagram` | `#F1E4F4` | `#86399E` |
| Facebook | `hgi-facebook-01` | `#DCEBFE` | `#1259C3` |
| TikTok | `hgi-tiktok` | `#FFDCE7` | `#B80F45` |
| YouTube | `hgi-youtube` | `#FFE1E1` | `#B91C1C` |
| X | `hgi-new-twitter` | `#E0F2FE` | `#0369A1` |

Only the ones the community has, in this order. In the prototype they only toast.

### 7. Members
```css
/* Block */ display: flex; flex-direction: column; gap: 14px;
/* h3 */ as Socials, "Members"
/* line */ margin: 6px 0 0; font-size: 14px; line-height: 1.45; color: #5B6B66;   "32 members"
/* chips */ display: flex; flex-wrap: wrap; gap: 8px;
/* chip */ display: inline-flex; align-items: center; gap: 8px; max-width: 220px; height: 44px; padding: 0 16px 0 5px;
           border-radius: 999px; background: #F3F4F2; font-size: 14px; color: #1F2937;
/* photo */ 34 × 34, radius 999, cover, background #E8F1ED, alt ""
/* initial, no photo */ 34 × 34, radius 999, background #E8F1ED, color #013334, 13px, 700, centred
/* name */ min-width: 0; one line, ellipsis
/* role */ flex: 0 0 auto; font-size: 12.5px; font-weight: 600; color: #066349;   "Admin"
/* more: <button> */ display: inline-flex; align-items: center; justify-content: center; min-width: 44px; height: 44px; padding: 0 14px;
                     border: 0; border-radius: 999px; background: #E8F1ED; color: #066349; font-size: 14px; font-weight: 700;   hover #DCEAE3
```
- **Order:** the admin first, with the "Admin" role ("You" when it's yours), then "You" if you're a member, then other members.
- **Count:** at most 9 chips, and never more than the member count.
- **More:** "+{rest}", labelled "See all {n} members". It toasts for now.
- **Chips:** member chips aren't interactive.

### 8. Upcoming experiences
```css
/* Block */ display: flex; flex-direction: column; gap: 16px;
/* h3 */ "Upcoming experiences", as Socials
/* sub */ margin: 6px 0 0; font-size: 14px; line-height: 1.45; color: #5B6B66;   "Upcoming experiences in {community}"
/* body */ display: flex; flex-direction: column; gap: 10px;

/* Week row */ display: flex; align-items: center; gap: 2px; margin-left: -12px;
/* arrows */ width: 44px; height: 44px; border: 0; border-radius: 999px; background: transparent; color: #1F2937;   icon 20px; hover #F3F4F2
/* disabled arrow */ opacity: .35;
/* week label, aria-live="polite" */ font-size: 15.5px; font-weight: 600; color: #1F2937;

/* Days */ display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
/* day: <button aria-pressed aria-label> */ display: inline-flex; align-items: center; gap: 5px; flex: 0 0 auto; height: 44px; padding: 0 14px;
                                           border: 1px solid <border>; border-radius: 999px; font-size: 14.5px; white-space: nowrap;
/* date */ font-weight: 700;
/* dots, aria-hidden */ display: inline-flex; gap: 3px; margin-left: 2px;   5px dots, #066349

/* Cards */ display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 22px 14px; padding-top: 6px;
/* empty day */ margin: 0; padding-top: 4px; font-size: 14px; line-height: 1.45; color: #5B6B66; text-wrap: pretty;
```
| Day | Background | Border | Text |
|---|---|---|---|
| Selected | `#A7F3D0` | `#A7F3D0` | `#066349` |
| Past, disabled | `#F3F4F2` | `#F3F4F2` | `#8A9692` |
| Other | `#FFFFFF` | `#E5E7EB` | `#1F2937` |

- **Shown:** only when the community has experiences or itineraries from today on. Today's ones drop out once they've ended.
- **Weeks:** Sunday to Saturday, from this week to 12 weeks ahead. Prev and Next are disabled at either end. Changing week clears the picked day.
- **Week label:** "October 2026", or "Oct - Nov 2026" when the week spans two months.
- **Day pills:** weekday, then the date in bold, for example "Sat **24**". One dot for one experience, two dots for more.
- **Day labels:** "Sat 24 Oct, 2 experiences", "Sat 24 Oct, nothing on" or "Thu 22 Oct, past".
- **Opening:** the drawer starts on the week of the next experience, with its first day that has something selected.
- **Cards:** experience cards from `design_handoff_experiences_page`, opening the experience on top of the community.
- **Empty day:** "Nothing from {community} on {Ddd D Mon}. Try another day."

### 9. Moments
- **Title:** "Moments from {community}", an h3 as Socials. The block has `gap: 14px`.
- **Composer row:** as in `design_handoff_moments`, with `padding: 4px 24px 16px` and the label "Share a moment from {community}".
- **Mosaic:** the 7-tile mosaic from `design_handoff_moments`, `margin-top: -12px` (16px under the row). It holds moments attached to the community or to its upcoming experiences, the ones posted in the app first. A divider follows it.
- **Empty:** "No moments from {community} yet. Yours could be the first." (`margin: -8px 0 0; font-size: 14px; line-height: 1.5; color: #5B6B66`), with no divider after.
- **Composer row for members and owners:** opens the composer with the community attached.
- **Composer row for anyone else:** toasts "Join {community} to share moments here. Joining is instant."
- **Tiles:** open the moment on top of the community.

### 10. Admin
```css
/* Band, full-bleed */ display: flex; align-items: center; flex-wrap: wrap; gap: 14px; margin: -8px -24px 0; padding: 16px 24px; background: #F3F4F2;
/* photo */ width: 52px; height: 52px; border-radius: 999px; object-fit: cover; background: #E8F1ED;
/* text */ flex: 1 1 220px; min-width: 0; display: flex; flex-direction: column; gap: 2px;
/* name: <button> */ align-self: flex-start; max-width: 100%; display: inline-flex; align-items: center; gap: 6px; min-height: 44px;
                     margin: -10px 0 -8px; padding: 0; border: 0; background: transparent; font-size: 15px; color: #1F2937;   hover #066349
/* "Admin:" */ color: #5B6B66;
/* name */ font-weight: 600; one line, ellipsis
/* verified */ hgi-bulk hgi-checkmark-badge-01, 18px, #066349, role="img" aria-label="Verified"
/* arrow */ hgi-twotone hgi-arrow-up-right-01, 16px, #066349
/* line */ font-size: 13.5px; color: #5B6B66;   "{n} past experiences organised"
/* Message */ flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 20px; border: 0; border-radius: 999px;
              background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 700;
              hgi-twotone hgi-bubble-chat 18px before the label;   active scale(.98)
```
- **Admin:** the community's owner, or its first organiser. It shows "You" when the community is yours.
- **Name:** opens the admin's profile, which toasts for now.
- **Button:** "Message host", or "Message members" when the community is yours.
- **Wrapping:** at the default width the button sits beside the text. On a 390px sheet it drops under it.

### 11. Places
```css
/* Block */ display: flex; flex-direction: column; gap: 14px;
/* Title: <button> */ display: inline-flex; align-items: center; gap: 6px; min-height: 44px; margin: -10px 0; padding: 0; border: 0; background: transparent;
                      font-size: 19px; font-weight: 700; letter-spacing: -.2px; color: #1F2937;   hover #066349
                      hgi-twotone hgi-arrow-right-01 20px #5B6B66 after "Places"
/* sub */ margin: 6px 0 0; font-size: 14px; line-height: 1.45; color: #5B6B66;
/* Cards */ display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 22px 14px;
```
- **Which places:** a verified business lists exactly the places it owns, with the sub "{n} places owned by {community}" ("1 place owned by"). Any other community lists up to 6 places where its experiences happen, with the sub "Places {community} meets at".
- **Title:** opens every place connected to the community, which toasts for now.
- **Cards:** open the place on top of the community.

**Place card**
```css
/* Card */ display: flex; flex-direction: column; gap: 9px; min-width: 0;
/* photo: <button> */ display: block; width: 100%; aspect-ratio: 1 / 1; padding: 0; border: 0; border-radius: 12px; overflow: hidden; background: #F3F4F2;
                      img cover, alt is the place name; filter: grayscale(1) while closed
/* save */ the experience card's save button, top right
/* Closed pill */ position: absolute; left: 8px; bottom: 8px; max-width: calc(100% - 16px); display: inline-flex; align-items: center; gap: 6px;
                  height: 26px; padding: 0 10px 0 9px; border-radius: 999px; background: rgba(0,0,0,.6); backdrop-filter: blur(6px);
                  font-size: 10.5px; font-weight: 600; color: #FFFFFF; white-space: nowrap;   7px dot #C4CBC8, text ellipsis
/* Closes soon pill */ the same box with background: #FBBF24; color: #1F2937; box-shadow: 0 2px 6px rgba(1,51,52,.25);   7px dot #92400E
/* text: <button> */ display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 0; border: 0; background: transparent; text-align: left;
/* name */ font-size: 14px; font-weight: 600; line-height: 1.35; color: #013334;
/* area */ font-size: 12.5px; color: #5B6B66;
/* fact */ display: flex; align-items: flex-start; gap: 6px; margin-top: 2px; font-size: 12px; line-height: 16px; font-weight: 600;   icon 15px
```
| Pill | When | Text |
|---|---|---|
| Closed | Not open now | "Closed · Opens 7 AM" before opening today, "Opens tomorrow 7 AM", "Opens Mon 7 AM", or "Closed" |
| Closes soon | Open, closing within an hour | "Closes soon" |

| Fact | Colour | Icon |
|---|---|---|
| The place's next experience, "{title} · {when}" | `#066349` | calendar |
| A weekly experience, "{title} · weekly" | `#066349` | repeat |
| An offer, its title | `#066349` | tag |
| Otherwise its hours, "Closes 10:00 PM" or "Opens 7:00 AM" | `#5B6B66` | clock |

### 12. Reviews
```css
/* Header */ display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 6px;
/* Title: <button> */ as Places, "Reviews"
/* summary */ display: inline-flex; align-items: center; gap: 7px; font-size: 14.5px; color: #1F2937; white-space: nowrap;
              hgi-bulk hgi-star 18px #FBBF24, the average (600), a 5px #60A5FA dot, "{n} reviews"

/* Review, full-bleed */ display: flex; align-items: flex-start; gap: 14px; margin: 0 -24px; padding: 18px 24px;
                         border-top: 1px solid #E5E7EB;   /* the first has a transparent border */
/* photo */ 48 × 48, radius 999, cover, background #E8F1ED
/* content */ flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px;
/* name line */ display: flex; align-items: center; gap: 7px; font-size: 15.5px; color: #1F2937;
                author 600, a 5px #60A5FA dot, then what was reviewed (one line, ellipsis)
/* rating line */ display: flex; align-items: center; gap: 6px; font-size: 13.5px; color: #5B6B66;
                  hgi-bulk hgi-star 16px #FBBF24, the rating in #1F2937, a dot, the month ("September 2026")
/* more */ width: 44px; height: 44px; margin: -10px -10px 0 0; color: #1F2937;   hgi-twotone hgi-more-horizontal 20px; hover #066349
/* text */ margin: 0; font-size: 15px; line-height: 1.55; color: #1F2937; text-wrap: pretty;
/* photos */ display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin-right: -24px; padding-right: 24px;
/* photo */ 150 × 150, radius 12, background #E8F1ED, cursor zoom-in
/* actions */ display: flex; align-items: center; gap: 14px; margin: -6px 0 -12px;
/* like, comment */ display: inline-flex; align-items: center; gap: 7px; height: 44px; padding: 0; border: 0; background: transparent; font-size: 14.5px;   icon 20px
/* like */ hgi-twotone hgi-favourite, #1F2937; liked: hgi-bulk hgi-favourite, #E02D3C; aria-pressed
/* comment */ hgi-twotone hgi-bubble-chat, #1F2937; hover #066349
```
- **Reviews:** reviews of experiences the community ran, four shown, newest first.
- **Empty:** "No reviews yet. If you have been, yours would be the first." (`margin: 8px 0 0; font-size: 14.5px; color: #5B6B66`). The prototype always has reviews.
- **Like:** toggles, and the count goes up by one. Labelled "Like this review, {n} likes" or "Unlike this review, {n} likes".
- **Comment and More:** labelled "Open the replies to {author}'s review" and "More options for {author}'s review". Both toast for now.
- **Photos:** open the photo viewer, labelled "Open photo {i} from {author}".
- **Title:** opens all reviews, which toasts for now.

### 13. Leave community
```css
align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; height: 44px; margin-top: -8px; padding: 0 10px;
border: 0; border-radius: 999px; background: transparent; font-size: 14.5px; font-weight: 500; color: #E02D3C;   hover #FEF3F2
/* icon */ hgi-twotone hgi-logout-03, 19px, before the label
```
Shown to members who don't own the community. It leaves straight away, with no confirmation.

### Action bar
The bar from `design_handoff_tickets_created` (section 6): a gradient button, then a lime one.

| Who | Gradient button | Lime button |
|---|---|---|
| Not a member | Join community (`hgi-user-add-02`) | Share moment (`hgi-dashboard-circle-add`) |
| Member | Message host (`hgi-bubble-chat`) | Share moment |
| Owner | Message members (`hgi-bubble-chat`) | Share moment |

Share moment does the same as the composer row.

## Behaviour
1. **Opening the page:** from the main navigation, "See all" on the Discover Communities section, and the Dashboard. The Dashboard opens My communities when you own one, otherwise Following. The page remembers the last tab, starting on Discover.
2. **Opening the drawer:**
   - **From the page:** cards on this page, the Discover rails, search results and inbox notifications open the drawer, replacing anything in the panel.
   - **From another panel:** a host community on an experience, a place's owner, or a bucket list's owner opens it on top, with Back.
   - **After creating a community:** the new community opens in the drawer.
3. **Joining:**
   - **Signed in:** "Join community" makes you a member straight away. The bar switches to Message host, Leave community appears, and the community moves from Discover to Following.
   - **Signed out:** it opens sign-up with "Joining needs an account." and joins once you're signed in.
4. **Invites:**
   - **Join:** makes you a member and clears the invite.
   - **Decline:** clears the invite only.
   - **Open:** tapping the name opens the drawer, where Join community works the same way.
5. **Leaving:** takes effect at once. Bookings stay on your profile.
6. **Show more:** each section remembers whether it's open. Picking a type chip closes its Show more.
7. **City:** changing the city on Discover changes it for the whole app.
8. **Drawer state:** the section tab, About's Show more, the photo arrows and the picked week and day reset whenever a panel opens, or one is added or removed on top. So Back from an experience lands at the top of the community on the default week.
9. **Toasts:** one at a time, 4.2s each.

## Copy
| Trigger | Toast |
|---|---|
| Join community | "You joined {community}. Membership does not book a seat." |
| Join from an invite | "You joined {community}. Joining does not book or pay for anything." |
| Decline an invite | "Invite to {community} declined." |
| Leave community | "You left {community}. Anything you booked stays on your profile." |
| Tap a city | "Showing {city}." A city that isn't live yet: "{city} is coming soon. Nairobi is the only city with activity so far." |
| Copy the phone number | "Phone number copied." |
| WhatsApp | "Opens a WhatsApp chat with {community}." |
| Website | "Opens the {community} website in a new tab." |
| Other socials | "Opens {community} on {social} in a new tab." |
| See all members | "Opens all {n} members of {community}." |
| Composer row or Share moment, not a member | "Join {community} to share moments here. Joining is instant." |
| Admin name | "Opens {admin}'s profile." ("Opens your profile." when it's yours) |
| Message host | "Write to {admin}, who runs {community}. It arrives in their Tukai inbox." |
| Message members | "Write one message to everyone in {community}. It arrives in their Tukai inbox." |
| Places title | "Opens every place connected to {community}." |
| Reviews title | "Opens all {n} reviews of experiences run by {community}." |
| Review comment | "Opens the replies to {author}'s review." |
| Review more | "Share or report {author}'s review." |
| Terms of use, privacy policy | "Opens the Tukai terms of use." and "Opens the Tukai privacy policy." |

## Data
```ts
type Interest = { id: string; label: string; icon: string; plural: string };   // 'run', 'Running', 'workout-run', 'Running communities'
type Community = {
  id: string;
  name: string;
  purpose: string;          // one line
  about?: string;           // longer text, falls back to purpose
  locality: string;         // 'Kilimani, Nairobi'. The last part is the city
  members: number;          // shown as '{n} members'
  type: 'public' | 'private';
  interests: string[];      // Interest ids
  img: string;              // square photo for cards
  cover?: string;           // first drawer photo
  organisers: { name: string; role: 'Owner' | string }[];   // the owner is the admin
  phone?: string; email?: string;
  socials?: { kind: 'whatsapp' | 'website' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'x'; url: string }[];
};
type Membership = Record<string, 'member'>;                          // by community id, for the signed-in person
type Invite = { communityId: string; invitedBy: string; open: boolean };
```
- **Verified business:** derived. A community is one when it owns at least one claimed place.
- **Upcoming experiences:** experiences and itineraries with this community as host, from today on.
- **Reviews:** the reviews of its past experiences, with their average.
- **Friends:** which people you know are members, for "Your friends joined".

**Interests** (label, icon): Restaurants `noodles`, Date spots `user-love-01`, Night life `tongue-wink-right`, Sunset `sunset`, Safari `car-03`, Bird watching `bird`, Nyama Choma (Braai) `bbq-grill`, Kids `baby-01`, Walking `walking`, Camping `tent`, Shopping `shopping-bag-01`, Spa & wellness `yoga-01`, Parks & museums `signpost`, Hiking `hiking`, Landmarks `pyramid`, Sports activity `football-pitch`, Scenic driving/road trip `car-04`, Water sports `swimming`, Gym `dumbbell-01`, Fishing `fish`, Cycling `bicycle-01`, Horse riding `cowboy-hat`, Backpacking `backpack-01`, Rock climbing `mountain`, Overlanding `car-01`, Worship `hand-prayer`, Movies `film-roll-01`, Running `workout-run`.

**Sample data**
- **You:** Wanjiku Maina. You own Weekend Readers and Aberdare Trail Collective.
- **Your memberships:** City Sketchers, Nairobi Foodies Club, Trail Seekers, Pedal Nairobi and the private Lavington Supper Society.
- **Invites:** Ngong Ridge Runners (48 members, from Amina) and Kilifi Creek Sailors (36 members, from Njeri), both private.
- **Communities:**
  - Nairobi Makers Circle (32 members, run by Amina, with Kevo publishing).
  - Weekend Readers (18).
  - City Sketchers (12, run by Otieno).
  - Aberdare Trail Collective (62).
  - 29 interest communities, from Saddle Club Karen (140) to Nairobi Running Club (2,300). Three are outside Nairobi: Mombasa Food Circle, Kisumu Lakeside Eats and Nakuru Supper Club.
- **Cities:** Nairobi, Mombasa, Kisumu, Nakuru, Nanyuki, Naivasha, Diani and Eldoret.
- **Made up per community:** the friends (none, or 2 or 3 of Amina, Kevo, Njeri, Otieno, Achieng and Zawadi), the card faces, the phone and email, which socials it has, the member names, 12 to 71 reviews averaging 4.3 to 4.9, and 20 to 89 past experiences.
- **`hostSetup` prop:** "New host" makes you own no communities, which shows the My communities empty state.

**State in the prototype**

| Key | Holds |
|---|---|
| `commTab` | The page tab |
| `commMore` | Which sections have Show more open |
| `commType` | The picked type chip |
| `comm` | Your memberships |
| `commInv`, `commInvOpen` | Pending invites, and whether the invites card is open |
| `city` | The current city, shared with Discover |
| `psec` | The drawer's current section |
| `upWeek`, `upDay` | The drawer's week and picked day |
| `aboutMore` | About's Show more |
| `galLeft`, `galRight` | Which photo arrows show |
| `telCopied` | The community whose phone number was just copied |
| `rvLikes` | Reviews you liked |

## Accessibility
- **Page tabs:** `role="tab"` buttons in a `tablist`, but there's no `tabpanel` and no arrow keys. Add both.
- **Type chips:** toggle buttons with `aria-pressed`, but one is always on. A `radiogroup` would fit better.
- **Cards:** a single button each, named by the accessible name above. The photos and faces have `alt=""`. Add a visible focus ring, since there isn't one.
- **Show more:** uses `aria-expanded`. Move focus to the first new card when it opens.
- **Invites:** the toggle has `aria-expanded`. Join and Decline name the community.
- **Rail arrows:** 24px circles with a 44px hit area through `::before`.
- **Drawer:** a `dialog` labelled with the community name.
- **Header marks:** focusable images with tooltips on hover and focus.
- **Section tabs:** a `nav` of buttons with `aria-current`. They scroll rather than switch content, so `aria-current="location"` would describe them better.
- **Photos:** labelled "Open photo {i} of {n} of {community}". The arrows are 44px.
- **Week label:** `aria-live="polite"`. Day pills say their date and what's on, and past days are disabled.
- **Reviews:** Like has `aria-pressed`. Icons and dots are `aria-hidden`.
- **Focus:** the prototype doesn't move focus when the drawer opens or when a section tab scrolls. Move it to the drawer title, and to the section heading.
- **Targets:** 44px or more everywhere, except the rail arrows, which rely on their hit area.

## Tokens used
| Value | Where |
|---|---|
| `#013334` | Page title, section titles, card names, lock icons, invite text, Create community text |
| `#DCEAE3`, `#066349` | Selected tab and type chip (Soft green) |
| `#B0E800` | Selected tab (Lime), private lock, Create community, Share moment |
| `#F3F4F2` | Unselected pills, card photo background, empty state, member chips, admin band, past days |
| `#5B6B66` | Subtitles, extras, interests, counts, labels, metadata |
| `#3C4A45` | Empty and invite text |
| `#8A9793` | Business mark on cards |
| `#2F74D0` | Dot between interests and count |
| `#60A5FA` | Dots in the drawer |
| `#E8F1ED` | Enabled rail arrows, faces, business chip, more members, copy hover |
| `#D5E7DE` | Rail arrow hover |
| `#DDE3DF` | Disabled rail arrow border, Decline border |
| `#F6FCE0`, `#F0F9D4` | Invites card and its hover |
| `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)` | Join, Discover communities, Message host |
| `#A7F3D0` | Current section tab, selected day |
| `#EEF1EF`, `#E3E7E5`, `#3F4B47` | City chip |
| `#E5E7EB` | Drawer dividers, day borders, review borders |
| `#FBBF24` | Review stars, Closes soon pill |
| `#E02D3C`, `#FEF3F2` | Liked heart, Leave community and its hover |
| `rgba(255,255,255,.95)` | Photo arrows |
| `rgba(0,0,0,.6)` | Closed pill |
| 6px | Private lock on cards |
| 8px | Header marks |
| 10px | Invite photos, tooltips |
| 12px | Card photos, tiles, drawer photos |
| 18px | Invites card, empty state |
| 999px | Pills, buttons, faces, chips |

| Text | Size | Weight | Extra |
|---|---|---|---|
| Page title | 30 | 700 | letter-spacing -0.6px |
| Drawer title | 24 | 700 | letter-spacing -0.4px |
| Section titles | 22 | 700 | letter-spacing -0.3px |
| Following empty title | 20 | 700 | |
| Drawer section titles | 19 | 700 | letter-spacing -0.2px |
| Invites title | 16.5 | 600 | |
| Create community | 16 | 600 | |
| Week label, review author | 15.5 | 600 | |
| About, review text, admin name, invite names | 15 | 400 to 600 | |
| Tabs, chips, Show more, links, buttons, day pills | 14.5 | 500 to 700 | |
| Card names, member chips, subs | 14 | 400 to 600 | |
| Subtitles, rating lines, admin line | 13.5 | 400 | |
| Tooltips, invite lines | 13 | 400 to 600 | |
| Face extras, roles, area | 12.5 | 400 to 600 | |
| Card counts, place facts | 12 | 600 | |
| Place pills | 10.5 | 600 | |

## Assets
- **Photos:** community, member, moment and place photos are sample Unsplash images. Use the real ones. The three empty-state photos are fixed sample images.
- **Icons:** Hugeicons from the project kit `https://sets.hugeicons.com/jtgnwk3xiym.css?v=3`. The prototype now loads a saved copy, `assets/hugeicons-set.css`. Use the codebase's Hugeicons package with the same names.
- **Album icon:** an inline stroke SVG, as in `design_handoff_moments`.

## Open items
1. **Your friends joined doesn't show the friends.** The cards drop the faces row, and the friends' names are only in the accessible name. Show their faces.
2. **Three card layouts.** Near and View by type show faces only, Friends shows interests only, and Following and Mine show both. The cards also have no hover or focus state.
3. **Private communities and links.** Anyone who reaches a private community's drawer, for example through a forwarded link, sees everything and can join. Decide what non-invited people see, and whether Join needs an invite.
4. **Leaving has no confirmation.** For a private community it can't be undone without a new invite.
5. **Two join messages:** "Membership does not book a seat." and "Joining does not book or pay for anything." Pick one.
6. **Sample copy contradicts instant joining.** City Sketchers' about says "We approve requests".
7. **Co-hosts are missing.** My communities lists only communities you own, though its title says "Created or hosted by you" and co-hosts can host. The members list labels only the owner, as "Admin".
8. **Every admin shows the verified checkmark.** Decide whether it means a verified person, and show it only then.
9. **Review stars and decimals.** Single reviews show ratings like "4.8", against the earlier decision to round stars to whole numbers. The amber `#FBBF24` star is part of the open star colour decision.
10. **Message host twice.** Members see it in the admin band and the action bar. Non-members can message from the band but not the bar. Decide who can message.
11. **Made-up content.** The phone, email, socials and most gallery photos are generated. Decide which fields Create community collects, and what the drawer shows when they're missing.
12. **No See all.** Happening shows up to 7 experiences, page moments up to 10, drawer moments up to 7, and the Places, Reviews and member titles only toast.
13. **The city is global.** Picking a city on Communities changes Discover too, with only a toast to say so.
14. **No search or filters** on the page. Communities near you only matches the city in the locality text.
15. **Upcoming experiences stop at 12 weeks**, and weeks start on Sunday, while other calendars may start on Monday.
16. **Show more remembers.** Each section stays expanded, and the tab is kept, across visits.

## Exact markup
Verbatim from `Tukai Web.dc.html`. Only the whitespace between tags was reflowed, for reading:
- `{{ }}` holes are filled by the logic below. `cp` is the page, `pn` the panel.
- `style-hover`, `style-focus`, `style-active` and `style-before` hold those states.
- `<sc-if>` renders its children only when its value is true, and `<sc-for>` repeats its child once per item. Neither adds an element, so the drawer blocks are direct flex items of the panel body wrapper `padding:20px 24px 36px;display:flex;flex-direction:column;gap:28px;`.
- The empty `<sc-if value="{{ r.hasMeta2 }}">` in two card copies is why those cards show no meta row.

```html
<!-- Communities page -->
<sc-if value="{{ showCommunities }}">
  <div style="padding-top:30px;padding-bottom:56px;">
    <h1 style="margin:0;font-family:'Google Sans';font-size:30px;font-weight:700;color:#013334;letter-spacing:-.6px;">Communities</h1>
    <div role="tablist" aria-label="Communities" style="display:flex;gap:8px;margin-top:20px;overflow-x:auto;scrollbar-width:none;">
      <sc-for list="{{ cp.tabs }}" as="t" hint-placeholder-count="3">
        <button type="button" role="tab" aria-selected="{{ t.sel }}" onClick="{{ t.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px 0 14px;border:none;border-radius:999px;background:{{ t.bg }};color:{{ t.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:{{ t.fw }};cursor:pointer;white-space:nowrap;transition:background-color .15s;"><i class="{{ t.iconCls }}" style="font-size:20px;flex:0 0 auto;color:{{ t.ic }};" aria-hidden="true"></i>{{ t.label }}</button>
      </sc-for>
    </div>
    <sc-if value="{{ cp.isDiscover }}" hint-placeholder-val="{{ true }}">
      <section aria-label="Communities near you" style="display:flex;flex-direction:column;min-width:0;margin-top:28px;">
        <div style="min-width:0;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Communities near you</h2>
          <p style="margin:5px 0 0;font-size:13.5px;color:#5B6B66;">{{ cp.nearSub }}</p>
        </div>
        <sc-if value="{{ cp.noNear }}"><p style="margin:16px 0 0;font-size:14.5px;color:#3C4A45;">{{ cp.nearEmpty }}</p></sc-if>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(max(190px,(100% - 60px)/4),1fr));gap:24px 20px;margin-top:20px;align-items:start;">
          <sc-for list="{{ cp.near.items }}" as="r" hint-placeholder-count="4">
            <button type="button" onClick="{{ r.onOpen }}" aria-label="{{ r.aria }}" style="display:flex;gap:10px;align-items:flex-start;width:100%;min-width:0;padding:0;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';">
              <span style="position:relative;flex:0 0 auto;width:62px;height:62px;border-radius:12px;overflow:hidden;background:#F3F4F2;">
                <img loading="lazy" src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
                <sc-if value="{{ r.priv }}">
                  <span style="position:absolute;left:5px;bottom:5px;width:22px;height:22px;border-radius:6px;background:#B0E800;display:flex;align-items:center;justify-content:center;">
                    <i class="hgi-twotone hgi-square-lock-02" style="font-size:13px;flex:0 0 auto;color:#013334;" aria-hidden="true"></i>
                  </span>
                </sc-if>
              </span>
              <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">
                <span style="display:block;font-size:14px;font-weight:600;color:#013334;line-height:1.3;text-wrap:pretty;">{{ r.name }}<sc-if value="{{ r.isBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:15px;margin-left:4px;vertical-align:-2px;color:#8A9793;"></i></sc-if></span>
                <sc-if value="{{ r.hasMeta2 }}"></sc-if>
                <span style="display:flex;align-items:center;gap:8px;min-width:0;">
                  <span style="display:flex;padding-left:7px;flex:0 0 auto;">
                    <sc-for list="{{ r.avatars }}" as="a" hint-placeholder-count="3">
                      <img loading="lazy" src="{{ a.img }}" alt="" style="width:21px;height:21px;border-radius:999px;border:2px solid #FFFFFF;margin-left:-7px;background:#E8F1ED;object-fit:cover;display:block;flex:0 0 auto;">
                    </sc-for>
                  </span>
                  <sc-if value="{{ r.hasExtra }}">
                    <span style="font-size:12.5px;font-weight:600;color:#5B6B66;flex:0 0 auto;">{{ r.extra }}</span>
                  </sc-if>
                </span>
              </span>
            </button>
          </sc-for>
        </div>
        <sc-if value="{{ cp.near.hasMore }}">
          <button type="button" onClick="{{ cp.near.onMore }}" aria-expanded="{{ cp.near.moreA }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:12px;padding:0;border:none;background:transparent;color:#066349;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;" style-hover="text-decoration:underline;">{{ cp.near.moreLabel }}<i class="hgi-twotone {{ cp.near.moreIcon }}" style="font-size:16px;flex:0 0 auto;" aria-hidden="true"></i></button>
        </sc-if>
      </section>
      <sc-if value="{{ cp.hasFriends }}">
        <section aria-label="Your friends joined" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Your friends joined</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(max(190px,(100% - 60px)/4),1fr));gap:24px 20px;margin-top:20px;align-items:start;">
            <sc-for list="{{ cp.friends.items }}" as="r" hint-placeholder-count="4">
              <button type="button" onClick="{{ r.onOpen }}" aria-label="{{ r.aria }}" style="display:flex;gap:10px;align-items:flex-start;width:100%;min-width:0;padding:0;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';">
                <span style="position:relative;flex:0 0 auto;width:62px;height:62px;border-radius:12px;overflow:hidden;background:#F3F4F2;">
                  <img loading="lazy" src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
                  <sc-if value="{{ r.priv }}">
                    <span style="position:absolute;left:5px;bottom:5px;width:22px;height:22px;border-radius:6px;background:#B0E800;display:flex;align-items:center;justify-content:center;">
                      <i class="hgi-twotone hgi-square-lock-02" style="font-size:13px;flex:0 0 auto;color:#013334;" aria-hidden="true"></i>
                    </span>
                  </sc-if>
                </span>
                <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">
                  <span style="display:block;font-size:14px;font-weight:600;color:#013334;line-height:1.3;text-wrap:pretty;">{{ r.name }}<sc-if value="{{ r.isBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:15px;margin-left:4px;vertical-align:-2px;color:#8A9793;"></i></sc-if></span>
                  <sc-if value="{{ r.hasMeta2 }}">
                    <span style="display:flex;align-items:center;flex-wrap:nowrap;gap:8px;min-width:0;">
                      <sc-if value="{{ r.hasCats }}">
                        <span style="display:flex;align-items:center;gap:4px;flex:0 1 auto;min-width:0;overflow:hidden;">
                          <sc-for list="{{ r.cats }}" as="k" hint-placeholder-count="2">
                            <i class="{{ k.icon }}" style="font-size:15px;flex:0 0 auto;color:#5B6B66;" aria-hidden="true"></i>
                          </sc-for>
                        </span>
                      </sc-if>
                      <sc-if value="{{ r.nDot }}">
                        <span aria-hidden="true" style="width:4px;height:4px;border-radius:999px;background:#2F74D0;flex:0 0 auto;"></span>
                      </sc-if>
                      <sc-if value="{{ r.hasN }}">
                        <span style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#5B6B66;flex:0 0 auto;"><i class="hgi-twotone hgi-calendar-03" style="font-size:15px;flex:0 0 auto;" aria-hidden="true"></i>{{ r.n }}</span>
                      </sc-if>
                    </span>
                  </sc-if>
                </span>
              </button>
            </sc-for>
          </div>
          <sc-if value="{{ cp.friends.hasMore }}">
            <button type="button" onClick="{{ cp.friends.onMore }}" aria-expanded="{{ cp.friends.moreA }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:12px;padding:0;border:none;background:transparent;color:#066349;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;" style-hover="text-decoration:underline;">{{ cp.friends.moreLabel }}<i class="hgi-twotone {{ cp.friends.moreIcon }}" style="font-size:16px;flex:0 0 auto;" aria-hidden="true"></i></button>
          </sc-if>
        </section>
      </sc-if>
      <sc-if value="{{ cp.hasTypes }}">
        <section aria-label="View by type" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">View by type</h2>
          <div role="group" aria-label="Community types" style="display:flex;gap:8px;margin-top:16px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;">
            <sc-for list="{{ cp.typeChips }}" as="t" hint-placeholder-count="5">
              <button type="button" aria-pressed="{{ t.sel }}" onClick="{{ t.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px 0 14px;border:none;border-radius:999px;background:{{ t.bg }};color:{{ t.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:{{ t.fw }};cursor:pointer;white-space:nowrap;transition:background-color .15s;"><i class="{{ t.iconCls }}" style="font-size:20px;flex:0 0 auto;color:{{ t.ic }};" aria-hidden="true"></i>{{ t.label }}</button>
            </sc-for>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(max(190px,(100% - 60px)/4),1fr));gap:24px 20px;margin-top:20px;align-items:start;">
            <sc-for list="{{ cp.byType.items }}" as="r" hint-placeholder-count="4">
              <button type="button" onClick="{{ r.onOpen }}" aria-label="{{ r.aria }}" style="display:flex;gap:10px;align-items:flex-start;width:100%;min-width:0;padding:0;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';">
                <span style="position:relative;flex:0 0 auto;width:62px;height:62px;border-radius:12px;overflow:hidden;background:#F3F4F2;">
                  <img loading="lazy" src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
                  <sc-if value="{{ r.priv }}">
                    <span style="position:absolute;left:5px;bottom:5px;width:22px;height:22px;border-radius:6px;background:#B0E800;display:flex;align-items:center;justify-content:center;">
                      <i class="hgi-twotone hgi-square-lock-02" style="font-size:13px;flex:0 0 auto;color:#013334;" aria-hidden="true"></i>
                    </span>
                  </sc-if>
                </span>
                <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">
                  <span style="display:block;font-size:14px;font-weight:600;color:#013334;line-height:1.3;text-wrap:pretty;">{{ r.name }}<sc-if value="{{ r.isBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:15px;margin-left:4px;vertical-align:-2px;color:#8A9793;"></i></sc-if></span>
                  <sc-if value="{{ r.hasMeta2 }}"></sc-if>
                  <span style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <span style="display:flex;padding-left:7px;flex:0 0 auto;">
                      <sc-for list="{{ r.avatars }}" as="a" hint-placeholder-count="3">
                        <img loading="lazy" src="{{ a.img }}" alt="" style="width:21px;height:21px;border-radius:999px;border:2px solid #FFFFFF;margin-left:-7px;background:#E8F1ED;object-fit:cover;display:block;flex:0 0 auto;">
                      </sc-for>
                    </span>
                    <sc-if value="{{ r.hasExtra }}">
                      <span style="font-size:12.5px;font-weight:600;color:#5B6B66;flex:0 0 auto;">{{ r.extra }}</span>
                    </sc-if>
                  </span>
                </span>
              </button>
            </sc-for>
          </div>
          <sc-if value="{{ cp.byType.hasMore }}">
            <button type="button" onClick="{{ cp.byType.onMore }}" aria-expanded="{{ cp.byType.moreA }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:12px;padding:0;border:none;background:transparent;color:#066349;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;" style-hover="text-decoration:underline;">{{ cp.byType.moreLabel }}<i class="hgi-twotone {{ cp.byType.moreIcon }}" style="font-size:16px;flex:0 0 auto;" aria-hidden="true"></i></button>
          </sc-if>
        </section>
      </sc-if>
      <section aria-label="Discover by city" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;">
          <div style="min-width:0;">
            <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Discover&nbsp;by city</h2>
            <p style="margin:5px 0 0;font-size:13.5px;color:#5B6B66;">Switch the city and this page follows</p>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex:0 0 auto;">
            <button type="button" disabled="{{ arrows.city.backOff }}" onClick="{{ citiesBack }}" aria-label="Previous cities" style="position:relative;width:24px;height:24px;flex:0 0 auto;border:1px solid {{ arrows.city.backBc }};border-radius:999px;background:{{ arrows.city.backBg }};display:flex;align-items:center;justify-content:center;cursor:{{ arrows.city.backCur }};pointer-events:{{ arrows.city.backPe }};opacity:{{ arrows.city.backOp }};transition:opacity .15s,background-color .15s;" style-before="content:'';position:absolute;inset:-10px;" style-hover="background:#D5E7DE;" style-active="transform:scale(0.96);">
              <i class="hgi-twotone hgi-arrow-left-01" style="font-size:14px;flex:0 0 auto;color:{{ arrows.city.backFg }};" aria-hidden="true"></i>
            </button>
            <button type="button" disabled="{{ arrows.city.nextOff }}" onClick="{{ citiesNext }}" aria-label="Next cities" style="position:relative;width:24px;height:24px;flex:0 0 auto;border:1px solid {{ arrows.city.nextBc }};border-radius:999px;background:{{ arrows.city.nextBg }};display:flex;align-items:center;justify-content:center;cursor:{{ arrows.city.nextCur }};pointer-events:{{ arrows.city.nextPe }};opacity:{{ arrows.city.nextOp }};transition:opacity .15s,background-color .15s;" style-before="content:'';position:absolute;inset:-10px;" style-hover="background:#D5E7DE;" style-active="transform:scale(0.96);">
              <i class="hgi-twotone hgi-arrow-right-01" style="font-size:14px;flex:0 0 auto;color:{{ arrows.city.nextFg }};" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div data-city-rail="1" style="display:flex;gap:16px;overflow-x:auto;scrollbar-width:none;scroll-snap-type:x mandatory;padding:18px 2px 12px;">
          <sc-for list="{{ cities }}" as="ct" hint-placeholder-count="5">
            <button type="button" onClick="{{ ct.onClick }}" aria-pressed="{{ ct.current }}" style="flex:0 0 {{ cityCardW }};scroll-snap-align:start;position:relative;display:block;min-width:0;height:65px;padding:0;border:none;border-radius:12px;overflow:hidden;background:lightgray;cursor:pointer;" style-hover="box-shadow:0 8px 26px rgba(1,51,52,.16);" style-active="transform:scale(0.98);">
              <img loading="lazy" src="{{ ct.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;display:block;transition:transform .45s ease;" style-hover="transform:scale(1.05);">
              <span style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,rgba(0,0,0,.2) 0%,rgba(0,0,0,.2) 100%);"></span>
              <span style="position: absolute; inset: 0; pointer-events: none; padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; color: #FFFFFF; left: 0px; top: 1px">
                <span style="font-size: 14px; font-weight: 700; letter-spacing: -.2px; line-height: 1.2; text-shadow: 0 1px 10px rgba(0,0,0,.35)">{{ ct.name }}</span>
                <sc-if value="{{ ct.soon }}"></sc-if>
              </span>
            </button>
          </sc-for>
        </div>
      </section>
    </sc-if>
    <sc-if value="{{ cp.isFollowing }}">
      <sc-if value="{{ cp.hasInv }}">
        <div style="margin-top:28px;border-radius:18px;background:#F6FCE0;overflow:hidden;">
          <button type="button" onClick="{{ cp.onInvToggle }}" aria-expanded="{{ cp.invOpenA }}" style="display:flex;align-items:center;gap:18px;width:100%;min-height:88px;padding:16px 20px;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';" style-hover="background:#F0F9D4;">
            <span aria-hidden="true" style="position:relative;flex:0 0 auto;width:72px;height:60px;">
              <sc-for list="{{ cp.invThumbs }}" as="th" hint-placeholder-count="2">
                <img loading="lazy" src="{{ th.img }}" alt="" style="position:absolute;left:{{ th.left }};top:{{ th.top }};width:48px;height:48px;border-radius:12px;object-fit:cover;border:2px solid #FFFFFF;box-shadow:0 4px 12px rgba(1,51,52,.18);transform:rotate({{ th.rot }});display:block;">
              </sc-for>
            </span>
            <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px;">
              <span style="font-size:16.5px;font-weight:600;color:#013334;">{{ cp.invTitle }}</span>
              <span style="font-size:14px;line-height:1.45;color:#3C4A45;text-wrap:pretty;">{{ cp.invLine }}</span>
            </span>
            <i class="hgi-twotone hgi-arrow-down-01" style="font-size:20px;flex:0 0 auto;color:#013334;transform:rotate({{ cp.invRot }});transition:transform .2s;" aria-hidden="true"></i>
          </button>
          <sc-if value="{{ cp.invOpen }}">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:8px;padding:0 12px 12px;">
              <sc-for list="{{ cp.invites }}" as="iv" hint-placeholder-count="2">
                <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;min-width:0;padding:12px;border-radius:12px;background:#FFFFFF;">
                  <img loading="lazy" src="{{ iv.img }}" alt="" style="width:56px;height:56px;border-radius:10px;object-fit:cover;flex:0 0 auto;display:block;">
                  <button type="button" onClick="{{ iv.onOpen }}" style="flex:1 1 160px;min-width:0;min-height:44px;display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';">
                    <span style="font-size:15px;font-weight:600;color:#013334;">{{ iv.name }}</span>
                    <span style="font-size:13px;color:#5B6B66;">{{ iv.line }}</span>
                  </button>
                  <div style="display:flex;gap:8px;flex:0 0 auto;margin-left:auto;">
                    <button type="button" onClick="{{ iv.onDecline }}" aria-label="{{ iv.declineAria }}" style="height:44px;padding:0 16px;border:1px solid #DDE3DF;border-radius:999px;background:#FFFFFF;color:#1F2937;font-family:'Google Sans';font-size:14px;font-weight:600;cursor:pointer;" style-hover="background:#F3F4F2;">Decline</button>
                    <button type="button" onClick="{{ iv.onJoin }}" aria-label="{{ iv.joinAria }}" style="height:44px;padding:0 20px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:14px;font-weight:600;cursor:pointer;" style-active="transform:scale(.98);">Join</button>
                  </div>
                </div>
              </sc-for>
            </div>
          </sc-if>
        </div>
      </sc-if>
      <sc-if value="{{ cp.folEmpty }}">
        <div style="margin-top:28px;max-width:560px;padding:28px;border-radius:18px;background:#F3F4F2;display:flex;flex-direction:column;align-items:flex-start;gap:10px;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:20px;font-weight:700;color:#013334;">You are not following any communities yet</h2>
          <p style="margin:0;font-size:14.5px;line-height:1.55;color:#3C4A45;text-wrap:pretty;">Join one and its experiences and moments show up here. Joining never books or pays for anything.</p>
          <button type="button" onClick="{{ cp.onDiscover }}" style="margin-top:6px;height:44px;padding:0 20px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;">Discover communities</button>
        </div>
      </sc-if>
      <sc-if value="{{ cp.hasFollowing }}">
        <section aria-label="Following" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Following</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(max(190px,(100% - 60px)/4),1fr));gap:24px 20px;margin-top:20px;align-items:start;">
            <sc-for list="{{ cp.following.items }}" as="r" hint-placeholder-count="4">
              <button type="button" onClick="{{ r.onOpen }}" aria-label="{{ r.aria }}" style="display:flex;gap:10px;align-items:flex-start;width:100%;min-width:0;padding:0;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';">
                <span style="position:relative;flex:0 0 auto;width:62px;height:62px;border-radius:12px;overflow:hidden;background:#F3F4F2;">
                  <img loading="lazy" src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
                  <sc-if value="{{ r.priv }}">
                    <span style="position:absolute;left:5px;bottom:5px;width:22px;height:22px;border-radius:6px;background:#B0E800;display:flex;align-items:center;justify-content:center;">
                      <i class="hgi-twotone hgi-square-lock-02" style="font-size:13px;flex:0 0 auto;color:#013334;" aria-hidden="true"></i>
                    </span>
                  </sc-if>
                </span>
                <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">
                  <span style="display:block;font-size:14px;font-weight:600;color:#013334;line-height:1.3;text-wrap:pretty;">{{ r.name }}<sc-if value="{{ r.isBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:15px;margin-left:4px;vertical-align:-2px;color:#8A9793;"></i></sc-if></span>
                  <span style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <span style="display:flex;padding-left:7px;flex:0 0 auto;">
                      <sc-for list="{{ r.avatars }}" as="a" hint-placeholder-count="3">
                        <img loading="lazy" src="{{ a.img }}" alt="" style="width:21px;height:21px;border-radius:999px;border:2px solid #FFFFFF;margin-left:-7px;background:#E8F1ED;object-fit:cover;display:block;flex:0 0 auto;">
                      </sc-for>
                    </span>
                    <sc-if value="{{ r.hasExtra }}">
                      <span style="font-size:12.5px;font-weight:600;color:#5B6B66;flex:0 0 auto;">{{ r.extra }}</span>
                    </sc-if>
                  </span>
                  <sc-if value="{{ r.hasMeta2 }}">
                    <span style="display:flex;align-items:center;flex-wrap:nowrap;gap:8px;min-width:0;">
                      <sc-if value="{{ r.hasCats }}">
                        <span style="display:flex;align-items:center;gap:4px;flex:0 1 auto;min-width:0;overflow:hidden;">
                          <sc-for list="{{ r.cats }}" as="k" hint-placeholder-count="2">
                            <i class="{{ k.icon }}" style="font-size:15px;flex:0 0 auto;color:#5B6B66;" aria-hidden="true"></i>
                          </sc-for>
                        </span>
                      </sc-if>
                      <sc-if value="{{ r.nDot }}">
                        <span aria-hidden="true" style="width:4px;height:4px;border-radius:999px;background:#2F74D0;flex:0 0 auto;"></span>
                      </sc-if>
                      <sc-if value="{{ r.hasN }}">
                        <span style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#5B6B66;flex:0 0 auto;"><i class="hgi-twotone hgi-calendar-03" style="font-size:15px;flex:0 0 auto;" aria-hidden="true"></i>{{ r.n }}</span>
                      </sc-if>
                    </span>
                  </sc-if>
                </span>
              </button>
            </sc-for>
          </div>
          <sc-if value="{{ cp.following.hasMore }}">
            <button type="button" onClick="{{ cp.following.onMore }}" aria-expanded="{{ cp.following.moreA }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:12px;padding:0;border:none;background:transparent;color:#066349;font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;" style-hover="text-decoration:underline;">{{ cp.following.moreLabel }}<i class="hgi-twotone {{ cp.following.moreIcon }}" style="font-size:16px;flex:0 0 auto;" aria-hidden="true"></i></button>
          </sc-if>
        </section>
      </sc-if>
      <sc-if value="{{ cp.hasFolSoon }}">
        <section aria-label="Happening in your communities" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Happening in your communities</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:26px 16px;margin-top:18px;">
            <sc-for list="{{ cp.folSoon }}" as="e" hint-placeholder-count="5">
              <div style="display:flex;flex-direction:column;gap:9px;min-width:0;">
                <div style="position:relative;">
                  <button type="button" onClick="{{ e.onOpen }}" style="display:block;width:100%;padding:0;border:none;background:#F3F4F2;border-radius:12px;overflow:hidden;aspect-ratio:1/1;cursor:pointer;">
                    <img loading="lazy" src="{{ e.img }}" alt="{{ e.title }}" style="width:100%;height:100%;object-fit:cover;display:block;">
                  </button>
                  <button type="button" onClick="{{ e.onSave }}" aria-label="{{ e.saveLabel }}" style="position:absolute;top:0;right:0;width:44px;height:44px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                    <i class="{{ e.saveCls }}" style="font-size:21px;flex:0 0 auto;filter:drop-shadow(0 1px 3px rgba(1,51,52,.55));color:{{ e.saveTint }};" aria-hidden="true"></i>
                  </button>
                  <sc-if value="{{ e.flag }}">
                    <span style="position:absolute;top:10px;left:10px;height:26px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#FFFFFF;font-size:11.5px;font-weight:700;display:inline-flex;align-items:center;gap:5px;"><i class="hgi-twotone {{ e.flagIcon }}" style="font-size:14px;flex:0 0 auto;" aria-hidden="true"></i>{{ e.flag }}</span>
                  </sc-if>
                </div>
                <button type="button" onClick="{{ e.onOpen }}" style="border:none;background:transparent;padding:0;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-width:0;">
                  <span style="font-size:10px;font-weight:600;color:#066349;">{{ e.host }}<sc-if value="{{ e.hostBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:12px;margin-left:3px;vertical-align:-2px;"></i></sc-if></span>
                  <span style="font-size:14px;font-weight:600;color:#013334;line-height:1.35;text-wrap:pretty;">{{ e.title }}</span>
                  <span style="font-size:12.5px;color:#5B6B66;">{{ e.when }}</span>
                  <span style="font-size:13px;font-weight:600;color:#1F2937;margin-top:2px;">{{ e.priceLine }}</span>
                </button>
              </div>
            </sc-for>
          </div>
        </section>
      </sc-if>
      <sc-if value="{{ cp.hasFolMoments }}">
        <section aria-label="Moments" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
          <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Moments</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:170px;grid-auto-flow:dense;gap:6px;margin-top:18px;">
            <sc-for list="{{ cp.folMoments }}" as="m" hint-placeholder-count="7">
              <button type="button" onClick="{{ m.onOpen }}" aria-label="{{ m.aria }}" style="grid-column:span {{ m.cs }};grid-row:span {{ m.rs }};position:relative;display:block;min-width:0;padding:0;border:none;border-radius:12px;overflow:hidden;background:#F3F4F2;cursor:pointer;">
                <img loading="lazy" src="{{ m.img }}" alt="{{ m.alt }}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease;" style-hover="transform:scale(1.04);">
                <sc-if value="{{ m.isAlbum }}">
                  <span style="position:absolute;top:6px;right:6px;display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:rgba(0,0,0,.55);color:#FFFFFF;font-size:11.5px;font-weight:700;pointer-events:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><rect x="8" y="8" width="13" height="13" rx="3"></rect><path d="M16 4H7a3 3 0 0 0-3 3v9"></path></svg>{{ m.albumCount }}</span>
                </sc-if>
              </button>
            </sc-for>
          </div>
        </section>
      </sc-if>
    </sc-if>
    <sc-if value="{{ cp.isMine }}">
      <sc-if value="{{ cp.hasOwn }}">
        <section aria-label="Created or hosted by you" style="display:flex;flex-direction:column;min-width:0;margin-top:28px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px 16px;flex-wrap:wrap;">
            <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Created or hosted by you</h2>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(max(190px,(100% - 60px)/4),1fr));gap:24px 20px;margin-top:20px;align-items:start;">
            <sc-for list="{{ cp.ownRows }}" as="r" hint-placeholder-count="4">
              <button type="button" onClick="{{ r.onOpen }}" aria-label="{{ r.aria }}" style="display:flex;gap:10px;align-items:flex-start;width:100%;min-width:0;padding:0;border:none;background:transparent;text-align:left;cursor:pointer;font-family:'Google Sans';">
                <span style="position:relative;flex:0 0 auto;width:62px;height:62px;border-radius:12px;overflow:hidden;background:#F3F4F2;">
                  <img loading="lazy" src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
                  <sc-if value="{{ r.priv }}">
                    <span style="position:absolute;left:5px;bottom:5px;width:22px;height:22px;border-radius:6px;background:#B0E800;display:flex;align-items:center;justify-content:center;">
                      <i class="hgi-twotone hgi-square-lock-02" style="font-size:13px;flex:0 0 auto;color:#013334;" aria-hidden="true"></i>
                    </span>
                  </sc-if>
                </span>
                <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">
                  <span style="display:block;font-size:14px;font-weight:600;color:#013334;line-height:1.3;text-wrap:pretty;">{{ r.name }}<sc-if value="{{ r.isBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:15px;margin-left:4px;vertical-align:-2px;color:#8A9793;"></i></sc-if></span>
                  <span style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <span style="display:flex;padding-left:7px;flex:0 0 auto;">
                      <sc-for list="{{ r.avatars }}" as="a" hint-placeholder-count="3">
                        <img loading="lazy" src="{{ a.img }}" alt="" style="width:21px;height:21px;border-radius:999px;border:2px solid #FFFFFF;margin-left:-7px;background:#E8F1ED;object-fit:cover;display:block;flex:0 0 auto;">
                      </sc-for>
                    </span>
                    <sc-if value="{{ r.hasExtra }}">
                      <span style="font-size:12.5px;font-weight:600;color:#5B6B66;flex:0 0 auto;">{{ r.extra }}</span>
                    </sc-if>
                  </span>
                  <sc-if value="{{ r.hasMeta2 }}">
                    <span style="display:flex;align-items:center;flex-wrap:nowrap;gap:8px;min-width:0;">
                      <sc-if value="{{ r.hasCats }}">
                        <span style="display:flex;align-items:center;gap:4px;flex:0 1 auto;min-width:0;overflow:hidden;">
                          <sc-for list="{{ r.cats }}" as="k" hint-placeholder-count="2">
                            <i class="{{ k.icon }}" style="font-size:15px;flex:0 0 auto;color:#5B6B66;" aria-hidden="true"></i>
                          </sc-for>
                        </span>
                      </sc-if>
                      <sc-if value="{{ r.nDot }}">
                        <span aria-hidden="true" style="width:4px;height:4px;border-radius:999px;background:#2F74D0;flex:0 0 auto;"></span>
                      </sc-if>
                      <sc-if value="{{ r.hasN }}">
                        <span style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#5B6B66;flex:0 0 auto;"><i class="hgi-twotone hgi-calendar-03" style="font-size:15px;flex:0 0 auto;" aria-hidden="true"></i>{{ r.n }}</span>
                      </sc-if>
                    </span>
                  </sc-if>
                </span>
              </button>
            </sc-for>
          </div>
        </section>
        <sc-if value="{{ cp.hasMineSoon }}">
          <section aria-label="Happening in your communities" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
            <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Happening in your communities</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:26px 16px;margin-top:18px;">
              <sc-for list="{{ cp.mineSoon }}" as="e" hint-placeholder-count="5">
                <div style="display:flex;flex-direction:column;gap:9px;min-width:0;">
                  <div style="position:relative;">
                    <button type="button" onClick="{{ e.onOpen }}" style="display:block;width:100%;padding:0;border:none;background:#F3F4F2;border-radius:12px;overflow:hidden;aspect-ratio:1/1;cursor:pointer;">
                      <img loading="lazy" src="{{ e.img }}" alt="{{ e.title }}" style="width:100%;height:100%;object-fit:cover;display:block;">
                    </button>
                    <button type="button" onClick="{{ e.onSave }}" aria-label="{{ e.saveLabel }}" style="position:absolute;top:0;right:0;width:44px;height:44px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                      <i class="{{ e.saveCls }}" style="font-size:21px;flex:0 0 auto;filter:drop-shadow(0 1px 3px rgba(1,51,52,.55));color:{{ e.saveTint }};" aria-hidden="true"></i>
                    </button>
                    <sc-if value="{{ e.flag }}">
                      <span style="position:absolute;top:10px;left:10px;height:26px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#FFFFFF;font-size:11.5px;font-weight:700;display:inline-flex;align-items:center;gap:5px;"><i class="hgi-twotone {{ e.flagIcon }}" style="font-size:14px;flex:0 0 auto;" aria-hidden="true"></i>{{ e.flag }}</span>
                    </sc-if>
                  </div>
                  <button type="button" onClick="{{ e.onOpen }}" style="border:none;background:transparent;padding:0;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-width:0;">
                    <span style="font-size:10px;font-weight:600;color:#066349;">{{ e.host }}<sc-if value="{{ e.hostBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:12px;margin-left:3px;vertical-align:-2px;"></i></sc-if></span>
                    <span style="font-size:14px;font-weight:600;color:#013334;line-height:1.35;text-wrap:pretty;">{{ e.title }}</span>
                    <span style="font-size:12.5px;color:#5B6B66;">{{ e.when }}</span>
                    <span style="font-size:13px;font-weight:600;color:#1F2937;margin-top:2px;">{{ e.priceLine }}</span>
                  </button>
                </div>
              </sc-for>
            </div>
          </section>
        </sc-if>
        <sc-if value="{{ cp.hasMineMoments }}">
          <section aria-label="Moments" style="display:flex;flex-direction:column;min-width:0;margin-top:32px;">
            <h2 style="margin:0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">Moments</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:170px;grid-auto-flow:dense;gap:6px;margin-top:18px;">
              <sc-for list="{{ cp.mineMoments }}" as="m" hint-placeholder-count="7">
                <button type="button" onClick="{{ m.onOpen }}" aria-label="{{ m.aria }}" style="grid-column:span {{ m.cs }};grid-row:span {{ m.rs }};position:relative;display:block;min-width:0;padding:0;border:none;border-radius:12px;overflow:hidden;background:#F3F4F2;cursor:pointer;">
                  <img loading="lazy" src="{{ m.img }}" alt="{{ m.alt }}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease;" style-hover="transform:scale(1.04);">
                  <sc-if value="{{ m.isAlbum }}">
                    <span style="position:absolute;top:6px;right:6px;display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:rgba(0,0,0,.55);color:#FFFFFF;font-size:11.5px;font-weight:700;pointer-events:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><rect x="8" y="8" width="13" height="13" rx="3"></rect><path d="M16 4H7a3 3 0 0 0-3 3v9"></path></svg>{{ m.albumCount }}</span>
                  </sc-if>
                </button>
              </sc-for>
            </div>
          </section>
        </sc-if>
      </sc-if>
      <sc-if value="{{ cp.noOwn }}">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;max-width:520px;margin:64px auto 0;">
          <div aria-hidden="true" style="position:relative;width:200px;height:136px;">
            <img loading="lazy" src="{{ cp.emptyA }}" alt="" style="position:absolute;left:16px;top:20px;width:80px;height:104px;border-radius:12px;object-fit:cover;border:3px solid #FFFFFF;box-shadow:0 6px 18px rgba(1,51,52,.16);transform:rotate(-10deg);display:block;">
            <img loading="lazy" src="{{ cp.emptyC }}" alt="" style="position:absolute;right:16px;top:20px;width:80px;height:104px;border-radius:12px;object-fit:cover;border:3px solid #FFFFFF;box-shadow:0 6px 18px rgba(1,51,52,.16);transform:rotate(10deg);display:block;">
            <img loading="lazy" src="{{ cp.emptyB }}" alt="" style="position:absolute;left:50%;top:0;width:100px;height:128px;margin-left:-50px;border-radius:14px;object-fit:cover;border:3px solid #FFFFFF;box-shadow:0 10px 26px rgba(1,51,52,.2);display:block;">
          </div>
          <h2 style="margin:24px 0 0;font-family:'Google Sans';font-size:22px;font-weight:700;color:#013334;letter-spacing:-.3px;">No communities... yet!</h2>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:#1F2937;text-wrap:pretty;">Think of a community as your website, business, social media page, or even a WhatsApp group. It helps you organise your activities and keeps members connected throughout different experiences.</p>
          <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#5B6B66;text-wrap:pretty;">By creating a community, you agree to our <button type="button" onClick="{{ cp.onTerms }}" style="position:relative;display:inline;padding:0;border:none;background:transparent;font:inherit;color:#066349;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px;" style-before="content:'';position:absolute;inset:-12px -2px;">terms of use</button> and <button type="button" onClick="{{ cp.onPrivacy }}" style="position:relative;display:inline;padding:0;border:none;background:transparent;font:inherit;color:#066349;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px;" style-before="content:'';position:absolute;inset:-12px -2px;">privacy policy</button>.</p>
          <button type="button" onClick="{{ cp.onCreate }}" style="margin-top:26px;width:100%;max-width:420px;height:52px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:pointer;" style-hover="filter:brightness(.96);" style-active="transform:scale(.98);"><i class="hgi-twotone hgi-user-group" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Create community</button>
        </div>
      </sc-if>
    </sc-if>
  </div>
</sc-if>

<!-- Panel header, shared by every panel -->
<div style="flex:0 0 auto;display:flex;align-items:center;gap:8px;height:68px;padding:0 16px;border-bottom:1px solid #EDF0EE;">
  <sc-if value="{{ pn.canBack }}">
    <button type="button" onClick="{{ pn.onBack }}" aria-label="Back" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#066349;" style-hover="background:#E8F1ED;">
      <i class="hgi-twotone hgi-arrow-left-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
    </button>
  </sc-if>
  <span style="flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:0 6px;">
    <span style="min-width:0;font-size:24px;font-weight:700;letter-spacing:-.4px;color:#1F2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ pn.headTitle }}</span>
    <sc-if value="{{ pn.headBiz }}">
      <span tabIndex="0" role="img" aria-label="Verified business" onMouseEnter="{{ pn.onBizTip }}" onMouseLeave="{{ pn.offBizTip }}" onFocus="{{ pn.onBizTip }}" onBlur="{{ pn.offBizTip }}" style="position:relative;flex:0 0 auto;width:30px;height:30px;margin-left:-6px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:default;outline:none;" style-focus="box-shadow:0 0 0 3px #E8F1ED;" style-before="content:'';position:absolute;inset:-7px;">
        <i class="hgi-twotone hgi-briefcase-01" style="font-size:24px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>
        <sc-if value="{{ pn.bizTip }}">
          <span role="tooltip" style="position:absolute;z-index:5;top:calc(100% + 10px);left:50%;transform:translateX(-50%);padding:7px 12px;border-radius:10px;background:#F3F4F2;color:#1F2937;font-size:13px;font-weight:600;white-space:nowrap;box-shadow:0 4px 14px rgba(1,51,52,.12);pointer-events:none;">Verified business</span>
        </sc-if>
      </span>
    </sc-if>
    <sc-if value="{{ pn.headPriv }}">
      <span tabIndex="0" role="img" aria-label="Private community" onMouseEnter="{{ pn.onPrivTip }}" onMouseLeave="{{ pn.offPrivTip }}" onFocus="{{ pn.onPrivTip }}" onBlur="{{ pn.offPrivTip }}" style="position:relative;flex:0 0 auto;width:30px;height:30px;border-radius:8px;background:#B0E800;display:flex;align-items:center;justify-content:center;cursor:default;outline:none;" style-focus="box-shadow:0 0 0 3px #E8F1ED;" style-before="content:'';position:absolute;inset:-7px;">
        <i class="hgi-twotone hgi-square-lock-02" style="font-size:17px;flex:0 0 auto;color:#013334;" aria-hidden="true"></i>
        <sc-if value="{{ pn.privTip }}">
          <span role="tooltip" style="position:absolute;z-index:5;top:calc(100% + 10px);left:50%;transform:translateX(-50%);padding:7px 12px;border-radius:10px;background:#013334;color:#FFFFFF;font-size:13px;font-weight:600;white-space:nowrap;box-shadow:0 6px 18px rgba(1,51,52,.2);pointer-events:none;">Private community</span>
        </sc-if>
      </span>
    </sc-if>
  </span>
  <sc-if value="{{ pn.hasPreview }}">
    <button type="button" onClick="{{ pn.onPreview }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 14px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;" style-hover="background:#E8F1ED;"><i class="hgi hgi-stroke hgi-rounded hgi-view" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Preview</button>
  </sc-if>
  <sc-if value="{{ pn.hasHeadEdit }}">
    <button type="button" onClick="{{ pn.onHeadEdit }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px 0 14px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);font-family:'Google Sans';font-size:14.5px;font-weight:600;color:#FFFFFF;cursor:pointer;white-space:nowrap;" style-active="transform:scale(0.98);"><i class="hgi hgi-stroke hgi-rounded hgi-edit-04" style="font-size:20px;flex:0 0 auto;font-size:18px;" aria-hidden="true"></i>Edit experience</button>
  </sc-if>
  <sc-if value="{{ pn.hasInvite }}">
    <button type="button" onClick="{{ pn.onInvite }}" aria-label="Invite members" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#066349;" style-hover="background:#E8F1ED;">
      <i class="hgi-twotone hgi-user-add-02" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
    </button>
  </sc-if>
  <sc-if value="{{ pn.canShare }}">
    <button type="button" onClick="{{ pn.onShare }}" aria-label="Share" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#066349;" style-hover="background:#E8F1ED;">
      <i class="hgi-twotone hgi-share-08" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
    </button>
  </sc-if>
  <sc-if value="{{ pn.canSave }}">
    <sc-if value="{{ pn.isSaved }}">
      <button type="button" onClick="{{ pn.onSave }}" aria-label="{{ pn.saveLabel }}" aria-pressed="true" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#B0E800;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#013334;" style-hover="background:#A3D900;">
        <i class="hgi-bulk hgi-shopping-basket-done-02" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
      </button>
    </sc-if>
    <sc-if value="{{ pn.notSaved }}">
      <button type="button" onClick="{{ pn.onSave }}" aria-label="{{ pn.saveLabel }}" aria-pressed="false" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#066349;" style-hover="background:#E8F1ED;">
        <i class="hgi-bulk hgi-shopping-basket-add-02" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
      </button>
    </sc-if>
  </sc-if>
  <sc-if value="{{ pn.hasChatDel }}">
    <button type="button" onClick="{{ pn.onChatDel }}" aria-label="Delete conversation" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#E02D3C;" style-hover="background:#FEF3F2;">
      <i class="hgi-twotone hgi-delete-02" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
    </button>
  </sc-if>
  <button type="button" onClick="{{ pn.onClose }}" aria-label="Close" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#E02D3C;" style-hover="background:#FEF3F2;">
    <i class="hgi-twotone hgi-cancel-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
  </button>
</div>

<!-- Community drawer, inside the panel body -->
<sc-if value="{{ pn.isComm }}">
  <nav aria-label="Sections" style="position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;margin:-20px -24px -12px;padding:12px 24px;background:#FFFFFF;overflow-x:auto;scrollbar-width:none;">
    <sc-for list="{{ pn.secs }}" as="sc" hint-placeholder-count="5">
      <button type="button" onClick="{{ sc.onClick }}" aria-current="{{ sc.cur }}" style="display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;height:44px;padding:0 18px 0 12px;border:none;border-radius:999px;background:{{ sc.bg }};color:{{ sc.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:500;white-space:nowrap;cursor:pointer;" style-hover="filter:brightness(0.97);" style-active="transform:scale(0.98);"><i class="{{ sc.icon }}" style="font-size:21px;flex:0 0 auto;color:{{ sc.ic }};" aria-hidden="true"></i>{{ sc.label }}</button>
    </sc-for>
  </nav>
  <div style="position:relative;margin:0 -24px;">
    <div data-gal-row="1" onScroll="{{ pn.onGalScroll }}" style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:0 24px;scroll-snap-type:x proximity;scroll-padding:0 24px;">
      <sc-for list="{{ pn.gallery }}" as="g" hint-placeholder-count="4">
        <button type="button" onClick="{{ g.onOpen }}" aria-label="{{ g.aria }}" style="flex:0 0 auto;width:{{ g.w }};height:240px;padding:0;border:none;border-radius:12px;overflow:hidden;background:#F3F4F2;cursor:zoom-in;scroll-snap-align:start;">
          <img loading="lazy" src="{{ g.img }}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
        </button>
      </sc-for>
    </div>
    <sc-if value="{{ pn.galCanPrev }}">
      <button type="button" onClick="{{ pn.onGalRowPrev }}" aria-label="Scroll photos left" style="position:absolute;left:14px;top:50%;z-index:2;transform:translateY(-50%);width:44px;height:44px;border:none;border-radius:999px;background:rgba(255,255,255,.95);color:#013334;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(1,51,52,.25);" style-hover="background:#FFFFFF;" style-active="transform:translateY(-50%) scale(0.94);">
        <i class="hgi-twotone hgi-arrow-left-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
      </button>
    </sc-if>
    <sc-if value="{{ pn.galCanNext }}">
      <button type="button" onClick="{{ pn.onGalRowNext }}" aria-label="Scroll photos right" style="position:absolute;right:14px;top:50%;z-index:2;transform:translateY(-50%);width:44px;height:44px;border:none;border-radius:999px;background:rgba(255,255,255,.95);color:#013334;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(1,51,52,.25);" style-hover="background:#FFFFFF;" style-active="transform:translateY(-50%) scale(0.94);">
        <i class="hgi-twotone hgi-arrow-right-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
      </button>
    </sc-if>
  </div>
  <div style="display:flex;align-items:center;justify-content:flex-start;flex-wrap:wrap;gap:8px;margin-top:-12px;">
    <span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 12px;border:1px solid #E3E7E5;border-radius:999px;background:#EEF1EF;font-size:14.5px;color:#3F4B47;white-space:nowrap;"><i class="hgi-twotone hgi-building-03" style="font-size:19px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>{{ pn.city }}</span>
    <sc-if value="{{ pn.hasBizChip }}">
      <button type="button" onClick="{{ pn.onBizChip }}" aria-label="{{ pn.bizChipAria }}" style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 12px;border:none;border-radius:999px;background:#E8F1ED;font-family:'Google Sans';font-size:14.5px;color:#013334;cursor:pointer;white-space:nowrap;" style-hover="background:#DCEAE3;"><i class="hgi-twotone hgi-briefcase-01" style="font-size:19px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>Verified business<span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>{{ pn.bizCount }}</button>
    </sc-if>
  </div>
  <div data-psec="about" style="display:flex;flex-direction:column;gap:4px;margin-top:-14px;">
    <p data-about="1" style="margin:0;font-size:15px;line-height:1.6;color:#1F2937;text-wrap:pretty;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:{{ pn.aboutClamp }};overflow:hidden;">{{ pn.about }}</p>
    <sc-if value="{{ pn.aboutOpen }}">
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
        <sc-for list="{{ pn.aboutBlocks }}" as="ab" hint-placeholder-count="4">
          <sc-if value="{{ ab.isH }}">
            <h4 style="margin:12px 0 0;font-family:'Google Sans';font-size:16px;font-weight:700;color:#013334;letter-spacing:-.1px;">{{ ab.text }}</h4>
          </sc-if>
          <sc-if value="{{ ab.isSub }}">
            <h5 style="margin:4px 0 0;font-family:'Google Sans';font-size:14.5px;font-weight:700;color:#1F2937;">{{ ab.text }}</h5>
          </sc-if>
          <sc-if value="{{ ab.isP }}"><p style="margin:0;font-size:15px;line-height:1.6;color:#1F2937;text-wrap:pretty;">{{ ab.text }}</p></sc-if>
          <sc-if value="{{ ab.isLi }}">
            <div style="display:flex;align-items:flex-start;gap:10px;font-size:15px;line-height:1.6;color:#1F2937;">
              <span aria-hidden="true" style="flex:0 0 auto;width:6px;height:6px;margin-top:10px;border-radius:999px;background:#066349;"></span>
              <span style="min-width:0;text-wrap:pretty;"><span style="font-weight:600;color:#013334;">{{ ab.lead }}</span> {{ ab.text }}</span>
            </div>
          </sc-if>
        </sc-for>
      </div>
    </sc-if>
    <sc-if value="{{ pn.aboutToggle }}">
      <button type="button" onClick="{{ pn.onAboutMore }}" aria-expanded="{{ pn.aboutOpen }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:44px;margin:-4px 0 -10px;padding:0;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;" style-hover="text-decoration:underline;">{{ pn.aboutLabel }}<i class="hgi-twotone {{ pn.aboutIcon }}" style="font-size:17px;flex:0 0 auto;" aria-hidden="true"></i></button>
    </sc-if>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:20px 24px;">
    <sc-for list="{{ pn.details }}" as="d" hint-placeholder-count="8">
      <div style="display:flex;align-items:flex-start;gap:16px;min-width:0;">
        <i class="hgi-twotone {{ d.icon }}" style="font-size:22px;flex:0 0 auto;color:#1F2937;margin-top:1px;" aria-hidden="true"></i>
        <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;">{{ d.k }}</span>
          <sc-if value="{{ d.href }}">
            <span style="display:flex;align-items:center;gap:4px;margin:-12px 0;">
              <a href="{{ d.href }}" style="display:inline-flex;align-items:center;min-height:44px;font-size:14.5px;color:#5B6B66;text-decoration:none;" style-hover="color:#066349;text-decoration:underline;">{{ d.v }}</a>
              <sc-if value="{{ d.onCopy }}">
                <button type="button" onClick="{{ d.onCopy }}" aria-label="{{ d.copyAria }}" title="Copy" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#066349;" style-hover="background:#E8F1ED;">
                  <i class="hgi-twotone {{ d.copyIcon }}" style="font-size:18px;flex:0 0 auto;" aria-hidden="true"></i>
                </button>
              </sc-if>
            </span>
          </sc-if>
          <sc-if value="{{ d.plain }}"><span style="font-size:14.5px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">{{ d.v }}</span></sc-if>
        </span>
      </div>
    </sc-for>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  <sc-if value="{{ pn.hasSocials }}">
    <div style="display:flex;flex-direction:column;gap:14px;">
      <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Socials</h3>
      <div style="display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;margin:0 -24px;padding:0 24px;">
        <sc-for list="{{ pn.socials }}" as="so" hint-placeholder-count="4">
          <button type="button" onClick="{{ so.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px 0 14px;border:none;border-radius:999px;background:{{ so.bg }};color:{{ so.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:500;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(0.96);"><i class="hgi-twotone {{ so.icon }}" style="font-size:19px;flex:0 0 auto;" aria-hidden="true"></i>{{ so.label }}</button>
        </sc-for>
      </div>
    </div>
    <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  </sc-if>
  <div data-psec="members" style="display:flex;flex-direction:column;gap:14px;">
    <div>
      <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Members</h3>
      <p style="margin:6px 0 0;font-size:14px;line-height:1.45;color:#5B6B66;">{{ pn.memberLine }}</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      <sc-for list="{{ pn.members }}" as="mb" hint-placeholder-count="6">
        <span style="display:inline-flex;align-items:center;gap:8px;max-width:220px;height:44px;padding:0 16px 0 5px;border-radius:999px;background:#F3F4F2;font-size:14px;color:#1F2937;">
          <sc-if value="{{ mb.hasImg }}">
            <img loading="lazy" src="{{ mb.img }}" alt="" style="width:34px;height:34px;border-radius:999px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
          </sc-if>
          <sc-if value="{{ mb.noImg }}">
            <span style="width:34px;height:34px;border-radius:999px;background:#E8F1ED;color:#013334;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:0 0 auto;">{{ mb.initial }}</span>
          </sc-if>
          <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ mb.name }}</span>
          <sc-if value="{{ mb.role }}"><span style="flex:0 0 auto;font-size:12.5px;font-weight:600;color:#066349;">{{ mb.role }}</span></sc-if>
        </span>
      </sc-for>
      <sc-if value="{{ pn.membersMore }}">
        <button type="button" onClick="{{ pn.onMembersAll }}" aria-label="{{ pn.membersAllAria }}" style="display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:44px;padding:0 14px;border:none;border-radius:999px;background:#E8F1ED;color:#066349;font-family:'Google Sans';font-size:14px;font-weight:700;cursor:pointer;" style-hover="background:#DCEAE3;">{{ pn.membersMore }}</button>
      </sc-if>
    </div>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  <sc-if value="{{ pn.hasUp }}">
    <div data-psec="exps" data-up="1" style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Upcoming experiences</h3>
        <p style="margin:6px 0 0;font-size:14px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">Upcoming experiences in {{ pn.title }}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;gap:2px;margin-left:-12px;">
          <button type="button" onClick="{{ pn.onUpPrev }}" aria-label="Previous week" disabled="{{ pn.upPrevOff }}" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1F2937;opacity:{{ pn.upPrevOp }};" style-hover="background:#F3F4F2;">
            <i class="hgi-twotone hgi-arrow-left-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
          </button>
          <span aria-live="polite" style="font-size:15.5px;font-weight:600;color:#1F2937;">{{ pn.upWeekLabel }}</span>
          <button type="button" onClick="{{ pn.onUpNext }}" aria-label="Next week" disabled="{{ pn.upNextOff }}" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1F2937;opacity:{{ pn.upNextOp }};" style-hover="background:#F3F4F2;">
            <i class="hgi-twotone hgi-arrow-right-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
          </button>
        </div>
        <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;">
          <sc-for list="{{ pn.upDays }}" as="ud" hint-placeholder-count="7">
            <button type="button" onClick="{{ ud.onClick }}" aria-pressed="{{ ud.on }}" aria-label="{{ ud.aria }}" disabled="{{ ud.past }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;height:44px;padding:0 14px;border:1px solid {{ ud.bc }};border-radius:999px;background:{{ ud.bg }};color:{{ ud.fg }};font-family:'Google Sans';font-size:14.5px;cursor:{{ ud.cur }};white-space:nowrap;">
              <span>{{ ud.wd }}</span>
              <span style="font-weight:700;">{{ ud.d }}</span>
              <sc-if value="{{ ud.hasDots }}">
                <span aria-hidden="true" style="display:inline-flex;align-items:center;gap:3px;margin-left:2px;">
                  <sc-for list="{{ ud.dots }}" as="dt" hint-placeholder-count="1">
                    <span style="display:block;width:5px;height:5px;border-radius:999px;background:{{ dt.c }};"></span>
                  </sc-for>
                </span>
              </sc-if>
            </button>
          </sc-for>
        </div>
        <sc-if value="{{ pn.hasUpList }}">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:22px 14px;padding-top:6px;">
            <sc-for list="{{ pn.upList }}" as="e" hint-placeholder-count="3">
              <div style="display:flex;flex-direction:column;gap:9px;min-width:0;">
                <div style="position:relative;">
                  <button type="button" onClick="{{ e.onOpen }}" style="display:block;width:100%;padding:0;border:none;background:#F3F4F2;border-radius:12px;overflow:hidden;aspect-ratio:1/1;cursor:pointer;">
                    <img loading="lazy" src="{{ e.img }}" alt="{{ e.title }}" style="width:100%;height:100%;object-fit:cover;display:block;">
                  </button>
                  <button type="button" onClick="{{ e.onSave }}" aria-label="{{ e.saveLabel }}" style="position:absolute;top:0;right:0;width:44px;height:44px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                    <i class="{{ e.saveCls }}" style="font-size:21px;flex:0 0 auto;filter:drop-shadow(0 1px 3px rgba(1,51,52,.55));color:{{ e.saveTint }};" aria-hidden="true"></i>
                  </button>
                  <sc-if value="{{ e.flag }}">
                    <span style="position:absolute;top:10px;left:10px;height:26px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#FFFFFF;font-size:11.5px;font-weight:700;display:inline-flex;align-items:center;gap:5px;"><i class="hgi-twotone {{ e.flagIcon }}" style="font-size:14px;flex:0 0 auto;" aria-hidden="true"></i>{{ e.flag }}</span>
                  </sc-if>
                </div>
                <button type="button" onClick="{{ e.onOpen }}" style="border:none;background:transparent;padding:0;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-width:0;">
                  <span style="font-size:10px;font-weight:600;color:#066349;">{{ e.host }}<sc-if value="{{ e.hostBiz }}"><i class="hgi-twotone hgi-briefcase-01" role="img" aria-label="Verified business" style="font-size:12px;margin-left:3px;vertical-align:-2px;"></i></sc-if></span>
                  <span style="font-size:14px;font-weight:600;color:#013334;line-height:1.35;text-wrap:pretty;">{{ e.title }}</span>
                  <span style="font-size:12.5px;color:#5B6B66;">{{ e.when }}</span>
                  <span style="font-size:13px;font-weight:600;color:#1F2937;margin-top:2px;">{{ e.priceLine }}</span>
                </button>
              </div>
            </sc-for>
          </div>
        </sc-if>
        <sc-if value="{{ pn.noUpList }}">
          <p style="margin:0;padding-top:4px;font-size:14px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">{{ pn.noUpLine }}</p>
        </sc-if>
      </div>
    </div>
    <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  </sc-if>
  <div data-psec="moments" style="display:flex;flex-direction:column;gap:14px;">
    <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Moments from {{ pn.title }}</h3>
    <button type="button" onClick="{{ pn.onCompose }}" aria-label="Share a moment from {{ pn.title }}" style="display:flex;align-items:center;gap:14px;margin:0 -24px;padding:4px 24px 16px;border:none;border-bottom:1px solid #EDF0EE;background:transparent;text-align:left;cursor:text;font-family:'Google Sans';">
      <img loading="lazy" src="{{ pn.meImg }}" alt="" style="width:48px;height:48px;border-radius:999px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
      <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px;">
        <span style="font-size:15px;font-weight:600;color:#1F2937;">{{ pn.meName }}</span>
        <span style="font-size:14.5px;color:#5B6B66;">What are you up to?</span>
      </span>
    </button>
  </div>
  <sc-if value="{{ pn.hasMoments }}">
    <div style="container-type:inline-size;margin-top:-12px;">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:calc((100cqw - 8px) / 3);grid-auto-flow:dense;gap:4px;">
        <sc-for list="{{ pn.moments }}" as="m" hint-placeholder-count="7">
          <button type="button" onClick="{{ m.onOpen }}" aria-label="{{ m.aria }}" style="grid-column:{{ m.gc }};grid-row:{{ m.gr }};position:relative;padding:0;border:none;border-radius:12px;overflow:hidden;background:#F3F4F2;cursor:pointer;">
            <img loading="lazy" src="{{ m.img }}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
            <sc-if value="{{ m.isAlbum }}">
              <span style="position:absolute;top:6px;right:6px;display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:rgba(0,0,0,.55);color:#FFFFFF;font-size:11.5px;font-weight:700;pointer-events:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><rect x="8" y="8" width="13" height="13" rx="3"></rect><path d="M16 4H7a3 3 0 0 0-3 3v9"></path></svg>{{ m.albumCount }}</span>
            </sc-if>
          </button>
        </sc-for>
      </div>
    </div>
    <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  </sc-if>
  <sc-if value="{{ pn.noMoments }}">
    <p style="margin:-8px 0 0;font-size:14px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">No moments from {{ pn.title }} yet. Yours could be the first.</p>
  </sc-if>
  <div style="display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin:-8px -24px 0;padding:16px 24px;background:#F3F4F2;">
    <img loading="lazy" src="{{ pn.orgImg }}" alt="" style="width:52px;height:52px;border-radius:999px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
    <span style="flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px;">
      <button type="button" onClick="{{ pn.onOrg }}" style="align-self:flex-start;max-width:100%;display:inline-flex;align-items:center;gap:6px;min-height:44px;margin:-10px 0 -8px;padding:0;border:none;background:transparent;text-align:left;font-family:'Google Sans';font-size:15px;color:#1F2937;cursor:pointer;" style-hover="color:#066349;">
        <span style="color:#5B6B66;">{{ pn.hostRole }}:</span>
        <span style="min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ pn.orgName }}</span>
        <i class="hgi-bulk hgi-checkmark-badge-01" role="img" aria-label="Verified" style="font-size:18px;flex:0 0 auto;color:#066349;"></i>
        <i class="hgi-twotone hgi-arrow-up-right-01" style="font-size:16px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>
      </button>
      <span style="font-size:13.5px;color:#5B6B66;">{{ pn.orgLine }}</span>
    </span>
    <button type="button" onClick="{{ pn.onMessage }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 20px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:14.5px;font-weight:700;cursor:pointer;white-space:nowrap;" style-active="transform:scale(0.98);"><i class="hgi-twotone hgi-bubble-chat" style="font-size:18px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.msgLabel }}</button>
  </div>
  <sc-if value="{{ pn.hasPlaces }}">
    <div data-psec="places" style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <button type="button" onClick="{{ pn.onPlacesAll }}" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;margin:-10px 0;padding:0;border:none;background:transparent;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;cursor:pointer;" style-hover="color:#066349;">Places<i class="hgi-twotone hgi-arrow-right-01" style="font-size:20px;flex:0 0 auto;color:#5B6B66;" aria-hidden="true"></i></button>
        <p style="margin:6px 0 0;font-size:14px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">{{ pn.placesSub }}</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:22px 14px;">
        <sc-for list="{{ pn.places }}" as="p" hint-placeholder-count="2">
          <div style="display:flex;flex-direction:column;gap:9px;min-width:0;">
            <div style="position:relative;">
              <button type="button" onClick="{{ p.onOpen }}" style="display:block;width:100%;padding:0;border:none;background:#F3F4F2;border-radius:12px;overflow:hidden;aspect-ratio:1/1;cursor:pointer;">
                <img loading="lazy" src="{{ p.img }}" alt="{{ p.name }}" style="width:100%;height:100%;object-fit:cover;display:block;filter:{{ p.imgFilter }};">
              </button>
              <button type="button" onClick="{{ p.onSave }}" aria-label="{{ p.saveLabel }}" style="position:absolute;top:0;right:0;width:44px;height:44px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <i class="{{ p.saveCls }}" style="font-size:21px;flex:0 0 auto;filter:drop-shadow(0 1px 3px rgba(1,51,52,.55));color:{{ p.saveTint }};" aria-hidden="true"></i>
              </button>
              <sc-if value="{{ p.isShut }}">
                <span style="position:absolute;left:8px;bottom:8px;max-width:calc(100% - 16px);box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px 0 9px;border-radius:999px;font-family:'Google Sans';font-size:10.5px;font-weight:600;white-space:nowrap;pointer-events:none;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#FFFFFF;">
                  <span aria-hidden="true" style="width:7px;height:7px;border-radius:999px;flex:0 0 auto;background:#C4CBC8;"></span>
                  <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;">{{ p.pillText }}</span>
                </span>
              </sc-if>
              <sc-if value="{{ p.isSoon }}">
                <span style="position:absolute;left:8px;bottom:8px;max-width:calc(100% - 16px);box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px 0 9px;border-radius:999px;font-family:'Google Sans';font-size:10.5px;font-weight:600;white-space:nowrap;pointer-events:none;background:#FBBF24;color:#1F2937;box-shadow:0 2px 6px rgba(1,51,52,.25);"><span aria-hidden="true" style="width:7px;height:7px;border-radius:999px;flex:0 0 auto;background:#92400E;"></span>Closes soon</span>
              </sc-if>
            </div>
            <button type="button" onClick="{{ p.onOpen }}" style="border:none;background:transparent;padding:0;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-width:0;">
              <span style="font-size:14px;font-weight:600;color:#013334;line-height:1.35;">{{ p.name }}</span>
              <span style="font-size:12.5px;color:#5B6B66;">{{ p.locality }}</span>
              <span style="display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 16px; color: {{ p.factColor }}; font-weight: 600; margin-top: 2px"><i class="hgi-twotone {{ p.factIcon }}" style="font-size:15px;line-height:16px;flex:0 0 auto;" aria-hidden="true"></i>{{ p.fact }}</span>
            </button>
          </div>
        </sc-for>
      </div>
    </div>
    <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  </sc-if>
  <div data-psec="reviews" style="display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 16px;margin-bottom:6px;">
      <button type="button" onClick="{{ pn.onAllReviews }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:44px;margin:-10px 0;padding:0;border:none;background:transparent;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;cursor:pointer;" style-hover="color:#066349;">Reviews<i class="hgi-twotone hgi-arrow-right-01" style="font-size:20px;flex:0 0 auto;color:#5B6B66;" aria-hidden="true"></i></button>
      <span style="display:inline-flex;align-items:center;gap:7px;font-size:14.5px;color:#1F2937;white-space:nowrap;"><sc-if value="{{ pn.hasRating }}"><i class="hgi-bulk hgi-star" style="font-size:18px;flex:0 0 auto;color:#FBBF24;" aria-hidden="true"></i><span style="font-weight:600;">{{ pn.ratingNum }}</span><span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span></sc-if>{{ pn.reviewsLine }}</span>
    </div>
    <sc-if value="{{ pn.hasReviews }}">
      <sc-for list="{{ pn.reviews }}" as="r" hint-placeholder-count="3">
        <div style="display:flex;align-items:flex-start;gap:14px;margin:0 -24px;padding:18px 24px;border-top:1px solid {{ r.bt }};">
          <img loading="lazy" src="{{ r.img }}" alt="" style="width:48px;height:48px;border-radius:999px;object-fit:cover;display:block;flex:0 0 auto;background:#E8F1ED;">
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
                <span style="display:flex;align-items:center;gap:7px;min-width:0;font-size:15.5px;color:#1F2937;">
                  <span style="flex:0 0 auto;font-weight:600;">{{ r.author }}</span>
                  <sc-if value="{{ r.subject }}">
                    <span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
                    <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ r.subject }}</span>
                  </sc-if>
                </span>
                <span style="display:flex;align-items:center;gap:6px;font-size:13.5px;color:#5B6B66;">
                  <i class="hgi-bulk hgi-star" style="font-size:16px;flex:0 0 auto;color:#FBBF24;" aria-hidden="true"></i>
                  <span style="color:#1F2937;">{{ r.rating }}</span>
                  <span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
                  <span>{{ r.date }}</span>
                </span>
              </span>
              <button type="button" onClick="{{ r.onMore }}" aria-label="{{ r.moreAria }}" style="flex:0 0 auto;width:44px;height:44px;margin:-10px -10px 0 0;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1F2937;" style-hover="color:#066349;">
                <i class="hgi-twotone hgi-more-horizontal" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>
              </button>
            </div>
            <p style="margin:0;font-size:15px;line-height:1.55;color:#1F2937;text-wrap:pretty;">{{ r.text }}</p>
            <sc-if value="{{ r.hasPhotos }}">
              <div style="display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;margin-right:-24px;padding-right:24px;">
                <sc-for list="{{ r.photos }}" as="ph" hint-placeholder-count="1">
                  <button type="button" onClick="{{ ph.onOpen }}" aria-label="{{ ph.alt }}" style="flex:0 0 auto;width:150px;height:150px;padding:0;border:none;border-radius:12px;overflow:hidden;background:#E8F1ED;cursor:zoom-in;">
                    <img loading="lazy" src="{{ ph.img }}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
                  </button>
                </sc-for>
              </div>
            </sc-if>
            <div style="display:flex;align-items:center;gap:14px;margin:-6px 0 -12px;">
              <button type="button" onClick="{{ r.onLike }}" aria-pressed="{{ r.liked }}" aria-label="{{ r.likeAria }}" style="display:inline-flex;align-items:center;gap:7px;height:44px;padding:0;border:none;background:transparent;color:{{ r.likeFg }};font-family:'Google Sans';font-size:14.5px;cursor:pointer;"><i class="{{ r.likeIcon }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ r.likeCount }}</button>
              <button type="button" onClick="{{ r.onComment }}" aria-label="{{ r.commentAria }}" style="display:inline-flex;align-items:center;gap:7px;height:44px;padding:0;border:none;background:transparent;color:#1F2937;font-family:'Google Sans';font-size:14.5px;cursor:pointer;" style-hover="color:#066349;"><i class="hgi-twotone hgi-bubble-chat" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ r.commentCount }}</button>
            </div>
          </div>
        </div>
      </sc-for>
    </sc-if>
    <sc-if value="{{ pn.noReviews }}">
      <p style="margin:8px 0 0;font-size:14.5px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">No reviews yet. If you have been, yours would be the first.</p>
    </sc-if>
  </div>
  <sc-if value="{{ pn.canLeave }}">
    <button type="button" onClick="{{ pn.onLeave }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:8px;height:44px;margin-top:-8px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:14.5px;font-weight:500;color:#E02D3C;cursor:pointer;" style-hover="background:#FEF3F2;"><i class="hgi-twotone hgi-logout-03" style="font-size:19px;flex:0 0 auto;" aria-hidden="true"></i>Leave community</button>
  </sc-if>
</sc-if>

<!-- Action bar, below the panel body -->
<sc-if value="{{ pn.hasHostBar }}">
  <div aria-disabled="{{ pn.wzLock }}" style="flex:0 0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:10px;min-height:88px;padding:18px 24px calc(18px + env(safe-area-inset-bottom));border-top:1px solid #EDF0EE;background:#FFFFFF;opacity:{{ pn.wzOp }};pointer-events:{{ pn.wzPe }};transition:opacity .2s ease;">
    <button type="button" onClick="{{ pn.hoA.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;transition:transform .18s ease, box-shadow .2s ease, filter .2s ease;" style-hover="filter:brightness(1.04);box-shadow:0 6px 16px rgba(1,51,52,.16);" style-active="transform:scale(0.97);"><i class="{{ pn.hoA.cls }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.hoA.label }}</button>
    <button type="button" onClick="{{ pn.hoB.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;transition:transform .18s ease, box-shadow .2s ease, background .2s ease;" style-hover="background:#A3D900;box-shadow:0 6px 16px rgba(176,232,0,.4);" style-active="transform:scale(0.97);"><i class="{{ pn.hoB.cls }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.hoB.label }}</button>
  </div>
</sc-if>
```

## Exact logic
Verbatim from `Tukai Web.dc.html`, with `// ...` where unrelated code was left out:
- `commsPageVals()` builds the page (`cp`). `commCardFactory()` builds each card, and `commVm()` adds membership and Join or Leave.
- The `comm` branch of `panelVals()` builds the drawer (`pn`). `hoA` and `hoB` are the action bar buttons.
- `jumpTo` and `spyPanel` run the section tabs. `open`, `push` and `panelBack` run the panel stack and reset the drawer state.
- `momentVm()` is in `design_handoff_moments`. `this.face()` and `this.img()` return sample photos, and `this.say()` shows the toast.

```js
  // Initial state
  state = {
    // ...
    comm: { c3: 'member', c4: 'member', k1: 'member', k10: 'member', k19: 'member', pc3: 'member' },
    commInv: { pc1: true, pc2: true }, commInvOpen: false,
    // ...
  };

  // componentDidMount(): the drawer’s section tabs follow the scroll
    this._pscroll = (e) => { const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-panel-body') || this._psRaf) return; this._psRaf = requestAnimationFrame(() => { this._psRaf = null; this.spyPanel(); }); };

  commVm(c) {
    const st = this.state.comm[c.id] || 'none';
    let label, kind;
    if (st === 'member') { label = 'Member'; kind = 'joined'; }
    else { label = 'Join community'; kind = 'primary'; }
    const n = parseInt(String(c.memberLine || '').replace(/[^0-9]/g, ''), 10) || 0;
    const faces = ['Amina', 'Kevo', 'Njeri', 'Otieno'];
    let hh = 0; String(c.id).split('').forEach(ch => { hh = (hh * 31 + ch.charCodeAt(0)) % 997; });
    const shown = n ? Math.min(3, n) : 3;
    const biz = this.bizPlaces(c.id);
    return Object.assign({}, c, this.btn(kind), {
      isBiz: biz.length > 0, notBiz: !biz.length, bizCount: biz.length === 1 ? '1 place' : biz.length + ' places',
      avatars: [0, 1, 2].slice(0, shown).map(k => { const name = faces[(hh + k) % faces.length]; return { name, img: this.face(name) }; }),
      extraMembers: n > shown ? '+' + (n - shown).toLocaleString('en-US') : null,
      statusChip: st === 'member' ? 'Member' : null,
      statusChipIcon: st === 'member' ? 'hgi-tick-02' : 'hgi-clock-01',
      btnLabel: label,
      policyLine: 'anyone can join',
      onOpen: () => this.open('comm', c.id),
      onJoin: () => {
        if (this.needAuth('join', () => this.commVm(c).onJoin())) return;
        const next = Object.assign({}, this.state.comm);
        const cur = next[c.id] || 'none';
        let msg;
        if (cur === 'member') { delete next[c.id]; msg = 'You left ' + c.name + '. Anything you booked stays on your profile.'; }
        else { next[c.id] = 'member'; msg = 'You joined ' + c.name + '. Membership does not book a seat.'; }
        this.setState({ comm: next });
        this.say(msg);
      }
    });
  }

  // Community card for the Communities page and the Discover and Experiences rails.
  commCardFactory() {
    const S = this.state, fx = this.fx();
    const CAT = {}; (fx.pcDefs || []).forEach(d => { CAT[d[0]] = { label: d[1], icon: d[2], plural: d[4] }; });
    const BASE = { c1: ['shop', 'parks'], c2: ['rest', 'parks'], c3: ['walk', 'parks'], c4: ['hike', 'camp', 'pack'] };
    const catsOf = (c) => ((c.cats && c.cats.length) ? c.cats : (BASE[c.id] || [])).filter(k => CAT[k]);
    const num = (c) => parseInt(String(c.memberLine || '').replace(/[^0-9]/g, ''), 10) || 0;
    const seenE = {}, nExp = {};
    fx.experiences.concat(fx.catExps || [], S.published || []).forEach(e => { if (!e || seenE[e.id]) return; seenE[e.id] = true; if (!(e.dayOff < 0) && e.commId) nExp[e.commId] = (nExp[e.commId] || 0) + 1; });
    return (c, who) => {
      const v = this.commVm(c), cats = catsOf(c).slice(0, 4), n = nExp[c.id] || 0, isPriv = c.type === 'private', m = num(c);
      const avatars = who ? who.map(name => ({ name, img: this.face(name, 64) })) : v.avatars;
      const extra = who ? (m > who.length ? '+' + (m - who.length).toLocaleString('en-US') : null) : v.extraMembers;
      const bits = [c.name + '.'];
      if (isPriv) bits.push('Private community.');
      if (v.isBiz) bits.push('Verified business.');
      if (who) bits.push(who.join(', ') + ' joined.');
      if (m) bits.push(m.toLocaleString('en-US') + ' members.');
      if (cats.length) bits.push(cats.map(k => CAT[k].label).join(', ') + '.');
      if (n) bits.push(n + (n === 1 ? ' upcoming experience.' : ' upcoming experiences.'));
      return { name: c.name, purpose: c.purpose, img: c.img, priv: isPriv, isBiz: v.isBiz, avatars, extra, hasExtra: !!extra, cats: cats.map(k => ({ icon: 'hgi-twotone hgi-' + CAT[k].icon })), hasCats: cats.length > 0, n: String(n), hasN: n > 0, nDot: cats.length > 0 && n > 0, hasMeta2: cats.length > 0 || n > 0, aria: bits.join(' '), onOpen: () => this.open('comm', c.id) };
    };
  }

  // Communities page: Discover, Following and My communities tabs.
  commsPageVals() {
    const S = this.state, fx = this.fx(), more = S.commMore || {}, tab = S.commTab || 'discover';
    const lime = this.props.tabStyle === 'Lime', onBg = lime ? '#B0E800' : '#DCEAE3';
    const pill = (on, icon) => ({ bg: on ? onBg : '#F3F4F2', fg: on && !lime ? '#066349' : '#1F2937', ic: on && !lime ? '#066349' : '#1F2937', fw: on || lime ? '600' : '500', sel: on ? 'true' : 'false', iconCls: (on ? 'hgi-bulk hgi-' : 'hgi-twotone hgi-') + icon });
    const CAT = {}; (fx.pcDefs || []).forEach(d => { CAT[d[0]] = { label: d[1], icon: d[2], plural: d[4] }; });
    const BASE = { c1: ['shop', 'parks'], c2: ['rest', 'parks'], c3: ['walk', 'parks'], c4: ['hike', 'camp', 'pack'] };
    const catsOf = (c) => ((c.cats && c.cats.length) ? c.cats : (BASE[c.id] || [])).filter(k => CAT[k]);
    const num = (c) => parseInt(String(c.memberLine || '').replace(/[^0-9]/g, ''), 10) || 0;
    const byMembers = (a, b) => num(b) - num(a);
    const hsh = (t) => { let h = 0; String(t).split('').forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) % 997; }); return h; };
    const own = this.ownedComms(), ownIds = {}; own.forEach(c => { ownIds[c.id] = true; });
    const isMember = (id) => (S.comm || {})[id] === 'member';
    const pub = fx.communities.concat(fx.catComms || []), priv = fx.privComms || [];
    const allE = fx.experiences.concat(fx.catExps || [], S.published || []);
    const seenE = {}, exps = allE.filter(e => { if (!e || seenE[e.id]) return false; seenE[e.id] = true; return !(e.dayOff < 0); });
    const nExp = {}; exps.forEach(e => { if (e.commId) nExp[e.commId] = (nExp[e.commId] || 0) + 1; });
    const FR = ['Amina', 'Kevo', 'Njeri', 'Otieno', 'Achieng', 'Zawadi'];
    const friendsOf = (c) => { const h = hsh(c.id + ':f'), k = h % 4; return k < 2 ? [] : [0, 1, 2].slice(0, k).map(j => FR[(h + j * 2) % FR.length]); };
    const row = this.commCardFactory();
    const cut = (key, list, n, label) => {
      const all = !!more[key];
      return { items: all ? list : list.slice(0, n), hasMore: list.length > n, moreLabel: all ? 'Show less' : (label || 'Show more'), moreIcon: all ? 'hgi-arrow-up-01' : 'hgi-arrow-down-01', moreA: all ? 'true' : 'false',
        onMore: () => this.setState(st => ({ commMore: Object.assign({}, st.commMore, { [key]: !(st.commMore || {})[key] }) })) };
    };
    const soonOf = (ids) => exps.filter(e => ids[e.commId]).sort((a, b) => (a.dayOff || 0) - (b.dayOff || 0)).slice(0, 7).map(e => this.expVm(e));
    const expC = {}; allE.forEach(e => { if (e) expC[e.id] = e.commId; });
    const plC = {}; fx.places.concat(fx.extraPlaces || []).forEach(p => { if (p.claimedBy) plC[p.id] = p.claimedBy; });
    const SPAN = [[1, 1], [2, 1], [1, 2], [2, 2], [1, 1], [1, 1], [1, 1], [2, 1], [1, 1], [1, 1]];
    const momentsOf = (ids) => { const seen = {}; return this.allMoments().concat(fx.visitorMoments || []).filter(m => { if (seen[m.id]) return false; seen[m.id] = true; const cid = m.kind === 'comm' ? m.parentId : m.kind === 'exp' ? expC[m.parentId] : plC[m.parentId]; return !!ids[cid]; }).slice(0, 10).map((m, i) => { const v = this.momentVm(m), sp = SPAN[i % SPAN.length]; return { img: m.img, alt: m.alt || '', cs: String(sp[0]), rs: String(sp[1]), isAlbum: v.isAlbum, albumCount: v.albumCount, aria: (v.isAlbum ? v.photoCount + ' photos by ' : 'Moment by ') + m.author + ', ' + v.parentLabel + '. ' + m.caption, onOpen: v.onOpen }; }); };
    const city = S.city || 'Nairobi';
    const fresh = pub.filter(c => !ownIds[c.id] && !isMember(c.id));
    const near = fresh.filter(c => String(c.locality || '').indexOf(city) >= 0).sort(byMembers);
    const ORDER = ['run', 'camp', 'cycle', 'pack', 'hike', 'walk', 'bird', 'water', 'climb', 'rest', 'kids', 'sport', 'gym', 'drive', 'night', 'movie', 'fish', 'horse', 'shop', 'spa', 'parks', 'safari', 'choma', 'date', 'sunset', 'land', 'over', 'worship'];
    const browse = pub.filter(c => !ownIds[c.id]);
    const types = ORDER.filter(k => CAT[k] && browse.some(c => catsOf(c).indexOf(k) >= 0));
    const type = types.indexOf(S.commType) >= 0 ? S.commType : types[0];
    const byType = type ? browse.filter(c => catsOf(c).indexOf(type) >= 0).sort(byMembers) : [];
    const friends = fresh.map(c => ({ c, who: friendsOf(c) })).filter(x => x.who.length >= 2).sort((a, b) => b.who.length - a.who.length || byMembers(a.c, b.c));
    const following = pub.concat(priv).filter(c => isMember(c.id) && !ownIds[c.id]).sort(byMembers);
    const folIds = {}; following.forEach(c => { folIds[c.id] = true; });
    const inv = priv.filter(c => (S.commInv || {})[c.id] && !isMember(c.id)), invOpen = !!S.commInvOpen && inv.length > 0;
    const folSoon = soonOf(folIds), folMoments = momentsOf(folIds), mineSoon = soonOf(ownIds), mineMoments = momentsOf(ownIds);
    const TABS = [['discover', 'Discover', 'compass'], ['following', 'Following', 'user-02'], ['mine', 'My communities', 'user-group']];
    return {
      tabs: TABS.map(([id, label, icon]) => Object.assign(pill(tab === id, icon), { label, onClick: () => this.setState({ commTab: id }) })),
      isDiscover: tab === 'discover', isFollowing: tab === 'following', isMine: tab === 'mine',
      nearSub: 'In ' + city, near: cut('near', near.map(c => row(c)), 12), noNear: !near.length, nearEmpty: 'No communities in ' + city + ' yet. Pick another city below.',
      hasTypes: types.length > 0,
      typeChips: types.map(k => Object.assign(pill(k === type, CAT[k].icon), { label: CAT[k].label, onClick: () => this.setState(st => ({ commType: k, commMore: Object.assign({}, st.commMore, { type: false }) })) })),
      byType: cut('type', byType.map(c => row(c)), 6, type ? 'Show more ' + CAT[type].plural.toLowerCase() : 'Show more'),
      hasFriends: friends.length > 0, friends: cut('friends', friends.map(x => row(x.c, x.who)), 4),
      hasInv: inv.length > 0, invTitle: 'Community invites (' + inv.length + ')',
      invLine: inv.length === 1 ? inv[0].invitedBy + ' invited you to join ' + inv[0].name + '.' : 'You have been invited to join ' + inv.length + ' private communities.',
      invThumbs: inv.slice(0, 2).map((c, i) => ({ img: c.img, left: i ? '22px' : '0px', top: i ? '0px' : '10px', rot: i ? '7deg' : '-8deg' })),
      invOpen, invOpenA: invOpen ? 'true' : 'false', invRot: invOpen ? '180deg' : '0deg',
      onInvToggle: () => this.setState(st => ({ commInvOpen: !st.commInvOpen })),
      invites: inv.map(c => ({
        name: c.name, img: c.img, line: 'Invited by ' + c.invitedBy + ', ' + c.memberLine, joinAria: 'Join ' + c.name, declineAria: 'Decline the invite to ' + c.name,
        onOpen: () => this.open('comm', c.id),
        onJoin: () => { this.setState(st => ({ comm: Object.assign({}, st.comm, { [c.id]: 'member' }), commInv: Object.assign({}, st.commInv, { [c.id]: false }) })); this.say('You joined ' + c.name + '. Joining does not book or pay for anything.'); },
        onDecline: () => { this.setState(st => ({ commInv: Object.assign({}, st.commInv, { [c.id]: false }) })); this.say('Invite to ' + c.name + ' declined.'); }
      })),
      folEmpty: following.length === 0, onDiscover: () => this.setState({ commTab: 'discover' }),
      hasFollowing: following.length > 0, following: cut('following', following.map(c => row(c)), 8),
      hasFolSoon: folSoon.length > 0, folSoon, hasFolMoments: folMoments.length > 0, folMoments,
      hasOwn: own.length > 0, noOwn: own.length === 0, ownRows: own.map(c => row(c)),
      hasMineSoon: mineSoon.length > 0, mineSoon, hasMineMoments: mineMoments.length > 0, mineMoments,
      ownMt: mineSoon.length ? '32px' : '28px', ownPad: '0px', ownBorder: 'none',
      onCreate: () => this.startCommunity(false),
      emptyA: this.img('1511632765486-a01980e01a18', 300), emptyB: this.img('1529156069898-49953e39b3ac', 360), emptyC: this.img('1552674605-db6ffd4facb5', 300),
      onTerms: () => this.say('Opens the Tukai terms of use.'), onPrivacy: () => this.say('Opens the Tukai privacy policy.')
    };
  }

  // Root values
      showCommunities: S.route === 'communities' && !detail,
      // ...
      arrows: (() => {
        const arw = (st, en) => ({ backOff: !!st, nextOff: !!en, backBg: st ? '#FFFFFF' : '#E8F1ED', nextBg: en ? '#FFFFFF' : '#E8F1ED', backBc: st ? '#DDE3DF' : '#E8F1ED', nextBc: en ? '#DDE3DF' : '#E8F1ED', backFg: st ? '#013334' : '#066349', nextFg: en ? '#013334' : '#066349', backPe: st ? 'none' : 'auto', nextPe: en ? 'none' : 'auto', backOp: st ? '.35' : '1', nextOp: en ? '.35' : '1', backCur: st ? 'default' : 'pointer', nextCur: en ? 'default' : 'pointer' });
        const ed = (n) => (S.edge || {})[n] || [true, false];
        return { promo: arw(...ed('promo')), exp: arw(...ed('exp')), itin: arw(...ed('itin')), city: arw(...ed('city')), moments: arw(...ed('moments')), places: tabPlaces ? arw(pwePage.atStart, pwePage.atEnd) : arw(placesPage.atStart, placesPage.atEnd) };
      })(),
      citiesBack: () => this.scrollRail('city', -1),
      citiesNext: () => this.scrollRail('city', 1),
      cityCardW: S.cityCardW || '184px',
      momentsBack: () => this.scrollRail('moments', -1),
      momentsNext: () => this.scrollRail('moments', 1),
      cities: fx.cities.map(c => ({
        name: c.name, img: c.img, live: c.live, soon: !c.live,
        meta: fx.experiences.length + ' experiences, ' + fx.places.length + ' places',
        current: c.name === S.city,
        onClick: () => {
          if (!c.live) { this.say(c.name + ' is coming soon. Nairobi is the only city with activity so far.'); return; }
          if (this._locT) clearTimeout(this._locT);
          this.setState(st => ({ city: c.name, loc: 'off', nearAll: false, itAll: false, pg: Object.assign({}, st.pg, { pwe: 0, pexp: 0, ppop: 0, pcity0: 0, pcity1: 0, pcity2: 0, xfeat: 0, xtoday: 0, xtmrw: 0 }) }));
          this.say('Showing ' + c.name + '.');
        }
      })),
      // ...
    if (out.showCommunities) out.cp = this.commsPageVals();

  // panelVals(): the community drawer
  panelVals() {
    const S = this.state, fx = this.fx();
    const stack = S.pstack || [];
    // ...
      canBack: stack.length > 1, onBack: this.panelBack, onClose: () => { if (!this.cxGuard()) this.panelClose(); }, onShare: () => this.say('Link copied.'),
    // ...
    const allComms = fx.communities.concat(fx.privComms || [], fx.catComms, S.ownComms || []);
    const commById = (id) => allComms.find(c => c.id === id);
    const allExps = fx.experiences.concat(fx.catExps, S.published || []);
    const soon = (arr) => arr.filter(e => e.dayOff == null || e.dayOff >= 0).sort((a, b) => (a.date || 0) - (b.date || 0));
    const pExp = (e) => Object.assign(this.expVm(e), { onOpen: () => this.push('exp', e.id) });
    const pComm = (c) => Object.assign(this.commVm(c), { onOpen: () => this.push('comm', c.id) });
    const pPlace = (p) => Object.assign(this.placeVm(p), { onOpen: () => this.push('place', p.id) });
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hsh = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; };
    // ...
    } else if (cur.kind === 'comm') {
      const c = commById(cur.id) || fx.communities[0];
      const vm = this.commVm(c), member = (S.comm[c.id] || 'none') === 'member', h = hsh(c.id), isMine = this.ownedComms().some(x => x.id === c.id);
      const nowD = new Date(), nowM = nowD.getHours() * 60 + nowD.getMinutes(), T0 = new Date(nowD); T0.setHours(0, 0, 0, 0);
      const dateAt = (o) => { const d = new Date(T0); d.setDate(d.getDate() + o); return d; };
      const MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const span = (e) => { const m = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/.exec(e.when || ''); if (!m) return null; const a = +m[1] * 60 + +m[2]; let b = +m[3] * 60 + +m[4]; if (b <= a) b += 1440; return [a, b]; };
      const exps = soon(allExps.filter(e => e.commId === c.id));
      const itins = fx.itineraries.filter(i => i.dayOff >= 0 && i.commId === c.id);
      const ended = (e) => { if (e.dayOff !== 0) return false; const t = span(e); return !!t && t[1] <= nowM; };
      const startM = (e) => (span(e) || [0])[0];
      const cal = exps.concat(itins).filter(e => e.dayOff != null && e.dayOff >= 0 && !ended(e)).sort((a, b) => a.dayOff - b.dayOff || startM(a) - startM(b));
      // A business lists exactly the places it owns, so the count on its chip matches. Others list where they meet.
      const ownedP = this.bizPlaces(c.id), ownsP = ownedP.length > 0, pids = ownedP.map(p => p.id);
      if (!ownsP) exps.concat(itins).forEach(e => { if (e.placeId && pids.indexOf(e.placeId) < 0) pids.push(e.placeId); });
      const plist = ownsP ? ownedP.map(p => placeById(p.id) || p) : pids.map(placeById).filter(Boolean).slice(0, 6);
      const expIds = exps.map(e => e.id);
      const moms = this.allMoments().filter(m => (this.momentOn(m, 'comm', c.id)) || (m.kind === 'exp' && expIds.indexOf(m.parentId) >= 0)).map(m => this.momentVm(m));
      const POOL = ['1529156069898-49953e39b3ac', '1460661419201-fd4cecdf8a8b', '1528605248644-14dd04022da1', '1507842217343-583bb7270b66', '1513475382585-d06e58bcb0e0', '1467269204594-9661b134dd2b', '1470229722913-7c0e2dbbafd3', '1415201364774-f6f0bb35f28f'];
      const big = (u) => String(u || '').replace(/([?&])w=\d+/, '$1w=1600');
      const openGal = (list, i, label) => this.setState({ gal: { list, i, label } });
      const galSrc = [c.cover || c.img].concat(moms.map(m => m.img), exps.map(e => e.img), POOL.map(id => this.img(id, 800))).filter((u, i, a) => !!u && a.indexOf(u) === i).slice(0, 8);
      const RAT = [0.66, 1, 1.7, 1, 1, 0.75, 1.45, 1];
      const gallery = galSrc.map((u, i) => ({ img: u, w: Math.round(240 * RAT[i % RAT.length]) + 'px', aria: 'Open photo ' + (i + 1) + ' of ' + galSrc.length + ' of ' + c.name, onOpen: () => openGal(galSrc.map(big), i, c.name) }));
      const city = (String(c.locality || 'Nairobi').split(',').pop() || 'Nairobi').trim() + ', Kenya';
      const tel = '+254 7' + (10 + h % 89) + ' ' + (100 + (h * 7) % 900) + ' ' + (100 + (h * 13) % 900), email = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '@gmail.com', copied = S.telCopied === c.id;
      const details = [
        { k: 'Phone number', v: tel, icon: 'hgi-call-02', href: 'tel:' + tel.replace(/\s/g, ''), plain: false, copyIcon: copied ? 'hgi-tick-02' : 'hgi-copy-01', copyAria: copied ? 'Phone number copied' : 'Copy phone number',
          onCopy: () => { try { if (navigator.clipboard) navigator.clipboard.writeText(tel.replace(/\s/g, '')); } catch (err) {} this.setState({ telCopied: c.id }); this.say('Phone number copied.'); clearTimeout(this._telT); this._telT = setTimeout(() => this.setState({ telCopied: null }), 2000); } },
        { k: 'Email', v: email, icon: 'hgi-at', href: 'mailto:' + email, plain: false, onCopy: null }
      ];
      const SOC = [['WhatsApp', 'hgi-whatsapp', '#DCFCE7', '#15803D'], ['Website', 'hgi-globe-02', '#DBEAFE', '#1D4ED8'], ['Instagram', 'hgi-instagram', '#F1E4F4', '#86399E'], ['Facebook', 'hgi-facebook-01', '#DCEBFE', '#1259C3'], ['TikTok', 'hgi-tiktok', '#FFDCE7', '#B80F45'], ['YouTube', 'hgi-youtube', '#FFE1E1', '#B91C1C'], ['X', 'hgi-new-twitter', '#E0F2FE', '#0369A1']];
      const socials = SOC.filter((x, i) => i < 4 || ((h >> i) & 1) === 1).map(([label, icon, bg, fg]) => ({ label, icon, bg, fg, onClick: () => this.say(label === 'WhatsApp' ? 'Opens a WhatsApp chat with ' + c.name + '.' : label === 'Website' ? 'Opens the ' + c.name + ' website in a new tab.' : 'Opens ' + c.name + ' on ' + label + ' in a new tab.') }));
      const firstOff = cal.length ? cal[0].dayOff : 0;
      const upWeek = S.upWeek != null ? Math.max(0, Math.min(12, S.upWeek)) : Math.min(12, Math.floor((firstOff + T0.getDay()) / 7));
      const wStart = -T0.getDay() + upWeek * 7, offs = [0, 1, 2, 3, 4, 5, 6].map(i => wStart + i);
      const byOff = (o) => cal.filter(e => e.dayOff === o);
      const firstWith = offs.find(o => o >= 0 && byOff(o).length > 0);
      const selOff = S.upDay != null && S.upDay >= 0 && offs.indexOf(S.upDay) >= 0 ? S.upDay : firstWith != null ? firstWith : Math.max(0, wStart);
      const d0 = dateAt(offs[0]), d6 = dateAt(offs[6]), sd = dateAt(selOff);
      const upDays = offs.map(o => {
        const d = dateAt(o), past = o < 0, on = o === selOff, n = past ? 0 : byOff(o).length;
        return { wd: DOW[d.getDay()], d: String(d.getDate()), on, past, cur: past ? 'default' : 'pointer',
          aria: DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + (past ? ', past' : n ? ', ' + n + (n === 1 ? ' experience' : ' experiences') : ', nothing on'),
          bg: on ? '#A7F3D0' : past ? '#F3F4F2' : '#FFFFFF', bc: on ? '#A7F3D0' : past ? '#F3F4F2' : '#E5E7EB', fg: on ? '#066349' : past ? '#8A9692' : '#1F2937',
          hasDots: n > 0, dots: (n > 1 ? [0, 1] : [0]).map(() => ({ c: '#066349' })), onClick: () => { if (!past) this.setState({ upDay: o, upWeek }); } };
      });
      const upList = byOff(selOff).map(pExp);
      const SPANS = { 1: [[1, 1]], 2: [[1, 1], [2, 1]], 3: [[1, 1], [1, 1], [1, 1]], 4: [[1, 1], [2, 1], [2, 1], [1, 1]], 5: [[1, 1], [2, 1], [1, 1], [1, 1], [1, 1]], 6: [[1, 1], [2, 1], [2, 1], [1, 1], [1, 1], [2, 1]], 7: [[1, 1], [2, 1], [1, 2], [2, 2], [1, 1], [1, 1], [1, 1]] };
      const n7 = Math.min(7, moms.length);
      const moments = moms.slice(0, n7).map((m, i) => Object.assign({}, m, { gc: 'span ' + SPANS[n7][i][0], gr: 'span ' + SPANS[n7][i][1], aria: 'Open moment' + (m.isAlbum ? ', ' + m.photoCount + ' photos' : '') + (m.caption ? ': ' + m.caption : '') }));
      const org = (c.organisers || []).find(o => /owner/i.test(o.role || '')) || (c.organisers || [])[0] || { name: 'Amina', role: 'Owner' };
      const orgName = isMine ? 'You' : this.fullName(org.name);
      const places = plist.map(pPlace);
      const RVC = ['Savour an unforgettable outing. Everything was planned with care and the group made it easy to join in.', 'A delight from start to finish. Friendly hosts, a relaxed pace and great value for the price.', 'Well organised and easy to follow. I came on my own and left with new friends.', 'The best way to see the city with people who love it. Spots go fast, so book early.'];
      const WHO = [['Amina Hassan', 'Amina'], ['Kevin Mwangi', 'Kevo'], ['Njeri Wambui', 'Njeri'], ['Otieno Ouma', 'Otieno']], PH = [1, 3, 2, 0];
      const subj = exps.map(e => e.title).concat(plist.map(p => p.name));
      const nRv = 12 + h % 60, avgR = 4.3 + (h % 7) / 10;
      const mAgo = (n) => { const d = new Date(nowD.getFullYear(), nowD.getMonth() - n, 1); return MONL[d.getMonth()] + ' ' + d.getFullYear(); };
      const reviews = [0, 1, 2, 3].map(k => {
        const who = WHO[(h + k) % WHO.length], author = who[0], id = 'rv' + c.id + k, liked = !!(S.rvLikes || {})[id], cnt = 3 + (h * (k + 3)) % 60 + (liked ? 1 : 0);
        const urls = galSrc.slice(1).filter((u, j) => (j + k) % 3 === 0).slice(0, PH[(h + k) % 4]).map(u => u.replace(/([?&])w=\d+/, '$1w=400'));
        return { author, subject: subj.length ? subj[(h + k) % subj.length] : '', img: this.face(who[1]), date: mAgo(1 + k * 2 + (h % 2)), text: RVC[(h + k) % RVC.length], rating: Math.max(3.5, Math.min(5, avgR + [0.2, -0.3, 0.4, 0][k])).toFixed(1),
          hasPhotos: urls.length > 0, photos: urls.map((u, j) => ({ img: u, alt: 'Open photo ' + (j + 1) + ' from ' + author, onOpen: () => openGal(urls.map(big), j, author) })),
          commentCount: String((h * (k + 5)) % 12), commentAria: 'Open the replies to ' + author + "'s review", onComment: () => this.say('Opens the replies to ' + author + "'s review."),
          moreAria: 'More options for ' + author + "'s review", onMore: () => this.say('Share or report ' + author + "'s review."),
          liked, likeCount: String(cnt), likeIcon: liked ? 'hgi-bulk hgi-favourite' : 'hgi-twotone hgi-favourite', likeFg: liked ? '#E02D3C' : '#1F2937',
          likeAria: (liked ? 'Unlike this review, ' : 'Like this review, ') + cnt + (cnt === 1 ? ' like' : ' likes'),
          onLike: () => this.setState(st => { const n = Object.assign({}, st.rvLikes); if (n[id]) delete n[id]; else n[id] = true; return { rvLikes: n }; }), bt: k === 0 ? 'transparent' : '#E5E7EB' };
      });
      const secDefs = [['about', 'About', 'hgi-information-circle'], ['members', 'Members', 'hgi-user-multiple'], cal.length ? ['exps', 'Experiences', 'hgi-calendar-03'] : null, places.length ? ['places', 'Places', 'hgi-location-01'] : null, ['moments', 'Moments', 'hgi-dashboard-circle'], ['reviews', 'Reviews (' + nRv + ')', 'hgi-star']].filter(Boolean);
      const psec = secDefs.some(d => d[0] === S.psec) ? S.psec : 'about';
      const secs = secDefs.map(([key, label, icon]) => { const on = key === psec; return { key, label, cur: on ? 'true' : 'false', icon: (on ? 'hgi-bulk ' : 'hgi-twotone ') + icon, ic: on ? '#066349' : '#1F2937', bg: on ? '#A7F3D0' : '#F3F4F2', fg: on ? '#066349' : '#1F2937', onClick: () => this.jumpTo(key) }; });
      const aboutTxt = c.about || c.purpose || '';
      // Moments go to communities you joined or run, the same rule the composer's picker follows.
      const compose = () => (member || isMine ? this.startMoment({ kind: 'comm', id: c.id }) : this.say('Join ' + c.name + ' to share moments here. Joining is instant.'));
      const msgHost = () => this.say(isMine ? 'Write one message to everyone in ' + c.name + '. It arrives in their Tukai inbox.' : 'Write to ' + orgName + ', who runs ' + c.name + '. It arrives in their Tukai inbox.');
      Object.assign(pn, {
        has: true, isComm: true, kindLabel: 'Community', title: c.name, headPriv: c.type === 'private', headBiz: vm.isBiz, bizTip: !!S.bizTip, onBizTip: () => { if (!this.state.bizTip) this.setState({ bizTip: true }); }, offBizTip: () => { if (this.state.bizTip) this.setState({ bizTip: false }); }, hasBizChip: vm.isBiz, bizCount: vm.bizCount, bizChipAria: 'Verified business, owns ' + vm.bizCount + '. Show places', onBizChip: () => this.jumpTo('places'), privTip: !!S.privTip, onPrivTip: () => { if (!this.state.privTip) this.setState({ privTip: true }); }, offPrivTip: () => { if (this.state.privTip) this.setState({ privTip: false }); }, img: c.cover || c.img, locality: c.locality, city,
        secs, gallery, galCanPrev: !!S.galLeft, galCanNext: S.galRight !== false && gallery.length > 1,
        onGalScroll: (ev) => { const r0 = ev.currentTarget, left = r0.scrollLeft > 8, right = r0.scrollLeft + r0.clientWidth < r0.scrollWidth - 8; if (left !== !!this.state.galLeft || right !== (this.state.galRight !== false)) this.setState({ galLeft: left, galRight: right }); },
        onGalRowPrev: () => { const r0 = document.querySelector('[data-gal-row]'); if (r0) r0.scrollBy({ left: -Math.round(r0.clientWidth * 0.7), behavior: 'smooth' }); },
        onGalRowNext: () => { const r0 = document.querySelector('[data-gal-row]'); if (r0) r0.scrollBy({ left: Math.round(r0.clientWidth * 0.7), behavior: 'smooth' }); },
        memberLine: c.memberLine, ...(() => {
          const total = parseInt(String(c.memberLine || '').replace(/[^0-9]/g, ''), 10) || 1;
          const FACE = { 'Amina Hassan': 'Amina', 'Kevin Mwangi': 'Kevo', 'Njeri Wambui': 'Njeri', 'Otieno Ouma': 'Otieno', 'Zawadi Imani': 'Zawadi', 'Achieng Adisa': 'Achieng' };
          const NAMES = ['Amina Hassan', 'Kevin Mwangi', 'Jabari Otieno', 'Njeri Wambui', 'Bahati Wanjiru', 'Otieno Ouma', 'Baraka Amani', 'Zawadi Imani', 'Jelani Kamau', 'Achieng Adisa', 'Chebet Moraa', 'Kiprono Juma'];
          const mk = (name, role, face) => { const im = face ? this.face(face) : null; return { name, role: role || '', img: im || '', hasImg: !!im, noImg: !im, initial: name.charAt(0) }; };
          const lead = isMine ? mk('You', 'Admin', 'Wanjiku') : mk(orgName, 'Admin', org.name);
          const rest = NAMES.slice(h % 4).concat(NAMES.slice(0, h % 4)).filter(n => n.split(' ')[0] !== org.name).map(n => mk(n, '', FACE[n]));
          const list = [lead].concat(member && !isMine ? [mk('You', '', 'Wanjiku')] : [], rest).slice(0, Math.min(total, 9));
          const more = total - list.length;
          return { members: list, membersMore: more > 0 ? '+' + more : '', membersAllAria: 'See all ' + total + ' members', onMembersAll: () => this.say('Opens all ' + total + ' members of ' + c.name + '.') };
        })(),
        hasRating: true, ratingNum: avgR.toFixed(1), reviewsLine: nRv + ' reviews', onRating: () => this.jumpTo('reviews'),
        about: aboutTxt, aboutBlocks: [], aboutOpen: !!S.aboutMore, aboutClamp: S.aboutMore ? 'unset' : '3', aboutToggle: aboutTxt.length > 180,
        aboutLabel: S.aboutMore ? 'Show less' : 'Show more', aboutIcon: S.aboutMore ? 'hgi-arrow-up-01' : 'hgi-arrow-down-01', onAboutMore: () => this.setState(st => ({ aboutMore: !st.aboutMore })),
        details, hasSocials: socials.length > 0, socials,
        hasUp: cal.length > 0, upDays, upList, hasUpList: upList.length > 0, noUpList: upList.length === 0,
        upWeekLabel: d0.getMonth() === d6.getMonth() ? MONL[d0.getMonth()] + ' ' + d0.getFullYear() : MON[d0.getMonth()] + ' - ' + MON[d6.getMonth()] + ' ' + d6.getFullYear(),
        upPrevOff: upWeek === 0, upPrevOp: upWeek === 0 ? '.35' : '1', upNextOff: upWeek >= 12, upNextOp: upWeek >= 12 ? '.35' : '1',
        onUpPrev: () => this.setState({ upWeek: Math.max(0, upWeek - 1), upDay: null }), onUpNext: () => this.setState({ upWeek: Math.min(12, upWeek + 1), upDay: null }),
        noUpLine: 'Nothing from ' + c.name + ' on ' + DOW[sd.getDay()] + ' ' + sd.getDate() + ' ' + MON[sd.getMonth()] + '. Try another day.',
        meImg: this.face('Wanjiku'), meName: 'Wanjiku Maina', onCompose: compose,
        hasMoments: moments.length > 0, noMoments: moments.length === 0, moments,
        hostRole: 'Admin', orgName, orgImg: this.face(isMine ? 'Wanjiku' : org.name) || this.face('Amina'), orgLine: (20 + h % 70) + ' past experiences organised',
        onOrg: () => this.say(isMine ? 'Opens your profile.' : 'Opens ' + orgName + "'s profile."), onMessage: msgHost, msgLabel: isMine ? 'Message members' : 'Message host',
        hasPlaces: places.length > 0, places, placesSub: ownsP ? (plist.length === 1 ? '1 place' : plist.length + ' places') + ' owned by ' + c.name : 'Places ' + c.name + ' meets at',
        onPlacesAll: () => this.say('Opens every place connected to ' + c.name + '.'),
        reviews, hasReviews: true, noReviews: false, onAllReviews: () => this.say('Opens all ' + nRv + ' reviews of experiences run by ' + c.name + '.'),
        canLeave: member && !isMine, onLeave: vm.onJoin,
        hasHostBar: true, hasFooter: false,
        hoA: member || isMine ? { label: isMine ? 'Message members' : 'Message host', icon: 'hgi-bubble-chat', onClick: msgHost } : { label: 'Join community', icon: 'hgi-user-add-02', onClick: vm.onJoin },
        hoB: { label: 'Share moment', icon: 'hgi-dashboard-circle-add', onClick: compose }
      });
    }
    // ...
    if (/^(place|exp|comm)$/.test(cur.kind)) pn.onShare = () => this.openShare(cur.kind, cur.id);
    // ...
  }

  jumpTo = (key) => {
    this._jumpT = Date.now();
    this.setState({ psec: key });
    const b = typeof document !== 'undefined' && document.querySelector('[data-panel-body]');
    if (!b) return;
    const t = key === 'about' ? null : b.querySelector('[data-psec="' + key + '"]');
    b.scrollTo({ top: t ? Math.max(0, t.offsetTop - 78) : 0, behavior: 'smooth' });
  };

  spyPanel = () => {
    if (this._jumpT && Date.now() - this._jumpT < 700) return;
    const b = document.querySelector('[data-panel-body]');
    const secs = b ? b.querySelectorAll('[data-psec]') : [];
    if (!secs.length) return;
    let cur = secs[0].getAttribute('data-psec');
    secs.forEach(x => { if (x.offsetTop - b.scrollTop <= 84) cur = x.getAttribute('data-psec'); });
    if (b.scrollTop > 0 && b.scrollHeight > b.clientHeight + 8 && b.scrollTop + b.clientHeight >= b.scrollHeight - 4) cur = secs[secs.length - 1].getAttribute('data-psec');
    if (cur !== (this.state.psec || 'about')) this.setState({ psec: cur });
  };

  scrollRail = (name, dir) => {
    const r = this._rails[name];
    if (!r || !r.el) return;
    if (r.chips) { r.el.scrollBy({ left: dir * Math.round(r.el.clientWidth * 0.6), behavior: 'smooth' }); return; }
    const card = (r.fixed || parseFloat(this.state[r.key] || '184')) + (r.gap || 16);
    const page = Math.max(card, Math.floor(r.el.clientWidth / card) * card);
    r.el.scrollBy({ left: dir * page, behavior: 'smooth' });
  };

  expVm(e) {
    const saved = this.isSaved('exp', e.id);
    const booked = this.state.auth === 'in' && (this.fx().plans || []).some(p => p.expId === e.id);
    const flagIcon = booked ? IC.ticket : e.flag === 'Free' ? IC.tag : (e.flag === 'Recurring' ? IC.repeat : IC.clock);
    return Object.assign({}, e, {
      flag: booked ? 'Booked' : e.flag, flagIcon, hostBiz: !e.guideId && this.isBiz(e.commId),
      priceLine: e.price === 'Free' ? 'Free' : e.price + e.priceBasis.split(',')[0].replace(/^per /, '/'),
      saveIcon: saved ? IC.basketDone : IC.basket,
      saveCls: saved ? 'hgi-bulk ' + IC.basketDone : 'hgi-twotone ' + IC.basket,
      saveTint: saved ? '#B0E800' : '#FFFFFF',
      saveColor: saved ? '#066349' : '#013334',
      saveLabel: saved ? 'Saved. Choose bucket lists for ' + e.title : 'Save ' + e.title + ' to a bucket list',
      onOpen: () => this.open('exp', e.id),
      onSave: (ev) => this.saveTo('exp', e.id, ev)
    });
  }

  placeStatus(hours) {
    const w = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/.exec(hours || '');
    if (!w) return { shut: false, soon: false, pill: '', next: '' };
    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date(), today = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    const closed = /closed\s+([a-z]+)/i.exec(hours), only = /([a-z]+)s only/i.exec(hours), late = /([a-z]+day) from (\d{1,2}):(\d{2})/i.exec(hours);
    const opensOn = (d) => !(closed && closed[1].toLowerCase() === DAYS[d]) && !(only && only[1].toLowerCase() !== DAYS[d]);
    const fromOn = (d) => late && late[1].toLowerCase() === DAYS[d] ? +late[2] * 60 + +late[3] : +w[1] * 60 + +w[2];
    const to = +w[3] * 60 + +w[4];
    const t = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h < 12 ? ' AM' : ' PM'); };
    if (this.openNow(hours)) {
      const from = fromOn(today), left = to > from || mins < to ? to - mins : to + 1440 - mins;
      return { shut: false, soon: left > 0 && left <= 60, pill: 'Closes soon', next: '' };
    }
    if (opensOn(today) && mins < fromOn(today)) return { shut: true, soon: false, pill: 'Closed \u00b7 Opens ' + t(fromOn(today)), next: 'Opens ' + t(fromOn(today)) };
    for (let d = 1; d <= 7; d++) {
      const k = (today + d) % 7;
      if (opensOn(k)) { const when = d === 1 ? 'tomorrow ' : DAYS[k].charAt(0).toUpperCase() + DAYS[k].slice(1, 3) + ' '; return { shut: true, soon: false, pill: 'Opens ' + when + t(fromOn(k)), next: 'Opens ' + when + t(fromOn(k)) }; }
    }
    return { shut: true, soon: false, pill: 'Closed', next: 'Closed' };
  }

  hoursLine(hours, open) {
    const w = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/.exec(hours || '');
    if (!w) return 'Open 24 hours';
    const t = (h, m) => ((+h % 12) || 12) + ':' + m + (+h % 24 < 12 ? ' AM' : ' PM');
    return open ? 'Closes ' + t(w[3], w[4]) : (this.placeStatus(hours).next || 'Opens ' + t(w[1], w[2]));
  }

  placeVm(p) {
    const fx = this.fx();
    const saved = this.isSaved('place', p.id);
    const upcoming = fx.experiences.filter(e => e.placeId === p.id && !e.recurring);
    const recurring = fx.experiences.filter(e => e.placeId === p.id && e.recurring);
    const open = this.openNow(p.hours), st = this.placeStatus(p.hours);
    let fact = this.hoursLine(p.hours, open), factIcon = IC.clock, factColor = '#5B6B66';
    if (p.exp) { fact = p.exp.title + ' · ' + p.exp.when; factIcon = IC.calendar; factColor = '#066349'; }
    else if (upcoming.length) { fact = upcoming[0].title + ' · ' + upcoming[0].when.split(',')[0]; factIcon = IC.calendar; factColor = '#066349'; }
    else if (recurring.length) { fact = recurring[0].title + ' · weekly'; factIcon = IC.repeat; factColor = '#066349'; }
    else if (p.offers.length) { fact = p.offers[0].title; factIcon = IC.tag; factColor = '#066349'; }
    return Object.assign({}, p, {
      fact, factIcon, factColor,
      isOpen: open, isShut: st.shut, isSoon: st.soon, pillText: st.pill, statusLabel: open ? 'Open now' : 'Closed', statusDot: open ? '#FFC93C' : '#C4CBC8', statusIcon: open ? 'hgi-sun-03' : 'hgi-moon-02', statusInk: open ? '#066349' : '#5B6B66', imgFilter: open ? 'none' : 'grayscale(1)',
      reviewLine: p.reviews ? p.rating + ' (' + p.reviews + ' reviews)' : 'No reviews yet',
      saveIcon: saved ? IC.basketDone : IC.basket,
      saveCls: saved ? 'hgi-bulk ' + IC.basketDone : 'hgi-twotone ' + IC.basket,
      saveTint: saved ? '#B0E800' : '#FFFFFF',
      saveColor: saved ? '#066349' : '#013334',
      saveLabel: saved ? 'Saved. Choose bucket lists for ' + p.name : 'Save ' + p.name + ' to a bucket list',
      onOpen: () => this.open('place', p.id),
      onSave: (ev) => this.saveTo('place', p.id, ev)
    });
  }

  bizPlaces(cid) { if (!cid) return []; const fx = this.fx(), seen = {}; return fx.places.concat(fx.extraPlaces || [], fx.catPlaces || []).filter(p => { if (!p || p.claimedBy !== cid || seen[p.id]) return false; seen[p.id] = true; return true; }); }
  ownedComms() { const fx = this.fx(); return (this.props.hostSetup === 'New host' ? [] : fx.communities).filter(c => (c.organisers || []).some(o => o.name === 'Wanjiku' && /owner/i.test(o.role || ''))).concat(this.state.ownComms || []); }

  startCommunity(fromCx) {
    this.setState(s => ({ createOpen: false, nc: s.nc || this.ncBlank(), ncFromCx: !!fromCx }));
    if (fromCx) this.push('nc'); else this.open('nc');
  }

  needAuth(why, then) {
    if (this.state.auth === 'in') return false;
    this._authThen = then || null;
    const W = { tukai: 'Chatting with TukAI needs an account, so your chats stay with you.', claim: 'Claiming a place needs an account.', reserve: 'Booking needs an account, so your bookings stay with you.', save: 'Saving needs an account, so your lists follow you.', join: 'Joining needs an account.', book: 'Booking needs an account, so your tickets stay with you.', plan: 'Planning needs an account.', host: 'Hosting needs an account.', moment: 'Sharing a moment needs an account.', lists: 'Your bucket lists live in your account.', plans: 'Your plans live in your account.', you: 'Your profile lives in your account.' };
    this.setState({ authView: 'register', authStep: null, authWhy: W[why] || '', authBusy: null, profileOpen: false, createOpen: false, blPop: null });
    return true;
  }

  openShare(kind, id) { this.setState({ share: { kind, id }, shareCopied: false }); }

  open(kind, id, force) {
    if (!force && kind !== 'cx' && this.cxGuard(() => this.open(kind, id, true))) return;
    if (this._pT) clearTimeout(this._pT);
    this.setState({ pstack: [{ kind, id }], pOpen: true, aiBrief: null, moment: null, createOpen: false, profileOpen: false, cityOpen: false, rsvDay: 0, rsvTime: null, rsvEdit: null, psec: null, hoTab: null, hoDlEdit: false, hoGs: false, hoGq: '', hoGv: 'guests', tixView: 'stack', tixSel: null, hoursOpen: false, expDay: 'all', aboutMore: false, aboutOver: false, mineIdx: 0, daysAll: false, gal: null, nowIdx: 0, upWeek: null, upDay: null, galLeft: false, galRight: true, tixIdx: 0 });
    this.panelTop();
  }

  push(kind, id) {
    this.setState(s => ({ pstack: (s.pstack || []).concat([{ kind, id }]), aiBrief: null, rsvDay: 0, rsvTime: null, rsvEdit: null, psec: null, hoTab: null, hoDlEdit: false, hoGs: false, hoGq: '', hoGv: 'guests', tixView: 'stack', tixSel: null, hoursOpen: false, expDay: 'all', aboutMore: false, aboutOver: false, mineIdx: 0, daysAll: false, gal: null, nowIdx: 0, upWeek: null, upDay: null, galLeft: false, galRight: true, tixIdx: 0 }));
    this.panelTop();
  }

  panelBack = () => { this.setState(s => ({ pstack: (s.pstack || []).slice(0, -1), aiBrief: null, rsvDay: 0, rsvTime: null, rsvEdit: null, psec: null, hoTab: null, hoDlEdit: false, hoGs: false, hoGq: '', hoGv: 'guests', tixView: 'stack', tixSel: null, hoursOpen: false, expDay: 'all', aboutMore: false, aboutOver: false, mineIdx: 0, daysAll: false, gal: null, nowIdx: 0, upWeek: null, upDay: null, galLeft: false, galRight: true, tixIdx: 0 })); this.panelTop(); };

  say(m) {
    if (this._t) clearTimeout(this._t);
    this.setState({ toast: m });
    this._t = setTimeout(() => this.setState({ toast: null }), 4200);
  }
```
