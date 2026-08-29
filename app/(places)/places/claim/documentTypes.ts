/**
 * Proof-of-ownership document types, from the API's own
 * `VerificationDocument.document_type` enum — the labels are ours, the values
 * are the API's.
 */
export const OWNERSHIP_DOCUMENT_TYPES = [
  { value: 'certificate_of_incorporation', label: 'Certificate of Incorporation' },
  { value: 'business_license', label: 'Business License' },
  { value: 'tax_registration', label: 'Tax Registration' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'credit_report', label: 'Credit Report' },
] as const;

// The form asks for two, which is what the design states
export const REQUIRED_DOCUMENT_COUNT = 2;
