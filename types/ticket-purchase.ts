// Shape of /v1/experiences/ticket-purchases/ results after parseSnakeToCamel.
// One record per individual ticket; "reservations" in the UI are these rows
// grouped by experience + occurrence + status.

export interface TicketPurchase {
  id: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    picture?: string | null;
  } | null;
  ticketNumber: string;
  ticket: {
    id: string;
    name: string;
    price: string;
    currency: string;
    experience: string; // experience uuid only — details need a join
  };
  occurrence: {
    id: string;
    startDate: string;
    endDate: string;
  } | null;
  qrCodeImage: string | null;
  ticketPdf: string | null;
  status: string; // observed: 'completed' | 'expired'; badge handles unknowns
  dateCreated: string;
}

// One entry per individual ticket inside a reservation — drives the
// ticket modal's paginated QR view
export interface ReservationTicket {
  id: string; // purchase record id — used for the per-ticket PDF download
  ticketNumber: string;
  qrCodeImage: string | null;
  hasPdf: boolean;
  holderName: string;
  ticketType: string;
}

export interface Reservation {
  key: string;
  experienceId: string;
  occurrenceId: string | null;
  occurrenceStart: string | null;
  occurrenceEnd: string | null;
  status: string;
  ticketName: string;
  ticketCount: number;
  tickets: ReservationTicket[];
}
