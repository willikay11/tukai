/**
 * A Kenyan phone number as typed ("0712 345 678", "712345678", "254712345678",
 * "+254 712 345 678") in the international form the API's phone fields take:
 * "+254712345678". Blank stays blank.
 */
export const toKenyanE164 = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254')) return `+${digits}`;
  if (digits.startsWith('0')) return `+254${digits.slice(1)}`;
  return `+254${digits}`;
};
