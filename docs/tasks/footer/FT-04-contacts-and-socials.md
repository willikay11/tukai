# FT-04 Confirm the contact details and social links

- **Status:** done
- **Type:** decision
- **Depends on:** FT-00
- **Design:** brief: 'accurate contact information' (section 9, place section).
- **Now:** Email `support@tukai.co`, a phone number, and four social links are hardcoded.

## Inventory

| Item | App | Owner to confirm |
|---|---|---|
| Email | support@tukai.co | Yes or no |
| Phone | +254 716 909 815 | Yes or no |
| Instagram, X, TikTok, Facebook | Four handles | Yes or no, each |

## Done when

- [x] Each contact confirmed or corrected
- [x] Any wrong link removed (none; the owner confirmed the current values)

## Notes

Hardcoded values go stale. Confirm them, and move them to config so they can change without a code edit.

**FT-00 applied:** the contacts are to be confirmed. The owner has not yet given the confirmed values, so this stays open until they are provided.

**Done:** the owner confirmed the email, phone and social values as they stand. They now live in `config/contacts.ts`, read from `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` and `NEXT_PUBLIC_SOCIAL_*`, with the confirmed values as fallbacks. TikTok has no link in the footer, so its slot stays hidden until a handle is set.
