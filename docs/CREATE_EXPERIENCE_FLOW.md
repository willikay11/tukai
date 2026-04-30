# Create Experience Flow — Source of Truth

This document describes the current state of the Create Experience flow UI and is the definitive guide for building, maintaining, and extending it. Everything here reflects actual file paths, component names, and prop interfaces from the codebase.

---

## 1. Flow Overview

**Purpose:** The Create Experience flow enables users to create and configure new experiences (ticketed activities/events) within a community they manage. Users progress through 5 sequential steps, filling in details about dates, descriptions, pricing, invitations, and payment wallets.

**Users:** Community admins who want to host experiences.

**Location in codebase:**
- Route: `app/(experiences)/experiences/create/`
- Main page: `app/(experiences)/experiences/create/page.tsx`
- Hook: `app/(experiences)/experiences/create/hooks/useCreateExperienceFlow.ts`
- Components: `app/(experiences)/experiences/create/components/`
- Designs: `docs/designs/create-experience/`

**Entry point:** Users navigate to `/experiences/create` after creating or selecting a community. The flow guards against access without a community via `useCreateExperienceFlow`.

---

## 2. Page Architecture

### Two-Column Layout (steps 1-4)

The create experience page uses a responsive grid with two panels:

```
main.grid.grid-cols-12 {
  Left panel (60% width on lg+):     col-span-4, col-start-3 (lg), col-start-8 for 3xl+
  Right panel (40% width on lg+):    col-span-4, col-start-8 (lg), sticky
}
```

**Left Panel (Editor)**
- `CreateExperienceSteps` component
- Uses shadcn `<Tabs>` for step navigation
- Current step's form displays in `<TabsContent>`
- Responsive: full width on mobile, 60% on desktop
- Padding and spacing follow Tailwind grid system

**Right Panel (Preview/Sidebar)**
- `ExperienceStepSidePanel` component
- Shows step-specific preview sections or placeholders
- Sticky positioning on desktop for continuous visibility
- Content changes based on `activeStep`
- Displays:
  - Community info (step: "community")
  - Date & ticket preview (step: "dates-tickets")
  - Full review panel (steps: "guests", "wallet")

### Review Page (Step 6)

After completing the wallet step, users navigate to a review page at:
- Route: `app/(experiences)/experiences/review/[experienceId]/page.tsx`

Layout shifts to full-width summary on left, inline edit panel on right. This is a separate page (not part of the 5-step flow).

---

## 3. Step Inventory

### Step 1: Community Selection (`community`)

**User action:** Select or confirm the community where this experience will be hosted.

**Form inputs:**
- Community dropdown (read-only list of user's created communities)

**Preview section:** Shows selected community name and logo.

**Component:** `CreateExperienceCommunity`
- File: `app/(experiences)/experiences/create/components/community.tsx`
- Handles community selection and creates initial experience record

**Form data saved:**
- Experience created with `communityId`

**Design reference:**
- No dedicated screenshot; shown as placeholder in step panel
- Community selection is prerequisite to other steps

---

### Step 2: About (`about`)

**User action:** Add title, description, photos, location, visibility, categories, and meeting details.

**Form inputs:**
- Title (text input, required)
- Description (Lexical editor, required)
- What's included (text editor)
- What's NOT included (text editor)
- Photos upload (min 1 required on creation)
- Location search (autocomplete, required)
- Meeting point (optional text)
- Meeting time (optional time picker)
- Visibility (Public/Private radio)
- Categories (multi-select pills, min 1 required)

**Preview section:**
- Date & time summary
- Host community info with logo
- Editable inline (pencil icon in design)

**Component:** `CreateExperienceAbout`
- File: `app/(experiences)/experiences/create/components/about.tsx`
- Uses Lexical editor for rich text descriptions
- Handles file uploads and category selection
- Updates experience via `useUpdateExperience` hook

**Form schema:**
```typescript
z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  included: z.string().min(3),
  notIncluded: z.string().min(1),
  location: z.string().min(3),
  meetingPoint: z.string().optional(),
  meetingTime: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  selectedCategories: z.array(z.string()).min(1),
  uploadedFiles: z.array(z.instanceof(File)).min(1 | 0),
})
```

**Design reference:** `docs/designs/create-experience/02-about.png`

---

### Step 3: Dates & Tickets (`dates-tickets`)

**User action:** Set experience date(s) and create pricing tiers.

**Substeps:**
1. **Select date(s):** Determines if single-day or multi-day experience
2. **Create tickets:** Add ticket types (name, price, quantity limit)
3. **Customize itinerary (optional):** For multi-day experiences, define daily itinerary

**Form inputs (dates):**
- Experience type radio: One-Time, Multi-Day (e.g. 2-3 days), Itinerary, Recurring
- Start date + time (picker)
- End date + time (picker)

**Form inputs (tickets):**
- Ticket name (text)
- Price (currency input)
- Available quantity (number)
- Add/remove ticket buttons

**Form inputs (itinerary, if applicable):**
- Day-by-day breakdown (collapsible sections)
- Each day: title, description, time window

**Preview section:**
- Initially: Placeholder ("Update and save experience date and time first")
- After dates saved: `CreateTickets` panel shows ticket cards
- If customizing itinerary: `CustomiseItinerary` panel with day breakdown

**Components:**
- `ExperienceDates`: Date & experience type selection
- `CreateTickets`: Ticket creation and management
- `CustomiseItinerary`: Multi-day itinerary editor
- `CreateTickets` (preview): Renders ticket list read-only in side panel

**Files:**
- `app/(experiences)/experiences/create/components/dates.tsx`
- `app/(experiences)/experiences/create/components/createTickets.tsx`
- `app/(experiences)/experiences/create/components/customiseItinerary.tsx`

**Design reference:**
- `docs/designs/create-experience/01-date-and-type.png` (dates)
- `docs/designs/create-experience/03-tickets-empty.png` (empty state)
- `docs/designs/create-experience/03b-tickets-filled.png` (with tickets)

---

### Step 4: Invite Guests (`guests`)

**User action:** Invite specific users and/or communities to the experience.

**Form inputs:**
- Invite Members input (search & select community members)
- Invite Communities input (search & select other communities)
- Selected members list (removable)
- Selected communities list (removable)

**Preview section:**
- Full `ExperienceReview` panel showing all saved data so far:
  - Photos
  - Title & date
  - Description
  - Categories
  - Locations
  - Invited members & communities
  - Tickets & pricing

**Component:** `CreateExperienceInvites`
- File: `app/(experiences)/experiences/create/components/invites.tsx`
- Uses shadcn `<InviteMembers>` and `<InviteCommunities>` components
- Stores selections in hook state via `handleInvitesChange`

**Design reference:** `docs/designs/create-experience/04-invite-guests.png`

---

### Step 5: Wallet Details (`wallet`)

**User action:** Select or create a payment method (M-Pesa or bank account) to receive payments.

**Substates (5 variants):**
1. **Empty:** No saved wallets; show "Add Payment Method" button
2. **M-Pesa form:** Phone number input
3. **Bank account form:** Bank details (account name, number, code)
4. **Saved M-Pesa card:** Shows masked phone (e.g., `**** **** 1234`); edit button
5. **Saved bank account card:** Shows masked account details; edit button

**Form inputs:**
- Payment method toggle (M-Pesa / Bank Account)
- Phone number input (M-Pesa)
- Bank account form (BankAccountDetailsForm component)
- Select/set as default (radio)

**Preview section:**
- Full `ExperienceReview` panel (same as Step 4)

**Component:** `CreateExperienceWallet`
- File: `app/(experiences)/experiences/create/components/wallet.tsx`
- Uses `useGetWallets`, `useCreatePhoneWallet`, `useCreateBankWallet`, and patch variants
- Handles 5 distinct UI states based on saved wallets and form state
- Masks sensitive info (phone, account numbers)

**Dependent components:**
- `BankAccountDetailsForm` (from `@/components/ui/bank-account-details-form`)
- `MpesaDetailsForm` (from `@/components/ui/mpesa-details-form`)

**Design reference:**
- `docs/designs/create-experience/05a-wallet-empty.png` (no wallets)
- `docs/designs/create-experience/05b-wallet-mpesa.png` (M-Pesa form)
- `docs/designs/create-experience/05c-wallet-bank.png` (bank form)
- `docs/designs/create-experience/05d-wallet-saved-mpesa.png` (saved M-Pesa)
- `docs/designs/create-experience/05e-wallet-saved-bank.png` (saved bank)

---

## 4. Component Audit — Reuse vs Build

### Table A: Existing Components to Reuse or Adapt

| Component | Current path | Used in step | How |
|-----------|--------------|--------------|-----|
| **Button** | `@/components/ui/button` | All steps | Primary action button; variants: default, text, outline |
| **Tabs, TabsList, TabsTrigger, TabsContent** | `@/components/ui/tabs` | Structure | Step navigation; custom styling in steps.tsx |
| **Input** | `@/components/ui/input` | All | Text inputs for titles, phone, account details |
| **Form, FormControl, FormField, FormItem, FormMessage** | `@/components/ui/form` | About, Wallet | React Hook Form integration via shadcn |
| **FileUploadField** | `@/app/shared/components/Forms` | About | Photo upload with preview |
| **LocationAutocompleteField** | `@/app/shared/components/LocationPicker` | About | Google Maps autocomplete for experience location |
| **IconComponent** | `@/app/shared/components/Icons` | All | Step icons (AddTeamIcon, InformationCircleIcon, etc.) |
| **CreateStepContentSkeleton, WalletListSkeleton** | `@/app/shared/components/Cards` | Structure | Loading placeholders |
| **Editor (Lexical)** | `@/components/blocks/editor-00/editor` | About | Rich text editing for description, included/not included |
| **CategoryPill** | `@/components/ui/categoryPill` | About | Display selected categories |
| **PillRadioGroup** | `@/components/ui/pillRadioGroup` | Dates, Wallet | Radio selection via pill UI |
| **TimePicker** | `@/components/ui/time-picker` | About, Dates | Time input for meeting time and date/time pickers |
| **InvitedMember, InviteMembers** | `@/components/ui/invite-members` | Guests | Member selection and type definition |
| **BankAccountDetailsForm** | `@/components/ui/bank-account-details-form` | Wallet | Bank account payment form |
| **MpesaDetailsForm** | `@/components/ui/mpesa-details-form` | Wallet | M-Pesa payment form |
| **Avatar** | `@/components/ui/avatar` | Review (side panel) | Member/community avatars in preview |
| **DescriptionShowMore** | `@/app/shared/components/Global` | Review | Expandable description in preview |
| **Checkbox** | `@/components/ui/checkbox` | Wallet | Set as default wallet selection |
| **InviteCommunities** | `@/components/ui/invite-communities` | Guests | Community selection and invitation |

---

### Table B: New Components to Build

| Component | Step | Location | Description |
|-----------|------|----------|-------------|
| **ExperienceReview** | Guests, Wallet | `app/(experiences)/experiences/create/components/experienceReview/index.tsx` | ✅ EXISTS — Full preview panel showing all entered data; used in side panel |
| **ReviewInfoSection** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewInfoSection.tsx` | ✅ EXISTS — Displays title, description, location, visibility on review page |
| **ReviewPhotoGallery** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewPhotoGallery.tsx` | ✅ EXISTS — Photo carousel/grid on review page |
| **ReviewCategories** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewCategories.tsx` | ✅ EXISTS — Category pills on review page |
| **ReviewLocationCard** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewLocationCard.tsx` | ✅ EXISTS — Google Map with location details on review page |
| **ReviewTickets** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewTickets.tsx` | ✅ EXISTS — Ticket list with pricing on review page |
| **ReviewCommunities** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewCommunities.tsx` | ✅ EXISTS — Host community info on review page |
| **ReviewGuests** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewGuests.tsx` | ✅ EXISTS — Invited members & communities on review page |
| **ReviewWallets** | Review page | `app/(experiences)/experiences/create/components/experienceReview/reviewWallets.tsx` | ✅ EXISTS — Selected wallet(s) on review page |

**Note:** All filenames use camelCase (e.g., `reviewInfoSection.tsx`) while component exports use PascalCase (e.g., `export const ReviewInfoSection`).

**Summary:** All major components exist. The flow reuses existing UI components and form builders. Review page components are already implemented.

---

## 5. State Management

### Hook: `useCreateExperienceFlow`

**Location:** `app/(experiences)/experiences/create/hooks/useCreateExperienceFlow.ts`

**State fields:**

```typescript
// Step navigation
activeStep: ExperienceStepId ('community' | 'about' | 'dates-tickets' | 'guests' | 'wallet')
experienceId: string | null

// Fetched data
experience?: Experience              // Full experience object
isLoadingExperience: boolean         // Loading state for fetch

// Flow tracking
hasUpdatedDates: boolean             // True after dates are saved
itineraryConfig?: { startDate: string; endDate: string } | null  // For multi-day itinerary
invitedMembers: InvitedMember[]      // Selected members
invitedCommunities: Community[]      // Selected communities

// Access control
hasCreatedCommunity: boolean         // True if user has ≥1 community
isCheckingCommunityAccess: boolean   // Loading while checking communities
```

**Handler functions:**

```typescript
handlers: {
  handleStepChange(step: ExperienceStepId): void
    // Updates activeStep and syncs URL params

  handleExperienceCreated(experienceId: string, step?: ExperienceStepId): void
    // Called when experience is first created (in "community" step)
    // Updates experienceId and optionally advances step

  handleDatesUpdatedSuccess(nextStep?: ExperienceStepId): void
    // Called when dates are saved
    // Sets hasUpdatedDates=true, shows tickets panel, optionally changes step

  handleItineraryCustomise(config: { startDate, endDate }): void
    // Stores date range for multi-day itinerary preview

  handleInvitesChange(members: InvitedMember[], communities: Community[]): void
    // Updates invited members and communities lists
}
```

**URL synchronization:**
- `?experienceId=...` — Current experience being edited
- `?step=...` — Current active step
- Synced bidirectionally: URL changes drive state and vice versa

**Session/authentication:**
- Checks `useSession()` status
- Guards against missing community
- Redirects to `/communities/create` if no community exists

---

## 6. Data Flow

### From Input → State → Preview → Review

**Example: Title field (Step 2: About)**

1. **Input:** User types in title field (About step, left panel)
   ```
   <Input onChange={(e) => form.setValue('title', e.target.value)} />
   ```

2. **State (hook `useCreateExperienceFlow`):** Not stored in hook; stored locally in About component via React Hook Form
   - Form watches title value
   - On save, calls `useUpdateExperience(experienceId, { title })`
   - Updates backend

3. **Refetch:** Next step or on re-render, `useFetchSingleExperience` fetches updated experience
   - Hook updates `experience` in state

4. **Preview:** ExperienceReview component in side panel reads `experience.title`
   ```typescript
   <p className="text-2xl font-bold">{experience?.title}</p>
   ```

5. **Review page:** Same `ReviewInfoSection` displays title from fetched experience object

**Data flow path:**
```
Form input (Step 2) 
  → React Hook Form state 
  → useUpdateExperience API call 
  → Backend updates 
  → useFetchSingleExperience refetch 
  → experience object in hook 
  → ExperienceReview side panel (Step 3+)
  → Review page display
```

**Special case — Invites:**
- Invites are **not** persisted to backend in this flow
- Stored in hook state: `invitedMembers`, `invitedCommunities`
- Passed to side panel preview via props
- Would be sent to backend in a final API call on publish (not yet implemented)

---

## 7. Build Order

The create experience flow is complete and functional. Below is the original 7-PR build plan (all implemented):

### PR 1: Step Navigation & Page Layout ✅
- Tabs-based navigation, two-column grid layout
- `CreateExperienceSteps` component
- `ExperienceStepSidePanel` placeholder
- **Design:** All step screenshots
- **Acceptance:** Step tabs visible, clicking changes content; left/right panels responsive

### PR 2: Community Selection Step ✅
- `CreateExperienceCommunity` component
- Fetch user's communities
- Create initial experience record
- Guard: Redirect if no community
- **Design:** Step 1 context (community selection in tab)
- **Acceptance:** Can select community, experience created with communityId

### PR 3: About Step (Description, Photos, Location) ✅
- `CreateExperienceAbout` component
- Title, description (Lexical), photos, location autocomplete
- Visibility & categories
- Save via `useUpdateExperience`
- **Design:** `02-about.png`
- **Acceptance:** Save persists data; preview updates in side panel

### PR 4: Dates & Tickets Step ✅
- `ExperienceDates` component
- `CreateTickets` component
- Ticket CRUD
- `CustomiseItinerary` for multi-day
- **Design:** `01-date-and-type.png`, `03-tickets-*.png`
- **Acceptance:** Dates saved, hasUpdatedDates=true, tickets CRUD works

### PR 5: Invite Guests Step ✅
- `CreateExperienceInvites` component
- Member & community search/select
- Full `ExperienceReview` in side panel
- **Design:** `04-invite-guests.png`
- **Acceptance:** Can invite members/communities, side panel shows full review

### PR 6: Wallet Details Step ✅
- `CreateExperienceWallet` component
- 5-state UI (empty, MPesa form, bank form, saved-MPesa, saved-bank)
- Create & patch wallet hooks
- **Design:** `05a-e-wallet-*.png`
- **Acceptance:** All 5 states work; can create/edit wallets; wallet persists

### PR 7: Review Page & Publish ✅
- Review page at `/experiences/[id]/review`
- Full page layout with review components
- Inline edit buttons per section
- Publish button
- Success modal
- **Design:** `06-review.png`, `06a-review-inline-edit.png`, `06b-review-success-modal.png`
- **Acceptance:** All review sections render; can edit any section; publish works

---

## 8. Conventions for This Flow

Every component in the create experience flow must follow these rules:

### Exports & Imports
- ✅ Named exports only (no default exports)
- ✅ Use absolute imports via `@/` paths
- ✅ Import order: React → Next.js → external packages → shared components → feature components → types → local imports

### State & Data
- ✅ No API calls in components — all data flows through `useCreateExperienceFlow` hook or React Hook Form
- ✅ Invites are stored in hook, not persisted until final publish
- ✅ Experience data is persisted immediately via hook-triggered mutations
- ✅ All data fetching uses React Query (TanStack Query)

### TypeScript
- ✅ All props must be typed with `interface` or `type`, not inline type literals
- ✅ Reuse types from `@/types/` (Experience, Community, InvitedMember, etc.)
- ✅ Form schemas use Zod with proper `.refine()` or `.superRefine()` for custom validation

### Styling
- ✅ Tailwind CSS only — no hardcoded colors
- ✅ Use design tokens: `text-primary`, `bg-emerald-50`, `border-gray-200`, etc.
- ✅ Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `3xl:`, `4xl:`
- ✅ Spacing follows Tailwind scale: `px-4`, `py-2`, `gap-3`, etc.

### Components & Reuse
- ✅ Preview components (in review) must work standalone on review page
- ✅ No hardcoded step logic; accept `step` prop or use context
- ✅ Favor composition over conditional rendering (e.g., separate components for each state)
- ✅ Use shadcn primitives (`Button`, `Form`, `Tabs`) as-is; never fork or edit source

### Testing
- ✅ Co-locate tests: `Component.tsx` + `Component.test.tsx`
- ✅ Mock API calls via Jest mocks
- ✅ Test form validation, edge cases, and error states
- ✅ No snapshot tests for UI; test behavior instead

### Accessibility
- ✅ Use semantic HTML (`<form>`, `<fieldset>`, `<legend>`)
- ✅ Label all form fields (`<label htmlFor="...">`)
- ✅ ARIA attributes for custom components
- ✅ Test with keyboard navigation

---

## 9. Design Reference

### Step 1: Community Selection

**Screenshot:** None dedicated; context from flow (community required before other steps)

**Observations:**
- Community shown in sidebar as "Ask TUKAi" (example)
- Single community selected from dropdown
- Prerequisite to all other steps

---

### Step 2: About Experience

**Screenshot:** `docs/designs/create-experience/02-about.png`

**Key measurements:**
- Left panel: ~60% width
- Right panel: ~40% width, sticky
- Title field: single-line text input
- Description: large text area (Lexical editor in actual code, but design shows textarea)
- Photos upload: button with icon ("Add Photo(s)")
- Location: autocomplete field
- Categories: scrollable pill selection (Hiking, Running, Camping, Cooking, Backpacking, Walking, Overlooking, Gym, Bird Watching, Sunset, Fishing, Safari, Forts & Museums, Horse Riding, Rock Climbing, Scenic Driving/Road Trip, Restaurants, Sports Activity, Weekend, Shopping, Kids, Water Sports, Night Life, Other)
- Buttons: "Cancel", "Save & Edit", "Save & Continue" (green)

**Colours (map to Tailwind):**
- Primary green: `emerald-600` or `green-600`
- Neutral backgrounds: `gray-50`, `gray-100`
- Text: `gray-900` (headings), `gray-600` (secondary)
- Borders: `gray-200`
- Button hover: darker shade of primary

**New components needed:**
- None. Existing `FileUploadField`, `LocationAutocompleteField`, editor, and category pills handle all UI.

---

### Step 3: Dates & Tickets

**Screenshots:**
- `docs/designs/create-experience/01-date-and-type.png` (date selection, experience type)
- `docs/designs/create-experience/03-tickets-empty.png` (no tickets yet)
- `docs/designs/create-experience/03b-tickets-filled.png` (tickets added)

**Key measurements:**
- Date & time pickers: inline with calendar/clock widgets (material design)
- Experience type: radio buttons (Paid Experience, Free Experience)
- Experience type options: One-Time/Day, Multi-Day (e.g., 2-3 days), Itinerary, Create a recurring experience
- Ticket card: shows name, price (`GHS 50.00`), quantity available
- Add ticket button: "+ Add Ticket"
- Buttons: "Cancel", "Save & Edit", "Save & Continue"

**Colours:**
- Paid Experience button: `emerald-600`
- Free Experience button: outlined, `gray-600`
- Ticket cards: `white` background, `gray-200` border
- Price text: `emerald-600`

**New components needed:**
- None. Existing `TimePicker` and date picker handle UI. `CreateTickets` component exists.

---

### Step 4: Invite Guests

**Screenshot:** `docs/designs/create-experience/04-invite-guests.png`

**Key measurements:**
- Left panel: form with search inputs
- Right panel: full experience preview (photo, title, date, description, tickets, etc.)
- Invite members input: search field with avatar list of selected members below
- Invite communities input: search field with community pill list
- Buttons: "Cancel", "Save & Edit", "Preview & Publish"

**Colours:**
- Preview section backgrounds: `emerald-50`, `red-50` for different sections (alerts/banners)
- Selected member avatars: initials in colored circle

**New components needed:**
- None. `InviteMembers`, `InviteCommunities`, and `ExperienceReview` exist.

---

### Step 5: Wallet Details (5 states)

**Screenshots:**
- `05a-wallet-empty.png` — No saved wallets; "Add Payment Method" button
- `05b-wallet-mpesa.png` — M-Pesa form (phone number input)
- `05c-wallet-bank.png` — Bank account form (bank name, account, code)
- `05d-wallet-saved-mpesa.png` — Saved M-Pesa card (masked phone, edit button)
- `05e-wallet-saved-bank.png` — Saved bank card (masked account, edit button)

**Key measurements:**
- Payment method toggle: "M-Pesa" / "Bank Account" radio or pills
- Wallet card: shows payment method icon, masked details, edit button
- Form state: shows input fields for phone or bank details
- Default wallet: radio button or checkbox

**Colours:**
- M-Pesa: associated color from design (likely `emerald-600`)
- Bank: different colour (likely `blue-600`)
- Wallet cards: `white` background, `gray-200` border
- Masked text: `gray-600`

**New components needed:**
- None. `BankAccountDetailsForm`, `MpesaDetailsForm`, and `CreateExperienceWallet` exist.

---

### Step 6: Review Page

**Screenshots:**
- `06-review.png` — Full review with all sections (main summary)
- `06a-review-inline-edit.png` — Edit button in section header
- `06b-review-success-modal.png` — Success modal after publish

**Key measurements:**
- Left panel: full-width summary of all entered data
  - Large photo/gallery
  - Title, date range, host community
  - Description, what's included, what's not
  - Location map
  - Tickets list
  - Categories
  - Invited members/communities
  - Payment wallet
- Right panel: hidden on this page (or shows edit state)
- Each section: title, content, edit pencil icon
- Buttons: "Cancel", "Delete", "Publish"

**Success modal:**
- Checkmark icon
- "Experience Published!" heading
- "Share link" option
- Close/done button

**Colours:**
- Section headers: `gray-900`, bold
- Edit icons: `gray-500` (hover: `gray-700`)
- Dividers: `gray-200`
- Success modal: `emerald-600` checkmark

**Components needed:**
- `ExperienceReview` with inline edit capability
- `ReviewInfoSection`, `ReviewPhotoGallery`, `ReviewCategories`, `ReviewLocationCard`, `ReviewTickets`, `ReviewCommunities`, `ReviewGuests`, `ReviewWallets` (all ✅ exist)

---

## 10. File Tree Reference

```
app/(experiences)/experiences/create/
├── page.tsx                           # Main page component
├── hooks/
│   ├── useCreateExperienceFlow.ts     # State management hook
│   ├── useCreateExperienceFlow.test.ts # Hook tests
│   └── index.ts                       # Barrel export
└── components/
    ├── steps.tsx                      # Tab navigation & step container
    ├── step-side-panel.tsx            # Right panel (preview)
    ├── community.tsx                  # Step 1: Community selection
    ├── about.tsx                      # Step 2: Description, photos, location
    ├── dates.tsx                      # Step 3a: Date selection
    ├── createTickets.tsx              # Step 3b: Ticket management
    ├── customiseItinerary.tsx         # Step 3c: Multi-day itinerary
    ├── invites.tsx                    # Step 4: Guest invitations
    ├── wallet.tsx                     # Step 5: Payment method
    ├── savedTicketCard.tsx            # Sub-component: ticket card display
    └── experienceReview/
        ├── index.tsx                  # Full review panel
        ├── reviewInfoSection.tsx      # Info display in review
        ├── reviewPhotoGallery.tsx     # Photo carousel
        ├── reviewCategories.tsx       # Category pills
        ├── reviewLocationCard.tsx     # Map & location
        ├── reviewTickets.tsx          # Ticket list
        ├── reviewCommunities.tsx      # Host community
        ├── reviewGuests.tsx           # Invited members/communities
        └── reviewWallets.tsx          # Payment method display

app/(experiences)/experiences/review/
└── [experienceId]/
    └── page.tsx                       # Review/publish page (separate from create flow)
```

---

## 11. Key Hooks

All hooks in the create flow are defined in `app/(experiences)` or `app/shared`:

| Hook | Location | Purpose |
|------|----------|---------|
| `useCreateExperienceFlow` | `app/(experiences)/experiences/create/hooks/useCreateExperienceFlow.ts` | Step navigation, state, URL sync |
| `useCreateExperience` | `app/shared/hooks/useExperiences.ts` | Create new experience mutation |
| `useUpdateExperience` | `app/shared/hooks/useExperiences.ts` | Update experience data |
| `useFetchSingleExperience` | `app/shared/hooks/useExperiences.ts` | Fetch current experience details |
| `useGetCommunities` | `app/shared/hooks/useCommunities.tsx` | Fetch user's communities |
| `useGetWallets` | `app/(experiences)/hooks/usePayment.ts` | Fetch saved wallets |
| `useCreatePhoneWallet` | `app/(experiences)/hooks/usePayment.ts` | Create M-Pesa wallet |
| `useCreateBankWallet` | `app/(experiences)/hooks/usePayment.ts` | Create bank wallet |
| `usePatchPhoneWallet` | `app/(experiences)/hooks/usePayment.ts` | Update M-Pesa wallet |
| `usePatchBankWallet` | `app/(experiences)/hooks/usePayment.ts` | Update bank wallet |
| `useGetInterestCategories` | `app/shared/hooks/useAuth.ts` | Fetch available categories |
| `useGoogleMapsAutocomplete` | `app/shared/hooks/usePlaces.ts` | Google Maps location autocomplete |

---

## 12. Future Enhancements & Known Limitations

- **Invites:** Currently stored in state but not sent to backend on publish. Implement in a future PR.
- **Recurring experiences:** UI supports "recurring" type but backend logic not yet built.
- **Itinerary:** Multi-day itinerary UI exists but may need refinement in review.
- **Preview on mobile:** Sticky right panel may not work well on small screens; consider responsive adjustments.
- **Accessibility:** Full audit needed for WCAG compliance (keyboard nav, screen readers, colour contrast).

---

**Last updated:** April 30, 2026  
**Status:** All steps implemented and functional  
**Maintainers:** Engineering team
