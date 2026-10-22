/**
 * Proof-of-ownership document types, from the API's own
 * `VerificationDocument.document_type` enum - the labels are ours, the values
 * are the API's.
 */
export const OWNERSHIP_DOCUMENT_TYPES = [
  { value: 'certificate_of_incorporation', label: 'Certificate of incorporation' },
  { value: 'business_license', label: 'Business license' },
  { value: 'tax_registration', label: 'Tax registration' },
  { value: 'bank_statement', label: 'Bank statement' },
  { value: 'utility_bill', label: 'Utility bill' },
  { value: 'credit_report', label: 'Credit report' },
] as const;

// The form asks for two, which is what the design states
export const REQUIRED_DOCUMENT_COUNT = 2;
