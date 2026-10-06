# FT-07 App download links in the footer

- **Status:** decided
- **Type:** decision
- **Depends on:** FT-00
- **Design:** not in the new design.
- **Now:** The footer has App Store and Google Play badges under "Get the app" (`app/shared/components/Global/Footer.tsx`). `DownloadApp` is a separate popup, shown for 15 seconds and then hidden.

## Inventory

| Item | In the app now | Decision |
|---|---|---|
| App store and Google Play links | Yes, in the footer | Keep |
| `DownloadApp` popup | Yes, on every page, dismisses after 15 seconds | Keep, unchanged |

## Done when

- [x] Decision recorded

## Notes

The earlier note said the footer had no store links and that adding them would duplicate `DownloadApp`. Both points are out of date. The footer already has the links, and they are not a duplicate in practice: `DownloadApp` only shows for 15 seconds, so the footer is the one place a reader can find the app later.

**Decided:** keep the App Store and Google Play badges in the footer. No code change was needed, since they are already there. Revisit only if the new design adds its own app block (see FT-08).
