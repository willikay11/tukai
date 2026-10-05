# Tasks

One file per task. A task file is the whole brief: a new chat reads it and
the files it names, and nothing else.

## Starting a task in a new chat

Say the ID and nothing more, for example: `do D-03`. The chat then reads
`docs/tasks/<area>/<ID>-*.md`, plus the files the task names. It should not
read the whole design, the whole conversation, or screenshots.

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
