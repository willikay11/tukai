import { z } from 'zod';

/**
 * Validation for the create-experience wizard.
 *
 * These schemas are the single source of truth for both the rules and the
 * form's shape — step form types are derived with `z.infer` rather than
 * declared by hand, which is what previously let duplicate declarations drift
 * from each other and from runtime.
 *
 * Issue paths are chosen so `zodErrorsToMap` produces exactly the keys the step
 * components already read (e.g. `slots.0.endTime`, `tickets.1.amount`).
 */

// 'HH:mm' strings compare correctly with < and > while zero-padded
const isBefore = (start: string, end: string) => start < end;

/** Flattens a ZodError into the `Record<string, string>` the steps render. */
export const zodErrorsToMap = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const key = issue.path.join('.');
    // First message per field wins, so a required check is not masked by a
    // follow-on rule about the same field
    if (key && errors[key] === undefined) {
      errors[key] = issue.message;
    }
  });

  return errors;
};

// ─── Shared field shapes ────────────────────────────────────────────────────

const communityOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
});

const formPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  file: z.custom<File>().optional(),
  isTempId: z.boolean().optional(),
});

const interestSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
});

const timeSlotSchema = z.object({
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

// ─── Step 1: Dates & Type ───────────────────────────────────────────────────

const dateTypeShape = z.object({
  community: communityOptionSchema.nullable(),
  experiencePricing: z.enum(['paid', 'free']),
  experienceType: z.enum(['one-time', 'multi-day', 'itinerary']),
  isRecurring: z.boolean(),
  date: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  recurringDays: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])),
  recurrenceStartDate: z.string().nullable(),
  recurrenceEndDate: z.string().nullable(),
  timeSlots: z.array(timeSlotSchema),
  multiDayStartDate: z.string().nullable(),
  multiDayStartTime: z.string().nullable(),
  multiDayEndDate: z.string().nullable(),
  multiDayEndTime: z.string().nullable(),
  itineraryStartDate: z.string().nullable(),
  itineraryEndDate: z.string().nullable(),
});

export type DateTypeFormValues = z.infer<typeof dateTypeShape>;

/**
 * Rules only — the shape is already guaranteed by TypeScript. Wrapping in
 * `z.custom` matters: a strict object schema that fails on shape would skip
 * `superRefine` entirely and silently report no business-rule errors.
 */
export const dateTypeSchema = z.custom<DateTypeFormValues>().superRefine((value, ctx) => {
  const require = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

  if (!value.community) {
    require(['community'], 'Community is required');
  }

  if (value.experienceType === 'itinerary') {
    if (!value.itineraryStartDate) require(['itineraryStartDate'], 'Please select a start date');
    if (!value.itineraryEndDate) require(['itineraryEndDate'], 'Please select an end date');

    if (
      value.itineraryStartDate &&
      value.itineraryEndDate &&
      value.itineraryStartDate > value.itineraryEndDate
    ) {
      require(['itineraryEndDate'], 'End date must be after start date');
    }
    return;
  }

  if (value.experienceType === 'multi-day') {
    if (!value.multiDayStartDate) require(['multiDayStartDate'], 'Start date is required');
    if (!value.multiDayStartTime) require(['multiDayStartTime'], 'Start time is required');
    if (!value.multiDayEndDate) require(['multiDayEndDate'], 'End date is required');
    if (!value.multiDayEndTime) require(['multiDayEndTime'], 'End time is required');

    if (
      value.multiDayStartDate &&
      value.multiDayEndDate &&
      value.multiDayStartDate > value.multiDayEndDate
    ) {
      require(['multiDayEndDate'], 'End date must be after start date');
    }

    // Only meaningful on a single day — across days an earlier end time is fine
    if (
      value.multiDayStartDate &&
      value.multiDayStartDate === value.multiDayEndDate &&
      value.multiDayStartTime &&
      value.multiDayEndTime &&
      !isBefore(value.multiDayStartTime, value.multiDayEndTime)
    ) {
      require(['multiDayEndTime'], 'End time must be after start time');
    }
    return;
  }

  if (value.isRecurring) {
    if (value.recurringDays.length === 0) {
      require(['recurringDays'], 'At least one day must be selected');
    }
    if (!value.recurrenceStartDate) require(['recurrenceStartDate'], 'Start date is required');
    if (!value.recurrenceEndDate) require(['recurrenceEndDate'], 'End date is required');

    if (
      value.recurrenceStartDate &&
      value.recurrenceEndDate &&
      value.recurrenceStartDate > value.recurrenceEndDate
    ) {
      require(['recurrenceEndDate'], 'End date must be after start date');
    }

    if (value.timeSlots.length === 0) {
      require(['timeSlots'], 'At least one time slot is required');
    }

    // Keyed `slots.<index>.<field>` to match what TimeSlotList reads
    value.timeSlots.forEach((slot, index) => {
      if (!slot.startTime) require(['slots', index, 'startTime'], 'Start time is required');
      if (!slot.endTime) require(['slots', index, 'endTime'], 'End time is required');

      if (slot.startTime && slot.endTime && !isBefore(slot.startTime, slot.endTime)) {
        require(['slots', index, 'endTime'], 'End time must be after start time');
      }
    });
    return;
  }

  // Single day
  if (!value.date) require(['date'], 'Date is required');
  if (!value.startTime) require(['startTime'], 'Start time is required');
  if (!value.endTime) require(['endTime'], 'End time is required');

  if (value.startTime && value.endTime && !isBefore(value.startTime, value.endTime)) {
    require(['endTime'], 'End time must be after start time');
  }
});

// ─── Step 2: About ──────────────────────────────────────────────────────────

const aboutShape = z.object({
  photos: z.array(formPhotoSchema),
  title: z.string(),
  visibility: z.enum(['public', 'private']),
  description: z.string(),
  whatsIncluded: z.string(),
  whatsNotIncluded: z.string(),
  location: z.string(),
  locationPlaceId: z.string(),
  placeId: z.string().nullable(),
  placeImageUrl: z.string().nullable(),
  meetingPoint: z.string(),
  meetingTime: z.string().nullable(),
  categories: z.array(interestSchema),
});

export type AboutFormValues = z.infer<typeof aboutShape>;

export const aboutSchema = z.custom<AboutFormValues>().superRefine((value, ctx) => {
  const require = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

  if (!value.title?.trim()) require(['title'], 'Title is required');
  if (!value.description?.trim()) require(['description'], 'Description is required');
  if (!value.location?.trim()) require(['location'], 'Location is required');
  if ((value.photos?.length ?? 0) === 0) require(['photos'], 'At least one photo is required');
});

// ─── Step 3: Tickets ────────────────────────────────────────────────────────

const relativeValiditySchema = z.object({
  amount: z.number(),
  unit: z.enum(['hour', 'day', 'week']),
  anchor: z.enum(['start', 'end']),
});

const ticketItemSchema = z.object({
  id: z.string(),
  apiId: z.string().optional(),
  name: z.string(),
  quantity: z.number(),
  amount: z.number(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  salesStartDate: z.string().nullable(),
  salesStartTime: z.string().nullable(),
  salesEndDate: z.string().nullable(),
  salesEndTime: z.string().nullable(),
  acceptPartialPayment: z.boolean(),
  salesStartRelative: relativeValiditySchema.nullable(),
  salesEndRelative: relativeValiditySchema.nullable(),
  duplicateForEntirePeriod: z.boolean(),
  slotIndex: z.number().optional(),
  dayIndex: z.number().optional(),
});

const ticketsShape = z.object({
  commission: z.enum(['host', 'customer', 'split']),
  ticketMode: z.enum(['entire-period', 'each-day']).nullable(),
  items: z.array(ticketItemSchema),
});

export type TicketsFormValues = z.infer<typeof ticketsShape>;

interface TicketsContext {
  experiencePricing: 'paid' | 'free';
  experienceType: 'one-time' | 'multi-day' | 'itinerary';
}

/**
 * Ticket rules depend on the Dates & Type step (pricing and experience type),
 * so the schema is built with that context rather than reading it globally.
 */
export const buildTicketsSchema = ({ experiencePricing, experienceType }: TicketsContext) =>
  z.custom<TicketsFormValues>().superRefine((value, ctx) => {
    const require = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    // Both of these short-circuit in the original validator — nothing per-item
    // is reported until there is at least one ticket and a chosen mode
    if (value.items.length === 0) {
      require(['items'], 'At least one ticket is required');
      return;
    }

    if (experienceType === 'multi-day' && !value.ticketMode) {
      require(['ticketMode'], 'Please select how you want to create tickets');
      return;
    }

    value.items.forEach((ticket, index) => {
      if (!ticket.name.trim()) {
        require(['tickets', index, 'name'], 'Ticket name is required');
      }

      if (ticket.quantity === null || ticket.quantity === undefined || ticket.quantity <= 0) {
        require(['tickets', index, 'quantity'], 'Quantity must be greater than 0');
      }

      if (experiencePricing === 'paid') {
        if (ticket.amount === null || ticket.amount === undefined || ticket.amount <= 0) {
          require(['tickets', index, 'amount'], 'Amount must be greater than 0');
        }
      }
    });
  });

// ─── Step 5: Wallet ─────────────────────────────────────────────────────────

const walletShape = z.object({
  paymentMethod: z.enum(['phone', 'bank']),
  selectedWallet: z.custom<unknown>().optional(),
  phoneNumber: z.string(),
});

export type WalletFormValues = z.infer<typeof walletShape>;

/**
 * A wallet already saved on the account satisfies this step, so the check needs
 * to know whether any exist rather than looking only at the form.
 */
export const buildWalletSchema = ({ hasSavedWallets }: { hasSavedWallets: boolean }) =>
  z.custom<WalletFormValues>().superRefine((value, ctx) => {
    if (!hasSavedWallets && !value.selectedWallet && !value.phoneNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wallet'],
        message: 'Please set up a payment method before continuing.',
      });
    }
  });
