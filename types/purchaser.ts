export type PurchaserDetails = {
  first_name: string;
  last_name: string;
  confirmation_email: string;
  ticket_purchases: { ticket_id: string; quantity: number }[];
  billing_details: {
    billing_address: { country: string };
    payment_method: { payment_option: string; mobile_money_phone?: string };
  };
};
