# Tasks

One file per task. A task file is the whole brief: a new chat reads it and
the files it names, and nothing else.

## Starting a task in a new chat

Say the ID and nothing more, for example: `do D-03`. The chat then reads
`docs/tasks/<area>/<ID>-*.md`, plus the files the task names. It should not
read the whole design, the whole conversation, or screenshots.

## Design fidelity

Every design task is built from the design's markup, not a screenshot. A
screenshot shows some sections and misses others, which is how the place
drawer came to miss four of them.

1. **Excerpt first.** The task names a file in `docs/design/screens/` holding
   the screen's markup with its inline values, cut to the section in question.
   Until an excerpt exists, grep the prototype using the task's anchor.
2. **Inventory before code.** The chat lists every section and control in the
   excerpt against what is built, in the table in the task file. The owner
   reviews it. Nothing is built until it is agreed.
3. **Screenshots last, and only to check.** Use one cropped image after the
   build, never as the spec.
4. **Deviations are written down.** A task that departs from the design says
   why in its inventory. Silent differences are the failure this rule exists
   to catch.

The design project is the only source. Its folder holds more than one
prototype (`Tukai Web.dc.html`, `Tukai.dc.html`, `Tukai Redesign.dc.html`), and
which one is current is the owner's call. Record it in `docs/design/README.md`
before a task relies on it.

## Statuses

| Status | Meaning |
|---|---|
| `todo` | Clear, buildable now |
| `verify` | Probably built. Check it, then close or reopen |
| `decision` | Needs an answer from you before it can be built |
| `blocked` | Needs something outside this repo, usually the API |
| `done` | Built and merged |

## Where things are

- Design intent: `docs/design/` (conventions, handoff, pending items).
- The prototype, `Tukai Web.dc.html`, lives in the design project, not here.
  Grep it with the anchor each task gives. Do not read it whole.
- Task template: [TEMPLATE.md](TEMPLATE.md).
