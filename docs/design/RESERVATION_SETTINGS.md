# Handoff: Reservation settings

## Overview
Reservation settings is where a place's manager decides how guests book it: free, with a deposit, or with entry fees by guest type, plus capacity, days, hours, response times and where payouts go. It opens in the side panel, on top of whatever opened it.

It has three states:
- **Edit, Reservation type:** how guests book, capacity, days, hours and timings. The first step.
- **Edit, Wallet details:** how the place gets paid. Only for a deposit or entry fees.
- **View:** a summary of the saved settings, with Edit settings.

Settings that have never been saved open in Edit on the first step. Saved settings open in View.

Covered here: the three states, their footers, validation, saving, and the entry points that open them.

Out of scope:
- The panel frame and header (`design_handoff_tickets_created`, Panel frame).
- The place page, the Reservations panel with its requests, Hold off reservations, and the claim flow. Only the buttons they use to open settings are described here.
- The guest booking flow that reads these settings.

## About the design
This is a **design reference** from the HTML prototype (`Tukai Web.dc.html`), not production code. Recreate it in Tukai's codebase with its existing framework, components and panel. The exact markup and logic are at the end of this file. The time and country pickers are separate components, and their source is in `components/`.

## Fidelity
**High fidelity.** Build it pixel-perfect. All values are CSS pixels at 1x, and every font is Google Sans. Icons are Hugeicons twotone. Every control is a native `<button>` or `<input>`, 44px or taller. Places, amounts and names are sample data.

## Panel and header
The shared panel, specified in `design_handoff_tickets_created` (Panel frame): a 640px drawer from the right, or a bottom sheet below 720px.
- **Title:** "Reservation settings"
- **Left of the title:** Back, whenever there's a panel under it. It always is, since every entry point stacks settings on top of something.
- **Right of the title:** Close only. No Share or Save.
- **Body:** the panel body wrapper (`padding: 20px 24px 36px`) holds one block, a column with `gap: 24px`.
- **Content width:** 592px at the default drawer width, 342px on a 390px sheet.

## Anatomy
1. **Place line:** which place these settings are for.
2. **Step tabs:** Reservation type and Wallet details. Edit only.
3. **Step content**, or the **View** summary.
4. **Footer:** Cancel, Save & exit and the primary button, depending on the state.

## 1. Place line
```css
display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #5B6B66;
/* icon */ hgi-twotone hgi-store-verified-01, 17px, #066349
```
"{place}, {area}", for example "Riverside Gardens, Westlands". The area is the place's locality up to the first comma.

## 2. Step tabs
```css
/* <div role="tablist" aria-label="Steps"> */ display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin-top: -8px;   /* 16px under the place line */
/* tab: <button role="tab" aria-selected aria-disabled> */
display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; height: 48px; padding: 0 20px 0 16px;
border: 0; border-radius: 999px; font-size: 14.5px; font-weight: 600; white-space: nowrap;
/* icon, before the label */ twotone, 19px
```
| Tab | Icon |
|---|---|
| Reservation type | `hgi-calendar-add-01` |
| Wallet details | `hgi-wallet-02` |

| State | Background | Text |
|---|---|---|
| Current | `#E8F1ED` | `#066349` |
| Other | `#F3F4F2` | `#1F2937` |
| Wallet details on a free reservation | `#F3F4F2` | `#8A9793`, `cursor: not-allowed`, `aria-disabled="true"` |

- **Reservation type** can always be picked.
- **Wallet details** checks the first step first. If anything is missing, the error box shows and the tab doesn't change.
- **Changing step** clears the error and scrolls the body to the top. Nothing is saved.

## 3. Shared parts
```css
/* Field block */ display: flex; flex-direction: column; gap: 10px;
/* field label */ font-size: 15px; font-weight: 600; line-height: 1.35; color: #1F2937;
/* hint, inside the label */ font-size: 13.5px; font-weight: 400; color: #5B6B66;

/* Section title */ margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.2px; color: #1F2937;
/* section intro */ margin: 6px 0 0; font-size: 14px; line-height: 1.5; color: #5B6B66; text-wrap: pretty;

/* Input */
width: 100%; height: 56px; padding: 0 52px 0 16px; border: 1px solid #DDE3DF; border-radius: 12px;
background: #FFFFFF; font-size: 15px; color: #1F2937; outline: none;
/* focus */ border-color: #066349; box-shadow: 0 0 0 3px #E8F1ED;
/* wrapper */ <label> with position: relative; display: block;
/* trailing icon */ position: absolute; right: 16px; top: 50%; transform: translateY(-50%); 20px; #5B6B66; pointer-events: none;
/* prefix ("KES", "+254") */ position: absolute; left: 16px; top: 50%; transform: translateY(-50%); padding-right: 10px;
                             border-right: 1px solid #DDE3DF; font-size: 15px; font-weight: 600; color: #1F2937; pointer-events: none;
/* input with "KES" */ padding-left: 72px;   /* with "+254" */ padding-left: 80px;
/* two inputs side by side */ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap: 12px;

/* Pill choice: <button role="radio" aria-checked> or <button aria-pressed> */
height: 48px; padding: 0 20px; border: 0; border-radius: 999px; font-size: 14.5px; font-weight: 600; white-space: nowrap;
/* selected */ background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF;
/* other */    background: #F3F4F2; color: #1F2937;
/* row */      display: flex; flex-wrap: wrap; gap: 8px;
/* small pill (timings) */ height: 44px; padding: 0 18px;

/* Note box */ margin: 0; padding: 12px 14px; border-radius: 12px; background: #F3F4F2; font-size: 13.5px; line-height: 1.45; color: #1F2937; text-wrap: pretty;
/* small note */ margin: 0; font-size: 13.5px; line-height: 1.45; color: #5B6B66; text-wrap: pretty;

/* Divider, full-bleed, aria-hidden */ height: 1px; margin: 0 -24px; background: #EDF0EE;

/* Error box: role="alert" */
display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; border-radius: 12px;
background: #FFF6E5; font-size: 13.5px; line-height: 1.45; color: #7A4A00;
/* icon */ hgi-twotone hgi-information-circle, 16px, line-height 19px
/* text */ flex: 1; min-width: 0; text-wrap: pretty;
```
The two-input grid puts the inputs side by side at the default width and stacks them on a 390px sheet.

## 4. Edit, Reservation type
A column with `gap: 24px`, in this order:

**Reservation type and fees** (`gap: 12px`)
- **Title:** "Reservation type and fees"
- **Intro:** "Choose how guests reserve this place, and whether they pay anything to book."
- **Pills:** a `radiogroup` labelled "Reservation type", with Free reservation, Deposit to confirm and Entry fees.
- **Note box:** what the picked type means:

| Type | Note |
|---|---|
| Free reservation | "Guests book for free. You accept each request, then admit guests when they arrive." |
| Deposit to confirm | "Guests pay a deposit per guest once you accept. It comes off their final bill and cuts no-shows." |
| Entry fees | "Guests pay per person by guest type, like adults, kids or residents, once you accept." |

**Deposit per guest** (Deposit to confirm only)
- **Label:** "Deposit per guest" with the hint "(paid once you accept, taken off the final bill)"
- **Input:** "KES" prefix, placeholder "Amount per guest", `hgi-wallet-02`. Digits only, up to 6.

**Guest categories and prices** (Entry fees only)
- **Label:** "Guest categories and prices"
- **Chips:** one per category added, in a wrapping row with `gap: 8px`.
- **Category input:** placeholder "Category, like Residents, Kids or Adults", `hgi-user-group`. Up to 30 characters.
- **Amount input:** "KES" prefix, placeholder "Amount per head", `hgi-wallet-02`. Digits only, up to 6.
- **Add category:** "Add another category" once there's one. Adds the category to the end and empties both inputs.

```css
/* Category chip */
display: inline-flex; align-items: center; gap: 4px; min-height: 52px; padding: 0 4px 0 16px;
border-radius: 12px; background: #F3F4F2; font-size: 14px; color: #1F2937;
/* text */ display: flex; flex-direction: column; gap: 1px;
/* name */ font-weight: 600;
/* price */ font-size: 12.5px; color: #5B6B66;   "KES 300 per head"
/* remove */ width: 44px; height: 44px; border: 0; border-radius: 999px; background: transparent; color: #5B6B66;
             hgi-twotone hgi-cancel-01 16px; hover color #E02D3C; aria-label "Remove {name}"

/* Add category */
align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px;
border: 0; border-radius: 999px; font-size: 14px; font-weight: 600;   icon hgi-twotone hgi-add-01 17px, before the label
/* ready */    background: #E8F1ED; color: #066349;
/* disabled */ background: #F3F4F2; color: #8A9793;   disabled until the category has a name and the amount is above 0
```

**Divider**

**Total seating capacity**
- **Label:** "Total seating capacity" with the hint "(most guests you can host at once)"
- **Input:** placeholder "Enter seating capacity", `hgi-user-multiple`. Digits only, up to 4.

**Max party size per booking**
- **Label:** "Max party size per booking" with the hint "(largest group on one booking or table)"
- **Input:** placeholder "Enter max party size", `hgi-user-multiple`. Digits only, up to 4.

**Divider**

**Active days of the week**
- Seven toggle pills, Monday to Sunday, with `aria-pressed`. They wrap onto two rows at the default width.

**Opening hours**
- **Pickers:** "Opening time" and "Closing time", side by side in the two-input grid (section 9).
- **Note box:** "**Open to guests:** 8:00 AM - 6:00 PM". When closing is earlier than opening it adds ", closing after midnight". When both times are the same: "Set an opening and a closing time".

**Buffer between bookings**
- **Label:** "Buffer between bookings" with the hint "(time to reset a table, like 30 minutes)"
- **Input:** placeholder "Enter buffer", with "minutes" on the right (15px, `#5B6B66`) and `padding-right: 96px`. Digits only, up to 3. Optional.

**Divider**

**Answer requests by**
- **Label:** "Answer requests by" with the hint "(before the booking time)"
- **Pills:** small, a `radiogroup` with 1 hour, 2 hours (default), 6 hours and 24 hours.
- **Note:** "Requests you haven't answered by then expire, and the guest is told."

**Time to pay** (Deposit to confirm and Entry fees only)
- **Label:** "Time to pay" with the hint "(after you accept)"
- **Pills:** small, a `radiogroup` with 1 hour, 3 hours (default), 12 hours and 24 hours.
- **Note:** "If the guest doesn't pay in time, the booking is released and they're told."

**No-show note**
- A note box with `display: flex; align-items: flex-start; gap: 8px` and `hgi-twotone hgi-clock-01` (16px, `#066349`, `margin-top: 1px`).
- "Confirmed guests you haven’t admitted move to No show at closing time, {closing time}."

**Error box**, when shown (Validation).

## 5. Edit, Wallet details
A column with `gap: 24px`:

**Heading**
- **Title:** "Set up your wallet"
- **Intro:** "Money from reservations at {place} is sent here."
- **Fee line:** `margin: 6px 0 0; font-size: 13px; color: #5B6B66`. "Tukai keeps USD 1.00 from each paid reservation, taken out of your payout. Free reservations cost nothing."

**How you want to be paid**
- A `radiogroup` labelled "Payout method", with M-Pesa (`hgi-smart-phone-01`, default) and Bank account (`hgi-bank`).
- Pills: `display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 22px 0 16px; font-size: 15px; font-weight: 600`, with a 20px icon before the label. Selected and other colours as the shared pill.

**M-Pesa details** (M-Pesa only)
- **Number:** "+254" prefix, placeholder "M-Pesa number", `hgi-call-02`. Digits and spaces, up to 12 characters.
- **Name:** placeholder "Name registered on M-Pesa", `hgi-identity-card`. Up to 60 characters.

**Your bank account** (Bank account only, `gap: 12px`)
- **Bank country:** a country picker (section 9), `hgi-globe-02`. Default Kenya.
- **Bank name:** `hgi-bank`.
- **Branch** (`hgi-building-03`) and **Branch code** (`hgi-hashtag`, up to 12), side by side.
- **Account name:** `hgi-identity-card`.
- **Account number** (`hgi-credit-card`, digits only, up to 20) and **SWIFT code** (`hgi-global`, uppercased, letters and digits only, up to 11), side by side.

**Billing address** (Bank account only, `gap: 12px`)
- **Billing country:** a country picker, `hgi-globe-02`. Default Kenya.
- **Postcode** (`hgi-mail-01`, up to 10) and **Town or city** (`hgi-city-01`), side by side.

Every bank and billing input uses its name as the placeholder and has no visible label (Open items 7). Text inputs take up to 60 characters unless noted.

**Phone number**
- **Label:** "Phone number" with the hint "(for payout alerts)"
- **Input:** placeholder "Enter phone number". `hgi-call-02` on the left (`left: 16px`), then "+254" (`left: 48px`), with `padding: 0 16px 0 112px` and no trailing icon. Digits and spaces, up to 12 characters.

**Error box**, when shown.

## 6. View
```css
/* Wrapper */ display: flex; flex-direction: column; margin-top: -6px;   /* 18px under the place line */

/* Status */
margin: 0 0 18px; display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; border-radius: 12px;
font-size: 14px; line-height: 1.45; font-weight: 600; text-wrap: pretty;
/* icon */ twotone, 17px, line-height 20px

/* Section */ padding: 18px 0; border-top: 1px solid #EDF0EE; display: flex; flex-direction: column; gap: 8px;
/* grid section */ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px;
/* item */  display: flex; flex-direction: column; gap: 6px;
/* label */ font-size: 13px; font-weight: 600; color: #5B6B66;
/* value */ font-size: 16px; font-weight: 600; color: #013334;
/* detail */ font-size: 14px; color: #5B6B66;

/* Category chip */ display: inline-flex; flex-direction: column; gap: 1px; padding: 10px 16px; border-radius: 12px;
                    background: #F3F4F2; font-size: 14px; color: #1F2937;   name 600; price 13px #5B6B66, "KES 300"
/* chip row */ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
/* Day pill */ display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px;
               background: #F3F4F2; font-size: 14px; color: #1F2937;
/* value icon (hours, payout method) */ twotone, 18px, #066349, gap 8px before the value
```
| Status | Background | Text | Icon | Copy |
|---|---|---|---|---|
| Live | `#E8F1ED` | `#066349` | `hgi-tick-02` | "Live. Guests can send reservation requests to {place}." |
| Not live | `#FFF6E5` | `#7A4A00` | `hgi-information-circle` | "Not live yet. Add your wallet details so guests can pay." |

| Section | Layout | Content |
|---|---|---|
| Reservation type and fees | Column | The type as the value. A detail line: "KES 500 per guest, paid once you accept and taken off the final bill", "Per person by guest type, paid once you accept" or "Guests pay nothing to book". Entry fees add the category chips |
| Capacity | Grid | Total seating capacity "45 guests", Max party size per booking "15 guests" |
| Active days | Column | A day pill per active day, full names, Monday first |
| Timings | Grid | Opening hours (clock icon, "8:00 AM - 6:00 PM"), Buffer between bookings ("20 minutes" or "No buffer"), Requests expire ("2 hours before the booking time"), Time to pay ("3 hours after you accept", paid types only), No-shows ("At closing time, 6:00 PM") |
| Wallet details | Column | Paid types: the method with its icon, the account ("+254 716 909 826, Weekend Readers" or "{bank}, account ending 1234") at 14px `#1F2937`, then "Phone number +254 716 909 826" at 14px `#5B6B66`. Free: "Not needed for free reservations. You add one if you switch to a deposit or entry fees." at line height 1.5 |

The grid sections give each item at least 200px, so they're two columns at the default width and one on a 390px sheet. Missing wallet values read "Number missing" and "Phone number missing".

## 7. Footer
```css
flex: 0 0 auto; display: flex; align-items: center; flex-wrap: wrap; gap: 10px; min-height: 88px;
padding: 18px 24px calc(18px + env(safe-area-inset-bottom)); border-top: 1px solid #EDF0EE; background: #FFFFFF;
/* Cancel, left */ height: 48px; padding: 0 6px; border: 0; background: transparent; font-size: 15px; font-weight: 500; color: #E02D3C;   hover underline
/* spacer */ flex: 1 1 auto;
/* Save & exit */ height: 48px; padding: 0 22px; border: 1.5px solid #066349; border-radius: 999px; background: #FFFFFF;
                  font-size: 15px; font-weight: 600; color: #066349; white-space: nowrap;   hover background #E8F1ED
/* Primary, right */ height: 48px; padding: 0 24px; border: 0; border-radius: 999px; background: #B0E800; color: #013334;
                     font-size: 15px; font-weight: 600; white-space: nowrap; transition: background .2s ease, box-shadow .2s ease;
/* hover */  background: #A3D900; box-shadow: 0 6px 16px rgba(176,232,0,.4);
/* active */ transform: scale(.97);
```
| State | Buttons |
|---|---|
| View | Edit settings |
| Edit, Reservation type, free | Cancel, Save changes |
| Edit, Reservation type, deposit or entry fees | Cancel, Save & continue |
| Edit, Wallet details | Cancel, Save & exit, Save changes |

The primary button is never disabled. It shows the error box instead.

## 8. Validation
**Reservation type** collects everything missing, in this order, into one sentence: "Add {item}, {item} and {item}."

| Rule | Item |
|---|---|
| Deposit, amount empty or 0 | "a deposit per guest" |
| Entry fees, no category added | "at least one guest category with a price" |
| Capacity empty or 0 | "your seating capacity" |
| Party size empty or 0 | "a max party size" |
| Party size above capacity | "a party size no bigger than your capacity" |
| No active day | "at least one active day" |
| Opening and closing times the same | "opening and closing times" |

For example: "Add your seating capacity, a max party size and at least one active day."

**Wallet details**
- **Complete when:** the phone has at least 9 digits, and either the M-Pesa number has at least 9 digits and its name is filled in, or every bank and billing field is filled in.
- **M-Pesa message:** "Add your M-Pesa number, the name on it and a phone number."
- **Bank message:** "Fill in every bank and billing field, and a phone number."

**When the error shows**
- Only after a primary button or the Wallet details tab is tried with something missing.
- Then it updates as the person types, and goes once everything is fixed.
- Changing step or saving clears it.

## 9. Time and country pickers
Two shared components, both in `components/`, both opening a list in a popover.

```css
/* Field: <button aria-haspopup="listbox" aria-expanded> */
width: 100%; height: 56px; display: flex; align-items: center; gap: 12px; padding: 0 16px;
border: 1px solid #DDE3DF; border-radius: 12px; background: #FFFFFF; text-align: left;
/* open or focused */ border-color: #066349; box-shadow: 0 0 0 3px #E8F1ED;

/* Popover */
position: absolute; z-index: 45; padding: 6px; border-radius: 18px; background: #FFFFFF;
box-shadow: 0 0 0 1px rgba(1,51,52,.06), 0 14px 36px rgba(1,51,52,.16);
/* list: role="listbox" */ max-height: 288px; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 2px;
/* option: role="option" aria-selected */ min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 12px;
                                         border: 0; border-radius: 12px; font-size: 15px; text-align: left;
/* option hover */ background: #F3F4F2;
/* option focus */ box-shadow: inset 0 0 0 2px #066349;
/* selected */ background: #E8F1ED; color: #013334; font-weight: 600;   hgi-twotone hgi-tick-02 18px #066349 at the end
```
- **Popover position:** at least as wide as the field and 240px, kept inside the drawer with 8px to spare. It opens 6px below the field, or above when only the space above fits it.
- **While open:** the drawer scrolls to keep the list in view. A click outside, Escape or Tab closes it.

**Time picker** (`Time Field.dc.html`)
- **Field with a time:** the label above (12.5px, `#5B6B66`), then the time (15px, `#1F2937`, tabular figures). The closing time adds "· {duration}" (13.5px, `#5B6B66`), for example "· 10 hrs".
- **Field without a time:** the label alone, 15px `#5B6B66`.
- **Icon:** `hgi-clock-01`, 20px, `#5B6B66`, on the right.
- **Times:** every 15 minutes. Opening time lists 12:00 AM to 11:45 PM.
- **Closing time:** lists from 15 minutes after the opening time, wrapping past midnight, with each option's duration on the right (13.5px, `#5B6B66`, for example "2 hrs 30 mins").
- **On open:** the list centres on the current time.
- **Keys:** Up and Down open it. In the list, the arrows move by one, Page Up and Page Down by an hour, and Home and End jump to the ends. Picking or Escape returns focus to the field.
- **Value:** `HH:MM`, 24-hour.

**Country picker** (`Select Field.dc.html`)
- **Field:** `hgi-globe-02` (20px, `#5B6B66`) on the left, then the country (15px, `#1F2937`), then `hgi-arrow-down-01` (18px, `#5B6B66`), which turns 180° while open.
- **Options:** Kenya, Uganda, Tanzania and Rwanda.
- **Typing:** letters jump to the first matching country, like a native select.

## Behaviour
1. **Entry points**

| From | Control | Result |
|---|---|---|
| Place page, the owner card | "Set up reservations", or "Reservation settings" once saved | Settings on top of the place |
| Dashboard, a Places card | The "Set up reservations" chip, only before settings are saved | Opens the place, then settings on top |
| Reservations panel | "Reservation settings" in the action bar, and "Finish setup" on the not-live banner | Settings on top of the panel |
| Claim page, approved claim | "Set up reservations" or "Reservation settings" on each place. With one place, also the footer button | Settings on top of the claim |

2. **Opening:** the draft is a copy of the saved settings, or the defaults. It opens in View when settings exist, otherwise in Edit on Reservation type.
3. **Switching type:** the deposit and categories stay in the draft, so switching back keeps them. They're saved with the rest.
4. **Save changes, free:** saves, makes the place live, goes to View and scrolls to the top.
5. **Save & continue:** checks the first step, then moves to Wallet details. Nothing is saved yet.
6. **Save changes, Wallet details:** needs a complete wallet. Saves, makes the place live, goes to View.
7. **Save & exit:** saves whatever is there and goes back to the panel underneath. The place is live only if the wallet is complete.
8. **Edit settings:** goes to Edit on Reservation type, filled with the saved settings.
9. **Cancel:** with saved settings, drops the draft and goes back to View. Without, goes back to the panel underneath. Back and Close also drop the draft. None of them ask first.
10. **Live:** a free reservation is live once saved. A paid one is live once its wallet is complete. Guests can only book a live place, through "Book a table" for restaurants and "Book a visit" for other places.
11. **Elsewhere:** once saved, the place page owner card shows the summary line below, the Dashboard chip becomes "Reservation requests {n}", and the Reservations panel shows "Not live yet. Guests can't book until you add your wallet details." while the place isn't live.
12. **Toasts:** one at a time, 4.2s each.

**Owner card line** on the place page:
- **Not set up:** "Reservations are off. Choose how guests book, your capacity and hours, and where payouts go."
- **Set up:** "{type}, {capacity} seats, {days}, {opening} - {closing}." For example "Entry fees, 45 seats, every day, 8:00 AM - 6:00 PM." Days read "every day", or short names like "Mon, Wed, Fri".
- **Not live:** the set-up line, then " Add your wallet details so guests can pay."

## Copy
| Trigger | Toast |
|---|---|
| Save changes, free | "Saved. {place} takes free reservation requests now." |
| Save changes, Wallet details | "Saved. {place} takes reservation requests now, and payouts go to your M-Pesa." ("bank account." for a bank) |
| Save & exit, wallet complete | "Saved. {place} takes reservation requests now." |
| Save & exit, wallet incomplete | "Saved. Finish your wallet details before guests can pay." |

## Data
```ts
type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type ReservationSettings = {
  type: 'free' | 'deposit' | 'entry';
  deposit: number;                            // KES per guest, deposit only
  cats: { name: string; amount: number }[];   // entry fees only, KES per head
  seats: number;                              // most guests at once
  party: number;                              // largest group on one booking, no more than seats
  days: Day[];
  open: string;                               // 'HH:MM', 24-hour
  close: string;                              // earlier than open means after midnight
  buffer: number;                             // minutes, 0 for none
  expiry: 1 | 2 | 6 | 24;                     // hours before the booking time
  payBy: 1 | 3 | 12 | 24;                     // hours after accepting, paid types only
  live: boolean;                              // free, or paid with a complete wallet
  payout: {
    method: 'mpesa' | 'bank';
    mpesaNo: string; mpesaName: string;
    country: string; bankName: string; branch: string; branchCode: string; accName: string; accNo: string; swift: string;
    billCountry: string; postcode: string; town: string;
    phone: string;                            // for payout alerts
  };
};
```
- **Storage:** one record per place. The prototype keeps every field flat, as strings, in `rsets[placeId]`.
- **Defaults:** free, no days, open 09:00, close 22:00, expiry 2 hours, time to pay 3 hours, M-Pesa, Kenya for both countries. Everything else is empty.
- **Money:** "KES {n}" with en-US grouping.
- **Times:** "{h:mm AM}".

**Sample data:** Riverside Gardens, Westlands, run by Weekend Readers, has saved and live settings:
- Entry fees: Residents KES 300, Visitors KES 800 and Kids KES 150.
- 45 seats, parties up to 15.
- Every day, 8:00 AM - 6:00 PM.
- A 20-minute buffer, 2 hours to answer and 3 hours to pay.
- M-Pesa 716 909 826 in the name Weekend Readers, with phone 716 909 826.

Every other place the person manages starts with no settings.

**State in the prototype**

| Key | Holds |
|---|---|
| `rsets` | Saved settings, by place id |
| `rsPid` | The place being edited |
| `rsMode` | `'view'` or `'edit'` |
| `rsStep` | `'type'` or `'wallet'` |
| `rsd` | The draft |
| `rsErr` | Whether the error box is allowed to show |

## Accessibility
- **Panel:** see `design_handoff_tickets_created`.
- **Step tabs:** `role="tab"` buttons in a `tablist`, but there's no `tabpanel`. Add one per step, `aria-controls`, and arrow keys. Explain why Wallet details is disabled for free reservations, for example with `aria-describedby`.
- **Choices:** the type, timings and payout method are `radiogroup`s of `radio` buttons with `aria-checked`. Two of the timing groups have no accessible name, so label them "Answer requests by" and "Time to pay". Add arrow keys. Days are toggle buttons with `aria-pressed`.
- **Inputs:** named with `aria-label` only. The visible field labels aren't connected, and most wallet fields have only a placeholder. Use `<label for>` with visible labels.
- **Keyboards:** amounts, capacity, party size, buffer and account number should use `inputMode="numeric"`, and phone numbers `type="tel"`.
- **Errors:** `role="alert"`, so every change is announced while the person types. Consider announcing only when a save is tried, and moving focus to the first missing field.
- **Chips:** remove buttons read "Remove {category}". Icons and dividers are `aria-hidden`.
- **Pickers:** listbox popovers with `aria-selected`, roving focus and Escape. The field reads "{label}, {value}" or "{label}, not set".
- **Focus:** changing step or saving scrolls the body to the top without moving focus. Move focus to the step's title.
- **Targets:** inputs and pickers 56px, pills 48px or 44px, chips 52px, footer buttons 48px.

## Tokens used
| Value | Where |
|---|---|
| `#066349` | Place line icon, current step, input focus border, Save & exit, Add category, value icons, live status |
| `#E8F1ED` | Current step, input focus ring, Add category, live status, Save & exit hover, selected picker option |
| `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)` | Selected pills |
| `#F3F4F2` | Other pills, note boxes, category chips, day pills, disabled Add category |
| `#DDE3DF` | Input borders, prefix dividers |
| `#EDF0EE` | Dividers, View section borders, footer border |
| `#FFF6E5`, `#7A4A00` | Error box, not-live status |
| `#B0E800`, `#A3D900` | Primary button and hover |
| `rgba(176,232,0,.4)` | Primary hover glow |
| `#E02D3C` | Cancel, remove hover |
| `#8A9793` | Disabled step and Add category |
| `#1F2937` | Titles, labels, input text, pills |
| `#013334` | View values, primary text, selected picker option |
| `#5B6B66` | Hints, intros, notes, icons, View labels |
| `#FFFFFF` | Inputs, pickers, Save & exit, footer |
| 12px | Inputs, pickers, note boxes, error box, status, chips, picker options |
| 18px | Picker popover |
| 999px | Pills, tabs, buttons, day pills |

| Text | Size | Weight | Extra |
|---|---|---|---|
| Section titles | 19 | 700 | letter-spacing -0.2px |
| View values | 16 | 600 | |
| Field labels, payout pills, inputs, footer, picker options | 15 | 600, inputs 400 | line height 1.35 for labels |
| Pills, step tabs | 14.5 | 600 | |
| Intros, chips, View details, status, Add category | 14 | 400 to 600 | |
| Hints, notes, error, place line | 13.5 | 400 | line height 1.45 |
| Fee line, View labels | 13 | 400 to 600 | |
| Chip prices, picker labels | 12.5 | 400 | |

## Assets
- **Icons:** Hugeicons twotone from the project kit `https://sets.hugeicons.com/jtgnwk3xiym.css?v=3`. The prototype now loads a saved copy, `assets/hugeicons-set.css`. Use the codebase's Hugeicons package with the same names.
- **Components:** `components/Time Field.dc.html` and `components/Select Field.dc.html` are the pickers' source, copied as reference. They need the prototype's runtime to run.

## Open items
1. **The Tukai fee is in USD.** "Tukai keeps USD 1.00 from each paid reservation" sits next to prices in KES. Confirm the fee, its currency, and whether it applies to deposits, entry fees or both.
2. **Kenya only:** KES and +254 are fixed, though the bank country can be Uganda, Tanzania or Rwanda.
3. **A wallet per place:** payout details are saved with each place, while Withdraw (`design_handoff_withdraw`) pays out to one account (M-Pesa ending 815). Decide whether payouts belong to the place, the community or the account.
4. **Save & exit can take a place offline.** A live free place switched to a paid type and saved with an incomplete wallet stops taking requests, with no warning.
5. **No way to turn reservations off.** There's no Turn off or Delete. Only Hold off reservations, in the Reservations panel, pauses them.
6. **Changes to live settings.** Lowering capacity or removing a day doesn't check existing bookings. Decide what happens to them.
7. **Placeholder-only fields:** every bank and billing field has its name only as a placeholder, which disappears once the person types.
8. **A category typed but not added is ignored.** With none added, saving says to add a category. With others added, it's silently dropped. Add it on save, or warn.
9. **Back leaves settings.** On Wallet details, the header Back goes to the panel underneath, not to Reservation type, and drops the draft.
10. **No unsaved-changes confirmation.** Cancel, Back and Close discard edits, which is part of the open cross-page decision.
11. **Error style:** the amber box matches Withdraw. Tickets created uses red text, which is part of the open cross-page decision.
12. **One name per timing:** "Answer requests by" in Edit is "Requests expire" in View.
13. **Light bank checks:** fields only need to be filled in. There's no SWIFT length (8 or 11), account number or branch code check.
14. **Editing a paid setup** always goes through Wallet details to save, even when the wallet hasn't changed.
15. **Disabled Add category** keeps a pointer cursor.
16. **Apostrophes are mixed:** "haven't", "doesn't", "they're" and "can't" use straight ones, and the no-show note uses a curly one. Pick one.

## Exact markup
Verbatim from `Tukai Web.dc.html`. Only the whitespace between tags was reflowed, for reading:
- `{{ }}` holes are filled by the logic below.
- `style-hover`, `style-focus` and `style-active` hold those states.
- `<sc-if>` renders its children only when its value is true, and `<sc-for>` repeats its child once per item. Neither adds an element.
- `<dc-import name="Time Field">` and `<dc-import name="Select Field">` mount the pickers in `components/`. Their attributes are props: `on-pick` is `onPick`, `ref-time` is `refTime`.
- Two View grid sections declare `display` and `gap` twice. The later values win: `display:grid` and `gap:16px`.

```html
<!-- Reservation settings, inside the panel body -->
<sc-if value="{{ pn.isRset }}">
  <div style="display:flex;flex-direction:column;gap:24px;">
    <span style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:#5B6B66;"><i class="hgi-twotone hgi-store-verified-01" style="font-size:17px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>{{ pn.rs.placeLine }}</span>
    <sc-if value="{{ pn.rs.isEdit }}">
      <div role="tablist" aria-label="Steps" style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-top:-8px;">
        <sc-for list="{{ pn.rs.steps }}" as="t" hint-placeholder-count="2">
          <button type="button" role="tab" aria-selected="{{ t.on }}" aria-disabled="{{ t.off }}" onClick="{{ t.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 20px 0 16px;border:none;border-radius:999px;background:{{ t.bg }};color:{{ t.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:{{ t.cursor }};white-space:nowrap;"><i class="hgi-twotone {{ t.icon }}" style="font-size:19px;flex:0 0 auto;" aria-hidden="true"></i>{{ t.label }}</button>
        </sc-for>
      </div>
    </sc-if>
    <sc-if value="{{ pn.rs.isType }}">
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Reservation type and fees</h3>
            <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">Choose how guests reserve this place, and whether they pay anything to book.</p>
          </div>
          <div role="radiogroup" aria-label="Reservation type" style="display:flex;flex-wrap:wrap;gap:8px;">
            <sc-for list="{{ pn.rs.types }}" as="o" hint-placeholder-count="3">
              <button type="button" role="radio" aria-checked="{{ o.on }}" onClick="{{ o.onClick }}" style="height:48px;padding:0 20px;border:none;border-radius:999px;background:{{ o.bg }};color:{{ o.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;">{{ o.label }}</button>
            </sc-for>
          </div>
          <p style="margin:0;padding:12px 14px;border-radius:12px;background:#F3F4F2;font-size:13.5px;line-height:1.45;color:#1F2937;text-wrap:pretty;">{{ pn.rs.typeNote }}</p>
        </div>
        <sc-if value="{{ pn.rs.isDeposit }}">
          <div style="display:flex;flex-direction:column;gap:10px;">
            <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Deposit per guest <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(paid once you accept, taken off the final bill)</span></span>
            <label style="position:relative;display:block;">
              <span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);padding-right:10px;border-right:1px solid #DDE3DF;font-size:15px;font-weight:600;color:#1F2937;pointer-events:none;">KES</span>
              <input type="text" value="{{ pn.rs.deposit }}" onChange="{{ pn.rs.onDeposit }}" placeholder="Amount per guest" aria-label="Deposit per guest in KES" style="width:100%;height:56px;padding:0 52px 0 72px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-wallet-02" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
          </div>
        </sc-if>
        <sc-if value="{{ pn.rs.isEntry }}">
          <div style="display:flex;flex-direction:column;gap:10px;">
            <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Guest categories and prices</span>
            <sc-if value="{{ pn.rs.hasCats }}">
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <sc-for list="{{ pn.rs.cats }}" as="c" hint-placeholder-count="2">
                  <span style="display:inline-flex;align-items:center;gap:4px;min-height:52px;padding:0 4px 0 16px;border-radius:12px;background:#F3F4F2;font-size:14px;color:#1F2937;">
                    <span style="display:flex;flex-direction:column;gap:1px;">
                      <span style="font-weight:600;">{{ c.label }}</span>
                      <span style="font-size:12.5px;color:#5B6B66;">{{ c.price }}</span>
                    </span>
                    <button type="button" onClick="{{ c.onRemove }}" aria-label="{{ c.removeAria }}" style="width:44px;height:44px;flex:0 0 auto;border:none;border-radius:999px;background:transparent;color:#5B6B66;display:flex;align-items:center;justify-content:center;cursor:pointer;" style-hover="color:#E02D3C;">
                      <i class="hgi-twotone hgi-cancel-01" style="font-size:16px;" aria-hidden="true"></i>
                    </button>
                  </span>
                </sc-for>
              </div>
            </sc-if>
            <label style="position:relative;display:block;">
              <input type="text" value="{{ pn.rs.catName }}" onChange="{{ pn.rs.onCatName }}" placeholder="Category, like Residents, Kids or Adults" aria-label="Guest category" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-user-group" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
            <label style="position:relative;display:block;">
              <span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);padding-right:10px;border-right:1px solid #DDE3DF;font-size:15px;font-weight:600;color:#1F2937;pointer-events:none;">KES</span>
              <input type="text" value="{{ pn.rs.catAmt }}" onChange="{{ pn.rs.onCatAmt }}" placeholder="Amount per head" aria-label="Amount per head in KES" style="width:100%;height:56px;padding:0 52px 0 72px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-wallet-02" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
            <button type="button" onClick="{{ pn.rs.onCatAdd }}" disabled="{{ pn.rs.catOff }}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px;border:none;border-radius:999px;background:{{ pn.rs.catBg }};color:{{ pn.rs.catFg }};font-family:'Google Sans';font-size:14px;font-weight:600;cursor:pointer;"><i class="hgi-twotone hgi-add-01" style="font-size:17px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.rs.catAddLabel }}</button>
          </div>
        </sc-if>
        <div aria-hidden="true" style="height:1px;margin:0 -24px;background:#EDF0EE;"></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Total seating capacity <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(most guests you can host at once)</span></span>
          <label style="position:relative;display:block;">
            <input type="text" value="{{ pn.rs.seats }}" onChange="{{ pn.rs.onSeats }}" placeholder="Enter seating capacity" aria-label="Total seating capacity" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
            <i class="hgi-twotone hgi-user-multiple" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
          </label>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Max party size per booking <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(largest group on one booking or table)</span></span>
          <label style="position:relative;display:block;">
            <input type="text" value="{{ pn.rs.party }}" onChange="{{ pn.rs.onParty }}" placeholder="Enter max party size" aria-label="Max party size per booking" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
            <i class="hgi-twotone hgi-user-multiple" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
          </label>
        </div>
        <div aria-hidden="true" style="height:1px;margin:0 -24px;background:#EDF0EE;"></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Active days of the week</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <sc-for list="{{ pn.rs.days }}" as="dd" hint-placeholder-count="7">
              <button type="button" aria-pressed="{{ dd.on }}" onClick="{{ dd.onClick }}" style="height:48px;padding:0 20px;border:none;border-radius:999px;background:{{ dd.bg }};color:{{ dd.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;">{{ dd.label }}</button>
            </sc-for>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Opening hours</span>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px;">
            <dc-import name="Time Field" label="Opening time" value="{{ pn.rs.open }}" on-pick="{{ pn.rs.onOpenT }}" hint-size="100%,56px"></dc-import>
            <dc-import name="Time Field" label="Closing time" value="{{ pn.rs.close }}" on-pick="{{ pn.rs.onCloseT }}" ref-time="{{ pn.rs.open }}" hint-size="100%,56px"></dc-import>
          </div>
          <p style="margin:0;padding:12px 14px;border-radius:12px;background:#F3F4F2;font-size:13.5px;line-height:1.45;color:#1F2937;"><span style="font-weight:600;">Open to guests:</span> {{ pn.rs.hoursLine }}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Buffer between bookings <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(time to reset a table, like 30 minutes)</span></span>
          <label style="position:relative;display:block;">
            <input type="text" value="{{ pn.rs.buffer }}" onChange="{{ pn.rs.onBuffer }}" placeholder="Enter buffer" aria-label="Buffer between bookings in minutes" style="width:100%;height:56px;padding:0 96px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
            <span style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:15px;color:#5B6B66;pointer-events:none;">minutes</span>
          </label>
        </div>
        <div aria-hidden="true" style="height:1px;margin:0 -24px;background:#EDF0EE;"></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Answer requests by <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(before the booking time)</span></span>
          <div role="radiogroup" style="display:flex;flex-wrap:wrap;gap:8px;">
            <sc-for list="{{ pn.rs.expiryOpts }}" as="o" hint-placeholder-count="4">
              <button type="button" role="radio" aria-checked="{{ o.on }}" onClick="{{ o.onClick }}" style="height:44px;padding:0 18px;border:none;border-radius:999px;background:{{ o.bg }};color:{{ o.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;">{{ o.label }}</button>
            </sc-for>
          </div>
          <p style="margin:0;font-size:13.5px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">Requests you haven't answered by then expire, and the guest is told.</p>
        </div>
        <sc-if value="{{ pn.rs.isPaid }}">
          <div style="display:flex;flex-direction:column;gap:10px;">
            <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Time to pay <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(after you accept)</span></span>
            <div role="radiogroup" style="display:flex;flex-wrap:wrap;gap:8px;">
              <sc-for list="{{ pn.rs.payOpts }}" as="o" hint-placeholder-count="4">
                <button type="button" role="radio" aria-checked="{{ o.on }}" onClick="{{ o.onClick }}" style="height:44px;padding:0 18px;border:none;border-radius:999px;background:{{ o.bg }};color:{{ o.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;">{{ o.label }}</button>
              </sc-for>
            </div>
            <p style="margin:0;font-size:13.5px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">If the guest doesn't pay in time, the booking is released and they're told.</p>
          </div>
        </sc-if>
        <p style="margin:0;display:flex;align-items:flex-start;gap:8px;padding:12px 14px;border-radius:12px;background:#F3F4F2;font-size:13.5px;line-height:1.45;color:#1F2937;text-wrap:pretty;"><i class="hgi-twotone hgi-clock-01" style="font-size:16px;flex:0 0 auto;margin-top:1px;color:#066349;" aria-hidden="true"></i>{{ pn.rs.closeLine }}</p>
        <sc-if value="{{ pn.rs.hasErr }}">
          <div role="alert" style="display:flex;align-items:flex-start;gap:8px;padding:12px 14px;border-radius:12px;background:#FFF6E5;font-size:13.5px;line-height:1.45;color:#7A4A00;">
            <i class="hgi-twotone hgi-information-circle" style="font-size:16px;line-height:19px;flex:0 0 auto;" aria-hidden="true"></i>
            <span style="flex:1;min-width:0;text-wrap:pretty;">{{ pn.rs.errLine }}</span>
          </div>
        </sc-if>
      </div>
    </sc-if>
    <sc-if value="{{ pn.rs.isWallet }}">
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div>
          <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Set up your wallet</h3>
          <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">Money from reservations at {{ pn.rs.placeName }} is sent here.</p>
          <p style="margin:6px 0 0;font-size:13px;color:#5B6B66;">Tukai keeps USD 1.00 from each paid reservation, taken out of your payout. Free reservations cost nothing.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">How you want to be paid</span>
          <div role="radiogroup" aria-label="Payout method" style="display:flex;flex-wrap:wrap;gap:8px;">
            <sc-for list="{{ pn.rs.methods }}" as="m" hint-placeholder-count="2">
              <button type="button" role="radio" aria-checked="{{ m.on }}" onClick="{{ m.onClick }}" style="display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 22px 0 16px;border:none;border-radius:999px;background:{{ m.bg }};color:{{ m.fg }};font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;"><i class="hgi-twotone {{ m.icon }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ m.label }}</button>
            </sc-for>
          </div>
        </div>
        <sc-if value="{{ pn.rs.isMpesa }}">
          <div style="display:flex;flex-direction:column;gap:10px;">
            <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">M-Pesa details</span>
            <label style="position:relative;display:block;">
              <span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);padding-right:10px;border-right:1px solid #DDE3DF;font-size:15px;font-weight:600;color:#1F2937;pointer-events:none;">+254</span>
              <input type="text" value="{{ pn.rs.mpesaNo }}" onChange="{{ pn.rs.onMpesaNo }}" placeholder="M-Pesa number" aria-label="M-Pesa number" style="width:100%;height:56px;padding:0 52px 0 80px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-call-02" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
            <label style="position:relative;display:block;">
              <input type="text" value="{{ pn.rs.mpesaName }}" onChange="{{ pn.rs.onMpesaName }}" placeholder="Name registered on M-Pesa" aria-label="Name registered on M-Pesa" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-identity-card" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
          </div>
        </sc-if>
        <sc-if value="{{ pn.rs.isBank }}">
          <div style="display:flex;flex-direction:column;gap:12px;">
            <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Your bank account</span>
            <dc-import name="Select Field" label="Bank country" icon="hgi-globe-02" options="Kenya,Uganda,Tanzania,Rwanda" value="{{ pn.rs.country }}" on-pick="{{ pn.rs.onCountry }}" hint-size="100%,56px"></dc-import>
            <label style="position:relative;display:block;">
              <input type="text" value="{{ pn.rs.bankName }}" onChange="{{ pn.rs.onBankName }}" placeholder="Bank name" aria-label="Bank name" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-bank" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px;">
              <label style="position:relative;display:block;">
                <input type="text" value="{{ pn.rs.branch }}" onChange="{{ pn.rs.onBranch }}" placeholder="Branch" aria-label="Branch" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
                <i class="hgi-twotone hgi-building-03" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
              </label>
              <label style="position:relative;display:block;">
                <input type="text" value="{{ pn.rs.branchCode }}" onChange="{{ pn.rs.onBranchCode }}" placeholder="Branch code" aria-label="Branch code" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
                <i class="hgi-twotone hgi-hashtag" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
              </label>
            </div>
            <label style="position:relative;display:block;">
              <input type="text" value="{{ pn.rs.accName }}" onChange="{{ pn.rs.onAccName }}" placeholder="Account name" aria-label="Account name" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <i class="hgi-twotone hgi-identity-card" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            </label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px;">
              <label style="position:relative;display:block;">
                <input type="text" value="{{ pn.rs.accNo }}" onChange="{{ pn.rs.onAccNo }}" placeholder="Account number" aria-label="Account number" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
                <i class="hgi-twotone hgi-credit-card" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
              </label>
              <label style="position:relative;display:block;">
                <input type="text" value="{{ pn.rs.swift }}" onChange="{{ pn.rs.onSwift }}" placeholder="SWIFT code" aria-label="SWIFT code" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
                <i class="hgi-twotone hgi-global" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
              </label>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Billing address</span>
            <dc-import name="Select Field" label="Billing country" icon="hgi-globe-02" options="Kenya,Uganda,Tanzania,Rwanda" value="{{ pn.rs.billCountry }}" on-pick="{{ pn.rs.onBillCountry }}" hint-size="100%,56px"></dc-import>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px;">
              <label style="position:relative;display:block;">
                <input type="text" value="{{ pn.rs.postcode }}" onChange="{{ pn.rs.onPostcode }}" placeholder="Postcode" aria-label="Postcode" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
                <i class="hgi-twotone hgi-mail-01" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
              </label>
              <label style="position:relative;display:block;">
                <input type="text" value="{{ pn.rs.town }}" onChange="{{ pn.rs.onTown }}" placeholder="Town or city" aria-label="Town or city" style="width:100%;height:56px;padding:0 52px 0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
                <i class="hgi-twotone hgi-city-01" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
              </label>
            </div>
          </div>
        </sc-if>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <span style="font-size:15px;font-weight:600;color:#1F2937;line-height:1.35;">Phone number <span style="font-weight:400;font-size:13.5px;color:#5B6B66;">(for payout alerts)</span></span>
          <label style="position:relative;display:block;">
            <i class="hgi-twotone hgi-call-02" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i>
            <span style="position:absolute;left:48px;top:50%;transform:translateY(-50%);padding-right:10px;border-right:1px solid #DDE3DF;font-size:15px;font-weight:600;color:#1F2937;pointer-events:none;">+254</span>
            <input type="text" value="{{ pn.rs.phone }}" onChange="{{ pn.rs.onPhone }}" placeholder="Enter phone number" aria-label="Phone number" style="width:100%;height:56px;padding:0 16px 0 112px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
          </label>
        </div>
        <sc-if value="{{ pn.rs.hasErr }}">
          <div role="alert" style="display:flex;align-items:flex-start;gap:8px;padding:12px 14px;border-radius:12px;background:#FFF6E5;font-size:13.5px;line-height:1.45;color:#7A4A00;">
            <i class="hgi-twotone hgi-information-circle" style="font-size:16px;line-height:19px;flex:0 0 auto;" aria-hidden="true"></i>
            <span style="flex:1;min-width:0;text-wrap:pretty;">{{ pn.rs.errLine }}</span>
          </div>
        </sc-if>
      </div>
    </sc-if>
    <sc-if value="{{ pn.rs.isView }}">
      <div style="display:flex;flex-direction:column;margin-top:-6px;">
        <p style="margin:0 0 18px;display:flex;align-items:flex-start;gap:8px;padding:12px 14px;border-radius:12px;background:{{ pn.rs.vStBg }};font-size:14px;line-height:1.45;color:{{ pn.rs.vStFg }};font-weight:600;text-wrap:pretty;"><i class="hgi-twotone {{ pn.rs.vStIcon }}" style="font-size:17px;line-height:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.rs.vStatus }}</p>
        <div style="display:flex;flex-direction:column;gap:8px;padding:18px 0;border-top:1px solid #EDF0EE;">
          <span style="font-size:13px;font-weight:600;color:#5B6B66;">Reservation type and fees</span>
          <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vType }}</span>
          <span style="font-size:14px;color:#5B6B66;">{{ pn.rs.vFee }}</span>
          <sc-if value="{{ pn.rs.vHasCats }}">
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
              <sc-for list="{{ pn.rs.vCats }}" as="c" hint-placeholder-count="2">
                <span style="display:inline-flex;flex-direction:column;gap:1px;padding:10px 16px;border-radius:12px;background:#F3F4F2;font-size:14px;color:#1F2937;">
                  <span style="font-weight:600;">{{ c.label }}</span>
                  <span style="font-size:13px;color:#5B6B66;">{{ c.price }}</span>
                </span>
              </sc-for>
            </div>
          </sc-if>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:18px 0;border-top:1px solid #EDF0EE;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:16px;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:13px;font-weight:600;color:#5B6B66;">Total seating capacity</span>
            <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vSeats }}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:13px;font-weight:600;color:#5B6B66;">Max party size per booking</span>
            <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vParty }}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:18px 0;border-top:1px solid #EDF0EE;">
          <span style="font-size:13px;font-weight:600;color:#5B6B66;">Active days</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <sc-for list="{{ pn.rs.vDays }}" as="dd" hint-placeholder-count="4">
              <span style="display:inline-flex;align-items:center;height:40px;padding:0 16px;border-radius:999px;background:#F3F4F2;font-size:14px;color:#1F2937;">{{ dd.label }}</span>
            </sc-for>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:18px 0;border-top:1px solid #EDF0EE;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:16px;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:13px;font-weight:600;color:#5B6B66;">Opening hours</span>
            <span style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;color:#013334;"><i class="hgi-twotone hgi-clock-01" style="font-size:18px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>{{ pn.rs.vHours }}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:13px;font-weight:600;color:#5B6B66;">Buffer between bookings</span>
            <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vBuffer }}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:13px;font-weight:600;color:#5B6B66;">Requests expire</span>
            <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vExpiry }}</span>
          </div>
          <sc-if value="{{ pn.rs.vPaid }}">
            <div style="display:flex;flex-direction:column;gap:6px;">
              <span style="font-size:13px;font-weight:600;color:#5B6B66;">Time to pay</span>
              <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vPayBy }}</span>
            </div>
          </sc-if>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:13px;font-weight:600;color:#5B6B66;">No-shows</span>
            <span style="font-size:16px;font-weight:600;color:#013334;">{{ pn.rs.vNoShow }}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:18px 0;border-top:1px solid #EDF0EE;">
          <span style="font-size:13px;font-weight:600;color:#5B6B66;">Wallet details</span>
          <sc-if value="{{ pn.rs.vPaid }}">
            <span style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;color:#013334;"><i class="hgi-twotone {{ pn.rs.vMethodIcon }}" style="font-size:18px;flex:0 0 auto;color:#066349;" aria-hidden="true"></i>{{ pn.rs.vMethod }}</span>
            <span style="font-size:14px;color:#1F2937;">{{ pn.rs.vAccount }}</span>
            <span style="font-size:14px;color:#5B6B66;">Phone number {{ pn.rs.vPhone }}</span>
          </sc-if>
          <sc-if value="{{ pn.rs.vFree }}">
            <span style="font-size:14px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">Not needed for free reservations. You add one if you switch to a deposit or entry fees.</span>
          </sc-if>
        </div>
      </div>
    </sc-if>
  </div>
</sc-if>

<!-- Footer, below the panel body -->
<sc-if value="{{ pn.hasWz }}">
  <div aria-disabled="{{ pn.wzLock }}" style="flex:0 0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:10px;min-height:88px;padding:18px 24px calc(18px + env(safe-area-inset-bottom));border-top:1px solid #EDF0EE;background:#FFFFFF;opacity:{{ pn.wzOp }};pointer-events:{{ pn.wzPe }};transition:opacity .2s ease;">
    <sc-if value="{{ pn.wz.hasCancel }}">
      <button type="button" onClick="{{ pn.wz.onCancel }}" style="flex:0 0 auto;height:48px;padding:0 6px;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#E02D3C;cursor:pointer;" style-hover="text-decoration:underline;">Cancel</button>
    </sc-if>
    <sc-if value="{{ pn.wz.hasDelete }}">
      <button type="button" onClick="{{ pn.wz.onDelete }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 6px;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#1F2937;cursor:pointer;" style-hover="text-decoration:underline;"><i class="hgi-twotone hgi-delete-02" style="font-size:20px;flex:0 0 auto;color:#E02D3C;" aria-hidden="true"></i>Delete</button>
    </sc-if>
    <span aria-hidden="true" style="flex:1 1 auto;"></span>
    <sc-if value="{{ pn.wz.hasSave }}">
      <button type="button" onClick="{{ pn.wz.onSave }}" style="flex:0 0 auto;height:48px;padding:0 22px;border:1.5px solid #066349;border-radius:999px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;font-weight:600;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;">Save &amp; exit</button>
    </sc-if>
    <sc-if value="{{ pn.wz.primaryOk }}">
      <button type="button" onClick="{{ pn.wz.onPrimary }}" style="flex:0 0 auto;height:48px;padding:0 24px;border:none;border-radius:999px;background:#B0E800;font-family:'Google Sans';font-size:15px;font-weight:600;color:#013334;cursor:pointer;white-space:nowrap;transition:background .2s ease, box-shadow .2s ease;" style-hover="background:#A3D900;box-shadow:0 6px 16px rgba(176,232,0,.4);" style-active="transform:scale(0.97);">{{ pn.wz.primaryLabel }}</button>
    </sc-if>
    <sc-if value="{{ pn.wz.primaryNo }}">
      <button type="button" disabled="{{ true }}" aria-disabled="true" style="flex:0 0 auto;height:48px;padding:0 24px;border:none;border-radius:999px;background:#E4F4B5;font-family:'Google Sans';font-size:15px;font-weight:600;color:#5E7A45;cursor:not-allowed;white-space:nowrap;">{{ pn.wz.primaryLabel }}</button>
    </sc-if>
  </div>
</sc-if>

<!-- Place page: the owner card, for places the person manages -->
<sc-if value="{{ pn.isMyPlace }}">
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;padding:16px;border-radius:12px;background:#E8F1ED;">
    <span style="flex:0 0 auto;width:44px;height:44px;border-radius:999px;background:#FFFFFF;color:#066349;display:flex;align-items:center;justify-content:center;">
      <i class="hgi-twotone hgi-store-verified-01" style="font-size:22px;" aria-hidden="true"></i>
    </span>
    <div style="flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px;">
      <span style="font-size:15px;font-weight:600;color:#013334;">{{ pn.myPlaceTitle }}</span>
      <span style="font-size:13.5px;line-height:1.45;color:#1F2937;text-wrap:pretty;">{{ pn.rsLine }}</span>
    </div>
    <button type="button" onClick="{{ pn.onRset }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(1.06);"><i class="hgi-twotone hgi-calendar-03" style="font-size:18px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.rsBtn }}</button>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
</sc-if>

<!-- Reservations panel: the not-live banner -->
<sc-if value="{{ pn.rl.notLive }}">
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:12px 14px;border-radius:12px;background:#FFF6E5;">
    <span style="flex:1 1 220px;min-width:0;display:flex;align-items:flex-start;gap:8px;color:#7A4A00;">
      <i class="hgi-twotone hgi-information-circle" style="font-size:18px;flex:0 0 auto;margin-top:1px;" aria-hidden="true"></i>
      <span style="font-size:14px;line-height:1.45;text-wrap:pretty;">Not live yet. Guests can't book until you add your wallet details.</span>
    </span>
    <button type="button" onClick="{{ pn.rl.onFinish }}" style="flex:0 0 auto;height:44px;padding:0 16px;border:none;border-radius:999px;background:#FFFFFF;color:#7A4A00;font-family:'Google Sans';font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;">Finish setup</button>
  </div>
</sc-if>

<!-- Claim page: the button on each place of an approved claim -->
<sc-if value="{{ p.canSetup }}">
  <button type="button" onClick="{{ p.onSetup }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 12px;border:none;border-radius:999px;background:#E8F1ED;color:#066349;font-family:'Google Sans';font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;" style-hover="background:#DCEAE3;"><i class="hgi-twotone hgi-settings-02" style="font-size:18px;flex:0 0 auto;" aria-hidden="true"></i>{{ p.setupLabel }}</button>
</sc-if>
```

## Exact logic
Verbatim from `Tukai Web.dc.html`, with `// ...` where unrelated code was left out:
- `rsetPanel()` builds everything the panel shows (`pn.rs`) and the footer (`wz`).
- `rsWalletOk()` decides whether a paid setup can go live, and `rsCfg()` is what the guest booking flow reads.
- `push`, `panelBack` and `panelTop` run the shared panel stack. `this.say()` shows the toast.

```js
  // Initial state
  state = {
    // ...
      rsets: this.rsSeed(), rsPid: null, rsMode: null, rsStep: 'type', rsd: null, rsErr: false,
    // ...
  };

  // ---- Reservation settings for a place you manage. Paid types need a wallet before guests can pay. ----
  rsDays() { return [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']]; }
  rsBlank() { return { type: 'free', deposit: '', cats: [], catName: '', catAmt: '', seats: '', party: '', days: [], open: '09:00', close: '22:00', buffer: '', expiry: '2', payBy: '3', method: 'mpesa', mpesaNo: '', mpesaName: '', country: 'Kenya', bankName: '', branch: '', branchCode: '', accName: '', accNo: '', swift: '', billCountry: 'Kenya', postcode: '', town: '', phone: '' }; }
  rsSeed() { return { p3: Object.assign(this.rsBlank(), { type: 'entry', cats: [{ name: 'Residents', amount: '300' }, { name: 'Visitors', amount: '800' }, { name: 'Kids', amount: '150' }], seats: '45', party: '15', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], open: '08:00', close: '18:00', buffer: '20', expiry: '2', payBy: '3', mpesaNo: '716 909 826', mpesaName: 'Weekend Readers', phone: '716 909 826', live: true }) }; }
  openRset(pid) {
    const cur = (this.state.rsets || {})[pid];
    this.setState({ rsPid: pid, rsMode: cur ? 'view' : 'edit', rsStep: 'type', rsd: JSON.parse(JSON.stringify(cur || this.rsBlank())), rsErr: false });
    this.push('rset', pid);
  }
  rsT12(t) { const m = /(\d{1,2}):(\d{2})/.exec(t || ''); if (!m) return ''; let h = +m[1]; const ap = h >= 12 && h < 24 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + m[2] + ' ' + ap; }
  rsTypeLabel(t) { return t === 'deposit' ? 'Deposit to confirm' : t === 'entry' ? 'Entry fees' : 'Free reservation'; }
  rsHrs(v) { const n = parseInt(v, 10) || 0; return n + (n === 1 ? ' hour' : ' hours'); }
  rsWalletOk(d) {
    const dg = (x) => String(x || '').replace(/\D/g, ''), has = (k) => String(d[k] || '').trim().length > 0;
    if (dg(d.phone).length < 9) return false;
    return d.method === 'mpesa' ? dg(d.mpesaNo).length >= 9 && has('mpesaName') : ['bankName', 'branch', 'branchCode', 'accName', 'accNo', 'swift', 'postcode', 'town'].every(has);
  }
  rsLine(pid) {
    const r = (this.state.rsets || {})[pid];
    if (!r) return 'Reservations are off. Choose how guests book, your capacity and hours, and where payouts go.';
    const days = r.days.length === 7 ? 'every day' : this.rsDays().filter(x => r.days.indexOf(x[0]) >= 0).map(x => x[1].slice(0, 3)).join(', ');
    const base = this.rsTypeLabel(r.type) + ', ' + r.seats + ' seats, ' + days + ', ' + this.rsT12(r.open) + ' - ' + this.rsT12(r.close);
    return r.live ? base + '.' : base + '. Add your wallet details so guests can pay.';
  }
  rsIsRest(p) { const cats = (p && p.cats) || [], kind = (p && (p.kind || p.category)) || ''; return cats.indexOf('rest') >= 0 || cats.indexOf('choma') >= 0 || /restaurant|kitchen|grill|bistro|eatery|pizzeria|sushi/i.test(kind); }
  // What guests book against. Your own settings once they are live; places other communities run get settings of their own so the prototype can book them.
  rsCfg(p) {
    if (!p || !p.claimedBy) return null;
    const own = (this.state.rsets || {})[p.id];
    if (own) return own.live ? own : null;
    if (this.ownedComms().some(c => c.id === p.claimedBy)) return null;
    return this.rsDemo(p);
  }
  // rsDemo(p) gives places run by other communities sample settings, so guests can book them in the prototype.

  rsetPanel(cur) {
    const S = this.state, fx = this.fx(), pid = cur.id;
    const p = fx.places.concat(fx.catPlaces || [], fx.extraPlaces || []).find(x => x.id === pid) || { name: 'this place', locality: '' };
    const saved = (S.rsets || {})[pid] || null, mine = S.rsPid === pid;
    const mode = mine && S.rsMode ? S.rsMode : (saved ? 'view' : 'edit');
    const d = (mine && S.rsd) || JSON.parse(JSON.stringify(saved || this.rsBlank()));
    const step = S.rsStep === 'wallet' ? 'wallet' : 'type', paid = d.type !== 'free';
    const GRAD = 'linear-gradient(180deg,#0C7A50 0%,#044B36 100%)', SOFT = '#E8F1ED', GREY = '#F3F4F2';
    const set = (patch) => this.setState(s => ({ rsPid: pid, rsd: Object.assign({}, (s.rsPid === pid && s.rsd) || d, patch) }));
    const num = (k, len) => (ev) => set({ [k]: String(ev.target.value || '').replace(/[^0-9]/g, '').slice(0, len || 6) });
    const txt = (k, len) => (ev) => set({ [k]: String(ev.target.value || '').slice(0, len || 60) });
    const tel = (k) => (ev) => set({ [k]: String(ev.target.value || '').replace(/[^0-9 ]/g, '').slice(0, 12) });
    const n = (v) => parseInt(v, 10) || 0, kes = (v) => 'KES ' + n(v).toLocaleString('en-US');
    const joinAnd = (a) => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
    const e1 = [];
    if (d.type === 'deposit' && !n(d.deposit)) e1.push('a deposit per guest');
    if (d.type === 'entry' && !d.cats.length) e1.push('at least one guest category with a price');
    if (!n(d.seats)) e1.push('your seating capacity');
    if (!n(d.party)) e1.push('a max party size');
    else if (n(d.seats) && n(d.party) > n(d.seats)) e1.push('a party size no bigger than your capacity');
    if (!d.days.length) e1.push('at least one active day');
    if (!d.open || !d.close || d.open === d.close) e1.push('opening and closing times');
    const walletOk = this.rsWalletOk(d);
    const save = (live) => { const rec = Object.assign({}, d, { catName: '', catAmt: '', live: !!live }); this.setState(s => ({ rsets: Object.assign({}, s.rsets, { [pid]: rec }), rsMode: 'view', rsStep: 'type', rsd: JSON.parse(JSON.stringify(rec)), rsErr: false })); this.panelTop(); };
    const cancel = () => { if (saved) { this.setState({ rsMode: 'view', rsStep: 'type', rsd: JSON.parse(JSON.stringify(saved)), rsErr: false }); this.panelTop(); } else this.panelBack(); };
    const TYPES = [['free', 'Free reservation', 'Guests book for free. You accept each request, then admit guests when they arrive.'], ['deposit', 'Deposit to confirm', 'Guests pay a deposit per guest once you accept. It comes off their final bill and cuts no-shows.'], ['entry', 'Entry fees', 'Guests pay per person by guest type, like adults, kids or residents, once you accept.']];
    const tdef = TYPES.find(x => x[0] === d.type) || TYPES[0];
    const cOk = !!String(d.catName || '').trim() && n(d.catAmt) > 0;
    const days = this.rsDays(), sv = saved || this.rsBlank();
    const chips = (k, opts, def) => opts.map(([v, label]) => { const on = String(d[k] || def) === v; return { label, on: on ? 'true' : 'false', bg: on ? GRAD : GREY, fg: on ? '#FFFFFF' : '#1F2937', onClick: () => set({ [k]: v }) }; });
    const rs = {
      isEdit: mode === 'edit', isView: mode === 'view', isType: mode === 'edit' && step === 'type', isWallet: mode === 'edit' && step === 'wallet',
      placeName: p.name, placeLine: p.name + (p.locality ? ', ' + String(p.locality).split(',')[0] : ''),
      steps: [['type', 'Reservation type', 'hgi-calendar-add-01'], ['wallet', 'Wallet details', 'hgi-wallet-02']].map(([id, label, icon]) => {
        const on = step === id, off = id === 'wallet' && !paid;
        return { label, icon, on, off, bg: on ? SOFT : GREY, fg: off ? '#8A9793' : on ? '#066349' : '#1F2937', cursor: off ? 'not-allowed' : 'pointer',
          onClick: () => { if (off || on) return; if (id === 'wallet' && e1.length) { this.setState({ rsErr: true }); return; } this.setState({ rsStep: id, rsErr: false }); this.panelTop(); } };
      }),
      types: TYPES.map(([id, label]) => { const on = d.type === id; return { label, on, bg: on ? GRAD : GREY, fg: on ? '#FFFFFF' : '#1F2937', onClick: () => set({ type: id }) }; }),
      typeNote: tdef[2], isDeposit: d.type === 'deposit', isEntry: d.type === 'entry', isPaid: paid,
      deposit: d.deposit, onDeposit: num('deposit'),
      cats: d.cats.map((c, i) => ({ label: c.name, price: kes(c.amount) + ' per head', removeAria: 'Remove ' + c.name, onRemove: () => set({ cats: d.cats.filter((x, j) => j !== i) }) })), hasCats: d.cats.length > 0,
      catName: d.catName || '', catAmt: d.catAmt || '', onCatName: txt('catName', 30), onCatAmt: num('catAmt'),
      catOff: !cOk, catBg: cOk ? SOFT : GREY, catFg: cOk ? '#066349' : '#8A9793', catAddLabel: d.cats.length ? 'Add another category' : 'Add category',
      onCatAdd: () => { if (!cOk) return; set({ cats: d.cats.concat([{ name: String(d.catName).trim(), amount: String(n(d.catAmt)) }]), catName: '', catAmt: '' }); },
      seats: d.seats, party: d.party, onSeats: num('seats', 4), onParty: num('party', 4),
      days: days.map(([id, label]) => { const on = d.days.indexOf(id) >= 0; return { label, on, bg: on ? GRAD : GREY, fg: on ? '#FFFFFF' : '#1F2937', onClick: () => set({ days: on ? d.days.filter(x => x !== id) : d.days.concat([id]) }) }; }),
      open: d.open, close: d.close, onOpenT: txt('open', 5), onCloseT: txt('close', 5),
      hoursLine: d.open && d.close && d.open !== d.close ? this.rsT12(d.open) + ' - ' + this.rsT12(d.close) + (d.close < d.open ? ', closing after midnight' : '') : 'Set an opening and a closing time',
      buffer: d.buffer, onBuffer: num('buffer', 3),
      expiryOpts: chips('expiry', [['1', '1 hour'], ['2', '2 hours'], ['6', '6 hours'], ['24', '24 hours']], '2'),
      payOpts: chips('payBy', [['1', '1 hour'], ['3', '3 hours'], ['12', '12 hours'], ['24', '24 hours']], '3'),
      closeLine: 'Confirmed guests you haven\u2019t admitted move to No show at closing time' + (d.close ? ', ' + this.rsT12(d.close) : '') + '.',
      methods: [['mpesa', 'M-Pesa', 'hgi-smart-phone-01'], ['bank', 'Bank account', 'hgi-bank']].map(([id, label, icon]) => { const on = d.method === id; return { label, icon, on, bg: on ? GRAD : GREY, fg: on ? '#FFFFFF' : '#1F2937', onClick: () => set({ method: id }) }; }),
      isMpesa: d.method === 'mpesa', isBank: d.method === 'bank',
      mpesaNo: d.mpesaNo, onMpesaNo: tel('mpesaNo'), mpesaName: d.mpesaName, onMpesaName: txt('mpesaName'),
      country: d.country, onCountry: (ev) => set({ country: ev.target.value }), billCountry: d.billCountry, onBillCountry: (ev) => set({ billCountry: ev.target.value }),
      bankName: d.bankName, onBankName: txt('bankName'), branch: d.branch, onBranch: txt('branch'), branchCode: d.branchCode, onBranchCode: txt('branchCode', 12),
      accName: d.accName, onAccName: txt('accName'), accNo: d.accNo, onAccNo: num('accNo', 20),
      swift: d.swift, onSwift: (ev) => set({ swift: String(ev.target.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) }),
      postcode: d.postcode, onPostcode: txt('postcode', 10), town: d.town, onTown: txt('town'),
      phone: d.phone, onPhone: tel('phone'),
      errLine: step === 'type' ? (e1.length ? 'Add ' + joinAnd(e1) + '.' : '') : (walletOk ? '' : d.method === 'mpesa' ? 'Add your M-Pesa number, the name on it and a phone number.' : 'Fill in every bank and billing field, and a phone number.'),
      vStatus: sv.live ? 'Live. Guests can send reservation requests to ' + p.name + '.' : 'Not live yet. Add your wallet details so guests can pay.',
      vStBg: sv.live ? SOFT : '#FFF6E5', vStFg: sv.live ? '#066349' : '#7A4A00', vStIcon: sv.live ? 'hgi-tick-02' : 'hgi-information-circle',
      vType: this.rsTypeLabel(sv.type),
      vFee: sv.type === 'deposit' ? kes(sv.deposit) + ' per guest, paid once you accept and taken off the final bill' : sv.type === 'entry' ? 'Per person by guest type, paid once you accept' : 'Guests pay nothing to book',
      vCats: sv.type === 'entry' ? sv.cats.map(c => ({ label: c.name, price: kes(c.amount) })) : [], vHasCats: sv.type === 'entry' && sv.cats.length > 0,
      vSeats: n(sv.seats) + ' guests', vParty: n(sv.party) + ' guests',
      vDays: days.filter(x => sv.days.indexOf(x[0]) >= 0).map(x => ({ label: x[1] })),
      vHours: this.rsT12(sv.open) + ' - ' + this.rsT12(sv.close), vBuffer: n(sv.buffer) ? n(sv.buffer) + ' minutes' : 'No buffer',
      vExpiry: this.rsHrs(sv.expiry || 2) + ' before the booking time', vPayBy: this.rsHrs(sv.payBy || 3) + ' after you accept', vNoShow: 'At closing time, ' + this.rsT12(sv.close),
      vPaid: sv.type !== 'free', vFree: sv.type === 'free',
      vMethod: sv.method === 'bank' ? 'Bank account' : 'M-Pesa', vMethodIcon: sv.method === 'bank' ? 'hgi-bank' : 'hgi-smart-phone-01',
      vAccount: sv.method === 'bank' ? (sv.bankName || 'Bank') + (sv.accNo ? ', account ending ' + String(sv.accNo).slice(-4) : '') : (sv.mpesaNo ? '+254 ' + sv.mpesaNo : 'Number missing') + (sv.mpesaName ? ', ' + sv.mpesaName : ''),
      vPhone: sv.phone ? '+254 ' + sv.phone : 'missing'
    };
    rs.hasErr = !!S.rsErr && !!rs.errLine;
    const live = p.name;
    const wz = mode === 'view'
      ? { hasCancel: false, hasDelete: false, hasSave: false, primaryOk: true, primaryNo: false, primaryLabel: 'Edit settings', onPrimary: () => { this.setState({ rsPid: pid, rsMode: 'edit', rsStep: 'type', rsd: JSON.parse(JSON.stringify(sv)), rsErr: false }); this.panelTop(); } }
      : step === 'type'
        ? { hasCancel: true, onCancel: cancel, hasDelete: false, hasSave: false, primaryOk: true, primaryNo: false, primaryLabel: paid ? 'Save & continue' : 'Save changes',
            onPrimary: () => {
              if (e1.length) { this.setState({ rsErr: true }); return; }
              if (paid) { this.setState({ rsStep: 'wallet', rsErr: false }); this.panelTop(); return; }
              save(true); this.say('Saved. ' + live + ' takes free reservation requests now.');
            } }
        : { hasCancel: true, onCancel: cancel, hasDelete: false, hasSave: true,
            onSave: () => { save(walletOk); this.panelBack(); this.say(walletOk ? 'Saved. ' + live + ' takes reservation requests now.' : 'Saved. Finish your wallet details before guests can pay.'); },
            primaryOk: true, primaryNo: false, primaryLabel: 'Save changes',
            onPrimary: () => { if (!walletOk) { this.setState({ rsErr: true }); return; } save(true); this.say('Saved. ' + live + ' takes reservation requests now, and payouts go to your ' + (d.method === 'bank' ? 'bank account.' : 'M-Pesa.')); } };
    return { has: true, isRset: true, title: 'Reservation settings', headTitle: 'Reservation settings', canShare: false, canSave: false, hasFooter: false, hasFloat: false, hasFab: false, hasHostBar: false, isPlace: false, hasWz: true, wz, rs };
  }

  // panelVals(): the panel on top of the stack
    if (cur.kind === 'rset') Object.assign(pn, this.rsetPanel(cur));

  // Dashboard, the chip on each Places card
  rqStat(p) {
    const go = (f) => () => { this.setState({ ccOpen: false }); this.open('place', p.id); f(); };
    if (!(this.state.rsets || {})[p.id]) return { label: 'Set up reservations', n: '', alert: false, onClick: go(() => this.openRset(p.id)) };
    const reqs = this.rqAll(p.id).filter(r => r.st === 'request'), t = this.rqIso(this.rqDate(0));
    return { label: 'Reservation requests', n: String(reqs.length), alert: reqs.length > 0, onClick: go(() => this.openRq(p.id, 'request', reqs.length ? reqs.map(r => r.iso).sort()[0] : t)) };
  }

  // Reservations panel
  rslPanel(cur) {
    // ...
      placeLine: p.name + (p.locality ? ', ' + String(p.locality).split(',')[0] : ''), notLive: !!rset && !rset.live, onFinish: () => this.openRset(pid),
    // ...
    const hoA = { label: 'Hold off reservations', icon: 'hgi-stop-circle', onClick: () => { this.setState({ rqhd: { mode: 'pause', from: '', to: '', note: '' } }); this.push('rshold', pid); } };
    const hoB = { label: 'Reservation settings', icon: 'hgi-settings-02', onClick: () => this.openRset(pid) };
    // ...
  }

  // Claim page, each place of an approved claim
    const places = this.clPlaces(c).map(p => ({ name: p.name, locality: String(p.locality || '').split(',')[0], img: p.img || '', hasImg: !!p.img, noImg: !p.img, initial: String(p.name || '?').charAt(0), canOpen: !!p.exists, onOpen: () => { if (p.exists) this.push('place', p.id); },
      canSetup: isOk && !!p.exists, setupLabel: (S.rsets || {})[p.id] ? 'Reservation settings' : 'Set up reservations', onSetup: () => this.openRset(p.id) }));
    // ...
    const wz = c.status === 'more' ? W('Add documents', () => this.openClaimDocs(c.id))
      : c.status === 'rejected' ? W('Start a new claim', () => this.openClaim(null, c.id))
      : isOk && places.length === 1 && places[0].canSetup ? W(places[0].setupLabel, places[0].onSetup)
      : W('Done', () => this.leaveTop());

  // Place page, the owner card
      const ownsP = !!owner && this.ownedComms().some(c => c.id === owner.id), ow = ownsP && (S.rsets || {})[p.id] ? this.rqOwnVals(p.id) : { on: false };
      // ...
        isMyPlace: ownsP, ow, myPlaceTitle: owner ? 'You manage this place through ' + owner.name : '', rsLine: this.rsLine(p.id), rsBtn: (this.state.rsets || {})[p.id] ? 'Reservation settings' : 'Set up reservations', onRset: () => this.openRset(p.id),

  push(kind, id) {
    this.setState(s => ({ pstack: (s.pstack || []).concat([{ kind, id }]), aiBrief: null, rsvDay: 0, rsvTime: null, rsvEdit: null, psec: null, hoTab: null, hoDlEdit: false, hoGs: false, hoGq: '', hoGv: 'guests', tixView: 'stack', tixSel: null, hoursOpen: false, expDay: 'all', aboutMore: false, aboutOver: false, mineIdx: 0, daysAll: false, gal: null, nowIdx: 0, upWeek: null, upDay: null, galLeft: false, galRight: true, tixIdx: 0 }));
    this.panelTop();
  }

  panelBack = () => { this.setState(s => ({ pstack: (s.pstack || []).slice(0, -1), aiBrief: null, rsvDay: 0, rsvTime: null, rsvEdit: null, psec: null, hoTab: null, hoDlEdit: false, hoGs: false, hoGq: '', hoGv: 'guests', tixView: 'stack', tixSel: null, hoursOpen: false, expDay: 'all', aboutMore: false, aboutOver: false, mineIdx: 0, daysAll: false, gal: null, nowIdx: 0, upWeek: null, upDay: null, galLeft: false, galRight: true, tixIdx: 0 })); this.panelTop(); };

  panelTop() { setTimeout(() => { const b = typeof document !== 'undefined' && document.querySelector('[data-panel-body]'); if (b) b.scrollTop = 0; }, 0); }

  say(m) {
    if (this._t) clearTimeout(this._t);
    this.setState({ toast: m });
    this._t = setTimeout(() => this.setState({ toast: null }), 4200);
  }
```
