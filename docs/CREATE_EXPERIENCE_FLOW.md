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

### Step 1: Community & Date Type (`community` → `dates-tickets`)

**User action:** Select a community, then choose experience type and date format (single or recurring).

**Substeps:**

1. **Select community:** Pick the community hosting this experience
2. **Choose pricing:** Paid or Free experience
3. **Choose type & dates:**
   - **Single-day:** One date + start/end time
   - **Recurring:** Multiple days of week + date range + multiple time slots

**Form inputs (community):**

- Community dropdown (read-only list of user's created communities)

**Form inputs (single-day dates):**

- Experience type radio: Paid, Free
- Experience variant radio: One-Time, Multi-Day, Itinerary, Recurring
- Date picker (single)
- Start time picker
- End time picker

**Form inputs (recurring dates):**

- Day picker (7 pills: Mon–Sun, multi-select)
- Recurrence start date picker
- Recurrence end date picker
- Time slot list (min 1 slot, add/remove buttons)
  - Each slot: start time picker, end time picker

**Preview section:** Shows selected community name and logo.

**Components:**

- `CreateExperienceCommunity`
  - File: `app/(experiences)/experiences/create/components/community.tsx`
  - Handles community selection and creates initial experience record
- `DateTypeStep`
  - File: `app/(experiences)/experiences/create/components/DateTypeStep.tsx`
  - Controlled component, dispatches via `updateFormData`

**Recurring-specific components:**

- `RecurringDayPicker`
  - File: `app/(experiences)/experiences/create/components/RecurringDayPicker/RecurringDayPicker.tsx`
  - 7 pills (Mon–Sun), multi-select, green highlight when active
- `RecurrenceDateRange`
  - File: `app/(experiences)/experiences/create/components/RecurrenceDateRange/RecurrenceDateRange.tsx`
  - Two date pickers side-by-side (start/end)
- `RecurrencePreviewLabel`
  - File: `app/(experiences)/experiences/create/components/RecurrencePreviewLabel/RecurrencePreviewLabel.tsx`
  - Shows "Your first experience will be on [day], [date]" (computed from startDate + selected days)
- `TimeSlotList`
  - File: `app/(experiences)/experiences/create/components/TimeSlotList/TimeSlotList.tsx`
  - List of time slot pairs, add button appends, delete (×) on non-first slots

**Form data saved:**

- Experience created with `communityId`
- For non-recurring: `date`, `startTime`, `endTime`
- For recurring: `recurringDays`, `recurrenceStartDate`, `recurrenceEndDate`, `timeSlots[]`

**Design reference:**

- Community selection: embedded in flow (prerequisite to other steps)
- `docs/designs/create-experience/01-date-and-type.png` (single-day variant)
- `docs/designs/create-experience/08-recurring-date-type.png` (recurring variant — new)

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
});
```

**Design reference:** `docs/designs/create-experience/02-about.png`

---

### Step 5: Tickets (`dates-tickets` tab, shown after dates saved)

**User action:** Create pricing tiers and define ticket validity periods.

**Mode variants:**

- **Single-day:** Absolute date/time validity (sales start date/time → sales end date/time)
- **Recurring:** Relative validity (sales start relative to experience start → sales end relative to experience start)

**Form inputs (single-day mode):**

- Commission split picker: Host, Customer, Split (50/50)
- Ticket name (text)
- Ticket price (currency input, required for paid experiences)
- Available quantity (number, required)
- Sales start date + time pickers (absolute)
- Sales end date + time pickers (absolute)
- Accept partial payment checkbox
- Add/remove ticket buttons

**Form inputs (recurring mode):**

- Commission split picker: Host, Customer, Split
- Ticket name (text)
- Ticket price (currency input)
- Available quantity (number)
- Sales start relative validity picker:
  - Amount + unit selector (1 hour, 2 hours, ..., 2 weeks)
  - Anchor selector (before experience starts, after experience starts)
- Sales end relative validity picker (same structure)
- Duplicate ticket(s) for the entire period checkbox
  - When checked: single ticket applies to all recurring instances
  - When unchecked: separate tickets per time slot
- Add/remove ticket buttons

**Preview section:**

- Date badge (shows single or recurring format)
- Ticket cards (read-only list)

**Components:**

- `TicketsStep`
  - File: `app/(experiences)/experiences/create/components/TicketsStep/TicketsStep.tsx`
  - Controlled component, manages ticket creation/editing
  - Props: `isRecurring`, `timeSlots`, `recurringDays` for recurring display
- `CommissionPicker` (existing)
- `TicketForm`
  - File: `app/(experiences)/experiences/create/components/TicketForm/TicketForm.tsx`
  - Conditional rendering: absolute pickers (single) vs relative picker (recurring)
  - Prop: `isRecurring: boolean`
- `TicketDateBadge`
  - File: `app/(experiences)/experiences/create/components/TicketDateBadge/TicketDateBadge.tsx`
  - Discriminated union with `mode: 'single' | 'recurring'`
  - Single mode: shows date and time range
  - Recurring mode: shows days and time range, one badge per time slot
- `SavedTicketCard` (existing)
- `AddTicketTypeButton` (existing)

**Recurring-specific components:**

- `RelativeValidityPicker`
  - File: `app/(experiences)/experiences/create/components/RelativeValidityPicker/RelativeValidityPicker.tsx`
  - Two-row layout (start validity, end validity)
  - Each row: amount dropdown (1 hour–2 weeks) + anchor dropdown (before/after)
  - Helper functions: `parseAmount()`, `formatAmount()`
- `DuplicateTicketsCheckbox`
  - File: `app/(experiences)/experiences/create/components/DuplicateTicketsCheckbox/DuplicateTicketsCheckbox.tsx`
  - Label: "Duplicate ticket(s) for the entire period"

**Design reference:**

- `docs/designs/create-experience/03-tickets-empty.png` (single-day empty)
- `docs/designs/create-experience/03b-tickets-filled.png` (single-day with tickets)
- `docs/designs/create-experience/09-recurring-tickets.png` (recurring variant — new)

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

| Component                                               | Current path                                | Used in step        | How                                                      |
| ------------------------------------------------------- | ------------------------------------------- | ------------------- | -------------------------------------------------------- |
| **Button**                                              | `@/components/ui/button`                    | All steps           | Primary action button; variants: default, text, outline  |
| **Tabs, TabsList, TabsTrigger, TabsContent**            | `@/components/ui/tabs`                      | Structure           | Step navigation; custom styling in steps.tsx             |
| **Input**                                               | `@/components/ui/input`                     | All                 | Text inputs for titles, phone, account details           |
| **Form, FormControl, FormField, FormItem, FormMessage** | `@/components/ui/form`                      | About, Wallet       | React Hook Form integration via shadcn                   |
| **FileUploadField**                                     | `@/app/shared/components/Forms`             | About               | Photo upload with preview                                |
| **LocationAutocompleteField**                           | `@/app/shared/components/LocationPicker`    | About               | Google Maps autocomplete for experience location         |
| **IconComponent**                                       | `@/app/shared/components/Icons`             | All                 | Step icons (AddTeamIcon, InformationCircleIcon, etc.)    |
| **CreateStepContentSkeleton, WalletListSkeleton**       | `@/app/shared/components/Cards`             | Structure           | Loading placeholders                                     |
| **Editor (Lexical)**                                    | `@/components/blocks/editor-00/editor`      | About               | Rich text editing for description, included/not included |
| **CategoryPill**                                        | `@/components/ui/categoryPill`              | About               | Display selected categories                              |
| **PillRadioGroup**                                      | `@/components/ui/pillRadioGroup`            | Dates, Wallet       | Radio selection via pill UI                              |
| **TimePicker**                                          | `@/components/ui/time-picker`               | About, Dates        | Time input for meeting time and date/time pickers        |
| **InvitedMember, InviteMembers**                        | `@/components/ui/invite-members`            | Guests              | Member selection and type definition                     |
| **BankAccountDetailsForm**                              | `@/components/ui/bank-account-details-form` | Wallet              | Bank account payment form                                |
| **MpesaDetailsForm**                                    | `@/components/ui/mpesa-details-form`        | Wallet              | M-Pesa payment form                                      |
| **Avatar**                                              | `@/components/ui/avatar`                    | Review (side panel) | Member/community avatars in preview                      |
| **DescriptionShowMore**                                 | `@/app/shared/components/Global`            | Review              | Expandable description in preview                        |
| **Checkbox**                                            | `@/components/ui/checkbox`                  | Wallet              | Set as default wallet selection                          |
| **InviteCommunities**                                   | `@/components/ui/invite-communities`        | Guests              | Community selection and invitation                       |

---

### Table B: New Components to Build

| Component                    | Step               | Location                                                                                                | Description                                                                                              |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **ExperienceReview**         | Guests, Wallet     | `app/(experiences)/experiences/create/components/experienceReview/index.tsx`                            | ✅ EXISTS — Full preview panel showing all entered data; used in side panel                              |
| **ReviewInfoSection**        | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewInfoSection.tsx`                | ✅ EXISTS — Displays title, description, location, visibility on review page                             |
| **ReviewPhotoGallery**       | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewPhotoGallery.tsx`               | ✅ EXISTS — Photo carousel/grid on review page                                                           |
| **ReviewCategories**         | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewCategories.tsx`                 | ✅ EXISTS — Category pills on review page                                                                |
| **ReviewLocationCard**       | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewLocationCard.tsx`               | ✅ EXISTS — Google Map with location details on review page                                              |
| **ReviewTickets**            | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewTickets.tsx`                    | ✅ EXISTS — Ticket list with pricing on review page                                                      |
| **ReviewCommunities**        | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewCommunities.tsx`                | ✅ EXISTS — Host community info on review page                                                           |
| **ReviewGuests**             | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewGuests.tsx`                     | ✅ EXISTS — Invited members & communities on review page                                                 |
| **ReviewWallets**            | Review page        | `app/(experiences)/experiences/create/components/experienceReview/reviewWallets.tsx`                    | ✅ EXISTS — Selected wallet(s) on review page                                                            |
| **RecurringDayPicker**       | Step 1 (recurring) | `app/(experiences)/experiences/create/components/RecurringDayPicker/RecurringDayPicker.tsx`             | ✅ NEW — 7 pills (Mon–Sun), multi-select, green highlight when active                                    |
| **RecurrenceDateRange**      | Step 1 (recurring) | `app/(experiences)/experiences/create/components/RecurrenceDateRange/RecurrenceDateRange.tsx`           | ✅ NEW — Two DatePickers side-by-side for recurrence start/end dates                                     |
| **RecurrencePreviewLabel**   | Step 1 (recurring) | `app/(experiences)/experiences/create/components/RecurrencePreviewLabel/RecurrencePreviewLabel.tsx`     | ✅ NEW — Green pill showing "Your first experience will be on [day], [date]"                             |
| **TimeSlotList**             | Step 1 (recurring) | `app/(experiences)/experiences/create/components/TimeSlotList/TimeSlotList.tsx`                         | ✅ NEW — List of time slot pairs with add/remove buttons                                                 |
| **RelativeValidityPicker**   | Step 5 (recurring) | `app/(experiences)/experiences/create/components/RelativeValidityPicker/RelativeValidityPicker.tsx`     | ✅ NEW — Dual-row picker for sales validity (amount + unit + anchor)                                     |
| **DuplicateTicketsCheckbox** | Step 5 (recurring) | `app/(experiences)/experiences/create/components/DuplicateTicketsCheckbox/DuplicateTicketsCheckbox.tsx` | ✅ NEW — Checkbox for "Duplicate ticket(s) for the entire period"                                        |
| **TicketDateBadge**          | Step 5             | `app/(experiences)/experiences/create/components/TicketDateBadge/TicketDateBadge.tsx`                   | ✅ ADAPTED — Discriminated union: single date+time or recurring days+time range, one badge per time slot |
| **PreviewDateSection**       | Side panel         | `app/(experiences)/experiences/create/components/PreviewDateSection.tsx`                                | ✅ ADAPTED — Discriminated union: single date+time or recurring days+date range                          |

**Note:** All filenames use camelCase (e.g., `reviewInfoSection.tsx`) while component exports use PascalCase (e.g., `export const ReviewInfoSection`).

**Summary:** All major components exist or are new. Flow reuses existing UI components and form builders. Recurring experience support added via 6 new components and 2 adapted components for mode switching (single vs recurring).

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

**FormData type structure:**

```typescript
interface FormData {
  dateType: {
    community: Community | null;
    experiencePricing: 'paid' | 'free';
    experienceType: 'one-time' | 'multi-day' | 'itinerary';
    isRecurring: boolean;
    // Single-day fields
    date: string | null; // ISO 8601 (YYYY-MM-DD)
    startTime: string | null; // HH:mm
    endTime: string | null; // HH:mm
    // Recurring fields
    recurringDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
    recurrenceStartDate: string | null; // ISO 8601
    recurrenceEndDate: string | null; // ISO 8601
    timeSlots: { startTime: string | null; endTime: string | null }[];
  };
  about: {
    /* ...existing fields... */
  };
  tickets: {
    commission: 'host' | 'customer' | 'split';
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      amount: number;
      // Single-day fields (absolute validity)
      salesStartDate: string | null;
      salesStartTime: string | null;
      salesEndDate: string | null;
      salesEndTime: string | null;
      // Recurring fields (relative validity)
      salesStartRelative: RelativeValidityValue | null;
      salesEndRelative: RelativeValidityValue | null;
      duplicateForEntirePeriod: boolean;
      acceptPartialPayment: boolean;
    }>;
  };
  invite: {
    /* ...existing fields... */
  };
  wallet: {
    /* ...existing fields... */
  };
}

// Helper type for recurring validity
type RelativeValidityValue = {
  amount: number;
  unit: 'hour' | 'day' | 'week';
  anchor: 'start' | 'end'; // start = before experience, end = after
};
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

### Step 1 & 5: Dates & Tickets (Single-day variant)

**Screenshots:**

- `docs/designs/create-experience/01-date-and-type.png` (single-day date selection)
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

**Components:**

- `RecurringDayPicker` — NOT used in single-day variant
- `TimePicker` and `DatePicker` — used for single dates/times
- `TicketForm` with `isRecurring=false` — shows absolute date/time pickers for ticket validity

---

### Step 1 & 5: Dates & Tickets (Recurring variant)

**Screenshots:**

- `docs/designs/create-experience/08-recurring-date-type.png` (recurring date selection with day picker, date range, time slots)
- `docs/designs/create-experience/09-recurring-tickets.png` (recurring tickets with relative validity picker, duplicate checkbox)

**Key measurements (Step 1 - Date selection):**

- Experience type radio: Paid, Free (same as single-day)
- Variant radio: One-Time, Multi-Day, Itinerary, **Recurring** (selected)
- Day picker: 7 pills (Mon–Sun), 40px height, green fill when selected
- Start date picker + End date picker (side-by-side or stacked)
- Recurrence preview: "Your first experience will be on Saturday, 5 July" (green pill)
- Time slot list: Starts with 1 slot, "Add Slot" button, each slot shows two time pickers, delete (×) button on non-first slots

**Key measurements (Step 5 - Tickets):**

- Ticket date badge: "Every Mon, Tue, 08:00 AM – 10:00 PM" (one badge per time slot when recurring)
- Commission picker: same as single-day
- Ticket form fields: name, price, quantity (same as single-day)
- **Sales validity pickers (NEW):**
  - Start validity: amount dropdown (1 hour–2 weeks) + anchor dropdown (before/after experience starts)
  - End validity: same structure
  - Example: "Sales start 1 hour before experience" + "Sales end 30 minutes after experience ends"
- **Duplicate checkbox:** "Duplicate ticket(s) for the entire period" (checked = 1 ticket for all slots, unchecked = separate tickets per slot)
- Add/remove ticket buttons

**Colours:**

- Day picker selected: `emerald-600` fill
- Recurrence preview pill: `emerald-50` background, `emerald-700` text
- Relative validity dropdowns: standard form styling
- Duplicate checkbox: standard checkbox styling

**Components:**

- `RecurringDayPicker` — 7 pills with multi-select
- `RecurrenceDateRange` — Two DatePickers for start/end of recurrence
- `RecurrencePreviewLabel` — Shows computed first occurrence
- `TimeSlotList` — Manages array of time slots
- `TicketDateBadge` with `mode="recurring"` — One badge per slot
- `RelativeValidityPicker` — Dual-row validity selector
- `DuplicateTicketsCheckbox` — Toggle for ticket duplication strategy

---

### Step 4: Invite Guests

**Screenshot:** `docs/designs/create-experience/04-invite-guests.png`

**Key measurements:**

- Left panel: form with search inputs
- Right panel: full experience preview (photo, title, date, description, tickets, etc.)
- Invite members input: search field with avatar list of selected members below
- Invite communities input: search field with community pill list
- Buttons: "Cancel", "Save & Edit", "Preview"

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

| Hook                        | Location                                                                | Purpose                           |
| --------------------------- | ----------------------------------------------------------------------- | --------------------------------- |
| `useCreateExperienceFlow`   | `app/(experiences)/experiences/create/hooks/useCreateExperienceFlow.ts` | Step navigation, state, URL sync  |
| `useCreateExperience`       | `app/shared/hooks/useExperiences.ts`                                    | Create new experience mutation    |
| `useUpdateExperience`       | `app/shared/hooks/useExperiences.ts`                                    | Update experience data            |
| `useFetchSingleExperience`  | `app/shared/hooks/useExperiences.ts`                                    | Fetch current experience details  |
| `useGetCommunities`         | `app/shared/hooks/useCommunities.tsx`                                   | Fetch user's communities          |
| `useGetWallets`             | `app/(experiences)/hooks/usePayment.ts`                                 | Fetch saved wallets               |
| `useCreatePhoneWallet`      | `app/(experiences)/hooks/usePayment.ts`                                 | Create M-Pesa wallet              |
| `useCreateBankWallet`       | `app/(experiences)/hooks/usePayment.ts`                                 | Create bank wallet                |
| `usePatchPhoneWallet`       | `app/(experiences)/hooks/usePayment.ts`                                 | Update M-Pesa wallet              |
| `usePatchBankWallet`        | `app/(experiences)/hooks/usePayment.ts`                                 | Update bank wallet                |
| `useGetInterestCategories`  | `app/shared/hooks/useAuth.ts`                                           | Fetch available categories        |
| `useGoogleMapsAutocomplete` | `app/shared/hooks/usePlaces.ts`                                         | Google Maps location autocomplete |

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
