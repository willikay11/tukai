# Design source

Copied from the design project (`tukai-web-v2/project`), which is where the
Tukai redesign actually lives. These are the small text files worth having in
the repo; the artboards themselves are too large and stay in that project.

| File | What it is | Reach for it when |
|------|------------|-------------------|
| `CONVENTIONS.md` | The design project's own rules: palette, copy style, radii, hit targets | Any question of colour, wording or spacing |
| `HANDOFF.md` | Brand basics, product rules, and ~40 component specs from the build sessions | A component's exact look - arrows, cards, fields |
| `PENDING.md` | What is settled and what is open, with the reasoning | Before assuming something is unfinished |
| `nextjs-export/` | Two Discover sections as real Next.js server components | Building a Discover rail |

## The authoritative source

`Tukai Web.dc.html` in the design project (1.45 MB) is the prototype itself,
and every screen is in it. It is not copied here because of its size. Grep it
for a component rather than reading it:

```
grep -n 'data-screen-label' "<design project>/Tukai Web.dc.html"   # jump to a screen
```

Markup from that file beats a screenshot: it carries the exact hex, padding,
weight and hover state, where a picture has to be measured and guessed at.

## Source of truth

The redesign is the source of truth. In the design project folder:

1. **`uploads/Tukai_Web_App_Redesign_Claude_Design_Brief.md`** is the spec.
   Section 11 is Discover, excerpted into `screens/discover-guest-brief.md`.
2. **`Tukai Redesign.dc.html`** is "Web app redesign, Pass 1". Its artboards
   are not readable as text, so use it for the structure the brief names.
3. **`Tukai Web.dc.html`** is the previous prototype. The place panel and the
   Happening soon markup in `screens/` come from it. Where it disagrees with
   the brief, the brief wins.

## Where this disagrees with the code

Both are living documents and the code has its own notes where the API cannot
back a design. Where they conflict, ask rather than assume: see the notes at
the top of each file for its date.

Known divergences, each deliberate.

### Typeface

`CONVENTIONS.md` asks for Google Sans. The app ships Figtree, self-hosted
through `next/font/google`.

Google Sans is on Google Fonts now, but it cannot be used the same way here:
Next 14.2's font list predates its release, so `next/font` cannot fetch and
self-host it, and it ships weights 400-700 where this app sets `font-extrabold`
and `font-black` in 25 places. Using it would mean a runtime request to Google,
or font files back in the repo, and faux-bold at 800 and 900 either way.

Revisit on a Next upgrade.

### The community card

`HANDOFF.md` describes one community card everywhere: a square 1:1 image on a
`minmax(168px,1fr)` grid, a teal gradient overlay carrying member avatars and a
"+N" count, and the title beneath.

"Communities organising things" on Discover is instead a 72px tile beside
stacked text, built from a later screenshot. The two disagree, and the
screenshot is the newer of the pair.

### Sentence case

`CONVENTIONS.md` asks for sentence case on every header, tab, label, pill and
button. Around 100 strings are still Title Case, most of them form labels in
the create flow ("Start Date", "Ticket Name"). Not yet swept.
