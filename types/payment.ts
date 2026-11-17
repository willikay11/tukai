import { MoneyLike, moneyAmount } from '@/utils/money';

/** Money as the API sends it. */
export type Money = { amount: string; currency: string };

export type CreatePhoneWallet = {
  phone: string;
};

export type UpdatePhoneWallet = {
  walletId: string;
  phone: string;
};

export type CreateBankWallet = {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  branchCode: string;
  country: string;
  swiftCode: string;
  address: string;
};

export type UpdateBankWallet = {
  walletId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  branchCode: string;
  country: string;
  swiftCode: string;
  address: string;
};

export type Wallet = {
  id: string;
  user: string;
  walletType: 'phone' | 'bank';
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  bankBranch?: string;
  branchCode?: string;
  country: string;
  swiftCode?: string;
  address?: string;
  isActive: boolean;
  dateCreated: string;
};

/**
 * What a host has earned, and what of it they can take out.
 *
 * Every figure is a `{ amount, currency }` object on the wire. The three
 * balances are not interchangeable: `available` is what a withdrawal can draw
 * on now, `pending` is money not yet settled, and `current` is the two
 * together.
 *
 * `totalTicketSales` is the list price, before promo discounts - never show it
 * as money received. What buyers paid is `amountPaid`, and what the host
 * earned is `hostNet`:
 *
 *   totalTicketSales - hostFundedDiscount - commissionDeducted = hostNet
 *   amountPaid = totalTicketSales - hostFundedDiscount - tukaiFundedDiscount
 */
export type HostEarningsSummary = {
  totalTicketSales: Money;
  amountPaid: Money;
  /** Promo discounts the host paid for; comes off their earnings. */
  hostFundedDiscount: Money;
  /** Promo discounts Tukai paid for; not the host's cost. */
  tukaiFundedDiscount: Money;
  hostNet: Money;
  availableBalance: Money;
  pendingBalance: Money;
  currentBalance: Money;
  commissionDeducted: Money;
  estimatedPayoutFee: Money;
  /** Tickets the host can still sell, at buyer price. */
  ticketsOnSale: Money;
};

export type PayoutKind = 'split_advance' | 'transfer' | 'withdrawal' | 'clawback';

export type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_settlement'
  | 'settled'
  | 'failed'
  | 'reversed';

export type HostPayout = {
  id: string;
  kind: PayoutKind;
  destinationType: 'bank' | 'mobile_money';
  currency: string;
  status: PayoutStatus;
  grossAmount: string;
  paystackFee: string;
  tukaiFee: string;
  netAmount: string;
  /** True while the fees are an estimate rather than what was charged. */
  feeEstimated?: boolean;
  dateRequested?: string;
  dateSettled?: string | null;
};

/** What a withdrawal of a given amount would actually pay out. */
export type PayoutQuote = {
  currency: string;
  destinationType: string;
  availableBalance: string;
  requestedAmount: string;
  paystackTransferFee: string;
  tukaiPayoutFee: string;
  netAmount: string;
  tukaiCommissionDeducted: string;
  maxPayoutAmount: string;
  /** The API's own words about why the maximum is what it is. */
  limitMessage: string;
};

/**
 * Money as a number: the API's `{ amount, currency }` object, or a bare
 * decimal string or number. Blank and unparseable both read as zero.
 */
export const payoutAmount = (value?: MoneyLike): number => moneyAmount(value ?? null) ?? 0;

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  pending: 'Requested',
  processing: 'On its way',
  awaiting_settlement: 'Awaiting settlement',
  settled: 'Paid out',
  failed: 'Failed',
  reversed: 'Reversed',
};

export const PAYOUT_KIND_LABEL: Record<PayoutKind, string> = {
  split_advance: 'Advance',
  transfer: 'Transfer',
  withdrawal: 'Withdrawal',
  clawback: 'Clawback',
};

/** What to call the place the money went. */
export const payoutDestinationLabel = (destination: HostPayout['destinationType']): string =>
  destination === 'bank' ? 'Bank account' : 'Mobile money';
