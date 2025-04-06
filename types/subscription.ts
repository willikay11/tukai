export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  discount?: number;
};
