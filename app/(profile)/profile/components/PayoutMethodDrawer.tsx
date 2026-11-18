'use client';

import { useEffect, useState } from 'react';

import {
  useCreateBankWallet,
  useCreatePhoneWallet,
  useGetWallets,
  usePatchBankWallet,
  usePatchPhoneWallet,
  useSetActiveWallet,
} from '@/app/(experiences)/hooks/usePayment';
import { IconComponent } from '@/app/shared/components/Icons';
import { VerifyMpesaWallet } from '@/app/shared/components/Payouts';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Wallet } from '@/types/payment';

type Method = 'mpesa' | 'bank';

type Draft = {
  method: Method;
  phone: string;
  mpName: string;
  bank: string;
  branch: string;
  accName: string;
  accNo: string;
};

const digits = (value: string) => value.replace(/\D/g, '');

/** The form as it opens: the saved wallets, M-Pesa holder name included. */
const draftFrom = (phoneWallet?: Wallet, bankWallet?: Wallet, active?: Wallet): Draft => ({
  method: active?.walletType === 'bank' ? 'bank' : 'mpesa',
  phone: phoneWallet?.phone ? digits(phoneWallet.phone).replace(/^254/, '') : '',
  mpName: phoneWallet?.accountHolderName ?? '',
  bank: bankWallet?.bankName ?? '',
  branch: bankWallet?.bankBranch ?? '',
  accName: bankWallet?.accountHolderName ?? '',
  accNo: bankWallet?.accountNumber ?? '',
});

const sameDraft = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b);

export const PayoutMethodDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const { data: walletsResponse } = useGetWallets();
  const walletsPayload = walletsResponse?.data;
  const wallets: Wallet[] = Array.isArray(walletsPayload)
    ? walletsPayload
    : (walletsPayload?.results ?? []);

  const phoneWallet = wallets.find((wallet) => wallet.walletType === 'phone');
  const bankWallet = wallets.find((wallet) => wallet.walletType === 'bank');
  const active = wallets.find((wallet) => wallet.isActive) ?? wallets[0];

  const saved = draftFrom(phoneWallet, bankWallet, active);
  const [draft, setDraft] = useState<Draft>(saved);
  const [error, setError] = useState<string | null>(null);
  // Verifying an M-Pesa number by code (DEV-448). Payouts only go to a
  // verified wallet, so a newly saved or changed number goes straight here.
  const [verifying, setVerifying] = useState<{
    walletId: string;
    phone?: string;
    sendOnOpen: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(draftFrom(phoneWallet, bankWallet, active));
      setError(null);
      setVerifying(null);
    }
    // Only re-seed when the panel opens, not on every wallets refetch - that
    // would overwrite whatever the person is mid-typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { mutate: createPhone, isPending: isCreatingPhone } = useCreatePhoneWallet();
  const { mutate: patchPhone, isPending: isPatchingPhone } = usePatchPhoneWallet();
  const { mutate: createBank, isPending: isCreatingBank } = useCreateBankWallet();
  const { mutate: patchBank, isPending: isPatchingBank } = usePatchBankWallet();
  const { mutate: makeActive } = useSetActiveWallet();

  const isPending = isCreatingPhone || isPatchingPhone || isCreatingBank || isPatchingBank;

  const changed = !sameDraft(draft, saved);
  const isMp = draft.method === 'mpesa';
  const validationError = isMp
    ? digits(draft.phone).length < 9
      ? 'Enter the M-Pesa number withdrawals go to.'
      : !draft.mpName.trim()
        ? 'Add the name on the M-Pesa account.'
        : ''
    : !draft.branch.trim() || !draft.accName.trim() || digits(draft.accNo).length < 6
      ? 'Add the branch, account name and account number.'
      : '';
  const ready = changed && !validationError;

  const close = () => {
    setDraft(saved);
    setError(null);
    setVerifying(null);
    onClose();
  };

  // Shown on the form: the saved M-Pesa number still needs its code.
  // isVerified missing (an older response) counts as verified.
  const unverifiedPhoneWallet = phoneWallet?.isVerified === false ? phoneWallet : undefined;

  const handleVerified = () => {
    toast({
      title: 'M-Pesa number verified',
      description: 'Withdrawals can go to it now.',
      variant: 'success',
    });
    setVerifying(null);
    onClose();
  };

  const activateThenFinish = (walletId: string | undefined, message: string) => {
    if (walletId && walletId !== active?.id) {
      makeActive(walletId);
    }
    toast({ title: message, variant: 'success' });
    onClose();
  };

  const submit = () => {
    if (!ready) return;
    setError(null);

    const onError = (failure: Error) => setError(failure.message);

    if (isMp) {
      const phone = `254${digits(draft.phone)}`;
      const message = `Payout method saved. Withdrawals go to M-Pesa ending ${digits(draft.phone).slice(-3)} from now on.`;

      // A new or changed number comes back unverified: make it the payout
      // method and ask for its code, rather than closing
      const afterSave = (saved?: Wallet) => {
        const walletId = saved?.id;
        if (walletId && saved?.isVerified === false) {
          if (walletId !== active?.id) makeActive(walletId);
          setVerifying({ walletId, phone: `+${phone}`, sendOnOpen: true });
          return;
        }
        activateThenFinish(walletId, message);
      };

      if (phoneWallet) {
        patchPhone(
          { walletId: phoneWallet.id, phone, accountHolderName: draft.mpName.trim() },
          {
            // The update response doesn't say whether the wallet is still
            // verified. Changing the number clears it, so a changed number is
            // unverified unless the response says otherwise.
            onSuccess: (response) => {
              const changedNumber = digits(phoneWallet.phone ?? '') !== phone;
              afterSave({
                ...phoneWallet,
                ...response?.data,
                isVerified:
                  response?.data?.isVerified ?? (changedNumber ? false : phoneWallet.isVerified),
              });
            },
            onError,
          },
        );
      } else {
        createPhone(
          { phone, accountHolderName: draft.mpName.trim() },
          {
            onSuccess: (response) => afterSave(response?.data),
            onError,
          },
        );
      }
      return;
    }

    // Branch code, SWIFT code and address are optional for Kenyan banks and
    // have no field here, so they're left out rather than sent empty
    const bankFields = {
      bankName: draft.bank.trim(),
      bankBranch: draft.branch.trim(),
      accountHolderName: draft.accName.trim(),
      accountNumber: digits(draft.accNo),
      country: 'KE',
    };
    const message = `Payout method saved. Withdrawals go to ${draft.bank} ending ${digits(draft.accNo).slice(-4)} from now on.`;

    if (bankWallet) {
      patchBank(
        { walletId: bankWallet.id, ...bankFields },
        {
          onSuccess: () => activateThenFinish(bankWallet.id, message),
          onError,
        },
      );
    } else {
      createBank(bankFields, {
        onSuccess: (response) => activateThenFinish(response?.data?.id, message),
        onError,
      });
    }
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="Payout method">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            Payout method
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        {verifying ? (
          <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-5">
            <VerifyMpesaWallet
              walletId={verifying.walletId}
              phone={verifying.phone}
              sendOnOpen={verifying.sendOnOpen}
              onVerified={handleVerified}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-5">
            {unverifiedPhoneWallet && (
              <div className="flex flex-col gap-3 rounded-xl bg-surface-brand px-4 py-3.5">
                <p className="text-[14.5px] leading-relaxed text-brand-ink">
                  Your M-Pesa number isn&apos;t verified yet, so withdrawals can&apos;t go to it.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setVerifying({
                      walletId: unverifiedPhoneWallet.id,
                      phone: unverifiedPhoneWallet.phone,
                      sendOnOpen: false,
                    })
                  }
                  className="self-start text-[15px] font-bold text-brand hover:underline"
                >
                  Verify now
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <span id="pm-method" className="text-[15px] font-semibold text-gray-900">
                Where should withdrawals go?
              </span>
              <div role="radiogroup" aria-labelledby="pm-method" className="flex flex-wrap gap-2.5">
                {(
                  [
                    ['mpesa', 'M-Pesa', 'SmartPhone01Icon'],
                    ['bank', 'Bank account', 'BankIcon'],
                  ] as const
                ).map(([value, label, icon]) => {
                  const on = draft.method === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setDraft((current) => ({ ...current, method: value }));
                        setError(null);
                      }}
                      className={cn(
                        'inline-flex h-[52px] items-center gap-2.5 whitespace-nowrap rounded-full pl-[18px] pr-6 text-[15.5px] font-medium active:scale-[0.98]',
                        on
                          ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                          : 'bg-surface text-gray-900',
                      )}
                    >
                      <IconComponent
                        iconName={icon}
                        variant={on ? 'bulk' : 'twotone'}
                        size={21}
                        color="currentColor"
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {isMp ? (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="pm-phone" className="text-[15px] font-semibold text-gray-900">
                    M-Pesa number
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center border-r border-line pr-3 text-[15px] font-medium text-gray-900">
                      +254
                    </span>
                    <input
                      id="pm-phone"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={draft.phone}
                      onChange={(event) => {
                        setDraft((current) => ({
                          ...current,
                          phone: event.target.value.replace(/[^0-9 ]/g, '').slice(0, 12),
                        }));
                        setError(null);
                      }}
                      placeholder="712 345 678"
                      className="h-14 w-full rounded-xl border border-line bg-white pl-[82px] pr-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="pm-mpname" className="text-[15px] font-semibold text-gray-900">
                    Name on the M-Pesa account
                  </label>
                  <input
                    id="pm-mpname"
                    type="text"
                    autoComplete="off"
                    value={draft.mpName}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        mpName: event.target.value.slice(0, 50),
                      }));
                      setError(null);
                    }}
                    placeholder="As registered with Safaricom"
                    className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="pm-bank" className="text-[15px] font-semibold text-gray-900">
                    Bank
                  </label>
                  <select
                    id="pm-bank"
                    value={draft.bank}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, bank: event.target.value }));
                      setError(null);
                    }}
                    className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                  >
                    <option value="">Choose a bank</option>
                    {[
                      'Equity Bank',
                      'KCB Bank',
                      'Co-operative Bank',
                      'NCBA Bank',
                      'Stanbic Bank',
                      'Absa Bank Kenya',
                    ].map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="pm-branch" className="text-[15px] font-semibold text-gray-900">
                    Branch
                  </label>
                  <input
                    id="pm-branch"
                    type="text"
                    autoComplete="off"
                    value={draft.branch}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        branch: event.target.value.slice(0, 40),
                      }));
                      setError(null);
                    }}
                    placeholder="e.g. Westlands"
                    className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="pm-accname" className="text-[15px] font-semibold text-gray-900">
                    Account name
                  </label>
                  <input
                    id="pm-accname"
                    type="text"
                    autoComplete="off"
                    value={draft.accName}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        accName: event.target.value.slice(0, 50),
                      }));
                      setError(null);
                    }}
                    placeholder="As it appears on your statement"
                    className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="pm-accno" className="text-[15px] font-semibold text-gray-900">
                    Account number
                  </label>
                  <input
                    id="pm-accno"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={draft.accNo}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        accNo: event.target.value.replace(/[^0-9 ]/g, '').slice(0, 20),
                      }));
                      setError(null);
                    }}
                    placeholder="Account number"
                    className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                  />
                </div>
              </>
            )}

            <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-note">
              <IconComponent
                iconName="SquareLock02Icon"
                size={18}
                color="currentColor"
                className="mt-px flex-shrink-0 text-brand"
              />
              <span>
                For your safety, we send a code to your current number before a new payout method
                takes effect. Withdrawals pause until you confirm it.
              </span>
            </p>

            {changed && validationError && (
              <p role="alert" className="text-[13.5px] leading-[1.45] text-danger">
                {validationError}
              </p>
            )}

            {error && (
              <p role="alert" className="text-[13.5px] leading-[1.45] text-danger">
                {error}
              </p>
            )}
          </div>
        )}

        {verifying ? (
          <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 items-center border-t border-surface-muted bg-white px-6 py-[18px]">
            {/* The number is saved either way; it just can't receive payouts yet */}
            <button
              type="button"
              onClick={close}
              className="h-12 px-1.5 text-[15px] font-medium text-ink-muted hover:underline"
            >
              Do this later
            </button>
          </div>
        ) : (
          <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
            <button
              type="button"
              onClick={close}
              className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
            >
              Cancel
            </button>

            <span aria-hidden="true" className="flex-1" />

            <button
              type="button"
              onClick={submit}
              disabled={!ready || isPending}
              aria-disabled={!ready}
              className="h-12 whitespace-nowrap rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink enabled:hover:bg-lime-dark disabled:bg-[#E4F4B5] disabled:text-[#5E7A45]"
            >
              Save changes
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
};
