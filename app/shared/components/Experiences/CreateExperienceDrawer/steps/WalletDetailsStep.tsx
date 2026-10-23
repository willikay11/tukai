'use client';

import { useEffect, useState } from 'react';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { SelectField } from '@/app/shared/components/Forms';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Input } from '@/components/ui/input';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

interface WalletDetailsStepProps {
  flow: Flow;
}

const COUNTRIES = [
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Tanzania', label: 'Tanzania' },
];

const PayoutPill = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    className={`inline-flex min-h-[52px] items-center gap-2.5 whitespace-nowrap rounded-full py-0 pl-4 pr-5 text-15 font-medium active:scale-[0.98] ${
      active ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white' : 'bg-surface text-gray-800'
    }`}
  >
    <IconComponent iconName={icon} size={22} color="currentColor" variant={active ? 'bulk' : 'twotone'} />
    {children}
  </button>
);

// The M-Pesa field and the bank-only "Phone number" field below it are the
// same phone input per the handoff ("same phone input, placeholder 'Enter
// phone number'") - only the label and placeholder differ, so it's one
// sub-component rather than two copies of the +254 prefix markup.
const PhoneInput = ({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
}) => (
  <div className="relative">
    <IconComponent
      iconName="Call02Icon"
      size={20}
      color="#5B6B66"
      className="absolute left-4 top-1/2 -translate-y-1/2"
    />
    <span className="absolute left-11 top-1/2 h-5 -translate-y-1/2 border-r border-line pr-2.5 text-15 font-semibold text-gray-800">
      +254
    </span>
    <input
      type="tel"
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${bareInputClassName} pl-[108px]`}
    />
  </div>
);

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-2">
    <span className="text-15 font-semibold text-gray-800">
      {label}
      {hint && <span className="font-normal text-ink-muted"> ({hint})</span>}
    </span>
    {children}
  </label>
);

// For the shared `Input` primitive: targets its wrapper (border/height/
// radius/focus ring), not the `<input>` itself - see components/ui/input.tsx
const inputContainer =
  'h-14 rounded-xl border-line px-4 focus-within:border-brand focus-within:shadow-[0_0_0_3px_#E8F1ED]';
// For the one hand-rolled `<input>` below (the M-Pesa field, which needs a
// "+254" prefix overlay the `Input` primitive has no slot for)
const bareInputClassName =
  'h-14 w-full rounded-xl border border-line bg-white text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]';

/**
 * Step 6: Wallet details (paid experiences only). The handoff's markup has
 * no explicit save control inside this step - persistence in
 * `useCreateExperienceFlow` is its own thing, independent of the step-level
 * "save it as you type" model the rest of the drawer uses, and
 * `flow.validateWallet()` (the footer's gate) is satisfied by a *typed*
 * phone number even before it's saved as a wallet.
 *
 * That leaves two real choices for actually persisting: a hidden auto-save
 * (fragile - a 9+ digit M-Pesa number is easy to detect, a complete bank
 * form much less so) or a small in-step save action. This build keeps M-Pesa
 * auto-saving on blur once the number is long enough, and gives the bank
 * form its own compact "Save bank details" button directly under the
 * fields - a disclosed, minor addition beyond the literal markup, needed
 * because nothing else in this screen would ever actually call
 * createBankWallet/patchBankWallet otherwise.
 *
 * Billing "Postcode" has no field on the Wallet API (`types/payment.ts`) -
 * composed into the single `address` string on save, same choice the old
 * `BankAccountDetailsForm` already made. The bank-only "Phone number" field
 * likewise has nowhere to persist to - kept as local-only state, never sent.
 * See the create_experience_drawer_backend_gaps memory (item 4).
 */
export const WalletDetailsStep = ({ flow }: WalletDetailsStepProps) => {
  const { toast } = useToast();
  const { wallet: formData } = flow.formData;
  const errors = flow.walletErrors;

  const existingPhoneWallet = flow.wallets.find((w) => w.walletType === 'phone');
  const existingBankWallet = flow.wallets.find((w) => w.walletType === 'bank');

  // `FormData['wallet'].phoneNumber` is only ever a value the host is typing
  // (to create or patch) - the hook's own hydration effect sets
  // `selectedWallet`/`paymentMethod` from the active wallet but never this
  // field - so a saved M-Pesa number is seeded into it once here, the same
  // way the bank fields below are seeded from `existingBankWallet`. Seeded
  // only when the field is still blank, so it never fights the host's typing
  // or re-fills a number they deliberately cleared.
  useEffect(() => {
    if (existingPhoneWallet?.phone && !formData.phoneNumber) {
      flow.updateWalletFormData({ phoneNumber: existingPhoneWallet.phone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPhoneWallet?.id]);

  // Bank form - local state, seeded from the saved bank wallet if there is one
  const [bank, setBank] = useState({
    country: existingBankWallet?.country ?? '',
    bankName: existingBankWallet?.bankName ?? '',
    bankBranch: existingBankWallet?.bankBranch ?? '',
    branchCode: existingBankWallet?.branchCode ?? '',
    accountHolderName: existingBankWallet?.accountHolderName ?? '',
    accountNumber: existingBankWallet?.accountNumber ?? '',
    swiftCode: existingBankWallet?.swiftCode ?? '',
    billingCountry: existingBankWallet?.country ?? '',
    postcode: '',
    townCity: existingBankWallet?.address ?? '',
    // Not part of the Wallet API - local only, see the doc comment above.
    phoneNumber: '',
  });
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!existingBankWallet) return;
    setBank((prev) => ({
      ...prev,
      country: existingBankWallet.country ?? prev.country,
      bankName: existingBankWallet.bankName ?? prev.bankName,
      bankBranch: existingBankWallet.bankBranch ?? prev.bankBranch,
      branchCode: existingBankWallet.branchCode ?? prev.branchCode,
      accountHolderName: existingBankWallet.accountHolderName ?? prev.accountHolderName,
      accountNumber: existingBankWallet.accountNumber ?? prev.accountNumber,
      swiftCode: existingBankWallet.swiftCode ?? prev.swiftCode,
      billingCountry: existingBankWallet.country ?? prev.billingCountry,
      townCity: existingBankWallet.address ?? prev.townCity,
    }));
    // Only when the saved wallet itself changes identity, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingBankWallet?.id]);

  const handlePhoneBlur = () => {
    const digits = formData.phoneNumber.replace(/\D/g, '');
    if (digits.length < 9) return;
    const normalized = digits.startsWith('254')
      ? `+${digits}`
      : digits.startsWith('0')
        ? `+254${digits.slice(1)}`
        : `+254${digits}`;

    if (existingPhoneWallet?.id) {
      if (existingPhoneWallet.phone === normalized) return;
      flow.walletMutations.patchPhoneWallet(
        { walletId: existingPhoneWallet.id, phone: normalized },
        {
          onSuccess: () =>
            toast({ title: 'Wallet updated', description: 'Your M-Pesa number was saved.', variant: 'success' }),
          onError: (error: Error) =>
            toast({ title: 'Unable to save', description: error.message, variant: 'destructive' }),
        },
      );
    } else {
      flow.walletMutations.createPhoneWallet(
        { phone: normalized },
        {
          onSuccess: () =>
            toast({ title: 'Wallet saved', description: 'Your M-Pesa number was saved.', variant: 'success' }),
          onError: (error: Error) =>
            toast({ title: 'Unable to save', description: error.message, variant: 'destructive' }),
        },
      );
    }
  };

  const handleSaveBankDetails = () => {
    const nextErrors: Record<string, string> = {};
    if (!bank.country) nextErrors.country = 'Country is required.';
    if (!bank.bankName.trim()) nextErrors.bankName = 'Bank name is required.';
    if (!bank.bankBranch.trim()) nextErrors.bankBranch = 'Branch is required.';
    if (!bank.accountHolderName.trim()) nextErrors.accountHolderName = 'Account name is required.';
    if (!/^\d{6,}$/.test(bank.accountNumber.trim())) {
      nextErrors.accountNumber = 'Account number must be at least 6 digits.';
    }
    if (!bank.billingCountry) nextErrors.billingCountry = 'Billing country is required.';
    if (!bank.townCity.trim()) nextErrors.townCity = 'Town or city is required.';
    setBankErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // No Postcode/Town fields on CreateBankWallet/UpdateBankWallet - composed
    // into the single `address` string client-side. See the
    // create_experience_drawer_backend_gaps memory, item 4.
    const address = [bank.postcode.trim(), bank.townCity.trim()].filter(Boolean).join(', ');
    const payload = {
      bankName: bank.bankName.trim(),
      accountNumber: bank.accountNumber.trim(),
      accountHolderName: bank.accountHolderName.trim(),
      bankBranch: bank.bankBranch.trim(),
      branchCode: bank.branchCode.trim(),
      country: bank.country,
      swiftCode: bank.swiftCode.trim().toUpperCase(),
      address,
    };
    const onSettled = {
      onSuccess: () =>
        toast({ title: 'Wallet saved', description: 'Your bank account details were saved.', variant: 'success' }),
      onError: (error: Error) =>
        toast({ title: 'Unable to save', description: error.message, variant: 'destructive' }),
    };

    if (existingBankWallet?.id) {
      flow.walletMutations.patchBankWallet({ walletId: existingBankWallet.id, ...payload }, onSettled);
    } else {
      flow.walletMutations.createBankWallet(payload, onSettled);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
          Set up your payout account
        </h2>
        <p className="text-15 leading-relaxed text-ink-muted">
          Add the account that should receive the money from ticket sales.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-15 font-semibold text-gray-800">Select your preferred payout method</span>
        <div className="flex flex-wrap gap-2.5" role="radiogroup">
          <PayoutPill
            active={formData.paymentMethod === 'phone'}
            onClick={() => flow.updateWalletFormData({ paymentMethod: 'phone' })}
            icon="SmartPhone01Icon"
          >
            M-Pesa
          </PayoutPill>
          <PayoutPill
            active={formData.paymentMethod === 'bank'}
            onClick={() => flow.updateWalletFormData({ paymentMethod: 'bank' })}
            icon="BankIcon"
          >
            Bank account
          </PayoutPill>
        </div>
        {/* The schema reports an unset wallet under the single 'wallet' key
            (see buildWalletSchema's path: ['wallet']), not 'phoneNumber' -
            it's not specific to either method, so it renders here rather
            than under one field. */}
        {errors.wallet && <span className="text-[13.5px] text-danger-deep">{errors.wallet}</span>}
      </div>

      {formData.paymentMethod === 'phone' ? (
        <Field label="M-Pesa number">
          <PhoneInput
            value={formData.phoneNumber}
            onChange={(phoneNumber) => flow.updateWalletFormData({ phoneNumber })}
            onBlur={handlePhoneBlur}
            placeholder="7XX XXX XXX"
          />
        </Field>
      ) : (
        <div className="flex flex-col gap-3.5">
          <span className="text-15 font-semibold text-gray-800">Add your bank account details</span>
          <SelectField
            label="Country"
            value={bank.country || null}
            onChange={(value) => setBank((p) => ({ ...p, country: value }))}
            options={COUNTRIES}
            error={bankErrors.country}
          />
          <Input
            placeholder="Bank name"
            value={bank.bankName}
            onChange={(e) => setBank((p) => ({ ...p, bankName: e.target.value }))}
            containerClassName={inputContainer}
            icon={<IconComponent iconName="BankIcon" size={20} color="#5B6B66" />}
          />
          {bankErrors.bankName && <span className="text-[13.5px] text-danger-deep">{bankErrors.bankName}</span>}
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Branch"
              value={bank.bankBranch}
              onChange={(e) => setBank((p) => ({ ...p, bankBranch: e.target.value }))}
              containerClassName={inputContainer}
              icon={<IconComponent iconName="BankIcon" size={20} color="#5B6B66" />}
            />
            <Input
              placeholder="Branch code (optional)"
              value={bank.branchCode}
              onChange={(e) => setBank((p) => ({ ...p, branchCode: e.target.value }))}
              containerClassName={inputContainer}
              icon={<IconComponent iconName="Building03Icon" size={20} color="#5B6B66" />}
            />
          </div>
          {bankErrors.bankBranch && <span className="text-[13.5px] text-danger-deep">{bankErrors.bankBranch}</span>}
          <Input
            placeholder="Account name"
            value={bank.accountHolderName}
            onChange={(e) => setBank((p) => ({ ...p, accountHolderName: e.target.value }))}
            containerClassName={inputContainer}
            icon={<IconComponent iconName="IdentityCardIcon" size={20} color="#5B6B66" />}
          />
          {bankErrors.accountHolderName && (
            <span className="text-[13.5px] text-danger-deep">{bankErrors.accountHolderName}</span>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Account number"
              inputMode="numeric"
              value={bank.accountNumber}
              onChange={(e) => setBank((p) => ({ ...p, accountNumber: e.target.value }))}
              containerClassName={inputContainer}
              icon={<IconComponent iconName="CreditCardIcon" size={20} color="#5B6B66" />}
            />
            <Input
              placeholder="SWIFT code (optional)"
              value={bank.swiftCode}
              onChange={(e) =>
                setBank((p) => ({ ...p, swiftCode: e.target.value.toUpperCase().slice(0, 11) }))
              }
              containerClassName={inputContainer}
              icon={<IconComponent iconName="GlobalRefreshIcon" size={20} color="#5B6B66" />}
            />
          </div>
          {bankErrors.accountNumber && (
            <span className="text-[13.5px] text-danger-deep">{bankErrors.accountNumber}</span>
          )}

          <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

          <span className="text-15 font-semibold text-gray-800">Billing address</span>
          <SelectField
            label="Country"
            value={bank.billingCountry || null}
            onChange={(value) => setBank((p) => ({ ...p, billingCountry: value }))}
            options={COUNTRIES}
            error={bankErrors.billingCountry}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Postcode"
              value={bank.postcode}
              onChange={(e) => setBank((p) => ({ ...p, postcode: e.target.value }))}
              containerClassName={inputContainer}
              icon={<IconComponent iconName="Mail01Icon" size={20} color="#5B6B66" />}
            />
            <Input
              placeholder="Town or city"
              value={bank.townCity}
              onChange={(e) => setBank((p) => ({ ...p, townCity: e.target.value }))}
              containerClassName={inputContainer}
              icon={<IconComponent iconName="Location01Icon" size={20} color="#5B6B66" />}
            />
          </div>
          {bankErrors.townCity && <span className="text-[13.5px] text-danger-deep">{bankErrors.townCity}</span>}

          <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

          {/* Bank-only "Phone number" field, per the handoff. It has no
              backing field on CreateBankWallet/UpdateBankWallet (`types/
              payment.ts` has only `phone` on the separate phone-wallet
              types) - rendered so the UI matches the design, kept as
              local-only state, and never sent to the API. See the
              create_experience_drawer_backend_gaps memory, item 4. */}
          <Field label="Phone number">
            <PhoneInput
              value={bank.phoneNumber}
              onChange={(phoneNumber) => setBank((p) => ({ ...p, phoneNumber }))}
              placeholder="Enter phone number"
            />
          </Field>

          <button
            type="button"
            onClick={handleSaveBankDetails}
            disabled={flow.walletMutations.isCreatingBankWallet || flow.walletMutations.isPatchingBankWallet}
            className="h-11 self-start rounded-full bg-lime px-6 text-[14.5px] font-semibold text-brand-ink hover:bg-lime-dark disabled:opacity-60"
          >
            {flow.walletMutations.isCreatingBankWallet || flow.walletMutations.isPatchingBankWallet
              ? 'Saving...'
              : 'Save bank details'}
          </button>
        </div>
      )}
    </div>
  );
};
