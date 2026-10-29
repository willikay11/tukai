# Auth flow: sign up and sign in

The design's sign-up/sign-in rebuild, broken into tasks. Source:
[docs/design/AUTH_FLOW_HANDOFF.md](../../design/AUTH_FLOW_HANDOFF.md).

This is not a restyle. Today the flow is five separate pages
(`/auth/sign-in`, `/auth/sign-up`, `/auth/sign-up-free`, `/auth/otp-confirmation`,
`/auth/interests`) plus a small, separate 460px dialog
(`context/AuthDialogContext.tsx`) used only by actions that require an
account mid-task. The design is one dialog with internal steps (Welcome →
Email → Code → Interests) reused for every entry point. Collapsing five pages
and a second dialog into one component, without breaking the real NextAuth/
API calls each currently makes, is the actual work; the pixel spec is the
easy part.

AU-00 is approved (2026-10-29). AU-01 through AU-09 are all built
(2026-10-29, AU-08 last) - see each file's Notes for exactly where the build
departs from the handoff and why.

| ID | Task | Type | Status | Depends on |
|---|---|---|---|---|
| AU-00 | Decisions: handoff vs. the real app | decision | approved | none |
| AU-01 | Dialog shell, state machine and entry points | build | built, pending owner review | AU-00 |
| AU-02 | Welcome screen (Create account / Sign in / Session expired) | build | built, pending owner review | AU-00, AU-01 |
| AU-03 | Email form (register and sign-in variants) | build | built, pending owner review | AU-00, AU-01 |
| AU-05 | Select your interests (onboard and edit) | build | built, pending owner review | AU-00, AU-01, AU-03 |
| AU-04 | Check your email (OTP) | build | built, pending owner review | AU-00, AU-03, AU-05 |
| AU-06 | Signed-in toast | content | built, pending owner review | AU-01 |
| AU-07 | Sign-in nudge card | build | built, pending owner review | AU-00, AU-01 |
| AU-08 | Forgot/reset password | decision | built, pending owner review | AU-00, AU-03 |
| AU-09 | Accessibility, reduced motion, colour tokens | qa | verify | AU-01 through AU-07 |

AU-08's open scoping question (fold into the dialog vs. keep as standalone
pages) is resolved: it's in the dialog now, reusing AU-04's digit-box UI for
its 4-digit code. All seven old standalone pages
(`/auth/sign-in`, `/auth/sign-up`, `/auth/sign-up-free`,
`/auth/otp-confirmation`, `/auth/interests`, `/auth/forgot-password`,
`/auth/reset-password`) now redirect into the dialog.

Everything in this feature is built. What's left is owner review (every task
is `pending owner review`) and the loose ends each file's Notes call out:
component tests for the new screens, a real screen-reader/keyboard pass
(AU-09), and the nudge card's partial hidden-when coverage (AU-07).
