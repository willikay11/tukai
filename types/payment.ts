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
 * Every figure is a decimal string on the wire. The three balances are not
 * interchangeable: `available` is what a withdrawal can draw on now, `pending`
 * is money not yet settled, and `current` is the two together.
 */
export type HostEarningsSummary = {
  totalTicketSales: string;
  availableBalance: string;
  pendingBalance: string;
  currentBalance: string;
  commissionDeducted: string;
  estimatedPayoutFee: string;
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

/** A decimal string as money. Blank and unparseable both read as zero. */
export const payoutAmount = (value?: string | number | null): number => {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;

  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
};

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
