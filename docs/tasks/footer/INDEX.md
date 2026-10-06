# Footer, for the whole app

The new design has no footer. The current app has one, on every page. These tasks decide it and clean it up.

| ID | Task | Type | Status | Depends on |
|---|---|---|---|---|
| FT-00 | Decide the footer's content and home | decision | decided | none |
| FT-01 | Remove the hardcoded location | build | approved | FT-00 |
| FT-02 | Move the footer out of the Share folder | cleanup | done | FT-00 |
| FT-03 | Footer links to the five destinations and Help | build | approved | FT-00 |
| FT-04 | Confirm the contact details and social links | decision | awaiting approval | FT-00 |
| FT-05 | Footer clears the bottom navigation on phones | verify | todo | FT-02 |
| FT-06 | Footer copy follows the house style | build | approved | FT-00 |
| FT-07 | App download links in the footer | decision | awaiting approval | FT-00 |
| FT-08 | Footer design, once it exists | blocked | blocked | none |

Run FT-00 first. FT-01 is a fix that does not wait for it.
