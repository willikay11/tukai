# CLAUDE.md

This file provides context and conventions for Claude Code when working on this project.

---

## Project Overview

**Tukai** is a location-based discovery platform that helps users find and book experiences, explore places, and connect with communities near them. It targets users in Kenya (currently centred around Nairobi) and has a companion mobile app (iOS & Android). The web app is the primary focus of this codebase.

**Tagline:** *"What's The Plan?"*

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Data fetching | React Query (TanStack Query) |
| State (global UI) | React Context API |
| State (user session) | Redux + redux-persist |
| Auth | NextAuth.js |
| Backend | Separate REST API (Axios via `services/`) |

---

## Routes & Features

| Route | Purpose |
|---|---|
| `/` | Experiences — browse and book activities near the user |
| `/places` | Explore — venue and location discovery |
| `/communities` | Discover and join interest-based communities |
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Sign up |
| `/terms` | Terms & Conditions |
| `/privacy` | Privacy Policy |

### Location awareness
The app is location-aware. Users set their location (e.g. "Parkwood Villas, Syokimau") which drives content across all three main features. Location is stored in `LocationContext` and is a core piece of global UI state.

---

## Folder Structure

### Target structure (feature-based, scalable)

```
app/
  (experiences)/                    # Route group — default route
    page.tsx
    layout.tsx
    hooks/                          # Feature-specific hooks
      useExperiences.ts
      useFetchSingleExperience.ts
      usePurchaseExperienceTicket.ts
      index.ts
    components/
      ExperiencesList/
        ExperiencesList.tsx
        ExperiencesList.test.tsx
        ExperiencesCard.tsx
        ExperiencesCard.test.tsx
      InvitedExperiencesList/
      ExperienceFilters/
      index.ts
    types.ts                        # Feature types
    create/
      page.tsx
      hooks/
        useCreateExperienceFlow.ts
        useExperienceValidation.ts
      components/
        CreateExperienceStepper/
        CommunityStep/
        AboutStep/
        DatesStep/
        TicketsStep/
        ReviewStep/
      types.ts
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

  (places)/
    page.tsx
    layout.tsx
    hooks/
      usePlaces.ts
      usePlaceCategories.ts
      index.ts
    components/
      PlacesList/
        PlacesList.tsx
        PlaceCard.tsx
      PlaceFilters/
    types.ts
    [placeId]/
      page.tsx
      components/

  (communities)/
    page.tsx
    layout.tsx
    hooks/
      useCommunities.ts
      useJoinCommunity.ts
      useCommunityPosts.ts
      index.ts
    components/
      CommunitiesList/
        CommunitiesList.tsx
        CommunityCard.tsx
      CommunitiesFilters/
    types.ts
    create/
      page.tsx
      components/
    [communityId]/
      page.tsx
      components/

  (auth)/
    layout.tsx
    sign-in/
      page.tsx
    sign-up/
      page.tsx
    forgot-password/
      page.tsx

  shared/                           # Truly cross-cutting code
    components/
      Navigation/
        Nav.tsx + Nav.test.tsx
        BottomNavigation.tsx + test
      LocationPicker/
        LocationPicker.tsx
        LocationAutocompleteField.tsx
      Forms/
        FormField.tsx
        FormButton.tsx
        FormInput.tsx
        FormOTPInput.tsx
      Cards/
        FeatureCard.tsx             # Generic card base
        CardSkeleton.tsx
      Dialogs/
        ModalBase.tsx               # Generic modal base
        Drawer.tsx
      Filters/
        FilterBar.tsx
      Lists/
        ListContainer.tsx           # Generic list (loading/empty/pagination)
      Search/
        GlobalSearch.tsx
      Images/
        TukaiImage.tsx
      Ratings/
        Rating.tsx
        RatingStars.tsx
      Download/
        DownloadApp.tsx
        MobileStore.tsx
      Pagination/
        Pagination.tsx
      index.ts
    hooks/                          # Cross-cutting hooks only
      useToast.ts
      useMediaQuery.ts
      useDebounce.ts
      useInfiniteScroll.ts
      index.ts
    types.ts                        # Shared types (ApiResponse, User, etc.)

  lib/
    auth.ts
    serverApi.ts
    utils.ts
  layout.tsx
  globals.css
  page.tsx                          # Redirects to (experiences)

services/                           # REST API calls — no React, no hooks
  apiService.ts                     # Axios instance + interceptors
  experience.ts                     # fetchExperiences, createExperience, etc.
  place.ts
  community.ts
  auth.ts
  search.ts
  payment.ts
  index.ts

context/                            # Global UI state
  LocationContext.tsx
  SelectedCategoryContext.tsx
  AuthDialogContext.tsx
  DownloadAppContext.tsx

providers/
  ReactQueryProvider.tsx
  SessionProvider.tsx

store/                              # Redux (user session + persistent state)
  store.ts

slices/
  userSlice.ts
  resetSlice.ts

config/
  api.ts                            # API endpoint constants
  features.ts                       # Feature flags
  nextauth-config.ts

enums/
  status.ts

utils/
  parseSnakeToCamel.ts
  formatting.ts
  date-utils.ts

types/                              # Shared types only (feature types live in feature folders)
  apiResponse.ts
  user.ts
  token.ts
  photo.ts
  review.ts
  payment.ts
  search.ts
```

---

## Where Does Code Go?

### Components
- Used in **1 feature only** → `app/(feature)/components/`
- Used in **2+ features** → `app/shared/components/[Category]/`

### Hooks
- Feature-specific → `app/(feature)/hooks/`
- Cross-cutting (useToast, useMediaQuery, etc.) → `app/shared/hooks/`

### Types
- Feature-specific → `app/(feature)/types.ts`
- Shared (User, ApiResponse, Token) → `types/`

### State
- Server data (lists, details) → **React Query** in feature hooks
- Global UI state (location, category, dialogs) → **Context API**
- User session + persistent data → **Redux**
- Local component state → **useState**

---

## Services vs Hooks

This is the most important architectural boundary.

**Services** (`services/feature.ts`) — raw API calls, no React:
```ts
// services/experience.ts
export const fetchExperiences = async (params: ExperiencesParams): Promise<Experience[]> => {
  const response = await api.get('/experiences', { params });
  return response.data;
};
```

**Hooks** (`app/(feature)/hooks/`) — React Query wrappers, component state:
```ts
// app/(experiences)/hooks/useExperiences.ts
export const useExperiences = (params: ExperiencesParams) => {
  return useQuery({
    queryKey: ['experiences', params],
    queryFn: () => fetchExperiences(params),
  });
};
```

**Decision tree:**
- Need to call the API? → Add a function to `services/[feature].ts`
- Need that data in a component? → Wrap it in a hook in `app/(feature)/hooks/`
- Need data server-side? → Call the service directly from a Server Component

---

## Coding Conventions

### Exports
Always use **named exports**. The only exception is Next.js `page.tsx` and `layout.tsx` which require default exports.

```ts
// ✅ correct
export const ExperienceCard = () => { ... }
export const useExperiences = () => { ... }

// ❌ avoid
export default function ExperienceCard() { ... }
```

### Imports
Always use **absolute imports** via `@/`:
```ts
// ✅ correct
import { ExperienceCard } from '@/app/(experiences)/components/ExperiencesList'
import { useToast } from '@/app/shared/hooks'

// ❌ avoid
import { ExperienceCard } from '../../../components/ExperiencesList'
```

### Import order (per file)
```ts
// 1. React / Next.js
import { useState } from 'react'
import Link from 'next/link'

// 2. External packages
import { useQuery } from '@tanstack/react-query'

// 3. Shared components & hooks
import { Button } from '@/app/shared/components/Forms'
import { useToast } from '@/app/shared/hooks'

// 4. Feature-specific
import { ExperiencesCard } from '@/app/(experiences)/components/ExperiencesList'
import { useExperiences } from '@/app/(experiences)/hooks'
import type { Experience } from '@/app/(experiences)/types'

// 5. Shared types & services
import type { ApiResponse } from '@/types'
import { fetchExperiences } from '@/services/experience'

// 6. Local (same folder)
import { ExperiencesListSkeleton } from './ExperiencesListSkeleton'
```

### Components
- **Prefer React Server Components by default.** Only add `'use client'` when the component needs interactivity, browser APIs, or React hooks.
- One component per file, named identically to the file.
- Use `index.ts` barrel files to re-export from component folders.

### Tests
Co-locate tests with the file they cover:
```
ExperiencesCard.tsx
ExperiencesCard.test.tsx
useExperiences.ts
useExperiences.test.ts
```

### File naming
| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ExperiencesCard.tsx` |
| Hooks | camelCase | `useExperiences.ts` |
| Services | camelCase | `experience.ts` |
| Utilities | camelCase | `date-utils.ts` |
| Tests | same name + `.test` | `ExperiencesCard.test.tsx` |
| Folders | camelCase | `hooks/`, `components/` |
| Route groups | `(groupName)` | `(experiences)` |
| Dynamic routes | `[paramName]` | `[experienceId]` |

---

## Dependency Layers

Never import from a higher layer into a lower one:

```
Layer 1 — Primitives:   enums/, utils/, lib/
Layer 2 — Domain:       types/, services/          (imports Layer 1)
Layer 3 — State:        context/, store/, hooks/   (imports Layer 1–2)
Layer 4 — Components:   app/                       (imports Layer 1–3)
```

---

## Data Fetching

- **Server Components** — use native `fetch` or call service functions directly
- **Client Components** — use React Query hooks from `app/(feature)/hooks/`
- API base URL: `process.env.NEXT_PUBLIC_API_URL`
- React Query key convention: `['resource', params]` e.g. `['experiences', { date, category }]`

---

## Styling

- Use **Tailwind CSS utility classes** for all styling.
- Use **shadcn/ui** primitives as the base — customise via Tailwind, never edit shadcn source files.
- Avoid inline `style` props unless absolutely necessary.

### Colour tokens — never hardcode hex/rgb values
| Token | Usage |
|---|---|
| `bg-primary` / `text-primary` | Brand primary (RGB CSS var) |
| `bg-secondary` / `text-secondary` | Brand secondary (RGB CSS var) |
| `bg-background` / `text-foreground` | Page background / default text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-muted` / `text-muted-foreground` | Subtle backgrounds / secondary text |
| `bg-accent` / `text-accent-foreground` | Accent highlights |
| `bg-destructive` / `text-destructive-foreground` | Errors / destructive actions |
| `border` / `ring` / `input` | Form and border colours |

### Border radius — use semantic tokens
- `rounded-lg` → `var(--radius)`
- `rounded-md` → `calc(var(--radius) - 2px)`
- `rounded-sm` → `calc(var(--radius) - 4px)`

### Custom utilities
- `shadow-top-md` — upward shadow for bottom sheets / sticky footers
- `shadow-scroll-filters` — fading edge on horizontally scrollable filter bars
- `shadow-search-bar` — elevated search bar
- `.scrollbar-hide` — hides scrollbars on scrollable containers
- `bg-gradient-radial` / `bg-gradient-conic` — gradient helpers
- `3xl` (1920px) / `4xl` (2560px) — extra-wide breakpoints

---

## Domain Concepts (Glossary)

| Term | Meaning |
|---|---|
| **Experience** | A ticketed or bookable activity/event (e.g. hike, concert, workshop) |
| **Place** | A physical venue users can explore (restaurant, park, etc.) |
| **Community** | An interest-based group users can discover and join |
| **Location** | The user's set location — drives content filtering across all features |
| **Portal view** | An inline experience list that hides itself when a category filter is active |
| **Invited experience** | An experience shared directly with the user via invite |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for the REST API |

---

## Active Refactoring (Do Not Revert)

The codebase is being migrated from a flat structure to the feature-based structure above. When adding new code, always use the **target structure**. When editing existing code, migrate it to the target structure as part of the same PR.

### Migration status
- [ ] **Tier 1:** Convert all exports to named exports + ESLint rule
- [ ] **Tier 1:** Extract route groups `(experiences)`, `(places)`, `(communities)`
- [ ] **Tier 1:** Consolidate shared components into `app/shared/components/`
- [ ] **Tier 2:** Move feature hooks from `hooks/` → `app/(feature)/hooks/`
- [ ] **Tier 2:** Move feature types from `types/` → `app/(feature)/types.ts`
- [ ] **Tier 3:** Extract page-level logic into custom hooks
- [ ] **Tier 3:** Add co-located tests for shared and feature components

### Rules during migration
- New code always follows the **target structure** above
- Never add to `hooks/` (root) — use feature folders or `app/shared/hooks/`
- Never add to `app/components/` (root) — use feature or `app/shared/components/`
- Each refactor PR touches **structure only** — no logic changes

---

## Figma-to-Code Process

### Handoff prompt format
```
DESIGN: [Figma link or attached screenshot]
COMPONENT: [e.g. ExperiencesCard]
FEATURE: [e.g. experiences]
TASK: [new component | update existing]
FILE: [path if updating, e.g. app/(experiences)/components/ExperiencesCard.tsx]
BREAKPOINTS: [mobile + desktop | desktop only]
NOTES: [states, edge cases, interactions]
```

### Implementation rules
- One Figma frame = one task.
- Match spacing/typography/colours using Tailwind tokens — never hardcode.
- Implement all visible states: default, hover, loading (skeleton), empty, error.
- Build mobile-first.
- Map Figma values to nearest Tailwind scale; use arbitrary values (e.g. `px-[18px]`) only when no match exists.
- Flag inconsistencies or missing tokens rather than guessing.

### Output checklist
- [ ] Named export used
- [ ] Absolute imports via `@/`
- [ ] No hardcoded colour values
- [ ] `'use client'` only if hooks or browser APIs are required
- [ ] Component and test file co-located in the correct feature folder