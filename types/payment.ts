import { MoneyLike, moneyAmount } from '@/utils/money';

export type CreatePhoneWallet = {
  phone: string;
  // The name on the M-Pesa account (DEV-425)
  accountHolderName?: string;
};

export type UpdatePhoneWallet = {
  walletId: string;
  phone: string;
  accountHolderName?: string;
};

/**
 * A bank payout account. The API requires bank name, branch, account number,
 * holder name and country; the rest are optional. Branch code, SWIFT code and
 * address are only needed outside Kenya (DEV-367). Postcode, town and a
 * contact phone are their own fields (DEV-426) - the contact phone is for
 * reaching the account holder, not a mobile money destination.
 */
export type CreateBankWallet = {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  country: string;
  branchCode?: string;
  swiftCode?: string;
  address?: string;
  postcode?: string;
  town?: string;
  contactPhone?: string;
};

export type UpdateBankWallet = CreateBankWallet & {
  walletId: string;
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
  postcode?: string;
  town?: string;
  contactPhone?: string;
  isActive: boolean;
  // Payouts only go to a verified wallet. Bank wallets are verified when
  // saved; M-Pesa wallets need a code sent to their number (DEV-448).
  isVerified?: boolean;
  verifiedAt?: string | null;
  // A bank wallet's Paystack sync, which checks the account name
  syncStatus?: string;
  // The account name Paystack resolved for a bank wallet
  resolvedAccountName?: string | null;
  dateCreated: string;
};

/** Money as the API sends it. */
export type MoneyAmount = { amount: string; currency: string };

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
  totalTicketSales: MoneyAmount;
  amountPaid: MoneyAmount;
  /** Promo discounts the host paid for; comes off their earnings. */
  hostFundedDiscount: MoneyAmount;
  /** Promo discounts Tukai paid for; not the host's cost. */
  tukaiFundedDiscount: MoneyAmount;
  hostNet: MoneyAmount;
  availableBalance: MoneyAmount;
  pendingBalance: MoneyAmount;
  currentBalance: MoneyAmount;
  commissionDeducted: MoneyAmount;
  estimatedPayoutFee: MoneyAmount | null;
  /** Tickets the host can still sell, at buyer price. */
  ticketsOnSale: MoneyAmount;
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

/**
 * What a withdrawal of a given amount would actually pay out. Like the
 * earnings summary, every figure is a `{ amount, currency }` object on the
 * wire, not the bare string services/api.json declares.
 */
export type PayoutQuote = {
  currency: string;
  destinationType: string;
  availableBalance: MoneyAmount;
  requestedAmount: MoneyAmount;
  paystackTransferFee: MoneyAmount;
  tukaiPayoutFee: MoneyAmount;
  netAmount: MoneyAmount;
  tukaiCommissionDeducted: MoneyAmount;
  maxPayoutAmount: MoneyAmount;
  /** The API's own words about why the maximum is what it is. */
  limitMessage: string | null;
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

/**
 * One row of a host's ticket-sales income ledger (GET /wallets/income/,
 * DEV-372): a journal entry that changed what the host is owed.
 *
 * kind is sale, sale_reversal (a refund or cancellation) or correction.
 * amount is the host's net from it - negative for a reversal. saleAmount is
 * what the buyer paid, after any promo discount.
 */
export type HostIncomeEntry = {
  id: string;
  kind: 'sale' | 'sale_reversal' | 'correction' | string;
  datePosted: string;
  currency: string;
  amount: MoneyAmount;
  saleAmount: MoneyAmount;
  listAmount: MoneyAmount;
  hostFundedDiscount: MoneyAmount;
  tukaiFundedDiscount: MoneyAmount;
  commission: MoneyAmount;
  promoCode: string | null;
  experience: { id: string; title: string; slug: string } | null;
  purchaseId: string;
  purchaseNumber: string;
  /** The ticket type sold, e.g. "VIP" */
  productName: string | null;
};
