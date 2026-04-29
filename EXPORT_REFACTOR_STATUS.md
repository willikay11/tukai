# Export Refactor Status Report

**Date:** 2026-04-29  
**ESLint Rule Added:** `import/no-default-export` in `.eslintrc.js`  
**Total Files Needing Manual Fixes:** 134  
**Severity:** Error (blocks lint)

---

## Summary

✅ **ESLint rule installed and activated**  
❌ **No auto-fix available** — `eslint-plugin-import` only detects, doesn't auto-fix default exports  
⚠️ **134 files need manual conversion**

The rule cannot be auto-fixed because:
1. Export statement must be rewritten (`export default` → `export const`)
2. All imports must be updated (`import X` → `import { X }`)
3. This requires semantic understanding of the codebase that ESLint doesn't have

---

## Files by Category

### 🔴 Route Pages (23 files)
These should export named constants with clear component names.

**Pattern to fix:**
```tsx
// Before
export default function HomePage() { ... }

// After
export const ExperiencesPage = () => { ... }
```

**Files:**
1. `./app/page.tsx` — Root experiences listing
2. `./app/layout.tsx` — Root layout
3. `./app/help/page.tsx`
4. `./app/privacy/page.tsx`
5. `./app/terms/page.tsx`
6. `./app/unsubscribe/page.tsx`
7. `./app/auth/forgot-password/page.tsx`
8. `./app/auth/interests/page.tsx`
9. `./app/auth/otp-confirmation/page.tsx`
10. `./app/auth/payments/page.tsx`
11. `./app/auth/sign-in/page.tsx`
12. `./app/auth/sign-up/page.tsx`
13. `./app/auth/subscribe/page.tsx`
14. `./app/auth/layout.tsx` (not listed above but mentioned in error)
15. `./app/auth/reset-password/page.tsx` (not listed above but mentioned in error)
16. `./app/auth/sign-up-free/page.tsx` (not listed above but mentioned in error)
17. `./app/communities/create/page.tsx`
18. `./app/communities/[communityId]/page.tsx`
19. `./app/communities/[communityId]/join/page.tsx`
20. `./app/experiences/create/page.tsx`
21. `./app/experiences/[experienceId]/page.tsx`
22. `./app/experiences/[experienceId]/reserve/page.tsx`
23. `./app/experiences/review/[experienceId]/page.tsx` (not listed above but mentioned in error)
24. `./app/places/page.tsx`
25. `./app/places/[placeId]/page.tsx`

### 🟡 Shared App Components (55 files)
Components in `app/components/`, shared across features. These are the foundation of the UI system.

**Pattern:**
```tsx
// Before
export default function Nav() { ... }

// After
export const Nav = () => { ... }
```

**Subcategories:**

**Navigation & Layout (5):**
- `./app/components/nav.tsx`
- `./app/components/scrollFilters.tsx`
- `./app/components/downloadApp.tsx`
- `./app/components/locationPrompt.tsx`
- `./app/components/mobileStore.tsx`

**Forms & Inputs (5):**
- `./app/components/form/button.tsx`
- `./app/components/form/input.tsx`
- `./app/components/form/loader.tsx`
- `./app/components/form/anchor.tsx`
- `./app/components/fileUploadField.tsx`

**User & Location (3):**
- `./app/components/userLocation.tsx`
- `./app/components/locationAutocompleteField.tsx`
- `./app/components/iconComponent.tsx`

**Cards & UI Elements (7):**
- `./app/components/rating.tsx`
- `./app/components/pills/index.tsx`
- `./app/components/socialLinks.tsx`
- `./app/components/iconRadioButtonGroup.tsx`
- `./app/components/joinTukaiPremium.tsx`
- `./app/components/globalLoading.tsx`
- `./app/components/googleMap.tsx`

**Search, Share, Messages (4):**
- `./app/components/search.tsx`
- `./app/components/share/index.tsx`
- `./app/components/sendMessage.tsx`
- `./app/components/pageLayoutContent.tsx` (not listed above but mentioned in error)

**Experiences Sub-components (6):**
- `./app/components/experiences/List/index.tsx`
- `./app/components/experiences/Single/index.tsx`

**Reviews & Comments (5):**
- `./app/components/review/index.tsx`
- `./app/components/review/AddReviewComment/index.tsx`
- `./app/components/review/Comments/Add/index.tsx`
- `./app/components/review/Comments/View/index.tsx`

**Bookmark (1):**
- `./app/components/bookmark/index.tsx` (not listed above but mentioned in error)

**Descriptions & UI (3):**
- `./app/components/descriptionShowMore.tsx` (not listed above but mentioned in error)
- `./app/components/authActions.tsx` (not listed above but mentioned in error)

### 🟡 Experiences Feature Components (18 files)
Feature-specific experience components.

**Pattern:**
```tsx
// Before
export default function ExperiencesList() { ... }

// After
export const ExperiencesList = () => { ... }
```

**List & Cards (2):**
- `./app/experiences/components/List/experiences.tsx`
- `./app/experiences/components/List/invitedExperiences.tsx`

**Detail View (6):**
- `./app/experiences/components/experienceDetails.tsx`
- `./app/experiences/components/experienceOrganiser.tsx`
- `./app/experiences/components/experienceActions.tsx`
- `./app/experiences/components/bookmarkExperience.tsx`
- `./app/experiences/components/reserve.tsx`

**Create Experience (10):**
- `./app/experiences/create/components/about.tsx`
- `./app/experiences/create/components/community.tsx`
- `./app/experiences/create/components/dates.tsx`
- `./app/experiences/create/components/customiseItinerary.tsx`
- `./app/experiences/create/components/invites.tsx`
- `./app/experiences/create/components/wallet.tsx`
- `./app/experiences/create/components/savedTicketCard.tsx`
- `./app/experiences/create/components/step-side-panel.tsx`
- `./app/experiences/create/components/steps.tsx`
- `./app/experiences/create/components/createTickets.tsx` (not listed above but mentioned in error)

**Review Components (7):**
- `./app/experiences/create/components/experienceReview/index.tsx`
- `./app/experiences/create/components/experienceReview/reviewCategories.tsx`
- `./app/experiences/create/components/experienceReview/reviewCommunities.tsx`
- `./app/experiences/create/components/experienceReview/reviewGuests.tsx`
- `./app/experiences/create/components/experienceReview/reviewInfoSection.tsx`
- `./app/experiences/create/components/experienceReview/reviewLocationCard.tsx`
- `./app/experiences/create/components/experienceReview/reviewPhotoGallery.tsx`
- `./app/experiences/create/components/experienceReview/reviewTickets.tsx`
- `./app/experiences/create/components/experienceReview/reviewWallets.tsx` (not listed above but mentioned in error)

### 🟡 Places Feature Components (11 files)
Feature-specific place components.

- `./app/places/components/list.tsx`
- `./app/places/components/place.tsx`
- `./app/places/components/placeTabs.tsx`
- `./app/places/components/reviews.tsx`
- `./app/places/components/comments.tsx`
- `./app/places/components/viewComment.tsx`
- `./app/places/components/experiences.tsx`
- `./app/places/components/placeActions.tsx`

### 🟡 Communities Feature Components (16 files)
Feature-specific community components.

**List & Cards (2):**
- `./app/communities/components/list.tsx`
- `./app/communities/components/community.tsx`

**Community Details (5):**
- `./app/communities/components/communityAdministrator.tsx`
- `./app/communities/components/communityMembers.tsx`
- `./app/communities/components/upcomingExperiences.tsx`
- `./app/communities/[communityId]/components/authGuard.tsx`
- `./app/communities/[communityId]/components/communityTabs.tsx`

**Discovery & Creation (9):**
- `./app/communities/components/Communities.tsx`
- `./app/communities/components/createCommunity.tsx`
- `./app/communities/components/join.tsx`
- `./app/communities/components/popularCommunities.tsx`
- `./app/communities/components/recommendedCommunities.tsx`
- `./app/communities/components/post/index.tsx`

### 🔵 Components/UI Folder (21 files)
UI library components (separate from `app/components/`).

**Auth Forms (2):**
- `./components/ui/form/sign-in.tsx`

**Images & Media (3):**
- `./components/ui/image.tsx`
- `./components/ui/imageCarousel.tsx`
- `./components/ui/imageUpload.tsx`

**Dialogs & Notifications (5):**
- `./components/ui/createSuccessDialog.tsx`
- `./components/ui/drawer.tsx`
- `./components/ui/noData.tsx`
- `./components/ui/paymentSuccess.tsx`
- `./components/ui/paystack.tsx`

**Filters & Display (6):**
- `./components/ui/categoryPill.tsx`
- `./components/ui/pageFilters.tsx`
- `./components/ui/pill.tsx`
- `./components/ui/stepIndicator.tsx`
- `./components/ui/quantity.tsx`

**Subscription (5):**
- `./components/ui/subscribe/page.tsx`
- `./components/ui/subscribe/components/package.tsx`
- `./components/ui/subscribe/components/paymentDetails.tsx`

**Auth Pages (2):**
- `./app/auth/subscribe/components/package.tsx`
- `./app/auth/subscribe/components/paymentDetails.tsx`

---

## Conversion Strategy

### Phase 1: Foundation (Route Pages) — 23 files
**Why first:** Routes are imported fewer places; lower risk of cascade failures  
**Time:** ~1-2 hours  
**Files:** All page.tsx and layout.tsx files

**Process:**
1. Change `export default function PageName` → `export const PageName`
2. Update function signature if needed: `function PageName()` → `const PageName = ()`
3. Update any dynamic imports or special routing patterns

**Example:**
```tsx
// BEFORE
export default function Home() {
  return <main>...</main>;
}

// AFTER
export const Home = () => {
  return <main>...</main>;
};
```

---

### Phase 2: Shared Components (55 files)
**Why second:** High reuse; fixing these unblocks feature components  
**Time:** ~3-4 hours  
**Batch approach:** By folder

**Batch 2a: Form Components (5 files)**
```
./app/components/form/button.tsx
./app/components/form/input.tsx
./app/components/form/loader.tsx
./app/components/form/anchor.tsx
./app/components/fileUploadField.tsx
```

After fixing:
1. Update imports in `app/components/form/index.ts` (if it exists)
2. Verify `npm run build` still works
3. Run tests

**Batch 2b: Navigation & Layout (5 files)**
```
./app/components/nav.tsx
./app/components/scrollFilters.tsx
./app/components/downloadApp.tsx
./app/components/locationPrompt.tsx
./app/components/mobileStore.tsx
```

**Batch 2c: Cards & UI Elements (7 files)**

Continue this pattern for remaining subcategories.

---

### Phase 3: Feature Components (45 files)
**Why third:** Safe once core patterns are established  
**Time:** ~4-5 hours  

**Batch 3a: Experiences (18 files)** — Start with create components
**Batch 3b: Places (11 files)**
**Batch 3c: Communities (16 files)**

---

### Phase 4: UI Library (21 files)
**Why last:** Lowest priority; isolated from main app  
**Time:** ~2 hours  

---

## Implementation Checklist

```
PRs to Create (suggested splitting):

PR 1: Route Pages (23 files)
  [ ] Convert all page.tsx exports
  [ ] Convert all layout.tsx exports
  [ ] Verify npm run build
  [ ] Verify tests pass
  Commit: "refactor: convert route pages to named exports"

PR 2: Form Components (5 files)
  [ ] Update form/button.tsx, form/input.tsx, etc.
  [ ] Update form/index.ts exports
  [ ] Verify imports in auth pages still work
  Commit: "refactor: convert form components to named exports"

PR 3: Navigation & Layout (5 files)
  [ ] Update nav.tsx, scrollFilters.tsx, etc.
  [ ] Verify layout still renders
  Commit: "refactor: convert navigation components to named exports"

PR 4: Core Shared Components (15 files)
  [ ] Rating, pills, search, share, location
  Commit: "refactor: convert core shared components to named exports"

PR 5: Experiences Components (18 files)
  [ ] List, detail, create, review
  [ ] Update imports in app/experiences/
  Commit: "refactor: convert experience components to named exports"

PR 6: Places Components (11 files)
  [ ] List, detail, reviews, comments
  [ ] Update imports in app/places/
  Commit: "refactor: convert place components to named exports"

PR 7: Communities Components (16 files)
  [ ] List, detail, join, create, posts
  [ ] Update imports in app/communities/
  Commit: "refactor: convert community components to named exports"

PR 8: UI Library (21 files)
  [ ] components/ui/ folder
  Commit: "refactor: convert UI components to named exports"

PR 9: Final Review Components (5 files)
  [ ] Remaining components/review/* files
  Commit: "refactor: convert review components to named exports"
```

---

## Quick Conversion Template

**For each file:**

```tsx
// Step 1: Identify the component name
// e.g., function MyComponent() { ... }

// Step 2: Change export
- export default function MyComponent() {
+ export const MyComponent = () => {
    // ... body stays the same
- }
+ };

// Step 3: Update all imports in this codebase
- import MyComponent from '@/path/to/MyComponent'
+ import { MyComponent } from '@/path/to/MyComponent'

// Step 4: Verify
npm run build
npm run lint
```

---

## Testing Strategy

After each phase, verify:
```bash
# 1. Check for lint errors
npm run lint

# 2. Check TypeScript
npm run build

# 3. Run tests (if any)
npm test

# 4. Check imports resolve
npm run build -- --analyze=true
```

---

## Estimated Timeline

| Phase | Files | Time | Risk |
|-------|-------|------|------|
| Phase 1: Routes | 23 | 1-2h | Low |
| Phase 2: Shared | 55 | 3-4h | Low-Medium |
| Phase 3: Features | 45 | 4-5h | Medium |
| Phase 4: UI Lib | 21 | 2h | Low |
| **Total** | **144** | **10-15h** | **Medium** |

---

## Next Steps

### Before Starting Conversion:

1. ✅ **ESLint rule is active** — Any new files with default exports will be caught
2. ✅ **Shared knowledge** — Share this document with your team
3. ✅ **Branch strategy** — Use feature branches per phase

### Recommended Order:
1. **Start with Phase 1** (routes) — Simplest, lowest risk
2. **Then Phase 2a** (forms) — High-value, small scope
3. **Then Phase 2b-2d** (shared components) — Build momentum
4. **Finally features** (experiences, places, communities)

### Risk Mitigation:
- Test after each phase, not at the end
- Use `npm run build` after each PR to catch import errors
- Keep PRs focused (one phase per PR)
- Have a colleague review import changes

---

## Notes

- **No auto-fix:** The `eslint-plugin-import` rule doesn't auto-fix default exports, only detects them
- **Safe refactoring:** This is a structural change with no logic changes
- **IDE tools:** Once exports are consistent, IDE refactoring tools (rename, extract) will work properly
- **Build time:** Each build will take ~10 seconds per file due to TypeScript re-checking

---

## Success Criteria

✅ All 134 files converted to named exports  
✅ `npm run lint` returns no `import/no-default-export` errors  
✅ `npm run build` succeeds  
✅ All tests pass  
✅ New engineers understand the pattern  
✅ ESLint rule prevents future drift
