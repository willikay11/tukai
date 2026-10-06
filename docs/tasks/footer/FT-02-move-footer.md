# FT-02 Move the footer out of the Share folder

- **Status:** todo
- **Type:** cleanup
- **Depends on:** FT-00
- **Design:** not in the new design.
- **Now:** The footer is exported from `app/shared/components/Share/index.ts`, though it has nothing to do with sharing.

## Inventory

| Item | Now | Target |
|---|---|---|
| Location | Share/share/footer.tsx | Global/Footer.tsx |
| Export | Share/index.ts | Global/index.ts |
| Layout import | From Share | From Global |

## Done when

- [ ] Footer lives in Global, with the other site chrome
- [ ] Layout imports from Global
- [ ] No footer export left in Share

## Notes

Structure only, no behaviour change, per the refactor rule in CLAUDE.md.
