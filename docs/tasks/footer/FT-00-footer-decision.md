# FT-00 Decide the footer's content and home

- **Status:** decided
- **Type:** decision
- **Depends on:** none
- **Design:** the new design has no footer. `uploads/Tukai_Web_App_Redesign_Claude_Design_Brief.md` and `Tukai Redesign.dc.html` both lack one. The only footer is in the current app.
- **Now:** A site footer is rendered on every page from `app/layout.tsx`, with its component in the Share folder.

## Inventory

| Item | In the new design | In the app now | Decision |
|---|---|---|---|
| Footer exists at all | No | Yes, on every page | Keep |
| Location | Not stated | 'Parkwood Villas, Syokimau' (hardcoded) | Remove |
| Destinations | Five destinations and Help (brief 7.1) | None | Add (FT-03) |
| Contacts and socials | Brief asks for accurate contact details | Email, phone, four socials | Confirm |
| Legal line | Not stated | Copyright line, Terms and Privacy links | Keep, with copy fixes |

## Done when

- [x] Footer kept or removed, recorded
- [x] Content decided, with FT-01 to FT-07 as the result

## Notes

Nothing in the new design specifies a footer. Keeping one is a product call, not a design one. Decide before the rest.

**Decided:** keep the footer. Remove the hardcoded location (FT-01). Add the five destinations and Help (FT-03). Confirm the contact details (FT-04). Keep the legal line, with the copy fixes (FT-06).

**Not decided:** app download links (FT-07). Still awaiting.
