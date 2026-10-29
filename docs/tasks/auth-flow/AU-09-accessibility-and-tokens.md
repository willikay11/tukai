# AU-09 Accessibility, reduced motion, colour tokens

- **Status:** verify
- **Type:** qa
- **Depends on:** AU-01 through AU-07
- **Design:** `docs/design/AUTH_FLOW_HANDOFF.md`, "## Accessibility", "## Keyboard" and "## Tokens used" sections
- **Now:** n/a — this is a pass over whatever AU-01–AU-07 build, plus `tailwind.config.ts` for the token mapping below

## Token mapping (CLAUDE.md forbids hardcoded hex — use these)

| Handoff hex | Existing Tailwind token | Notes |
|---|---|---|
| `#066349` | `brand` (DEFAULT) | focus border, links, rule-met, next code box |
| `#044B36` | `brand-deep` | gradient end, pressed text on lime |
| `#0C7A50` | `brand-mid` | gradient start |
| `#013334` | `brand-ink` | text on lime, reason pill background base (`brand-ink/[.78]`) |
| `#B0E800` | `lime` | rotating phrase, selected chip, links on photo |
| `#A3D900` | `lime-dark` | hover/pressed on lime |
| `#DDE3DF` | `line` | field/box borders |
| `#E8F1ED` | `surface-brand` | focus ring, Back hover, email button hover |
| `#EDF0EE` | `surface-muted` | disabled buttons, divider |
| `#F3F4F2` | `surface` (DEFAULT) | Close button background, off-white hover |
| `#5B6B66` | `ink-muted` | secondary text |
| `#8A9793` | `ink-subtle` | disabled button text |
| `#E02D3C` | `danger` (DEFAULT) | Close icon |
| `#FEF3F2` | `danger-surface` | Close hover background |
| `#B42318` | `danger-deep` | field/code errors (see AU-00 row 6) |
| `#1F2937` | none exact — `ink-pill`/`ink-label`/`ink-summary` all equal this hex but are scoped to other components | **decide**: reuse one of those, or this is enough recurring, generic body-text usage to earn its own token (e.g. `ink` has a `DEFAULT` of `#3F4B47`, a different value) — flag to whoever owns the token file |
| `#0B1A26` | none | the dark photo-card background; no existing token uses this exact hex. Add one if it recurs beyond this feature, otherwise an arbitrary value here is reasonable per CLAUDE.md's own exception for values with no match |
| `rgba(5,16,26,...)` gradients | none | one-off shades over the photo; arbitrary values, no existing token fits a one-off multi-stop gradient |
| `#4285F4` / `#3B78E7` | none | Google brand blue — keep as arbitrary values, these are a third party's brand colours, not a design-system token |
| `#000000` / `#1A1A1A` | none | Apple brand black — same reasoning |

## Inventory

| Item | Covers | Notes |
|---|---|---|
| Dialog focus trap + return focus | AU-01 | |
| Focus-on-open per screen (first name / email / code input) | AU-01, AU-03, AU-04 | |
| `aria-busy` on busy buttons | AU-02, AU-03, AU-04, AU-07 | |
| `role="alert"` on every error | AU-03, AU-04, AU-08 | |
| `aria-live="polite"` on the interests count | AU-05 | |
| `aria-pressed` on chips and the password eye | AU-03, AU-05 | |
| 44px minimum hit targets everywhere | all | |
| `prefers-reduced-motion` on the rotating phrase | AU-02 | per AU-00 row 11 |
| Escape/Enter keyboard rules | AU-01, AU-03, AU-04 | |

## Done when

- [ ] Every hex in the handoff is either mapped to an existing token (table above) or deliberately left arbitrary with a one-line reason, per CLAUDE.md
- [ ] Every item in the Accessibility inventory is checked against the actual built screens, not assumed from the task descriptions above
- [ ] A screen reader pass confirms the rotating phrase's visually-hidden live text and the `aria-hidden` animated copy both work as the handoff describes

## Notes

Rather than run as a separate pass at the end, each item was built inline as
AU-01–AU-07 were written: `role="alert"` on every error, `aria-live="polite"`
on the interests count, `aria-pressed` on chips and the password eye,
`aria-busy` on busy buttons, native `autoFocus` per screen, and the token
mapping table above applied throughout (two new tokens added to
`tailwind.config.ts`: `auth-night` for the photo card background, and three
`auth-*` animations for the spinner and the rotating phrase). Reduced motion
relies on the app's existing global rule in `globals.css` that already
collapses all `animate-*` classes under `prefers-reduced-motion` - nothing
auth-specific was needed for that one.

Marked `verify`, not `done`: this was built carefully rather than audited
separately afterward. A real screen-reader pass and a keyboard-only runthrough
of the full flow haven't happened yet, and no component tests exist yet for
the new screens themselves (AU-01's state machine has its own test file; the
UI components don't) - both worth doing before calling this closed.
