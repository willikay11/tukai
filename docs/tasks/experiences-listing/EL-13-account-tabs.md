# EL-13 Account tabs on /experiences

- **Status:** decided
- **Type:** decision
- **Depends on:** EL-00
- **Design:** `docs/design/screens/experiences-listing.html`, not in the listing. The brief places bookings and hosting under Plans and You (brief 7.2).
- **Now:** Saved, Reserved and Hosting tabs on /experiences.

## Inventory

| Tab | Design listing | Brief |
|---|---|---|
| Saved | no | Bucket Lists |
| Reserved | no | Plans |
| Hosting | no | You |

## Done when

- [ ] Decision recorded: keep on /experiences, or move

## Notes

Moving them changes routes. The brief's route map (7.3) is the reference.

**EL-00 decision applied:** remove the Saved, Reserved and Hosting tabs from
/experiences. The brief places them elsewhere: Saved and lists under Bucket
Lists, Reserved under Plans, Hosting under You.

**Before removing:** confirm each of those three is reachable from its
destination today, so no feature is lost. Check `Plans`, `Bucket lists` and
`You` (`app/shared/components/Navigation/destinations.ts`).

