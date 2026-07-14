export type Ticket = {
  id: string;
  name: string;
  quantity: number;
  price: number | string;
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
