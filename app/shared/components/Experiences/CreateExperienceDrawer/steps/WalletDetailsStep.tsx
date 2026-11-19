'use client';

import { useState } from 'react';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { IntlPhoneField, SelectField } from '@/app/shared/components/Forms';
import { IconComponent } from '@/app/shared/components/Icons';
import {
  VerifyMpesaWallet,
  matchingPayoutAccount,
  payoutAccountLabel,
} from '@/app/shared/components/Payouts';
import { useToast } from '@/app/shared/hooks/useToast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Wallet } from '@/types/payment';
import { toE164 } from '@/utils/dial-codes';
import { toKenyanE164 } from '@/utils/phone';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

interface WalletDetailsStepProps {
  flow: Flow;
}

const COUNTRIES = [
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Tanzania', label: 'Tanzania' },
];

// The bank phone's calling code starts on the bank's own country
const COUNTRY_ISO: Record<string, string> = { Kenya: 'KE', Uganda: 'UG', Tanzania: 'TZ' };

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
      active
        ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
        : 'bg-surface text-gray-800'
    }`}
  >
    <IconComponent
      iconName={icon}
      size={22}
      color="currentColor"
      variant={active ? 'bulk' : 'twotone'}
    />
    {children}
  </button>
);

/**
 * One payout account in the list, or "Add new account" (the handoff's
 * tk-payout-card). A native radio drives it, so arrow keys move between cards.
 */
const PayoutCard = ({
  checked,
  onSelect,
  icon,
  label,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: string;
  label: string;
  detail?: string;
}) => (
  <label
    className={cn(
      'flex min-h-[72px] w-full cursor-pointer items-center gap-3.5 rounded-xl py-3 pl-3.5 pr-4 text-left active:scale-[0.99] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
      checked ? 'bg-surface-brand' : 'bg-surface',
    )}
  >
    <input
      type="radio"
      name="payout-account"
      checked={checked}
      onChange={onSelect}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={cn(
        'flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2',
        checked ? 'border-brand' : 'border-ink-subtle',
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', checked && 'bg-brand')} />
    </span>
    <span
      aria-hidden="true"
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-brand"
    >
      <IconComponent iconName={icon} size={21} color="currentColor" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-15 font-semibold text-gray-800">{label}</span>
      {detail && <span className="text-[13.5px] text-ink-muted">{detail}</span>}
    </span>
  </label>
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
 * Step 6: Wallet details (paid experiences only).
 *
 * A host with saved payout accounts picks one of them (the one payouts go to
 * now is picked at first), or Add new account for the form. With none saved,
 * the form shows on its own. Publishing makes the picked account the host's
 * active wallet - the one every payout goes to.
 *
 * The form only adds accounts; a saved one is changed in Settings. An M-Pesa
 * number saves itself once the host leaves the field (it needs a texted code
 * before payouts can go to it, DEV-448), and a bank account with "Save bank
 * details". Either is then picked. A number that's already saved is picked
 * rather than added twice.
 *
 * Billing postcode, town and the bank-only "Phone number" are their own
 * fields on the API (`postcode`, `town`, `contact_phone`, DEV-426).
 */
export const WalletDetailsStep = ({ flow }: WalletDetailsStepProps) => {
  const { toast } = useToast();
  const { wallet: formData } = flow.formData;
  const errors = flow.walletErrors;

  const saved = flow.savedWallets;
  const hasSaved = saved.length > 0;
  const isAddingNew = formData.isAddingNew || !hasSaved;
  // Read back from the list, so a code just checked shows at once
  const picked = isAddingNew
    ? undefined
    : saved.find((wallet) => wallet.id === formData.selectedWallet?.id);

  const pick = (wallet: Wallet) =>
    flow.updateWalletFormData({
      selectedWallet: wallet,
      paymentMethod: wallet.walletType,
      isAddingNew: false,
    });

  // Bank form for a new account. It stays filled while a saved account is
  // picked, and comes back if Add new account is picked again.
  const [bank, setBank] = useState({
    country: '',
    bankName: '',
    bankBranch: '',
    branchCode: '',
    accountHolderName: '',
    accountNumber: '',
    swiftCode: '',
    billingCountry: '',
    postcode: '',
    townCity: '',
    phoneNumber: '',
    // Empty until the host picks one: then it follows the bank's country
    phoneCountry: '',
  });
  const bankPhoneCountry = bank.phoneCountry || COUNTRY_ISO[bank.country] || 'KE';
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});

  // An M-Pesa number needs a texted code before payouts can go to it
  // (DEV-448). A new one sends the code straight away; a saved one still
  // unverified waits for "Send code".
  const [sendCodeFor, setSendCodeFor] = useState<string | null>(null);
  const unverifiedPhoneWallet =
    picked?.walletType === 'phone' && picked.isVerified === false ? picked : undefined;

  const handlePhoneBlur = () => {
    const digits = formData.phoneNumber.replace(/\D/g, '');
    if (digits.length < 9) return;
    const normalized = toKenyanE164(formData.phoneNumber);

    const already = matchingPayoutAccount(flow.wallets, {
      walletType: 'phone',
      number: normalized,
    });
    if (already) {
      pick(already);
      flow.updateWalletFormData({ phoneNumber: '' });
      return;
    }

    flow.walletMutations.createPhoneWallet(
      { phone: normalized },
      {
        onSuccess: (response: { data?: Wallet }) => {
          if (response?.data?.id) {
            pick(response.data);
            setSendCodeFor(response.data.id);
          }
          flow.updateWalletFormData({ phoneNumber: '' });
          toast({
            title: 'Wallet saved',
            description: 'Your M-Pesa number was saved. Enter the code we text to it.',
            variant: 'success',
          });
        },
        onError: (error: Error) =>
          toast({ title: 'Unable to save', description: error.message, variant: 'destructive' }),
      },
    );
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

    // Optional fields left blank are left out of the request, not sent empty
    const payload = {
      bankName: bank.bankName.trim(),
      accountNumber: bank.accountNumber.trim(),
      accountHolderName: bank.accountHolderName.trim(),
      bankBranch: bank.bankBranch.trim(),
      branchCode: bank.branchCode.trim(),
      country: bank.country,
      swiftCode: bank.swiftCode.trim().toUpperCase(),
      postcode: bank.postcode.trim(),
      town: bank.townCity.trim(),
      // Any country's number (DEV-508), with its own calling code
      contactPhone: toE164(bankPhoneCountry, bank.phoneNumber),
    };
    const already = matchingPayoutAccount(flow.wallets, {
      walletType: 'bank',
      number: payload.accountNumber,
    });
    if (already) {
      pick(already);
      return;
    }

    flow.walletMutations.createBankWallet(payload, {
      onSuccess: (response: { data?: Wallet }) => {
        if (response?.data?.id) pick(response.data);
        toast({
          title: 'Wallet saved',
          description: 'Your bank account details were saved.',
          variant: 'success',
        });
      },
      onError: (error: Error) =>
        toast({ title: 'Unable to save', description: error.message, variant: 'destructive' }),
    });
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
          {hasSaved ? 'Choose your payout account' : 'Set up your payout account'}
        </h2>
        <p className="text-15 leading-relaxed text-ink">
          {hasSaved
            ? 'Ticket sales from this experience are paid into this account.'
            : 'Add the account that should receive the money from ticket sales.'}
        </p>
      </div>

      {hasSaved && (
        <div role="radiogroup" aria-label="Payout account" className="flex flex-col gap-2">
          {saved.map((wallet) => (
            <PayoutCard
              key={wallet.id}
              checked={picked?.id === wallet.id}
              onSelect={() => pick(wallet)}
              icon={wallet.walletType === 'bank' ? 'BankIcon' : 'SmartPhone01Icon'}
              label={payoutAccountLabel(wallet)}
              detail={wallet.accountHolderName}
            />
          ))}
          <PayoutCard
            checked={isAddingNew}
            onSelect={() =>
              flow.updateWalletFormData({ isAddingNew: true, selectedWallet: undefined })
            }
            icon="Add01Icon"
            label="Add new account"
            detail="M-Pesa or bank account"
          />
        </div>
      )}

      {unverifiedPhoneWallet && (
        <div className="rounded-xl border border-line bg-white p-4">
          <VerifyMpesaWallet
            key={unverifiedPhoneWallet.id}
            walletId={unverifiedPhoneWallet.id}
            phone={unverifiedPhoneWallet.phone}
            sendOnOpen={sendCodeFor === unverifiedPhoneWallet.id}
            onVerified={() => {
              setSendCodeFor(null);
              toast({
                title: 'M-Pesa number verified',
                description: 'Payouts for this experience can go to it.',
                variant: 'success',
              });
            }}
          />
        </div>
      )}

      {errors.wallet && !isAddingNew && (
        <span className="text-[13.5px] text-danger-deep">{errors.wallet}</span>
      )}

      {isAddingNew && hasSaved && <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />}

      {isAddingNew && (
        <>
          <div className="flex flex-col gap-3">
            <span className="text-15 font-semibold text-gray-800">
              Select your preferred payout method
            </span>
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
            {errors.wallet && (
              <span className="text-[13.5px] text-danger-deep">{errors.wallet}</span>
            )}
          </div>

          {formData.paymentMethod === 'phone' ? (
            <>
              <Field label="M-Pesa number">
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(phoneNumber) => flow.updateWalletFormData({ phoneNumber })}
                  onBlur={handlePhoneBlur}
                  placeholder="7XX XXX XXX"
                />
              </Field>
            </>
          ) : (
            <div className="flex flex-col gap-3.5">
              <span className="text-15 font-semibold text-gray-800">
                Add your bank account details
              </span>
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
              {bankErrors.bankName && (
                <span className="text-[13.5px] text-danger-deep">{bankErrors.bankName}</span>
              )}
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
              {bankErrors.bankBranch && (
                <span className="text-[13.5px] text-danger-deep">{bankErrors.bankBranch}</span>
              )}
              <Input
                placeholder="Account name"
                value={bank.accountHolderName}
                onChange={(e) => setBank((p) => ({ ...p, accountHolderName: e.target.value }))}
                containerClassName={inputContainer}
                icon={<IconComponent iconName="IdentityCardIcon" size={20} color="#5B6B66" />}
              />
              {bankErrors.accountHolderName && (
                <span className="text-[13.5px] text-danger-deep">
                  {bankErrors.accountHolderName}
                </span>
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
              {bankErrors.townCity && (
                <span className="text-[13.5px] text-danger-deep">{bankErrors.townCity}</span>
              )}

              <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

              {/* Bank-only "Phone number": the account holder's contact number
              (`contact_phone`), not where payouts go. Optional. From any
              country, unlike the M-Pesa number (DEV-508). A div, not the
              Field label: the code picker inside is a button of its own. */}
              <div className="flex flex-col gap-2">
                <span className="text-15 font-semibold text-gray-800">Phone number</span>
                <IntlPhoneField
                  country={bankPhoneCountry}
                  onCountryChange={(phoneCountry) => setBank((p) => ({ ...p, phoneCountry }))}
                  value={bank.phoneNumber}
                  onChange={(phoneNumber) => setBank((p) => ({ ...p, phoneNumber }))}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBankDetails}
                disabled={
                  flow.walletMutations.isCreatingBankWallet ||
                  flow.walletMutations.isPatchingBankWallet
                }
                className="h-11 self-start rounded-full bg-lime px-6 text-[14.5px] font-semibold text-brand-ink hover:bg-lime-dark disabled:opacity-60"
              >
                {flow.walletMutations.isCreatingBankWallet ||
                flow.walletMutations.isPatchingBankWallet
                  ? 'Saving...'
                  : 'Save bank details'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
