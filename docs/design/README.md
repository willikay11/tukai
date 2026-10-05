# Design source

Copied from the design project (`tukai-web-v2/project`), which is where the
Tukai redesign actually lives. These are the small text files worth having in
the repo; the artboards themselves are too large and stay in that project.

| File | What it is | Reach for it when |
|------|------------|-------------------|
| `CONVENTIONS.md` | The design project's own rules: palette, copy style, radii, hit targets | Any question of colour, wording or spacing |
| `HANDOFF.md` | Brand basics, product rules, and ~40 component specs from the build sessions | A component's exact look — arrows, cards, fields |
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

## Where this disagrees with the code

Both are living documents and the code has its own ⚠️ notes where the API
cannot back a design. Where they conflict, ask rather than assume — see the
notes at the top of each file for its date.
