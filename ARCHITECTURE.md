# Architecture Improvement Plan

## 1. REVISED FOLDER STRUCTURE

### Current vs Proposed

```
Current (Flat/Mixed):
app/
  page.tsx                          # experiences listing
  experiences/
    page.test.tsx
    components/
      List/
        experiences.tsx
        invitedExperiences.tsx
      Single/
    create/
      components/
        about.tsx
        community.tsx
        dates.tsx
        ...
    [experienceId]/
      reserve/
        page.tsx
  places/
    components/
      list.tsx
      place.tsx
  communities/
    components/
      list.tsx
  components/                       # 30+ shared components
  auth/
    sign-in/
    sign-up/
    ...

hooks/                              # 10 feature hooks mixed together
  experiences.tsx
  places.tsx
  communities.tsx
  use-toast.ts

services/                           # API calls + feature logic
  experience.ts
  place.ts
  community.ts
  apiService.ts

types/                              # All types in one folder
  experience.ts
  place.ts
  community.ts
```

### Proposed (Feature-Based, Scalable)

```
app/
  (experiences)/                    # Route group for main feature
    page.tsx                        # /
    layout.tsx
    hooks/
      useExperiences.ts             # Moved from /hooks
      usePurchaseTicket.ts
      useFetchSingleExperience.ts
    components/
      ExperiencesList/
        ExperiencesList.tsx         # Renamed from List/experiences.tsx
        ExperiencesList.test.tsx
        ExperiencesCard.tsx
        ExperiencesCard.test.tsx
        ExperiencesSkeleton.tsx
      InvitedExperiencesList/
        InvitedExperiencesList.tsx
        InvitedExperiencesList.test.tsx
      ExperienceDetail/
        ExperienceDetail.tsx
        ExperienceDetail.test.tsx
      ExperienceFilters.tsx
      ExperienceFilters.test.tsx
    types.ts                        # Moved from /types/experience.ts
    create/
      page.tsx
      layout.tsx
      hooks/
        useCreateExperience.ts       # Extract from create/page.tsx
        useExperienceValidation.ts
      components/
        CreateExperienceStepper/
          CreateExperienceStepper.tsx
        CommunityStep/
          CommunityStep.tsx
          CommunityStep.test.tsx
        AboutStep/
          AboutStep.tsx
          AboutStep.test.tsx
        DatesStep/
          DatesStep.tsx
          DatesStep.test.tsx
        TicketsStep/
          TicketsStep.tsx
          TicketsStep.test.tsx
        ReviewStep/
          ReviewStep/
            ReviewStep.tsx
            ...
      types.ts                      # Feature-specific types
    [experienceId]/
      page.tsx
      components/
        ExperienceDetailHeader.tsx
        ExperienceTickets.tsx
        ExperienceReviews.tsx
      reserve/
        page.tsx
    review/
      [experienceId]/
        page.tsx

  (places)/                         # Route group
    page.tsx
    layout.tsx
    hooks/
      usePlaces.ts
      usePlaceCategories.ts
    components/
      PlacesList/
        PlacesList.tsx
        PlacesList.test.tsx
        PlaceCard.tsx
        PlaceCard.test.tsx
      PlaceFilters.tsx
    types.ts
    [placeId]/
      page.tsx
      components/
        PlaceDetailHeader.tsx
        PlaceReviews.tsx
        PlacePhotos.tsx

  (communities)/                    # Route group
    page.tsx
    layout.tsx
    hooks/
      useCommunities.ts
      useJoinCommunity.ts
      useCommunityPosts.ts
    components/
      CommunitiesList/
        CommunitiesList.tsx
        CommunitiesList.test.tsx
        CommunityCard.tsx
        CommunityCard.test.tsx
      CommunitiesFilters.tsx
    types.ts
    create/
      page.tsx
      components/
        CreateCommunityForm.tsx
    [communityId]/
      page.tsx
      components/
        CommunityHeader.tsx
        CommunityMembers.tsx
        CommunityPosts.tsx

  (auth)/                           # Route group (optional, for clarity)
    sign-in/
      page.tsx
    sign-up/
      page.tsx
    forgot-password/
      page.tsx
    layout.tsx

  shared/                           # NEW: Truly shared components (no feature owner)
    components/
      Navigation/
        Nav.tsx
        Nav.test.tsx
        BottomNavigation.tsx
        BottomNavigation.test.tsx
      LocationPicker/
        LocationPicker.tsx
        LocationPicker.test.tsx
        LocationAutocompleteField.tsx
      AuthDialog/
        AuthDialog.tsx
        AuthDialog.test.tsx
      PageLayout/
        PageLayout.tsx
        PageLayoutContent.tsx
      Forms/
        FormButton.tsx
        FormInput.tsx
        FormOTPInput.tsx
      Download/
        DownloadApp.tsx
        MobileStoreLinks.tsx
      Cards/
        Card.tsx
        CardSkeleton.tsx
      Modals/
        Modal.tsx
        Drawer.tsx
      Ratings/
        Rating.tsx
        RatingStars.tsx
      Share/
        ShareButton.tsx
        ShareDialog.tsx
      Search/
        GlobalSearch.tsx
      Icons/
        IconComponent.tsx
      Images/
        TukaiImage.tsx
      Messages/
        SuccessMessage.tsx
      Skeletons/
        Skeletons.tsx
        SkeletonLoader.tsx
      Pagination/
        Pagination.tsx
    hooks/                          # Cross-cutting hooks
      useToast.ts
      useMediaQuery.ts
      useDebounce.ts
      useInfiniteScroll.ts
    types.ts                        # Shared types (ApiResponse, User, etc.)

  lib/                              # Utilities (unchanged)
    auth.ts
    serverApi.ts
    utils.ts

  api/
    auth/
      [...nextauth]/
        route.ts
    places/
      autocomplete/
        route.ts

  layout.tsx
  globals.css
  page.tsx                          # Redirects to /(experiences)

services/                           # API service layer (keep at root)
  apiService.ts                     # Core Axios setup
  experience.ts                     # Fetch functions only, logic stays in hooks
  place.ts
  community.ts
  auth.ts
  search.ts
  payment.ts

hooks/                              # OLD: Remove this, move to feature folders
  [DEPRECATED - MOVE TO FEATURES]

types/                              # OLD: Remove, move to feature folders
  [DEPRECATED - MOVE TO FEATURES]

context/                            # Global app state (unchanged)
  LocationContext.tsx
  SelectedCategoryContext.tsx
  AuthDialogContext.tsx
  DownloadAppContext.tsx

providers/                          # App providers (unchanged)
  ReactQueryProvider.tsx
  SessionProvider.tsx

store/                              # Redux (unchanged)
  store.ts
slices/                             # Redux slices (unchanged)
  userSlice.ts
  resetSlice.ts

config/                             # NEW: Configuration
  api.ts                            # API endpoint constants
  features.ts                       # Feature flags
  nextauth-config.ts                # Extract from route.ts

enums/                              # Enums (unchanged)
  status.ts

utils/                              # Utilities (unchanged, but add)
  parseSnakeToCamel.ts
  formatting.ts
  date-utils.ts
  [ADD FEATURE-SPECIFIC UTILS HERE]
```

---

## 2. REFACTORING PRIORITY MATRIX

### High Impact + Feasible (Do First)

#### **#1: Convert All Exports to Named Exports [12-16 hours]**

**Impact Score:** 10/10 (Consistency across 100+ files)
**Effort:** 8/10 (Automated tools + manual QA)
**Risk:** Low (Pure refactor, no logic change)

**Why first:** Enables all other refactors; blocks new engineers from understanding conventions.

**Implementation:**

```bash
# Step 1: Install eslint-plugin-import
npm install --save-dev eslint-plugin-import

# Step 2: Update .eslintrc.js to enforce named exports
# Add to rules:
'import/no-default-export': ['error', { allowSyntheticDefaultImports: true }],
```

**Automated conversion (sample — apply to whole app/):**

```tsx
// Before
export default function Nav() { ... }
import Nav from '@/app/components/nav'

// After
export const Nav = ({ ... }) => { ... }
import { Nav } from '@/app/components/nav'
```

**Affected files:**

- All `page.tsx` (20 files)
- All `layout.tsx` (5 files)
- `app/components/*` (30+ files)
- `app/experiences/components/*` (15 files)
- `app/places/components/*` (10 files)
- `app/communities/components/*` (15 files)

**Testing before/after:**

- Verify `npm run build` passes
- Verify `npm run lint` passes
- Run existing tests: `npm test`

**Commit strategy:** Single commit with message:

```
refactor: convert all exports to named exports

- Convert all default exports to named exports across app/
- Update .eslintrc.js to enforce import/no-default-export
- Update all import statements to use destructuring
- Maintains functionality; purely structural change
```

---

#### **#2: Extract Feature-Level Hooks [4-6 hours]**

**Impact Score:** 9/10 (Improves discoverability for new engineers)
**Effort:** 5/10 (Straightforward file movement + path updates)
**Risk:** Low (Just moving files)

**Phase 1: Experiences (Template for others)**

```
MOVE:
hooks/experiences.tsx           → app/(experiences)/hooks/useExperiences.ts
hooks/experiences.tsx (others)  → app/(experiences)/hooks/useXxx.ts

UPDATE:
app/experiences/create/page.tsx - change import paths
app/experiences/components/      - change import paths
services/experience.ts           - stays at root (API calls only)
```

**Before:**

```tsx
import { useExperiences } from '@/hooks/experiences';
```

**After:**

```tsx
import { useExperiences } from '@/(experiences)/hooks/useExperiences';
```

**Hooks to move (Experiences):**

- `useExperiences` → `app/(experiences)/hooks/useExperiences.ts`
- `useFetchSingleExperience` → `app/(experiences)/hooks/useFetchSingleExperience.ts`
- `usePurchaseExperienceTicket` → `app/(experiences)/hooks/usePurchaseExperienceTicket.ts`
- `useCreateExperience` → `app/(experiences)/create/hooks/useCreateExperience.ts` (NEW - extract from create/page.tsx)
- `useUpdateExperience` → `app/(experiences)/hooks/useUpdateExperience.ts`

**Same for places and communities** (smaller, ~3 hooks each)

---

#### **#3: Extract Route Groups [1-2 hours]**

**Impact Score:** 8/10 (Clarifies architecture)
**Effort:** 3/10 (Rename folders, move files)
**Risk:** Low (Next.js route group feature is stable)

```bash
# Step 1: Create route groups
mkdir -p app/\(experiences\)
mkdir -p app/\(places\)
mkdir -p app/\(communities\)
mkdir -p app/\(auth\)

# Step 2: Move files
mv app/page.tsx app/\(experiences\)/page.tsx

# Step 3: Create layout.tsx in each group if needed
# (Optional: only if they have unique layouts)
```

**No import path changes needed** — Next.js handles route groups transparently.

---

### High Impact + Moderate Effort (Do Second)

#### **#4: Consolidate Shared Components [6-8 hours]**

**Impact Score:** 7/10 (Reduces cognitive load on navigation)
**Effort:** 6/10 (Requires careful auditing)
**Risk:** Medium (Some components may have subtle feature-specific deps)

**Create `app/shared/components/` and organize:**

```
Current (scattered):
app/components/nav.tsx
app/components/bottomNavigation.tsx
app/components/userLocation.tsx
app/components/locationAutocompleteField.tsx
app/components/search.tsx
app/components/authActions.tsx
app/components/fileUploadField.tsx
app/components/mobileStore.tsx
app/components/pageLayoutContent.tsx
app/components/downloadApp.tsx
app/components/locationPrompt.tsx
app/components/descriptionShowMore.tsx
app/components/rating.tsx
app/components/sendMessage.tsx
app/components/iconComponent.tsx
+ subdirectories: bookmark/, review/, pills/, share/, messages/, form/

Organized:
app/shared/components/
  Navigation/
    Nav.tsx (+ test)
    BottomNavigation.tsx (+ test)
  LocationPicker/
    LocationPicker.tsx (composite)
    LocationAutocompleteField.tsx
  Search/
    GlobalSearch.tsx
  Auth/
    AuthActions.tsx
    AuthDialog.tsx (moved from context)
  Forms/
    FileUploadField.tsx
    FormButton.tsx
    FormInput.tsx
    FormOTPInput.tsx
  Download/
    DownloadApp.tsx
    MobileStore.tsx
  Cards/
    (ExperienceCard.tsx, PlaceCard.tsx moved from features)
    SharedCard.tsx (base component)
  Dialogs/
    SendMessage.tsx
  Ratings/
    Rating.tsx
    RatingStars.tsx
  Shared/
    IconComponent.tsx
    DescriptionShowMore.tsx
    PageLayoutContent.tsx
    LocationPrompt.tsx
```

**What NOT to move:**

- Feature-specific components (ExperiencesCard is used ONLY in experiences, stays there)
- Components living in `app/components/experiences/List/` → move to `app/(experiences)/components/`

---

#### **#5: Move Types to Feature Folders [2-3 hours]**

**Impact Score:** 7/10 (Feature co-location)
**Effort:** 4/10 (File movement + import updates)
**Risk:** Low

```
MOVE:
types/experience.ts              → app/(experiences)/types.ts
types/place.ts                   → app/(places)/types.ts
types/community.ts               → app/(communities)/types.ts

KEEP at root (shared):
types/apiResponse.ts
types/user.ts
types/location.ts
types/photo.ts
types/token.ts
types/jwt.ts
types/subscription.ts
types/interest.ts
types/ticket.ts
types/review.ts
types/comment.ts
types/placeCategory.ts
types/experienceCategory.ts
types/search.ts
types/purchaser.ts
types/payment.ts
types/googleMaps.ts
types/networkParam.ts
```

**Update imports:**

```tsx
// Before
import { Experience } from '@/types/experience'

// After
import { Experience } from '@/(experiences)/types'
```

---

### Medium Impact (Do Third)

#### **#6: Extract Page-Level Logic to Custom Hooks [4-5 hours]**

**Impact Score:** 6/10 (Cleaner page components, testability)
**Effort:** 5/10 (Requires careful extraction)
**Risk:** Medium (Logic interdependencies)

**Example 1: Extract Create Experience Flow**

```tsx
// app/(experiences)/create/hooks/useCreateExperienceFlow.ts
export const useCreateExperienceFlow = () => {
  const [activeStep, setActiveStep] = useState<ExperienceStepId>('community');
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const [itineraryConfig, setItineraryConfig] = useState({ ... });
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [invitedCommunities, setInvitedCommunities] = useState([]);

  const handleStepComplete = (stepId: ExperienceStepId) => { ... };
  const handleExperienceSave = (data) => { ... };

  return {
    activeStep,
    setActiveStep,
    experienceId,
    itineraryConfig,
    invitedMembers,
    invitedCommunities,
    // handlers
  };
};

// app/(experiences)/create/page.tsx becomes:
export const CreateExperiencePage = () => {
  const flow = useCreateExperienceFlow();
  const searchParams = useSearchParams();

  return (
    <CreateExperiencePageContent
      activeStep={flow.activeStep}
      onStepChange={flow.setActiveStep}
      // ...
    />
  );
};
```

**Extract for:**

- Experiences create flow (currently 300+ lines in page.tsx)
- Communities create flow
- Auth multi-step flow (sign-up → interests → profile)

---

#### **#7: Add Component Tests [8-10 hours over multiple PRs]**

**Impact Score:** 5/10 (Confidence, catches regressions)
**Effort:** 7/10 (Requires testing discipline)
**Risk:** Low (Tests don't affect production code)

**Phase 1: Shared navigation components** (1 PR)

```
app/shared/components/Navigation/
  Nav.test.tsx
  BottomNavigation.test.tsx
```

**Phase 2: Feature card components** (1 PR per feature)

```
app/(experiences)/components/
  ExperiencesCard.test.tsx
  ExperiencesCard.tsx
```

**Phase 3: Complex stateful components** (1 PR)

```
app/shared/components/LocationPicker/
  LocationPicker.test.tsx
```

**Test template:**

```tsx
import { render, screen } from '@testing-library/react';
import { ExperiencesCard } from './ExperiencesCard';

describe('ExperiencesCard', () => {
  it('should render experience title', () => {
    const experience = { id: '1', title: 'Test Hike', ... };
    render(<ExperiencesCard experience={experience} />);
    expect(screen.getByText('Test Hike')).toBeInTheDocument();
  });

  it('should call onBookmark when bookmark button is clicked', async () => {
    const onBookmark = jest.fn();
    render(
      <ExperiencesCard experience={mockExperience} onBookmark={onBookmark} />
    );
    await userEvent.click(screen.getByRole('button', { name: /bookmark/i }));
    expect(onBookmark).toHaveBeenCalled();
  });
});
```

---

### Lower Impact (Do Last)

#### **#8: Audit and Remove 'use client' Where Unnecessary [2-3 hours]**

**Impact Score:** 3/10 (Minor performance, clarity)
**Effort:** 4/10 (Requires testing)
**Risk:** Medium (Can break if component has hidden dependencies)

**Strategy: Start with components that DON'T use hooks or browser APIs**

```tsx
// ❌ Unnecessary 'use client' — no hooks, no browser APIs
'use client';
import { Button } from '@/components/ui/button';

export const SocialLinks = ({ links }: { links: PlaceSocialLink[] }) => {
  return links.map((link) => (
    <Button key={link.id} onClick={() => window.open(link.url, '_blank')}>
      {link.platformName}
    </Button>
  ));
};

// ✅ Fixed: Move 'use client' to the button's onClick handler, or:
// - Keep as RSC and pass a server action
// - Or: Convert onClick to a client component only when needed
```

**Candidates for removal:**

- `locationAutocompleteField.tsx` — no hooks, only receives props
- `socialLinks.tsx` — uses `window.open` but could be handled differently
- `pageLayoutContent.tsx` — uses `useRef` for animation (actually needs 'use client', keep it)

---

## 3. COMPONENT EXTRACTION & CONSOLIDATION OPPORTUNITIES

### A. Extract Reusable Card Components

**Current:** Each feature has its own card (ExperiencesCard, PlaceCard, CommunityCard)
**Problem:** Duplicate styles, different prop names, logic drift

**Solution: Create a generic card component**

```tsx
// app/shared/components/Cards/FeatureCard.tsx
type FeatureCardProps = {
  id: string;
  title: string;
  image: string;
  rating?: number;
  description?: string;
  metadata?: { label: string; value: string }[];
  actions?: {
    primary: { label: string; onClick: () => void };
    secondary?: { label: string; onClick: () => void };
  };
  variant?: 'experience' | 'place' | 'community';
};

export const FeatureCard = ({ id, title, image, rating, actions, variant }: FeatureCardProps) => {
  return (
    <div className="rounded-lg border p-4">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      {rating && <Rating value={rating} />}
      {actions && (
        <div className="flex gap-2">
          <Button onClick={actions.primary.onClick}>{actions.primary.label}</Button>
          {actions.secondary && (
            <Button variant="outline" onClick={actions.secondary.onClick}>
              {actions.secondary.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
```

**Then feature-specific cards become thin wrappers:**

```tsx
// app/(experiences)/components/ExperiencesCard.tsx
export const ExperiencesCard = ({ experience, onBookmark, onReserve }: ExperienceCardProps) => (
  <FeatureCard
    id={experience.id}
    title={experience.title}
    image={experience.photos[0]?.url}
    rating={experience.averageRating}
    actions={{
      primary: { label: 'Reserve', onClick: onReserve },
      secondary: { label: 'Save', onClick: onBookmark },
    }}
    variant="experience"
  />
);
```

**Benefits:**

- Shared styling and interaction patterns
- Easier to A/B test UI changes
- Reduces code duplication by ~200 lines

---

### B. Extract Modal/Dialog Patterns

**Current:** AuthDialog, SendMessage, Drawer logic scattered
**Problem:** Each reimplements modal state (open/close), animations

**Solution: Create a ModalBase component**

```tsx
// app/shared/components/Modals/ModalBase.tsx
type ModalBaseProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  actions?: { label: string; onClick: () => void }[];
};

export const ModalBase = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions,
}: ModalBaseProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`size-${size}`}>
        {title && <DialogHeader>{title}</DialogHeader>}
        {children}
        {actions && (
          <DialogFooter>
            {actions.map((action) => (
              <Button key={action.label} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

**Then specific modals become:**

```tsx
// Simplify SendMessage modal
export const SendMessageModal = ({ isOpen, onClose, recipientId }: SendMessageModalProps) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Send Message">
    <SendMessageForm recipientId={recipientId} onSubmit={onClose} />
  </ModalBase>
);
```

---

### C. Consolidate Form Components

**Current:**

```
app/components/form/
  button.tsx
  input.tsx
  otpInput.tsx
  loader.tsx
  anchor.tsx
```

**Problem:** No consistent error handling, validation patterns vary

**Solution: Create FormField wrapper**

```tsx
// app/shared/components/Forms/FormField.tsx
type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

export const FormField = ({ label, error, required, children }: FormFieldProps) => (
  <div className="mb-4">
    <label className="mb-2 block font-medium">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// Usage:
<FormField label="Email" error={errors.email?.message} required>
  <input {...register('email')} />
</FormField>;
```

**Benefits:**

- Consistent error display
- Standardized spacing
- Accessibility (label → input associations)

---

### D. Extract Data-Fetching Wrapper

**Current:** Every list component (ExperiencesList, PlacesList, CommunitiesList) reimplements:

- Loading state
- Pagination
- Empty state
- Error handling

**Solution: Create a ListContainer component**

```tsx
// app/shared/components/Lists/ListContainer.tsx
type ListContainerProps<T> = {
  items: T[];
  isLoading: boolean;
  error?: Error;
  isEmpty: boolean;
  emptyMessage: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeletons?: (count: number) => React.ReactNode;
  columns?: number;
};

export const ListContainer = <T,>({
  items,
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  page,
  totalPages,
  onPageChange,
  renderItem,
  renderSkeletons,
  columns = 4,
}: ListContainerProps<T>) => {
  if (isLoading) return renderSkeletons?.(12) || <LoadingSkeleton count={12} />;
  if (error) return <ErrorBanner message={error.message} />;
  if (isEmpty) return <EmptyState message={emptyMessage} />;

  return (
    <>
      <div className={`grid grid-cols-${columns} gap-4`}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
      <Pagination current={page} total={totalPages} onChange={onPageChange} />
    </>
  );
};

// Usage in ExperiencesList:
<ListContainer
  items={experiences}
  isLoading={isLoading}
  isEmpty={experiences.length === 0}
  emptyMessage="No experiences found"
  page={page}
  totalPages={Math.ceil(count / PAGE_SIZE)}
  onPageChange={setPage}
  renderItem={(exp) => <ExperiencesCard experience={exp} />}
/>;
```

**Reduces component code by ~150 lines per list**

---

### E. Extract Filter UI Patterns

**Current:** Search component, scrollable filters, category pills all have different implementations

**Solution: Create FilterBar component**

```tsx
// app/shared/components/Filters/FilterBar.tsx
type FilterBarProps = {
  filters: { id: string; label: string; icon?: React.ReactNode; active: boolean }[];
  onFilterChange: (filterId: string, active: boolean) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  horizontal?: boolean;
};

export const FilterBar = ({
  filters,
  onFilterChange,
  searchPlaceholder,
  onSearch,
  horizontal = true,
}: FilterBarProps) => (
  <div className={horizontal ? 'flex gap-2 overflow-x-auto' : 'flex flex-col gap-2'}>
    {searchPlaceholder && (
      <input
        type="search"
        placeholder={searchPlaceholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="rounded border px-3 py-2"
      />
    )}
    {filters.map((filter) => (
      <button
        key={filter.id}
        onClick={() => onFilterChange(filter.id, !filter.active)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 ${
          filter.active ? 'bg-primary text-white' : 'bg-gray-100'
        }`}
      >
        {filter.icon}
        {filter.label}
      </button>
    ))}
  </div>
);
```

---

## 4. WHAT NEW ENGINEERS FIND CONFUSING (& How to Fix)

### Confusion #1: "Where do I find the hook for [feature]?"

**Problem:**

```
They look in app/experiences/ → no hooks folder
They then look in app/components/ → might find it elsewhere
They finally check /hooks/ at the root → FOUND IT

Takes 5-10 minutes for something that should be 30 seconds
```

**Current state:**

```
hooks/
  experiences.tsx        ← "useExperiences" is here
  places.tsx            ← "usePlaces" is here
  communities.tsx       ← "useCommunities" is here
  use-toast.ts          ← cross-cutting hook
  pages.ts              ← unclear purpose
  comms.tsx             ← unclear: is this "communications"?
  subscriptions.tsx     ← is this related to auth or features?
  auth.ts               ← auth-specific
  search.tsx            ← search-specific
```

**Solution:**

```
✅ Move feature hooks to feature folders
✅ Document: "Feature hooks live in app/[feature]/hooks/"
✅ Cross-cutting hooks stay in app/shared/hooks/
✅ Rename ambiguous files: comms.tsx → communications.tsx
```

**Fix: Add to README.md or CONTRIBUTING.md**

```markdown
## Finding Hooks

- **Feature-specific hooks** (useExperiences, usePlaces, etc.):
  → `app/[feature]/hooks/`

  Example:
```

app/(experiences)/hooks/useExperiences.ts
app/(places)/hooks/usePlaces.ts

```

- **Cross-cutting hooks** (useToast, useMediaQuery, etc.):
→ `app/shared/hooks/`

- **Server/API hooks** (not React hooks):
→ Import from `@/services/[feature].ts`
```

---

### Confusion #2: "Do I put logic in services/ or hooks/?"

**Problem:**

```
services/experience.ts:
  - fetchExperiences()  ← API call
  - createExperience()  ← API call
  - publishExperience() ← API call

hooks/experiences.tsx:
  - useExperiences()     ← wraps fetchExperiences with useQuery
  - useCreateExperience()← wraps createExperience with useMutation

They're confused about the boundary.
```

**Current pain point:**

```
"If I need to fetch data, which file do I add code to?"
"Should I create a service function or a hook?"
"Why are some services not exported from hooks?"
```

**Solution: Clear separation**

````markdown
## Services vs Hooks

### Services (`services/experience.ts`)

Raw API calls + data transformation.

- No React hooks
- Reusable across server and client code
- Responsibility: HTTP + serialization

```ts
// services/experience.ts
export const fetchExperience = async (id: string): Promise<Experience> => {
  const response = await api.get(`/experiences/${id}`);
  return response.data;
};

export const createExperience = async (data: CreateExperience) => {
  const response = await api.post('/experiences', data);
  return response.data;
};
```
````

### Hooks (`app/[feature]/hooks/`)

React Query wrappers + state management

- Uses React hooks (useQuery, useMutation, useState, etc.)
- Client-side only
- Responsibility: caching, loading state, error handling

```ts
// app/(experiences)/hooks/useExperiences.ts
export const useExperiences = (params: ExperiencesQueryParams) => {
  return useQuery({
    queryKey: ['experiences', params],
    queryFn: () => fetchExperiences(params), // calls service
  });
};
```

## Decision Tree

**Need to fetch data from the API?**
→ Create a service function in `services/[feature].ts`

**Need to use that data in a React component?**
→ Wrap with a hook in `app/[feature]/hooks/`

**Need to share logic between components?**
→ If UI state: create a custom hook
→ If business logic: consider extracting to a utility function

**Need to use the data server-side?**
→ Call the service function directly from a Server Component

```

---

### Confusion #3: "Are these shared components or feature-specific?"

**Problem:**
```

app/components/
experiences/ ← Feature-specific, but at root level
List/
experiences.tsx ← The main one
Single/
bookmark/ ← Feature? Or shared? (Unclear)
review/ ← Feature? Or shared? (Unclear)
pills/ ← What's a "pill"? (Naming)
share/ ← Shared? Which feature?
form/ ← Shared, but scattered

"Do I add my new card component here or in experiences/components/?"

````

**Solution: Document and reorganize**

```markdown
## Component Organization

### Feature Components (`app/[feature]/components/`)
Components used ONLY in one feature.
Examples:
- ExperiencesCard (only in experiences)
- PlaceReviews (only in places)
- CommunityMembers (only in communities)

**Decision:** If your component is used in only 1 feature → put it in `app/[feature]/components/`

### Shared Components (`app/shared/components/`)
Components used in 2+ features, or UI primitives.
Examples:
- BookmarkButton (used in experiences, places, communities)
- RatingStars (used everywhere)
- ImageGallery (reusable UI)
- Nav, Footer (global)

**Decision:** If your component is used in 2+ features → put it in `app/shared/components/`

### Subdirectory Naming
Organize by UI concept or domain:
````

app/shared/components/
Navigation/ ← Nav, BottomNav, Breadcrumbs
Cards/ ← Generic card, skeletons, variants
Forms/ ← FormField, FormButton, inputs
Dialogs/ ← Modal, Drawer, AlertDialog
Filters/ ← FilterBar, CategoryFilter
Lists/ ← ListContainer, Pagination
Images/ ← ImageUpload, Gallery, Lightbox
Ratings/ ← StarRating, ReviewStars
Moderation/ ← ReportButton, ReviewCard (review features)
Shared/ ← Utils like IconComponent (truly misc)

```

```

---

### Confusion #4: "This component takes 10 props — what does each do?"

**Problem:**

```tsx
// Example from the codebase
<Experiences
  key={categoryFromQuery}
  category={categoryFromQuery}
  title={`Happening Today: ${moment().format('Do MMMM, YYYY')}`}
  date={moment().format('YYYY-MM-DD')}
  isPortal={true}
  isReserved={false}
  isBookedmarked={false}
  isHosted={false}
  skeletonCount={3}
  noDataMessage="..."
/>

// What does isPortal mean? Why isReserved AND isHosted?
// Are these filters or display flags?
```

**Solution: Better prop naming + documentation**

```tsx
// BEFORE (confusing)
type ListExperiencesProps = {
  title?: string;
  skeletonCount?: number;
  category?: string;
  date?: string;
  isPortal?: boolean; // ❓ What is a portal?
  isReserved?: boolean; // ❓ Filters or view mode?
  isBookedmarked?: boolean; // ❓ Also isPortal?
  isHosted?: boolean; // ❓ How does this relate to isPortal?
  noDataMessage?: string;
};

// AFTER (clear intent)
type ListExperiencesProps = {
  // Display
  title?: string; // Section title
  layout?: 'grid' | 'list'; // Render mode

  // Data filtering
  filter?: {
    date?: string; // Show only on this date
    category?: string; // Show only this category
  };

  // View modes (mutually exclusive)
  viewMode: 'upcoming' | 'bookmarked' | 'hosted' | 'discover';

  // UI state
  skeletonCount?: number; // Loading placeholders
  emptyMessage?: string; // When no results

  // Layout (internal)
  renderAsPortal?: boolean; // Render in portal? (use better name or remove)
};

// And document the intent:
/**
 * Renders a list of experiences with filtering and view modes.
 *
 * @param viewMode - Type of experiences to show:
 *   - 'upcoming': Experiences with upcoming tickets
 *   - 'bookmarked': User's saved experiences
 *   - 'hosted': Experiences the user created
 *   - 'discover': All experiences (default)
 *
 * @example
 * <ExperiencesList viewMode="bookmarked" />
 */
```

---

### Confusion #5: "Why does the types file import from enums, but not vice versa?"

**Problem:**

```
types/experience.ts:
  import { Status } from '@/enums/status'    ← OK

enums/status.ts:
  export const status = { ... }               ← Not importing types

"What's the pattern here? Should enums know about types?"
```

**Solution: Document dependency layers**

```markdown
## Dependency Layers

Your codebase has implicit layers:
```

Layer 1 (Primitives):
enums/
utils/
lib/

Layer 2 (Domain):
types/ ← imports Layer 1
services/ ← imports Layer 1, 2

Layer 3 (Features):
app/[feature]/ ← imports Layer 1, 2, 3
hooks/ ← imports Layer 1, 2, 3
context/ ← imports Layer 1, 2, 3

Layer 4 (Components):
app/[feature]/components/ ← imports Layer 1-4

```

**Rule:** Never import from a higher layer into a lower one.
- ✅ types/ can import from enums/
- ✅ components/ can import from types/
- ❌ enums/ should NOT import from types/
- ❌ types/ should NOT import from components/
```

---

### Confusion #6: "What does `isPortal` actually do?"

**Problem:** Non-obvious implementation pattern

```tsx
// In experiences/components/List/experiences.tsx
if (isPortal && selectedCategoryId !== 'all') {
  return null; // Hide if in portal view but category selected
}

if (hasExperiences === null && isPortal) {
  return null; // Hide if still loading
}

if (!hasExperiences && isPortal) {
  return null; // Hide if no experiences
}

// ❓ Why is this component sometimes invisible?
// ❓ What's a "portal" in this context?
```

**Root cause:** The prop name is misleading. It's not about React portals — it's about conditional rendering based on context.

**Solution: Rename and document**

```tsx
// BEFORE
<Experiences
  isPortal={true}
  title={`Happening Today`}
/>

// AFTER (clearer intent)
<Experiences
  hideIfCategoryFiltered={true}  // More explicit
  title={`Happening Today`}
/>

// OR even better: remove the prop entirely
// Instead: have two separate components or a conditional in the parent

// BEST: Explain the pattern in comments
/**
 * This component shows "Happening Today" only on the discover page (no category filter).
 * If the user selects a specific category, this portal disappears.
 * This is intentional: focused category views don't need "Today" shortcuts.
 */
```

---

## Summary: Quick Onboarding Checklist

Create a `ONBOARDING.md` file:

```markdown
# Quick Start for New Engineers

## Day 1: Understand the Architecture

- [ ] Read the folder structure diagram (this file)
- [ ] Understand features: Experiences, Places, Communities, Auth
- [ ] Know where hooks live: `app/[feature]/hooks/`
- [ ] Know where types live: `app/[feature]/types.ts`
- [ ] Know where shared components are: `app/shared/components/`
- [ ] Run `npm install && npm run dev`

## Day 2: Find & Modify Code

- [ ] Add a test feature flag to the home page
- [ ] Create a new hook in `app/(experiences)/hooks/`
- [ ] Add a new shared component to `app/shared/components/`
- [ ] Run `npm test` to ensure everything works

## Day 3: Code Review Readiness

- [ ] Understand Services vs Hooks (read Services vs Hooks section above)
- [ ] Ensure all exports are named (not default)
- [ ] Run `npm run lint` before committing
- [ ] Look for PRs following the folder structure

## Common Tasks

### Add a new feature page

1. Create `app/(feature)/new-page/page.tsx`
2. Export as named export: `export const FeatureName = () => { ... }`
3. Add types to `app/(feature)/types.ts` if needed
4. Add hooks to `app/(feature)/hooks/` if needed

### Add a new shared component

1. Create folder: `app/shared/components/MyComponent/`
2. Create file: `MyComponent.tsx` (named export)
3. Create test: `MyComponent.test.tsx`
4. Export from index.ts if needed

### Add API call

1. Create service function: `services/[feature].ts`
2. Wrap with hook: `app/[feature]/hooks/useXxx.ts`
3. Use hook in component

## Asking for Help

- "Where do I find X?" → Check the folder structure
- "Should I put this here or there?" → Check the component organization guide
- "Why does this component have so many props?" → It might need refactoring
```

---

## Implementation Roadmap (Suggested Timeline)

| Week | Task                                | Effort | Impact                 |
| ---- | ----------------------------------- | ------ | ---------------------- |
| 1    | #1: Named exports + ESLint          | 16h    | Critical (foundation)  |
| 1-2  | #2: Feature hooks (Experiences)     | 4h     | High (discoverability) |
| 2    | #3: Route groups                    | 2h     | High (clarity)         |
| 2    | #4: Shared components org           | 8h     | High (navigation)      |
| 3    | #5: Move types to features          | 3h     | Medium (co-location)   |
| 3    | #6: Extract hooks from pages        | 4h     | Medium (testability)   |
| 4    | #7: Add component tests             | 10h    | Medium (confidence)    |
| 4    | #8: Remove unnecessary 'use client' | 2h     | Low (perf)             |

**Total: ~6 weeks, spread across PRs**

Each refactor should be a separate PR with clear reasoning in the commit message.
