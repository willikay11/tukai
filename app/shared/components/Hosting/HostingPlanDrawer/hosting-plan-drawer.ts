import { HostingPaymentMethod } from '@/types/hostingPlan';

/** Digits only, Kenyan M-Pesa numbers (with or without a leading 0/254). */
export const isValidMpesaNumber = (value: string): boolean => value.replace(/\D/g, '').length >= 9;

export const formatCardNumber = (value: string): string =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

export const isValidCardDetails = (cardNumber: string, expiry: string, cvc: string): boolean =>
  cardNumber.replace(/\D/g, '').length >= 15 &&
  /^\d{2}\s?\/\s?\d{2}$/.test(expiry.trim()) &&
  /^\d{3,4}$/.test(cvc.trim());

export const canSubmitPayment = (
  method: HostingPaymentMethod,
  mpesaNumber: string,
  cardNumber: string,
  expiry: string,
  cvc: string,
): boolean =>
  method === 'mpesa'
    ? isValidMpesaNumber(mpesaNumber)
    : isValidCardDetails(cardNumber, expiry, cvc);
