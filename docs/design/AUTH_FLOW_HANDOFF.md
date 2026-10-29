# Handoff: Sign up and sign in

## Overview
This covers every step of getting into a Tukai account:

1. **Welcome:** choose Google, Apple or email. There are three versions: Create account, Sign in and Session expired.
2. **Email form:** name, email and password for a new account, or email and password to sign in.
3. **Check your email:** the 6-digit code (OTP). Only new email accounts see it.
4. **Select your interests:** only new accounts see it, whichever method they used. The same screen is reused to edit interests from the profile.
5. **Signed in:** a toast, then whatever the person was doing before carries on.

There is also a **sign-in nudge**, a small card in the corner of the page for people who are signed out.

## About the design
This is a **design reference** from the HTML prototype (`Tukai Web.dc.html`), not production code. Recreate it in Tukai's codebase with its existing framework and auth provider. Every delay in the prototype stands in for a real request. The exact markup and logic are at the end of this file.

**Trying it in the prototype**
- `account` prop: "Signed out" shows the top bar buttons and the nudge. "First visit" opens Create account on load.
- `emailCode` prop: "Wrong code" makes every code fail.
- `demoScreen` prop: "Session expired" opens the Session expired version.

## Fidelity
**High fidelity.** Build it pixel-perfect. All values are CSS pixels at 1x, and every font is Google Sans. Every icon is Hugeicons twotone unless noted. Phone layouts apply below a 720px viewport.

## Flows
| Path | Steps |
|---|---|
| New account, Google or Apple | Create account → Continue with Google or Apple → "Connecting to Google" (1.1s) → Select your interests → Submit → signed in |
| New account, email | Create account → Continue with email → name, email, password → Send code (0.9s) → Check your email → 6th digit typed → Verifying (0.9s) → Select your interests → Submit → signed in |
| Sign in, Google or Apple | Sign in → Continue with Google or Apple (1.1s) → signed in |
| Sign in, email | Sign in → Continue with email → email and password → Sign in (0.9s) → signed in. No code |
| Session expired | Same as Sign in, plus a "Not now" option that closes the dialog |
| Nudge, Google or Apple | Signed in straight away (1.1s), with no interests step |
| Nudge, email | Opens the Create account email form with the email already filled in |

**Entry points**
| Trigger | Opens |
|---|---|
| Top bar "Sign in" (every width) | Sign in |
| Top bar "Create account" (720px and wider only) | Create account |
| Nudge card | See section 6 |
| Any action that needs an account | Create account with a reason pill (see below). The action carries on after sign-in |
| Profile, My interests, Edit | Interests in edit mode |

**Reasons shown on Create account**

| Action | Pill text |
|---|---|
| TukAI chat | "Chatting with TukAI needs an account, so your chats stay with you." |
| Claim a place | "Claiming a place needs an account." |
| Reserve | "Booking needs an account, so your bookings stay with you." |
| Save | "Saving needs an account, so your lists follow you." |
| Join | "Joining needs an account." |
| Book | "Booking needs an account, so your tickets stay with you." |
| Plan | "Planning needs an account." |
| Host | "Hosting needs an account." |
| Share a moment | "Sharing a moment needs an account." |
| Bucket lists | "Your bucket lists live in your account." |
| Plans | "Your plans live in your account." |
| Profile | "Your profile lives in your account." |

If the person closes the dialog instead of finishing, the action is dropped.

## Top bar buttons (signed out)
```css
/* Sign in */
display: flex; align-items: center; height: 44px; padding: 0 18px; border: 1px solid #DDE3DF; border-radius: 999px;
background: #FFFFFF; font-size: 14px; font-weight: 600; color: #013334; white-space: nowrap;
/* hover */ background: #F3F4F2;

/* Create account: hidden below 720px */
display: flex; align-items: center; height: 44px; padding: 0 18px; border: 0; border-radius: 999px;
background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); font-size: 14px; font-weight: 600; color: #FFFFFF; white-space: nowrap;
/* hover */ filter: brightness(1.06);
```
They sit at the right of the top bar, 8px apart.

## Dialog frame
```css
/* Overlay: role="dialog" aria-modal="true" */
position: fixed; inset: 0; z-index: 96; display: flex; align-items: center; justify-content: center;
padding: 24px;   /* 0 on phones */

/* Scrim */
position: absolute; inset: 0; background: rgba(1,20,21,.62);
```
- **aria-label:** "Create your Tukai account" (Create account), "Sign in to Tukai" (Sign in and Session expired), "Select your interests" (interests).
- **Closing:** a click on the scrim, Escape or the Close button closes the dialog. On the interests screen during sign-up, none of these work, so the person has to submit.
- **Phones:** every card fills the screen, with no radius and no shadow gap. Content padding allows for the safe areas.

**Card sizes**
| Card | Desktop width | Desktop height |
|---|---|---|
| Welcome | `min(960px, viewport - 48)` | `min(640px, calc(100dvh - 48px))` |
| Email form and code | `min(960px, viewport - 48)` | `min(720px, calc(100dvh - 48px))` |
| Interests | `min(960px, viewport - 48)` | `min(640px, calc(100dvh - 48px))` |

Shared card style: `border-radius: 18px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.35)`.

```css
/* Close: every card, top right */
position: absolute; top: calc(12px + env(safe-area-inset-top)); right: 12px; z-index: 2;
width: 44px; height: 44px; border: 0; border-radius: 999px; background: #F3F4F2; color: #E02D3C;
/* icon */  hgi-cancel-01, 20px
/* hover */ background: #FEF3F2;

/* Back: email form and code, top left */
position: absolute; top: calc(12px + env(safe-area-inset-top)); left: 12px; z-index: 2;
width: 44px; height: 44px; border: 0; border-radius: 999px; background: #F3F4F2; color: #1F2937;
/* icon */  hgi-arrow-left-01, 20px
/* hover */ background: #E8F1ED;

/* Spinner: replaces a button's logo while busy, aria-hidden */
width: 20px; height: 20px; border-radius: 999px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #FFFFFF;
animation: tkSpin .8s linear infinite;
```

## 1. Welcome
```css
/* Card */
position: relative; display: flex; flex-direction: column; background: #0B1A26;

/* Photo, behind everything */
position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
object-position: 50% 72%;   /* 50% 50% on phones */

/* Shade over the photo */
/* desktop */ background: linear-gradient(180deg,rgba(5,16,26,.4) 0%,rgba(5,16,26,.16) 38%,rgba(5,16,26,.28) 66%,rgba(5,16,26,.8) 100%);
/* phones  */ background: linear-gradient(180deg,rgba(5,16,26,.6) 0%,rgba(5,16,26,.25) 36%,rgba(5,16,26,.4) 60%,rgba(5,16,26,.92) 100%);

/* Content column */
position: relative; flex: 1 1 auto; min-height: 0; width: 100%; overflow-y: auto;
display: flex; flex-direction: column; align-items: center; text-align: center; color: #FFFFFF;
padding: 48px 56px 32px;   /* phones: calc(64px + env(safe-area-inset-top)) 28px calc(24px + env(safe-area-inset-bottom)) */
```
**Contents, top to bottom**
1. **Logo:** `assets/logo.png`, 40px tall, turned white with `filter: brightness(0) invert(1)`. alt "Tukai".
2. **Headline** (`<h1>`): `margin-top: 32px` (44px on phones), 40px, line height 1.08, 700, letter-spacing -1px, white, `text-wrap: balance`.
   - Create account and Sign in: "Plan & discover" on the first line, then a rotating phrase in lime `#B0E800` on the second.
   - Session expired: "Your session expired", with no second line.
3. **Subtitle:** `margin-top: 14px`, `max-width: 340px`, 15.5px, line height 1.5, white.
   - Sign in: "Welcome back. Sign in the way you joined: Google, Apple or email."
   - Session expired: "For your security, you were signed out. Sign in again to pick up where you left off."
   - Create account has no subtitle.
4. **Actions:** `width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 12px; margin-top: 36px`.
5. **Spacer:** `flex: 1 1 auto; min-height: 28px`, which pushes the legal line to the bottom.
6. **Legal line:** `max-width: 340px`, 13px, line height 1.55, white. "By continuing to use Tukai, you agree to our Terms of use and Privacy policy". Both links are `#B0E800`, 600.

**Rotating phrase**
- **Phrases:** "night life", "weekend hikes", "art in the city", "new places to eat".
- **Timing:** changes every 3s, only on the Create account and Sign in welcome screens.
- **Letters in:** each letter animates `tkLetterIn .62s cubic-bezier(.2,.8,.2,1) both`, with a delay of 140ms + 26ms per letter (spaces aren't counted).
- **Old phrase out:** `tkWordOut .42s cubic-bezier(.4,0,.2,1) both`, in the same spot.
- **No layout jump:** the phrases are stacked in one grid cell with an invisible copy of the longest phrase, so the headline never changes height.
- **Screen readers:** the current phrase is in a visually hidden span. The animated copy is `aria-hidden`.

**Actions, in order**
```css
/* Reason pill: Create account only, when an action opened the dialog */
align-self: center; display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 6px 14px;
border-radius: 999px; background: rgba(1,51,52,.78); font-size: 13px; font-weight: 600; color: #FFFFFF;
/* icon */ hgi-lock, 15px, #B0E800

/* Method button: shared */
display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; padding: 0 20px;
border: 0; border-radius: 999px; font-size: 16px; font-weight: 600; white-space: nowrap;
/* active */ transform: scale(.98);
```
| Button | Background, hover | Text | Logo |
|---|---|---|---|
| Continue with Google | `#4285F4`, `#3B78E7` | `#FFFFFF` | Multicolour G, 16px, in a 28px white circle |
| Continue with Apple | `#000000`, `#1A1A1A` | `#FFFFFF` | White Apple logo, 20 × 22, `margin-top: -3px` |
| Continue with email | `#FFFFFF`, `#E8F1ED` | `#013334` | `hgi-mail-01`, 22px |

- **Busy:** Google reads "Connecting to Google" and Apple reads "Connecting to Apple", with the spinner in place of the logo and `aria-busy="true"`. Taps on any method do nothing while one is busy. Email has no busy state.
- **Sign in only:** below the buttons, `margin-top: -6px`, 15px white: "New to Tukai?" followed by a "Create an account" button. That button is inline-flex, 44px tall, padding 0 4, 15px 700 `#B0E800`, and switches to Create account.
- **Session expired only:** "Not now". `align-self: center`, 44px tall, padding 0 18, radius 999, transparent, 15px 600 white, hover `rgba(255,255,255,.12)`. It closes the dialog, and the person stays signed out.

## 2. Email form
```css
/* Card: white, split into a form column and a photo panel */
position: relative; display: flex; background: #FFFFFF;

/* Form column */
flex: 1 1 0; min-width: 0; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; align-items: center;
padding: 48px 40px 28px;   /* phones: calc(72px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom)) */
/* inner */ flex: 1 0 auto; width: 100%; max-width: 360px; display: flex; flex-direction: column; text-align: left; color: #1F2937;

/* Photo panel: 720px and wider only */
position: relative; flex: 0 0 42%; min-width: 0; background: #0B1A26;
/* photo */ position: absolute; inset: 0; object-fit: cover; object-position: 50% 60%;
/* shade */ background: linear-gradient(180deg,rgba(5,16,26,.6) 0%,rgba(5,16,26,.3) 45%,rgba(5,16,26,0) 70%);
/* text  */ position: relative; padding: 104px 40px 0;
/* h2    */ max-width: 340px; font-size: 30px; font-weight: 700; line-height: 1.15; letter-spacing: -.6px; color: #FFFFFF; text-wrap: balance;
/* p     */ margin-top: 12px; max-width: 320px; font-size: 16px; line-height: 1.5; color: #FFFFFF;
```
| | Create account | Sign in and Session expired |
|---|---|---|
| Panel heading | "Places, experiences and communities near you" | "Welcome back" |
| Panel text | "Discover places worth visiting, book experiences and join the communities behind them." | "Your bucket lists, communities and bookings are right where you left them." |
| Title | "Continue with email" | "Sign in with email" |
| Subtitle | "We'll email you a 6-digit code to verify your account." | "Use the email and password you joined with." |
| Fields | First name, Last name, Email address, Create a password | Email address, Password, Forgot password? |
| Button | "Send code", busy "Sending code" | "Sign in", busy "Signing in" |
| Focus on open | First name | Email address |

**Geometry**
| Viewport | Card | Photo panel | Form content | Name fields |
|---|---|---|---|---|
| 1440 | 960 | 403.2 | 360 | 2 × 174 |
| 720 | 672 | 282.24 | 309.76 | 2 × 148.88 |
| 390 (phone) | 390 | none | 342 | 2 × 165 |

**Column contents**
1. **Logo:** 32px tall, full colour, `align-self: flex-start`.
2. **Title** (`<h1>`): `margin-top: 28px`, 28px, line height 1.15, 700, letter-spacing -0.5px, `#1F2937`, `text-wrap: balance`.
3. **Subtitle:** `margin-top: 8px`, 15.5px, line height 1.5, `#5B6B66`.
4. **Form:** `display: flex; flex-direction: column; gap: 12px; margin-top: 24px`, with `noValidate`. Enter submits it.
5. **Spacer, then legal line:** 13px, line height 1.55, `#5B6B66`. The links are `#066349`, 600.

```css
/* Field */
/* wrapper */ display: flex; flex-direction: column; gap: 8px;
/* label   */ font-size: 15px; font-weight: 600; color: #1F2937;
/* icon    */ position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #5B6B66;
/* input   */ width: 100%; height: 56px; padding: 0 16px 0 48px; border: 1px solid #DDE3DF; border-radius: 12px;
              background: #FFFFFF; font-size: 15px; color: #1F2937; outline: none;
/* focus   */ border-color: #066349; box-shadow: 0 0 0 3px #E8F1ED;

/* Name row: Create account only */
display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;

/* Field error: role="alert" */
display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; line-height: 1.45; color: #B42318;
/* icon */ hgi-information-circle, 17px, margin-top: 1px

/* Submit */
display: flex; align-items: center; justify-content: center; gap: 10px; height: 56px; margin-top: 4px; padding: 0 20px;
border: 0; border-radius: 999px; font-size: 16px; font-weight: 600; white-space: nowrap;
/* enabled  */ background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF;
/* disabled */ background: #EDF0EE; color: #8A9793; cursor: not-allowed;
/* active   */ transform: scale(.98);
```
| Field | Icon | Input details |
|---|---|---|
| First name, Last name | `hgi-user` | `autocomplete` given-name and family-name, capitalises words, no spellcheck, up to 40 characters |
| Email address | `hgi-mail-01` | `type="email"`, `inputmode="email"`, `autocomplete="email"`, no auto-capitalise, placeholder "name@example.com" |
| Create a password / Password | `hgi-square-lock-02` | `id="au-pw"`, `autocomplete` new-password or current-password, up to 64 characters, right padding 56px for the eye button |

**Email field states:** the border is `#B42318` when there's an error, `#066349` with the focus ring while focused, otherwise `#DDE3DF`. Border and ring transition over .15s ease.

**Password extras**
```css
/* Label row */
display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 22px;

/* Forgot password?: Sign in only */
display: inline-flex; align-items: center; min-height: 44px; margin: -11px -4px; padding: 0 4px;
border: 0; background: transparent; font-size: 14.5px; font-weight: 700; color: #066349;

/* Show or hide: inside the input, right */
position: absolute; right: 6px; top: 6px; width: 44px; height: 44px; border: 0; border-radius: 999px;
background: transparent; color: #5B6B66;
/* hover */ background: #F3F4F2;
/* icon  */ hgi-view while hidden, hgi-view-off-slash while shown, 20px

/* Rule hint: Create account only */
display: flex; align-items: center; gap: 8px; font-size: 13.5px; line-height: 1.45;
/* not met */ color: #5B6B66; icon hgi-circle 17px
/* met     */ color: #066349; icon hgi-checkmark-circle-02 17px
```
- **Show or hide:** aria-label "Show password" or "Hide password", with `aria-pressed`.
- **Rule hint:** "At least 8 characters, including a number".

**Rules**
| Form | Submit enabled when |
|---|---|
| Create account | First and last name filled in, email filled in, and the password has at least 8 characters including a number |
| Sign in | Email and password both filled in |

- **Email format:** checked on submit, not while typing. A bad email shows "Enter a valid email address, like name@example.com." Typing clears the error.
- **Forgot password?:** with no valid email in the field it shows "Enter your email first, so we know where to send the reset link." Otherwise the toast reads "We sent a link to reset your password to {email}."
- **Back:** returns to Welcome.

## 3. Check your email (OTP)
Same card and column as the email form.
- **Title:** "Check your email".
- **Subtitle:** "Enter the 6-digit code we sent to {email}". The email is 600 `#1F2937`, with `overflow-wrap: anywhere`.

```css
/* Block */
display: flex; flex-direction: column; gap: 12px; margin-top: 28px;

/* Code row: two groups of three */
position: relative; display: flex; gap: 14px;
/* group */ flex: 1 1 0; min-width: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;

/* Digit box: aria-hidden */
height: 56px; border: 1px solid #DDE3DF; border-radius: 12px; background: #FFFFFF;
display: flex; align-items: center; justify-content: center;
font-size: 24px; font-weight: 700; color: #1F2937; font-variant-numeric: tabular-nums;
transition: border-color .15s ease, box-shadow .15s ease;
/* next box, while focused */ border-color: #066349; box-shadow: 0 0 0 3px #E8F1ED;
/* error, every box        */ border-color: #B42318;

/* Real input: invisible, laid over the boxes */
position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0;
background: transparent; font-size: 16px; opacity: 0; cursor: text;
```
- **Box width:** 52.33px when the column is 360px wide, 49.33px on a 390px phone.
- **Next box:** the box that takes the next digit. Once all 6 are filled it stays on the last box.
- **Real input:** `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern="[0-9]*"`, aria-label "6-digit code". The 16px font size stops iOS zooming in.
  - It gets focus when the step opens. Tapping puts the caret at the end.
  - It's read-only while verifying.
- **Typing and pasting:** anything that isn't a digit is removed, and the code is capped at 6 digits, so a pasted code works. The 6th digit verifies automatically.

**Below the boxes**
| Element | Spec |
|---|---|
| Error, `role="alert"` | Field error style: "That code isn't right. Check the latest email from Tukai and try again." The code is cleared, and typing clears the error |
| Verify | Submit style. Disabled until 6 digits are entered. Busy: "Verifying" with the spinner, still green |
| Help line | `margin-top: 6px`, 14.5px, line height 1.5, `#5B6B66`, centred. "Didn't get it? Check your spam folder." |
| Links row | `display: flex; flex-wrap: wrap; justify-content: center; gap: 0 18px; margin-top: -6px` |
| Resend, waiting | 44px tall, 15px 600 `#5B6B66`, tabular numbers. "Resend code in 0:27" |
| Resend, ready | Button: 44px tall, padding 0 4, 15px 700 `#066349`. "Resend code" |
| Use a different email | Same style as Resend code. Goes back to the email form |

- **Resend:** the countdown starts at 30s after each send. Resending clears the code and any error, restarts the countdown and shows the toast "We sent a new code to {email}."
- **Back and "Use a different email":** both return to the email form. Names, email and password are kept, so the person presses Send code again.
- **Correct code:** goes to Select your interests.

## 4. Select your interests
```css
/* Card */
position: relative; display: flex; flex-direction: column; background: #0B1A26;
/* photo */ same image and position as Welcome
/* shade */ background: linear-gradient(180deg,rgba(5,16,26,.62) 0%,rgba(5,16,26,.5) 45%,rgba(5,16,26,.6) 75%,rgba(5,16,26,.9) 100%);

/* Scroll area */
position: relative; flex: 1 1 auto; min-height: 0; overflow-y: auto;
display: flex; flex-direction: column; align-items: center; text-align: center; color: #FFFFFF;
padding: 36px 48px 8px;   /* phones: calc(68px + env(safe-area-inset-top)) 20px 12px */

/* Chip row */
display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; max-width: 860px; margin-top: 24px;

/* Chip: aria-pressed */
display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 18px 0 14px; border: 0; border-radius: 999px;
backdrop-filter: blur(8px); font-size: 15px; white-space: nowrap; transition: background .15s ease, color .15s ease;
/* off    */ background: rgba(255,255,255,.14); color: #FFFFFF; font-weight: 500;
/* on     */ background: #B0E800; color: #013334; font-weight: 600;
/* active */ transform: scale(.97);
/* icon   */ 22 × 22 image, alt "", outline icon drawn at stroke width 1.2 in the text colour

/* Footer: pinned under the scroll area */
position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 10px;
padding: 12px 24px calc(22px + env(safe-area-inset-bottom));
/* count  */ font-size: 13px; color: #FFFFFF;   /* aria-live="polite" */
/* submit */ width: 100%; max-width: 360px; height: 56px; border: 0; border-radius: 999px; font-size: 16px; font-weight: 600;
/* submit, enabled  */ background: linear-gradient(180deg,#0C7A50 0%,#044B36 100%); color: #FFFFFF;
/* submit, disabled */ background: rgba(255,255,255,.16); color: #C9D1CF; cursor: not-allowed;
```
**Scroll area contents**
1. **Logo:** 30px tall, white.
2. **Title** (`<h1>`): `margin-top: 20px`, 34px, line height 1.12, 700, letter-spacing -0.8px, `text-wrap: balance`.
3. **Subtitle:** `margin-top: 10px`, `max-width: 460px`, 16px, line height 1.5.
4. **Chip row.**

| | During sign-up | Edit from the profile |
|---|---|---|
| Title | "Select your interests" | "Your interests" |
| Subtitle | "What are some of your favourite experiences? Click to select" | "Pick what you like doing. You can change these any time." |
| Starts with | Nothing selected | The saved interests |
| Close, scrim, Escape | Not available | Close the dialog without saving |
| Count line | "Pick as many as you like", or "{n} selected" | Same |
| Button | "Submit" | "Save interests" |
| Result | Signed in, interests saved | Toast: "Interests saved to your profile." |

The button stays disabled until at least one chip is on.

**Chips, in order**

| Label | Icon | Label | Icon |
|---|---|---|---|
| Hiking | hiking | Parks & museums | signpost |
| Running | workout-run | Fishing | fish |
| Camping | tent | Scenic driving/road trip | car-04 |
| Cycling | bicycle-01 | Horse riding | cowboy-hat |
| Backpacking | backpack-01 | Sunset | sunset |
| Walking | walking | Restaurants | noodles |
| Overlanding | car-01 | Rock climbing | mountain |
| Bird watching | bird | Sports activity | football-pitch |
| Safari | car-03 | Kids | baby-01 |
| Gym | dumbbell-01 | Water sports | swimming |
| Night life | tongue-wink-right | Worship | hand-prayer |
| Shopping | shopping-bag-01 | Other | three circles (custom) |

- **Order:** read down the left pair of columns first, then the right, so Hiking comes first and Other last.
- **Icons:** the place category icons used across Discover, drawn at stroke width 1.2. Each interest is the same id as its place category.

## 5. Signed in
- **Result:** the dialog closes and the person is signed in. If an action opened the dialog, it carries on straight after.
- **Toast:** `fixed`, centred at the bottom. Pill style: padding 14px 22px, radius 999, `#013334`, white 14px, line height 1.4, `max-width: min(560px, calc(100vw - 32px))`, shadow `0 14px 34px rgba(1,51,52,.3)`. It stays for 4.2s.

| Case | Toast |
|---|---|
| Sign in | "Signed in with Google. Welcome back, Wanjiku." The method reads "with Apple" or "with your email" instead |
| New account with interests | "Welcome to Tukai, {first name}. Your interests are saved to your profile." The name only appears for email sign-ups |

## 6. Sign-in nudge
A card in the corner that appears 1.2s after the page loads for anyone signed out.
- **Hidden when:** the person dismissed it, or the sign-in dialog, a side panel, the create menu, filters, an error screen or the gallery is open.
- **Close:** hides it for the rest of the session.

```css
/* Card: <aside aria-label="Sign in or sign up"> */
position: fixed; z-index: 58; padding: 28px 24px 24px; border-radius: 18px; background: #FFFFFF;
box-shadow: 0 2px 8px rgba(1,51,52,.06), 0 18px 48px rgba(1,51,52,.18);
display: flex; flex-direction: column; align-items: center; text-align: center;
/* desktop */ right: 24px; bottom: 24px; width: 360px;
/* phones  */ left: 12px; right: 12px; bottom: calc(84px + env(safe-area-inset-bottom));   /* above the bottom nav */
/* enter   */ opacity 0 → 1 over .35s ease; translateY(16px) → 0 over .45s cubic-bezier(.2,.8,.2,1)

/* Close */ position: absolute; top: 12px; right: 12px; same style as the dialog Close
/* Logo  */ 30px tall, margin-top: 4px
/* h2    */ margin-top: 18px; font-size: 19px; font-weight: 700; line-height: 1.3; letter-spacing: -.2px; color: #1F2937;
/* p     */ margin-top: 6px; font-size: 14.5px; line-height: 1.45; color: #5B6B66;

/* Actions */
align-self: stretch; display: flex; flex-direction: column; gap: 10px; margin-top: 22px;
/* Google, Apple */ same as the Welcome buttons, but height: 52px; font-size: 15.5px
/* divider */       height: 1px; margin: 6px 0; background: #EDF0EE;
/* email input */   height: 52px; padding: 0 16px; border: 1px solid #DDE3DF; border-radius: 12px; font-size: 15px; no icon
/* email button */  height: 52px; radius 999; 15.5px 600; enabled: green gradient and white; disabled: #EDF0EE and #8A9793
```
**Copy**
- **Heading:** "Sign in or sign up for free".
- **Text:** "Save places, join communities and book experiences."
- **Email input:** placeholder "Enter your email", aria-label "Email address".
- **Email button:** "Continue with email". Enabled once something is typed.

**Behaviour**
- **Google or Apple:** "Connecting to …" for 1.1s, then signed in.
- **Email:** the format is checked first, with the same error as the email form. Then the Create account email form opens with the email filled in, and the nudge closes.

## Keyboard
- **Escape:** closes the dialog, except on the interests screen during sign-up.
- **Enter:** submits the email form.
- **Code:** the 6th digit submits it. Verify does the same.

## State
| State | Values |
|---|---|
| `authView` | null, register, signin, expired, interests |
| `authStep` | null (Welcome), email, code |
| `authBusy` | null, google, apple |
| `authWhy` | reason pill text |
| `authFirst`, `authLast`, `authEmail`, `authPw`, `pwShow` | email form fields |
| `emailErr`, `sendBusy` | email form error and busy state |
| `otp`, `otpErr`, `otpBusy`, `otpSentAt` | code step |
| `intsMode`, `intsDraft` | onboard or edit, and the chips picked |
| `myInts`, `intsSet` | saved interests |
| `word` | rotating phrase counter |
| `nudgeIn`, `nudgeOff`, `nudgeBusy`, `ngEmail`, `ngEmailErr` | nudge card |

## Accessibility
- **Dialog:** `aria-modal` with a label for each screen. The prototype doesn't trap focus. Trap it, and return focus to the trigger when the dialog closes.
- **Focus on open:** first name (Create account), email (Sign in) and the code input (code step).
- **Busy and errors:** busy buttons use `aria-busy`. Errors are `role="alert"`, and the interests count is `aria-live="polite"`.
- **Code input:** one real input, so email and SMS autofill work. The visible boxes are `aria-hidden`.
- **Toggles:** chips use `aria-pressed`, and so does the password eye.
- **Targets:** all are 44px or taller.

## Tokens used
| Value | Where |
|---|---|
| `rgba(1,20,21,.62)` | Dialog scrim |
| `#0B1A26` | Photo card background |
| `#B0E800` | Rotating phrase, links on photo, Create an account, selected chip, reason pill lock |
| `rgba(1,51,52,.78)` | Reason pill |
| `#4285F4`, `#3B78E7` | Google button and hover |
| `#000000`, `#1A1A1A` | Apple button and hover |
| `linear-gradient(180deg,#0C7A50 0%,#044B36 100%)` | Send code, Sign in, Verify, Submit, Create account |
| `#EDF0EE`, `#8A9793` | Disabled buttons |
| `rgba(255,255,255,.16)`, `#C9D1CF` | Disabled Submit on interests |
| `rgba(255,255,255,.14)` | Off chips |
| `#066349` | Focus border, links, rule met, next code box |
| `#E8F1ED` | Focus ring, email button hover, Back hover |
| `#DDE3DF` | Field and box borders |
| `#B42318` | Errors |
| `#1F2937`, `#5B6B66` | Text and secondary text |
| `#F3F4F2`, `#E02D3C`, `#FEF3F2` | Close button and hover |
| 12px | Fields and code boxes |
| 18px | Cards and nudge |
| 999px | Buttons, chips, pills |

## Open items
1. **No account check:** the prototype never checks whether an account exists. Google or Apple on Create account always goes to interests, and on Sign in always signs in. The build should sign in existing accounts from either screen, and send new ones to interests.
2. **Nudge skips interests:** Google or Apple from the nudge always signs in, so a new person never picks interests and is told "Welcome back".
3. **Fixed name:** the sign-in toast always says "Wanjiku". Use the account's first name.
4. **Forgot password check:** the check is broken and rejects any email containing the letter "s". Use the same check as the email form. The reset email and reset screens aren't designed yet.
5. **Email sign-in errors:** there's no wrong password state, no unknown email state and no lockout after repeated attempts.
6. **Code errors:** there's no expired-code state and no limit on attempts or resends.
7. **No route back to Sign in:** Create account has no "Already have an account? Sign in" link. Only Sign in links the other way.
8. **Skip on interests:** sign-up can't skip interests, but the prototype still keeps a skip path and its toast ("Pick your interests any time from You."). Decide whether Skip exists.
9. **Interests copy:** "Click to select" has no full stop, ends in a stray line break and says "Click" on touch screens. The legal line and the code subtitle are also missing full stops.
10. **Plans reason:** "Your plans live in your account." refers to the Plans page, which no longer exists. Remove it.
11. **Interests size:** the interests screen uses the 960 × 640 welcome card. The logic also defines a 600px width and 760px height that nothing uses. Confirm which size is intended.
12. **Error red:** errors here are `#B42318`, but Settings uses Tukai red `#E02D3C`. Pick one.
13. **Reduced motion:** the rotating phrase ignores `prefers-reduced-motion`. Show it without the letter animation.
14. **Password kept:** closing the dialog keeps the typed password in memory. Clear it on close.
15. **Brand rules:** check the Google and Apple buttons against each company's sign-in branding rules before launch.

## Exact markup
Verbatim from `Tukai Web.dc.html`:
- `{{ }}` holes are filled by the logic below.
- `style-hover`, `style-focus` and `style-active` hold those states.
- `<sc-if>` renders its children only when its value is true.
- `<sc-for>` repeats its child once per item.

### Top bar buttons
```html
<sc-if value="{{ signedOut }}">
<button type="button" onClick="{{ onSignIn }}" style="display:flex;align-items:center;height:44px;padding:0 18px;border:1px solid #DDE3DF;border-radius:999px;background:#FFFFFF;font-family:'Google Sans';font-size:14px;font-weight:600;color:#013334;cursor:pointer;white-space:nowrap;" style-hover="background:#F3F4F2;">Sign in</button>
<sc-if value="{{ tb.showJoin }}"><button type="button" onClick="{{ onRegister }}" style="display:flex;align-items:center;height:44px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(180deg,#0C7A50 0%,#044B36 100%);font-family:'Google Sans';font-size:14px;font-weight:600;color:#FFFFFF;cursor:pointer;white-space:nowrap;" style-hover="filter:brightness(1.06);">Create account</button></sc-if>
</sc-if>
```

### Sign-in dialog (Welcome, email form, code, interests)
```html
<sc-if value="{{ au.open }}">
  <div role="dialog" aria-modal="true" aria-label="{{ au.aria }}" style="position:fixed;inset:0;z-index:96;display:flex;align-items:center;justify-content:center;padding:{{ au.pad }};font-family:'Google Sans';">
    <div onClick="{{ au.onScrim }}" aria-hidden="true" style="position:absolute;inset:0;background:rgba(1,20,21,.62);"></div>
    <sc-if value="{{ au.isWelcome }}"><sc-if value="{{ au.isPick }}" hint-placeholder-val="{{ true }}">
      <div style="position:relative;width:100%;max-width:{{ au.cardW }};height:{{ au.cardH }};border-radius:{{ au.radius }};overflow:hidden;background:#0B1A26;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.35);">
        <img loading="lazy" src="{{ au.photo }}" alt="" style="position:absolute;top:0;right:0;bottom:0;left:{{ au.photoL }};width:{{ au.photoW }};height:100%;object-fit:cover;object-position:{{ au.photoPos }};display:block;">
        <div aria-hidden="true" style="position:absolute;inset:0;background:{{ au.shade }};"></div>
        <button type="button" onClick="{{ au.onClose }}" aria-label="Close" style="position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;z-index:2;width:44px;height:44px;border:none;border-radius:999px;background:#F3F4F2;color:#E02D3C;display:flex;align-items:center;justify-content:center;cursor:pointer;" style-hover="background:#FEF3F2;"><i class="hgi-twotone hgi-cancel-01" style="font-size:20px;" aria-hidden="true"></i></button>
        <div style="position:relative;flex:1 1 auto;min-height:0;width:{{ au.cW }};overflow-y:auto;display:flex;flex-direction:column;align-items:{{ au.cAlign }};padding:{{ au.cPad }};text-align:{{ au.tAlign }};color:#FFFFFF;">
          <img src="assets/logo.png" alt="Tukai" style="height:40px;width:auto;display:block;filter:brightness(0) invert(1);">
          <sc-if value="{{ au.isPick }}" hint-placeholder-val="{{ true }}">
          <h1 style="margin:{{ au.h1Mt }} 0 0;font-size:40px;line-height:1.08;font-weight:700;letter-spacing:-1px;color:#FFFFFF;text-wrap:balance;">
            <span style="display:block;">{{ au.h1a }}</span>
            <sc-if value="{{ au.hasH1b }}">{{ au.wordEl }}</sc-if>
          </h1>
          <sc-if value="{{ au.hasSub }}"><p style="margin:14px 0 0;max-width:340px;font-size:15.5px;line-height:1.5;color:#FFFFFF;text-wrap:pretty;">{{ au.sub }}</p></sc-if>
          <div style="width:100%;max-width:360px;display:flex;flex-direction:column;align-items:stretch;gap:12px;margin-top:36px;">
            <sc-if value="{{ au.hasWhy }}"><span style="align-self:{{ au.selfAlign }};display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:6px 14px;border-radius:999px;background:rgba(1,51,52,.78);font-size:13px;font-weight:600;color:#FFFFFF;text-wrap:pretty;"><i class="hgi-twotone hgi-lock" style="font-size:15px;flex:0 0 auto;color:#B0E800;" aria-hidden="true"></i>{{ au.why }}</span></sc-if>
            <button type="button" onClick="{{ au.onGoogle }}" aria-busy="{{ au.gBusy }}" style="display:flex;align-items:center;justify-content:center;gap:12px;height:56px;padding:0 20px;border:none;border-radius:999px;background:#4285F4;color:#FFFFFF;white-space:nowrap;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:pointer;" style-hover="background:#3B78E7;" style-active="transform:scale(0.98);">
              <sc-if value="{{ au.gIdle }}" hint-placeholder-val="{{ true }}"><span aria-hidden="true" style="width:28px;height:28px;flex:0 0 auto;border-radius:999px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true" style="display:block;"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg></span></sc-if>
              <sc-if value="{{ au.gBusy }}">{{ au.spin }}</sc-if>
              {{ au.gLabel }}
            </button>
            <button type="button" onClick="{{ au.onApple }}" aria-busy="{{ au.aBusy }}" style="display:flex;align-items:center;justify-content:center;gap:12px;height:56px;padding:0 20px;border:none;border-radius:999px;background:#000000;color:#FFFFFF;white-space:nowrap;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:pointer;" style-hover="background:#1A1A1A;" style-active="transform:scale(0.98);">
              <sc-if value="{{ au.aIdle }}" hint-placeholder-val="{{ true }}"><svg width="20" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true" style="display:block;flex:0 0 auto;margin-top:-3px;"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"></path></svg></sc-if>
              <sc-if value="{{ au.aBusy }}">{{ au.spin }}</sc-if>
              {{ au.aLabel }}
            </button>
            <button type="button" onClick="{{ au.onEmail }}" style="display:flex;align-items:center;justify-content:center;gap:12px;height:56px;padding:0 20px;border:none;border-radius:999px;background:#FFFFFF;color:#013334;white-space:nowrap;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:pointer;" style-hover="background:#E8F1ED;" style-active="transform:scale(0.98);"><i class="hgi-twotone hgi-mail-01" style="font-size:22px;flex:0 0 auto;" aria-hidden="true"></i>Continue with email</button>
            <sc-if value="{{ au.isRegister }}"></sc-if>
            <sc-if value="{{ au.isSignin }}"><p style="margin:-6px 0 0;font-size:15px;color:#FFFFFF;">New to Tukai? <button type="button" onClick="{{ au.onToRegister }}" style="display:inline-flex;align-items:center;min-height:44px;padding:0 4px;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:700;color:#B0E800;cursor:pointer;white-space:nowrap;">Create an account</button></p></sc-if>
            <sc-if value="{{ au.isExpired }}"><button type="button" onClick="{{ au.onClose }}" style="align-self:{{ au.selfAlign }};min-height:44px;padding:0 18px;border:none;border-radius:999px;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:600;color:#FFFFFF;cursor:pointer;" style-hover="background:rgba(255,255,255,.12);">Not now</button></sc-if>
          </div>
          </sc-if>
          <span aria-hidden="true" style="flex:1 1 auto;min-height:28px;"></span>
          <p style="margin:0;max-width:340px;font-size:13px;line-height:1.55;color:#FFFFFF;text-wrap:pretty;">By continuing to use Tukai, you agree to our <a href="#" onClick="{{ au.onTerms }}" style="color:#B0E800;font-weight:600;">Terms of use</a> and <a href="#" onClick="{{ au.onPrivacy }}" style="color:#B0E800;font-weight:600;">Privacy policy</a></p>
        </div>
      </div>
    </sc-if>
    <sc-if value="{{ au.isForm }}">
      <div style="position:relative;width:100%;max-width:{{ au.cardW }};height:{{ au.fH }};border-radius:{{ au.radius }};overflow:hidden;background:#FFFFFF;display:flex;box-shadow:0 30px 80px rgba(0,0,0,.35);">
        <button type="button" onClick="{{ au.onBack }}" aria-label="Back" style="position:absolute;top:calc(12px + env(safe-area-inset-top));left:12px;z-index:2;width:44px;height:44px;border:none;border-radius:999px;background:#F3F4F2;color:#1F2937;display:flex;align-items:center;justify-content:center;cursor:pointer;" style-hover="background:#E8F1ED;"><i class="hgi-twotone hgi-arrow-left-01" style="font-size:20px;" aria-hidden="true"></i></button>
        <button type="button" onClick="{{ au.onClose }}" aria-label="Close" style="position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;z-index:2;width:44px;height:44px;border:none;border-radius:999px;background:#F3F4F2;color:#E02D3C;display:flex;align-items:center;justify-content:center;cursor:pointer;" style-hover="background:#FEF3F2;"><i class="hgi-twotone hgi-cancel-01" style="font-size:20px;" aria-hidden="true"></i></button>
        <div style="flex:1 1 0;min-width:0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:{{ au.fPad }};">
          <div style="flex:1 0 auto;width:100%;max-width:360px;display:flex;flex-direction:column;align-items:stretch;text-align:left;color:#1F2937;">
            <img src="assets/logo.png" alt="Tukai" style="height:32px;width:auto;display:block;align-self:flex-start;">
            <sc-if value="{{ au.isEmail }}" hint-placeholder-val="{{ true }}">
              <h1 style="margin:28px 0 0;font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-.5px;color:#1F2937;text-wrap:balance;">{{ au.emailTitle }}</h1>
              <p style="margin:8px 0 0;font-size:15.5px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">{{ au.emailSub }}</p>
              <form onSubmit="{{ au.onSend }}" noValidate="{{ true }}" style="display:flex;flex-direction:column;align-items:stretch;gap:12px;margin:24px 0 0;">
                <sc-if value="{{ au.askName }}"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;"><label style="display:flex;flex-direction:column;gap:8px;min-width:0;"><span style="font-size:15px;font-weight:600;color:#1F2937;">First name</span><span style="position:relative;display:block;"><i class="hgi-twotone hgi-user" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i><input type="text" ref="{{ au.firstRef }}" value="{{ au.first }}" onChange="{{ au.onFirst }}" autoComplete="given-name" autoCapitalize="words" spellCheck="false" style="width:100%;box-sizing:border-box;height:56px;padding:0 16px 0 48px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;"></span></label><label style="display:flex;flex-direction:column;gap:8px;min-width:0;"><span style="font-size:15px;font-weight:600;color:#1F2937;">Last name</span><span style="position:relative;display:block;"><i class="hgi-twotone hgi-user" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i><input type="text" ref="{{ au.lastRef }}" value="{{ au.last }}" onChange="{{ au.onLast }}" autoComplete="family-name" autoCapitalize="words" spellCheck="false" style="width:100%;box-sizing:border-box;height:56px;padding:0 16px 0 48px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;"></span></label></div></sc-if>
                <label style="display:flex;flex-direction:column;gap:8px;">
                  <span style="font-size:15px;font-weight:600;color:#1F2937;">Email address</span>
                  <span style="position:relative;display:block;"><i class="hgi-twotone hgi-mail-01" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i><input type="email" ref="{{ au.emailRef }}" value="{{ au.email }}" onChange="{{ au.onEmailInput }}" onFocus="{{ au.onEmailFocus }}" onBlur="{{ au.onEmailBlur }}" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck="false" placeholder="name@example.com" aria-invalid="{{ au.emailBad }}" style="width:100%;box-sizing:border-box;height:56px;padding:0 16px 0 48px;border:1px solid {{ au.emailBc }};border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;box-shadow:{{ au.emailRing }};transition:border-color .15s ease, box-shadow .15s ease;"></span>
                </label>
                <sc-if value="{{ au.emailBad }}"><p role="alert" style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:1.45;color:#B42318;text-wrap:pretty;"><i class="hgi-twotone hgi-information-circle" style="font-size:17px;flex:0 0 auto;margin-top:1px;" aria-hidden="true"></i>{{ au.emailErr }}</p></sc-if>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:22px;">
                    <label for="au-pw" style="font-size:15px;font-weight:600;color:#1F2937;">{{ au.pwLabel }}</label>
                    <sc-if value="{{ au.isSigninForm }}"><button type="button" onClick="{{ au.onForgot }}" style="display:inline-flex;align-items:center;min-height:44px;margin:-11px -4px;padding:0 4px;border:none;background:transparent;font-family:'Google Sans';font-size:14.5px;font-weight:700;color:#066349;cursor:pointer;white-space:nowrap;">Forgot password?</button></sc-if>
                  </div>
                  <span style="position:relative;display:block;"><i class="hgi-twotone hgi-square-lock-02" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:20px;color:#5B6B66;pointer-events:none;" aria-hidden="true"></i><input id="au-pw" type="{{ au.pwType }}" value="{{ au.pw }}" onChange="{{ au.onPw }}" autoComplete="{{ au.pwAc }}" spellCheck="false" autoCapitalize="none" style="width:100%;box-sizing:border-box;height:56px;padding:0 56px 0 48px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;"><button type="button" onClick="{{ au.onPwToggle }}" aria-label="{{ au.pwToggleAria }}" aria-pressed="{{ au.pwShown }}" style="position:absolute;right:6px;top:6px;width:44px;height:44px;border:none;border-radius:999px;background:transparent;color:#5B6B66;display:flex;align-items:center;justify-content:center;cursor:pointer;" style-hover="background:#F3F4F2;"><i class="{{ au.pwEye }}" style="font-size:20px;" aria-hidden="true"></i></button></span>
                  <sc-if value="{{ au.isRegisterForm }}"><p style="margin:0;display:flex;align-items:center;gap:8px;font-size:13.5px;line-height:1.45;color:{{ au.pwHintFg }};"><i class="{{ au.pwHintIc }}" style="font-size:17px;flex:0 0 auto;" aria-hidden="true"></i>At least 8 characters, including a number</p></sc-if>
                </div>
                <button type="submit" disabled="{{ au.sendOff }}" aria-busy="{{ au.sendBusy }}" style="display:flex;align-items:center;justify-content:center;gap:10px;height:56px;margin-top:4px;padding:0 20px;border:none;border-radius:999px;background:{{ au.sendBg }};color:{{ au.sendFg }};white-space:nowrap;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:{{ au.sendCursor }};" style-active="transform:scale(0.98);"><sc-if value="{{ au.sendBusy }}">{{ au.spin }}</sc-if>{{ au.sendLabel }}</button>
              </form>
            </sc-if>
            <sc-if value="{{ au.isCode }}">
              <h1 style="margin:28px 0 0;font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-.5px;color:#1F2937;text-wrap:balance;">Check your email</h1>
              <p style="margin:8px 0 0;font-size:15.5px;line-height:1.5;color:#5B6B66;text-wrap:pretty;">Enter the 6-digit code we sent to <strong style="font-weight:600;color:#1F2937;overflow-wrap:anywhere;">{{ au.email }}</strong></p>
              <div style="display:flex;flex-direction:column;align-items:stretch;gap:12px;margin-top:28px;">
                <div style="position:relative;display:flex;gap:14px;">
                  <div style="flex:1 1 0;min-width:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;"><sc-for list="{{ au.boxesA }}" as="b" hint-placeholder-count="3"><span aria-hidden="true" style="height:56px;box-sizing:border-box;border:1px solid {{ b.bc }};border-radius:12px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#1F2937;font-variant-numeric:tabular-nums;box-shadow:{{ b.ring }};transition:border-color .15s ease, box-shadow .15s ease;">{{ b.d }}</span></sc-for></div>
                  <div style="flex:1 1 0;min-width:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;"><sc-for list="{{ au.boxesB }}" as="b" hint-placeholder-count="3"><span aria-hidden="true" style="height:56px;box-sizing:border-box;border:1px solid {{ b.bc }};border-radius:12px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#1F2937;font-variant-numeric:tabular-nums;box-shadow:{{ b.ring }};transition:border-color .15s ease, box-shadow .15s ease;">{{ b.d }}</span></sc-for></div>
                  <input type="text" ref="{{ au.codeRef }}" value="{{ au.code }}" onChange="{{ au.onCodeInput }}" onFocus="{{ au.onCodeFocus }}" onBlur="{{ au.onCodeBlur }}" onClick="{{ au.onCodeEnd }}" readOnly="{{ au.otpBusy }}" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" aria-label="6-digit code" aria-invalid="{{ au.codeBad }}" style="position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;margin:0;padding:0;border:none;background:transparent;font-size:16px;opacity:0;cursor:text;">
                </div>
                <sc-if value="{{ au.codeBad }}"><p role="alert" style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:1.45;color:#B42318;text-wrap:pretty;"><i class="hgi-twotone hgi-information-circle" style="font-size:17px;flex:0 0 auto;margin-top:1px;" aria-hidden="true"></i>{{ au.codeErr }}</p></sc-if>
                <button type="button" onClick="{{ au.onVerify }}" disabled="{{ au.verifyOff }}" aria-busy="{{ au.otpBusy }}" style="display:flex;align-items:center;justify-content:center;gap:10px;height:56px;margin-top:4px;padding:0 20px;border:none;border-radius:999px;background:{{ au.verifyBg }};color:{{ au.verifyFg }};white-space:nowrap;font-family:'Google Sans';font-size:16px;font-weight:600;cursor:{{ au.verifyCursor }};" style-active="transform:scale(0.98);"><sc-if value="{{ au.otpBusy }}">{{ au.spin }}</sc-if>{{ au.verifyLabel }}</button>
                <p style="margin:6px 0 0;font-size:14.5px;line-height:1.5;color:#5B6B66;text-align:center;text-wrap:pretty;">Didn't get it? Check your spam folder.</p>
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0 18px;margin-top:-6px;">
                  <sc-if value="{{ au.canResend }}"><button type="button" onClick="{{ au.onResend }}" style="display:inline-flex;align-items:center;min-height:44px;padding:0 4px;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:700;color:#066349;cursor:pointer;white-space:nowrap;">Resend code</button></sc-if>
                  <sc-if value="{{ au.resendWait }}"><span style="display:inline-flex;align-items:center;min-height:44px;padding:0 4px;font-size:15px;font-weight:600;color:#5B6B66;white-space:nowrap;font-variant-numeric:tabular-nums;">{{ au.resendLine }}</span></sc-if>
                  <button type="button" onClick="{{ au.onChangeEmail }}" style="display:inline-flex;align-items:center;min-height:44px;padding:0 4px;border:none;background:transparent;font-family:'Google Sans';font-size:15px;font-weight:700;color:#066349;cursor:pointer;white-space:nowrap;">Use a different email</button>
                </div>
              </div>
            </sc-if>
            <span aria-hidden="true" style="flex:1 1 auto;min-height:28px;"></span>
            <p style="margin:0;font-size:13px;line-height:1.55;color:#5B6B66;text-wrap:pretty;">By continuing to use Tukai, you agree to our <a href="#" onClick="{{ au.onTerms }}" style="color:#066349;font-weight:600;">Terms of use</a> and <a href="#" onClick="{{ au.onPrivacy }}" style="color:#066349;font-weight:600;">Privacy policy</a></p>
          </div>
        </div>
        <sc-if value="{{ au.formPhoto }}"><div style="position:relative;flex:0 0 42%;min-width:0;background:#0B1A26;"><img loading="lazy" src="{{ au.photo }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 60%;display:block;"><div aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,16,26,.6) 0%,rgba(5,16,26,.3) 45%,rgba(5,16,26,0) 70%);"></div><div style="position:relative;padding:104px 40px 0;display:flex;flex-direction:column;align-items:flex-start;"><sc-if value="{{ au.isRegister }}" hint-placeholder-val="{{ true }}"><h2 style="margin:0;max-width:340px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-.6px;color:#FFFFFF;text-wrap:balance;">Places, experiences and communities near you</h2><p style="margin:12px 0 0;max-width:320px;font-size:16px;line-height:1.5;color:#FFFFFF;text-wrap:pretty;">Discover places worth visiting, book experiences and join the communities behind them.</p></sc-if><sc-if value="{{ au.notRegister }}"><h2 style="margin:0;max-width:340px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-.6px;color:#FFFFFF;text-wrap:balance;">Welcome back</h2><p style="margin:12px 0 0;max-width:320px;font-size:16px;line-height:1.5;color:#FFFFFF;text-wrap:pretty;">Your bucket lists, communities and bookings are right where you left them.</p></sc-if></div></div></sc-if>
      </div>
    </sc-if>
    </sc-if>
    <sc-if value="{{ au.isInts }}">
      <div style="position:relative;width:100%;max-width:{{ au.cardW }};height:{{ au.cardH }};border-radius:{{ au.radius }};overflow:hidden;background:#0B1A26;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.35);">
        <img loading="lazy" src="{{ au.photo }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{{ au.photoPos }};display:block;">
        <div aria-hidden="true" style="position:absolute;inset:0;background:{{ au.intsShade }};"></div>
        <div style="position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;z-index:2;display:flex;align-items:center;gap:8px;">
          <sc-if value="{{ au.canSkip }}"></sc-if>
          <sc-if value="{{ au.canCloseInts }}"><button type="button" onClick="{{ au.onClose }}" aria-label="Close" style="width:44px;height:44px;border:none;border-radius:999px;background:#F3F4F2;color:#E02D3C;display:flex;align-items:center;justify-content:center;cursor:pointer;" style-hover="background:#FEF3F2;"><i class="hgi-twotone hgi-cancel-01" style="font-size:20px;" aria-hidden="true"></i></button></sc-if>
        </div>
        <div style="position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:{{ au.intsPad }};text-align:center;color:#FFFFFF;">
          <img src="assets/logo.png" alt="Tukai" style="height:30px;width:auto;display:block;flex:0 0 auto;filter:brightness(0) invert(1);">
          <h1 style="margin:20px 0 0;font-size:34px;line-height:1.12;font-weight:700;letter-spacing:-.8px;color:#FFFFFF;text-wrap:balance;">{{ au.intsTitle }}</h1>
          <p style="margin:10px 0 0;max-width:460px;font-size:16px;line-height:1.5;color:#FFFFFF;text-wrap:pretty;">{{ au.intsSub }}</p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:860px;margin-top:24px;">
            <sc-for list="{{ au.chips }}" as="c" hint-placeholder-count="12">
              <button type="button" aria-pressed="{{ c.on }}" onClick="{{ c.onClick }}" style="display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 18px 0 14px;border:none;border-radius:999px;background:{{ c.bg }};backdrop-filter:blur(8px);color:{{ c.fg }};font-family:'Google Sans';font-size:15px;font-weight:{{ c.fw }};cursor:pointer;white-space:nowrap;transition:background .15s ease, color .15s ease;" style-active="transform:scale(0.97);">
                <img loading="lazy" src="{{ c.icon }}" alt="" style="width:22px;height:22px;flex:0 0 auto;display:block;">
                {{ c.label }}
              </button>
            </sc-for>
          </div>
        </div>
        <div style="position:relative;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 24px calc(22px + env(safe-area-inset-bottom));">
          <span aria-live="polite" style="font-size:13px;color:#FFFFFF;">{{ au.countLine }}</span>
          <button type="button" onClick="{{ au.onSubmit }}" disabled="{{ au.submitOff }}" style="width:100%;max-width:360px;height:56px;border:none;border-radius:999px;background:{{ au.submitBg }};color:{{ au.submitFg }};font-family:'Google Sans';font-size:16px;font-weight:600;cursor:{{ au.submitCursor }};">{{ au.submitLabel }}</button>
        </div>
      </div>
    </sc-if>
  </div>
</sc-if>
```

### Sign-in nudge
```html
<sc-if value="{{ ng.show }}">
  <aside aria-label="Sign in or sign up" style="position:fixed;z-index:58;right:{{ ng.right }};left:{{ ng.left }};bottom:{{ ng.bottom }};width:{{ ng.width }};box-sizing:border-box;padding:28px 24px 24px;border-radius:18px;background:#FFFFFF;box-shadow:0 2px 8px rgba(1,51,52,.06),0 18px 48px rgba(1,51,52,.18);font-family:'Google Sans';display:flex;flex-direction:column;align-items:center;text-align:center;opacity:{{ ng.op }};transform:{{ ng.tf }};pointer-events:{{ ng.pe }};transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1);">
    <button type="button" onClick="{{ ng.onClose }}" aria-label="Close" style="position:absolute;top:12px;right:12px;width:44px;height:44px;border:none;border-radius:999px;background:#F3F4F2;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#E02D3C;" style-hover="background:#FEF3F2;"><i class="hgi-twotone hgi-cancel-01" style="font-size:20px;flex:0 0 auto;" aria-hidden="true"></i></button>
    <img src="assets/logo.png" alt="Tukai" style="height:30px;width:auto;display:block;margin-top:4px;">
    <h2 style="margin:18px 0 0;font-size:19px;font-weight:700;line-height:1.3;letter-spacing:-.2px;color:#1F2937;text-wrap:balance;">Sign in or sign up for free</h2>
    <p style="margin:6px 0 0;font-size:14.5px;line-height:1.45;color:#5B6B66;text-wrap:pretty;">Save places, join communities and book experiences.</p>
    <div style="align-self:stretch;display:flex;flex-direction:column;gap:10px;margin-top:22px;">
            <button type="button" onClick="{{ ng.onGoogle }}" aria-busy="{{ ng.gBusy }}" style="display:flex;align-items:center;justify-content:center;gap:12px;height:52px;padding:0 20px;border:none;border-radius:999px;background:#4285F4;color:#FFFFFF;white-space:nowrap;font-family:'Google Sans';font-size:15.5px;font-weight:600;cursor:pointer;" style-hover="background:#3B78E7;" style-active="transform:scale(0.98);">
              <sc-if value="{{ ng.gIdle }}" hint-placeholder-val="{{ true }}"><span aria-hidden="true" style="width:28px;height:28px;flex:0 0 auto;border-radius:999px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true" style="display:block;"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg></span></sc-if>
              <sc-if value="{{ ng.gBusy }}">{{ ng.spin }}</sc-if>
              {{ ng.gLabel }}
            </button>
            <button type="button" onClick="{{ ng.onApple }}" aria-busy="{{ ng.aBusy }}" style="display:flex;align-items:center;justify-content:center;gap:12px;height:52px;padding:0 20px;border:none;border-radius:999px;background:#000000;color:#FFFFFF;white-space:nowrap;font-family:'Google Sans';font-size:15.5px;font-weight:600;cursor:pointer;" style-hover="background:#1A1A1A;" style-active="transform:scale(0.98);">
              <sc-if value="{{ ng.aIdle }}" hint-placeholder-val="{{ true }}"><svg width="20" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true" style="display:block;flex:0 0 auto;margin-top:-3px;"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"></path></svg></sc-if>
              <sc-if value="{{ ng.aBusy }}">{{ ng.spin }}</sc-if>
              {{ ng.aLabel }}
            </button>
            <div aria-hidden="true" style="height:1px;margin:6px 0;background:#EDF0EE;"></div>
            <form onSubmit="{{ ng.onEmail }}" noValidate="{{ true }}" style="display:flex;flex-direction:column;gap:10px;">
              <input type="email" value="{{ ng.email }}" onChange="{{ ng.onEmailInput }}" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck="false" placeholder="Enter your email" aria-label="Email address" aria-invalid="{{ ng.emailBad }}" style="width:100%;box-sizing:border-box;height:52px;padding:0 16px;border:1px solid #DDE3DF;border-radius:12px;background:#FFFFFF;font-family:'Google Sans';font-size:15px;color:#1F2937;outline:none;" style-focus="border-color:#066349;box-shadow:0 0 0 3px #E8F1ED;">
              <sc-if value="{{ ng.emailBad }}"><p role="alert" style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:1.45;color:#B42318;text-align:left;text-wrap:pretty;"><i class="hgi-twotone hgi-information-circle" style="font-size:17px;flex:0 0 auto;margin-top:1px;" aria-hidden="true"></i>{{ ng.emailErr }}</p></sc-if>
              <button type="submit" disabled="{{ ng.emailOff }}" style="height:52px;padding:0 20px;border:none;border-radius:999px;background:{{ ng.emailBg }};color:{{ ng.emailFg }};white-space:nowrap;font-family:'Google Sans';font-size:15.5px;font-weight:600;cursor:{{ ng.emailCur }};" style-active="transform:scale(0.98);">Continue with email</button>
            </form>
    </div>
  </aside>
</sc-if>
```

### Toast
```html
<sc-if value="{{ state.toast }}">
  <div style="position:fixed;left:50%;bottom:{{ toastBottom }};transform:translateX(-50%);z-index:98;width:max-content;max-width:min(560px, calc(100vw - 32px));padding:14px 22px;border-radius:999px;background:#013334;color:#FFFFFF;font-size:14px;line-height:1.4;box-shadow:0 14px 34px rgba(1,51,52,.3);text-align:center;">{{ state.toast }}</div>
</sc-if>
```

### Keyframes (`<helmet>`)
```css
@keyframes tkSpin{to{transform:rotate(360deg)}}
@keyframes tkLetterIn{0%{opacity:0;transform:translateY(.42em);filter:blur(6px)}100%{opacity:1;transform:none;filter:blur(0)}}
@keyframes tkWordOut{0%{opacity:1;transform:none;filter:blur(0)}100%{opacity:0;transform:translateY(-.36em);filter:blur(6px)}}
```

## Exact logic
```js
// componentDidMount: rotating phrase, nudge timer, Escape
this._wordT = setInterval(() => { const av = this.state.authView; if ((av === 'register' || av === 'signin') && !this.state.authStep) this.setState(s => ({ word: (s.word || 0) + 1 })); }, 3000);
this._ngT = setTimeout(() => this.setState({ nudgeIn: true }), 1200);
// keydown handler: if (e.key === 'Escape' && this.state.authView && !(this.state.authView === 'interests' && this.state.intsMode !== 'edit')) { this.closeAuth(); return; }
      if (e.key === 'Escape' && this.state.blAsk) { this.setState({ blAsk: null }); return; }
      if (e.key === 'Escape' && this.state.blPop) { this.setState({ blPop: null }); return; }
      if (e.key === 'Escape' && this.state.leaveAsk) { this.setState({ leaveAsk: null }); return; }
      const g = this.state.gal;

// Initial state, from props.account
// auth: (props.account === 'Signed out' || props.account === 'First visit') ? 'out' : 'in', authView: props.account === 'First visit' ? 'register' : null,
// intsDraft: [], myInts: ['hike', 'run', 'cycle'], intsSet: false, word: 0

// Top bar and profile entry points
onSignIn: () => this.setState({ authView: 'signin', authWhy: '', profileOpen: false }),
onRegister: () => this.setState({ authView: 'register', authWhy: '', profileOpen: false }),
onEditInterests: () => this.setState({ authView: 'interests', intsMode: 'edit', intsDraft: (this.state.intsSet ? this.state.myInts : ['hike', 'run', 'cycle']).slice() }),

needAuth(why, then) {
  if (this.state.auth === 'in') return false;
  this._authThen = then || null;
  const W = { tukai: 'Chatting with TukAI needs an account, so your chats stay with you.', claim: 'Claiming a place needs an account.', reserve: 'Booking needs an account, so your bookings stay with you.', save: 'Saving needs an account, so your lists follow you.', join: 'Joining needs an account.', book: 'Booking needs an account, so your tickets stay with you.', plan: 'Planning needs an account.', host: 'Hosting needs an account.', moment: 'Sharing a moment needs an account.', lists: 'Your bucket lists live in your account.', plans: 'Your plans live in your account.', you: 'Your profile lives in your account.' };
  this.setState({ authView: 'register', authStep: null, authWhy: W[why] || '', authBusy: null, profileOpen: false, createOpen: false, blPop: null });
  return true;
}
closeAuth() {
  if (this._authT) clearTimeout(this._authT);
  this._authThen = null;
  if (this._otpT) clearInterval(this._otpT);
  this.setState({ authView: null, authBusy: null, intsMode: null, authStep: null, otp: '', otpErr: '', otpBusy: false, emailErr: '', sendBusy: false });
}
authGo(provider) {
  if (this.state.authBusy) return;
  const view = this.state.authView;
  this.setState({ authBusy: provider, authProv: provider });
  if (this._authT) clearTimeout(this._authT);
  this._authT = setTimeout(() => {
    if (view === 'register') this.setState({ authBusy: null, authView: 'interests', intsMode: 'onboard', intsDraft: [] });
    else this.finishAuth('signin', null, provider);
  }, 1100);
}
finishAuth(kind, ints, provider) {
  const then = this._authThen; this._authThen = null;
  const patch = { auth: 'in', authView: null, authBusy: null, intsMode: null, authWhy: '', authStep: null, authPw: '', pwShow: false };
  if (ints) { patch.myInts = ints; patch.intsSet = true; }
  this.setState(patch);
  const pv = provider || this.state.authProv, via = pv === 'apple' ? 'with Apple' : pv === 'email' ? 'with your email' : 'with Google';
  const fn = pv === 'email' ? String(this.state.authFirst || '').trim() : '', hi = fn ? ', ' + fn : '';
  this.say(kind === 'signin' ? 'Signed in ' + via + '. Welcome back, Wanjiku.' : ints && ints.length ? 'Welcome to Tukai' + hi + '. Your interests are saved to your profile.' : 'Welcome to Tukai' + hi + '. Pick your interests any time from You.');
  if (then) setTimeout(then, 60);
}
sendCode(again) {
  const S = this.state, em = (S.authEmail || '').trim();
  if (again) { this.setState({ otp: '', otpErr: '', otpSentAt: Date.now() }); this.otpTimer(); this.say('We sent a new code to ' + em + '.'); return; }
  if (!em || S.sendBusy) return;
  const reg = S.authView === 'register', pw = S.authPw || '';
  if (reg && (!(S.authFirst || '').trim() || !(S.authLast || '').trim() || !(pw.length >= 8 && /\d/.test(pw)))) return;
  if (!reg && !pw) return;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(em)) { this.setState({ emailErr: 'Enter a valid email address, like name@example.com.' }); return; }
  this.setState({ sendBusy: true, emailErr: '' });
  clearTimeout(this._authT);
  if (!reg) { this._authT = setTimeout(() => { this.setState({ sendBusy: false, authProv: 'email' }); this.finishAuth('signin', null, 'email'); }, 900); return; }
  clearTimeout(this._authT);
  this._authT = setTimeout(() => { this.setState({ sendBusy: false, authStep: 'code', authEmail: em, otp: '', otpErr: '', otpBusy: false, otpSentAt: Date.now() }); this.otpTimer(); }, 900);
}
otpTimer() {
  if (this._otpT) clearInterval(this._otpT);
  this._otpT = setInterval(() => {
    const S = this.state, done = S.authStep !== 'code' || Date.now() - (S.otpSentAt || 0) >= 30000;
    this.setState({ otpNow: Date.now() });
    if (done) { clearInterval(this._otpT); this._otpT = null; }
  }, 1000);
}
verifyCode(code) {
  if (this.state.otpBusy || code.length !== 6) return;
  this.setState({ otpBusy: true, otpErr: '' });
  clearTimeout(this._authT);
  this._authT = setTimeout(() => {
    if (this.props.emailCode === 'Wrong code') { this.setState({ otpBusy: false, otp: '', otpErr: "That code isn't right. Check the latest email from Tukai and try again." }); return; }
    if (this._otpT) clearInterval(this._otpT);
    const done = { otpBusy: false, otp: '', otpErr: '', authStep: null, authProv: 'email' };
    if (this.state.authView === 'register') this.setState(Object.assign(done, { authView: 'interests', intsMode: 'onboard', intsDraft: [] }));
    else { this.setState(done); this.finishAuth('signin', null, 'email'); }
  }, 900);
}
emailVals(v, spin) {
  const S = this.state, step = v === 'interests' ? null : S.authStep || null, GREEN = 'linear-gradient(180deg,#0C7A50 0%,#044B36 100%)';
  const em = S.authEmail || '', code = S.otp || '', busy = !!S.otpBusy, full = code.length === 6, isReg = v === 'register', first = S.authFirst || '', last = S.authLast || '', pw = S.authPw || '', pwOk = pw.length >= 8 && /\d/.test(pw);
  const sendOff = isReg ? !em.trim() || !first.trim() || !last.trim() || !pwOk : !em.trim() || !pw;
  const act = S.otpFocus && !busy ? Math.min(code.length, 5) : -1;
  const box = (i) => ({ d: code[i] || '', bc: S.otpErr ? '#B42318' : i === act ? '#066349' : '#DDE3DF', ring: !S.otpErr && i === act ? '0 0 0 3px #E8F1ED' : 'none' });
  const left = Math.max(0, 30 - Math.floor((Date.now() - (S.otpSentAt || 0)) / 1000));
  const focusOnce = (key) => (el) => { if (el && el !== this[key]) { this[key] = el; try { el.focus({ preventScroll: true }); } catch (x) {} } };
  const toEmail = () => { clearTimeout(this._authT); if (this._otpT) clearInterval(this._otpT); this.setState({ authStep: 'email', otp: '', otpErr: '', otpBusy: false }); };
  return {
    isPick: !step, isForm: !!step, notRegister: v !== 'register', isEmail: step === 'email', isCode: step === 'code', hasBack: !!step,
    onBack: () => { if (step === 'code') toEmail(); else { clearTimeout(this._authT); this.setState({ authStep: null, emailErr: '', sendBusy: false }); } },
    onEmail: () => this.setState({ authStep: 'email', authBusy: null, emailErr: '' }),
    emailTitle: isReg ? 'Continue with email' : 'Sign in with email',
    emailSub: isReg ? "We'll email you a 6-digit code to verify your account." : 'Use the email and password you joined with.',
    isRegisterForm: isReg, isSigninForm: !isReg, pw, pwLabel: isReg ? 'Create a password' : 'Password', pwAc: isReg ? 'new-password' : 'current-password',
    pwType: S.pwShow ? 'text' : 'password', pwShown: S.pwShow ? 'true' : 'false', pwEye: S.pwShow ? 'hgi-twotone hgi-view-off-slash' : 'hgi-twotone hgi-view', pwToggleAria: S.pwShow ? 'Hide password' : 'Show password',
    onPw: (e) => this.setState({ authPw: String(e.target.value || '').slice(0, 64) }), onPwToggle: () => this.setState(s => ({ pwShow: !s.pwShow })),
    pwHintFg: pwOk ? '#066349' : '#5B6B66', pwHintIc: pwOk ? 'hgi-twotone hgi-checkmark-circle-02' : 'hgi-twotone hgi-circle',
    onForgot: () => { const x = em.trim(); if (!/^[^s@]+@[^s@.]+(.[^s@.]+)+$/.test(x)) { this.setState({ emailErr: 'Enter your email first, so we know where to send the reset link.' }); return; } this.say('We sent a link to reset your password to ' + x + '.'); },
    email: em, emailBad: !!S.emailErr, emailErr: S.emailErr || '',
    emailBc: S.emailErr ? '#B42318' : S.emailFocus ? '#066349' : '#DDE3DF', emailRing: S.emailFocus && !S.emailErr ? '0 0 0 3px #E8F1ED' : 'none',
    emailRef: isReg ? null : focusOnce('_emEl'),
    askName: isReg, first, last, firstRef: isReg ? focusOnce('_fnEl') : null, lastRef: null,
    onFirst: (e) => this.setState({ authFirst: String(e.target.value || '').slice(0, 40) }), onLast: (e) => this.setState({ authLast: String(e.target.value || '').slice(0, 40) }),
    onEmailInput: (e) => this.setState({ authEmail: e.target.value, emailErr: '' }),
    onEmailFocus: () => this.setState({ emailFocus: true }), onEmailBlur: () => this.setState({ emailFocus: false }),
    onSend: (e) => { if (e && e.preventDefault) e.preventDefault(); this.sendCode(); },
    sendBusy: !!S.sendBusy, sendLabel: isReg ? (S.sendBusy ? 'Sending code' : 'Send code') : (S.sendBusy ? 'Signing in' : 'Sign in'), sendOff,
    sendBg: sendOff ? '#EDF0EE' : GREEN, sendFg: sendOff ? '#8A9793' : '#FFFFFF', sendCursor: sendOff ? 'not-allowed' : 'pointer',
    code, codeBad: !!S.otpErr, codeErr: S.otpErr || '', otpBusy: busy,
    boxesA: [0, 1, 2].map(box), boxesB: [3, 4, 5].map(box),
    codeRef: focusOnce('_otpEl'),
    onCodeInput: (e) => { if (this.state.otpBusy) return; const d = (e.target.value || '').replace(/\D/g, '').slice(0, 6); this.setState({ otp: d, otpErr: '' }); if (d.length === 6) this.verifyCode(d); },
    onCodeFocus: () => this.setState({ otpFocus: true }), onCodeBlur: () => this.setState({ otpFocus: false }),
    onCodeEnd: (e) => { const t = e.target, n = (t.value || '').length; try { t.setSelectionRange(n, n); } catch (x) {} },
    onVerify: () => this.verifyCode(this.state.otp || ''),
    verifyOff: !full && !busy, verifyBg: full || busy ? GREEN : '#EDF0EE', verifyFg: full || busy ? '#FFFFFF' : '#8A9793', verifyCursor: full && !busy ? 'pointer' : 'not-allowed', verifyLabel: busy ? 'Verifying' : 'Verify',
    canResend: left === 0, resendWait: left > 0, resendLine: 'Resend code in 0:' + String(left).padStart(2, '0'),
    onResend: () => this.sendCode(true), onChangeEmail: toEmail
  };
}
intDefs() {
  const fx = this.fx(), order = ['hike', 'run', 'camp', 'cycle', 'pack', 'walk', 'over', 'bird', 'safari', 'gym', 'parks', 'fish', 'drive', 'horse', 'sunset', 'rest', 'climb', 'sport', 'kids', 'water', 'night', 'worship', 'shop'];
  return order.map(id => fx.pcDefs.find(d => d[0] === id)).filter(Boolean).map(d => ({ id: d[0], label: d[1], icon: d[2] })).concat([{ id: 'other', label: 'Other', icon: null }]);
}
otherIcon(color) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.2"><circle cx="12" cy="7" r="3"/><circle cx="6.5" cy="16.5" r="3"/><circle cx="17.5" cy="16.5" r="3"/></svg>'); }

wordEl(words, tick) {
  const h = React.createElement, n = words.length, cur = words[tick % n], prev = words[(tick + n - 1) % n];
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  let k = 0;
  const roll = cur.split(' ').map((w, wi, all) => h(React.Fragment, { key: 'w' + wi },
    h('span', { style: { display: 'inline-block', whiteSpace: 'nowrap' } }, w.split('').map((ch, ci) => h('span', { key: ci, style: { display: 'inline-block', animation: 'tkLetterIn .62s cubic-bezier(.2,.8,.2,1) both', animationDelay: (140 + 26 * k++) + 'ms' } }, ch))),
    wi < all.length - 1 ? ' ' : null));
  return h('span', { style: { display: 'block', position: 'relative' } },
    h('span', { style: { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } }, cur),
    h('span', { 'data-word': '1', 'aria-hidden': true, style: { display: 'grid', color: '#B0E800' } },
      h('span', { key: 'size', style: { gridArea: '1 / 1', visibility: 'hidden' } }, longest),
      tick > 0 ? h('span', { key: 'out' + tick, 'data-word-out': '1', style: { gridArea: '1 / 1', animation: 'tkWordOut .42s cubic-bezier(.4,0,.2,1) both' } }, prev) : null,
      h('span', { key: 'in' + tick, style: { gridArea: '1 / 1' } }, roll)));
}
authVals() {
  const S = this.state, v = S.authView;
  if (!v) return { au: { open: false } };
  const mob = (S.vw || 1280) < 720, busy = S.authBusy;
  const WORDS = ['night life', 'weekend hikes', 'art in the city', 'new places to eat'];
  const spin = this._spinEl || (this._spinEl = React.createElement('span', { 'aria-hidden': true, 'data-spin': '1', style: { width: '20px', height: '20px', flex: '0 0 auto', borderRadius: '999px', border: '2.5px solid rgba(255,255,255,.35)', borderTopColor: '#FFFFFF', animation: 'tkSpin .8s linear infinite', boxSizing: 'border-box' } }));
  const link = (msg) => (ev) => { if (ev && ev.preventDefault) ev.preventDefault(); this.say(msg); };
  const au = {
    open: true, isWelcome: v !== 'interests', isInts: v === 'interests',
    aria: v === 'interests' ? 'Select your interests' : v === 'register' ? 'Create your Tukai account' : 'Sign in to Tukai',
    // Phones: full-screen photo behind the content. Larger screens: landscape card, photo behind centred content.
    pad: mob ? '0' : '24px', cardW: mob ? '100%' : '960px', intsW: mob ? '100%' : '600px', cardH: mob ? '100%' : 'min(640px, calc(100dvh - 48px))', intsH: mob ? '100%' : 'min(760px, calc(100dvh - 48px))', radius: mob ? '0' : '18px',
    photoL: '0px', photoW: '100%', photoPos: mob ? '50% 50%' : '50% 72%',
    shade: mob ? 'linear-gradient(180deg,rgba(5,16,26,.6) 0%,rgba(5,16,26,.25) 36%,rgba(5,16,26,.4) 60%,rgba(5,16,26,.92) 100%)' : 'linear-gradient(180deg,rgba(5,16,26,.4) 0%,rgba(5,16,26,.16) 38%,rgba(5,16,26,.28) 66%,rgba(5,16,26,.8) 100%)',
    cW: '100%', cAlign: 'center', tAlign: 'center', selfAlign: 'center',
    cPad: mob ? 'calc(64px + env(safe-area-inset-top)) 28px calc(24px + env(safe-area-inset-bottom))' : '48px 56px 32px', h1Mt: mob ? '44px' : '32px', formPhoto: !mob, fH: mob ? '100%' : 'min(720px, calc(100dvh - 48px))', fPad: mob ? 'calc(72px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom))' : '48px 40px 28px',
    photo: this.img('1537905569824-f89f14cceb68', 1000),
    onClose: () => this.closeAuth(), onScrim: () => { if (this.state.authView !== 'interests') this.closeAuth(); },
    isRegister: v === 'register', isSignin: v === 'signin', isExpired: v === 'expired',
    h1a: v === 'expired' ? 'Your session expired' : 'Plan & discover',
    h1b: v !== 'expired' ? WORDS[(S.word || 0) % WORDS.length] : '', hasH1b: v !== 'expired',
    wordEl: v !== 'expired' ? this.wordEl(WORDS, S.word || 0) : null,
    sub: v === 'signin' ? 'Welcome back. Sign in the way you joined: Google, Apple or email.' : v === 'expired' ? 'For your security, you were signed out. Sign in again to pick up where you left off.' : '',
    hasSub: v !== 'register',
    why: S.authWhy || '', hasWhy: !!S.authWhy && v === 'register',
    gBusy: busy === 'google', gIdle: busy !== 'google', aBusy: busy === 'apple', aIdle: busy !== 'apple', spin,
    gLabel: busy === 'google' ? 'Connecting to Google' : 'Continue with Google',
    aLabel: busy === 'apple' ? 'Connecting to Apple' : 'Continue with Apple',
    onGoogle: () => this.authGo('google'), onApple: () => this.authGo('apple'),
    onToSignin: () => this.setState({ authView: 'signin', authBusy: null }),
    onToRegister: () => this.setState({ authView: 'register', authBusy: null }),
    onTerms: link('Opens the terms of use.'), onPrivacy: link('Opens the privacy policy.'),
    ...this.emailVals(v, spin)
  };
  if (v === 'interests') {
    const draft = S.intsDraft || [], edit = S.intsMode === 'edit', n = draft.length;
    Object.assign(au, {
      intsPad: mob ? 'calc(68px + env(safe-area-inset-top)) 20px 12px' : '36px 48px 8px', intsShade: 'linear-gradient(180deg,rgba(5,16,26,.62) 0%,rgba(5,16,26,.5) 45%,rgba(5,16,26,.6) 75%,rgba(5,16,26,.9) 100%)',
      intsTitle: edit ? 'Your interests' : 'Select your interests',
      intsSub: edit ? 'Pick what you like doing. You can change these any time.' : 'What are some of your favourite experiences? Click to select\n',
      canSkip: !edit, canCloseInts: edit,
      onSkip: () => this.finishAuth('register', null),
      chips: this.intDefs().map(d => { const on = draft.indexOf(d.id) >= 0; return { label: d.label, on, bg: on ? '#B0E800' : 'rgba(255,255,255,.14)', fg: on ? '#013334' : '#FFFFFF', fw: on ? '600' : '500', icon: d.icon ? this.pcIcon(d.icon, on ? '#013334' : '#FFFFFF') : this.otherIcon(on ? '#013334' : '#FFFFFF'), onClick: () => this.setState(st => { const cur = st.intsDraft || []; return { intsDraft: cur.indexOf(d.id) >= 0 ? cur.filter(x => x !== d.id) : cur.concat([d.id]) }; }) }; }),
      countLine: n ? n + ' selected' : 'Pick as many as you like',
      submitLabel: edit ? 'Save interests' : 'Submit', submitOff: n === 0,
      submitBg: n ? 'linear-gradient(180deg,#0C7A50 0%,#044B36 100%)' : 'rgba(255,255,255,.16)', submitFg: n ? '#FFFFFF' : '#C9D1CF', submitCursor: n ? 'pointer' : 'not-allowed',
      onSubmit: () => { const d = (this.state.intsDraft || []).slice(); if (!d.length) return; if (edit) { this.setState({ myInts: d, intsSet: true, authView: null, intsMode: null }); this.say('Interests saved to your profile.'); } else this.finishAuth('register', d); }
    });
  }
  return { au };
}
nudgeVals(mob) {
  const S = this.state;
  if (S.auth === 'in' || S.nudgeOff || S.authView || S.pOpen || S.ccOpen || S.fOpen || S.errView) return { show: false };
  const busy = S.nudgeBusy, hasEm = !!String(S.ngEmail || '').trim();
  const spin = this._spinEl || (this._spinEl = React.createElement('span', { 'aria-hidden': true, 'data-spin': '1', style: { width: '20px', height: '20px', flex: '0 0 auto', borderRadius: '999px', border: '2.5px solid rgba(255,255,255,.35)', borderTopColor: '#FFFFFF', animation: 'tkSpin .8s linear infinite', boxSizing: 'border-box' } }));
  const go = (p) => { if (this.state.nudgeBusy) return; this.setState({ nudgeBusy: p, authProv: p }); clearTimeout(this._ngGo); this._ngGo = setTimeout(() => { this.setState({ nudgeBusy: null }); this.finishAuth('signin', null, p); }, 1100); };
  return {
    show: true, right: mob ? '12px' : '24px', left: mob ? '12px' : 'auto', bottom: mob ? 'calc(84px + env(safe-area-inset-bottom))' : '24px', width: mob ? 'auto' : '360px',
    op: S.nudgeIn ? '1' : '0', tf: S.nudgeIn ? 'translateY(0)' : 'translateY(16px)', pe: S.nudgeIn ? 'auto' : 'none',
    gBusy: busy === 'google', gIdle: busy !== 'google', aBusy: busy === 'apple', aIdle: busy !== 'apple', spin,
    gLabel: busy === 'google' ? 'Connecting to Google' : 'Continue with Google', aLabel: busy === 'apple' ? 'Connecting to Apple' : 'Continue with Apple',
    onGoogle: () => go('google'), onApple: () => go('apple'),
    email: S.ngEmail || '', emailBad: !!S.ngEmailErr, emailErr: S.ngEmailErr || '',
    emailOff: !hasEm, emailBg: hasEm ? 'linear-gradient(180deg,#0C7A50 0%,#044B36 100%)' : '#EDF0EE', emailFg: hasEm ? '#FFFFFF' : '#8A9793', emailCur: hasEm ? 'pointer' : 'not-allowed',
    onEmailInput: (e) => this.setState({ ngEmail: e.target.value, ngEmailErr: '' }),
    // Hands the typed email to the full sign-up, which asks for the name and sends the code.
    onEmail: (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const em = String(this.state.ngEmail || '').trim(); if (!em) return;
      if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(em)) { this.setState({ ngEmailErr: 'Enter a valid email address, like name@example.com.' }); return; }
      clearTimeout(this._ngGo); this.setState({ nudgeBusy: null, authView: 'register', authStep: 'email', authEmail: em, authWhy: '', authBusy: null, emailErr: '' });
    },
    onClose: () => { clearTimeout(this._ngGo); this.setState({ nudgeOff: true, nudgeBusy: null }); }
  };
}
```
