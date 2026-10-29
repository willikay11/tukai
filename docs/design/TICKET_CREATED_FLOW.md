# Handoff: Tickets created drawer

## Overview
On the Dashboard, every card under **My experiences (hosting)** has a row of stat chips. **Tickets created {n}** opens that experience in the side panel, in host mode, on its **Tickets created** tab. **Sold** and **Total sales** open the same panel on the Sales tab.

The tab lists each ticket type the host set up, with its sales so far, and lets them share, pause, resume or edit it. It also holds the experience's sales deadline and its discount codes.

The panel is the one shared by the app: a drawer from the right on desktop, and a bottom sheet on screens narrower than 720px.

Covered here:
- The panel frame, header, host tab row and action bar, as they look on this tab.
- The Tickets created tab.
- **Edit ticket details** and **Generate discount code** (or **Edit discount code**), which open on top of it.
- The "Discount code generated successfully" dialog.

Out of scope:
- The Dashboard card and its chips (`design_handoff_dashboard`).
- The other host tabs: About, Sales, Invited guests, Moments and Analytics.
- Create experience (`design_handoff_create_experience`), where ticket types, prices and the fee allocation are first set.
- Create another ticket, Message all buyers and Redemptions. They only show a toast in the prototype (Open items 5).

## About the design
This is a **design reference** from the HTML prototype (`Tukai Web.dc.html`), not production code. Recreate it in Tukai's codebase with its existing framework, components and panel. The exact markup and logic are at the end of this file, so it needs nothing else.

## Fidelity
**High fidelity.** Build it pixel-perfect. All values are CSS pixels at 1x, and every font is Google Sans. Icons are Hugeicons, twotone unless marked bulk. Every control is a native `<button>` or `<input>`, and none is shorter than 44px. Amounts, counts and names are sample data.

## Anatomy
1. **Panel header:** the experience title, then Share, Save and Close.
2. **Host tab row:** About, Sales, Tickets created, Invited guests, Moments, Analytics.
3. **Tickets on sale:** one block per ticket type, with a heading, a ticket stub, a stats grid and actions.
4. **Paused tickets:** the same blocks, greyed out, under their own heading. Only shown when one is paused.
5. **Sales deadline:** when ticket sales close, with an inline editor.
6. **Discount codes:** an intro line, Generate discount code, and one block per code.
7. **Action bar:** Message all buyers and Create another ticket.

## Panel frame
```css
/* Panel: role="dialog", aria-label is the panel title, aria-hidden when closed */
position: fixed; z-index: 60; display: flex; flex-direction: column;
background: #FFFFFF; overflow: hidden;

/* Desktop, viewport 720px or wider: right drawer */
top: 0; right: 0; bottom: 0; width: min(640px, 100vw);   /* drawerWidth prop: Narrow 560, Medium 640 (default), Wide 760 */
border-radius: 0;
box-shadow: -6px 0 24px rgba(1,51,52,.08);   /* none when closed */
transform: translateX(104%);                 /* closed; translate(0, 0) when open */

/* Below 720px: bottom sheet above the 69px bottom navigation */
left: 0; right: 0; bottom: calc(69px + env(safe-area-inset-bottom));
height: calc(92dvh - 69px - env(safe-area-inset-bottom));
border-radius: 18px 18px 0 0;
box-shadow: 0 -12px 40px rgba(1,51,52,.18);
transform: translateY(calc(100% + 96px));    /* closed */
/* grabber, sheet only */ width: 40px; height: 5px; border-radius: 999px; background: #DDE3DF; margin: 8px auto 0;

/* Motion */
/* open  */ transition: transform 1s cubic-bezier(.22,.8,.24,1), box-shadow 1s ease;
/* close */ transition: transform 1s cubic-bezier(.45,0,.2,1), box-shadow 1s ease;
pointer-events: none;   /* while closed */
```
There is no scrim. The Dashboard stays visible and clickable beside the drawer.

```css
/* Header */
flex: 0 0 auto; display: flex; align-items: center; gap: 8px; height: 68px; padding: 0 16px;
border-bottom: 1px solid #EDF0EE;
/* title wrapper */ flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; padding: 0 6px;
/* title */ font-size: 24px; font-weight: 700; letter-spacing: -.4px; color: #1F2937; one line, ellipsis

/* Header buttons: 44 × 44, border 0, radius 999, background #F3F4F2, icon 20px */
/* Back */  color: #066349; hgi-twotone hgi-arrow-left-01; hover #E8F1ED; aria-label "Back"
/* Share */ color: #066349; hgi-twotone hgi-share-08; hover #E8F1ED; aria-label "Share"
/* Save */  color: #066349; hgi-bulk hgi-shopping-basket-add-02; hover #E8F1ED; aria-pressed="false"
/* Save, saved */ background: #B0E800; color: #013334; hgi-bulk hgi-shopping-basket-done-02; hover #A3D900; aria-pressed="true"
/* Close */ color: #E02D3C; hgi-twotone hgi-cancel-01; hover #FEF3F2; aria-label "Close"

/* Body: the part that scrolls */
flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
/* inner */ padding: 20px 24px 36px; display: flex; flex-direction: column; gap: 28px;
/* full-bleed divider */ flex: 0 0 auto; height: 1px; margin: 0 -24px; background: #E5E7EB;
```
| Panel | Left of the title | Title | Right of the title |
|---|---|---|---|
| Experience, host mode | Nothing | The experience title, for example "Satima Hike via Dragon’s Teeth Route" | Share, Save, Close |
| Edit ticket details | Back | "Edit ticket details" | Close |
| Discount code | Back | "Generate discount code" or "Edit discount code" | Close |

- **Share** toasts "Link copied." **Save** is the bucket list save from the guest view (Open items 3).
- **Spacing:** every block below is a direct child of the inner wrapper, so blocks sit 28px apart. A full-bleed divider follows each ticket block and the Sales deadline.
- **Content width** = panel width - 48: 592 at the default 640, 512 at Narrow, 712 at Wide, and the viewport minus 48 on the sheet (342 at 390).

## 1. Host tab row
```css
/* <nav aria-label="Sections">, sticky at the top of the body */
position: sticky; top: 0; z-index: 3; display: flex; align-items: center; gap: 8px;
margin: -20px -24px -12px; padding: 12px 24px; background: #FFFFFF; overflow-x: auto; scrollbar-width: none;

/* Tab: <button aria-current="true|false"> */
display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; height: 44px; padding: 0 18px 0 12px;
border: 0; border-radius: 999px; font-size: 14.5px; font-weight: 500; white-space: nowrap;
/* selected */   background: #A7F3D0; color: #066349;   icon bulk, #066349
/* unselected */ background: #F3F4F2; color: #1F2937;   icon twotone, #1F2937
/* hover */      filter: brightness(.97);
/* active */     transform: scale(.98);
/* icon */       21px, before the label
```
| Tab | Icon |
|---|---|
| About | `hgi-information-circle` |
| Sales | `hgi-credit-card-pos` |
| Tickets created | `hgi-ticket-02` |
| Invited guests | `hgi-user-add-02` |
| Moments | `hgi-dashboard-circle` |
| Analytics | `hgi-pie-chart-06` |

- **Spacing:** the negative bottom margin puts the first block 28px under the tabs.
- **Overflow:** the six tabs are wider than every drawer width, so the row scrolls sideways. Tickets created, the third tab, is always in view.
- **Picking a tab:** closes the deadline editor, clears the guest and buyer searches, and scrolls the body to the top.

## 2. Ticket type block
One per ticket type, in the order they were set up.

```css
/* Block */ display: flex; flex-direction: column; gap: 14px;

/* Heading row */ display: flex; align-items: flex-start; gap: 12px;
/* icon */ hgi-twotone hgi-ticket-01, 24px, margin-top 2px, <icon>
/* h3 */   margin: 0; min-width: 0; font-size: 20px; font-weight: 700; line-height: 1.3; letter-spacing: -.3px; color: <text>; text-wrap: pretty;

/* Ticket stub */
display: flex; align-items: center; border: 1.5px dashed <border>; border-radius: 14px; background: <stub>;
/* QR cell */      flex: 0 0 auto; padding: 12px 14px 12px 12px;
/* QR */           width: 64px; height: 64px; border-radius: 8px; background: #FFFFFF; opacity: <qr>;   alt "Code for {name}"
/* perforation */  flex: 0 0 auto; align-self: stretch; width: 0; margin: 12px 0; border-left: 1.5px dashed <border>;   aria-hidden
/* fields */       flex: 1 1 auto; min-width: 0; display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr) minmax(0,.7fr);
                   gap: 6px 14px; padding: 10px 4px 10px 16px;
/* field */        display: flex; flex-direction: column; gap: 3px; min-width: 0;
/* value */        font-size: 16px; font-weight: 700; color: <text>;   name: one line, ellipsis; price: no wrap
/* label */        font-size: 13px; color: #5B6B66;
/* share */        flex: 0 0 auto; width: 44px; height: 44px; margin-right: 8px; border: 0; border-radius: 999px; background: transparent;
                   color: <share>; hgi-twotone hgi-share-08 20px; aria-label "Share {name}"
/* share hover */  background: rgba(255,255,255,.7);

/* Stats grid: the 2px gaps show the white panel between cells */
display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; border-radius: 12px; overflow: hidden;
/* cell */  min-width: 0; display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; background: #F3F4F2;
/* label */ font-size: 13.5px; line-height: 1.35; color: #5B6B66;
/* value */ font-size: 16px; font-weight: 600; line-height: 1.35; color: <text>; overflow-wrap: anywhere;
/* last cell */ grid-column: 1 / -1;

/* Actions */
display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 4px 6px; margin-top: -4px;
/* action */ display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 10px; border: 0; border-radius: 999px;
             background: transparent; font-size: 15px; font-weight: 500; white-space: nowrap;   icon 20px, before the label
/* separator dot, aria-hidden */ flex: 0 0 auto; width: 5px; height: 5px; border-radius: 999px; background: #60A5FA;
```
| Part | On sale | Paused |
|---|---|---|
| `<text>` | `#1F2937` | `#5B6B66` |
| `<icon>` | `#066349` | `#8A9793` |
| `<stub>` | `linear-gradient(180deg,#EFF6FF 0%,#DBEAFE 100%)` | `#F3F4F2` |
| `<border>` | `#BFDBFE` | `#C9D3CE` |
| `<qr>` | `1` | `.45` |
| `<share>` | `#066349` | `#8A9793` |

**Stub fields:** "Ticket name", "Amount per ticket" ("KES 4,500" or "Free") and "Quantity".

**Stats grid**, three per row:

| Cell | Value |
|---|---|
| Ticket currency | "Kenya shillings" or "US dollars" |
| Tickets created | The ticket type's quantity |
| Amount per ticket | "KES 4,500" or "Free" |
| Tickets sold | Count |
| Amount sold | Tickets sold × the price they paid, "KES 112,500" |
| Available tickets | Quantity - tickets sold |
| Estimated sales expiry | The sales close time, "Fri 23 Oct, 7:00 AM". Full row |
| Ticket sales (paused only, replaces the cell above) | "Paused". Full row |

**Actions**

| State | Actions |
|---|---|
| On sale | **Pause ticket sales** (`#E02D3C`, hover `#FEF3F2`, inline stop icon), dot, **Edit ticket** (`#066349`, hover `#E8F1ED`, `hgi-edit-04`) |
| Paused | **Resume ticket sales** (`#066349`, hover `#E8F1ED`, inline play icon) |

## 3. Paused tickets
- **When:** at least one ticket type is paused. It comes after every ticket on sale.
- **Heading:** an `<h3>` "Paused tickets". `margin: 0 0 -14px; font-size: 15px; font-weight: 600; color: #5B6B66`. The negative margin brings the first paused block 14px under it.
- **Blocks:** the ticket type block with the Paused colours. Paused tickets can't be edited, so only Resume shows.

## 4. Sales deadline
```css
/* Block */ display: flex; flex-direction: column; gap: 12px;
/* Title row */ display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 16px;
/* h3 */   margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.2px; color: #1F2937;   "Sales deadline"
/* hint, inside the h3 */ font-size: 14.5px; font-weight: 400; letter-spacing: 0; color: #5B6B66;   "(ticket sales close automatically at this time)"
/* Edit */ the action style, #066349, hgi-edit-04, hover #E8F1ED. Hidden while editing

/* View */      display: flex; flex-direction: column; gap: 2px; margin-top: -6px;
/* option */    font-size: 15px; color: #1F2937;
/* when line */ font-size: 13.5px; color: #5B6B66;

/* Editor: role="radiogroup" aria-label="Sales deadline" */
display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
/* option: role="radio" aria-checked */ min-height: 48px; padding: 10px 20px; border: 0; border-radius: 999px; font-size: 15px; text-align: left;
/* selected */ background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF;
/* other */    background: #F3F4F2; color: #1F2937;
/* active */   transform: scale(.98);

/* Editor buttons */ display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 4px;
/* Cancel */       height: 48px; padding: 0 6px; border: 0; background: transparent; font-size: 15px; font-weight: 500; color: #E02D3C;   hover underline
/* Save changes */ height: 48px; padding: 0 24px; border: 0; border-radius: 999px; background: #B0E800; color: #013334; font-size: 15px; font-weight: 600;
                   hover #A3D900; active transform: scale(.97)
```
| Option | Sales close |
|---|---|
| 1 hour before the experience starts | On the day, 60 minutes before the start time |
| 1 hour before the experience ends | On the day, 60 minutes before the end time |
| 1 day before the experience starts | The day before, at the start time. The default |

- **When line:** "Sales close {Ddd D Mon}, {h:mm AM}." Recurring experiences end with " for the next date." instead of the full stop.
- **Scope:** one setting for the whole experience. It also fills the last stat cell of every ticket on sale.
- **Editing:** Edit opens the options with the current one selected. Picking an option only changes the draft. Cancel, or changing tab, drops it. Save changes stores it and toasts "Ticket sales now close {Ddd D Mon}, {h:mm AM}."

## 5. Discount codes
```css
/* Block */ display: flex; flex-direction: column; gap: 8px;
/* Title row */ as Sales deadline, with the h3 "Discount codes"
/* Generate discount code */ the action style, #066349, hgi-discount-tag-02, hover #E8F1ED
/* intro */ margin: -4px 0 0; font-size: 15px; line-height: 1.5; color: #5B6B66; text-wrap: pretty;

/* Code */ display: flex; flex-direction: column; gap: 12px; margin-top: 12px;
/* header row */ display: flex; align-items: center; gap: 12px;
/* icon */ hgi-twotone hgi-discount-tag-02, 24px, #066349 (paused #8A9793)
/* h4 */   margin: 0; flex: 1 1 auto; min-width: 0; font-size: 20px; font-weight: 700; letter-spacing: .02em; overflow-wrap: anywhere;
           color: #1F2937 (paused #5B6B66)
/* Paused pill */ flex: 0 0 auto; display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px;
                  background: #F3F4F2; font-size: 13px; font-weight: 600; color: #5B6B66;
/* share */ 44 × 44, radius 999, transparent, the icon colour, hgi-twotone hgi-share-08 20px, hover #E8F1ED; aria-label "Share {code}"
/* stats */ the stats grid, with three cells and no full-row cell
/* actions */ the action row
```
- **Intro:** "Generate discount codes to help promote this experience."
- **Stats:** Discount type ("Fixed amount" or "Percentage"), Amount ("KES 500" or "10%"), Redeemed ("32 times", "1 time").
- **Actions:** **Redemptions** (`hgi-chart-line-data-01`, `#066349`), dot, **Pause code** (`hgi-stop-circle`, `#E02D3C`, hover `#FEF3F2`) or **Resume code** (`hgi-play`, `#066349`), dot, **Edit code** (`hgi-edit-04`, `#066349`). Unlike tickets, Edit code shows in both states.
- **Empty:** with no codes, only the title row and intro show.

## 6. Action bar
```css
flex: 0 0 auto; display: flex; align-items: center; flex-wrap: wrap; gap: 10px; min-height: 88px;
padding: 18px 24px calc(18px + env(safe-area-inset-bottom)); border-top: 1px solid #EDF0EE; background: #FFFFFF;

/* Both buttons */
display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 48px; padding: 0 24px;
border: 0; border-radius: 999px; font-size: 15px; font-weight: 600; white-space: nowrap;   icon 20px twotone, before the label
/* active */ transform: scale(.97);

/* Message all buyers */ background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF;   hgi-message-multiple-01
/* hover */ filter: brightness(1.04); box-shadow: 0 6px 16px rgba(1,51,52,.16);
/* transition */ transform .18s ease, box-shadow .2s ease, filter .2s ease;

/* Create another ticket */ background: #B0E800; color: #013334;   hgi-ticket-01
/* hover */ background: #A3D900; box-shadow: 0 6px 16px rgba(176,232,0,.4);
/* transition */ transform .18s ease, box-shadow .2s ease, background .2s ease;
```
The buttons sit at the start of the bar and change with the tab. These two are the Tickets created pair.

## 7. Edit ticket details
Opens on top of the experience from **Edit ticket**.

1. **Summary:** the ticket's heading row (icon always `#066349`, the name as it was before editing) and its stats grid. The last cell is always Estimated sales expiry.
2. A full-bleed divider.
3. **Edit details:** the h3, the fields, the summary box, Fees allocation, then any error or note.

```css
/* Edit details */ display: flex; flex-direction: column; gap: 14px;
/* h3 */ margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.2px; color: #1F2937;   "Edit details"
/* field */ display: flex; flex-direction: column; gap: 6px; min-width: 0;
/* label */ font-size: 13.5px; color: #5B6B66;
/* input */ width: 100%; box-sizing: border-box; height: 56px; padding: 0 16px; border: 1px solid #DDE3DF; border-radius: 12px;
            background: #FFFFFF; font-size: 15px; color: #1F2937; outline: none;
/* focus */ border-color: #066349; box-shadow: 0 0 0 3px #E8F1ED;
/* trailing icon */ position: absolute; right: 16px; top: 50%; transform: translateY(-50%); 21px; #1F2937; pointer-events: none;
                    /* the input gets padding-right: 52px */
/* currency prefix */ position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 15px; color: #5B6B66;
                      /* the amount input gets padding-left: 56px */
/* amount and quantity row */ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 10px;

/* Summary box */
display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; padding: 12px 16px;
border: 1.5px dashed #DDE3DF; border-radius: 12px; background: #F7F8F7; font-size: 14.5px; line-height: 1.5; color: #1F2937;
/* amounts */ font-weight: 700;
/* dot between, aria-hidden */ 5 × 5, radius 999, #60A5FA

/* Fees allocation */ display: flex; flex-direction: column; gap: 10px;
/* title */ font-size: 15px; font-weight: 600; color: #1F2937;   /* hint */ font-weight: 400; color: #5B6B66;
/* group: role="radiogroup" aria-disabled="true" */ display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
/* option: role="radio", disabled */
display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 22px 0 16px; border: 0; border-radius: 999px;
font-size: 15px; font-weight: 500; text-align: left; cursor: not-allowed;   icon 19px
/* chosen */ background: #E8F1ED; box-shadow: inset 0 0 0 1px #A9CBBB; color: #044B36;   hgi-bulk hgi-checkmark-circle-02
/* other */  background: #F7F8F7; box-shadow: inset 0 0 0 1px #EDF0EE; color: #9AA5A0;   hgi-twotone hgi-circle
/* lock line */ display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; line-height: 1.45; color: #5B6B66;
                /* icon */ hgi-twotone hgi-square-lock-02, 17px, margin-top 1px

/* Error: role="alert" */ font-size: 13.5px; line-height: 1.45; color: #E02D3C;
/* Note */ margin: 0; display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; line-height: 1.5; color: #3C4A45;
           /* icon */ hgi-twotone hgi-information-circle, 18px, margin-top 1px, #066349
```
| Field | Shown | Label | Input |
|---|---|---|---|
| Ticket name | Always | "Ticket name" | Placeholder "Ticket name, e.g. VIP, Early bird, Locals". `hgi-ticket-01` on the right. Up to 60 characters |
| Amount per ticket | Paid tickets | "Amount per ticket" | Currency code on the left, `hgi-money-01` on the right. Digits only, up to 9, shown with en-US grouping as you type |
| Quantity | Always | "Number of tickets", or "Number of spaces" for free tickets | Placeholder "0". Digits only, up to 6 |

- **Summary box:** paid tickets with an amount and a quantity. "All tickets cost: {CUR} {amount × quantity}", dot, "What the customer sees: {CUR} {amount × fee multiplier}". Both with 2 decimals, for example "KES 4,680.00".
- **Fees allocation:** paid tickets only, and locked. Title "Fees allocation" with the hint "(who pays Tukai’s commission?)". Options "I will pay the full commission", "Customer pays the commission" (default) and "Split 50-50 between the customer and me". Lock line: "Set when the experience was created. It cannot change once tickets are on sale."
- **Fee multiplier:** the rate is 8% for a verified business, otherwise 4%. Host pays: × 1. Customer pays: × (1 + rate / 100). Split: × (1 + rate / 200).
- **Free tickets:** no amount, summary box or fees allocation. A ticket can't switch between free and paid here.

**Validation** runs as the person types. The first failing rule shows:

| Rule | Message |
|---|---|
| Name empty | "Give the ticket a name." |
| Paid, amount empty or 0 | "Enter an amount per ticket." |
| Quantity empty or 0 | "Enter how many tickets to sell." |
| Quantity below tickets sold | "{sold} tickets are already sold, so the quantity cannot go below {sold}." |

**Notes** show when there's no error, joined into one paragraph:
- **New price, with sales:** "New buyers pay {CUR} {amount}. The {n} people who already bought keep the price they paid." With one sale, "person".
- **New price, no sales:** "Buyers pay {CUR} {amount} from now on."
- **New quantity:** "Available tickets go from {before} to {after}."

**Footer** (shared with the discount code drawer)
```css
flex: 0 0 auto; display: flex; align-items: center; flex-wrap: wrap; gap: 10px; min-height: 88px;
padding: 18px 24px calc(18px + env(safe-area-inset-bottom)); border-top: 1px solid #EDF0EE; background: #FFFFFF;
/* Cancel, left */ height: 48px; padding: 0 6px; border: 0; background: transparent; font-size: 15px; font-weight: 500; color: #E02D3C;   hover underline
/* spacer */ flex: 1 1 auto;
/* Primary, right */ height: 48px; padding: 0 24px; border: 0; border-radius: 999px; background: #B0E800; color: #013334;
                     font-size: 15px; font-weight: 600; white-space: nowrap; transition: background .2s ease, box-shadow .2s ease;
/* hover */  background: #A3D900; box-shadow: 0 6px 16px rgba(176,232,0,.4);
/* active */ transform: scale(.97);
/* disabled: disabled + aria-disabled="true" */ background: #E4F4B5; color: #5E7A45; cursor: not-allowed;
```
- **Save changes:** enabled when there's no error and something changed. It saves, goes back to Tickets created and toasts "Changes to {name} are saved."
- **Discarding:** Cancel and Back go back to Tickets created, Close shuts the panel. None of them ask first.

## 8. Generate or edit a discount code
Opens on top of the experience. **Generate discount code** starts empty, **Edit code** starts filled.

1. **Discount code:** the label "Discount code" with the hint "(not more than 10 characters)", the input, and any error under it.
2. A full-bleed divider in `#EDF0EE`.
3. **Discount value:** the label and two pills.
4. **Value:** the label, the input with an icon, and a note.

```css
/* Field block */ display: flex; flex-direction: column; gap: 10px;
/* label */ font-size: 15px; font-weight: 600; color: #1F2937;   /* hint */ font-weight: 400; color: #5B6B66;
/* input */ the Edit ticket input. The code input adds letter-spacing: .03em. The value input has padding: 0 56px 0 16px
/* value icon */ position: absolute; right: 4px; top: 4px; width: 44px; height: 44px; centred; icon 22px twotone #1F2937; pointer-events: none;
/* error: role="alert" */ font-size: 13.5px; color: #E02D3C;
/* note */ font-size: 13.5px; color: #5B6B66;

/* Pills: role="radiogroup" aria-labelledby the "Discount value" label */ display: flex; flex-wrap: wrap; gap: 8px;
/* pill: role="radio" aria-checked */ height: 48px; padding: 0 22px; border: 0; border-radius: 999px; font-size: 15px; font-weight: 500; white-space: nowrap;
/* selected */ background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF;
/* other */    background: #F3F4F2; color: #1F2937;
/* active */   transform: scale(.98);
```
| | Fixed amount | Percentage (%) |
|---|---|---|
| Label | "Enter amount to discount" | "Enter percentage to discount" |
| Placeholder | "Enter amount" | "Enter percentage" |
| Icon | `hgi-money-remove-01` | `hgi-percent` |
| Note | "In Kenya shillings, taken off each ticket." ("US dollars" for USD) | "Taken off the ticket price." |

- **Code input:** placeholder "Enter discount code e.g. TRVL2026". Typing is uppercased, and anything but A to Z and 0 to 9 is dropped. Up to 10 characters.
- **Value input:** digits and dots only, up to 8 characters. Switching the pill empties it.
- **Errors**, under the code field: "You already have a code called {code}." for a duplicate (the code being edited doesn't count), and "A percentage discount can’t be more than 100%."
- **Primary:** "Generate discount code", or "Save changes" when editing. Enabled when the code has at least 3 characters, there's no error and the value is above 0.
- **Generate:** adds the code with 0 redemptions at the end of the list, goes back to Tickets created and opens the dialog below.
- **Save changes:** updates the code in place, keeping its redemptions and paused state, goes back and toasts "Changes to {code} are saved."
- **Cancel, Back and Close:** as in Edit ticket.

## 9. Code generated dialog
```css
/* Layer */ position: fixed; inset: 0; z-index: 95; display: flex; align-items: center; justify-content: center; padding: 24px;
/* Scrim: closes the dialog */ position: absolute; inset: 0; background: rgba(1,51,52,.42);
/* Dialog: role="alertdialog" aria-modal="true", labelled by the title, described by the text */
position: relative; width: 100%; max-width: 420px; padding: 24px; border-radius: 18px; background: #FFFFFF;
box-shadow: 0 24px 60px rgba(1,51,52,.24); display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center;
/* image */ width: 100%; max-width: 240px; height: auto;   assets/discount-code-success.png, alt ""
/* text */  display: flex; flex-direction: column; gap: 8px;
/* h2 */    margin: 0; font-size: 21px; font-weight: 700; line-height: 1.3; letter-spacing: -.3px; color: #1F2937;
/* p */     margin: 0; font-size: 15px; line-height: 1.55; color: #5B6B66;   /* the code */ font-weight: 700; color: #1F2937;
/* Complete */ align-self: stretch; height: 48px; border: 0; border-radius: 999px; background: #B0E800; color: #013334;
               font-size: 15px; font-weight: 600; hover #A3D900; active transform: scale(.98)
```
- **Title:** "Discount code generated successfully"
- **Text:** "Your discount code **{CODE}** was generated successfully. You can now share it with customers."
- **Complete**, or a tap on the scrim, closes it.

## Behaviour
1. **Opening from the Dashboard:** the chip closes the account menu if it's open, opens the panel with this experience (replacing anything already in it), switches to Tickets created and scrolls the body to the top.
2. **Other ways in:** opening the experience from anywhere else lands on About. The tab resets whenever a panel opens, or one is added or removed on top. The two drawers set it back to Tickets created when they close.
3. **Share a ticket:** copies the link to buy that ticket type.
4. **Pause ticket sales:** takes effect straight away, with no confirmation. The block moves under Paused tickets, and people who already bought keep their tickets.
5. **Resume ticket sales:** the block goes back to its place among the tickets on sale.
6. **Pause and Resume code:** take effect straight away. A paused code can't be used.
7. **Toasts:** one at a time. Each lasts 4.2s, and a new one replaces the last.

## Copy
| Trigger | Toast |
|---|---|
| Share a ticket | "Link to buy {name} copied." When paused: "{name} is paused. Resume sales to share it." |
| Pause ticket sales | "Sales paused for {name}. People who already bought keep their tickets." |
| Resume ticket sales | "Sales resumed for {name}." |
| Save the sales deadline | "Ticket sales now close {Ddd D Mon}, {h:mm AM}." |
| Save a ticket | "Changes to {name} are saved." |
| Share a code | "{code} copied. Share it with your community." When paused: "{code} is paused. Resume it to share it." |
| Redemptions | "{code} has been used {n} times." ("1 time."), or "No one has used {code} yet." |
| Pause code | "{code} is paused. It can’t be used until you resume it." |
| Resume code | "{code} can be used again." |
| Save a code | "Changes to {code} are saved." |
| Message all buyers | "Write one message to all {n} buyers. It arrives in their Tukai inbox." With no sales: "No one has bought a ticket yet. You can message buyers once sales start." |
| Create another ticket | "Add a new ticket type with its own name, price and quantity." |
| Share, in the header | "Link copied." |

## Data
```ts
type TicketType = { name: string; amount: number; qty: number };   // amount 0 means free
type HostTicket = TicketType & { sold: number; paused: boolean };   // sold is never above qty
type SalesDeadline = '1h-start' | '1h-end' | '1d-start';            // one per experience, default '1d-start'
type FeeAllocation = 'host' | 'customer' | 'split';                 // set in Create experience, read-only here
type DiscountCode = { code: string; type: 'fixed' | 'pct'; value: number; redeemed: number; paused?: boolean };
```
- **Currency:** each experience is in KES or USD.
- **Money:** "{CUR} {n}" with en-US grouping and no decimals, except the Edit ticket summary box, which has 2.
- **Amount sold:** uses the price each buyer paid. A new price only applies to new buyers.
- **Dates:** "{Ddd D Mon}, {h:mm AM}", for example "Fri 23 Oct, 7:00 AM".

**Sample data**
- **Hosted experiences:** Satima Hike via Dragon’s Teeth Route (KES 4,500), Poetry evening in the garden (KES 800), Silent book club (free) and Kinangop plateau ridge walk (KES 3,800).
- **Ticket types:** paid experiences get "Adults" at the listed price, plus "Kids under 12" at 60% where children can come, each with 20 to 79 tickets. Free ones get "General admission" with 30 to 69 spaces. The Buy now, pay later option isn't a ticket type and doesn't show.
- **Sold:** 35% to 79% of each quantity. Experiences published during the session start with 0 sold and no codes.
- **Codes:** one, TRVL2024, a fixed KES 500 that has been redeemed 32 times.

**State in the prototype**

| Key | Holds |
|---|---|
| `hoTab` | The host tab. null means About |
| `hoPaused` | Paused ticket types, by experience id and ticket index |
| `hoTkEd` | Saved ticket edits (`name`, `amount`, `qty`), by experience id and ticket index |
| `hoDl` | The sales deadline, by experience id |
| `hoDlEdit`, `hoDlDraft` | Whether the deadline editor is open, and the option picked in it |
| `dcCodes` | Discount codes, by experience id |
| `tkeForm`, `dcForm` | The two drawer forms |
| `dcOk` | The code shown in the dialog |

## Accessibility
- **Panels:** `role="dialog"` labelled with the panel title. The code dialog is `role="alertdialog"` and `aria-modal`.
- **Tabs:** a `nav` of buttons with `aria-current`. Build them as a `tablist` of `tab`s with `aria-selected`, a `tabpanel` and arrow keys.
- **Radio groups:** the deadline options and the discount pills are `radiogroup`s of `radio` buttons with `aria-checked`. Add arrow keys in the build.
- **Fees allocation:** the options are disabled and the group is `aria-disabled`. The lock line explains why.
- **Inputs:** each has a `<label for>`. Amount and quantity use `inputMode="numeric"`, the discount value `inputmode="decimal"`.
- **Errors:** `role="alert"`. They change while the person types, so screen readers announce every change. Consider announcing them only when Save is tried.
- **Labels:** share buttons read "Share {name}" or "Share {code}". QR images read "Code for {name}". Icons and separator dots are `aria-hidden`.
- **Focus:** the prototype doesn't move it. Move focus into each drawer when it opens, back to the button that opened it on Back, and trap it inside the dialog.
- **Targets:** all 44px or taller. Inputs are 56px, footer and dialog buttons 48px.

## Tokens used
| Value | Where |
|---|---|
| `#FFFFFF` | Panel, bars, inputs, QR background |
| `#F3F4F2` | Stat cells, header buttons, unselected tabs, options and pills, paused stub, Paused pill |
| `#A7F3D0`, `#066349` | Selected tab |
| `#066349` | Green actions, icons, input focus border |
| `#E8F1ED` | Green action hover, input focus ring, chosen fee option |
| `#E02D3C`, `#FEF3F2` | Pause actions, Cancel, Close, errors, and their hover |
| `linear-gradient(180deg,#EFF6FF 0%,#DBEAFE 100%)`, `#BFDBFE` | Ticket stub on sale |
| `#C9D3CE` | Paused stub border |
| `#8A9793` | Paused icons |
| `#60A5FA` | Separator dots |
| `#E5E7EB` | Section dividers |
| `#EDF0EE` | Header and footer borders, the discount code divider |
| `#DDE3DF` | Input borders, summary box border, sheet grabber |
| `#F7F8F7` | Summary box, other fee options |
| `#A9CBBB`, `#044B36` | Chosen fee option ring and text |
| `#9AA5A0` | Other fee option text |
| `#B0E800`, `#A3D900` | Save changes, Generate discount code, Complete, Create another ticket |
| `rgba(176,232,0,.4)` | Lime button glow |
| `#E4F4B5`, `#5E7A45` | Disabled primary button |
| `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)` | Message all buyers, selected deadline option, selected discount pill |
| `#1F2937` | Titles, values, input text |
| `#3C4A45` | Edit ticket notes |
| `#5B6B66` | Labels and secondary text |
| `#013334` | Lime button text, QR modules |
| `rgba(1,51,52,.42)` | Dialog scrim |
| 8px | QR |
| 12px | Stats grids, inputs, summary box |
| 14px | Ticket stub |
| 18px | Dialog, sheet top corners |
| 999px | Buttons, tabs, pills, options |

| Text | Size | Weight | Extra |
|---|---|---|---|
| Panel title | 24 | 700 | letter-spacing -0.4px |
| Dialog title | 21 | 700 | line height 1.3, letter-spacing -0.3px |
| Ticket names | 20 | 700 | line height 1.3, letter-spacing -0.3px |
| Code names | 20 | 700 | letter-spacing 0.02em |
| Section titles | 19 | 700 | letter-spacing -0.2px |
| Stub values | 16 | 700 | |
| Stat values | 16 | 600 | line height 1.35 |
| Actions, inputs, options, pills, buttons, intro, deadline option | 15 | 400 to 600 | |
| Paused tickets heading | 15 | 600 | |
| Tabs, title hints, summary box | 14.5 | 400 to 500 | |
| Stat labels, field labels, notes, errors, when line | 13.5 | 400 | |
| Stub labels, Paused pill | 13 | 400 to 600 | |

## Assets
- **Illustration:** `assets/discount-code-success.png` (in this folder), shown up to 240px wide in the dialog.
- **Icons:** Hugeicons from the project kit `https://sets.hugeicons.com/jtgnwk3xiym.css?v=3`. Use the codebase's Hugeicons package with the same names.
- **Pause and Resume ticket sales:** inline stroke SVGs (stroke 1.9) in the prototype, while the codes use `hgi-stop-circle` and `hgi-play` for the same actions. Use the Hugeicons for both.
- **QR:** `qrImg()` draws a stand-in pattern from a seed. Render a real code in the build (Open items 11).
- **Font:** Google Sans, with optical sizing auto and `font-variation-settings: "GRAD" 0`.

## Open items
1. **Counts don't match the chip:** the Dashboard chip reads a fixed sample (40, 30, 20 and 24), while the drawer builds each ticket type's quantity separately. The chip should be the sum of Tickets created across ticket types.
2. **Small phones:** on a 390px sheet the stub's three fields get about 64, 49 and 34px. "KES 4,500" doesn't fit and runs into Quantity. The name is already the heading above, so the stub could drop it, or stack its fields.
3. **Save on your own experience:** the header keeps the bucket list Save from the guest view. Decide whether hosts should see it.
4. **Discount codes and plans:** codes are a Premium feature, but the section shows on every plan, and on free experiences where there's nothing to discount. A fixed discount can also be bigger than the ticket price.
5. **Not designed:** Create another ticket, Message all buyers and Redemptions only show a toast.
6. **One name for the deadline:** the same time is "Sales deadline" here, "Estimated sales expiry" in the stats and "Ticket sales close" in Analytics.
7. **After the deadline:** nothing changes once sales close. There's no closed state on the tickets or on the deadline.
8. **Free tickets:** still show "Ticket currency" and "Amount sold KES 0".
9. **Sales tab after a new price:** the ticket stats keep the old price for past sales, but the Sales tab total multiplies every sold ticket by the new price.
10. **Error placement and style:** the percentage error shows under the code field, not the value. Errors here are red text, while Withdraw uses an amber box, which is part of the open cross-page decision.
11. **QR on the stub:** confirm what it encodes, presumably the buy link that Share copies.
12. **Landing tab with a draft open:** if Create experience is open in the panel with unsaved changes, the chip first asks to save or discard the draft, then opens the experience on About instead of Tickets created. Pass the tab with the open call in the build.

## Exact markup
Verbatim from `Tukai Web.dc.html`. Only the whitespace between tags was reflowed, for reading:
- `{{ }}` holes are filled by the logic below.
- `style-hover`, `style-focus` and `style-active` hold those states.
- `<sc-if>` renders its children only when its value is true, and `<sc-for>` repeats its child once per item. Neither adds an element, so the blocks are direct flex items of the panel body wrapper `padding:20px 24px 36px;display:flex;flex-direction:column;gap:28px;`.

```html
<!-- Host tab row, the first child of <sc-if value="{{ pn.isExp }}"> -->
<nav aria-label="Sections" style="position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;margin:-20px -24px -12px;padding:12px 24px;background:#FFFFFF;overflow-x:auto;scrollbar-width:none;">
  <sc-for list="{{ pn.secs }}" as="sc" hint-placeholder-count="5">
    <button type="button" onClick="{{ sc.onClick }}" aria-current="{{ sc.cur }}" style="display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;height:44px;padding:0 18px 0 12px;border:none;border-radius:999px;background:{{ sc.bg }};color:{{ sc.fg }};font-family:'Google Sans';font-size:14.5px;font-weight:500;white-space:nowrap;cursor:pointer;" style-hover="filter:brightness(0.97);" style-active="transform:scale(0.98);"><i class="{{ sc.icon }}" style="font-size:21px;flex:0 0 auto;color:{{ sc.ic }};" aria-hidden="true"></i>{{ sc.label }}</button>
  </sc-for>
</nav>

<!-- Tickets created tab -->
<sc-if value="{{ pn.hoTabCreated }}">
  <sc-for list="{{ pn.ho.tixActive }}" as="tc" hint-placeholder-count="1">
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <i class="hgi-twotone hgi-ticket-01" style="font-size:24px;flex:0 0 auto;margin-top:2px;color:{{ tc.ic }};" aria-hidden="true"></i>
        <h3 style="margin:0;min-width:0;font-family:'Google Sans';font-size:20px;font-weight:700;color:{{ tc.fg }};letter-spacing:-.3px;line-height:1.3;text-wrap:pretty;">{{ tc.name }}</h3>
      </div>
      <div style="display:flex;align-items:center;border:1.5px dashed {{ tc.bc }};border-radius:14px;background:{{ tc.bg }};">
        <span style="flex:0 0 auto;padding:12px 14px 12px 12px;">
          <img loading="lazy" src="{{ tc.qr }}" alt="{{ tc.qrAlt }}" style="width:64px;height:64px;border-radius:8px;display:block;background:#FFFFFF;opacity:{{ tc.qrOp }};">
        </span>
        <span aria-hidden="true" style="flex:0 0 auto;align-self:stretch;width:0;margin:12px 0;border-left:1.5px dashed {{ tc.bc }};"></span>
        <span style="flex:1 1 auto;min-width:0;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,.7fr);gap:6px 14px;padding:10px 4px 10px 16px;">
          <span style="display:flex;flex-direction:column;gap:3px;min-width:0;">
            <span style="font-size:16px;font-weight:700;color:{{ tc.fg }};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ tc.name }}</span>
            <span style="font-size:13px;color:#5B6B66;">Ticket name</span>
          </span>
          <span style="display:flex;flex-direction:column;gap:3px;min-width:0;">
            <span style="font-size:16px;font-weight:700;color:{{ tc.fg }};white-space:nowrap;">{{ tc.price }}</span>
            <span style="font-size:13px;color:#5B6B66;">Amount per ticket</span>
          </span>
          <span style="display:flex;flex-direction:column;gap:3px;min-width:0;">
            <span style="font-size:16px;font-weight:700;color:{{ tc.fg }};">{{ tc.qty }}</span>
            <span style="font-size:13px;color:#5B6B66;">Quantity</span>
          </span>
        </span>
        <button type="button" onClick="{{ tc.onShare }}" aria-label="{{ tc.shareAria }}" style="flex:0 0 auto;width:44px;height:44px;margin-right:8px;border:none;border-radius:999px;background:transparent;display:flex;align-items:center;justify-content:center;color:{{ tc.shareC }};cursor:pointer;" style-hover="background:rgba(255,255,255,.7);">
          <i class="hgi-twotone hgi-share-08" style="font-size:20px;" aria-hidden="true"></i>
        </button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;border-radius:12px;overflow:hidden;">
        <sc-for list="{{ tc.stats }}" as="st" hint-placeholder-count="7">
          <div style="grid-column:{{ st.col }};min-width:0;display:flex;flex-direction:column;gap:4px;padding:12px 16px;background:#F3F4F2;">
            <span style="font-size:13.5px;line-height:1.35;color:#5B6B66;">{{ st.label }}</span>
            <span style="font-size:16px;font-weight:600;line-height:1.35;color:{{ st.fg }};overflow-wrap:anywhere;">{{ st.value }}</span>
          </div>
        </sc-for>
      </div>
      <div style="display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:4px 6px;margin-top:-4px;">
        <sc-if value="{{ tc.active }}" hint-placeholder-val="{{ true }}">
          <button type="button" onClick="{{ tc.onPause }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#E02D3C;cursor:pointer;white-space:nowrap;" style-hover="background:#FEF3F2;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><circle cx="12" cy="12" r="9.5"></circle><rect x="9" y="9" width="6" height="6" rx="1"></rect></svg>Pause ticket sales</button>
          <span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
          <button type="button" onClick="{{ tc.onEdit }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-edit-04" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Edit ticket</button>
        </sc-if>
        <sc-if value="{{ tc.paused }}">
          <button type="button" onClick="{{ tc.onResume }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><circle cx="12" cy="12" r="9.5"></circle><path d="M10 8.6v6.8l5.4-3.4z"></path></svg>Resume ticket sales</button>
        </sc-if>
      </div>
    </div>
    <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  </sc-for>
  <sc-if value="{{ pn.ho.hasPaused }}">
    <h3 style="margin:0 0 -14px;font-family:'Google Sans';font-size:15px;font-weight:600;color:#5B6B66;">Paused tickets</h3>
    <sc-for list="{{ pn.ho.tixPaused }}" as="tc" hint-placeholder-count="1">
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <i class="hgi-twotone hgi-ticket-01" style="font-size:24px;flex:0 0 auto;margin-top:2px;color:{{ tc.ic }};" aria-hidden="true"></i>
          <h3 style="margin:0;min-width:0;font-family:'Google Sans';font-size:20px;font-weight:700;color:{{ tc.fg }};letter-spacing:-.3px;line-height:1.3;text-wrap:pretty;">{{ tc.name }}</h3>
        </div>
        <div style="display:flex;align-items:center;border:1.5px dashed {{ tc.bc }};border-radius:14px;background:{{ tc.bg }};">
          <span style="flex:0 0 auto;padding:12px 14px 12px 12px;">
            <img loading="lazy" src="{{ tc.qr }}" alt="{{ tc.qrAlt }}" style="width:64px;height:64px;border-radius:8px;display:block;background:#FFFFFF;opacity:{{ tc.qrOp }};">
          </span>
          <span aria-hidden="true" style="flex:0 0 auto;align-self:stretch;width:0;margin:12px 0;border-left:1.5px dashed {{ tc.bc }};"></span>
          <span style="flex:1 1 auto;min-width:0;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,.7fr);gap:6px 14px;padding:10px 4px 10px 16px;">
            <span style="display:flex;flex-direction:column;gap:3px;min-width:0;">
              <span style="font-size:16px;font-weight:700;color:{{ tc.fg }};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ tc.name }}</span>
              <span style="font-size:13px;color:#5B6B66;">Ticket name</span>
            </span>
            <span style="display:flex;flex-direction:column;gap:3px;min-width:0;">
              <span style="font-size:16px;font-weight:700;color:{{ tc.fg }};white-space:nowrap;">{{ tc.price }}</span>
              <span style="font-size:13px;color:#5B6B66;">Amount per ticket</span>
            </span>
            <span style="display:flex;flex-direction:column;gap:3px;min-width:0;">
              <span style="font-size:16px;font-weight:700;color:{{ tc.fg }};">{{ tc.qty }}</span>
              <span style="font-size:13px;color:#5B6B66;">Quantity</span>
            </span>
          </span>
          <button type="button" onClick="{{ tc.onShare }}" aria-label="{{ tc.shareAria }}" style="flex:0 0 auto;width:44px;height:44px;margin-right:8px;border:none;border-radius:999px;background:transparent;display:flex;align-items:center;justify-content:center;color:{{ tc.shareC }};cursor:pointer;" style-hover="background:rgba(255,255,255,.7);">
            <i class="hgi-twotone hgi-share-08" style="font-size:20px;" aria-hidden="true"></i>
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;border-radius:12px;overflow:hidden;">
          <sc-for list="{{ tc.stats }}" as="st" hint-placeholder-count="7">
            <div style="grid-column:{{ st.col }};min-width:0;display:flex;flex-direction:column;gap:4px;padding:12px 16px;background:#F3F4F2;">
              <span style="font-size:13.5px;line-height:1.35;color:#5B6B66;">{{ st.label }}</span>
              <span style="font-size:16px;font-weight:600;line-height:1.35;color:{{ st.fg }};overflow-wrap:anywhere;">{{ st.value }}</span>
            </div>
          </sc-for>
        </div>
        <div style="display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:4px 6px;margin-top:-4px;">
          <sc-if value="{{ tc.active }}" hint-placeholder-val="{{ true }}">
            <button type="button" onClick="{{ tc.onPause }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#E02D3C;cursor:pointer;white-space:nowrap;" style-hover="background:#FEF3F2;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><circle cx="12" cy="12" r="9.5"></circle><rect x="9" y="9" width="6" height="6" rx="1"></rect></svg>Pause ticket sales</button>
            <span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
            <button type="button" onClick="{{ tc.onEdit }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-edit-04" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Edit ticket</button>
          </sc-if>
          <sc-if value="{{ tc.paused }}">
            <button type="button" onClick="{{ tc.onResume }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block;"><circle cx="12" cy="12" r="9.5"></circle><path d="M10 8.6v6.8l5.4-3.4z"></path></svg>Resume ticket sales</button>
          </sc-if>
        </div>
      </div>
      <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
    </sc-for>
  </sc-if>
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 16px;">
      <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Sales deadline <span style="font-size:14.5px;font-weight:400;letter-spacing:0;color:#5B6B66;">(ticket sales close automatically at this time)</span></h3>
      <sc-if value="{{ pn.ho.dlView }}" hint-placeholder-val="{{ true }}">
        <button type="button" onClick="{{ pn.ho.onDlEdit }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-edit-04" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Edit</button>
      </sc-if>
    </div>
    <sc-if value="{{ pn.ho.dlView }}" hint-placeholder-val="{{ true }}">
      <div style="display:flex;flex-direction:column;gap:2px;margin-top:-6px;">
        <span style="font-size:15px;color:#1F2937;">{{ pn.ho.dlLabel }}</span>
        <span style="font-size:13.5px;color:#5B6B66;">{{ pn.ho.dlWhen }}</span>
      </div>
    </sc-if>
    <sc-if value="{{ pn.ho.dlEdit }}">
      <div role="radiogroup" aria-label="Sales deadline" style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;">
        <sc-for list="{{ pn.ho.dlOpts }}" as="o" hint-placeholder-count="3">
          <button type="button" role="radio" aria-checked="{{ o.on }}" onClick="{{ o.onClick }}" style="min-height:48px;padding:10px 20px;border:none;border-radius:999px;background:{{ o.bg }};color:{{ o.fg }};font-family:'Google Sans';font-size:15px;text-align:left;cursor:pointer;" style-active="transform:scale(0.98);">{{ o.label }}</button>
        </sc-for>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:4px;">
        <button type="button" onClick="{{ pn.ho.onDlCancel }}" style="flex:0 0 auto;height:48px;padding:0 6px;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#E02D3C;cursor:pointer;" style-hover="text-decoration:underline;">Cancel</button>
        <button type="button" onClick="{{ pn.ho.onDlSave }}" style="flex:0 0 auto;height:48px;padding:0 24px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;" style-hover="background:#A3D900;" style-active="transform:scale(0.97);">Save changes</button>
      </div>
    </sc-if>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 16px;">
      <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Discount codes</h3>
      <button type="button" onClick="{{ pn.ho.onDiscount }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;color:#066349;cursor:pointer;white-space:nowrap;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-discount-tag-02" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Generate discount code</button>
    </div>
    <p style="margin:-4px 0 0;font-size:15px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">Generate discount codes to help promote this experience.</p>
    <sc-for list="{{ pn.ho.dcs }}" as="dc" hint-placeholder-count="1">
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <i class="hgi-twotone hgi-discount-tag-02" style="font-size:24px;flex:0 0 auto;color:{{ dc.ic }};" aria-hidden="true"></i>
          <h4 style="margin:0;flex:1 1 auto;min-width:0;font-family:'Google Sans';font-size:20px;font-weight:700;color:{{ dc.fg }};letter-spacing:.02em;overflow-wrap:anywhere;">{{ dc.code }}</h4>
          <sc-if value="{{ dc.paused }}">
            <span style="flex:0 0 auto;display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;background:#F3F4F2;font-size:13px;font-weight:600;color:#5B6B66;">Paused</span>
          </sc-if>
          <button type="button" onClick="{{ dc.onShare }}" aria-label="{{ dc.shareAria }}" style="flex:0 0 auto;width:44px;height:44px;border:none;border-radius:999px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:{{ dc.ic }};" style-hover="background:#E8F1ED;">
            <i class="hgi-twotone hgi-share-08" style="font-size:20px;" aria-hidden="true"></i>
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;border-radius:12px;overflow:hidden;">
          <sc-for list="{{ dc.stats }}" as="ds" hint-placeholder-count="3">
            <div style="min-width:0;display:flex;flex-direction:column;gap:4px;padding:12px 16px;background:#F3F4F2;">
              <span style="font-size:13.5px;line-height:1.35;color:#5B6B66;">{{ ds.label }}</span>
              <span style="font-size:16px;font-weight:600;line-height:1.35;color:{{ ds.fg }};overflow-wrap:anywhere;">{{ ds.value }}</span>
            </div>
          </sc-for>
        </div>
        <div style="display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:4px 6px;margin-top:-4px;">
          <button type="button" onClick="{{ dc.onRedemptions }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;cursor:pointer;white-space:nowrap;color:#066349;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-chart-line-data-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Redemptions</button>
          <span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
          <sc-if value="{{ dc.active }}">
            <button type="button" onClick="{{ dc.onPause }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;cursor:pointer;white-space:nowrap;color:#E02D3C;" style-hover="background:#FEF3F2;"><i class="hgi-twotone hgi-stop-circle" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Pause code</button>
          </sc-if>
          <sc-if value="{{ dc.paused }}">
            <button type="button" onClick="{{ dc.onResume }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;cursor:pointer;white-space:nowrap;color:#066349;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-play" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Resume code</button>
          </sc-if>
          <span aria-hidden="true" style="flex:0 0 auto;width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
          <button type="button" onClick="{{ dc.onEdit }}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:500;cursor:pointer;white-space:nowrap;color:#066349;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-edit-04" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>Edit code</button>
        </div>
      </div>
    </sc-for>
  </div>
</sc-if>

<!-- Action bar, below the panel body -->
<sc-if value="{{ pn.hasHostBar }}">
  <div aria-disabled="{{ pn.wzLock }}" style="flex:0 0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:10px;min-height:88px;padding:18px 24px calc(18px + env(safe-area-inset-bottom));border-top:1px solid #EDF0EE;background:#FFFFFF;opacity:{{ pn.wzOp }};pointer-events:{{ pn.wzPe }};transition:opacity .2s ease;">
    <button type="button" onClick="{{ pn.hoA.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);color:#FFFFFF;font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;transition:transform .18s ease, box-shadow .2s ease, filter .2s ease;" style-hover="filter:brightness(1.04);box-shadow:0 6px 16px rgba(1,51,52,.16);" style-active="transform:scale(0.97);"><i class="{{ pn.hoA.cls }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.hoA.label }}</button>
    <button type="button" onClick="{{ pn.hoB.onClick }}" style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;transition:transform .18s ease, box-shadow .2s ease, background .2s ease;" style-hover="background:#A3D900;box-shadow:0 6px 16px rgba(176,232,0,.4);" style-active="transform:scale(0.97);"><i class="{{ pn.hoB.cls }}" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i>{{ pn.hoB.label }}</button>
  </div>
</sc-if>

<!-- Edit ticket details, inside the panel body -->
<sc-if value="{{ pn.isTke }}">
  <div style="display:flex;flex-direction:column;gap:14px;">
    <div style="display:flex;align-items:flex-start;gap:12px;">
      <i class="hgi-twotone hgi-ticket-01" style="font-size:24px;flex:0 0 auto;margin-top:2px;color:#066349;" aria-hidden="true"></i>
      <h3 style="margin:0;min-width:0;font-family:'Google Sans';font-size:20px;font-weight:700;color:#1F2937;letter-spacing:-.3px;line-height:1.3;text-wrap:pretty;">{{ pn.tke.title }}</h3>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;border-radius:12px;overflow:hidden;">
      <sc-for list="{{ pn.tke.stats }}" as="st" hint-placeholder-count="7">
        <div style="grid-column:{{ st.col }};min-width:0;display:flex;flex-direction:column;gap:4px;padding:12px 16px;background:#F3F4F2;">
          <span style="font-size:13.5px;line-height:1.35;color:#5B6B66;">{{ st.label }}</span>
          <span style="font-size:16px;font-weight:600;line-height:1.35;color:{{ st.fg }};overflow-wrap:anywhere;">{{ st.value }}</span>
        </div>
      </sc-for>
    </div>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#E5E7EB;"></div>
  <div style="display:flex;flex-direction:column;gap:14px;">
    <h3 style="margin:0;font-family:'Google Sans';font-size:19px;font-weight:700;color:#1F2937;letter-spacing:-.2px;">Edit details</h3>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <label for="tke-name" style="font-size:13.5px;color:#5B6B66;">Ticket name</label>
      <span style="position:relative;display:block;">
        <input id="tke-name" type="text" value="{{ pn.tke.name }}" onChange="{{ pn.tke.onName }}" placeholder="Ticket name, e.g. VIP, Early bird, Locals" autocomplete="off" style="width:100%;box-sizing:border-box;height:56px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;padding:0 52px 0 16px;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
        <i class="hgi-twotone hgi-ticket-01" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:21px;color:#1F2937;pointer-events:none;" aria-hidden="true"></i>
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:10px;">
      <sc-if value="{{ pn.tke.paid }}">
        <div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
          <label for="tke-amt" style="font-size:13.5px;color:#5B6B66;">Amount per ticket</label>
          <span style="position:relative;display:block;">
            <span aria-hidden="true" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:15px;color:#5B6B66;pointer-events:none;">{{ pn.tke.cur }}</span>
            <input id="tke-amt" type="text" inputMode="numeric" value="{{ pn.tke.amount }}" onChange="{{ pn.tke.onAmount }}" placeholder="0" autocomplete="off" style="width:100%;box-sizing:border-box;height:56px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;padding:0 52px 0 56px;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
            <i class="hgi-twotone hgi-money-01" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:21px;color:#1F2937;pointer-events:none;" aria-hidden="true"></i>
          </span>
        </div>
      </sc-if>
      <div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
        <label for="tke-qty" style="font-size:13.5px;color:#5B6B66;">{{ pn.tke.qtyLabel }}</label>
        <input id="tke-qty" type="text" inputMode="numeric" value="{{ pn.tke.qty }}" onChange="{{ pn.tke.onQty }}" placeholder="0" autocomplete="off" style="width:100%;box-sizing:border-box;height:56px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;padding:0 16px;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
      </div>
    </div>
    <sc-if value="{{ pn.tke.hasSum }}">
      <div style="padding:12px 16px;border:1.5px dashed #DDE3DF;border-radius:12px;background:#F7F8F7;font-size:14.5px;line-height:1.5;color:#1F2937;display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;">
        <span>All tickets cost: <span style="font-weight:700;">{{ pn.tke.total }}</span></span>
        <span aria-hidden="true" style="width:5px;height:5px;border-radius:999px;background:#60A5FA;"></span>
        <span>What the customer sees: <span style="font-weight:700;">{{ pn.tke.each }}</span></span>
      </div>
    </sc-if>
    <sc-if value="{{ pn.tke.paid }}">
      <div style="display:flex;flex-direction:column;gap:10px;">
        <span style="font-size:15px;font-weight:600;color:#1F2937;">Fees allocation <span style="font-weight:400;color:#5B6B66;">(who pays Tukai’s commission?)</span></span>
        <div role="radiogroup" aria-label="Who pays the commission" aria-disabled="true" style="display:flex;flex-direction:column;align-items:flex-start;gap:10px;">
          <sc-for list="{{ pn.tke.feeOpts }}" as="fo" hint-placeholder-count="3">
            <button type="button" role="radio" aria-checked="{{ fo.on }}" disabled="{{ true }}" style="display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 22px 0 16px;border:none;border-radius:999px;background:{{ fo.bg }};box-shadow:inset 0 0 0 1px {{ fo.bc }};color:{{ fo.fg }};font-family:'Google Sans';font-size:15px;font-weight:500;cursor:not-allowed;text-align:left;"><i class="{{ fo.icon }}" style="font-size:19px;flex:0 0 auto;" aria-hidden="true"></i>{{ fo.label }}</button>
          </sc-for>
        </div>
        <span style="display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:1.45;color:#5B6B66;text-wrap:pretty;"><i class="hgi-twotone hgi-square-lock-02" style="font-size:17px;flex:0 0 auto;margin-top:1px;" aria-hidden="true"></i>Set when the experience was created. It cannot change once tickets are on sale.</span>
      </div>
    </sc-if>
    <sc-if value="{{ pn.tke.hasErr }}"><span role="alert" style="font-size:13.5px;line-height:1.45;color:#E02D3C;">{{ pn.tke.err }}</span></sc-if>
    <sc-if value="{{ pn.tke.hasNote }}">
      <p style="margin:0;display:flex;align-items:flex-start;gap:10px;font-size:13.5px;line-height:1.5;color:#3C4A45;text-wrap:pretty;">
        <i class="hgi-twotone hgi-information-circle" style="font-size:18px;flex:0 0 auto;margin-top:1px;color:#066349;" aria-hidden="true"></i>
        <span>{{ pn.tke.note }}</span>
      </p>
    </sc-if>
  </div>
</sc-if>

<!-- Generate or edit a discount code, inside the panel body -->
<sc-if value="{{ pn.isDc }}">
  <div style="display:flex;flex-direction:column;gap:10px;">
    <label for="dc-code" style="font-size:15px;font-weight:600;color:#1F2937;">Discount code <span style="font-weight:400;color:#5B6B66;">(not more than 10 characters)</span></label>
    <input id="dc-code" type="text" value="{{ pn.dc.code }}" onChange="{{ pn.dc.onCode }}" placeholder="Enter discount code e.g. TRVL2026" autocomplete="off" style="width:100%;box-sizing:border-box;height:56px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;padding:0 16px;letter-spacing:.03em;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
    <sc-if value="{{ pn.dc.hasErr }}"><span role="alert" style="font-size:13.5px;color:#E02D3C;">{{ pn.dc.err }}</span></sc-if>
  </div>
  <div aria-hidden="true" style="flex:0 0 auto;height:1px;margin:0 -24px;background:#EDF0EE;"></div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <span id="dc-type" style="font-size:15px;font-weight:600;color:#1F2937;">Discount value</span>
    <div role="radiogroup" aria-labelledby="dc-type" style="display:flex;flex-wrap:wrap;gap:8px;">
      <sc-for list="{{ pn.dc.types }}" as="dt" hint-placeholder-count="2">
        <button type="button" role="radio" aria-checked="{{ dt.on }}" onClick="{{ dt.onClick }}" style="height:48px;padding:0 22px;border:none;border-radius:999px;background:{{ dt.bg }};color:{{ dt.fg }};font-family:'Google Sans';font-size:15px;font-weight:500;cursor:pointer;white-space:nowrap;" style-active="transform:scale(0.98);">{{ dt.label }}</button>
      </sc-for>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <label for="dc-val" style="font-size:15px;font-weight:600;color:#1F2937;">{{ pn.dc.valLabel }}</label>
    <div style="position:relative;">
      <input id="dc-val" type="text" inputmode="decimal" value="{{ pn.dc.value }}" onChange="{{ pn.dc.onValue }}" placeholder="{{ pn.dc.valPh }}" autocomplete="off" style="width:100%;box-sizing:border-box;height:56px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;padding:0 56px 0 16px;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
      <span aria-hidden="true" style="position:absolute;right:4px;top:4px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;pointer-events:none;color:#1F2937;">
        <i class="hgi-twotone {{ pn.dc.valIcon }}" style="font-size:22px;"></i>
      </span>
    </div>
    <span style="font-size:13.5px;color:#5B6B66;">{{ pn.dc.valNote }}</span>
  </div>
</sc-if>

<!-- Footer of both drawers, below the panel body -->
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

<!-- Code generated dialog, outside the panel -->
<sc-if value="{{ dcOk }}">
  <div style="position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;padding:24px;font-family:'Google Sans';">
    <div onClick="{{ onDcOk }}" aria-hidden="true" style="position:absolute;inset:0;background:rgba(1,51,52,.42);"></div>
    <div role="alertdialog" aria-modal="true" aria-labelledby="dc-ok-title" aria-describedby="dc-ok-desc" style="position:relative;width:100%;max-width:420px;padding:24px;border-radius:18px;background:#FFFFFF;box-shadow:0 24px 60px rgba(1,51,52,.24);display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;">
      <img src="assets/discount-code-success.png" alt="" style="width:100%;max-width:240px;height:auto;display:block;">
      <div style="display:flex;flex-direction:column;gap:8px;">
        <h2 id="dc-ok-title" style="margin:0;font-size:21px;font-weight:700;letter-spacing:-.3px;line-height:1.3;color:#1F2937;text-wrap:pretty;">Discount code generated successfully</h2>
        <p id="dc-ok-desc" style="margin:0;font-size:15px;line-height:1.55;color:#5B6B66;text-wrap:pretty;">Your discount code <strong style="font-weight:700;color:#1F2937;">{{ dcOkCode }}</strong> was generated successfully. You can now share it with customers.</p>
      </div>
      <button type="button" onClick="{{ onDcOk }}" style="align-self:stretch;height:48px;border:none;border-radius:999px;background:#B0E800;color:#013334;font-family:'Google Sans';font-size:15px;font-weight:600;cursor:pointer;" style-hover="background:#A3D900;" style-active="transform:scale(0.98);">Complete</button>
    </div>
  </div>
</sc-if>
```

## Exact logic
Verbatim from `Tukai Web.dc.html`, with `// ...` where unrelated code was left out:
- `hoGo` and the chips come from `controlVals()`, which feeds the Dashboard.
- `open`, `push`, `panelBack`, `panelClose` and `panelTop` run the shared panel stack.
- In the experience panel lines, `HSN` and the `svg` that `hoIco` adds aren’t used. The bar buttons use the `cls` class added at the end of `panelVals()`.
- `hostVm()` also builds the other host tabs. This tab uses `tixActive`, `tixPaused`, `hasPaused`, the `dl` values, `onDiscount`, `dcs` and `buyers`.
- `this.say()` shows the toast.

```js
// Dashboard, controlVals(): the stat chips on each hosted experience
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

  ccGo(...a) { this.setState({ ccOpen: false }); this.open(...a); }

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

  panelClose = () => {
    this.setState({ pOpen: false, gal: null, aiBrief: null });
    if (this._pT) clearTimeout(this._pT);
    this._pT = setTimeout(() => { if (!this.state.pOpen) this.setState({ pstack: [] }); }, 1050);
  };

  panelTop() { setTimeout(() => { const b = typeof document !== 'undefined' && document.querySelector('[data-panel-body]'); if (b) b.scrollTop = 0; }, 0); }

  panelVals() {
    const S = this.state, fx = this.fx();
    const stack = S.pstack || [];
    const cur = stack[stack.length - 1];
    const sheet = (S.vw || 1280) < 720, aiLk = !!((S.cxAi && cur && cur.kind === 'cx') || (S.aiBrief && S.aiBrief.key && S.aiBrief.key !== 'wa'));
    const pn = {
      has: false, title: '', headTitle: '', kindLabel: '', sheet, hidden: !S.pOpen, wzLock: aiLk ? 'true' : 'false', wzOp: aiLk ? '.45' : '1', wzPe: aiLk ? 'none' : 'auto',
      top: sheet ? 'auto' : '0px', left: sheet ? '0px' : 'auto', width: sheet ? 'auto' : 'min(' + ({ Narrow: 560, Medium: 640, Wide: 760 }[this.props.drawerWidth] || 640) + 'px, 100vw)', height: sheet ? 'calc(92dvh - 69px - env(safe-area-inset-bottom))' : 'auto', bottom: sheet ? 'calc(69px + env(safe-area-inset-bottom))' : '0px', canPlan: false, planPad: '0 18px', planLabelDisp: 'inline', isPlanEd: false, isPlanAdd: false, isStopAdd: false, isRset: false, isRsl: false, isRshold: false, isMyPlace: false, isSub: false, isSubPay: false,
      radius: sheet ? '18px 18px 0 0' : '0',
      transform: S.pOpen ? 'translate(0, 0)' : (sheet ? 'translateY(calc(100% + 96px))' : 'translateX(104%)'),
      shadow: S.pOpen ? (sheet ? '0 -12px 40px rgba(1,51,52,.18)' : '-6px 0 24px rgba(1,51,52,.08)') : 'none',
      pointer: S.pOpen ? 'auto' : 'none',
      trans: S.pOpen ? 'transform 1s cubic-bezier(.22,.8,.24,1), box-shadow 1s ease' : 'transform 1s cubic-bezier(.45,0,.2,1), box-shadow 1s ease',
      canBack: stack.length > 1, onBack: this.panelBack, onClose: () => { if (!this.cxGuard()) this.panelClose(); }, onShare: () => this.say('Link copied.'),
      canSave: false, saveIcon: '', saveColor: '#013334', saveLabel: '', isPlace: false, isComm: false, isExp: false, isList: false, headBiz: false, bizTip: false, canShare: true, isBl: false, hasInvite: false, blFab: false
    };
    // ...

    // Experience panel, host mode
    const mine = !!e.mine;
    const HSN = { sales: 'Sales shows ticket revenue and payouts for this experience.', created: 'Tickets created lists each ticket type you set up, with prices and limits.', guests: 'Invited guests shows everyone you invited and who has replied.', moments: 'Moments shows everything guests have posted from this experience.', analytics: 'Analytics shows views, saves and ticket sales over time.' };
    const hoTab = mine ? (S.hoTab || 'about') : 'about';
    const ho = mine ? this.hostVm(e, { qrOf, dLabel, t12, day, sM, eM, free, tDefs, weekly, hsh }) : null;
    const msgAll = { label: 'Message all buyers', icon: 'hgi-message-multiple-01', onClick: () => this.say(ho && ho.buyers ? 'Write one message to all ' + ho.buyers + ' buyers. It arrives in their Tukai inbox.' : 'No one has bought a ticket yet. You can message buyers once sales start.') };
    const editX = { label: 'Edit experience', icon: 'hgi-edit-04', onClick: () => this.say('Opens the experience editor. Changes go live when you save them.') };
    const BAR = {
      about: [{ label: 'Buy tickets', icon: 'hgi-ticket-01', onClick: () => this.say('Ticket selection opens next. Nothing is charged yet.') }, editX],
      created: [msgAll, { label: 'Create another ticket', icon: 'hgi-ticket-01', onClick: () => this.say('Add a new ticket type with its own name, price and quantity.') }],
      guests: [{ label: 'Invite more guests', icon: 'hgi-user-add-01', onClick: () => this.say('Pick more people or communities. Each one gets a private invite.') }, { label: 'Resend invites', icon: 'hgi-sent', onClick: () => this.say(ho && (ho.nGuests || ho.nComms) ? 'Invites sent again to ' + ho.nGuests + (ho.nGuests === 1 ? ' guest and ' : ' guests and ') + ho.nComms + (ho.nComms === 1 ? ' community.' : ' communities.') : 'There is no one to resend to yet. Invite guests first.') }],
      moments: [msgAll, { label: 'Share moment', icon: 'hgi-dashboard-circle-add', onClick: () => this.startMoment({ kind: 'exp', id: e.id }) }],
      analytics: [msgAll, editX],
      sales: [msgAll, { label: 'Scan ticket', icon: 'hgi-qr-code-scan', onClick: () => this.say('Point your camera at a guest\'s ticket code to check them in.') }]
    };
    const hoBar = BAR[hoTab] || BAR.about;
    const HOP = {
      'hgi-ticket-01': '<path d="M3 8.5V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 5v2M14 11v2M14 17v2"/>',
      'hgi-edit-04': '<path d="M14.4 5.6l4 4"/><path d="M4 20l1.1-4.6L15.4 5.1a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.6 18.9 4 20z"/>',
      'hgi-message-multiple-01': '<path d="M8 17H6.5L3 20V6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5V9"/><path d="M21 13.5v7l-2.5-2h-6a2.5 2.5 0 0 1-2.5-2.5v-2.5a2.5 2.5 0 0 1 2.5-2.5h6a2.5 2.5 0 0 1 2.5 2.5z"/>',
      'hgi-user-add-01': '<circle cx="10" cy="8" r="4"/><path d="M3 20a7 7 0 0 1 11-5.7"/><path d="M18 14v6M15 17h6"/>',
      'hgi-qr-scan': '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8.5 8.5h2.5v2.5H8.5zM13 8.5h2.5v2.5H13zM8.5 13h2.5v2.5H8.5zM13 13h2.5v2.5"/>',
      'hgi-sent': '<path d="M21 3L10 14"/><path d="M21 3l-6.5 18-4.5-7-7-4.5z"/>',
      'hgi-dashboard-circle-add': '<circle cx="7" cy="7" r="3.5"/><circle cx="7" cy="17" r="3.5"/><circle cx="17" cy="17" r="3.5"/><path d="M17 3.5v7M13.5 7h7"/>'
    };
    const hoIco = (n, c) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (HOP[n] || '') + '</svg>');
    const hoA = Object.assign({}, hoBar[0], { svg: hoIco(hoBar[0].icon, '#FFFFFF') }), hoB = Object.assign({}, hoBar[1], { svg: hoIco(hoBar[1].icon, '#013334') });
    const hostSecs = [['about', 'About', 'hgi-information-circle'], ['sales', 'Sales', 'hgi-credit-card-pos'], ['created', 'Tickets created', 'hgi-ticket-02'], ['guests', 'Invited guests', 'hgi-user-add-02'], ['moments', 'Moments', 'hgi-dashboard-circle'], ['analytics', 'Analytics', 'hgi-pie-chart-06']].map(([key, label, icon]) => { const on = key === hoTab; return { key, label, cur: on ? 'true' : 'false', icon: icon.indexOf(' ') > 0 ? icon : (on ? 'hgi-bulk ' : 'hgi-twotone ') + icon, ic: on ? '#066349' : '#1F2937', bg: on ? '#A7F3D0' : '#F3F4F2', fg: on ? '#066349' : '#1F2937', onClick: () => { this.setState({ hoTab: key, hoDlEdit: false, hoGs: false, hoGq: '', hoBq: '', hoBx: null, hoBall: false }); this.panelTop(); } }; });
    const hoCats = (e.cats || []).map(k => ({ label: ((fx.pcDefs || []).find(d => d[0] === k) || [k, k])[1] }));
    Object.assign(pn, {
      headTitle: mine ? e.title : whenTxt, secs: mine ? hostSecs : secs, gallery,
      hostMode: mine, guestMode: !mine, hasHostBar: mine, hoWhen: whenTxt, hoCats,
      hoTabAbout: !mine || hoTab === 'about', hoTabSales: mine && hoTab === 'sales', hoTabCreated: mine && hoTab === 'created', hoTabGuests: mine && hoTab === 'guests', hoTabMoments: mine && hoTab === 'moments', hoTabAnalytics: mine && hoTab === 'analytics', ho: ho || {}, hoA, hoB,
      // ... guest view values
    });
    // ...
    ['hoA', 'hoB'].forEach(k => { const b = pn[k]; if (b && b.icon) pn[k] = Object.assign({}, b, { cls: (/dashboard-circle-add/.test(b.icon) ? 'hgi-duotone ' : 'hgi-twotone ') + b.icon }); });
    // ...
  }

  hostVm(e, c) {
    const S = this.state, fx = this.fx(), GRAD = 'linear-gradient(180deg,#0C7A50 0%,#044B36 100%)', hsh = c.hsh;
    const cur = e.cur || (/^USD/.test(e.price || '') ? 'USD' : 'KES'), curName = cur === 'USD' ? 'US dollars' : 'Kenya shillings';
    const money = (n) => cur + ' ' + Math.round(n).toLocaleString('en-US'), fresh = /^u/.test(e.id);
    const DL = [['1h-start', '1 hour before the experience starts'], ['1h-end', '1 hour before the experience ends'], ['1d-start', '1 day before the experience starts']];
    const dlKey = (S.hoDl || {})[e.id] || '1d-start', dlDraft = S.hoDlDraft || dlKey;
    const at = (k) => { const d = new Date(c.day); d.setHours(0, 0, 0, 0); if (k === '1d-start') d.setDate(d.getDate() - 1); d.setMinutes(k === '1h-end' ? c.eM - 60 : k === '1h-start' ? c.sM - 60 : c.sM); return d; };
    const fmt = (d) => c.dLabel(d) + ', ' + c.t12(d.getHours() * 60 + d.getMinutes()), closeAt = fmt(at(dlKey));
    const base = e.tix && e.tix.length ? e.tix : c.free ? [{ name: 'General admission', amount: 0, qty: 30 + hsh(e.id) % 40 }]
      : c.tDefs.filter(d => !/today/.test(d[1])).map(d => ({ name: d[0], amount: parseInt(String(d[1]).replace(/[^0-9]/g, ''), 10) || 0, qty: 20 + hsh(e.id + d[0]) % 60 }));
    const paused = S.hoPaused || {};
    const tkEd = S.hoTkEd || {};
    const tks = base.map((t0, k) => {
      const t = Object.assign({}, t0, tkEd[e.id + '|' + k] || {}), q0 = Math.max(1, Math.round(+t0.qty || 0)), a0 = +t0.amount || 0;
      const qty = Math.max(1, Math.round(+t.qty || 0)), amount = +t.amount || 0, sold = fresh ? 0 : Math.min(q0, Math.round(q0 * (0.35 + (hsh(e.id + t0.name) % 45) / 100)));
      const pk = e.id + '|' + k, off = !!paused[pk], price = amount ? money(amount) : 'Free';
      const stat = (label, value, full) => ({ label, value: String(value), col: full ? '1 / -1' : 'auto', fg: off ? '#5B6B66' : '#1F2937' });
      return {
        name: t.name, qty: String(qty), qtyN: qty, price, amount, a0, sold, off, active: !off, paused: off,
        fg: off ? '#5B6B66' : '#1F2937', ic: off ? '#8A9793' : '#066349', bg: off ? '#F3F4F2' : 'linear-gradient(180deg,#EFF6FF 0%,#DBEAFE 100%)', bc: off ? '#C9D3CE' : '#BFDBFE', qrOp: off ? '.45' : '1', shareC: off ? '#8A9793' : '#066349',
        qr: c.qrOf(e.id + t0.name), qrAlt: 'Code for ' + t.name, shareAria: 'Share ' + t.name,
        onShare: () => this.say(off ? t.name + ' is paused. Resume sales to share it.' : 'Link to buy ' + t.name + ' copied.'),
        stats: [stat('Ticket currency', curName), stat('Tickets created', qty), stat('Amount per ticket', price), stat('Tickets sold', sold), stat('Amount sold', money(sold * a0)), stat('Available tickets', qty - sold), stat(off ? 'Ticket sales' : 'Estimated sales expiry', off ? 'Paused' : closeAt, true)],
        onPause: () => { this.setState(s => ({ hoPaused: Object.assign({}, s.hoPaused, { [pk]: true }) })); this.say('Sales paused for ' + t.name + '. People who already bought keep their tickets.'); },
        onResume: () => { this.setState(s => { const p = Object.assign({}, s.hoPaused); delete p[pk]; return { hoPaused: p }; }); this.say('Sales resumed for ' + t.name + '.'); },
        onEdit: () => {
          this.setState({ tkeForm: { eid: e.id, k, n0: t.name, name: t.name, a0: amount, amount: amount ? String(amount) : '', q0: qty, qty: String(qty), sold, paid: amount > 0, cur, fee: e.fee === 'host' || e.fee === 'split' ? e.fee : 'customer', rate: this.hostFee(e.commId) || 4, mult: e.fee === 'host' ? 1 : e.fee === 'split' ? 1 + (this.hostFee(e.commId) || 4) / 200 : 1 + (this.hostFee(e.commId) || 4) / 100,
            stats: [stat('Ticket currency', curName), stat('Tickets created', qty), stat('Amount per ticket', price), stat('Tickets sold', sold), stat('Amount sold', money(sold * a0)), stat('Available tickets', qty - sold), stat('Estimated sales expiry', closeAt, true)] } });
          this.push('tke', e.id + '|' + k);
        }
      };
    });
    const FACE = { 'Amina Hassan': 'Amina', 'Kevin Mwangi': 'Kevo', 'Njeri Wambui': 'Njeri', 'Otieno Ouma': 'Otieno' };
    const G0 = ['Amina Hassan', 'Jabari Otieno', 'Bahati Wanjiru', 'Kevin Mwangi', 'Baraka Amani', 'Jelani Kamau', 'mkenya@habari.co.ke', 'Ben Michael', 'Njeri Wambui', 'Mwangi Maina', 'Njoroge Kimani', 'Chebet Moraa', 'Kiprono Juma', 'Otieno Ouma', 'Zawadi Imani', 'Achieng Adisa', 'Adongo Ayana', 'amani.w@gmail.com'];
    const allC = fx.communities.concat(fx.privComms || [], fx.catComms || [], S.ownComms || []);
    const guests0 = e.invites ? e.invites : fresh ? [] : G0.slice(0, 10 + hsh(e.id) % 9);
    const comms0 = e.invComms ? e.invComms.map(id => allC.find(x => x.id === id)).filter(Boolean) : fresh ? [] : fx.communities.filter(x => x.id !== e.commId).slice(0, 2 + hsh(e.id) % 3);
    const rm = S.hoRm || {}, gq = String(S.hoGq || '').trim().toLowerCase(), gView = S.hoGv === 'comms' ? 'comms' : 'guests';
    const guests = guests0.filter(n => !rm[e.id + '|g|' + n]), comms = comms0.filter(x => !rm[e.id + '|c|' + x.id]);
    const drop = (key, label) => { this.setState(s => ({ hoRm: Object.assign({}, s.hoRm, { [e.id + '|' + key]: true }) })); this.say(label + ' is off the guest list. Their invite no longer works.'); };
    const gList = gView === 'guests'
      ? guests.filter(n => !gq || n.toLowerCase().indexOf(gq) >= 0).map(n => { const im = FACE[n] ? this.face(FACE[n]) : null; return { label: n, img: im || '', hasImg: !!im, noImg: !im, initial: n.indexOf('@') > 0 ? '@' : n.charAt(0).toUpperCase(), removeAria: 'Remove ' + n, onRemove: () => drop('g|' + n, n) }; })
      : comms.filter(x => !gq || x.name.toLowerCase().indexOf(gq) >= 0).map(x => ({ label: x.name, img: x.img || '', hasImg: !!x.img, noImg: !x.img, initial: x.name.charAt(0), removeAria: 'Remove ' + x.name, onRemove: () => drop('c|' + x.id, x.name) }));
    const gTabs = [['guests', 'Guests (' + guests.length + ')'], ['comms', 'Communities (' + comms.length + ')']].map(([k, l]) => { const on = gView === k; return { label: l, on: on ? 'true' : 'false', bg: on ? '#A7F3D0' : 'transparent', fg: on ? '#044B36' : '#1F2937', onClick: () => this.setState({ hoGv: k }) }; });
    const tq = tks.reduce((a, t) => a + t.qtyN, 0), ts = tks.reduce((a, t) => a + t.sold, 0), ta = tks.reduce((a, t) => a + t.sold * t.a0, 0);
    const amts = tks.map(t => t.amount).filter(Boolean), lo = amts.length ? Math.min.apply(null, amts) : 0, hi = amts.length ? Math.max.apply(null, amts) : 0;
    const st = (label, value, full) => ({ label, value: String(value), col: full ? '1 / -1' : 'auto', fg: '#1F2937' });
    const dcRaw = this.dcList(e), dcPut = (list) => this.setState(s => ({ dcCodes: Object.assign({}, s.dcCodes, { [e.id]: list }) }));
    const dcOpen = (d) => { this.setState({ dcForm: d ? { code: d.code, type: d.type, value: String(d.value), edit: d.code } : { code: '', type: 'fixed', value: '', edit: null } }); this.push('dc', e.id); };
    const dcs = dcRaw.map((d, i) => {
      const off = !!d.paused, fg = off ? '#5B6B66' : '#1F2937', put = (p, msg) => { dcPut(dcRaw.map((x, j) => j === i ? Object.assign({}, x, p) : x)); this.say(msg); };
      return { code: d.code, paused: off, active: !off, fg, ic: off ? '#8A9793' : '#066349', shareAria: 'Share ' + d.code,
        stats: [['Discount type', d.type === 'pct' ? 'Percentage' : 'Fixed amount'], ['Amount', d.type === 'pct' ? d.value + '%' : money(d.value)], ['Redeemed', d.redeemed + (d.redeemed === 1 ? ' time' : ' times')]].map(([label, value]) => ({ label, value, fg })),
        onShare: () => this.say(off ? d.code + ' is paused. Resume it to share it.' : d.code + ' copied. Share it with your community.'),
        onRedemptions: () => this.say(d.redeemed ? d.code + ' has been used ' + d.redeemed + (d.redeemed === 1 ? ' time.' : ' times.') : 'No one has used ' + d.code + ' yet.'),
        onPause: () => put({ paused: true }, d.code + ' is paused. It can\u2019t be used until you resume it.'),
        onResume: () => put({ paused: false }, d.code + ' can be used again.'),
        onEdit: () => dcOpen(d) };
    });
    const BN = ['Amina Hassan', 'Lumumba Onyango', 'Kevin Mwangi', 'Zawadi Kentasi', 'Njeri Wambui', 'Gitonga Maina', 'Otieno Ouma', 'Wambui Karanja', 'Baraka Maiyo', 'Akinyi Omondi', 'Jabari Otieno', 'Bahati Wanjiru', 'Baraka Amani', 'Jelani Kamau', 'Ben Michael', 'Mwangi Maina', 'Njoroge Kimani', 'Chebet Moraa', 'Kiprono Juma', 'Zawadi Imani', 'Achieng Adisa', 'Adongo Ayana', 'Wafula Wekesa', 'Nyambura Mutua', 'Imani Kariuki', 'Atieno Odhiambo', 'Kibet Chege', 'Moraa Nyaga', 'Wairimu Gathoni', 'Nekesa Barasa'];
    const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], soldT = tks.filter(t => t.sold > 0), buys = [];
    for (let i = 0, left = tks.reduce((a, t) => a + t.sold, 0); left > 0 && soldT.length; i++) { const q = Math.min(left, 1 + hsh(e.id + 'q' + i) % 4); left -= q; buys.push({ i, q, t: soldT[hsh(e.id + 'b' + i) % soldT.length] }); }
    const bq = String(S.hoBq || '').trim().toLowerCase(), B0 = new Date(); B0.setHours(0, 0, 0, 0);
    const bAll = buys.filter(b => b.i < BN.length).map(b => {
      const name = BN[b.i], key = e.id + '|' + name, open = S.hoBx === key, im = FACE[name] ? this.face(FACE[name]) : null;
      const d = new Date(B0); d.setDate(d.getDate() - 1 - hsh(key) % 24);
      const amt = b.t.amount ? money(b.q * b.t.amount) : 'Free', qty = b.q + (b.q === 1 ? ' ticket' : ' tickets');
      return { name, handle: name.split(' ')[0].toLowerCase(), img: im || '', hasImg: !!im, noImg: !im, initial: name.charAt(0), verified: name === 'Kevin Mwangi' || name === 'Gitonga Maina',
        amt, qty, open: open ? 'true' : 'false', isOpen: open, chev: open ? 'hgi-arrow-down-01' : 'hgi-arrow-right-01', qr: c.qrOf(key), qrAlt: 'Ticket code for ' + name,
        tName: b.t.name, tMeta: qty + ' · ' + amt + ' · ' + d.getDate() + ' ' + MONS[d.getMonth()] + ', ' + c.t12(7 * 60 + hsh(key + 'm') % 840),
        onToggle: () => this.setState({ hoBx: open ? null : key }), onMsg: () => this.say('Write to ' + name + '. It arrives in their Tukai inbox.') };
    });
    const bHit = bAll.filter(b => !bq || b.name.toLowerCase().indexOf(bq) >= 0 || b.handle.indexOf(bq.replace(/^@/, '')) >= 0), bShow = bq || S.hoBall ? bHit : bHit.slice(0, 8);
    const saleT = tks.reduce((a, t) => a + t.sold * t.amount, 0), pend = Math.round(saleT * 0.18);
    return {
      tixActive: tks.filter(t => !t.off), tixPaused: tks.filter(t => t.off), hasPaused: tks.some(t => t.off),
      dlView: !S.hoDlEdit, dlEdit: !!S.hoDlEdit, dlLabel: (DL.find(d => d[0] === dlKey) || DL[2])[1], dlWhen: 'Sales close ' + closeAt + (c.weekly ? ' for the next date.' : '.'),
      dlOpts: DL.map(([k, l]) => { const on = dlDraft === k; return { label: l, on: on ? 'true' : 'false', bg: on ? GRAD : '#F3F4F2', fg: on ? '#FFFFFF' : '#1F2937', onClick: () => this.setState({ hoDlDraft: k }) }; }),
      onDlEdit: () => this.setState({ hoDlEdit: true, hoDlDraft: dlKey }),
      onDlCancel: () => this.setState({ hoDlEdit: false, hoDlDraft: null }),
      onDlSave: () => { const k = this.state.hoDlDraft || dlKey; this.setState(s => ({ hoDl: Object.assign({}, s.hoDl, { [e.id]: k }), hoDlEdit: false, hoDlDraft: null })); this.say('Ticket sales now close ' + fmt(at(k)) + '.'); },
      onDiscount: () => dcOpen(null), dcs,
      gTabs, gList, gHas: gList.length > 0, gNone: !gList.length, gNoneLine: gq ? 'No one matches that search.' : gView === 'guests' ? 'No guests invited yet.' : 'No communities invited yet.',
      gSearch: !!S.hoGs, onGSearch: () => this.setState(s => ({ hoGs: !s.hoGs, hoGq: '' })), gq: S.hoGq || '', onGq: (ev) => this.setState({ hoGq: ev.target.value }),
      anStats: [st('Ticket currency', curName), st('Tickets created', tq), st('Amount per ticket', !amts.length ? 'Free' : lo === hi ? money(lo) : money(lo) + ' - ' + hi.toLocaleString('en-US')), st('Tickets sold', ts), st('Amount sold', money(ta)), st('Available tickets', tq - ts), st('Ticket sales close', closeAt, true)],
      buyers: ts, nGuests: guests.length, nComms: comms.length,
      sTotal: money(saleT), sStats: [{ label: 'Tickets sold', value: String(ts) }, { label: 'Total buyers', value: String(buys.length) }, { label: 'Pending payments', value: money(pend) }],
      onWithdraw: () => this.say(saleT ? 'Choose an amount to send to M-Pesa ending 815. ' + money(saleT - pend) + ' is available now, ' + money(pend) + ' is still clearing.' : 'There is nothing to withdraw yet. Ticket sales show up here as they come in.'),
      sActs: [
        { label: 'Share buyers list', icon: 'hgi-download-01', onClick: () => this.say(buys.length ? 'A spreadsheet of all ' + buys.length + ' buyers is ready to share.' : 'No buyers yet. The list fills up as tickets sell.') },
        { label: 'Generate sale QR', icon: 'hgi-qr-code', onClick: () => this.say('A code people can scan to buy tickets for ' + e.title + '.') },
        { label: 'Admission QR', icon: 'hgi-qr-code-scan', onClick: () => this.say('Show this code at the entrance. Guests scan it to check in.') }
      ].map((x, i) => Object.assign(x, { sep: i > 0 })),
      bq: S.hoBq || '', onBq: (ev) => this.setState({ hoBq: ev.target.value }), bList: bShow, bHas: bShow.length > 0, bNone: !bShow.length,
      bNoneLine: bq ? 'No buyer matches that search.' : 'No one has bought a ticket yet. Buyers show up here as tickets sell.',
      bMore: !bq && !S.hoBall && bHit.length > 8, onBAll: () => this.setState({ hoBall: true })
    };
  }

  // Editing one ticket type of an experience you host. Sold tickets set the floor for the quantity; a new price only applies to new buyers.
  tkeVm() {
    const S = this.state, f = S.tkeForm;
    if (!f) return { has: false };
    const set = (p) => this.setState(s => ({ tkeForm: Object.assign({}, s.tkeForm, p) }));
    const num = (v) => parseInt(String(v || '').replace(/[^0-9]/g, ''), 10) || 0;
    const m2 = (n) => f.cur + ' ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), m0 = (n) => f.cur + ' ' + Math.round(n).toLocaleString('en-US');
    const name = String(f.name || '').trim(), a = num(f.amount), q = num(f.qty);
    const err = !name ? 'Give the ticket a name.' : f.paid && !a ? 'Enter an amount per ticket.' : !q ? 'Enter how many tickets to sell.' : q < f.sold ? f.sold + ' tickets are already sold, so the quantity cannot go below ' + f.sold + '.' : '';
    const changed = name !== f.n0 || (f.paid && a !== f.a0) || q !== f.q0, ok = !err && changed;
    const notes = [];
    if (f.paid && a && a !== f.a0) notes.push(f.sold ? 'New buyers pay ' + m0(a) + '. The ' + f.sold + (f.sold === 1 ? ' person' : ' people') + ' who already bought keep the price they paid.' : 'Buyers pay ' + m0(a) + ' from now on.');
    if (q && q !== f.q0 && q >= f.sold) notes.push('Available tickets go from ' + (f.q0 - f.sold) + ' to ' + (q - f.sold) + '.');
    const back = () => { this.panelBack(); this.setState({ hoTab: 'created', tkeForm: null }); };
    const save = () => {
      if (!ok) return;
      this.setState(s => ({ hoTkEd: Object.assign({}, s.hoTkEd, { [f.eid + '|' + f.k]: { name, amount: f.paid ? a : 0, qty: q } }) }));
      back();
      this.say('Changes to ' + name + ' are saved.');
    };
    return { has: true, isTke: true, title: 'Edit ticket details', headTitle: 'Edit ticket details', canShare: false, canSave: false, onBack: back, hasWz: true,
      wz: { hasCancel: true, hasDelete: false, hasSave: false, primaryLabel: 'Save changes', primaryOk: ok, primaryNo: !ok, onCancel: back, onPrimary: save },
      tke: {
        title: f.n0, stats: f.stats,
        name: f.name, onName: (ev) => set({ name: String(ev.target.value || '').slice(0, 60) }),
        paid: f.paid, cur: f.cur, amount: a ? a.toLocaleString('en-US') : '', onAmount: (ev) => set({ amount: String(ev.target.value || '').replace(/[^0-9]/g, '').slice(0, 9) }),
        qty: f.qty, onQty: (ev) => set({ qty: String(ev.target.value || '').replace(/[^0-9]/g, '').slice(0, 6) }), qtyLabel: f.paid ? 'Number of tickets' : 'Number of spaces',
        hasSum: f.paid && a > 0 && q > 0, total: m2(a * q), each: m2(a * f.mult),
        feeOpts: [['host', 'I will pay the full commission'], ['customer', 'Customer pays the commission'], ['split', 'Split 50-50 between the customer and me']].map(([k, label]) => { const on = (f.fee || 'customer') === k; return { label, on: on ? 'true' : 'false', bg: on ? '#E8F1ED' : '#F7F8F7', fg: on ? '#044B36' : '#9AA5A0', bc: on ? '#A9CBBB' : '#EDF0EE', icon: on ? 'hgi-bulk hgi-checkmark-circle-02' : 'hgi-twotone hgi-circle' }; }),
        hasErr: !!err, err, hasNote: !err && notes.length > 0, note: notes.join(' ')
      }
    };
  }

  dcVm(id) {
    const S = this.state, fx = this.fx(), GRAD = 'linear-gradient(180deg,#0C7A50 0%,#044B36 100%)', B0 = { code: '', type: 'fixed', value: '', edit: null };
    const e = fx.experiences.concat(S.published || []).find(x => x.id === id) || { id };
    const cur = e.cur || (/^USD/.test(e.price || '') ? 'USD' : 'KES'), curName = cur === 'USD' ? 'US dollars' : 'Kenya shillings';
    const f = Object.assign({}, B0, S.dcForm), set = (p) => this.setState(s => ({ dcForm: Object.assign({}, B0, s.dcForm, p) }));
    const list = this.dcList(e), pct = f.type === 'pct', n = parseFloat(f.value);
    const taken = !!f.code && list.some(d => d.code === f.code && d.code !== f.edit);
    const err = taken ? 'You already have a code called ' + f.code + '.' : pct && n > 100 ? 'A percentage discount can\u2019t be more than 100%.' : '';
    const ok = f.code.length >= 3 && !err && n > 0;
    const back = () => { this.panelBack(); this.setState({ hoTab: 'created', dcForm: null }); };
    const save = () => {
      if (!ok) return;
      const rec = { code: f.code, type: f.type, value: n };
      const next = f.edit ? list.map(d => d.code === f.edit ? Object.assign({}, d, rec) : d) : list.concat([Object.assign(rec, { redeemed: 0 })]);
      this.setState(s => ({ dcCodes: Object.assign({}, s.dcCodes, { [e.id]: next }) }));
      back();
      if (f.edit) this.say('Changes to ' + f.code + ' are saved.'); else this.setState({ dcOk: f.code });
    };
    const head = f.edit ? 'Edit discount code' : 'Generate discount code';
    return { has: true, isDc: true, title: head, headTitle: head, canShare: false, canSave: false, onBack: back, hasWz: true,
      wz: { hasCancel: true, hasDelete: false, hasSave: false, primaryLabel: f.edit ? 'Save changes' : 'Generate discount code', primaryOk: ok, primaryNo: !ok, onCancel: back, onPrimary: save },
      dc: { code: f.code, onCode: (ev) => set({ code: String(ev.target.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) }),
        types: [['fixed', 'Fixed amount'], ['pct', 'Percentage (%)']].map(([k, l]) => { const on = f.type === k; return { label: l, on: on ? 'true' : 'false', bg: on ? GRAD : '#F3F4F2', fg: on ? '#FFFFFF' : '#1F2937', onClick: () => set({ type: k, value: '' }) }; }),
        valLabel: pct ? 'Enter percentage to discount' : 'Enter amount to discount', valPh: pct ? 'Enter percentage' : 'Enter amount', valIcon: pct ? 'hgi-percent' : 'hgi-money-remove-01',
        valNote: pct ? 'Taken off the ticket price.' : 'In ' + curName + ', taken off each ticket.',
        value: f.value, onValue: (ev) => set({ value: String(ev.target.value || '').replace(/[^0-9.]/g, '').slice(0, 8) }), err, hasErr: !!err }
    };
  }

  dcList(e) { return (this.state.dcCodes || {})[e.id] || (/^u/.test(e.id) ? [] : [{ code: 'TRVL2024', type: 'fixed', value: 500, redeemed: 32 }]); }
  hostFee(cid) { return this.isBiz(cid) ? 8 : this.subPaidNow() ? 4 : null; }

  qrImg(seed) {
    let h = 7; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100003;
      const N = 21, fin = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      let r = (h * 2654435761) >>> 0 || 1, d = '';
      const rnd = () => { r ^= r << 13; r ^= r >>> 17; r ^= r << 5; r >>>= 0; return r / 4294967296; };
      [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([x, y]) => { d += 'M' + x + ' ' + y + 'h7v7h-7zM' + (x + 1) + ' ' + (y + 1) + 'v5h5v-5zM' + (x + 2) + ' ' + (y + 2) + 'h3v3h-3z'; });
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (!fin(x, y) && ((x === 6 || y === 6) ? (x + y) % 2 === 0 : rnd() > 0.5)) d += 'M' + x + ' ' + y + 'h1v1h-1z'; }
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 25 25" shape-rendering="crispEdges"><rect x="-2" y="-2" width="25" height="25" fill="#ffffff"/><path fill="#013334" fill-rule="evenodd" d="' + d + '"/></svg>');
  }

  say(m) {
    if (this._t) clearTimeout(this._t);
    this.setState({ toast: m });
    this._t = setTimeout(() => this.setState({ toast: null }), 4200);
  }

  // Root values, for the code generated dialog
  dcOk: !!S.dcOk, dcOkCode: S.dcOk || '', onDcOk: () => this.setState({ dcOk: null }),
```
