# Tukai Web — Onboarding Guide

Welcome to the Tukai team! This guide will get you from zero to shipping in under an hour.

---

## 1. What is Tukai?

Tukai is a location-based discovery platform that helps users find and book experiences (like hikes, workshops, events) and explore places (restaurants, venues, galleries) near them. Users discover what's happening around them, connect with interest-based communities, and book activities directly through the app.

The web app (`tukai-web`) is the primary platform. There's also a companion iOS/Android app.

---

## 2. Getting Started

### Install dependencies
```bash
npm install
```

### Set up your environment
Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
GOOGLE_CLIENT_ID=             # OAuth for sign-in
GOOGLE_CLIENT_SECRET=         # OAuth for sign-in
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  # Google Maps for location picker
NEXTAUTH_SECRET=              # Run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

Ask your tech lead for the actual secret values.

### Run the dev server
```bash
npm run dev
```

Open http://localhost:3000 — the app should load.

### Run tests
```bash
npm test                 # Run all tests
npm run test:coverage   # With coverage report
```

Tests use Jest and React Testing Library. Co-located with the files they test (e.g., `Button.tsx` + `Button.test.tsx`).

### Run linting
```bash
npm run lint            # Check for issues
npm run lint:fix        # Auto-fix issues
```

---

## 3. Codebase Map

Every top-level folder and what lives there:

```
app/
  (experiences)/        # Experiences feature — browse/book activities
  (places)/            # Places feature — explore venues
  (communities)/       # Communities feature — groups and posts
  (auth)/              # Auth feature — sign-in, sign-up
  shared/              # Cross-feature components, hooks, utils
    components/        # UI components used in 2+ features
    hooks/            # Custom hooks (useToast, useAuth, etc.)
  layout.tsx           # Root layout + global styles
  page.tsx             # Redirects to (experiences)

types/                 # TypeScript types (ALL at root, never in features)
services/              # REST API calls (no React, no hooks)
context/               # Global UI state (location, dialogs, etc.)
providers/             # React providers (Query, Redux, Auth)
store/                 # Redux store setup
slices/                # Redux slices (user, reset)
enums/                 # Enums (status, etc.)
utils/                 # Utility functions
lib/                   # Library setup (auth, Next.js config, etc.)
public/                # Static assets
components/            # (Legacy — do not use for new code)
```

**Key principle:** New code in new features goes into `app/(feature)/`. Cross-cutting code goes into `app/shared/`.

---

## 4. The Four Features

### Experiences
**What:** Users browse and book ticketed experiences — hikes, concerts, workshops, etc.
**Routes:** `/` (home/list), `/experiences/[id]` (detail), `/experiences/create` (host creation flow), `/experiences/reserve` (booking)
**Key files:** `app/(experiences)/hooks/useExperiences.tsx`, `services/experience.ts`

### Places
**What:** Users explore physical venues — restaurants, parks, galleries — with reviews and ratings.
**Routes:** `/places` (list), `/places/[id]` (detail with reviews)
**Key files:** `app/(places)/hooks/usePlaces.ts`, `services/place.ts`

### Communities
**What:** Users discover and join interest-based communities, view posts, connect with members.
**Routes:** `/communities` (list), `/communities/[id]` (detail), `/communities/create` (creation)
**Key files:** `app/(communities)/hooks/useCommunities.tsx`, `services/community.ts`

### Auth
**What:** Login/signup via Google OAuth or email. Session management.
**Routes:** `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`
**Key files:** `lib/auth.ts`, `services/auth.ts`

---

## 5. Where Does Code Go?

Four simple decision trees:

### Components
```
Does this component get used in just 1 feature?
  YES  → app/(feature)/components/ComponentName.tsx
  NO   → app/shared/components/[Category]/ComponentName.tsx
         (Examples: Bookmark, Experiences, Rating, SendMessage)
```

### Hooks
```
Is this hook specific to 1 feature?
  YES  → app/(feature)/hooks/useHookName.ts
  NO   → app/shared/hooks/useHookName.ts
         (Examples: useToast, useAuth, useCommunities)
```

### Types
```
Put ALL types here:
  types/typeName.ts

Why? Core domain types (Experience, Place, Community) are used
across 2+ features. Even single-feature types should go here —
they'll likely be referenced elsewhere as the product grows.

Exception: Form-scoped types tightly bound to create/edit flows:
  app/(feature)/create/types.ts  (e.g., step enums, form state)
```

### Services
```
All API calls go here:
  services/featureName.ts
  
Why? Services are pure functions (no React, no hooks). They're
easy to test, reuse, and mock. Keep them separate from component logic.
```

---

## 6. Services vs Hooks — The Key Rule

**This is the #1 source of confusion.** Here's how to think about it:

**Services** = Raw API calls. No React. Can be called from anywhere.
```typescript
// services/experience.ts
export const fetchExperiences = async (params: ExperiencesQueryParams) => {
  const response = await api.get('/experiences', { params });
  return parseSnakeToCamel(response.data);
};
```

**Hooks** = React Query wrappers + component state. Used in React components.
```typescript
// app/shared/hooks/useExperiences.tsx
export const useExperiences = (params: ExperiencesQueryParams) => {
  return useQuery({
    queryKey: ['experiences', params],
    queryFn: () => fetchExperiences(params),
    enabled: !!params.location,
  });
};
```

**Decision tree:**
- Need to call an API? → Write a function in `services/`
- Need that data in a component? → Wrap it in a hook in `app/(feature)/hooks/` or `app/shared/hooks/`
- Building a page or shared component? → Use the hook

**Real example from this codebase:**
- `fetchExperiences()` in `services/experience.ts` → raw fetch
- `useExperiences()` in `app/shared/hooks/useExperiences.tsx` → wraps the service with React Query
- Components use the hook: `const { data } = useExperiences(params)`

---

## 7. State Management

Four tools for four jobs:

| Tool | When | Example |
|------|------|---------|
| **React Query** | Server data (lists, details) | Experience list, place details, reviews |
| **Context API** | Global UI state | User's selected location, active category filter, open dialogs |
| **Redux** | User session + persistent data | Logged-in user, auth tokens, user preferences |
| **useState** | Local component state | Form inputs, open/closed panels, loading spinners |

**In practice:**
- Fetch experience list? → `useExperiences()` hook (React Query)
- Store user's selected location? → `LocationContext` (Context)
- Keep user logged in after refresh? → Redux with redux-persist
- Track whether a button is loading? → `useState(false)`

---

## 8. Common Tasks

### A. Add a new shared component

Shared components are used in 2+ features. Example: a generic rating display.

**Files to create:**
```
app/shared/components/NewComponent/
  NewComponent.tsx          # The component (named export)
  NewComponent.test.tsx     # Tests (optional but encouraged)
  index.ts                  # Barrel file
```

**NewComponent.tsx:**
```typescript
export const NewComponent = ({ prop1, prop2 }: NewComponentProps) => {
  return <div>{prop1}</div>;
};

type NewComponentProps = {
  prop1: string;
  prop2?: number;
};
```

**NewComponent/index.ts:**
```typescript
export { NewComponent } from './NewComponent';
```

**Use it in a component:**
```typescript
import { NewComponent } from '@/app/shared/components/NewComponent';

export const MyPage = () => {
  return <NewComponent prop1="test" />;
};
```

### B. Add a new feature-specific component

Feature components live inside their feature folder. Example: adding an ExperienceCard to experiences.

**Files to create:**
```
app/(experiences)/components/ExperienceCard/
  ExperienceCard.tsx
  ExperienceCard.test.tsx
  index.ts
```

**Use it:**
```typescript
import { ExperienceCard } from '@/app/(experiences)/components';

// Inside (experiences) feature, you can use it
export const ExperienceList = () => {
  return <ExperienceCard />;
};
```

### C. Add a new API call + hook

Example: Adding a "like place" feature.

**Step 1: Add the service function**
```typescript
// services/place.ts
export const likePlace = async (placeId: string) => {
  return api.post(`/places/${placeId}/like`, {});
};
```

**Step 2: Add the hook**
```typescript
// app/(places)/hooks/usePlaces.ts (already exists — add to it)
export const useLikePlace = (placeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => likePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places', placeId] });
    },
  });
};
```

**Step 3: Use the hook in a component**
```typescript
// app/(places)/components/PlaceCard.tsx
const { mutate: toggleLike } = useLikePlace(place.id);

return (
  <button onClick={() => toggleLike()}>
    Like
  </button>
);
```

### D. Add a new page to an existing feature

Example: Adding a `/places/favorites` page.

**File to create:**
```
app/(places)/places/favorites/
  page.tsx      (route handler — must use default export)
  layout.tsx    (optional — for this page's layout)
```

**page.tsx:**
```typescript
export default function FavoritePlacesPage() {
  // Use hooks here
  const { data: places } = usePlaces({ bookmarked: true });
  
  return (
    <div>
      {places?.map(place => <PlaceCard key={place.id} place={place} />)}
    </div>
  );
}
```

---

## 9. Conventions Checklist

Before every PR, run through this:

- [ ] **Named exports** used everywhere (except `page.tsx`, `layout.tsx`, `route.ts`)
  - ✅ `export const Button = () => {}`
  - ❌ `export default Button`

- [ ] **Absolute imports** via `@/` (no relative imports)
  - ✅ `import { Button } from '@/app/shared/components/Button'`
  - ❌ `import { Button } from '../../../components/Button'`

- [ ] **No hardcoded colours**
  - ✅ `className="bg-primary text-white"`
  - ❌ `className="bg-#2563EB"`

- [ ] **`'use client'`** only where needed (hooks, browser APIs)
  - ✅ On components with `useState`, `useEffect`, event handlers
  - ❌ On Server Components that just render UI

- [ ] **Tests co-located** if you added a component or hook
  - ✅ `Button.tsx` + `Button.test.tsx` in same folder
  - ❌ Tests folder somewhere else

- [ ] **No new files** in root `hooks/` or root `app/components/`
  - ✅ Feature hooks → `app/(feature)/hooks/`
  - ✅ Shared hooks → `app/shared/hooks/`
  - ❌ New files in root `hooks/` or `app/components/`

---

## 10. Key Resources

**Tech Lead:** [name]  
**Figma (design system):** [link]  
**API Documentation:** [link]  
**Staging environment:** [link]  
**Backend repo:** [link]  
**Slack channel:** [#channel]  

For questions: ask in Slack or check `CLAUDE.md` (architecture decisions) and `CLAUDE.md` (detailed conventions).

---

## Next Steps

1. **Run the app locally** — make sure `npm run dev` works
2. **Pick a small task** — fix a UI bug, add a label to a button
3. **Create a feature branch** — `git checkout -b feature/your-task`
4. **Make the change** — follow the patterns above
5. **Run tests & lint** — `npm test` + `npm run lint:fix`
6. **Open a PR** — link to the issue (if any)

You've got this. Good luck! 🚀
