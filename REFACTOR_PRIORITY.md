# Refactoring Priority Guide

**TL;DR:** Fix export conventions first (blocks other refactors), then reorganize for discoverability.

---

## Quick Impact Matrix

```
                HIGH IMPACT
                    ↑
        #1 Exports  │  #4 Shared Comp
        (10/10)     │  (7/10)
        CRITICAL    │
                    │
                    │  #5 Types
  EFFORT→─────────┼─────────→
      4h          │  3h
                    │
  Remove 'use      │  #8 Audit
  client'(3/10)    │  (3/10)
  TRIVIAL          │
                    ↓
              LOW IMPACT
```

---

## The Three Tiers

### 🔴 TIER 1: Do Immediately (1-2 weeks)

These unblock everything else and affect developer experience daily.

#### #1: Named Exports + ESLint Rule [12-16 hours]

**Why First:** All files violate CLAUDE.md. Blocks refactoring tools, confuses new devs, can't safely rename.

```bash
# Step 1: Add rule to .eslintrc.js
'import/no-default-export': ['error']

# Step 2: Run ESLint with --fix (handles ~80%)
npm run lint -- --fix

# Step 3: Manual fixes for remaining (page.tsx, layout.tsx)
# ~20-30 files need manual updates

# Step 4: Update import statements
```

**Acceptance criteria:**

- ✅ ESLint rule in place
- ✅ All files export named functions
- ✅ `npm run build` passes
- ✅ Tests still pass
- ✅ 1 commit with all changes

---

#### #2: Extract Route Groups [1-2 hours]

**Why:** Makes folder hierarchy match feature structure. Zero implementation complexity.

```bash
# Create route groups (use escape characters if needed)
mkdir -p "app/(experiences)"
mkdir -p "app/(places)"
mkdir -p "app/(communities)"

# Move root page.tsx → (experiences)/page.tsx
mv app/page.tsx "app/(experiences)/page.tsx"

# Optional: create shared layout.tsx in each group
```

**No import path changes** — Next.js handles transparently.

**Acceptance criteria:**

- ✅ Route groups created
- ✅ Dev server works (`npm run dev`)
- ✅ All routes still accessible (`/`, `/places`, `/communities`)
- ✅ Build passes

---

#### #3: Organize Shared Components [4-6 hours]

**Why:** 30+ components scattered; new devs can't find things.

```
Current:
  app/components/ (30+ flat files)

Target:
  app/shared/components/
    Navigation/     → Nav.tsx, BottomNavigation.tsx
    Forms/          → FormField.tsx, FormButton.tsx, FormInput.tsx
    Cards/          → (reusable card base, skeletons)
    Dialogs/        → Modal.tsx, Drawer.tsx
    Images/         → TukaiImage.tsx, PhotoGallery.tsx
    Filters/        → FilterBar.tsx
    Shared/         → IconComponent.tsx, misc utils
```

**Acceptance criteria:**

- ✅ All shared components moved to `app/shared/components/`
- ✅ All imports updated
- ✅ Tests still pass
- ✅ No circular dependencies

---

### 🟡 TIER 2: Do Next (2-3 weeks)

These improve code organization and developer experience, but less urgent than Tier 1.

#### #4: Extract Feature Hooks [4-6 hours]

**Why:** Hooks buried in global `/hooks` folder; discoverability nightmare.

**Template (do Experiences first, copy pattern for others):**

```bash
# Create feature hook folders
mkdir -p "app/(experiences)/hooks"
mkdir -p "app/(places)/hooks"
mkdir -p "app/(communities)/hooks"

# Move hooks
mv hooks/experiences.tsx "app/(experiences)/hooks/useExperiences.ts"
mv hooks/places.tsx "app/(places)/hooks/usePlaces.ts"
# ... etc
```

**Keep at root:**

- `hooks/use-toast.ts` (used everywhere)
- `hooks/useMediaQuery.ts` (cross-cutting)

**Update imports:**

```tsx
// Before
import { useExperiences } from '@/hooks/experiences'

// After
import { useExperiences } from '@/(experiences)/hooks/useExperiences'
```

**Acceptance criteria:**

- ✅ Feature hooks moved to feature folders
- ✅ All imports updated
- ✅ `/hooks` folder only has cross-cutting hooks
- ✅ Tests pass

---

#### #5: Move Types to Features [2-3 hours]

**Why:** Co-locate types with their features for discoverability.

```bash
# Move feature types
mv types/experience.ts "app/(experiences)/types.ts"
mv types/place.ts "app/(places)/types.ts"
mv types/community.ts "app/(communities)/types.ts"

# Keep shared at root:
# types/apiResponse.ts, types/user.ts, types/token.ts, etc.
```

**Acceptance criteria:**

- ✅ Feature types moved
- ✅ Shared types remain at root
- ✅ All imports updated
- ✅ TS compilation succeeds

---

#### #6: Add ONBOARDING.md [1-2 hours]

**Why:** New engineers get lost. Document the structure.

Example sections:

```markdown
## Finding Code

- Feature hooks: app/[feature]/hooks/
- Shared components: app/shared/components/
- API calls: services/[feature].ts

## Decision Tree

- Is your component used in 1 feature? → app/[feature]/components/
- Used in 2+ features? → app/shared/components/
- Need to fetch data? → Create service + hook
```

---

### 🟢 TIER 3: Nice-to-Have (3-4 weeks)

Lower priority but improve code quality and testability.

#### #7: Extract Page Logic to Hooks [4-5 hours]

**Why:** Pages become cleaner, logic becomes testable.

**Example:**

```tsx
// Before (300 lines in create/page.tsx)
export const CreateExperiencePage = () => {
  const [activeStep, setActiveStep] = useState(...);
  const [experienceId, setExperienceId] = useState(...);
  // ... 50 lines of state + handlers
  return <div>...</div>;
};

// After (extracted to hook)
export const CreateExperiencePage = () => {
  const flow = useCreateExperienceFlow();
  return <CreateExperienceContent {...flow} />;
};
```

---

#### #8: Add Component Tests [8-10 hours, phased]

**Why:** Catch regressions, document component behavior.

**Phase 1:** Shared components (Nav, BottomNav, LocationPicker)
**Phase 2:** Feature cards (ExperienceCard, PlaceCard, CommunityCard)
**Phase 3:** Complex forms

---

#### #9: Audit 'use client' Directives [2-3 hours]

**Why:** Remove unnecessary ones for better tree-shaking.

---

## Implementation Checklist

### Week 1

- [ ] #1: Convert to named exports
  - [ ] Add ESLint rule
  - [ ] Run --fix
  - [ ] Manual fixes (pages, layouts)
  - [ ] PR: "refactor: convert all exports to named exports"
- [ ] #2: Extract route groups
  - [ ] Create (experiences), (places), (communities) folders
  - [ ] Move pages
  - [ ] Test routes work
  - [ ] PR: "refactor: organize routes into groups for clarity"

- [ ] #3: Organize shared components
  - [ ] Create app/shared/components/ structure
  - [ ] Move 30+ components
  - [ ] Update imports (IDE refactoring)
  - [ ] PR: "refactor: consolidate shared components for discoverability"

### Week 2

- [ ] #4: Extract feature hooks
  - [ ] Move experiences hooks
  - [ ] Move places hooks
  - [ ] Move communities hooks
  - [ ] Update all imports
  - [ ] PR: "refactor: move feature hooks to feature folders"

- [ ] #5: Move feature types
  - [ ] Move experience.ts, place.ts, community.ts
  - [ ] Update imports
  - [ ] PR: "refactor: move feature types to feature folders"

- [ ] #6: Add ONBOARDING.md
  - [ ] Write guide
  - [ ] Share with team
  - [ ] PR: "docs: add onboarding guide for new engineers"

### Week 3

- [ ] #7: Extract page logic
  - [ ] Create useCreateExperienceFlow hook
  - [ ] Simplify create/page.tsx
  - [ ] Create tests for hook
  - [ ] PR: "refactor: extract create experience flow to hook"

### Week 4

- [ ] #8: Add tests for shared components
  - [ ] Test Nav
  - [ ] Test BottomNavigation
  - [ ] Test LocationPicker
  - [ ] Multiple PRs: "test: add unit tests for [Component]"

---

## Commit Message Template

Each refactor should have a clear commit message:

```
refactor: [what changed]

[Why this change improves the codebase]

Benefits:
- [Benefit 1]
- [Benefit 2]

Testing:
- npm run build ✓
- npm run lint ✓
- npm test ✓

Related: #[issue number if any]
```

Example:

```
refactor: convert all exports to named exports

Aligns with CLAUDE.md conventions and enables safe refactoring.
Adds ESLint rule to prevent future drift.

Benefits:
- IDE can now safely rename/refactor exports
- New developers understand naming conventions
- Import statements are more explicit

Testing:
- npm run build ✓
- npm run lint ✓
- npm test ✓ (5 tests passing)
```

---

## Red Flags to Avoid

❌ **Don't do these:**

1. **Refactor multiple tiers at once**
   - Each tier should be its own PR
   - Easier to revert if issues arise
   - Easier to review

2. **Move files without updating imports**
   - Use IDE's "Move File" refactoring
   - Verify `npm run build` after each move
   - Don't batch 20 moves and then test

3. **Change logic while refactoring structure**
   - Refactoring = structure only
   - Logic changes = separate PR
   - Makes it easier to trace bugs

4. **Forget to update tests**
   - If you move a component, move its test too
   - Update import paths in test files
   - Ensure `npm test` passes

5. **Skip ESLint/formatting**
   - Always run `npm run lint --fix` before commit
   - Always run `npm run format` for consistency
   - CI will catch this anyway

---

## Measuring Success

After all refactors complete, you should see:

✅ **Consistency**

- No ESLint errors about exports
- All feature code in feature folders
- Clear boundaries between shared/feature code

✅ **Discoverability**

- New engineer can find useExperiences in 30 seconds
- New engineer knows where to put a new component
- New engineer understands Services vs Hooks

✅ **Testability**

- Key components have tests
- Page logic is extracted and testable
- Tests co-locate with components

✅ **Maintainability**

- No circular dependencies
- No "mystery" imports from unclear locations
- Clear dependency layers

---

## Questions to Ask During Review

When reviewing refactor PRs:

```
1. ✅ Does this follow the new structure?
2. ✅ Are all imports updated?
3. ✅ Are all tests passing?
4. ✅ Does the commit message explain WHY?
5. ✅ Is this PR doing ONLY refactoring (no logic changes)?
6. ✅ Does it make the codebase easier to navigate?
```

---

## Estimated Timeline

```
Week 1: Tier 1 (exports, routes, shared components)
        Effort: ~22 hours
        Impact: Critical (foundation for future work)

Week 2: Tier 2 (hooks, types, documentation)
        Effort: ~12 hours
        Impact: High (developer experience)

Week 3-4: Tier 3 (hooks extraction, tests, cleanup)
        Effort: ~15 hours
        Impact: Medium (code quality)

Total: ~49 hours of refactoring
      = ~1 week of focused effort (or 2-3 weeks part-time)
```

**Recommendation:** Tackle Tier 1 first. The other tiers can happen incrementally as part of feature work.
