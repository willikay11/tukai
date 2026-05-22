# CLAUDE.md

This file provides context and conventions for Claude Code when working on this project.

---

## Project Overview

**Tukai** is a location-based discovery platform that helps users find and book experiences, explore places, and connect with communities near them. It targets users in Kenya (currently centred around Nairobi) and has a companion mobile app (iOS & Android). The web app is the primary focus of this codebase.

**Tagline:** _"What's The Plan?"_

---

## Tech Stack

| Layer                | Tool                                      |
| -------------------- | ----------------------------------------- |
| Framework            | Next.js (App Router)                      |
| Language             | TypeScript                                |
| Styling              | Tailwind CSS                              |
| Components           | shadcn/ui                                 |
| Data fetching        | React Query (TanStack Query)              |
| State (global UI)    | React Context API                         |
| State (user session) | Redux + redux-persist                     |
| Auth                 | NextAuth.js                               |
| Backend              | Separate REST API (Axios via `services/`) |

---

## Routes & Features

| Route           | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `/`             | Experiences — browse and book activities near the user |
| `/places`       | Explore — venue and location discovery                 |
| `/communities`  | Discover and join interest-based communities           |
| `/auth/sign-in` | Sign in                                                |
| `/auth/sign-up` | Sign up                                                |
| `/terms`        | Terms & Conditions                                     |
| `/privacy`      | Privacy Policy                                         |

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
      useComms.tsx
      usePages.ts
      usePayment.ts
      index.ts
    components/
      PageLayoutContent.tsx
      index.ts
    create/
      page.tsx
      components/
        steps.tsx, step-side-panel.tsx, dates.tsx
        about.tsx, invites.tsx, createTickets.tsx
        experienceReview/
      types.ts                      # Form-scoped types only (enums, form state)
    [experienceId]/
      page.tsx
      components/
        experienceDetails.tsx, experienceActions.tsx
      reserve/
        page.tsx
    review/
      [experienceId]/
        page.tsx

  (places)/
    page.tsx
    layout.tsx
    hooks/
      usePlaces.ts (merged from root)
      index.ts
    components/
      Review/                       # Moved from app/components
        index.tsx, AddReview/, AddReviewComment/
        Comments/
      place.tsx, list.tsx, placeActions.tsx
      index.ts
    [placeId]/
      page.tsx
      components/

  (communities)/
    page.tsx
    layout.tsx
    hooks/
      useCommunities.tsx (merged from root)
      index.ts
    components/
      community.tsx, communityAdministrator.tsx
      communityMembers.tsx, join.tsx
      index.ts
    create/
      page.tsx
      components/
        createCommunity.tsx
      types.ts                      # Form-scoped types only
    [communityId]/
      page.tsx
      components/
        communityTabs.tsx, communityPosts.tsx

  (auth)/
    hooks/
      useSubscriptions.tsx
      index.ts
    layout.tsx
    sign-in/
      page.tsx
    sign-up/
      page.tsx
    forgot-password/
      page.tsx

  shared/                           # Truly cross-cutting code
    components/
      Global/
        AuthActions.tsx
        SocialLinks.tsx
      Navigation/
        Nav.tsx + Nav.test.tsx
        BottomNavigation.tsx + test
      LocationPicker/
        LocationPicker.tsx
        LocationAutocompleteField.tsx
      Forms/
        form/ (Input, Button, Anchor, Loader, OtpInput)
        index.ts
      Cards/
        EventSkeleton.tsx, CardSkeleton.tsx
        CreateStepContentSkeleton.tsx
      Dialogs/
        ModalBase.tsx, Drawer.tsx
      Filters/
        Pills.tsx, FilterBar.tsx
      Lists/
        ListContainer.tsx
      Search/
        Search.tsx
      Images/
        TukaiImage.tsx
      Icons/
        IconComponent.tsx
      Ratings/
        Rating.tsx
      Download/
        DownloadApp.tsx, MobileStore.tsx
      Pagination/
        Pagination.tsx
      Messages/
        success.tsx
      Bookmark/
        index.tsx (Bookmark + BookmarkPlace)
      Experiences/
        List/index.tsx (ListExperiences)
        Single/index.tsx (SingleExperience)
      Rating/
        Rating.tsx
      JoinTukaiPremium/
        JoinTukaiPremium.tsx
      SendMessage/
        SendMessage.tsx
      Review/
        (note: Places-specific, moved to app/(places)/components/Review/)
      index.ts
    hooks/                          # Cross-cutting hooks only
      useAuth.ts
      useCommunities.tsx
      useExperiences.tsx
      usePlaces.tsx
      useSearch.ts
      useToast.ts
      index.ts

  lib/
    auth.ts
    serverApi.ts
    utils.ts
  layout.tsx
  globals.css
  page.tsx                          # Redirects to (experiences)

types/                              # ALL types live here (root level)
  experience.ts                     # Used in experiences + communities + shared
  place.ts                          # Used in places + shared components
  community.ts                      # Used in experiences + communities + shared
  apiResponse.ts
  user.ts
  token.ts, jwt.ts
  photo.ts
  review.ts, comment.ts
  ticket.ts, payment.ts
  placeCategory.ts, experienceCategory.ts
  location.ts, interest.ts
  googleMaps.ts, networkParam.ts
  search.ts, subscription.ts
  purchaser.ts

  NOTE: All types stay at root. Core domain types (experience, place,
  community) are used across 2+ features. New types should go here
  even if only used in one feature today.

  Exception: Form-scoped types (step enums, form state shapes) tightly
  bound to create/edit flows may live as types.ts in the flow folder.

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

- **All types** → `types/` (root level)
- **Exception:** Form-scoped types (step enums, form state) → `app/(feature)/create/types.ts`
- **Never** create feature-level `types.ts` in the route group root

**Why?** Core domain types (experience, place, community) are each used across 2+ features. Even types that seem feature-specific today should go to root — they'll likely be referenced elsewhere as the product evolves.

Import pattern:

```ts
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { User } from '@/types/user';
```

---

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
import { useState } from 'react';

import Link from 'next/link';

// 2. External packages
import { useQuery } from '@tanstack/react-query';

// 4. Feature-specific
import { ExperiencesCard } from '@/app/(experiences)/components';
import { useExperiences } from '@/app/(experiences)/hooks';
// 3. Shared components & hooks
import { Button } from '@/app/shared/components/Forms';
import { useToast } from '@/app/shared/hooks';
import { fetchExperiences } from '@/services/experience';
// 5. Shared types & services
import type { ApiResponse, Experience } from '@/types';

// 6. Local (same folder)
import { ExperiencesListSkeleton } from './ExperiencesListSkeleton';
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

| Type           | Convention          | Example                    |
| -------------- | ------------------- | -------------------------- |
| Components     | PascalCase          | `ExperiencesCard.tsx`      |
| Hooks          | camelCase           | `useExperiences.ts`        |
| Services       | camelCase           | `experience.ts`            |
| Utilities      | camelCase           | `date-utils.ts`            |
| Tests          | same name + `.test` | `ExperiencesCard.test.tsx` |
| Folders        | camelCase           | `hooks/`, `components/`    |
| Route groups   | `(groupName)`       | `(experiences)`            |
| Dynamic routes | `[paramName]`       | `[experienceId]`           |

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

| Token                                            | Usage                               |
| ------------------------------------------------ | ----------------------------------- |
| `bg-primary` / `text-primary`                    | Brand primary (RGB CSS var)         |
| `bg-secondary` / `text-secondary`                | Brand secondary (RGB CSS var)       |
| `bg-background` / `text-foreground`              | Page background / default text      |
| `bg-card` / `text-card-foreground`               | Card surfaces                       |
| `bg-muted` / `text-muted-foreground`             | Subtle backgrounds / secondary text |
| `bg-accent` / `text-accent-foreground`           | Accent highlights                   |
| `bg-destructive` / `text-destructive-foreground` | Errors / destructive actions        |
| `border` / `ring` / `input`                      | Form and border colours             |

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

| Term                   | Meaning                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Experience**         | A ticketed or bookable activity/event (e.g. hike, concert, workshop)         |
| **Place**              | A physical venue users can explore (restaurant, park, etc.)                  |
| **Community**          | An interest-based group users can discover and join                          |
| **Location**           | The user's set location — drives content filtering across all features       |
| **Portal view**        | An inline experience list that hides itself when a category filter is active |
| **Invited experience** | An experience shared directly with the user via invite                       |

---

## Environment Variables

| Variable              | Purpose                   |
| --------------------- | ------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL for the REST API |

---

## Refactoring Complete (Tier 1 & 2)

The codebase has been restructured to the feature-based architecture above. When adding new code, always use the **target structure** documented here.

### Completed

- ✅ **Tier 1:** Named exports + ESLint enforcement (import/no-default-export)
- ✅ **Tier 1:** Route groups `(experiences)`, `(places)`, `(communities)`, `(auth)` extracted
- ✅ **Tier 1:** Shared components consolidated into `app/shared/components/[Category]/`
- ✅ **Tier 2:** Feature hooks moved to `app/(feature)/hooks/`
- ✅ **Tier 2:** Types audit completed — all types remain at root (2+ feature usage rule)

### Remaining (Tier 3+)

- [ ] Extract page-level logic into custom hooks
- [ ] Add co-located tests for shared and feature components
- [ ] Migrate remaining service files to follow pattern

### Rules for new code

- Always use **target structure** documented above
- New code added to root `hooks/` or `app/components/` will be rejected
- All types go to root `types/` (exception: form-scoped types in create flow folders)
- Each PR touches **structure only** — no logic changes in refactor commits

---

## Active feature work

### Create experience flow

Full brief: docs/CREATE_EXPERIENCE_FLOW.md
Designs: docs/designs/create-experience/
Route: app/(experiences)/experiences/create/
Hook: app/(experiences)/experiences/create/hooks/useCreateExperienceFlow.ts
Status: UI build complete (single-day and recurring variants)
API integration pending for recurring flow

**Completed:**

- ✅ Step 1 (Community & Date Type) — single-day and recurring modes
- ✅ Step 2 (About Experience)
- ✅ Step 5 (Tickets) — single-day absolute validity + recurring relative validity
- ✅ Step 4 (Invite Guests) — applies to both single and recurring
- ✅ Step 6 (Wallet Details) — applies to both single and recurring
- ✅ Review page with inline editing

**Recurring flow components:**

- Step 1: `RecurringDayPicker`, `RecurrenceDateRange`, `RecurrencePreviewLabel`, `TimeSlotList`
- Step 5: `RelativeValidityPicker`, `DuplicateTicketsCheckbox`, `TicketDateBadge` (recurring mode), `TicketForm` (recurring mode)
- Side panel: `PreviewDateSection` (recurring mode)

**Key utilities:**

- `getOrdinalDate(dateString)` — converts ISO date to ordinal format ("5th Jul, 2025")
- Relative validity helpers in `RelativeValidityPicker` — parse/format amount+unit+anchor

**Pending:**

- API integration for creating recurring experiences
- Submission of recurring experience data to backend
- Testing recurring experience creation end-to-end

Before working on any component in this flow:

1. Read docs/CREATE_EXPERIENCE_FLOW.md
2. Check the component audit tables (sections 4A and 4B) to confirm
   whether to reuse, adapt, or build
3. Reference the correct screenshot for the step you are building
4. All state goes through useCreateExperienceFlow — never local
   useState in page or step components
5. For recurring features, check step 1 date type props and step 5
   ticket form props to determine single vs recurring mode

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
