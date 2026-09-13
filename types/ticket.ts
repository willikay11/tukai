export type TicketPrice = {
  amount: number | string;
  currency: string;
};

export type Ticket = {
  id: string;
  name: string;
  quantity: number;
  // The host's base amount, before Tukai's commission is allocated
  price: number | string;
  // What the buyer is charged — the API derives it from the experience's
  // fees_allocation, so it is the only price a buyer should be shown
  buyerPrice?: TicketPrice | null;
  buyer_price?: TicketPrice | null;
  experience: string;
  availableQuantity?: number;
  available_quantity?: number;
  slotTemplate?: string | null;
  slot_template?: string | null;
  dateCreated?: string;
  date_created?: string;
  salesStartDate?: string | null;
  salesStartTime?: string | null;
  salesEndDate?: string | null;
  salesEndTime?: string | null;
  sales_start_date?: string | null;
  sales_end_date?: string | null;
  salesStartRelative?: {
    amount: number;
    unit: 'hour' | 'day' | 'week';
    anchor: 'start' | 'end';
  } | null;
  salesEndRelative?: {
    amount: number;
    unit: 'hour' | 'day' | 'week';
    anchor: 'start' | 'end';
  } | null;
};
