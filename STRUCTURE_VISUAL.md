# Visual Structure Guide

## Current vs Proposed: Side-by-Side

### Navigation & Discoverability

```
CURRENT (What New Engineers Experience)
========================================

Q: "Where's the useExperiences hook?"
A: "Let me search in /hooks... found it!"
   Time: 5-10 minutes
   Frustration: Why isn't it with the experiences feature?

Q: "Should I put my new card here or there?"
A: "Well, it's used in experiences and places... maybe /components?"
   Time: 10-15 minutes
   Frustration: No clear pattern


PROPOSED (What New Engineers Will Experience)
==============================================

Q: "Where's the useExperiences hook?"
A: "In app/(experiences)/hooks/useExperiences.ts"
   Time: 30 seconds
   Clarity: Features own their hooks

Q: "Should I put my new card here or there?"
A: "Check: used in 1 feature? → app/[feature]/components/"
   A: "Used in 2+ features? → app/shared/components/"
   Time: 1 minute
   Clarity: Clear decision tree
```

---

## Complete Folder Structure (Target State)

```
app/
├── (experiences)                    ← Route group: main feature
│   ├── page.tsx                     ← / (home/experiences listing)
│   ├── layout.tsx                   ← Shared layout
│   ├── hooks/                       ← Feature hooks (MOVED from /hooks)
│   │   ├── useExperiences.ts
│   │   ├── useFetchSingleExperience.ts
│   │   ├── usePurchaseExperienceTicket.ts
│   │   ├── useCreateExperience.ts
│   │   └── index.ts                 ← Export all
│   ├── components/                  ← Feature components
│   │   ├── ExperiencesList/
│   │   │   ├── ExperiencesList.tsx
│   │   │   ├── ExperiencesList.test.tsx
│   │   │   ├── ExperiencesCard.tsx
│   │   │   ├── ExperiencesCard.test.tsx
│   │   │   └── index.ts
│   │   ├── InvitedExperiencesList/
│   │   ├── ExperienceFilters/
│   │   └── index.ts                 ← Re-export commonly used
│   ├── types.ts                     ← Feature types (MOVED from /types)
│   ├── create/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── hooks/                   ← Create-specific hooks
│   │   │   ├── useCreateExperienceFlow.ts
│   │   │   ├── useExperienceValidation.ts
│   │   │   └── index.ts
│   │   ├── components/              ← Step components
│   │   │   ├── CreateExperienceStepper/
│   │   │   ├── CommunityStep/
│   │   │   ├── AboutStep/
│   │   │   ├── DatesStep/
│   │   │   ├── TicketsStep/
│   │   │   └── ReviewStep/
│   │   └── types.ts                 ← Create-specific types
│   ├── [experienceId]/
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── ExperienceDetailHeader.tsx
│   │   │   ├── ExperienceTickets.tsx
│   │   │   └── ExperienceReviews.tsx
│   │   └── reserve/
│   │       └── page.tsx
│   └── review/
│       └── [experienceId]/
│           └── page.tsx
│
├── (places)                         ← Route group: places feature
│   ├── page.tsx
│   ├── layout.tsx
│   ├── hooks/
│   │   ├── usePlaces.ts
│   │   ├── usePlaceCategories.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── PlacesList/
│   │   │   ├── PlacesList.tsx
│   │   │   ├── PlaceCard.tsx
│   │   │   └── index.ts
│   │   ├── PlaceFilters/
│   │   └── index.ts
│   ├── types.ts
│   └── [placeId]/
│       ├── page.tsx
│       └── components/
│           ├── PlaceDetailHeader.tsx
│           ├── PlaceReviews.tsx
│           └── PlacePhotos.tsx
│
├── (communities)                    ← Route group: communities feature
│   ├── page.tsx
│   ├── layout.tsx
│   ├── hooks/
│   │   ├── useCommunities.ts
│   │   ├── useJoinCommunity.ts
│   │   ├── useCommunityPosts.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── CommunitiesList/
│   │   │   ├── CommunitiesList.tsx
│   │   │   ├── CommunityCard.tsx
│   │   │   └── index.ts
│   │   ├── CommunitiesFilters/
│   │   └── index.ts
│   ├── types.ts
│   ├── create/
│   │   ├── page.tsx
│   │   └── components/
│   │       └── CreateCommunityForm.tsx
│   └── [communityId]/
│       ├── page.tsx
│       └── components/
│           ├── CommunityHeader.tsx
│           ├── CommunityMembers.tsx
│           └── CommunityPosts.tsx
│
├── (auth)                           ← Route group: authentication
│   ├── layout.tsx
│   ├── sign-in/
│   │   └── page.tsx
│   ├── sign-up/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── shared/                          ← Truly shared components & hooks
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── Nav.tsx
│   │   │   ├── Nav.test.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   └── index.ts
│   │   ├── Forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormButton.tsx
│   │   │   ├── FormInput.tsx
│   │   │   └── index.ts
│   │   ├── LocationPicker/
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── LocationAutocompleteField.tsx
│   │   │   └── index.ts
│   │   ├── Cards/
│   │   │   ├── FeatureCard.tsx       ← Generic card base
│   │   │   ├── CardSkeleton.tsx
│   │   │   └── index.ts
│   │   ├── Dialogs/
│   │   │   ├── ModalBase.tsx         ← Generic modal base
│   │   │   ├── Drawer.tsx
│   │   │   └── index.ts
│   │   ├── Filters/
│   │   │   ├── FilterBar.tsx
│   │   │   └── index.ts
│   │   ├── Search/
│   │   │   ├── GlobalSearch.tsx
│   │   │   └── index.ts
│   │   ├── Images/
│   │   │   ├── TukaiImage.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   └── index.ts
│   │   ├── Ratings/
│   │   │   ├── Rating.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   └── index.ts
│   │   ├── Download/
│   │   │   ├── DownloadApp.tsx
│   │   │   ├── MobileStore.tsx
│   │   │   └── index.ts
│   │   ├── Messages/
│   │   │   ├── SuccessMessage.tsx
│   │   │   └── index.ts
│   │   ├── Skeletons/
│   │   │   ├── Skeletons.tsx
│   │   │   └── index.ts
│   │   ├── Pagination/
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts
│   │   ├── Icons/
│   │   │   ├── IconComponent.tsx
│   │   │   └── index.ts
│   │   └── index.ts                 ← Central export point
│   ├── hooks/                       ← Cross-cutting hooks ONLY
│   │   ├── useToast.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── index.ts
│   └── types.ts                     ← Shared types only
│
├── layout.tsx
├── globals.css
└── page.tsx                         ← Redirects to /(experiences)

services/                            ← API layer (ROOT LEVEL)
├── apiService.ts                    ← Core Axios + interceptors
├── experience.ts                    ← Experience API calls only
├── place.ts
├── community.ts
├── auth.ts
├── search.ts
├── payment.ts
└── index.ts                         ← Central export

lib/                                 ← Utilities
├── auth.ts
├── serverApi.ts
└── utils.ts

context/                             ← Global state (UI)
├── LocationContext.tsx
├── SelectedCategoryContext.tsx
├── AuthDialogContext.tsx
├── DownloadAppContext.tsx
└── index.ts

providers/                           ← App providers
├── ReactQueryProvider.tsx
├── SessionProvider.tsx
└── index.ts

store/                               ← Redux state
├── store.ts
└── index.ts

slices/                              ← Redux slices
├── userSlice.ts
├── resetSlice.ts
└── index.ts

enums/                               ← Constants
├── status.ts
└── index.ts

utils/                               ← Shared utilities
├── parseSnakeToCamel.ts
├── formatting.ts
├── date-utils.ts
└── index.ts

config/                              ← NEW: Configuration
├── api.ts                           ← API endpoints
├── features.ts                      ← Feature flags
└── nextauth-config.ts               ← Auth config

api/                                 ← Route handlers
├── auth/
│   └── [...nextauth]/
│       └── route.ts
└── places/
    └── autocomplete/
        └── route.ts

DELETED (DEPRECATED):
❌ hooks/                            ← Move to features
❌ types/experience.ts               ← Move to app/(experiences)/
❌ types/place.ts                    ← Move to app/(places)/
❌ types/community.ts                ← Move to app/(communities)/
❌ app/components/                   ← Move to app/shared/components/
```

---

## Component Dependency Flow

```
                ┌─────────────────┐
                │   Page Routes   │
                │  /experiences   │
                │   /places       │
                │  /communities   │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
┌───────────────┐ ┌─────────────┐ ┌──────────────┐
│   Shared      │ │  Feature    │ │  Contexts &  │
│  Components   │ │ Components  │ │  Providers   │
│               │ │             │ │              │
│ Nav           │ │Experiences  │ │ LocationCx   │
│ Forms         │ │List/Card    │ │ AuthDialog   │
│ LocationPkr   │ │PlaceDetail  │ │ Redux Store  │
│ Cards         │ │Community    │ │              │
│ Dialogs       │ │Posts        │ │              │
└───────────────┘ └──────┬──────┘ └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
   ┌─────────┐    ┌────────────┐  ┌──────────┐
   │  Hooks  │    │  Services  │  │   Lib    │
   │         │    │            │  │          │
   │useToast │    │fetchXxx()  │  │auth.ts   │
   │useQuery │    │createXxx() │  │utils.ts  │
   │useState │    │updateXxx() │  │          │
   └────┬────┘    └─────┬──────┘  └──────────┘
        │               │
        │               ↓
        │         ┌──────────────┐
        │         │  API Layer   │
        └────────→│  Axios       │
                  │  Interceptors│
                  └──────────────┘
```

---

## Decision Trees for New Code

### "Where do I put this component?"

```
Is this component used in ONLY ONE feature?
├─ YES → app/[feature]/components/
│        Example: ExperiencesCard (only in experiences)
│        Location: app/(experiences)/components/ExperiencesCard.tsx
│
└─ NO (used in 2+ features)
   └─ Is it a UI primitive or fundamental pattern?
      ├─ YES → app/shared/components/
      │        Examples: Button, Card, Modal, FormField
      │        Location: app/shared/components/[Category]/Component.tsx
      │
      └─ NO → It's too specific. Refactor to make it reusable.
              Example: ExperiencesCard + PlaceCard → FeatureCard (generic)
```

### "Where do I put this hook?"

```
Is this hook feature-specific?
├─ YES → app/[feature]/hooks/
│        Example: useExperiences (only used in experiences)
│        Location: app/(experiences)/hooks/useExperiences.ts
│
└─ NO (used across features)
   └─ Is it a React pattern (state, effects)?
      ├─ YES → app/shared/hooks/
      │        Examples: useToast, useMediaQuery, useDebounce
      │        Location: app/shared/hooks/useXxx.ts
      │
      └─ NO → It's an API/service hook. Keep with services.
              Example: useSession, useAuth
```

### "Where do I put this type?"

```
Is this type feature-specific?
├─ YES → app/[feature]/types.ts
│        Example: Experience, CreateExperience
│        Location: app/(experiences)/types.ts
│
└─ NO (shared across features)
   └─ Is it a domain primitive?
      ├─ YES → types/ (root level, KEEP HERE)
      │        Examples: User, ApiResponse, Token, Photo
      │        Location: types/user.ts
      │
      └─ NO → Consolidate it with a related type.
              Example: ReviewRating + ReviewStats → Review type
```

### "Should this data live in Redux, Context, or Query?"

```
Is it user-specific state that persists across refreshes?
├─ YES → Redux (with redux-persist)
│        Examples: Current user, new user form data
│        Store: store/slices/[feature]Slice.ts
│
└─ NO
   └─ Is it global UI state (affects multiple features)?
      ├─ YES → Context API
      │        Examples: Location, Selected Category, Auth Dialog
      │        Store: context/[Feature]Context.tsx
      │
      └─ NO
         └─ Is it server data?
            ├─ YES → React Query (useQuery, useMutation)
            │        Examples: Experiences list, Reviews, Comments
            │        Manage in: hooks/useXxx.ts
            │
            └─ NO → Local component state (useState)
```

---

## Component Consolidation Map

### Before (Duplicated Logic)

```
app/components/experiences/List/experiences.tsx
  ├─ Load experiences
  ├─ Show loading skeleton (12 items)
  ├─ Handle pagination
  ├─ Show empty state
  ├─ Render grid of cards
  └─ Code: ~150 lines

app/places/components/list.tsx
  ├─ Load places
  ├─ Show loading skeleton (12 items)  ← DUPLICATE
  ├─ Handle pagination                  ← DUPLICATE
  ├─ Show empty state                   ← DUPLICATE
  ├─ Render grid of cards               ← DUPLICATE
  └─ Code: ~150 lines

app/communities/components/list.tsx
  ├─ Load communities
  ├─ Show loading skeleton (12 items)  ← DUPLICATE
  ├─ Handle pagination                  ← DUPLICATE
  ├─ Show empty state                   ← DUPLICATE
  ├─ Render grid of cards               ← DUPLICATE
  └─ Code: ~150 lines

Total Duplicated Code: ~300 lines
```

### After (Extracted to ListContainer)

```
app/shared/components/Lists/ListContainer.tsx
  ├─ Generic list rendering
  ├─ Loading state
  ├─ Pagination
  ├─ Empty state
  └─ Code: ~80 lines

app/(experiences)/components/ExperiencesList.tsx
  ├─ Load experiences
  ├─ Use ListContainer (pass data)
  └─ Code: ~30 lines (down from 150)

app/(places)/components/PlacesList.tsx
  ├─ Load places
  ├─ Use ListContainer (pass data)
  └─ Code: ~30 lines (down from 150)

app/(communities)/components/CommunitiesList.tsx
  ├─ Load communities
  ├─ Use ListContainer (pass data)
  └─ Code: ~30 lines (down from 150)

Total Code: ~170 lines (down from 450)
Reduction: ~62% ✅
Maintainability: Huge improvement (fix once, works everywhere)
```

---

## Import Path Examples

### Current (Confusing)

```tsx
// Which imports are services? Which are hooks?
import { SearchComponent } from '@/app/components/search';
import { ExperiencesCard } from '@/app/experiences/components/List';
import { useExperiences } from '@/hooks/experiences';
import { useFetchSingleExperience } from '@/hooks/experiences';
import { experience } from '@/services/experience';
import { fetchExperience } from '@/services/experience';
import { Experience } from '@/types/experience';
```

### Proposed (Clear)

```tsx
// Clear patterns: services → raw API, hooks → React wrappers, types → types
import { ExperiencesCard } from '@/(experiences)/components/ExperiencesList';
import { useExperiences, useFetchSingleExperience } from '@/(experiences)/hooks';
import { Experience } from '@/(experiences)/types';
import { fetchExperiences } from '@/services/experience';
import { GlobalSearch } from '@/shared/components/Search';
import { useToast } from '@/shared/hooks';
import { User } from '@/types';

// shared
```

**Pattern Recognition:**

- `@/services/*` → API call functions (no React)
- `@/(feature)/hooks/*` → Feature-specific React hooks
- `@/shared/hooks/*` → Cross-cutting React hooks
- `@/(feature)/types` → Feature-specific types
- `@/types/*` → Shared types
- `@/(feature)/components/*` → Feature-specific components
- `@/shared/components/*` → Shared components
- `@/lib/*` → Utilities

---

## Testing Structure

```
app/
├── (experiences)/
│   ├── components/
│   │   ├── ExperiencesList.tsx
│   │   └── ExperiencesList.test.tsx          ← Co-located
│   ├── hooks/
│   │   ├── useExperiences.ts
│   │   └── useExperiences.test.ts             ← Co-located
│   └── types.ts
│
├── shared/
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── Nav.tsx
│   │   │   └── Nav.test.tsx                   ← Co-located
│   │   ├── Forms/
│   │   │   ├── FormField.tsx
│   │   │   └── FormField.test.tsx             ← Co-located
│   │   └── index.ts
│   └── hooks/
│       ├── useToast.ts
│       └── useToast.test.ts                   ← Co-located

services/
├── experience.ts
└── experience.test.ts                         ← Could test service layer

__tests__/                                     ← Integration tests
├── experiences.integration.test.ts
├── places.integration.test.ts
└── communities.integration.test.ts
```

**Rule:** `.test.tsx` files live in the same folder as the component/hook they test.

---

## Migration Checklist (By Category)

### ✅ Exports

```
app/page.tsx                          → export const ExperiencesPage
app/experiences/page.tsx              → export const ExperiencesPage
app/components/nav.tsx                → export const Nav
app/experiences/components/*/tsx      → export const ComponentName
```

### ✅ Hooks

```
hooks/experiences.tsx                 → app/(experiences)/hooks/useExperiences.ts
hooks/places.tsx                      → app/(places)/hooks/usePlaces.ts
hooks/communities.tsx                 → app/(communities)/hooks/useCommunities.ts
hooks/use-toast.ts                    → app/shared/hooks/useToast.ts (renamed)
hooks/useMediaQuery.ts                → app/shared/hooks/useMediaQuery.ts (stays)
```

### ✅ Types

```
types/experience.ts                   → app/(experiences)/types.ts
types/place.ts                        → app/(places)/types.ts
types/community.ts                    → app/(communities)/types.ts
types/apiResponse.ts                  → types/apiResponse.ts (stays, shared)
types/user.ts                         → types/user.ts (stays, shared)
```

### ✅ Components

```
app/components/nav.tsx                → app/shared/components/Navigation/Nav.tsx
app/components/userLocation.tsx       → app/shared/components/LocationPicker/LocationPicker.tsx
app/components/search.tsx             → app/shared/components/Search/GlobalSearch.tsx
app/experiences/components/List/      → app/(experiences)/components/ExperiencesList/
```

---

## File Naming Conventions

```
Components:          PascalCase       ExperiencesCard.tsx
Hooks:               camelCase        useExperiences.ts
Types:               camelCase.ts     experience.ts
Services:            camelCase.ts     experience.ts (functions: fetchXxx, createXxx)
Enums/Constants:     camelCase.ts     status.ts
Tests:               Component.test.tsx
Folders:             camelCase        hooks/, components/, types/
Route folders:       (groupName)      (experiences), (places)
Dynamic routes:      [paramName]      [experienceId], [placeId]
Optional routes:     [[paramName]]    [[locale]]
```

---

## Import Organization (per file)

```tsx
// 1. External libraries (React, Next.js)
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 2. External packages (UI libraries, utils)
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

// 6. Internal: services
import { fetchExperiences } from '@/services/experience';
// 3. Internal: shared components & hooks
import { Button } from '@/shared/components/Forms';
import { useToast } from '@/shared/hooks';
// 5. Internal: types
import { ApiResponse } from '@/types';

// 4. Internal: feature-specific
import { ExperiencesCard } from './(experiences)/components/ExperiencesList';
import { useExperiences } from './(experiences)/hooks';
import { Experience } from './(experiences)/types';
import './ExperiencesList.css';
// 7. Local (same folder)
import { ExperiencesListSkeleton } from './ExperiencesListSkeleton';
```

---

## Quick Reference Card (Print This)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK REFERENCE: Where Does Code Go?                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 🎯 COMPONENT (used in 1 feature)                            │
│    → app/[feature]/components/ComponentName.tsx             │
│    → with ComponentName.test.tsx                            │
│                                                              │
│ 🎯 COMPONENT (used in 2+ features)                          │
│    → app/shared/components/[Category]/ComponentName.tsx     │
│    → with ComponentName.test.tsx                            │
│                                                              │
│ 🎯 HOOK (feature-specific)                                  │
│    → app/[feature]/hooks/useHookName.ts                     │
│    → with useHookName.test.ts                               │
│                                                              │
│ 🎯 HOOK (cross-cutting)                                     │
│    → app/shared/hooks/useHookName.ts                        │
│    → with useHookName.test.ts                               │
│                                                              │
│ 🎯 TYPE (feature-specific)                                  │
│    → app/[feature]/types.ts                                 │
│                                                              │
│ 🎯 TYPE (shared)                                            │
│    → types/typename.ts                                      │
│                                                              │
│ 🎯 SERVICE (API calls)                                      │
│    → services/feature.ts (export fetchXxx, createXxx)       │
│                                                              │
│ 🎯 UTILITY                                                  │
│    → utils/utilName.ts                                      │
│                                                              │
│ 🎯 ENUM / CONSTANT                                          │
│    → enums/name.ts  or  config/name.ts                      │
│                                                              │
│ 🎯 GLOBAL STATE (Redux)                                     │
│    → store/store.ts, slices/featureSlice.ts                 │
│                                                              │
│ 🎯 GLOBAL STATE (Context)                                   │
│    → context/FeatureContext.tsx                             │
│                                                              │
│ 🎯 GLOBAL STATE (React Query)                               │
│    → In hooks (app/[feature]/hooks/useXxx.ts)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
