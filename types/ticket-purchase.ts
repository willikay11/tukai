// Shape of /v1/experiences/ticket-purchases/ results after parseSnakeToCamel.
// One record per individual ticket; "reservations" in the UI are these rows
// grouped by experience + occurrence + status.

export interface TicketPurchase {
  id: string;
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

export interface Reservation {
  key: string;
  experienceId: string;
  occurrenceId: string | null;
  occurrenceStart: string | null;
  occurrenceEnd: string | null;
  status: string;
  ticketName: string;
  ticketCount: number;
  // First purchase in the group that has a downloadable ticket PDF
  pdfPurchaseId: string | null;
}
